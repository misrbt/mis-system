<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;

class UpdateAssetBookValues extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assets:update-book-values';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update book values for all assets based on depreciation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting book value update for all assets...');

        // Get all assets that have the necessary data for calculation
        $assets = Asset::whereNotNull('purchase_date')
            ->whereNotNull('acq_cost')
            ->whereNotNull('estimate_life')
            ->get();

        $updated = 0;
        $skipped = 0;

        foreach ($assets as $asset) {
            try {
                $oldBookValue = $asset->book_value;
                $calculation = $asset->calculateBookValue();
                $newBookValue = $calculation['book_value'];

                // Update only if the value changed
                if ($oldBookValue != $newBookValue) {
                    $asset->book_value = $newBookValue;
                    $asset->save();
                    $updated++;

                    $this->line("Asset #{$asset->id} ({$asset->asset_name}): ₱{$oldBookValue} → ₱{$newBookValue}");
                } else {
                    $skipped++;
                }
            } catch (\Exception $e) {
                $this->error("Failed to update asset #{$asset->id}: {$e->getMessage()}");
            }
        }

        $this->info("\nBook value update completed!");
        $this->info("Updated: {$updated} assets");
        $this->info("Skipped (no change): {$skipped} assets");
        $this->info("Total processed: " . ($updated + $skipped) . " assets");

        return 0;
    }
}
