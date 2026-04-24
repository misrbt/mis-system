<?php

namespace App\Mail;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketEscalationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $ticketUrl;

    public function __construct(public Ticket $ticket, public ?User $forwardedBy = null)
    {
        $base = rtrim((string) config('services.helpdesk.frontend_url'), '/');
        $this->ticketUrl = $base.'/helpdesk/tickets/'.$ticket->id;
    }

    public function envelope(): Envelope
    {
        $prio = strtoupper((string) $this->ticket->priority);
        $number = $this->ticket->ticket_number;

        return new Envelope(
            subject: "[ESCALATION — {$prio}] Executive review: Ticket {$number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.ticket-escalation',
            with: [
                'ticket' => $this->ticket,
                'forwardedBy' => $this->forwardedBy,
                'ticketUrl' => $this->ticketUrl,
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
