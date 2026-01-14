<?php

namespace App\Observers;

use App\Models\AssetComponent;
use App\Models\AssetComponentMovement;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;

class AssetComponentObserver
{
    private array $originalValues = [];

    public function created(AssetComponent $component): void
    {
        $this->logMovement($component, 'created', [
            'to_status_id' => $component->status_id,
            'to_employee_id' => $component->assigned_to_employee_id,
            'to_branch_id' => $component->assignedEmployee?->branch_id,
            'parent_asset_id' => $component->parent_asset_id,
            'metadata' => [
                'component_type' => $component->component_type,
                'component_name' => $component->component_name,
            ],
            'remarks' => 'Component initially created',
        ]);
    }

    public function updating(AssetComponent $component): void
    {
        $this->originalValues[$component->id] = $component->getOriginal();
    }

    public function updated(AssetComponent $component): void
    {
        $original = $this->originalValues[$component->id] ?? $component->getOriginal();
        unset($this->originalValues[$component->id]);

        // Track assignment changes
        if ($component->assigned_to_employee_id != $original['assigned_to_employee_id']) {
            $this->trackAssignmentChange($component, $original);
        }

        // Track status changes
        if ($component->status_id != $original['status_id']) {
            $this->trackStatusChange($component, $original);
        }

        // Track other field changes
        $this->trackFieldChanges($component, $original);
    }

    public function deleted(AssetComponent $component): void
    {
        $this->logMovement($component, 'disposed', [
            'from_status_id' => $component->status_id,
            'from_employee_id' => $component->assigned_to_employee_id,
            'from_branch_id' => $component->assignedEmployee?->branch_id,
            'parent_asset_id' => $component->parent_asset_id,
            'remarks' => 'Component deleted',
        ]);
    }

    protected function trackAssignmentChange(AssetComponent $component, array $original): void
    {
        $fromEmployeeId = $original['assigned_to_employee_id'];
        $toEmployeeId = $component->assigned_to_employee_id;
        $fromBranchId = $fromEmployeeId ? Employee::find($fromEmployeeId)?->branch_id : null;
        $toBranchId = $toEmployeeId ? $component->assignedEmployee?->branch_id : null;

        $movementType = !$fromEmployeeId && $toEmployeeId ? 'assigned' :
                       ($fromEmployeeId && $toEmployeeId ? 'transferred' : 'returned');

        $this->logMovement($component, $movementType, [
            'from_employee_id' => $fromEmployeeId,
            'to_employee_id' => $toEmployeeId,
            'from_branch_id' => $fromBranchId,
            'to_branch_id' => $toBranchId,
            'parent_asset_id' => $component->parent_asset_id,
        ]);
    }

    protected function trackStatusChange(AssetComponent $component, array $original): void
    {
        $this->logMovement($component, 'status_changed', [
            'from_status_id' => $original['status_id'],
            'to_status_id' => $component->status_id,
            'parent_asset_id' => $component->parent_asset_id,
        ]);
    }

    protected function trackFieldChanges(AssetComponent $component, array $original): void
    {
        $changedFields = [];
        $trackable = ['component_type', 'component_name', 'brand', 'model', 'serial_number', 'acq_cost', 'remarks'];

        foreach ($trackable as $field) {
            if ($component->$field != $original[$field]) {
                $changedFields[] = [
                    'field' => $field,
                    'old_value' => $original[$field],
                    'new_value' => $component->$field,
                ];
            }
        }

        if (!empty($changedFields)) {
            $this->logMovement($component, 'updated', [
                'parent_asset_id' => $component->parent_asset_id,
                'metadata' => ['changed_fields' => $changedFields],
            ]);
        }
    }

    protected function logMovement(AssetComponent $component, string $movementType, array $additionalData = []): void
    {
        $request = request();

        AssetComponentMovement::create(array_merge([
            'asset_component_id' => $component->id,
            'movement_type' => $movementType,
            'performed_by_user_id' => Auth::id(),
            'movement_date' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ], $additionalData));
    }
}
