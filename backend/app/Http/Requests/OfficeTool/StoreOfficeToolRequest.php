<?php

namespace App\Http\Requests\OfficeTool;

use Illuminate\Foundation\Http\FormRequest;

class StoreOfficeToolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:office_tools,name',
            'version' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ];
    }
}
