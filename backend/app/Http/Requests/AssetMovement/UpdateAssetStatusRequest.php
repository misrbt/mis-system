<?php

namespace App\Http\Requests\AssetMovement;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssetStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status_id' => 'required|exists:status,id',
            'reason' => 'required|string|min:10',
            'remarks' => 'nullable|string',
        ];
    }
}
