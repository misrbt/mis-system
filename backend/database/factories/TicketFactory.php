<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\TicketCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(6),
            'description' => fake()->paragraph(),
            'contact_number' => fake()->phoneNumber(),
            'anydesk_number' => fake()->numerify('#########'),
            'category_id' => TicketCategory::factory(),
            'priority' => fake()->randomElement(['Low', 'Medium', 'High', 'Urgent']),
            'status' => 'Open',
            'requester_employee_id' => Employee::factory(),
            'assigned_to_user_id' => null,
            'created_by_user_id' => null,
            'due_date' => null,
        ];
    }

    public function resolved(): self
    {
        return $this->state(fn () => [
            'status' => 'Resolved',
            'resolved_at' => now()->subHours(2),
            'resolution_summary' => 'Resolved by IT.',
        ]);
    }

    public function closed(): self
    {
        return $this->state(fn () => [
            'status' => 'Closed',
            'resolved_at' => now()->subDay(),
            'closed_at' => now()->subHours(2),
        ]);
    }

    public function overdue(): self
    {
        return $this->state(fn () => [
            'status' => 'In Progress',
            'due_date' => now()->subDays(3)->toDateString(),
        ]);
    }
}
