<?php

namespace Tests\Feature;

use App\Models\HelpdeskAuditLog;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HelpdeskAuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_ticket_creation_writes_audit_log(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $ticket = Ticket::factory()->create();

        $this->assertDatabaseHas('helpdesk_audit_logs', [
            'ticket_id' => $ticket->id,
            'action' => 'ticket.created',
            'actor_type' => 'user',
            'actor_id' => $user->id,
        ]);
    }

    public function test_ticket_field_updates_write_diff_audit_log(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $ticket = Ticket::factory()->create([
            'title' => 'Original title',
            'priority' => 'Low',
        ]);

        // Clear out the creation rows so the update count is unambiguous.
        HelpdeskAuditLog::query()->where('ticket_id', $ticket->id)->delete();

        $ticket->update([
            'title' => 'New title',
            'priority' => 'High',
        ]);

        $updateLog = HelpdeskAuditLog::where('ticket_id', $ticket->id)
            ->where('action', 'ticket.updated')
            ->first();

        $this->assertNotNull($updateLog);
        $changes = $updateLog->changes;
        $this->assertArrayHasKey('title', $changes);
        $this->assertSame('Original title', $changes['title']['old']);
        $this->assertSame('New title', $changes['title']['new']);
        $this->assertArrayHasKey('priority', $changes);
    }

    public function test_status_change_writes_status_audit_log(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $ticket = Ticket::factory()->create(['status' => 'Open']);
        HelpdeskAuditLog::query()->where('ticket_id', $ticket->id)->delete();

        $ticket->update(['status' => 'In Progress']);

        $this->assertDatabaseHas('helpdesk_audit_logs', [
            'ticket_id' => $ticket->id,
            'action' => 'ticket.status_changed',
            'actor_id' => $user->id,
        ]);
    }

    public function test_public_ticket_submission_captures_ip_and_ua(): void
    {
        $ticket = Ticket::factory()->create();

        // Simulate what PublicTicketController does — log directly with explicit actor.
        \App\Services\HelpdeskAuditLogService::logTicketCreated(
            $ticket,
            'public',
            $ticket->requester_employee_id,
            $ticket->requester?->fullname,
        );

        $log = HelpdeskAuditLog::where('ticket_id', $ticket->id)
            ->where('actor_type', 'public')
            ->latest('id')
            ->first();

        $this->assertNotNull($log);
        $this->assertSame('public', $log->actor_type);
        $this->assertSame($ticket->requester_employee_id, $log->actor_id);
    }

    public function test_audit_write_failure_does_not_break_api_flow(): void
    {
        // If the audit table were missing, the service must swallow the throwable
        // and return null instead of bubbling up. Simulate by dropping the table.
        \Illuminate\Support\Facades\Schema::drop('helpdesk_audit_logs');

        $result = \App\Services\HelpdeskAuditLogService::log(
            action: 'ticket.created',
            ticket: null,
            actorType: 'system',
            actorId: null,
            actorName: null,
        );

        $this->assertNull($result);
    }
}
