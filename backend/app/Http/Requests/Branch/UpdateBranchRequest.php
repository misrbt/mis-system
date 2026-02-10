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
        ];
    }
}
