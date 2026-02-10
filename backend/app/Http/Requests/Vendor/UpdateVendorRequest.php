<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVendorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $vendorId = $this->route('vendor');

        return [
            'company_name' => 'required|string|max:255|unique:vendors,company_name,'.$vendorId,
            'contact_no' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
        ];
    }
}
