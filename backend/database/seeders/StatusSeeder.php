<?php

namespace Database\Seeders;

use App\Models\Status;
use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    /**
     * Seed default statuses for assets.
     */
    public function run(): void
    {
        $defaults = [
            ['name' => 'New', 'description' => 'Newly added asset', 'color' => '#3B82F6'],
            ['name' => 'Functional', 'description' => 'Working as expected', 'color' => '#10B981'],
            ['name' => 'Under Repair', 'description' => 'Currently being repaired', 'color' => '#F59E0B'],
            ['name' => 'Retired', 'description' => 'Decommissioned', 'color' => '#6B7280'],
            ['name' => 'Lost', 'description' => 'Missing asset', 'color' => '#EF4444'],
        ];

        foreach ($defaults as $item) {
            Status::updateOrCreate(
                ['name' => $item['name']],
                [
                    'description' => $item['description'],
                    'color' => $item['color'],
                ]
            );
        }
    }
}
