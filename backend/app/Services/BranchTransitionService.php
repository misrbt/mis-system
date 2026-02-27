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
     * Execute a branch transition with workstation-based asset management.
     *
     * WORKSTATION CONCEPT:
     * - Workstation assets (those with workstation_branch_id + workstation_position_id set)
     *   stay at their physical desk but their assigned_to_employee_id changes.
     * - When an employee moves to a new workstation, they inherit the assets at that desk.
     * - When an employee leaves a workstation and no one replaces them, their old
     *   workstation assets become unassigned (assigned_to_employee_id = null).
     * - Portable assets (no workstation fields set) follow the employee — they are NOT unassigned.
     *
     * @param  array<int, array{employee_id: int, to_branch_id: int, to_position_id: int}>  $transitions
     * @return array{employees: array, assets_reassigned: int, batch_id: string}
     */
    public function execute(array $transitions, ?string $remarks = null): array
    {
        return DB::transaction(function () use ($transitions, $remarks) {
            $batchId = (string) Str::uuid();
            $userId = Auth::id();

            // 1. Load all employees with their current assignments
            $employeeIds = array_column($transitions, 'employee_id');
            $employees = Employee::with(['branch', 'position'])
                ->whereIn('id', $employeeIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // 2. Build destination map: [branch_id][position_id] = employee_id
            //    Used to check if someone is replacing a vacated workstation
            $destinationMap = [];
            foreach ($transitions as $transition) {
                $branchId   = $transition['to_branch_id'];
                $positionId = $transition['to_position_id'];
                $employeeId = $transition['employee_id'];

                $destinationMap[$branchId][$positionId] = $employeeId;
            }

            // 3. Collect all relevant workstation locations
            //    (destinations + old locations of all transitioning employees)
            $locationPairs = [];
            foreach ($transitions as $transition) {
                $employee = $employees->get($transition['employee_id']);
                if (! $employee) {
                    continue;
                }

                // Destination workstation
                $locationPairs[] = [
                    'branch_id'   => $transition['to_branch_id'],
                    'position_id' => $transition['to_position_id'],
                ];

                // Old workstation
                if ($employee->branch_id && $employee->position_id) {
                    $locationPairs[] = [
                        'branch_id'   => $employee->branch_id,
                        'position_id' => $employee->position_id,
                    ];
                }
            }

            // 4. Load all workstation assets at those locations in one query
            //    Only assets that have BOTH workstation fields set are workstation assets.
            //    Portable assets (null workstation fields) are ignored here.
            $workstationAssets = collect();
            if (! empty($locationPairs)) {
                $workstationAssets = Asset::query()
                    ->whereNotNull('workstation_branch_id')
                    ->whereNotNull('workstation_position_id')
                    ->where(function ($query) use ($locationPairs) {
                        foreach ($locationPairs as $pair) {
                            $query->orWhere(function ($q) use ($pair) {
                                $q->where('workstation_branch_id', $pair['branch_id'])
                                    ->where('workstation_position_id', $pair['position_id']);
                            });
                        }
                    })
                    ->with(['category'])
                    ->lockForUpdate()
                    ->get();
            }

            // Group assets by their workstation location key
            $assetsByWorkstation = [];
            foreach ($workstationAssets as $asset) {
                $key = $asset->workstation_branch_id . '_' . $asset->workstation_position_id;
                $assetsByWorkstation[$key][] = $asset;
            }

            $employeeResults      = [];
            $assetsReassignedCount = 0;

            // 5. Process each employee transition
            foreach ($transitions as $transition) {
                $employee = $employees->get($transition['employee_id']);

                if (! $employee) {
                    continue;
                }

                $fromBranchId       = $employee->branch_id;
                $fromBranchName     = $employee->branch?->branch_name ?? 'Unknown';
                $fromPositionId     = $employee->position_id;
                $fromPositionTitle  = $employee->position?->title ?? 'Unknown';

                $toBranchId   = $transition['to_branch_id'];
                $toPositionId = $transition['to_position_id'];

                // Update employee's branch and position
                $employee->branch_id    = $toBranchId;
                $employee->position_id  = $toPositionId;
                $employee->save();

                // Reload to get new names
                $employee->load(['branch', 'position']);

                // ── Step A: Assign workstation assets at the destination to this employee ──
                $destKey            = $toBranchId . '_' . $toPositionId;
                $assetsAtDestination = $assetsByWorkstation[$destKey] ?? [];

                foreach ($assetsAtDestination as $asset) {
                    $previousEmployeeId = $asset->assigned_to_employee_id;

                    // Only reassign if not already assigned to this employee
                    if ($previousEmployeeId !== $employee->id) {
                        $asset->assigned_to_employee_id = $employee->id;
                        $asset->save();

                        // Audit: asset movement record
                        AssetMovement::create([
                            'asset_id'             => $asset->id,
                            'movement_type'        => 'branch_transition',
                            'from_employee_id'     => $previousEmployeeId,
                            'to_employee_id'       => $employee->id,
                            'from_branch_id'       => $fromBranchId,
                            'to_branch_id'         => $toBranchId,
                            'performed_by_user_id' => $userId,
                            'reason'               => 'Branch transition — workstation takeover',
                            'remarks'              => $remarks,
                            'metadata'             => [
                                'batch_id'               => $batchId,
                                'transition_type'        => 'workstation_based',
                                'asset_category'         => $asset->category?->name,
                                'workstation_branch_id'  => $asset->workstation_branch_id,
                                'workstation_position_id' => $asset->workstation_position_id,
                            ],
                            'movement_date'        => now(),
                            'ip_address'           => request()->ip(),
                            'user_agent'           => request()->userAgent(),
                        ]);

                        $assetsReassignedCount++;
                    }
                }

                // ── Step B: Unassign old workstation assets if no one is moving there ──
                if ($fromBranchId && $fromPositionId) {
                    $oldKey              = $fromBranchId . '_' . $fromPositionId;
                    $replacementUserId   = $destinationMap[$fromBranchId][$fromPositionId] ?? null;

                    if (! $replacementUserId) {
                        // No one is moving to the old workstation — unassign its assets
                        $oldAssets = $assetsByWorkstation[$oldKey] ?? [];

                        foreach ($oldAssets as $oldAsset) {
                            // Only unassign assets that were assigned to THIS employee
                            if ($oldAsset->assigned_to_employee_id === $employee->id) {
                                $oldAsset->assigned_to_employee_id = null;
                                $oldAsset->save();

                                AssetMovement::create([
                                    'asset_id'             => $oldAsset->id,
                                    'movement_type'        => 'returned',
                                    'from_employee_id'     => $employee->id,
                                    'to_employee_id'       => null,
                                    'from_branch_id'       => $fromBranchId,
                                    'to_branch_id'         => null,
                                    'performed_by_user_id' => $userId,
                                    'reason'               => 'Employee left workstation (branch transition)',
                                    'remarks'              => $remarks,
                                    'metadata'             => [
                                        'batch_id'        => $batchId,
                                        'transition_type' => 'workstation_vacated',
                                    ],
                                    'movement_date' => now(),
                                    'ip_address'    => request()->ip(),
                                    'user_agent'    => request()->userAgent(),
                                ]);

                                $assetsReassignedCount++;
                            }
                        }
                    }
                }

                $employeeResults[] = [
                    'employee_id'        => $employee->id,
                    'employee_name'      => $employee->fullname,
                    'from_branch_id'     => $fromBranchId,
                    'from_branch_name'   => $fromBranchName,
                    'from_position_id'   => $fromPositionId,
                    'from_position_title' => $fromPositionTitle,
                    'to_branch_id'       => $toBranchId,
                    'to_branch_name'     => $employee->branch?->branch_name ?? 'Unknown',
                    'to_position_id'     => $toPositionId,
                    'to_position_title'  => $employee->position?->title ?? 'Unknown',
                ];
            }

            return [
                'employees'       => $employeeResults,
                'assets_reassigned' => $assetsReassignedCount,
                'batch_id'        => $batchId,
            ];
        });
    }
}
