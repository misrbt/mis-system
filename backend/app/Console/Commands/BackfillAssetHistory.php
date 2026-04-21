<?php

namespace App\Console\Commands;

use App\Models\Asset;
use App\Models\AssetMovement;
use App\Models\Status;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillAssetHistory extends Command
{
    protected $signature = 'assets:backfill-history {--dry-run : Show what would change without writing}';

    protected $description = 'Backfill asset_movements history for legacy assets so each one has a "tagged as New on purchase_date" entry plus the auto-transition to Functional 30 days later (when applicable). Idempotent.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $newStatus = Status::where('name', 'New')->first();
        $functionalStatus = Status::where('name', 'Functional')->first();

        if (! $newStatus || ! $functionalStatus) {
            $this->error('Could not find both "New" and "Functional" status rows. Aborting.');

            return self::FAILURE;
        }

        $newStatusId = (int) $newStatus->id;
        $functionalStatusId = (int) $functionalStatus->id;

        $assets = Asset::withoutGlobalScope('hide_expired_defective')
            ->whereNotNull('purchase_date')
            ->orderBy('id')
            ->get();

        $this->info("Scanning {$assets->count()} assets with a purchase_date...");

        $createdInserted = 0;
        $createdRedated = 0;
        $transitionInserted = 0;
        $skipped = 0;

        DB::beginTransaction();
        try {
            foreach ($assets as $asset) {
                $purchaseDate = $asset->purchase_date instanceof Carbon
                    ? $asset->purchase_date->copy()->startOfDay()
                    : Carbon::parse($asset->purchase_date)->startOfDay();

                $existingCreated = AssetMovement::where('asset_id', $asset->id)
                    ->where('movement_type', 'created')
                    ->orderBy('id')
                    ->first();

                if (! $existingCreated) {
                    if (! $dryRun) {
                        AssetMovement::create([
                            'asset_id' => $asset->id,
                            'movement_type' => 'created',
                            'to_status_id' => $newStatusId,
                            'movement_date' => $purchaseDate,
                            'reason' => 'Backfilled history: tagged as New on purchase date',
                            'metadata' => ['backfilled' => true],
                        ]);
                    }
                    $createdInserted++;
                } elseif (! $existingCreated->movement_date
                    || ! $existingCreated->movement_date->copy()->startOfDay()->equalTo($purchaseDate)) {
                    if (! $dryRun) {
                        $existingCreated->update(['movement_date' => $purchaseDate]);
                    }
                    $createdRedated++;
                }

                $shouldHaveTransition = (int) $asset->status_id === $functionalStatusId
                    && $purchaseDate->copy()->addDays(30)->lte(now());

                if ($shouldHaveTransition) {
                    $transitionDate = $purchaseDate->copy()->addDays(30);

                    $hasTransition = AssetMovement::where('asset_id', $asset->id)
                        ->where('movement_type', 'status_changed')
                        ->where('from_status_id', $newStatusId)
                        ->where('to_status_id', $functionalStatusId)
                        ->exists();

                    if (! $hasTransition) {
                        if (! $dryRun) {
                            AssetMovement::create([
                                'asset_id' => $asset->id,
                                'movement_type' => 'status_changed',
                                'from_status_id' => $newStatusId,
                                'to_status_id' => $functionalStatusId,
                                'movement_date' => $transitionDate,
                                'reason' => 'Backfilled history: auto-transition 30 days after purchase',
                                'metadata' => ['backfilled' => true, 'auto_transition' => true],
                            ]);
                        }
                        $transitionInserted++;
                    } else {
                        $skipped++;
                    }
                }
            }

            if ($dryRun) {
                DB::rollBack();
                $this->warn('Dry run — no rows were written.');
            } else {
                DB::commit();
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Backfill failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info('');
        $this->info("Inserted 'created' movements:        {$createdInserted}");
        $this->info("Re-dated existing 'created' movements: {$createdRedated}");
        $this->info("Inserted 'status_changed' movements: {$transitionInserted}");
        $this->info("Skipped (already had transition):    {$skipped}");
        $this->info('Done.');

        return self::SUCCESS;
    }
}
