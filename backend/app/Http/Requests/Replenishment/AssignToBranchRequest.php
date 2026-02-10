<?php

namespace App\Http\Requests\Replenishment;

use Illuminate\Foundation\Http\FormRequest;

class AssignToBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => 'required|exists:branches,id',
        ];
    }
}
