<?php

namespace App\Http\Requests\Replenishment;

use Illuminate\Foundation\Http\FormRequest;

class AssignToEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employee,id',
        ];
    }
}
