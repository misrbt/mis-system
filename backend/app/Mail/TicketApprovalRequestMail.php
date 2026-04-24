<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketApprovalRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $reviewUrl;

    public function __construct(public Ticket $ticket)
    {
        $base = rtrim((string) config('services.helpdesk.frontend_url'), '/');
        // Public-helpdesk path keeps the approver OUT of the authenticated
        // admin routes. The page there is token-gated, no login required.
        $this->reviewUrl = $base.'/public-helpdesk/approval/'.$ticket->approval_token;
    }

    public function envelope(): Envelope
    {
        $prio = strtoupper((string) $this->ticket->priority);
        $number = $this->ticket->ticket_number;

        return new Envelope(
            subject: "[{$prio}] Approval needed: Ticket {$number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.ticket-approval',
            with: [
                'ticket' => $this->ticket,
                'reviewUrl' => $this->reviewUrl,
            ],
        );
    }

    /**
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
