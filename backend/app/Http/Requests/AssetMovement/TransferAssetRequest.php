<?php

namespace App\Http\Requests\AssetMovement;

use Illuminate\Foundation\Http\FormRequest;

class TransferAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'to_employee_id' => 'required|exists:employee,id',
            'reason' => 'required|string|min:10',
            'remarks' => 'nullable|string',
        ];
    }
}
