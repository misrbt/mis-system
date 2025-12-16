<?php

namespace App\Console\Commands;

use App\Models\Asset;
use App\Models\Status;
use Illuminate\Console\Command;

class TransitionAssetStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assets:transition-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically transition asset statuses from "New" to "Functional" after 30 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for assets that need status transition...');

        // Get the "New" status
        $newStatus = Status::where('name', 'New')->first();

        if (!$newStatus) {
            $this->error('Status "New" not found in database. No transitions performed.');
            return 1;
        }

        // Get all assets with "New" status
        $assets = Asset::where('status_id', $newStatus->id)->get();

        if ($assets->isEmpty()) {
            $this->info('No assets with "New" status found.');
            return 0;
        }

        $transitioned = 0;
        $skipped = 0;

        foreach ($assets as $asset) {
            if ($asset->shouldTransitionToFunctional()) {
                $daysSinceCreation = $asset->created_at->diffInDays(now());

                if ($asset->transitionToFunctional()) {
                    $transitioned++;
                    $this->line("Asset #{$asset->id} ({$asset->asset_name}): New → Functional ({$daysSinceCreation} days old)");
                } else {
                    $skipped++;
                    $this->warn("Failed to transition asset #{$asset->id}: Functional status not found");
                }
            } else {
                $skipped++;
            }
        }

        $this->info("\nStatus transition completed!");
        $this->info("Transitioned: {$transitioned} assets");
        $this->info("Skipped (< 30 days): {$skipped} assets");
        $this->info("Total checked: " . ($transitioned + $skipped) . " assets");

        return 0;
    }
}
