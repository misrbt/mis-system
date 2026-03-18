<?php

namespace App\Http\Requests\Workstation;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkstationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => 'required|integer|exists:branch,id',
            'position_id' => 'nullable|integer|exists:position,id',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.required' => 'A branch is required for the workstation.',
            'branch_id.exists' => 'The selected branch does not exist.',
            'position_id.exists' => 'The selected position does not exist.',
        ];
    }
}
