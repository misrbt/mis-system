<?php

namespace App\Http\Requests\AssetComponent;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssetComponentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_id' => 'sometimes|required|exists:assets,id',
            'component_name' => 'sometimes|required|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'purchase_date' => 'sometimes|required|date',
            'acq_cost' => 'sometimes|required|numeric|min:0',
            'estimate_life' => 'sometimes|required|integer|min:1',
            'vendor_id' => 'sometimes|required|exists:vendors,id',
            'status_id' => 'sometimes|required|exists:statuses,id',
            'asset_category_id' => 'sometimes|required|exists:asset_categories,id',
            'remarks' => 'nullable|string',
        ];
    }
}
