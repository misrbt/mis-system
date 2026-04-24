<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
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
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'contact_number' => 'nullable|string|max:50',
            'anydesk_number' => 'nullable|string|max:50',
            'category_id' => 'sometimes|required|exists:ticket_categories,id',
            'priority' => 'sometimes|required|in:Low,Medium,High,Urgent',
            'status' => 'sometimes|required|in:Open,In Progress,Pending,Resolved,Closed,Cancelled',
            'requester_employee_id' => 'sometimes|required|exists:employee,id',
            'assigned_to_user_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'resolution_summary' => 'nullable|string',
        ];
    }
}
