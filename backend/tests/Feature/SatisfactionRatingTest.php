<?php

namespace Tests\Feature;

use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SatisfactionRatingTest extends TestCase
{
    use RefreshDatabase;

    public function test_requester_can_submit_rating_on_resolved_ticket(): void
    {
        $ticket = Ticket::factory()->resolved()->create();

        $response = $this->patchJson("/api/public/helpdesk/tickets/track/{$ticket->ticket_number}/rating", [
            'rating' => 4,
            'comment' => 'Good job!',
        ]);

        $response->assertStatus(200);

        $fresh = $ticket->fresh();
        $this->assertSame(4, $fresh->satisfaction_rating);
        $this->assertSame('Good job!', $fresh->satisfaction_comment);
        $this->assertNotNull($fresh->satisfaction_submitted_at);

        $this->assertDatabaseHas('helpdesk_audit_logs', [
            'ticket_id' => $ticket->id,
            'action' => 'satisfaction.submitted',
        ]);
    }

    public function test_rating_rejected_when_ticket_still_open(): void
    {
        $ticket = Ticket::factory()->create(['status' => 'Open']);

        $response = $this->patchJson("/api/public/helpdesk/tickets/track/{$ticket->ticket_number}/rating", [
            'rating' => 5,
        ]);

        $response->assertStatus(422);
        $this->assertNull($ticket->fresh()->satisfaction_rating);
    }

    public function test_cannot_submit_rating_twice(): void
    {
        $ticket = Ticket::factory()->resolved()->create();

        $this->patchJson("/api/public/helpdesk/tickets/track/{$ticket->ticket_number}/rating", [
            'rating' => 5,
        ])->assertStatus(200);

        $second = $this->patchJson("/api/public/helpdesk/tickets/track/{$ticket->ticket_number}/rating", [
            'rating' => 1,
        ]);

        $second->assertStatus(422);
        $this->assertSame(5, $ticket->fresh()->satisfaction_rating);
    }

    public function test_rating_must_be_within_range(): void
    {
        $ticket = Ticket::factory()->resolved()->create();

        $this->patchJson("/api/public/helpdesk/tickets/track/{$ticket->ticket_number}/rating", [
            'rating' => 6,
        ])->assertStatus(422);

        $this->patchJson("/api/public/helpdesk/tickets/track/{$ticket->ticket_number}/rating", [
            'rating' => 0,
        ])->assertStatus(422);
    }
}
