<?php

namespace App\Http\Requests\Branch;

use Illuminate\Foundation\Http\FormRequest;

class StoreBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_name' => 'required|string|max:255|unique:branch,branch_name',
            'brak' => 'required|string|max:255',
            'brcode' => 'required|string|max:255|unique:branch,brcode',
        ];
    }
}
