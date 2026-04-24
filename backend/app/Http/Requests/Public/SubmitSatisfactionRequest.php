<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class SubmitSatisfactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'rating.required' => 'Please select a rating from 1 to 5.',
            'rating.integer' => 'Rating must be a number between 1 and 5.',
            'rating.between' => 'Rating must be between 1 and 5.',
            'comment.max' => 'Comment cannot exceed 1000 characters.',
        ];
    }
}
