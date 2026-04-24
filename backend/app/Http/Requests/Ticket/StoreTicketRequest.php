<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'contact_number' => 'nullable|string|max:50',
            'anydesk_number' => 'nullable|string|max:50',
            'category_id' => 'required|exists:ticket_categories,id',
            'priority' => 'required|in:Low,Medium,High,Urgent',
            'status' => 'nullable|in:Open,In Progress,Pending,Resolved,Closed,Cancelled',
            'requester_employee_id' => 'required|exists:employee,id',
            'assigned_to_user_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'resolution_summary' => 'nullable|string',
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'file|mimes:jpeg,jpg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt,log,zip|max:10240',
        ];
    }
}
