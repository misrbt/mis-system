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
            'workstation_id' => 'required|exists:workstations,id',
        ];
    }
}
