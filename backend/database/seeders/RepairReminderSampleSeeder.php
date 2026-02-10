<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\Repair;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RepairReminderSampleSeeder extends Seeder
{
    /**
     * Seed sample repair data to trigger reminders.
     * This creates repairs that are overdue and due soon.
     */
    public function run(): void
    {
        // Get first available asset and vendor (adjust IDs as needed)
        $asset1 = Asset::first();
        $asset2 = Asset::skip(1)->first();
        $asset3 = Asset::skip(2)->first();
        $vendor = Vendor::first();

        if (! $asset1 || ! $vendor) {
            $this->command->warn('⚠️  No assets or vendors found. Please create assets and vendors first.');

            return;
        }

        $this->command->info('Creating sample repair data for reminders...');

        // 1. Overdue repair (3 days overdue)
        Repair::create([
            'asset_id' => $asset1->id,
            'vendor_id' => $vendor->id,
            'description' => 'Laptop screen replacement - OVERDUE',
            'repair_date' => Carbon::now()->subDays(10),
            'expected_return_date' => Carbon::now()->subDays(3), // 3 days overdue
            'status' => 'In Repair',
            'repair_cost' => 5000.00,
        ]);

        // 2. Very overdue repair (1 week overdue)
        if ($asset2) {
            Repair::create([
                'asset_id' => $asset2->id,
                'vendor_id' => $vendor->id,
                'description' => 'Desktop motherboard replacement - VERY OVERDUE',
                'repair_date' => Carbon::now()->subDays(14),
                'expected_return_date' => Carbon::now()->subDays(7), // 7 days overdue
                'status' => 'Pending',
                'repair_cost' => 8000.00,
            ]);
        }

        // 3. Due today
        if ($asset3) {
            Repair::create([
                'asset_id' => $asset3->id,
                'vendor_id' => $vendor->id,
                'description' => 'Printer maintenance - DUE TODAY',
                'repair_date' => Carbon::now()->subDays(7),
                'expected_return_date' => Carbon::now(), // Due today
                'status' => 'In Repair',
                'repair_cost' => 2000.00,
            ]);
        }

        // 4. Due in 1 day (tomorrow)
        $asset4 = Asset::skip(3)->first();
        if ($asset4) {
            Repair::create([
                'asset_id' => $asset4->id,
                'vendor_id' => $vendor->id,
                'description' => 'Monitor repair - DUE TOMORROW',
                'repair_date' => Carbon::now()->subDays(5),
                'expected_return_date' => Carbon::now()->addDays(1), // Due in 1 day
                'status' => 'In Repair',
                'repair_cost' => 3500.00,
            ]);
        }

        // 5. Due in 3 days
        $asset5 = Asset::skip(4)->first();
        if ($asset5) {
            Repair::create([
                'asset_id' => $asset5->id,
                'vendor_id' => $vendor->id,
                'description' => 'Keyboard replacement - DUE IN 3 DAYS',
                'repair_date' => Carbon::now()->subDays(3),
                'expected_return_date' => Carbon::now()->addDays(3), // Due in 3 days
                'status' => 'Pending',
                'repair_cost' => 1500.00,
            ]);
        }

        $this->command->info('✅ Sample repair data created successfully!');
        $this->command->info('👉 Clear localStorage and refresh to see the reminder popup.');
        $this->command->info('   Run in browser console:');
        $this->command->info('   localStorage.removeItem("repair_reminders_dismissed")');
        $this->command->info('   localStorage.removeItem("repair_reminders_dismissed_expiry")');
    }
}
