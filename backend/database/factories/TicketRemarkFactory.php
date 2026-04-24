<?php

namespace Database\Factories;

use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketRemark>
 */
class TicketRemarkFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ticket_id' => Ticket::factory(),
            'user_id' => null,
            'employee_id' => null,
            'remark' => fake()->sentence(),
            'remark_type' => 'general',
            'is_internal' => false,
        ];
    }

    public function internal(): self
    {
        return $this->state(fn () => ['is_internal' => true]);
    }

    public function system(): self
    {
        return $this->state(fn () => ['remark_type' => 'system']);
    }
}
