<?php

namespace App\Http\Requests\AssetMovement;

use Illuminate\Foundation\Http\FormRequest;

class ReturnAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => 'required|string|min:10',
            'return_date' => 'nullable|date',
            'condition' => 'nullable|string',
            'remarks' => 'nullable|string',
        ];
    }
}
