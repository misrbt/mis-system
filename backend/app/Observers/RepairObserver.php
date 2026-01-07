<?php

namespace App\Observers;

use App\Models\Repair;
use App\Models\AssetMovement;
use Illuminate\Support\Facades\Auth;

class RepairObserver
{
    /**
     * Handle the Repair "created" event.
     */
    public function created(Repair $repair): void
    {
        $changedFields = [
            [
                'field' => 'description',
                'label' => 'Description',
                'type' => 'text',
                'old_value' => null,
                'new_value' => $repair->description,
            ],
            [
                'field' => 'expected_return_date',
                'label' => 'Expected Return Date',
                'type' => 'date',
                'old_value' => null,
                'new_value' => $repair->expected_return_date,
            ],
            [
                'field' => 'repair_cost',
                'label' => 'Repair Cost',
                'type' => 'currency',
                'old_value' => null,
                'new_value' => $repair->repair_cost,
            ],
            [
                'field' => 'vendor_id',
                'label' => 'Vendor',
                'type' => 'relation',
                'old_value' => null,
                'new_value' => $repair->vendor?->company_name,
            ],
        ];

        AssetMovement::create([
            'asset_id' => $repair->asset_id,
            'movement_type' => 'repair_initiated',
            'repair_id' => $repair->id,
            'from_status_id' => $repair->asset->status_id,
            'to_status_id' => $repair->asset->status_id,
            'performed_by_user_id' => Auth::id(),
            'movement_date' => $repair->repair_date ?? now(),
            'reason' => $repair->description,
            'remarks' => 'Sent to ' . ($repair->vendor?->company_name ?? 'vendor') . ' for repair',
            'metadata' => [
                'expected_return_date' => $repair->expected_return_date,
                'repair_cost' => $repair->repair_cost,
                'changed_fields' => $changedFields,
                'change_count' => count($changedFields),
            ],
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }

    /**
     * Handle the Repair "updated" event.
     */
    public function updated(Repair $repair): void
    {
        $originalStatus = $repair->getOriginal('status');
        $newStatus = $repair->status;

        // Track all status changes
        if ($originalStatus !== $newStatus) {
            $this->logStatusChange($repair, $originalStatus, $newStatus);
        }

        // Track other field changes (excluding status since it's handled above)
        $this->logFieldChanges($repair);
    }

    /**
     * Log repair status changes
     */
    private function logStatusChange(Repair $repair, string $oldStatus, string $newStatus): void
    {
        $movementType = match($newStatus) {
            'In Repair' => 'repair_in_progress',
            'Completed' => 'repair_completed',
            'Returned' => 'repair_returned',
            default => 'repair_status_changed',
        };

        $remarks = match($newStatus) {
            'In Repair' => 'Repair status changed to Under Repair at ' . ($repair->vendor?->company_name ?? 'vendor'),
            'Completed' => 'Repair completed by ' . ($repair->vendor?->company_name ?? 'vendor'),
            'Returned' => 'Asset returned from ' . ($repair->vendor?->company_name ?? 'vendor') . ' after repair',
            default => "Repair status changed from {$oldStatus} to {$newStatus}",
        };

        $changedFields = [
            [
                'field' => 'status',
                'label' => 'Repair Status',
                'type' => 'text',
                'old_value' => $oldStatus,
                'new_value' => $newStatus,
            ],
        ];

        // Add additional fields based on status
        if ($newStatus === 'In Repair') {
            if ($repair->delivered_by_type) {
                $changedFields[] = [
                    'field' => 'delivered_by',
                    'label' => 'Delivered By',
                    'type' => 'text',
                    'old_value' => null,
                    'new_value' => $repair->delivered_by_type === 'employee'
                        ? $repair->delivered_by_employee_name
                        : $repair->deliveredByBranch?->branch_name,
                ];
            }
        }

        if ($newStatus === 'Completed') {
            if ($repair->isDirty('repair_cost')) {
                $changedFields[] = [
                    'field' => 'repair_cost',
                    'label' => 'Repair Cost',
                    'type' => 'currency',
                    'old_value' => $repair->getOriginal('repair_cost'),
                    'new_value' => $repair->repair_cost,
                ];
            }
            if ($repair->isDirty('invoice_no')) {
                $changedFields[] = [
                    'field' => 'invoice_no',
                    'label' => 'Invoice No',
                    'type' => 'text',
                    'old_value' => $repair->getOriginal('invoice_no'),
                    'new_value' => $repair->invoice_no,
                ];
            }
        }

        if ($newStatus === 'Returned' && $repair->actual_return_date) {
            $changedFields[] = [
                'field' => 'actual_return_date',
                'label' => 'Actual Return Date',
                'type' => 'date',
                'old_value' => $repair->getOriginal('actual_return_date'),
                'new_value' => $repair->actual_return_date,
            ];
        }

        AssetMovement::create([
            'asset_id' => $repair->asset_id,
            'movement_type' => $movementType,
            'repair_id' => $repair->id,
            'from_status_id' => $repair->asset->status_id,
            'to_status_id' => $repair->asset->status_id,
            'performed_by_user_id' => Auth::id(),
            'movement_date' => now(),
            'reason' => "Status changed from {$oldStatus} to {$newStatus}",
            'remarks' => $remarks,
            'metadata' => [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'repair_cost' => $repair->repair_cost,
                'vendor_name' => $repair->vendor?->company_name,
                'repair_duration_days' => $newStatus === 'Returned' && $repair->repair_date && $repair->actual_return_date
                    ? $repair->repair_date->diffInDays($repair->actual_return_date)
                    : null,
                'changed_fields' => $changedFields,
                'change_count' => count($changedFields),
            ],
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }

    /**
     * Log field changes (excluding status)
     */
    private function logFieldChanges(Repair $repair): void
    {
        $changedFields = [];
        $trackableFields = [
            'description' => ['label' => 'Description', 'type' => 'text'],
            'repair_date' => ['label' => 'Repair Date', 'type' => 'date'],
            'expected_return_date' => ['label' => 'Expected Return Date', 'type' => 'date'],
            'actual_return_date' => ['label' => 'Actual Return Date', 'type' => 'date'],
            'repair_cost' => ['label' => 'Repair Cost', 'type' => 'currency'],
            'vendor_id' => ['label' => 'Vendor', 'type' => 'relation'],
        ];

        foreach ($trackableFields as $field => $config) {
            if ($repair->isDirty($field) && $field !== 'status') {
                $oldValue = $repair->getOriginal($field);
                $newValue = $repair->$field;

                // For vendor, get company name
                if ($field === 'vendor_id') {
                    $oldVendor = \App\Models\Vendor::find($oldValue);
                    $oldValue = $oldVendor?->company_name;
                    $newValue = $repair->vendor?->company_name;
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

        // Only log if there are field changes (excluding status)
        if (!empty($changedFields)) {
            AssetMovement::create([
                'asset_id' => $repair->asset_id,
                'movement_type' => 'repair_updated',
                'repair_id' => $repair->id,
                'performed_by_user_id' => Auth::id(),
                'movement_date' => now(),
                'reason' => 'Repair record updated',
                'remarks' => 'Updated repair record fields: ' . implode(', ', array_column($changedFields, 'label')),
                'metadata' => [
                    'changed_fields' => $changedFields,
                    'change_count' => count($changedFields),
                    'repair_status' => $repair->status,
                    'vendor_name' => $repair->vendor?->company_name,
                ],
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]);
        }
    }

    /**
     * Handle the Repair "deleted" event.
     */
    public function deleted(Repair $repair): void
    {
        $deletedFields = [
            [
                'field' => 'description',
                'label' => 'Description',
                'type' => 'text',
                'value' => $repair->description,
            ],
            [
                'field' => 'repair_date',
                'label' => 'Repair Date',
                'type' => 'date',
                'value' => $repair->repair_date instanceof \Carbon\Carbon
                    ? $repair->repair_date->toDateString()
                    : $repair->repair_date,
            ],
            [
                'field' => 'expected_return_date',
                'label' => 'Expected Return Date',
                'type' => 'date',
                'value' => $repair->expected_return_date,
            ],
            [
                'field' => 'actual_return_date',
                'label' => 'Actual Return Date',
                'type' => 'date',
                'value' => $repair->actual_return_date instanceof \Carbon\Carbon
                    ? $repair->actual_return_date->toDateString()
                    : $repair->actual_return_date,
            ],
            [
                'field' => 'repair_cost',
                'label' => 'Repair Cost',
                'type' => 'currency',
                'value' => $repair->repair_cost,
            ],
            [
                'field' => 'status',
                'label' => 'Status',
                'type' => 'text',
                'value' => $repair->status,
            ],
            [
                'field' => 'vendor_id',
                'label' => 'Vendor',
                'type' => 'relation',
                'value' => $repair->vendor?->company_name,
            ],
        ];

        AssetMovement::create([
            'asset_id' => $repair->asset_id,
            'movement_type' => 'repair_deleted',
            'repair_id' => $repair->id,
            'performed_by_user_id' => Auth::id(),
            'movement_date' => now(),
            'reason' => 'Repair record deleted',
            'remarks' => 'Deleted repair record (Status: ' . $repair->status . ', Vendor: ' . ($repair->vendor?->company_name ?? 'N/A') . ')',
            'metadata' => [
                'deleted_repair_data' => $deletedFields,
                'repair_id' => $repair->id,
                'repair_cost' => $repair->repair_cost,
                'repair_status' => $repair->status,
                'vendor_name' => $repair->vendor?->company_name,
            ],
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }
}
