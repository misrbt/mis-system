<?php

namespace App\Http\Requests\TicketApprover;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketApproverRequest extends FormRequest
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
        $isGlobal = $this->boolean('is_global');

        return [
            'employee_id' => 'nullable|integer|exists:employee,id',
            'name' => 'required|string|max:150',
            'email' => 'required|email:rfc|max:190',
            'is_global' => 'nullable|boolean',
            'branch_id' => [
                $isGlobal ? 'nullable' : 'required',
                'integer',
                'exists:branch,id',
            ],
            'obo_id' => $isGlobal ? ['nullable'] : [
                'nullable',
                'integer',
                Rule::exists('branch_obos', 'id')->where(fn ($q) => $q->where('branch_id', $this->input('branch_id'))),
                Rule::unique('ticket_approvers', 'obo_id')->where(fn ($q) => $q->where('branch_id', $this->input('branch_id'))),
            ],
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0|max:65535',
        ];
    }

    public function messages(): array
    {
        return [
            'obo_id.exists' => 'The selected OBO does not belong to the chosen branch.',
            'obo_id.unique' => 'An approver is already configured for this branch and OBO combination.',
            'branch_id.required' => 'A branch is required for branch-scoped approvers. Toggle "Global approver" to skip.',
        ];
    }

    /**
     * Enforce "one branch-only approver per branch" for non-global rows
     * (Laravel's unique rule ignores NULL values). Globals are exempt —
     * multiple global approvers (e.g., President + VP) are allowed.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->boolean('is_global')) {
                return;
            }
            if ($this->filled('branch_id') && $this->input('obo_id') === null) {
                $exists = \App\Models\TicketApprover::query()
                    ->where('is_global', false)
                    ->where('branch_id', $this->input('branch_id'))
                    ->whereNull('obo_id')
                    ->exists();
                if ($exists) {
                    $validator->errors()->add(
                        'branch_id',
                        'A branch-level approver is already configured for this branch.'
                    );
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        // When is_global is toggled on, strip branch/obo from the payload so
        // downstream code never treats a "global" row as branch-scoped.
        if ($this->boolean('is_global')) {
            $this->merge([
                'branch_id' => null,
                'obo_id' => null,
            ]);
        }
    }
}
