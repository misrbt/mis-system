<?php

namespace App\Http\Requests\Repair;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRepairRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_id' => 'sometimes|required|exists:assets,id',
            'vendor_id' => 'sometimes|required|exists:vendors,id',
            'description' => 'sometimes|required|string',
            'repair_date' => 'sometimes|required|date',
            'expected_return_date' => 'sometimes|required|date|after_or_equal:repair_date',
            'actual_return_date' => 'nullable|date|after_or_equal:repair_date',
            'repair_cost' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:Pending,In Repair,Completed,Returned',
            'remarks' => 'nullable|string',
        ];
    }
}
