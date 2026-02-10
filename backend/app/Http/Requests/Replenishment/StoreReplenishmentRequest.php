<?php

namespace App\Http\Requests\Replenishment;

use Illuminate\Foundation\Http\FormRequest;

class StoreReplenishmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'asset_category_id' => 'nullable|exists:asset_category,id',
            'subcategory_id' => 'nullable|exists:asset_subcategories,id',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'acq_cost' => 'nullable|numeric|min:0',
            'book_value' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'warranty_expiration_date' => 'nullable|date',
            'estimate_life' => 'nullable|integer|min:0',
            'vendor_id' => 'nullable|exists:vendors,id',
            'status_id' => 'nullable|exists:status,id',
            'assigned_to_employee_id' => 'nullable|exists:employee,id',
            'assigned_to_branch_id' => 'nullable|exists:branches,id',
            'remarks' => 'nullable|string',
            'specifications' => 'nullable|array',
        ];
    }
}
