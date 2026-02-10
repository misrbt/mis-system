<?php

namespace App\Http\Requests\Asset;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_name' => 'sometimes|required|string|max:255',
            'asset_category_id' => 'sometimes|required|exists:asset_categories,id',
            'asset_subcategory_id' => 'nullable|exists:asset_subcategories,id',
            'serial_number' => 'nullable|string|max:255',
            'purchase_date' => 'sometimes|required|date',
            'acq_cost' => 'sometimes|required|numeric|min:0',
            'estimate_life' => 'sometimes|required|integer|min:1',
            'vendor_id' => 'sometimes|required|exists:vendors,id',
            'status_id' => 'sometimes|required|exists:statuses,id',
            'assigned_to_employee_id' => 'nullable|exists:employee,id',
            'branch_id' => 'nullable|exists:branches,id',
            'equipment_id' => 'nullable|exists:equipment,id',
            'location' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'warranty_expiration' => 'nullable|date',
        ];
    }
}
