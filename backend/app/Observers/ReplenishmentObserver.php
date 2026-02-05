<?php

namespace App\Observers;

use App\Models\Replenishment;
use App\Models\AssetMovement;
use Illuminate\Support\Facades\Auth;

class ReplenishmentObserver
{
    /**
     * Temporary store for original values during update lifecycle.
     */
    private array $originalValues = [];

    /**
     * Handle the Replenishment "created" event.
     */
    public function created(Replenishment $replenishment): void
    {
        $changedFields = $this->buildInitialFields($replenishment);

        $this->logMovement($replenishment, 'created', [
            'metadata' => $this->buildChangeMetadata($changedFields),
            'remarks' => 'Replenishment asset created',
        ]);
    }

    /**
     * Handle the Replenishment "updating" event.
     */
    public function updating(Replenishment $replenishment): void
    {
        // Store original values for use in updated()
        $this->originalValues[$replenishment->id] = $replenishment->getOriginal();
    }

    /**
     * Handle the Replenishment "updated" event.
     */
    public function updated(Replenishment $replenishment): void
    {
        $original = $this->originalValues[$replenishment->id] ?? $replenishment->getOriginal();
        unset($this->originalValues[$replenishment->id]);

        // Track all field changes
        $this->trackAllFieldChanges($replenishment, $original);
    }

    /**
     * Handle the Replenishment "deleted" event.
     */
    public function deleted(Replenishment $replenishment): void
    {
        try {
            $changedFields = $this->buildDeletedFields($replenishment);

            $this->logMovement($replenishment, 'disposed', [
                'metadata' => $this->buildChangeMetadata($changedFields),
                'remarks' => 'Replenishment asset deleted',
            ]);
        } catch (\Exception $e) {
            // Avoid blocking replenishment deletion if movement logging fails
        }
    }

    /**
     * Track all field changes with detailed metadata
     */
    protected function trackAllFieldChanges(Replenishment $replenishment, array $original): void
    {
        $trackableFields = $this->getTrackableFields();
        $changedFields = [];

        foreach ($trackableFields as $field => $config) {
            if (!array_key_exists($field, $original)) {
                continue;
            }

            if ($replenishment->$field != $original[$field]) {
                $oldValue = $original[$field];
                $newValue = $replenishment->$field;

                // Get readable values for relations
                if ($config['type'] === 'relation') {
                    $relationName = $config['relation'];
                    $oldValue = $this->getRelationValue($original[$field], $relationName);
                    $newValue = $replenishment->$relationName?->name ?? $replenishment->$relationName?->company_name ?? $replenishment->$relationName?->fullname ?? $replenishment->$relationName?->branch_name ?? $newValue;
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
            $this->logMovement($replenishment, 'updated', [
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
     * Log a movement record
     */
    protected function logMovement(Replenishment $replenishment, string $movementType, array $additionalData = []): void
    {
        $request = request();

        AssetMovement::create(array_merge([
            'asset_id' => null, // Replenishments are not assets yet
            'movement_type' => $movementType,
            'performed_by_user_id' => Auth::id(),
            'movement_date' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'to_employee_id' => $replenishment->assigned_to_employee_id,
            'to_branch_id' => $replenishment->branch_id,
        ], $additionalData));
    }

    /**
     * Get trackable fields configuration
     */
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
            'estimate_life' => ['label' => 'Estimated Life (Years)', 'type' => 'number'],
            'remarks' => ['label' => 'Remarks', 'type' => 'text'],
            'asset_category_id' => ['label' => 'Category', 'type' => 'relation', 'relation' => 'category'],
            'vendor_id' => ['label' => 'Vendor', 'type' => 'relation', 'relation' => 'vendor'],
            'status_id' => ['label' => 'Status', 'type' => 'relation', 'relation' => 'status'],
            'assigned_to_employee_id' => ['label' => 'Assigned Employee', 'type' => 'relation', 'relation' => 'employee'],
            'branch_id' => ['label' => 'Branch', 'type' => 'relation', 'relation' => 'branch'],
        ];
    }

    /**
     * Build initial fields for creation
     */
    protected function buildInitialFields(Replenishment $replenishment): array
    {
        $changedFields = [];

        foreach ($this->getTrackableFields() as $field => $config) {
            $value = $replenishment->$field;
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

        return $changedFields;
    }

    /**
     * Build deleted fields for disposal
     */
    protected function buildDeletedFields(Replenishment $replenishment): array
    {
        $changedFields = [];

        foreach ($this->getTrackableFields() as $field => $config) {
            $value = $replenishment->$field;
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

        return $changedFields;
    }

    /**
     * Build change metadata
     */
    protected function buildChangeMetadata(array $changedFields): array
    {
        return [
            'changed_fields' => $changedFields,
            'change_count' => count($changedFields),
            'entity_type' => 'replenishment',
        ];
    }
}
