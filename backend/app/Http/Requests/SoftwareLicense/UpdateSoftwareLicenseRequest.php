<?php

namespace App\Http\Requests\SoftwareLicense;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSoftwareLicenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'nullable|exists:employee,id',
            'position_id' => 'nullable|exists:position,id',
            'section_id' => 'nullable|exists:section,id',
            'branch_id' => 'nullable|exists:branch,id',
            'asset_category_id' => 'nullable|exists:asset_category,id',
            'operating_system' => 'nullable|string|max:255',
            'licensed' => 'nullable|string|max:255',
            'office_tool_id' => 'nullable|exists:office_tools,id',
            'client_access' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
        ];
    }
}
