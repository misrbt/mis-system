<x-mail::message>
# Ticket approval needed — {{ strtoupper($ticket->priority) }} priority

A new helpdesk ticket has been submitted and needs your approval before it
reaches the IT team.

**Ticket number:** {{ $ticket->ticket_number }}
**Title:** {{ $ticket->title }}
**Priority:** {{ $ticket->priority }}
**Requester:** {{ optional($ticket->requester)->fullname ?? '—' }}
**Branch:** {{ optional(optional($ticket->requester)->branch)->branch_name ?? '—' }}
**Category:** {{ optional($ticket->category)->name ?? '—' }}
**Submitted at:** {{ $ticket->created_at?->format('Y-m-d H:i') }}

---

@if ($ticket->priority_justification)
**Why the requester flagged it {{ strtolower($ticket->priority) }}**

{{ $ticket->priority_justification }}

---

@endif
**Description**

{{ $ticket->description }}

<x-mail::button :url="$reviewUrl" color="primary">
Review & Approve / Reject
</x-mail::button>

Clicking the button opens the review page with full ticket details and two
buttons: **Approve** sends the ticket to the IT team immediately, **Reject**
records a reason and keeps the ticket hidden.

If the button does not work, copy and paste this URL into your browser:
{{ $reviewUrl }}

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
