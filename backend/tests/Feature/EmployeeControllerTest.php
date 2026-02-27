<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmployeeControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Authenticate a user for all tests
        $user = User::factory()->create();
        Sanctum::actingAs($user);
    }

    public function test_can_fetch_paginated_employees(): void
    {
        // Create test data
        $branch = Branch::factory()->create();
        $position = Position::factory()->create();
        $section = Section::factory()->create();

        Employee::factory()->count(15)->create([
            'branch_id' => $branch->id,
            'position_id' => $position->id,
            'department_id' => $section->id,
        ]);

        $response = $this->getJson('/api/employees?per_page=10');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data',
                    'total',
                    'per_page',
                    'current_page',
                ],
            ])
            ->assertJsonPath('data.per_page', 10)
            ->assertJsonCount(10, 'data.data');
    }

    public function test_can_search_employees_by_fullname(): void
    {
        $branch = Branch::factory()->create();
        $position = Position::factory()->create();
        $section = Section::factory()->create();

        Employee::factory()->create([
            'fullname' => 'John Doe',
            'branch_id' => $branch->id,
            'position_id' => $position->id,
            'department_id' => $section->id,
        ]);

        Employee::factory()->create([
            'fullname' => 'Jane Smith',
            'branch_id' => $branch->id,
            'position_id' => $position->id,
            'department_id' => $section->id,
        ]);

        $response = $this->getJson('/api/employees?search=John');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.fullname', 'John Doe');
    }

    public function test_can_search_employees_by_position_name(): void
    {
        $branch = Branch::factory()->create();
        $section = Section::factory()->create();

        $developerPosition = Position::factory()->create(['title' => 'Software Developer']);
        $managerPosition = Position::factory()->create(['title' => 'Project Manager']);

        Employee::factory()->create([
            'fullname' => 'John Doe',
            'branch_id' => $branch->id,
            'position_id' => $developerPosition->id,
            'department_id' => $section->id,
        ]);

        Employee::factory()->create([
            'fullname' => 'Jane Smith',
            'branch_id' => $branch->id,
            'position_id' => $managerPosition->id,
            'department_id' => $section->id,
        ]);

        $response = $this->getJson('/api/employees?search=Developer');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.position.position_name', 'Software Developer');
    }

    public function test_can_filter_employees_by_branch(): void
    {
        $branch1 = Branch::factory()->create(['branch_name' => 'Head Office']);
        $branch2 = Branch::factory()->create(['branch_name' => 'Regional Office']);
        $position = Position::factory()->create();
        $section = Section::factory()->create();

        Employee::factory()->count(3)->create([
            'branch_id' => $branch1->id,
            'position_id' => $position->id,
            'department_id' => $section->id,
        ]);

        Employee::factory()->count(2)->create([
            'branch_id' => $branch2->id,
            'position_id' => $position->id,
            'department_id' => $section->id,
        ]);

        $response = $this->getJson("/api/employees?branch_id={$branch1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data.data');

        foreach ($response->json('data.data') as $employee) {
            $this->assertEquals($branch1->id, $employee['branch']['id']);
        }
    }

    public function test_can_filter_employees_by_position(): void
    {
        $branch = Branch::factory()->create();
        $section = Section::factory()->create();
        $position1 = Position::factory()->create();
        $position2 = Position::factory()->create();

        Employee::factory()->count(3)->create([
            'branch_id' => $branch->id,
            'position_id' => $position1->id,
            'department_id' => $section->id,
        ]);

        Employee::factory()->count(2)->create([
            'branch_id' => $branch->id,
            'position_id' => $position2->id,
            'department_id' => $section->id,
        ]);

        $response = $this->getJson("/api/employees?position_id={$position1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data.data');

        foreach ($response->json('data.data') as $employee) {
            $this->assertEquals($position1->id, $employee['position']['id']);
        }
    }

    public function test_can_filter_employees_by_department(): void
    {
        $branch = Branch::factory()->create();
        $position = Position::factory()->create();
        $section1 = Section::factory()->create();
        $section2 = Section::factory()->create();

        Employee::factory()->count(3)->create([
            'branch_id' => $branch->id,
            'position_id' => $position->id,
            'department_id' => $section1->id,
        ]);

        Employee::factory()->count(2)->create([
            'branch_id' => $branch->id,
            'position_id' => $position->id,
            'department_id' => $section2->id,
        ]);

        $response = $this->getJson("/api/employees?department_id={$section1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data.data');
    }

    public function test_can_combine_multiple_filters(): void
    {
        $branch1 = Branch::factory()->create();
        $branch2 = Branch::factory()->create();
        $position = Position::factory()->create(['position_name' => 'Developer']);
        $section = Section::factory()->create();

        // Create employee matching all criteria
        Employee::factory()->create([
            'fullname' => 'John Developer',
            'branch_id' => $branch1->id,
            'position_id' => $position->id,
            'department_id' => $section->id,
        ]);

        // Create employees not matching all criteria
        Employee::factory()->create([
            'fullname' => 'Jane Developer',
            'branch_id' => $branch2->id,
            'position_id' => $position->id,
            'department_id' => $section->id,
        ]);

        Employee::factory()->create([
            'fullname' => 'John Manager',
            'branch_id' => $branch1->id,
            'position_id' => Position::factory()->create()->id,
            'department_id' => $section->id,
        ]);

        $response = $this->getJson("/api/employees?search=John&branch_id={$branch1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.fullname', 'John Developer');
    }

    public function test_all_parameter_limits_to_1000_records(): void
    {
        $branch = Branch::factory()->create();
        $position = Position::factory()->create();
        $section = Section::factory()->create();

        // Create more than 1000 employees
        Employee::factory()->count(1050)->create([
            'branch_id' => $branch->id,
            'position_id' => $position->id,
            'department_id' => $section->id,
        ]);

        $response = $this->getJson('/api/employees?all=true');

        $response->assertStatus(200)
            ->assertJsonCount(1000, 'data');
    }

    public function test_respects_per_page_limit_of_100(): void
    {
        $branch = Branch::factory()->create();
        $position = Position::factory()->create();
        $section = Section::factory()->create();

        Employee::factory()->count(200)->create([
            'branch_id' => $branch->id,
            'position_id' => $position->id,
            'department_id' => $section->id,
        ]);

        // Try to request 200 per page, should be limited to 100
        $response = $this->getJson('/api/employees?per_page=200');

        $response->assertStatus(200)
            ->assertJsonPath('data.per_page', 100)
            ->assertJsonCount(100, 'data.data');
    }

    public function test_employees_include_relationships(): void
    {
        $branch = Branch::factory()->create();
        $position = Position::factory()->create();
        $section = Section::factory()->create();

        Employee::factory()->create([
            'branch_id' => $branch->id,
            'position_id' => $position->id,
            'department_id' => $section->id,
        ]);

        $response = $this->getJson('/api/employees');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'fullname',
                            'branch' => ['id', 'branch_name'],
                            'position' => ['id', 'position_name'],
                            'department',
                        ],
                    ],
                ],
            ]);
    }
}
