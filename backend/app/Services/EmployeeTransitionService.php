<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetMovement;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmployeeTransitionService
{
    /**
     * Execute individual employee transitions with workstation-aware asset handling.
     *
     * WORKSTATION CONCEPT (same as BranchTransitionService):
     * - Workstation assets (assets with BOTH workstation_branch_id AND workstation_position_id set)
     *   stay at their physical desk, but assigned_to_employee_id changes.
     * - Portable assets (no workstation fields) follow the employee — not unassigned.
     *
     * @param  array<int, array{employee_id: int, to_branch_id: int, to_position_id: int|null}>  $transitions
     * @return array{employees: array, assets_reassigned: int, batch_id: string}
     */
    public function execute(array $transitions, ?string $remarks = null): array
    {
        return DB::transaction(function () use ($transitions, $remarks) {
            $batchId = (string) Str::uuid();
            $userId  = Auth::id();

            // 1. Load all employees
            $employeeIds = array_column($transitions, 'employee_id');
            $employees   = Employee::with(['branch', 'position'])
                ->whereIn('id', $employeeIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // 2. Build destination map: [branch_id][position_id] = employee_id
            //    Allows checking if someone is moving into a vacated workstation
            $destinationMap = [];
            foreach ($transitions as $transition) {
                $branchId   = $transition['to_branch_id'];
                $positionId = $transition['to_position_id'] ?? null;

                if ($branchId && $positionId) {
                    $destinationMap[$branchId][$positionId] = $transition['employee_id'];
                }
            }

            // 3. Collect all relevant workstation location pairs
            $locationPairs = [];
            foreach ($transitions as $transition) {
                $employee = $employees->get($transition['employee_id']);
                if (! $employee) {
                    continue;
                }

                $toBranchId   = $transition['to_branch_id'];
                $toPositionId = $transition['to_position_id'] ?? $employee->position_id;

                // Destination
                if ($toBranchId && $toPositionId) {
                    $locationPairs[] = ['branch_id' => $toBranchId, 'position_id' => $toPositionId];
                }

                // Old location
                if ($employee->branch_id && $employee->position_id) {
                    $locationPairs[] = ['branch_id' => $employee->branch_id, 'position_id' => $employee->position_id];
                }
            }

            // 4. Load workstation assets at all relevant locations
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

            // Group assets by workstation location key
            $assetsByWorkstation = [];
            foreach ($workstationAssets as $asset) {
                $key = $asset->workstation_branch_id . '_' . $asset->workstation_position_id;
                $assetsByWorkstation[$key][] = $asset;
            }

            $employeeResults       = [];
            $assetsReassignedCount = 0;

            // 5. Process each employee transition
            foreach ($transitions as $transition) {
                $employee = $employees->get($transition['employee_id']);

                if (! $employee) {
                    continue;
                }

                $fromBranchId      = $employee->branch_id;
                $fromBranchName    = $employee->branch?->branch_name ?? 'Unknown';
                $fromPositionId    = $employee->position_id;
                $fromPositionTitle = $employee->position?->title ?? 'Unknown';

                $toBranchId   = $transition['to_branch_id'];
                $toPositionId = $transition['to_position_id'] ?? $employee->position_id;

                // Update employee's branch and position
                $employee->branch_id    = $toBranchId;
                $employee->position_id  = $toPositionId;
                $employee->save();

                // Reload to get new names
                $employee->load(['branch', 'position']);

                // ── Step A: Assign workstation assets at destination to this employee ──
                if ($toBranchId && $toPositionId) {
                    $destKey             = $toBranchId . '_' . $toPositionId;
                    $assetsAtDestination = $assetsByWorkstation[$destKey] ?? [];

                    foreach ($assetsAtDestination as $asset) {
                        $previousEmployeeId = $asset->assigned_to_employee_id;

                        if ($previousEmployeeId !== $employee->id) {
                            $asset->assigned_to_employee_id = $employee->id;
                            $asset->save();

                            AssetMovement::create([
                                'asset_id'             => $asset->id,
                                'movement_type'        => 'branch_transition',
                                'from_employee_id'     => $previousEmployeeId,
                                'to_employee_id'       => $employee->id,
                                'from_branch_id'       => $fromBranchId,
                                'to_branch_id'         => $toBranchId,
                                'performed_by_user_id' => $userId,
                                'reason'               => 'Employee transition — workstation takeover',
                                'remarks'              => $remarks,
                                'metadata'             => [
                                    'batch_id'                => $batchId,
                                    'transition_type'         => 'workstation_based',
                                    'asset_category'          => $asset->category?->name,
                                    'workstation_branch_id'   => $asset->workstation_branch_id,
                                    'workstation_position_id' => $asset->workstation_position_id,
                                ],
                                'movement_date' => now(),
                                'ip_address'    => request()->ip(),
                                'user_agent'    => request()->userAgent(),
                            ]);

                            $assetsReassignedCount++;
                        }
                    }
                }

                // ── Step B: Unassign old workstation assets if no one is moving there ──
                if ($fromBranchId && $fromPositionId) {
                    $oldKey            = $fromBranchId . '_' . $fromPositionId;
                    $replacementUserId = $destinationMap[$fromBranchId][$fromPositionId] ?? null;

                    if (! $replacementUserId) {
                        $oldAssets = $assetsByWorkstation[$oldKey] ?? [];

                        foreach ($oldAssets as $oldAsset) {
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
                                    'reason'               => 'Employee left workstation (employee transition)',
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
                    'employee_id'         => $employee->id,
                    'employee_name'       => $employee->fullname,
                    'from_branch_id'      => $fromBranchId,
                    'from_branch_name'    => $fromBranchName,
                    'from_position_id'    => $fromPositionId,
                    'from_position_title' => $fromPositionTitle,
                    'to_branch_id'        => $toBranchId,
                    'to_branch_name'      => $employee->branch?->branch_name ?? 'Unknown',
                    'to_position_id'      => $toPositionId,
                    'to_position_title'   => $employee->position?->title ?? 'Unknown',
                ];
            }

            return [
                'employees'        => $employeeResults,
                'assets_reassigned' => $assetsReassignedCount,
                'batch_id'         => $batchId,
            ];
        });
    }
}
