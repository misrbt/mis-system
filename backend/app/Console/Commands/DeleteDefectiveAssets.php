<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DeleteDefectiveAssets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assets:delete-defective {--dry-run : Preview assets to be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically delete assets that have been marked as Defective for 1 month or more';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');

        $this->info('========================================');
        $this->info('  Delete Defective Assets Command');
        $this->info('========================================');
        $this->newLine();

        if ($isDryRun) {
            $this->warn('🔍 DRY RUN MODE - No assets will be deleted');
            $this->newLine();
        }

        // Find all assets where delete_after_at has passed
        $assetsToDelete = Asset::whereNotNull('delete_after_at')
            ->where('delete_after_at', '<=', now())
            ->with(['category', 'status', 'assignedEmployee'])
            ->get();

        if ($assetsToDelete->isEmpty()) {
            $this->info('✓ No defective assets found that need to be deleted');
            return 0;
        }

        $this->info("Found {$assetsToDelete->count()} asset(s) to delete:");
        $this->newLine();

        // Display table of assets to be deleted
        $tableData = $assetsToDelete->map(function ($asset) {
            return [
                'ID' => $asset->id,
                'Name' => $asset->asset_name,
                'Serial' => $asset->serial_number ?? 'N/A',
                'Category' => $asset->category->name ?? 'N/A',
                'Status' => $asset->status->name ?? 'N/A',
                'Defective Since' => $asset->defective_at ? $asset->defective_at->format('Y-m-d H:i:s') : 'N/A',
                'Delete After' => $asset->delete_after_at ? $asset->delete_after_at->format('Y-m-d H:i:s') : 'N/A',
            ];
        })->toArray();

        $this->table(
            ['ID', 'Name', 'Serial', 'Category', 'Status', 'Defective Since', 'Delete After'],
            $tableData
        );

        $this->newLine();

        if ($isDryRun) {
            $this->warn('⚠ DRY RUN: Assets listed above would be deleted in production mode');
            return 0;
        }

        // Confirm deletion in interactive mode
        if (!$this->confirm('Are you sure you want to delete these assets? This action cannot be undone.', false)) {
            $this->warn('❌ Operation cancelled by user');
            return 1;
        }

        $deletedCount = 0;
        $failedCount = 0;

        $this->newLine();
        $this->info('Deleting assets...');
        $this->newLine();

        foreach ($assetsToDelete as $asset) {
            try {
                $assetId = $asset->id;
                $assetName = $asset->asset_name;

                $asset->delete();

                $deletedCount++;
                $this->info("✓ Deleted: {$assetName} (ID: {$assetId})");

                Log::info("Auto-deleted defective asset", [
                    'asset_id' => $assetId,
                    'asset_name' => $assetName,
                    'defective_at' => $asset->defective_at,
                    'delete_after_at' => $asset->delete_after_at,
                    'deleted_at' => now(),
                ]);

            } catch (\Exception $e) {
                $failedCount++;
                $this->error("✗ Failed to delete: {$asset->asset_name} (ID: {$asset->id})");
                $this->error("  Error: {$e->getMessage()}");

                Log::error("Failed to auto-delete defective asset", [
                    'asset_id' => $asset->id,
                    'asset_name' => $asset->asset_name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info('========================================');
        $this->info('  Deletion Summary');
        $this->info('========================================');
        $this->info("✓ Successfully deleted: {$deletedCount}");

        if ($failedCount > 0) {
            $this->error("✗ Failed to delete: {$failedCount}");
        }

        $this->newLine();

        return $failedCount > 0 ? 1 : 0;
    }
}
