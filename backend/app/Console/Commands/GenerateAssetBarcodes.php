<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;

class GenerateAssetBarcodes extends Command
{
    protected $signature = 'assets:generate-barcodes';
    protected $description = 'Generate barcodes for all assets that do not have one';

    public function handle()
    {
        $this->info('Starting barcode generation for assets...');

        // Get total assets
        $totalAssets = Asset::count();
        $this->info("Total assets in database: {$totalAssets}");

        // Get assets without barcodes
        $assetsWithoutBarcode = Asset::whereNull('barcode')
            ->orWhere('barcode', '')
            ->get();

        $count = $assetsWithoutBarcode->count();
        $this->info("Assets without barcodes: {$count}");

        if ($count === 0) {
            $this->info('All assets already have barcodes!');
            return 0;
        }

        $this->info('Generating barcodes...');
        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $generated = 0;
        $failed = 0;

        foreach ($assetsWithoutBarcode as $asset) {
            try {
                $asset->generateAndSaveBarcode();
                $generated++;
            } catch (\Exception $e) {
                $failed++;
                $this->newLine();
                $this->error("Failed to generate barcode for asset #{$asset->id}: " . $e->getMessage());
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✓ Successfully generated barcodes for {$generated} assets");
        if ($failed > 0) {
            $this->warn("✗ Failed to generate barcodes for {$failed} assets");
        }

        return 0;
    }
}
