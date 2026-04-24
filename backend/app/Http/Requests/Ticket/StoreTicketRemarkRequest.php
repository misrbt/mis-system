<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRemarkRequest extends FormRequest
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
            'remark' => 'nullable|string|max:2000',
            'remark_type' => 'nullable|in:general,status_change,assignment,system',
            'is_internal' => 'nullable|boolean',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpeg,jpg,png,gif,webp,mp4,mov,webm,quicktime|max:20480',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $hasText = trim((string) $this->input('remark')) !== '';
            $hasFiles = $this->hasFile('attachments');
            if (! $hasText && ! $hasFiles) {
                $v->errors()->add('remark', 'Please write a message or attach a photo/video.');
            }
        });
    }
}
