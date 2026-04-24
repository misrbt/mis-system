<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\BranchObo;
use App\Models\Employee;
use App\Models\Position;
use App\Models\TicketApprover;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketApproverCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Sanctum::actingAs(User::factory()->create([
            'username' => 'approver-test-'.uniqid(),
            'role' => 'user',
            'is_active' => true,
        ]));
    }

    public function test_list_returns_active_by_default(): void
    {
        $branch1 = Branch::factory()->create();
        $branch2 = Branch::factory()->create();
        TicketApprover::factory()->create(['branch_id' => $branch1->id]);
        TicketApprover::factory()->inactive()->create(['branch_id' => $branch2->id]);

        $response = $this->getJson('/api/ticket-approvers');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_list_with_all_flag_includes_inactive(): void
    {
        $branch1 = Branch::factory()->create();
        $branch2 = Branch::factory()->create();
        TicketApprover::factory()->create(['branch_id' => $branch1->id]);
        TicketApprover::factory()->inactive()->create(['branch_id' => $branch2->id]);

        $response = $this->getJson('/api/ticket-approvers?all=1');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_can_create_branch_level_approver(): void
    {
        $branch = Branch::factory()->create();

        $response = $this->postJson('/api/ticket-approvers', [
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@rbtbank.com',
            'branch_id' => $branch->id,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('ticket_approvers', [
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@rbtbank.com',
            'branch_id' => $branch->id,
            'obo_id' => null,
        ]);
    }

    public function test_cannot_create_duplicate_branch_only_approver(): void
    {
        $branch = Branch::factory()->create();
        TicketApprover::factory()->create([
            'branch_id' => $branch->id,
            'obo_id' => null,
        ]);

        $response = $this->postJson('/api/ticket-approvers', [
            'name' => 'Second Person',
            'email' => 'second@rbtbank.com',
            'branch_id' => $branch->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_cannot_create_duplicate_branch_obo_approver(): void
    {
        $branch = Branch::factory()->create();
        $obo = BranchObo::create(['branch_id' => $branch->id, 'name' => 'Loans']);

        TicketApprover::factory()->create([
            'branch_id' => $branch->id,
            'obo_id' => $obo->id,
        ]);

        $response = $this->postJson('/api/ticket-approvers', [
            'name' => 'Second Person',
            'email' => 'second@rbtbank.com',
            'branch_id' => $branch->id,
            'obo_id' => $obo->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_rejects_obo_that_does_not_belong_to_branch(): void
    {
        $branchA = Branch::factory()->create();
        $branchB = Branch::factory()->create();
        $oboOnB = BranchObo::create(['branch_id' => $branchB->id, 'name' => 'Loans']);

        $response = $this->postJson('/api/ticket-approvers', [
            'name' => 'Cross Branch',
            'email' => 'cross@rbtbank.com',
            'branch_id' => $branchA->id,
            'obo_id' => $oboOnB->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_can_update_approver(): void
    {
        $branch = Branch::factory()->create();
        $approver = TicketApprover::factory()->create(['branch_id' => $branch->id, 'obo_id' => null]);

        $response = $this->putJson("/api/ticket-approvers/{$approver->id}", [
            'name' => 'New Name',
            'email' => 'new@rbtbank.com',
            'branch_id' => $branch->id,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('ticket_approvers', [
            'id' => $approver->id,
            'name' => 'New Name',
            'email' => 'new@rbtbank.com',
        ]);
    }

    public function test_can_toggle_active(): void
    {
        $branch = Branch::factory()->create();
        $approver = TicketApprover::factory()->create(['branch_id' => $branch->id]);

        $response = $this->patchJson("/api/ticket-approvers/{$approver->id}/toggle-active");

        $response->assertStatus(200);
        $this->assertFalse($approver->fresh()->is_active);
    }

    public function test_can_delete_approver(): void
    {
        $branch = Branch::factory()->create();
        $approver = TicketApprover::factory()->create(['branch_id' => $branch->id]);

        $response = $this->deleteJson("/api/ticket-approvers/{$approver->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('ticket_approvers', ['id' => $approver->id]);
    }

    public function test_can_create_global_approver_without_branch(): void
    {
        $response = $this->postJson('/api/ticket-approvers', [
            'name' => 'President',
            'email' => 'president@rbtbank.com',
            'is_global' => true,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('ticket_approvers', [
            'name' => 'President',
            'email' => 'president@rbtbank.com',
            'is_global' => true,
            'branch_id' => null,
            'obo_id' => null,
        ]);
    }

    public function test_branch_required_for_non_global_approver(): void
    {
        $response = $this->postJson('/api/ticket-approvers', [
            'name' => 'Floating',
            'email' => 'floating@rbtbank.com',
            // no is_global, no branch_id
        ]);

        $response->assertStatus(422);
    }

    public function test_multiple_global_approvers_are_allowed(): void
    {
        TicketApprover::factory()->create([
            'is_global' => true,
            'branch_id' => null,
            'email' => 'president@rbtbank.com',
        ]);

        $response = $this->postJson('/api/ticket-approvers', [
            'name' => 'CEO',
            'email' => 'ceo@rbtbank.com',
            'is_global' => true,
        ]);

        $response->assertStatus(201);
        $this->assertSame(2, TicketApprover::where('is_global', true)->count());
    }

    public function test_managers_endpoint_returns_employees_with_manager_position(): void
    {
        $manager = Position::factory()->create(['title' => 'Branch Manager']);
        $clerk = Position::factory()->create(['title' => 'Teller']);

        $branch = Branch::factory()->create();
        $section = \App\Models\Section::factory()->create();

        Employee::factory()->count(2)->create([
            'branch_id' => $branch->id,
            'position_id' => $manager->id,
            'department_id' => $section->id,
        ]);
        Employee::factory()->count(3)->create([
            'branch_id' => $branch->id,
            'position_id' => $clerk->id,
            'department_id' => $section->id,
        ]);

        $response = $this->getJson('/api/ticket-approvers/managers');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }
}
