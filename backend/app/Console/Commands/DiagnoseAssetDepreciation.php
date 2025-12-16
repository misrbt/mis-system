<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;

class DiagnoseAssetDepreciation extends Command
{
    protected $signature = 'assets:diagnose {id}';
    protected $description = 'Diagnose asset depreciation calculation';

    public function handle()
    {
        $assetId = $this->argument('id');
        $asset = Asset::find($assetId);

        if (!$asset) {
            $this->error("Asset #{$assetId} not found!");
            return 1;
        }

        $this->info("=== Asset Depreciation Diagnostic ===\n");

        // Basic Info
        $this->line("📦 Asset: {$asset->asset_name}");
        $this->line("🆔 ID: {$asset->id}\n");

        // Financial Data
        $this->info("💰 Financial Information:");
        $this->line("  Purchase Date: " . ($asset->purchase_date ? $asset->purchase_date : 'NOT SET'));
        $this->line("  Acquisition Cost: ₱" . number_format($asset->acq_cost, 2));
        $this->line("  Estimated Life: {$asset->estimate_life} years");
        $this->line("  Current Book Value: ₱" . number_format($asset->book_value, 2));
        $this->newLine();

        // Calculation Breakdown
        if ($asset->purchase_date && $asset->acq_cost && $asset->estimate_life) {
            $calc = $asset->calculateBookValue();

            $this->info("🧮 Depreciation Calculation:");
            $this->line("  Purchase Date (parsed): {$calc['purchase_date']}");
            $this->line("  As of Date: {$calc['as_of_date']}");
            $this->line("  Days Elapsed: {$calc['days_elapsed']} days");
            $this->newLine();

            $this->line("  Total Life: {$calc['life_years']} years = " . ($calc['life_years'] * 365) . " days");
            $this->line("  Daily Depreciation: ₱" . number_format($calc['daily_depreciation'], 2));
            $this->newLine();

            $this->line("  Total Depreciated: ₱" . number_format($calc['diminished_value'], 2));
            $this->line("  Calculated Book Value: ₱" . number_format($calc['book_value'], 2));
            $this->newLine();

            // Comparison
            $this->info("📊 Verification:");
            $this->line("  Stored Book Value: ₱" . number_format($asset->book_value, 2));
            $this->line("  Calculated Book Value: ₱" . number_format($calc['book_value'], 2));

            $difference = abs($asset->book_value - $calc['book_value']);
            if ($difference > 0.01) {
                $this->warn("  ⚠️  Mismatch! Difference: ₱" . number_format($difference, 2));
                $this->warn("  Run 'php artisan assets:update-book-values' to fix");
            } else {
                $this->info("  ✅ Book value is accurate!");
            }
            $this->newLine();

            // Timeline
            $this->info("📅 Timeline:");
            $purchaseDate = \Carbon\Carbon::parse($asset->purchase_date);
            $now = now();

            $this->line("  Purchase Date: {$purchaseDate->toDateTimeString()}");
            $this->line("  Current Time: {$now->toDateTimeString()}");
            $this->line("  Time Difference: " . $purchaseDate->diffForHumans($now, true));
            $this->newLine();

            // Expected Values
            $this->info("📈 Expected Depreciation:");
            for ($days = 0; $days <= 3; $days++) {
                $depreciation = $calc['daily_depreciation'] * $days;
                $bookValue = max(1, $asset->acq_cost - $depreciation);
                $this->line("  After {$days} day(s): ₱" . number_format($bookValue, 2));
            }

        } else {
            $this->warn("⚠️  Missing data for depreciation calculation!");
            if (!$asset->purchase_date) $this->line("  - Purchase date not set");
            if (!$asset->acq_cost) $this->line("  - Acquisition cost not set");
            if (!$asset->estimate_life) $this->line("  - Estimated life not set");
        }

        return 0;
    }
}
