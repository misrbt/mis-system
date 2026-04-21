<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetMovement;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Workstation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WorkstationService
{
    /**
     * Create a workstation from branch and optional position.
     * Auto-generates name if not provided.
     *
     * @param  array<int>  $employeeIds
     */
    public function createFromBranchPosition(
        int $branchId,
        ?int $positionId = null,
        ?string $name = null,
        ?string $description = null,
        array $employeeIds = []
    ): Workstation {
        return DB::transaction(function () use ($branchId, $positionId, $name, $description, $employeeIds) {
            $branch = Branch::findOrFail($branchId);
            $position = $positionId ? Position::find($positionId) : null;

            $workstationName = $name;
            if (empty($workstationName)) {
                $branchName = $branch->branch_name ?? 'Unknown Branch';
                $positionName = $position?->title ?? 'General';
                $workstationName = "{$branchName} - {$positionName}";
            }

            $primaryEmployeeId = ! empty($employeeIds) ? $employeeIds[0] : null;

            $workstation = Workstation::create([
                'branch_id' => $branchId,
                'position_id' => $positionId,
                'employee_id' => $primaryEmployeeId,
                'name' => $workstationName,
                'description' => $description,
                'is_active' => true,
            ]);

            if (! empty($employeeIds)) {
                $pivotData = [];
                foreach ($employeeIds as $employeeId) {
                    $pivotData[$employeeId] = ['assigned_at' => now()];
                }
                $workstation->employees()->sync($pivotData);
            }

            return $workstation;
        });
    }

    /**
     * Assign an employee to a workstation.
     *
     * @param  bool  $force  If true, allows assignment even if workstation is occupied (for transitions/exchanges)
     * @return array{success: bool, message: string, workstation: Workstation}
     */
    public function assignEmployee(int $workstationId, int $employeeId, bool $force = false): array
    {
        return DB::transaction(function () use ($workstationId, $employeeId, $force) {
            $workstation = Workstation::findOrFail($workstationId);
            $employee = Employee::findOrFail($employeeId);

            // Check if already assigned
            if ($workstation->employee_id === $employeeId) {
                return [
                    'success' => false,
                    'message' => 'Employee is already assigned to this workstation.',
                    'workstation' => $workstation,
                ];
            }

            // Check if workstation already has an employee (only if not forcing)
            if (! $force && $workstation->employee_id) {
                $currentEmployee = Employee::find($workstation->employee_id);

                return [
                    'success' => false,
                    'message' => "Workstation already has an assigned employee ({$currentEmployee->fullname}). Please unassign first.",
                    'workstation' => $workstation,
                ];
            }

            // If forcing and workstation is occupied, log the replacement
            if ($force && $workstation->employee_id) {
                $previousEmployee = Employee::find($workstation->employee_id);
                InventoryAuditLogService::log('employee_workstation_replaced', [
                    'workstation_id' => $workstationId,
                    'workstation_name' => $workstation->name,
                    'previous_employee_id' => $workstation->employee_id,
                    'previous_employee_name' => $previousEmployee->fullname,
                    'new_employee_id' => $employeeId,
                    'new_employee_name' => $employee->fullname,
                    'reason' => 'Employee transition/exchange',
                ]);
            }

            // Assign employee to workstation
            $workstation->employee_id = $employeeId;
            $workstation->save();

            // Sync pivot table (replace existing entry for this workstation with new employee)
            $workstation->employees()->syncWithoutDetaching([$employeeId => ['assigned_at' => now()]]);

            // Log the assignment
            InventoryAuditLogService::log('employee_workstation_assigned', [
                'workstation_id' => $workstationId,
                'workstation_name' => $workstation->name,
                'employee_id' => $employeeId,
                'employee_name' => $employee->fullname,
            ]);

            return [
                'success' => true,
                'message' => "Employee '{$employee->fullname}' assigned to workstation '{$workstation->name}'.",
                'workstation' => $workstation->fresh(['employee', 'employees', 'assets']),
            ];
        });
    }

    /**
     * Unassign an employee from a workstation.
     *
     * @return array{success: bool, message: string, workstation: Workstation}
     */
    public function unassignEmployee(int $workstationId, int $employeeId): array
    {
        return DB::transaction(function () use ($workstationId, $employeeId) {
            $workstation = Workstation::findOrFail($workstationId);
            $employee = Employee::findOrFail($employeeId);

            // Check if assigned
            if ($workstation->employee_id !== $employeeId) {
                return [
                    'success' => false,
                    'message' => 'Employee is not assigned to this workstation.',
                    'workstation' => $workstation,
                ];
            }

            // Unassign employee from workstation
            $workstation->employee_id = null;
            $workstation->save();

            // Remove from pivot table
            $workstation->employees()->detach($employeeId);

            // Log the unassignment
            InventoryAuditLogService::log('employee_workstation_unassigned', [
                'workstation_id' => $workstationId,
                'workstation_name' => $workstation->name,
                'employee_id' => $employeeId,
                'employee_name' => $employee->fullname,
            ]);

            return [
                'success' => true,
                'message' => "Employee '{$employee->fullname}' unassigned from workstation '{$workstation->name}'.",
                'workstation' => $workstation->fresh(['employee', 'employees', 'assets']),
            ];
        });
    }

    /**
     * Assign an asset to a workstation.
     *
     * @return array{success: bool, message: string, asset: Asset}
     */
    public function assignAsset(int $workstationId, int $assetId): array
    {
        return DB::transaction(function () use ($workstationId, $assetId) {
            $workstation = Workstation::findOrFail($workstationId);
            $asset = Asset::findOrFail($assetId);

            $previousWorkstationId = $asset->workstation_id;
            $previousWorkstation = $previousWorkstationId ? Workstation::find($previousWorkstationId) : null;

            // Update asset's workstation
            $asset->workstation_id = $workstationId;
            // Also update legacy fields for backward compatibility
            $asset->workstation_branch_id = $workstation->branch_id;
            $asset->workstation_position_id = $workstation->position_id;
            $asset->save();

            // Create movement record
            AssetMovement::create([
                'asset_id' => $assetId,
                'movement_type' => $previousWorkstationId ? 'workstation_transfer' : 'workstation_assigned',
                'from_branch_id' => $previousWorkstation?->branch_id,
                'to_branch_id' => $workstation->branch_id,
                'performed_by_user_id' => Auth::id(),
                'reason' => $previousWorkstationId
                    ? "Asset transferred from workstation '{$previousWorkstation->name}' to '{$workstation->name}'"
                    : "Asset assigned to workstation '{$workstation->name}'",
                'metadata' => [
                    'from_workstation_id' => $previousWorkstationId,
                    'from_workstation_name' => $previousWorkstation?->name,
                    'to_workstation_id' => $workstationId,
                    'to_workstation_name' => $workstation->name,
                ],
                'movement_date' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return [
                'success' => true,
                'message' => "Asset assigned to workstation '{$workstation->name}'.",
                'asset' => $asset->fresh(['workstation']),
            ];
        });
    }

    /**
     * Transfer an asset between workstations.
     *
     * @return array{success: bool, message: string, asset: Asset}
     */
    public function transferAsset(int $assetId, int $fromWorkstationId, int $toWorkstationId): array
    {
        return DB::transaction(function () use ($assetId, $fromWorkstationId, $toWorkstationId) {
            $asset = Asset::findOrFail($assetId);
            $fromWorkstation = Workstation::findOrFail($fromWorkstationId);
            $toWorkstation = Workstation::findOrFail($toWorkstationId);

            // Verify asset is currently at the from workstation
            if ($asset->workstation_id !== $fromWorkstationId) {
                return [
                    'success' => false,
                    'message' => "Asset is not currently at workstation '{$fromWorkstation->name}'.",
                    'asset' => $asset,
                ];
            }

            // Update asset's workstation
            $asset->workstation_id = $toWorkstationId;
            // Also update legacy fields for backward compatibility
            $asset->workstation_branch_id = $toWorkstation->branch_id;
            $asset->workstation_position_id = $toWorkstation->position_id;
            $asset->save();

            // Create movement record
            AssetMovement::create([
                'asset_id' => $assetId,
                'movement_type' => 'workstation_transfer',
                'from_branch_id' => $fromWorkstation->branch_id,
                'to_branch_id' => $toWorkstation->branch_id,
                'performed_by_user_id' => Auth::id(),
                'reason' => "Asset transferred from '{$fromWorkstation->name}' to '{$toWorkstation->name}'",
                'metadata' => [
                    'from_workstation_id' => $fromWorkstationId,
                    'from_workstation_name' => $fromWorkstation->name,
                    'to_workstation_id' => $toWorkstationId,
                    'to_workstation_name' => $toWorkstation->name,
                ],
                'movement_date' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return [
                'success' => true,
                'message' => "Asset transferred from '{$fromWorkstation->name}' to '{$toWorkstation->name}'.",
                'asset' => $asset->fresh(['workstation']),
            ];
        });
    }

    /**
     * Remove an asset from its workstation.
     *
     * @return array{success: bool, message: string, asset: Asset}
     */
    public function removeAsset(int $assetId): array
    {
        return DB::transaction(function () use ($assetId) {
            $asset = Asset::findOrFail($assetId);

            if (! $asset->workstation_id) {
                return [
                    'success' => false,
                    'message' => 'Asset is not assigned to any workstation.',
                    'asset' => $asset,
                ];
            }

            $previousWorkstation = $asset->workstation;

            // Clear workstation assignment
            $asset->workstation_id = null;
            $asset->workstation_branch_id = null;
            $asset->workstation_position_id = null;
            $asset->save();

            // Create movement record
            AssetMovement::create([
                'asset_id' => $assetId,
                'movement_type' => 'workstation_removed',
                'from_branch_id' => $previousWorkstation?->branch_id,
                'to_branch_id' => null,
                'performed_by_user_id' => Auth::id(),
                'reason' => "Asset removed from workstation '{$previousWorkstation->name}'",
                'metadata' => [
                    'from_workstation_id' => $previousWorkstation->id,
                    'from_workstation_name' => $previousWorkstation->name,
                ],
                'movement_date' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return [
                'success' => true,
                'message' => "Asset removed from workstation '{$previousWorkstation->name}'.",
                'asset' => $asset->fresh(),
            ];
        });
    }

    /**
     * Get or create a workstation for a branch and position combination.
     * Useful for backward compatibility with legacy code.
     */
    public function getOrCreate(int $branchId, ?int $positionId = null): Workstation
    {
        $query = Workstation::where('branch_id', $branchId);

        if ($positionId) {
            $query->where('position_id', $positionId);
        } else {
            $query->whereNull('position_id');
        }

        $workstation = $query->first();

        if (! $workstation) {
            $workstation = $this->createFromBranchPosition($branchId, $positionId);
        }

        return $workstation;
    }
}
