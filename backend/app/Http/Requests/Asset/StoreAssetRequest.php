<?php

namespace App\Http\Requests\Asset;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_name' => 'required|string|max:255',
            'asset_category_id' => 'required|exists:asset_categories,id',
            'asset_subcategory_id' => 'nullable|exists:asset_subcategories,id',
            'serial_number' => 'nullable|string|max:255',
            'purchase_date' => 'required|date',
            'acq_cost' => 'required|numeric|min:0',
            'estimate_life' => 'required|integer|min:1',
            'vendor_id' => 'required|exists:vendors,id',
            'status_id' => 'required|exists:statuses,id',
            'assigned_to_employee_id' => 'nullable|exists:employee,id',
            'branch_id' => 'nullable|exists:branches,id',
            'equipment_id' => 'nullable|exists:equipment,id',
            'location' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'warranty_expiration' => 'nullable|date',
        ];
    }
}
