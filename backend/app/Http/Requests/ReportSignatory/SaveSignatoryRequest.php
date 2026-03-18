<?php

namespace App\Http\Requests\ReportSignatory;

use Illuminate\Foundation\Http\FormRequest;

class SaveSignatoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'prepared_by_id' => 'nullable|exists:employee,id',
            'checked_by_id' => 'nullable|exists:employee,id',
            'noted_by_id' => 'nullable|exists:employee,id',
        ];
    }
}
