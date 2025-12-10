<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_the_api_ping_endpoint_is_available(): void
    {
        $response = $this->getJson('/api/ping');

        $response->assertOk()->assertJson(['status' => 'ok']);
    }
}
