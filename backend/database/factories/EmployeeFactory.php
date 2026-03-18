<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'fullname' => fake()->name(),
            'branch_id' => \App\Models\Branch::factory(),
            'position_id' => \App\Models\Position::factory(),
            'department_id' => \App\Models\Section::factory(),
        ];
    }
}
