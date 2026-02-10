<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee'); // Get ID from route parameter

        return [
            'fullname' => [
                'required',
                'string',
                'max:255',
                Rule::unique('employee', 'fullname')->where(function ($query) {
                    return $query
                        ->where('branch_id', $this->branch_id)
                        ->where('department_id', $this->department_id)
                        ->where('position_id', $this->position_id);
                })->ignore($employeeId),
            ],
            'branch_id' => 'required|exists:branch,id',
            'department_id' => 'nullable|exists:section,id',
            'position_id' => 'required|exists:position,id',
        ];
    }

    public function messages(): array
    {
        return [
            'fullname.unique' => 'An employee with the same name, branch, department, and position already exists.',
        ];
    }
}
