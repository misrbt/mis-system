<?php

namespace Tests\Unit\Services;

use App\Models\Asset;
use App\Models\AssetMovement;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use App\Services\BranchTransitionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class BranchTransitionServiceTest extends TestCase
{
    use RefreshDatabase;

    protected BranchTransitionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new BranchTransitionService;

        // Create and authenticate a user
        $user = User::factory()->create();
        Auth::login($user);
    }

    public function test_employee_moving_to_empty_workstation_gets_assets(): void
    {
        // Arrange
        $branch1 = Branch::factory()->create(['branch_name' => 'Branch 1']);
        $branch2 = Branch::factory()->create(['branch_name' => 'Branch 2']);
        $position = Position::factory()->create(['title' => 'Manager']);

        $employeeA = Employee::factory()->create([
            'fullname' => 'Employee A',
            'branch_id' => $branch1->id,
            'position_id' => $position->id,
        ]);

        // Asset at Branch 2 (currently unassigned)
        $assetAtBranch2 = Asset::factory()->create([
            'asset_tag' => 'ASSET-B2',
            'workstation_branch_id' => $branch2->id,
            'workstation_position_id' => $position->id,
            'assigned_to_employee_id' => null,
        ]);

        // Asset at Branch 1 (assigned to Employee A)
        $assetAtBranch1 = Asset::factory()->create([
            'asset_tag' => 'ASSET-B1',
            'workstation_branch_id' => $branch1->id,
            'workstation_position_id' => $position->id,
            'assigned_to_employee_id' => $employeeA->id,
        ]);

        // Act: Move Employee A from Branch 1 to Branch 2
        $result = $this->service->execute([
            [
                'employee_id' => $employeeA->id,
                'to_branch_id' => $branch2->id,
                'to_position_id' => $position->id,
            ],
        ], 'Test transition');

        // Assert
        $employeeA->refresh();
        $assetAtBranch2->refresh();
        $assetAtBranch1->refresh();

        // Employee A should be at Branch 2
        $this->assertEquals($branch2->id, $employeeA->branch_id);

        // Asset at Branch 2 should be assigned to Employee A
        $this->assertEquals($employeeA->id, $assetAtBranch2->assigned_to_employee_id);

        // Asset at Branch 1 should be unassigned (no one moving there)
        $this->assertNull($assetAtBranch1->assigned_to_employee_id);

        // Should have 2 asset movements (1 for assignment, 1 for unassignment)
        $this->assertEquals(2, AssetMovement::count());
    }

    public function test_employee_swap_exchanges_assets_correctly(): void
    {
        // Arrange
        $branch1 = Branch::factory()->create(['branch_name' => 'Branch 1']);
        $branch2 = Branch::factory()->create(['branch_name' => 'Branch 2']);
        $position = Position::factory()->create(['title' => 'Manager']);

        $employeeA = Employee::factory()->create([
            'fullname' => 'Employee A',
            'branch_id' => $branch1->id,
            'position_id' => $position->id,
        ]);

        $employeeB = Employee::factory()->create([
            'fullname' => 'Employee B',
            'branch_id' => $branch2->id,
            'position_id' => $position->id,
        ]);

        $assetAtBranch1 = Asset::factory()->create([
            'asset_tag' => 'ASSET-B1',
            'workstation_branch_id' => $branch1->id,
            'workstation_position_id' => $position->id,
            'assigned_to_employee_id' => $employeeA->id,
        ]);

        $assetAtBranch2 = Asset::factory()->create([
            'asset_tag' => 'ASSET-B2',
            'workstation_branch_id' => $branch2->id,
            'workstation_position_id' => $position->id,
            'assigned_to_employee_id' => $employeeB->id,
        ]);

        // Act: Swap Employee A and Employee B
        $result = $this->service->execute([
            [
                'employee_id' => $employeeA->id,
                'to_branch_id' => $branch2->id,
                'to_position_id' => $position->id,
            ],
            [
                'employee_id' => $employeeB->id,
                'to_branch_id' => $branch1->id,
                'to_position_id' => $position->id,
            ],
        ], 'Swap employees');

        // Assert
        $employeeA->refresh();
        $employeeB->refresh();
        $assetAtBranch1->refresh();
        $assetAtBranch2->refresh();

        // Employees should have swapped locations
        $this->assertEquals($branch2->id, $employeeA->branch_id);
        $this->assertEquals($branch1->id, $employeeB->branch_id);

        // Assets should stay at workstations but assigned to new employees
        $this->assertEquals($employeeB->id, $assetAtBranch1->assigned_to_employee_id);
        $this->assertEquals($employeeA->id, $assetAtBranch2->assigned_to_employee_id);

        // Should have 2 asset movements (one for each reassignment)
        $this->assertEquals(2, AssetMovement::count());

        // Result should show 2 assets reassigned
        $this->assertEquals(2, $result['assets_reassigned']);
    }

    public function test_circular_rotation_reassigns_assets_correctly(): void
    {
        // Arrange
        $branch1 = Branch::factory()->create();
        $branch2 = Branch::factory()->create();
        $branch3 = Branch::factory()->create();
        $position = Position::factory()->create();

        $empA = Employee::factory()->create(['branch_id' => $branch1->id, 'position_id' => $position->id]);
        $empB = Employee::factory()->create(['branch_id' => $branch2->id, 'position_id' => $position->id]);
        $empC = Employee::factory()->create(['branch_id' => $branch3->id, 'position_id' => $position->id]);

        $asset1 = Asset::factory()->create([
            'workstation_branch_id' => $branch1->id,
            'workstation_position_id' => $position->id,
            'assigned_to_employee_id' => $empA->id,
        ]);

        $asset2 = Asset::factory()->create([
            'workstation_branch_id' => $branch2->id,
            'workstation_position_id' => $position->id,
            'assigned_to_employee_id' => $empB->id,
        ]);

        $asset3 = Asset::factory()->create([
            'workstation_branch_id' => $branch3->id,
            'workstation_position_id' => $position->id,
            'assigned_to_employee_id' => $empC->id,
        ]);

        // Act: A → B → C → A (circular rotation)
        $result = $this->service->execute([
            ['employee_id' => $empA->id, 'to_branch_id' => $branch2->id, 'to_position_id' => $position->id],
            ['employee_id' => $empB->id, 'to_branch_id' => $branch3->id, 'to_position_id' => $position->id],
            ['employee_id' => $empC->id, 'to_branch_id' => $branch1->id, 'to_position_id' => $position->id],
        ], 'Circular rotation');

        // Assert
        $empA->refresh();
        $empB->refresh();
        $empC->refresh();
        $asset1->refresh();
        $asset2->refresh();
        $asset3->refresh();

        // Employees rotated
        $this->assertEquals($branch2->id, $empA->branch_id);
        $this->assertEquals($branch3->id, $empB->branch_id);
        $this->assertEquals($branch1->id, $empC->branch_id);

        // Assets reassigned to incoming employees
        $this->assertEquals($empC->id, $asset1->assigned_to_employee_id); // C moves to branch 1
        $this->assertEquals($empA->id, $asset2->assigned_to_employee_id); // A moves to branch 2
        $this->assertEquals($empB->id, $asset3->assigned_to_employee_id); // B moves to branch 3

        $this->assertEquals(3, $result['assets_reassigned']);
    }

    public function test_returns_correct_result_structure(): void
    {
        // Arrange
        $branch1 = Branch::factory()->create();
        $branch2 = Branch::factory()->create();
        $position = Position::factory()->create();

        $employee = Employee::factory()->create([
            'branch_id' => $branch1->id,
            'position_id' => $position->id,
        ]);

        // Act
        $result = $this->service->execute([
            [
                'employee_id' => $employee->id,
                'to_branch_id' => $branch2->id,
                'to_position_id' => $position->id,
            ],
        ]);

        // Assert
        $this->assertArrayHasKey('employees', $result);
        $this->assertArrayHasKey('assets_reassigned', $result);
        $this->assertArrayHasKey('batch_id', $result);

        $this->assertIsArray($result['employees']);
        $this->assertIsInt($result['assets_reassigned']);
        $this->assertIsString($result['batch_id']);

        $this->assertCount(1, $result['employees']);
        $this->assertEquals($employee->id, $result['employees'][0]['employee_id']);
        $this->assertEquals($branch1->id, $result['employees'][0]['from_branch_id']);
        $this->assertEquals($branch2->id, $result['employees'][0]['to_branch_id']);
    }
}
