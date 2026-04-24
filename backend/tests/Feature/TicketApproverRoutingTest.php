<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\BranchObo;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Section;
use App\Models\TicketApprover;
use App\Services\TicketApproverResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketApproverRoutingTest extends TestCase
{
    use RefreshDatabase;

    private function makeEmployee(Branch $branch, ?BranchObo $obo = null): Employee
    {
        return Employee::factory()->create([
            'branch_id' => $branch->id,
            'obo_id' => $obo?->id,
            'position_id' => Position::factory()->create()->id,
            'department_id' => Section::factory()->create()->id,
        ]);
    }

    public function test_resolves_branch_plus_obo_match_over_branch_only(): void
    {
        $branch = Branch::factory()->create();
        $obo = BranchObo::create(['branch_id' => $branch->id, 'name' => 'Loans']);

        $branchLevel = TicketApprover::factory()->create([
            'branch_id' => $branch->id,
            'obo_id' => null,
            'email' => 'branch@rbtbank.com',
        ]);
        $oboLevel = TicketApprover::factory()->create([
            'branch_id' => $branch->id,
            'obo_id' => $obo->id,
            'email' => 'obo@rbtbank.com',
        ]);

        $requester = $this->makeEmployee($branch, $obo);

        $hit = app(TicketApproverResolver::class)->resolve($requester);

        $this->assertNotNull($hit);
        $this->assertSame($oboLevel->id, $hit->id);
    }

    public function test_falls_back_to_branch_only_when_no_obo_match(): void
    {
        $branch = Branch::factory()->create();
        $obo = BranchObo::create(['branch_id' => $branch->id, 'name' => 'Loans']);

        $branchLevel = TicketApprover::factory()->create([
            'branch_id' => $branch->id,
            'obo_id' => null,
            'email' => 'branch@rbtbank.com',
        ]);

        $requester = $this->makeEmployee($branch, $obo);

        $hit = app(TicketApproverResolver::class)->resolve($requester);

        $this->assertNotNull($hit);
        $this->assertSame($branchLevel->id, $hit->id);
    }

    public function test_cascades_to_parent_branch_when_sub_branch_has_no_rule(): void
    {
        $parent = Branch::factory()->create();
        $sub = Branch::factory()->create(['parent_branch_id' => $parent->id]);

        $parentApprover = TicketApprover::factory()->create([
            'branch_id' => $parent->id,
            'obo_id' => null,
            'email' => 'parent@rbtbank.com',
        ]);

        $requester = $this->makeEmployee($sub);

        $hit = app(TicketApproverResolver::class)->resolve($requester);

        $this->assertNotNull($hit);
        $this->assertSame($parentApprover->id, $hit->id);
    }

    public function test_returns_null_when_no_rule_matches_anywhere(): void
    {
        $branch = Branch::factory()->create();
        $requester = $this->makeEmployee($branch);

        $hit = app(TicketApproverResolver::class)->resolve($requester);

        $this->assertNull($hit);
    }

    public function test_ignores_inactive_approvers(): void
    {
        $branch = Branch::factory()->create();
        TicketApprover::factory()->inactive()->create([
            'branch_id' => $branch->id,
            'obo_id' => null,
        ]);

        $requester = $this->makeEmployee($branch);

        $hit = app(TicketApproverResolver::class)->resolve($requester);

        $this->assertNull($hit);
    }

    public function test_parent_cascade_survives_cycle_in_parent_branch_id(): void
    {
        // Create two branches where each is the other's parent (data bug).
        $a = Branch::factory()->create();
        $b = Branch::factory()->create(['parent_branch_id' => $a->id]);
        $a->parent_branch_id = $b->id;
        $a->save();

        $requester = $this->makeEmployee($b);

        // Neither branch has an approver. The resolver must not spin forever.
        $hit = app(TicketApproverResolver::class)->resolve($requester);

        $this->assertNull($hit);
    }

    public function test_public_submit_blocked_when_no_branch_approver_exists(): void
    {
        $branch = Branch::factory()->create();
        $requester = $this->makeEmployee($branch);
        $category = \App\Models\TicketCategory::factory()->create();

        $response = $this->postJson('/api/public/helpdesk/tickets', [
            'requester_employee_id' => $requester->id,
            'title' => 'Server down',
            'description' => 'Cannot reach the app',
            'category_id' => $category->id,
            'priority' => 'High',
            'priority_justification' => 'Blocking 20 tellers.',
            'attachments' => [
                \Illuminate\Http\Testing\File::image('screenshot.png'),
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
        $this->assertDatabaseMissing('tickets', ['title' => 'Server down']);
    }

    public function test_public_submit_blocked_when_only_a_global_approver_exists(): void
    {
        // Globals are NO LONGER auto-CC'd on submission — they're notified
        // manually by MIS via the escalation flow. So a global alone is not
        // enough to route a High/Urgent submission; a branch approver must
        // still exist in the cascade.
        $branch = Branch::factory()->create();
        $requester = $this->makeEmployee($branch);
        $category = \App\Models\TicketCategory::factory()->create();

        TicketApprover::factory()->create([
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
            'email' => 'president@rbtbank.com',
        ]);

        $response = $this->postJson('/api/public/helpdesk/tickets', [
            'requester_employee_id' => $requester->id,
            'title' => 'System outage',
            'description' => 'All branches offline',
            'category_id' => $category->id,
            'priority' => 'Urgent',
            'priority_justification' => 'Business stopped.',
            'attachments' => [
                \Illuminate\Http\Testing\File::image('screenshot.png'),
            ],
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('tickets', ['title' => 'System outage']);
    }

    public function test_public_submit_sends_only_to_branch_approver_not_globals(): void
    {
        \Illuminate\Support\Facades\Mail::fake();

        $branch = Branch::factory()->create();
        $requester = $this->makeEmployee($branch);
        $category = \App\Models\TicketCategory::factory()->create();

        TicketApprover::factory()->create([
            'branch_id' => $branch->id,
            'obo_id' => null,
            'email' => 'mgr@rbtbank.com',
        ]);
        TicketApprover::factory()->create([
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
            'email' => 'president@rbtbank.com',
        ]);

        $response = $this->postJson('/api/public/helpdesk/tickets', [
            'requester_employee_id' => $requester->id,
            'title' => 'Urgent issue',
            'description' => 'Something broke',
            'category_id' => $category->id,
            'priority' => 'Urgent',
            'priority_justification' => 'Impacting customers.',
            'attachments' => [
                \Illuminate\Http\Testing\File::image('screenshot.png'),
            ],
        ]);

        $response->assertStatus(201);

        \Illuminate\Support\Facades\Mail::assertSent(
            \App\Mail\TicketApprovalRequestMail::class,
            fn ($mail) => $mail->hasTo('mgr@rbtbank.com')
                && ! $mail->hasTo('president@rbtbank.com'),
        );
    }

    public function test_public_submit_uses_resolved_approver_email(): void
    {
        \Illuminate\Support\Facades\Mail::fake();

        $branch = Branch::factory()->create();
        $requester = $this->makeEmployee($branch);
        $category = \App\Models\TicketCategory::factory()->create();

        $approver = TicketApprover::factory()->create([
            'branch_id' => $branch->id,
            'obo_id' => null,
            'email' => 'branch-mgr@rbtbank.com',
        ]);

        $response = $this->postJson('/api/public/helpdesk/tickets', [
            'requester_employee_id' => $requester->id,
            'title' => 'Urgent outage',
            'description' => 'CBS is offline',
            'category_id' => $category->id,
            'priority' => 'Urgent',
            'priority_justification' => 'All branches offline.',
            'attachments' => [
                \Illuminate\Http\Testing\File::image('screenshot.png'),
            ],
        ]);

        $response->assertStatus(201);

        $ticket = \App\Models\Ticket::where('title', 'Urgent outage')->first();
        $this->assertNotNull($ticket);
        $this->assertSame('branch-mgr@rbtbank.com', $ticket->approver_email);
        $this->assertSame('pending', $ticket->approval_status);

        \Illuminate\Support\Facades\Mail::assertSent(
            \App\Mail\TicketApprovalRequestMail::class,
            fn ($mail) => $mail->hasTo('branch-mgr@rbtbank.com'),
        );
    }

    public function test_public_submit_medium_priority_does_not_require_approver(): void
    {
        $branch = Branch::factory()->create();
        $requester = $this->makeEmployee($branch);
        $category = \App\Models\TicketCategory::factory()->create();

        $response = $this->postJson('/api/public/helpdesk/tickets', [
            'requester_employee_id' => $requester->id,
            'title' => 'Minor issue',
            'description' => 'Slow printer',
            'category_id' => $category->id,
            'priority' => 'Medium',
            'attachments' => [
                \Illuminate\Http\Testing\File::image('screenshot.png'),
            ],
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tickets', [
            'title' => 'Minor issue',
            'approval_status' => null,
        ]);
    }
}
