<?php

namespace App\Http\Requests\AssetMovement;

use Illuminate\Foundation\Http\FormRequest;

class BulkTransferAssetsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_ids' => 'required|array|min:1',
            'asset_ids.*' => 'required|exists:assets,id',
            'to_workstation_id' => 'required|exists:workstations,id',
            'reason' => 'required|string|min:10',
            'remarks' => 'nullable|string',
        ];
    }
}
