<?php

namespace App\Http\Requests\AssetComponent;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetComponentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_id' => 'required|exists:assets,id',
            'component_name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'acq_cost' => 'required|numeric|min:0',
            'estimate_life' => 'required|integer|min:1',
            'vendor_id' => 'required|exists:vendors,id',
            'status_id' => 'required|exists:statuses,id',
            'asset_category_id' => 'required|exists:asset_categories,id',
            'remarks' => 'nullable|string',
        ];
    }
}
