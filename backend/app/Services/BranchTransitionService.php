<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetMovement;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BranchTransitionService
{
    /**
     * Execute a workstation-based branch transition.
     *
     * Assets belong to workstations (branch + position), not employees.
     * Employees rotate between workstations, inheriting the assets at each workstation.
     *
     * @param  array<int, array{employee_id: int, to_branch_id: int, to_position_id: int}>  $transitions
     * @return array{employees: array, assets_reassigned: int, batch_id: string}
     */
    public function execute(array $transitions, ?string $remarks = null): array
    {
        return DB::transaction(function () use ($transitions, $remarks) {
            $batchId = (string) Str::uuid();
            $request = request();
            $performedByUserId = Auth::id();

            // 1. Load all employees with their current workstation
            $employeeIds = array_column($transitions, 'employee_id');
            $employees = Employee::with(['branch', 'position'])
                ->whereIn('id', $employeeIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // 2. Build workstation mapping: (branchId:positionId) => assets at that workstation
            $workstationAssets = [];
            foreach ($transitions as $transition) {
                $employee = $employees->get($transition['employee_id']);
                $fromKey = "{$employee->branch_id}:{$employee->position_id}";

                // Get all assets at this workstation
                if (! isset($workstationAssets[$fromKey])) {
                    $workstationAssets[$fromKey] = Asset::where('workstation_branch_id', $employee->branch_id)
                        ->where('workstation_position_id', $employee->position_id)
                        ->get()
                        ->all();
                }
            }

            // 3. Build mapping: which employee is moving to which workstation
            //    "branchId:positionId" => employee_id
            $workstationIncomingEmployee = [];
            foreach ($transitions as $transition) {
                $toBranchId = $transition['to_branch_id'];
                $toPositionId = $transition['to_position_id'];
                $key = "{$toBranchId}:{$toPositionId}";
                $workstationIncomingEmployee[$key] = $transition['employee_id'];
            }

            // 4. Update each employee's branch and position
            $employeeResults = [];
            foreach ($transitions as $transition) {
                $employee = $employees->get($transition['employee_id']);
                $fromBranchName = $employee->branch?->branch_name ?? 'Unknown';
                $fromPositionTitle = $employee->position?->title ?? 'Unknown';

                // Store original IDs
                $originalBranchId = $employee->branch_id;
                $originalPositionId = $employee->position_id;

                // Update employee's workstation
                $employee->branch_id = $transition['to_branch_id'];
                $employee->position_id = $transition['to_position_id'];
                $employee->save();

                // Reload to get new names
                $employee->load(['branch', 'position']);

                $employeeResults[] = [
                    'employee_id' => $employee->id,
                    'employee_name' => $employee->fullname,
                    'from_branch_id' => $originalBranchId,
                    'from_branch_name' => $fromBranchName,
                    'from_position_id' => $originalPositionId,
                    'from_position_title' => $fromPositionTitle,
                    'to_branch_id' => $transition['to_branch_id'],
                    'to_branch_name' => $employee->branch?->branch_name ?? 'Unknown',
                    'to_position_id' => $transition['to_position_id'],
                    'to_position_title' => $employee->position?->title ?? 'Unknown',
                ];
            }

            // 5. Reassign assets based on workstations
            $totalAssetsReassigned = 0;

            Asset::withoutEvents(function () use (
                $workstationAssets,
                $workstationIncomingEmployee,
                $batchId,
                $remarks,
                $performedByUserId,
                $request,
                $employees,
                &$totalAssetsReassigned,
            ) {
                foreach ($workstationIncomingEmployee as $workstationKey => $incomingEmployeeId) {
                    // Get assets at this workstation
                    $assets = $workstationAssets[$workstationKey] ?? [];

                    foreach ($assets as $asset) {
                        $fromEmployeeId = $asset->assigned_to_employee_id;
                        $fromEmployee = $fromEmployeeId ? Employee::find($fromEmployeeId) : null;

                        // Reassign asset to the incoming employee
                        $asset->assigned_to_employee_id = $incomingEmployeeId;
                        $asset->save();

                        $incomingEmployee = $employees->get($incomingEmployeeId);

                        // Create movement record
                        AssetMovement::create([
                            'asset_id' => $asset->id,
                            'movement_type' => 'branch_transition',
                            'from_employee_id' => $fromEmployeeId,
                            'to_employee_id' => $incomingEmployeeId,
                            'from_branch_id' => $asset->workstation_branch_id,
                            'to_branch_id' => $asset->workstation_branch_id, // Workstation stays same
                            'performed_by_user_id' => $performedByUserId,
                            'movement_date' => now(),
                            'reason' => 'Workstation rotation - asset stays at workstation',
                            'remarks' => $remarks,
                            'metadata' => [
                                'transition_batch_id' => $batchId,
                                'transition_type' => 'workstation_rotation',
                                'workstation' => [
                                    'branch_id' => $asset->workstation_branch_id,
                                    'branch_name' => $asset->workstationBranch?->branch_name,
                                    'position_id' => $asset->workstation_position_id,
                                    'position_title' => $asset->workstationPosition?->title,
                                ],
                                'changed_fields' => [
                                    [
                                        'field' => 'assigned_to_employee_id',
                                        'label' => 'Workstation Employee',
                                        'type' => 'relation',
                                        'old_value' => $fromEmployee?->fullname ?? 'Unassigned',
                                        'new_value' => $incomingEmployee->fullname ?? 'Unknown',
                                    ],
                                ],
                                'change_count' => 1,
                            ],
                            'ip_address' => $request?->ip(),
                            'user_agent' => $request?->userAgent(),
                        ]);

                        $totalAssetsReassigned++;
                    }
                }
            });

            return [
                'employees' => $employeeResults,
                'assets_reassigned' => $totalAssetsReassigned,
                'batch_id' => $batchId,
            ];
        });
    }
}
