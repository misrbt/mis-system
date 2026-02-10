<?php

namespace App\Http\Requests\Repair;

use Illuminate\Foundation\Http\FormRequest;

class StoreRepairRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_id' => 'required|exists:assets,id',
            'vendor_id' => 'required|exists:vendors,id',
            'description' => 'required|string',
            'repair_date' => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:repair_date',
            'actual_return_date' => 'nullable|date|after_or_equal:repair_date',
            'repair_cost' => 'nullable|numeric|min:0',
            'status' => 'required|in:Pending,In Repair,Completed,Returned',
            'remarks' => 'nullable|string',
        ];
    }
}
