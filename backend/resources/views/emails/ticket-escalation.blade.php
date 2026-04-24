<x-mail::message>
# Ticket escalated for executive review — {{ strtoupper($ticket->priority) }} priority

The MIS team has forwarded this helpdesk ticket for your review and awareness.

**Ticket number:** {{ $ticket->ticket_number }}
**Title:** {{ $ticket->title }}
**Priority:** {{ $ticket->priority }}
**Status:** {{ $ticket->status }}
**Requester:** {{ optional($ticket->requester)->fullname ?? '—' }}
**Branch:** {{ optional(optional($ticket->requester)->branch)->branch_name ?? '—' }}
**Category:** {{ optional($ticket->category)->name ?? '—' }}
**Submitted at:** {{ $ticket->created_at?->format('Y-m-d H:i') }}
@if ($forwardedBy)
**Forwarded by:** {{ $forwardedBy->name }} ({{ now()->format('Y-m-d H:i') }})
@endif

---

@if ($ticket->priority_justification)
**Why the requester flagged it {{ strtolower($ticket->priority) }}**

{{ $ticket->priority_justification }}

---

@endif
**Description**

{{ $ticket->description }}

<x-mail::button :url="$ticketUrl" color="primary">
Open ticket
</x-mail::button>

You are receiving this because you are configured as a global approver in the
helpdesk system. This is an informational forward — no action is required in
the system; the ticket is already approved and being handled by the IT team.

If the button does not work, copy and paste this URL into your browser:
{{ $ticketUrl }}

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
