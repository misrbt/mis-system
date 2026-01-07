<?php

namespace App\Observers;

use App\Models\Asset;
use App\Models\AssetMovement;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;

class AssetObserver
{
    /**
     * Temporary store for original values during update lifecycle.
     * Keyed by asset id to avoid leaking extra attributes onto the model.
     */
    private array $originalValues = [];

    /**
     * Handle the Asset "created" event.
     */
    public function created(Asset $asset): void
    {
        // Only create movement if not already tracked (to avoid duplicates from backfill)
        if (!AssetMovement::where('asset_id', $asset->id)->exists()) {
            $changedFields = $this->buildInitialFields($asset);
            $this->logMovement($asset, 'created', [
                'to_status_id' => $asset->status_id,
                'to_employee_id' => $asset->assigned_to_employee_id,
                'to_branch_id' => $asset->assignedEmployee?->branch_id,
                'metadata' => $this->buildChangeMetadata($changedFields),
                'remarks' => 'Asset initially created',
            ]);
        }
    }

    /**
     * Handle the Asset "deleted" event.
     */
    public function deleted(Asset $asset): void
    {
        $changedFields = $this->buildDeletedFields($asset);

        $this->logMovement($asset, 'disposed', [
            'from_status_id' => $asset->status_id,
            'from_employee_id' => $asset->assigned_to_employee_id,
            'from_branch_id' => $asset->assignedEmployee?->branch_id,
            'metadata' => $this->buildChangeMetadata($changedFields),
            'remarks' => 'Asset deleted',
        ]);
    }

    /**
     * Handle the Asset "updating" event.
     * Track changes BEFORE they happen (so we can capture old values)
     */
    public function updating(Asset $asset): void
    {
        // Store original values in an observer-scoped cache for use in updated()
        $this->originalValues[$asset->id] = $asset->getOriginal();
    }

    /**
     * Handle the Asset "updated" event.
     */
    public function updated(Asset $asset): void
    {
        $original = $this->originalValues[$asset->id] ?? $asset->getOriginal();
        unset($this->originalValues[$asset->id]);

        // Track assignment changes
        if ($asset->assigned_to_employee_id != $original['assigned_to_employee_id']) {
            $this->trackAssignmentChange($asset, $original);
        }

        // Track status changes
        if ($asset->status_id != $original['status_id']) {
            $this->trackStatusChange($asset, $original);
        }

        // Track ALL other field changes comprehensively
        $this->trackAllFieldChanges($asset, $original);
    }

    /**
     * Track all field changes with detailed metadata
     */
    protected function trackAllFieldChanges(Asset $asset, array $original): void
    {
        // Define all trackable fields with their labels and types
        $trackableFields = $this->getTrackableFields();

        $changedFields = [];

        foreach ($trackableFields as $field => $config) {
            if (!array_key_exists($field, $original)) {
                continue;
            }
            if ($asset->$field != $original[$field]) {
                // Skip assignment and status as they're handled separately
                if (in_array($field, ['assigned_to_employee_id', 'status_id'])) {
                    continue;
                }

                $oldValue = $original[$field];
                $newValue = $asset->$field;

                // Get readable values for relations
                if ($config['type'] === 'relation') {
                    $relationName = $config['relation'];
                    $oldValue = $this->getRelationValue($original[$field], $relationName);
                    $newValue = $asset->$relationName?->name ?? $asset->$relationName?->company_name ?? $newValue;
                }

                // Format date values
                if ($config['type'] === 'date') {
                    $oldValue = $oldValue ? \Carbon\Carbon::parse($oldValue)->format('M d, Y') : null;
                    $newValue = $newValue ? \Carbon\Carbon::parse($newValue)->format('M d, Y') : null;
                }

                $changedFields[] = [
                    'field' => $field,
                    'label' => $config['label'],
                    'type' => $config['type'],
                    'old_value' => $oldValue,
                    'new_value' => $newValue,
                ];
            }
        }

        // Log all changes in a single movement record
        if (!empty($changedFields)) {
            $this->logMovement($asset, 'updated', [
                'metadata' => $this->buildChangeMetadata($changedFields),
                'remarks' => $this->buildChangeRemark($changedFields),
            ]);
        }
    }

