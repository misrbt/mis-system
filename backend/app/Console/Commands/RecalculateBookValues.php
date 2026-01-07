<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;

class RecalculateBookValues extends Command
{
    protected $signature = 'assets:recalculate-book-values';
    protected $description = 'Recalculate and update book values for all assets';

    public function handle()
    {
        $this->info('Recalculating book values for all assets...');

        $assets = Asset::all();
        $updated = 0;
        $skipped = 0;

        $bar = $this->output->createProgressBar($assets->count());
        $bar->start();

        foreach ($assets as $asset) {
            try {
                $bookValueCalc = $asset->calculateBookValue();
                $asset->book_value = $bookValueCalc['book_value'];
                $asset->save();
                $updated++;
            } catch (\Exception $e) {
                $skipped++;
                $this->newLine();
                $this->warn("Skipped asset #{$asset->id}: " . $e->getMessage());
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✓ Successfully updated book values for {$updated} assets");
        if ($skipped > 0) {
            $this->warn("⚠ Skipped {$skipped} assets");
        }

        return 0;
    }
}
