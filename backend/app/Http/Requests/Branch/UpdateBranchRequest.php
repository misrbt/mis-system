<?php

namespace App\Http\Requests\Branch;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $branchId = $this->route('branch'); // Get ID from route parameter

        return [
            'branch_name' => 'required|string|max:255|unique:branch,branch_name,'.$branchId,
            'brak' => 'required|string|max:255',
            'brcode' => 'required|string|max:255|unique:branch,brcode,'.$branchId,
            'has_obo' => 'sometimes|boolean',
            'obos' => 'array',
            'obos.*.id' => 'nullable|integer|exists:branch_obos,id',
            'obos.*.name' => 'required|string|max:255',
        ];
    }
}
