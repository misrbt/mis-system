<?php

namespace Tests\Feature;

use App\Mail\TicketEscalationMail;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Section;
use App\Models\Ticket;
use App\Models\TicketApprover;
use App\Models\TicketCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketEscalationTest extends TestCase
{
    use RefreshDatabase;

    private User $mis;

    protected function setUp(): void
    {
        parent::setUp();
        $this->mis = User::factory()->create([
            'username' => 'mis-'.uniqid(),
            'role' => 'user',
            'is_active' => true,
        ]);
        Sanctum::actingAs($this->mis);
    }

    private function makeRequester(): Employee
    {
        $branch = Branch::factory()->create();

        return Employee::factory()->create([
            'branch_id' => $branch->id,
            'position_id' => Position::factory()->create()->id,
            'department_id' => Section::factory()->create()->id,
        ]);
    }

    private function makeApprovedTicket(string $priority = 'Urgent'): Ticket
    {
        $requester = $this->makeRequester();
        $category = TicketCategory::factory()->create();

        return Ticket::create([
            'requester_employee_id' => $requester->id,
            'title' => 'Core banking down',
            'description' => 'Cannot process transactions',
            'category_id' => $category->id,
            'priority' => $priority,
            'priority_justification' => 'All branches impacted.',
            'status' => 'Open',
            'approval_status' => 'approved',
        ]);
    }

    public function test_escalate_sends_email_to_all_active_globals(): void
    {
        Mail::fake();

        TicketApprover::factory()->create([
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
            'email' => 'president@rbtbank.com',
        ]);
        TicketApprover::factory()->create([
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
            'email' => 'ceo@rbtbank.com',
        ]);
        TicketApprover::factory()->inactive()->create([
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
            'email' => 'retired-vp@rbtbank.com',
        ]);

        $ticket = $this->makeApprovedTicket('Urgent');

        $response = $this->postJson("/api/tickets/{$ticket->id}/escalate");

        $response->assertStatus(200);

        Mail::assertSent(TicketEscalationMail::class, function ($mail) {
            return $mail->hasTo('president@rbtbank.com')
                && $mail->hasTo('ceo@rbtbank.com')
                && ! $mail->hasTo('retired-vp@rbtbank.com');
        });
    }

    public function test_escalate_stamps_timestamp_and_user(): void
    {
        Mail::fake();

        TicketApprover::factory()->create([
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
            'email' => 'president@rbtbank.com',
        ]);

        $ticket = $this->makeApprovedTicket('High');

        $this->postJson("/api/tickets/{$ticket->id}/escalate")->assertStatus(200);

        $fresh = $ticket->fresh();
        $this->assertNotNull($fresh->escalated_at);
        $this->assertSame($this->mis->id, $fresh->escalated_by_user_id);
    }

    public function test_cannot_escalate_twice(): void
    {
        Mail::fake();

        TicketApprover::factory()->create([
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
            'email' => 'president@rbtbank.com',
        ]);

        $ticket = $this->makeApprovedTicket('Urgent');

        $this->postJson("/api/tickets/{$ticket->id}/escalate")->assertStatus(200);

        $response = $this->postJson("/api/tickets/{$ticket->id}/escalate");
        $response->assertStatus(422);

        // Still only one escalation email was sent.
        Mail::assertSent(TicketEscalationMail::class, 1);
    }

    public function test_cannot_escalate_medium_priority_ticket(): void
    {
        Mail::fake();

        TicketApprover::factory()->create([
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
            'email' => 'president@rbtbank.com',
        ]);

        $ticket = $this->makeApprovedTicket('Medium');

        $response = $this->postJson("/api/tickets/{$ticket->id}/escalate");
        $response->assertStatus(422);

        Mail::assertNothingSent();
    }

    public function test_cannot_escalate_when_no_global_configured(): void
    {
        Mail::fake();

        $ticket = $this->makeApprovedTicket('Urgent');

        $response = $this->postJson("/api/tickets/{$ticket->id}/escalate");
        $response->assertStatus(422);

        Mail::assertNothingSent();
    }

    public function test_escalate_writes_audit_log_row(): void
    {
        Mail::fake();

        TicketApprover::factory()->create([
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
            'email' => 'president@rbtbank.com',
        ]);

        $ticket = $this->makeApprovedTicket('Urgent');

        $this->postJson("/api/tickets/{$ticket->id}/escalate")->assertStatus(200);

        $this->assertDatabaseHas('helpdesk_audit_logs', [
            'ticket_id' => $ticket->id,
            'action' => 'ticket.escalated',
            'actor_id' => $this->mis->id,
        ]);
    }

    public function test_priority_change_writes_dedicated_audit_log_row(): void
    {
        $ticket = $this->makeApprovedTicket('Medium');

        $this->putJson("/api/tickets/{$ticket->id}", [
            'priority' => 'Urgent',
        ])->assertStatus(200);

        $this->assertDatabaseHas('helpdesk_audit_logs', [
            'ticket_id' => $ticket->id,
            'action' => 'ticket.priority_changed',
            'actor_id' => $this->mis->id,
        ]);
    }

    public function test_escalation_preview_returns_active_globals_only(): void
    {
        TicketApprover::factory()->create([
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
            'name' => 'President',
            'email' => 'president@rbtbank.com',
        ]);
        TicketApprover::factory()->inactive()->create([
            'is_global' => true,
            'branch_id' => null,
            'email' => 'retired@rbtbank.com',
        ]);

        $ticket = $this->makeApprovedTicket('Urgent');

        $response = $this->getJson("/api/tickets/{$ticket->id}/escalation-preview");

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.recipients'));
        $this->assertSame('president@rbtbank.com', $response->json('data.recipients.0.email'));
    }
}