    /**
     * Get readable value for relation field
     */
    protected function getRelationValue($id, string $relationName): ?string
    {
        if (!$id) {
            return null;
        }

        $modelMap = [
            'category' => \App\Models\AssetCategory::class,
            'vendor' => \App\Models\Vendor::class,
            'status' => \App\Models\Status::class,
            'employee' => \App\Models\Employee::class,
            'branch' => \App\Models\Branch::class,
        ];

        if (isset($modelMap[$relationName])) {
            $model = $modelMap[$relationName]::find($id);
            return $model?->name ?? $model?->company_name ?? $model?->fullname ?? $model?->branch_name ?? null;
        }

        return null;
    }

    /**
     * Build human-readable remark from changed fields
     */
    protected function buildChangeRemark(array $changedFields): string
    {
        $fieldLabels = array_column($changedFields, 'label');

        if (count($fieldLabels) === 1) {
            return "Updated {$fieldLabels[0]}";
        } elseif (count($fieldLabels) === 2) {
            return "Updated {$fieldLabels[0]} and {$fieldLabels[1]}";
        } else {
            $lastField = array_pop($fieldLabels);
            return "Updated " . implode(', ', $fieldLabels) . ", and {$lastField}";
        }
    }

    /**
     * Track assignment changes (assign, transfer, return)
     */
    protected function trackAssignmentChange(Asset $asset, array $original): void
    {
        $fromEmployeeId = $original['assigned_to_employee_id'];
        $toEmployeeId = $asset->assigned_to_employee_id;
        $fromBranchId = $fromEmployeeId ? Employee::find($fromEmployeeId)?->branch_id : null;
        $toBranchId = $toEmployeeId ? $asset->assignedEmployee?->branch_id : null;

        // Determine movement type
        if (!$fromEmployeeId && $toEmployeeId) {
            $movementType = 'assigned';
        } elseif ($fromEmployeeId && $toEmployeeId) {
            $movementType = 'transferred';
        } elseif ($fromEmployeeId && !$toEmployeeId) {
            $movementType = 'returned';
        } else {
            return; // No change
        }

        $changedFields = [
            [
                'field' => 'assigned_to_employee_id',
                'label' => 'Assigned Employee',
                'type' => 'relation',
                'old_value' => $this->getRelationValue($fromEmployeeId, 'employee') ?? 'Unassigned',
                'new_value' => $this->getRelationValue($toEmployeeId, 'employee') ?? 'Unassigned',
            ],
            [
                'field' => 'branch_id',
                'label' => 'Branch',
                'type' => 'relation',
                'old_value' => $this->getRelationValue($fromBranchId, 'branch') ?? 'Unassigned',
                'new_value' => $this->getRelationValue($toBranchId, 'branch') ?? 'Unassigned',
            ],
        ];

        $this->logMovement($asset, $movementType, [
            'from_employee_id' => $fromEmployeeId,
            'to_employee_id' => $toEmployeeId,
            'from_branch_id' => $fromBranchId,
            'to_branch_id' => $toBranchId,
            'metadata' => $this->buildChangeMetadata($changedFields),
        ]);
    }

    /**
     * Track status changes
     */
    protected function trackStatusChange(Asset $asset, array $original): void
    {
        $changedFields = [
            [
                'field' => 'status_id',
                'label' => 'Status',
                'type' => 'relation',
                'old_value' => $this->getRelationValue($original['status_id'], 'status'),
                'new_value' => $this->getRelationValue($asset->status_id, 'status'),
            ],
        ];

        $this->logMovement($asset, 'status_changed', [
            'from_status_id' => $original['status_id'],
            'to_status_id' => $asset->status_id,
            'metadata' => $this->buildChangeMetadata($changedFields),
        ]);
    }

    /**
     * Log a movement record
     */
    protected function logMovement(Asset $asset, string $movementType, array $additionalData = []): void
    {
        $request = request();

        AssetMovement::create(array_merge([
            'asset_id' => $asset->id,
            'movement_type' => $movementType,
            'performed_by_user_id' => Auth::id(),
            'movement_date' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ], $additionalData));
    }

