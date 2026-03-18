<?php

namespace App\Http\Requests\Workstation;

use Illuminate\Foundation\Http\FormRequest;

class AssignEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|integer|exists:employee,id',
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.required' => 'An employee is required.',
            'employee_id.exists' => 'The selected employee does not exist.',
        ];
    }
}
