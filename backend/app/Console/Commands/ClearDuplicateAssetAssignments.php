<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;

class ClearDuplicateAssetAssignments extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'assets:clear-duplicate-assignments';

    /**
     * The console command description.
     */
    protected $description = 'Clear assigned_to_employee_id for assets that have workstation_id (assets should be tied to workstations, not employees)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for assets with duplicate assignments...');

        // Find assets that have BOTH workstation_id AND assigned_to_employee_id set
        $assetsWithDuplicates = Asset::whereNotNull('workstation_id')
            ->whereNotNull('assigned_to_employee_id')
            ->get();

        if ($assetsWithDuplicates->isEmpty()) {
            $this->info('✓ No duplicate assignments found. All assets are correctly assigned!');

            return Command::SUCCESS;
        }

        $this->warn("Found {$assetsWithDuplicates->count()} assets with duplicate assignments.");
        $this->info('These assets have both workstation_id AND assigned_to_employee_id set.');
        $this->newLine();

        $this->info('Clearing assigned_to_employee_id for workstation-assigned assets...');

        $bar = $this->output->createProgressBar($assetsWithDuplicates->count());
        $bar->start();

        $cleared = 0;
        foreach ($assetsWithDuplicates as $asset) {
            // Clear the employee assignment since asset is tied to workstation
            $asset->assigned_to_employee_id = null;
            $asset->save();
            $cleared++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✓ Successfully cleared {$cleared} duplicate assignments!");
        $this->info('Assets are now correctly tied to their workstations only.');
        $this->newLine();
        $this->info('When employees move between workstations, assets will stay at their workstation locations.');

        return Command::SUCCESS;
    }
}
