<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\Employee;
use App\Models\Workstation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BranchTransitionService
{
    public function __construct(
        protected WorkstationService $workstationService
    ) {}

    /**
     * Execute a branch transition with workstation-based asset management.
     *
     * NEW WORKSTATION CONCEPT:
     * - Workstations are now first-class entities (workstations table).
     * - Assets are fixed to workstations via workstation_id.
     * - When employees transition, their workstation assignments change,
     *   but assets stay at their workstations.
     * - The system handles both new workstation_id field AND legacy
     *   workstation_branch_id/workstation_position_id for backward compatibility.
     *
     * @param  array<int, array{employee_id: int, to_branch_id: int, to_position_id: int, to_workstation_id?: int}>  $transitions
     * @return array{employees: array, workstation_changes: int, batch_id: string}
     */
    public function execute(array $transitions, ?string $remarks = null): array
    {
        return DB::transaction(function () use ($transitions, $remarks) {
            $batchId = (string) Str::uuid();
            $userId = Auth::id();

            // 1. Load all employees with their current workstation assignments
            $employeeIds = array_column($transitions, 'employee_id');
            $employees = Employee::with(['branch', 'position'])
                ->whereIn('id', $employeeIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $employeeResults = [];
            $workstationChanges = 0;

            // 2. Process each employee transition
            foreach ($transitions as $transition) {
                $employee = $employees->get($transition['employee_id']);

                if (! $employee) {
                    continue;
                }

                $fromBranchId = $employee->branch_id;
                $fromBranchName = $employee->branch?->branch_name ?? 'Unknown';
                $fromPositionId = $employee->position_id;
                $fromPositionTitle = $employee->position?->title ?? 'Unknown';

                $toBranchId = $transition['to_branch_id'];
                $toPositionId = $transition['to_position_id'];
                $toWorkstationId = $transition['to_workstation_id'] ?? null;

                // Get old workstation (if any)
                $oldWorkstation = Workstation::where('employee_id', $employee->id)->first();
                $oldWorkstationId = $oldWorkstation?->id;

                // Update employee's branch and position
                $employee->branch_id = $toBranchId;
                $employee->position_id = $toPositionId;
                $employee->save();

                // Unassign from old workstation
                if ($oldWorkstation) {
                    $oldWorkstation->employee_id = null;
                    $oldWorkstation->save();

                    InventoryAuditLogService::log('workstation_unassignment', [
                        'batch_id' => $batchId,
                        'employee_id' => $employee->id,
                        'employee_name' => $employee->fullname,
                        'workstation_id' => $oldWorkstationId,
                        'reason' => 'Branch transition',
                        'remarks' => $remarks,
                    ]);
                    $workstationChanges++;
                }

                // Assign to new workstation
                $newWorkstationId = null;
                if ($toWorkstationId) {
                    // Use explicit workstation ID if provided
                    // Force assignment to allow exchanges (occupied workstations)
                    $result = $this->workstationService->assignEmployee($toWorkstationId, $employee->id, force: true);
                    if ($result['success']) {
                        $newWorkstationId = $toWorkstationId;
                        $workstationChanges++;
                    }
                } elseif ($toPositionId) {
                    // Auto-create or find workstation for branch+position
                    $newWorkstation = $this->workstationService->getOrCreate($toBranchId, $toPositionId);
                    $result = $this->workstationService->assignEmployee($newWorkstation->id, $employee->id, force: true);
                    if ($result['success']) {
                        $newWorkstationId = $newWorkstation->id;
                        $workstationChanges++;
                    }
                }

                // Reload to get new data
                $employee->load(['branch', 'position']);

                $employeeResults[] = [
                    'employee_id' => $employee->id,
                    'employee_name' => $employee->fullname,
                    'from_branch_id' => $fromBranchId,
                    'from_branch_name' => $fromBranchName,
                    'from_position_id' => $fromPositionId,
                    'from_position_title' => $fromPositionTitle,
                    'to_branch_id' => $toBranchId,
                    'to_branch_name' => $employee->branch?->branch_name ?? 'Unknown',
                    'to_position_id' => $toPositionId,
                    'to_position_title' => $employee->position?->title ?? 'Unknown',
                    'old_workstation_id' => $oldWorkstationId,
                    'new_workstation_id' => $newWorkstationId,
                ];
            }

            return [
                'employees' => $employeeResults,
                'workstation_changes' => $workstationChanges,
                'batch_id' => $batchId,
            ];
        });
    }
}
