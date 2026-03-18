<?php

namespace App\Http\Requests\Workstation;

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
            'asset_id' => 'required|integer|exists:assets,id',
            'to_workstation_id' => 'required|integer|exists:workstations,id',
        ];
    }

    public function messages(): array
    {
        return [
            'asset_id.required' => 'An asset is required.',
            'asset_id.exists' => 'The selected asset does not exist.',
            'to_workstation_id.required' => 'A destination workstation is required.',
            'to_workstation_id.exists' => 'The destination workstation does not exist.',
        ];
    }
}
