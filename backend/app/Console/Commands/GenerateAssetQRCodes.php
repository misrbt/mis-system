<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;

class GenerateAssetQRCodes extends Command
{
    protected $signature = 'assets:generate-qr-codes';
    protected $description = 'Generate QR codes for all assets that do not have one';

    public function handle()
    {
        $this->info('Starting QR code generation for assets...');

        // Get total assets
        $totalAssets = Asset::count();
        $this->info("Total assets in database: {$totalAssets}");

        // Get assets without QR codes
        $assetsWithoutQR = Asset::whereNull('qr_code')
            ->orWhere('qr_code', '')
            ->get();

        $count = $assetsWithoutQR->count();
        $this->info("Assets without QR codes: {$count}");

        if ($count === 0) {
            $this->info('All assets already have QR codes!');
            return 0;
        }

        $this->info('Generating QR codes...');
        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $generated = 0;
        $failed = 0;

        foreach ($assetsWithoutQR as $asset) {
            try {
                $asset->generateAndSaveQRCode();
                $generated++;
            } catch (\Exception $e) {
                $failed++;
                $this->newLine();
                $this->error("Failed to generate QR for asset #{$asset->id}: " . $e->getMessage());
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✓ Successfully generated QR codes for {$generated} assets");
        if ($failed > 0) {
            $this->warn("✗ Failed to generate QR codes for {$failed} assets");
        }

        return 0;
    }
}
