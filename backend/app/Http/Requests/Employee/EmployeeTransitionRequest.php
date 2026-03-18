<?php

namespace App\Http\Requests\Employee;

use App\Models\Employee;
use Illuminate\Foundation\Http\FormRequest;

class EmployeeTransitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transitions' => 'required|array|min:1',
            'transitions.*.employee_id' => 'required|distinct|exists:employee,id',
            'transitions.*.to_branch_id' => 'required|exists:branch,id',
            'transitions.*.to_position_id' => 'nullable|exists:position,id',
            'transitions.*.to_workstation_id' => 'nullable|exists:workstations,id',
            'remarks' => 'nullable|string|max:1000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'transitions.required' => 'At least one employee transition is required.',
            'transitions.min' => 'At least one employee transition is required.',
            'transitions.*.employee_id.distinct' => 'Each employee can only appear once in the transition.',
            'transitions.*.employee_id.exists' => 'One or more selected employees do not exist.',
            'transitions.*.to_branch_id.exists' => 'One or more selected branches do not exist.',
            'transitions.*.to_position_id.exists' => 'One or more selected positions do not exist.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $transitions = $this->input('transitions', []);

            if (! is_array($transitions)) {
                return;
            }

            // Load employees with their current workstation
            $employeeIds = array_column($transitions, 'employee_id');
            $employees = Employee::with('workstations')
                ->whereIn('id', $employeeIds)
                ->get()
                ->keyBy('id');

            foreach ($transitions as $index => $transition) {
                $employee = $employees->get($transition['employee_id'] ?? null);

                if (! $employee) {
                    continue;
                }

                $toBranchId = (int) $transition['to_branch_id'];
                $toPositionId = isset($transition['to_position_id']) ? (int) $transition['to_position_id'] : (int) $employee->position_id;
                $toWorkstationId = isset($transition['to_workstation_id']) ? (int) $transition['to_workstation_id'] : null;

                // Get current workstation
                $currentWorkstation = $employee->workstations->first();
                $currentWorkstationId = $currentWorkstation?->id;

                // Check if anything is actually changing
                $branchChanging = (int) $employee->branch_id !== $toBranchId;
                $positionChanging = (int) $employee->position_id !== $toPositionId;
                $workstationChanging = $currentWorkstationId !== $toWorkstationId;

                if (! $branchChanging && ! $positionChanging && ! $workstationChanging) {
                    $validator->errors()->add(
                        "transitions.{$index}",
                        "Employee \"{$employee->fullname}\" is already at the selected branch, position, and workstation. No change to make."
                    );
                }
            }
        });
    }
}
