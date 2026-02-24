<?php

namespace App\Services;

use App\Models\Employee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmployeeTransitionService
{
    /**
     * Execute individual employee transitions.
     *
     * Only employees move - assets remain at their workstations.
     * No exchange or workstation requirements.
     *
     * @param  array<int, array{employee_id: int, to_branch_id: int, to_position_id: int|null}>  $transitions
     * @return array{employees: array, batch_id: string}
     */
    public function execute(array $transitions, ?string $remarks = null): array
    {
        return DB::transaction(function () use ($transitions, $remarks) {
            $batchId = (string) Str::uuid();

            // 1. Load all employees
            $employeeIds = array_column($transitions, 'employee_id');
            $employees = Employee::with(['branch', 'position'])
                ->whereIn('id', $employeeIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $employeeResults = [];

            // 2. Process each employee transition - only update employee, not assets
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
                $toPositionId = $transition['to_position_id'] ?? $employee->position_id;

                // Update employee's branch and position
                $employee->branch_id = $toBranchId;
                $employee->position_id = $toPositionId;
                $employee->save();

                // Reload to get new names
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
                ];
            }

            return [
                'employees' => $employeeResults,
                'batch_id' => $batchId,
            ];
        });
    }
}