    protected function getTrackableFields(): array
    {
        return [
            'asset_name' => ['label' => 'Asset Name', 'type' => 'text'],
            'serial_number' => ['label' => 'Serial Number', 'type' => 'text'],
            'brand' => ['label' => 'Brand', 'type' => 'text'],
            'model' => ['label' => 'Model', 'type' => 'text'],
            'acq_cost' => ['label' => 'Acquisition Cost', 'type' => 'currency'],
            'book_value' => ['label' => 'Book Value', 'type' => 'currency'],
            'purchase_date' => ['label' => 'Purchase Date', 'type' => 'date'],
            'waranty_expiration_date' => ['label' => 'Warranty Expiration', 'type' => 'date'],
            'estimate_life' => ['label' => 'Estimated Life (Years)', 'type' => 'number'],
            'remarks' => ['label' => 'Remarks', 'type' => 'text'],
            'qr_code' => ['label' => 'QR Code', 'type' => 'text'],
            'barcode' => ['label' => 'Barcode', 'type' => 'text'],
            'asset_category_id' => ['label' => 'Category', 'type' => 'relation', 'relation' => 'category'],
            'vendor_id' => ['label' => 'Vendor', 'type' => 'relation', 'relation' => 'vendor'],
        ];
    }

    protected function buildChangeMetadata(array $changedFields): array
    {
        return [
            'changed_fields' => $changedFields,
            'change_count' => count($changedFields),
        ];
    }

    protected function buildInitialFields(Asset $asset): array
    {
        $changedFields = [];

        foreach ($this->getTrackableFields() as $field => $config) {
            $value = $asset->$field;
            if ($value === null || $value === '') {
                continue;
            }

            if ($config['type'] === 'relation') {
                $value = $this->getRelationValue($value, $config['relation']);
            }

            // Format date values
            if ($config['type'] === 'date' && $value) {
                $value = \Carbon\Carbon::parse($value)->format('M d, Y');
            }

            $changedFields[] = [
                'field' => $field,
                'label' => $config['label'],
                'type' => $config['type'],
                'old_value' => null,
                'new_value' => $value,
            ];
        }

        if ($asset->status_id) {
            $changedFields[] = [
                'field' => 'status_id',
                'label' => 'Status',
                'type' => 'relation',
                'old_value' => null,
                'new_value' => $this->getRelationValue($asset->status_id, 'status'),
            ];
        }

        if ($asset->assigned_to_employee_id) {
            $changedFields[] = [
                'field' => 'assigned_to_employee_id',
                'label' => 'Assigned Employee',
                'type' => 'relation',
                'old_value' => null,
                'new_value' => $this->getRelationValue($asset->assigned_to_employee_id, 'employee'),
            ];
        }

        return $changedFields;
    }

    protected function buildDeletedFields(Asset $asset): array
    {
        $changedFields = [];

        foreach ($this->getTrackableFields() as $field => $config) {
            $value = $asset->$field;
            if ($value === null || $value === '') {
                continue;
            }

            if ($config['type'] === 'relation') {
                $value = $this->getRelationValue($value, $config['relation']);
            }

            // Format date values
            if ($config['type'] === 'date' && $value) {
                $value = \Carbon\Carbon::parse($value)->format('M d, Y');
            }

            $changedFields[] = [
                'field' => $field,
                'label' => $config['label'],
                'type' => $config['type'],
                'old_value' => $value,
                'new_value' => null,
            ];
        }

        if ($asset->status_id) {
            $changedFields[] = [
                'field' => 'status_id',
                'label' => 'Status',
                'type' => 'relation',
                'old_value' => $this->getRelationValue($asset->status_id, 'status'),
                'new_value' => null,
            ];
        }

        if ($asset->assigned_to_employee_id) {
            $changedFields[] = [
                'field' => 'assigned_to_employee_id',
                'label' => 'Assigned Employee',
                'type' => 'relation',
                'old_value' => $this->getRelationValue($asset->assigned_to_employee_id, 'employee'),
                'new_value' => null,
            ];
        }

        return $changedFields;
    }
}
