<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HelpdeskReportControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Sanctum::actingAs(User::factory()->create());
    }

    public function test_summary_returns_counts_over_date_range(): void
    {
        Ticket::factory()->count(3)->create(['status' => 'Open']);
        Ticket::factory()->count(2)->resolved()->create();

        $from = now()->subDay()->toDateString();
        $to = now()->addDay()->toDateString();

        $response = $this->getJson("/api/helpdesk/reports/summary?date_from={$from}&date_to={$to}");

        $response->assertStatus(200)
            ->assertJsonPath('data.total', 5)
            ->assertJsonPath('data.open', 3)
            ->assertJsonPath('data.resolved', 2);
    }

    public function test_top_requesters_ranks_by_ticket_count(): void
    {
        $heavy = Employee::factory()->create(['fullname' => 'Heavy User']);
        $light = Employee::factory()->create(['fullname' => 'Light User']);

        Ticket::factory()->count(5)->create(['requester_employee_id' => $heavy->id]);
        Ticket::factory()->count(1)->create(['requester_employee_id' => $light->id]);

        $from = now()->subDay()->toDateString();
        $to = now()->addDay()->toDateString();

        $response = $this->getJson("/api/helpdesk/reports/top-requesters?date_from={$from}&date_to={$to}");

        $response->assertStatus(200);
        $data = collect($response->json('data'));
        $this->assertSame('Heavy User', $data->first()['employee_name']);
        $this->assertSame(5, $data->first()['total']);
    }

    public function test_breakdowns_groups_by_status_and_priority(): void
    {
        Ticket::factory()->count(2)->create(['status' => 'Open', 'priority' => 'High']);
        Ticket::factory()->count(3)->create(['status' => 'Pending', 'priority' => 'Low']);

        $from = now()->subDay()->toDateString();
        $to = now()->addDay()->toDateString();

        $response = $this->getJson("/api/helpdesk/reports/breakdowns?date_from={$from}&date_to={$to}");

        $response->assertStatus(200)
            ->assertJsonPath('data.by_status.Open', 2)
            ->assertJsonPath('data.by_status.Pending', 3)
            ->assertJsonPath('data.by_priority.High', 2)
            ->assertJsonPath('data.by_priority.Low', 3);
    }

    public function test_volume_trend_returns_daily_buckets(): void
    {
        Ticket::factory()->count(4)->create();

        $from = now()->subDay()->toDateString();
        $to = now()->addDay()->toDateString();

        $response = $this->getJson("/api/helpdesk/reports/volume-trend?date_from={$from}&date_to={$to}");

        $response->assertStatus(200);
        $data = collect($response->json('data'));
        $this->assertGreaterThan(0, $data->sum('created'));
    }
}
