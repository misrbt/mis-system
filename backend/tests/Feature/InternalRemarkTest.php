<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\TicketRemark;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InternalRemarkTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_post_internal_remark(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $ticket = Ticket::factory()->create();

        $response = $this->postJson("/api/tickets/{$ticket->id}/remarks", [
            'remark' => 'Only for IT eyes.',
            'is_internal' => true,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('ticket_remarks', [
            'ticket_id' => $ticket->id,
            'remark' => 'Only for IT eyes.',
            'is_internal' => true,
        ]);
    }

    public function test_public_track_endpoint_hides_internal_remarks(): void
    {
        $ticket = Ticket::factory()->create();

        TicketRemark::factory()->create([
            'ticket_id' => $ticket->id,
            'remark' => 'Public visible',
            'remark_type' => 'general',
            'is_internal' => false,
        ]);

        TicketRemark::factory()->create([
            'ticket_id' => $ticket->id,
            'remark' => 'Internal only',
            'remark_type' => 'general',
            'is_internal' => true,
        ]);

        $response = $this->getJson("/api/public/helpdesk/tickets/track/{$ticket->ticket_number}");

        $response->assertStatus(200);
        $remarks = collect($response->json('data.remarks'));

        $this->assertTrue($remarks->contains('remark', 'Public visible'));
        $this->assertFalse($remarks->contains('remark', 'Internal only'));
    }

    public function test_first_response_stamped_on_first_non_internal_staff_reply(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $ticket = Ticket::factory()->create();
        $this->assertNull($ticket->first_response_at);

        // Internal note should NOT stamp first response.
        $this->postJson("/api/tickets/{$ticket->id}/remarks", [
            'remark' => 'Internal note',
            'is_internal' => true,
        ])->assertStatus(201);

        $this->assertNull($ticket->fresh()->first_response_at);

        // First public reply should stamp it.
        $this->postJson("/api/tickets/{$ticket->id}/remarks", [
            'remark' => 'Hello, looking into it.',
            'is_internal' => false,
        ])->assertStatus(201);

        $this->assertNotNull($ticket->fresh()->first_response_at);
    }
}
