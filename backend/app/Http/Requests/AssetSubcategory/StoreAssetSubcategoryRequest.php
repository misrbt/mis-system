<?php

namespace App\Http\Requests\AssetSubcategory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssetSubcategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:asset_category,id',
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('asset_subcategories')->where(function ($query) {
                    return $query->where('category_id', $this->category_id);
                }),
            ],
            'description' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A subcategory with this name already exists in this category.',
        ];
    }
}
