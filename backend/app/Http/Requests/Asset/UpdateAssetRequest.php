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
            'subcategory_id' => 'nullable|exists:asset_subcategories,id',
            'serial_number' => 'nullable|string|max:255',
            'purchase_date' => 'sometimes|required|date',
            'acq_cost' => 'sometimes|required|numeric|min:0',
            'estimate_life' => 'sometimes|required|integer|min:1',
            'vendor_id' => 'sometimes|required|exists:vendors,id',
            'status_id' => 'sometimes|required|exists:statuses,id',
            'workstation_id' => 'nullable|exists:workstations,id',
            'assigned_to_employee_id' => 'nullable|exists:employee,id',
            'workstation_branch_id' => 'nullable|exists:branch,id',
            'workstation_position_id' => 'nullable|exists:position,id',
            'equipment_id' => 'nullable|exists:equipment,id',
            'specifications' => 'nullable|array',
            'remarks' => 'nullable|string',
            'waranty_expiration_date' => 'nullable|date',
            'book_value' => 'nullable|numeric|min:0',
        ];
    }
}
