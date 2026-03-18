<?php

namespace App\Http\Requests\Workstation;

use Illuminate\Foundation\Http\FormRequest;

class AssignAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_id' => 'required|integer|exists:assets,id',
        ];
    }

    public function messages(): array
    {
        return [
            'asset_id.required' => 'An asset is required.',
            'asset_id.exists' => 'The selected asset does not exist.',
        ];
    }
}
