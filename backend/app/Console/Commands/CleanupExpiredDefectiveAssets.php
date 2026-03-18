<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupExpiredDefectiveAssets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cleanup:expired-defective-assets';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete expired defective assets that have passed their delete_after_at timestamp';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting cleanup of expired defective assets...');

        $deletedCount = 0;

        try {
            // Query for expired assets outside the global scope to access them
            Asset::withoutGlobalScope('hide_expired_defective')
                ->whereNotNull('delete_after_at')
                ->where('delete_after_at', '<=', now())
                ->chunk(50, function ($assets) use (&$deletedCount) {
                    foreach ($assets as $asset) {
                        try {
                            Log::info('Auto-deleted defective asset', [
                                'asset_id' => $asset->id,
                                'asset_name' => $asset->asset_name,
                                'defective_at' => $asset->defective_at,
                                'delete_after_at' => $asset->delete_after_at,
                            ]);

                            $asset->delete();
                            $deletedCount++;

                            $this->line("Deleted asset ID {$asset->id}: {$asset->asset_name}");
                        } catch (\Exception $e) {
                            Log::error("Failed to auto-delete asset {$asset->id}: ".$e->getMessage());
                            $this->error("Failed to delete asset ID {$asset->id}: ".$e->getMessage());
                        }
                    }
                });

            $this->info("Cleanup completed. Deleted {$deletedCount} expired defective asset(s).");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            Log::error('Failed to run expired defective assets cleanup: '.$e->getMessage());
            $this->error('Cleanup failed: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
