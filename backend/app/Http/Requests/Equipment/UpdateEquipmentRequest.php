<?php

namespace App\Http\Requests\Equipment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'brand_id' => 'nullable|integer|exists:brands,id',
            'equipment_model_id' => 'nullable|integer|exists:equipment_models,id',
            'description' => 'nullable|string',
            'asset_category_id' => 'nullable|exists:asset_category,id',
            'subcategory_id' => 'nullable|exists:asset_subcategories,id',
            'specifications' => 'nullable|array',
        ];
    }
}
