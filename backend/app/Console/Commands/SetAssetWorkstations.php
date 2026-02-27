<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;

class SetAssetWorkstations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assets:set-workstations
                            {--dry-run : Preview changes without saving}
                            {--workstation-only : Only set workstation for workstation assets (Desktop PC, Monitor, etc.)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set workstation_branch_id and workstation_position_id for existing assets based on their assigned employee\'s location';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $workstationOnly = $this->option('workstation-only');

        $this->info('Setting workstation fields for assets...');
        $this->newLine();

        // Get assets that don't have workstation fields set
        $query = Asset::query()
            ->with(['assignedEmployee.branch', 'assignedEmployee.position', 'category'])
            ->where(function ($q) {
                $q->whereNull('workstation_branch_id')
                    ->orWhereNull('workstation_position_id');
            });

        // Filter to only workstation assets if requested
        if ($workstationOnly) {
            $query->whereHas('category', function ($q) {
                $q->where('is_workstation_asset', true);
            });
        }

        $assets = $query->get();

        if ($assets->isEmpty()) {
            $this->info('No assets need workstation fields set.');

            return self::SUCCESS;
        }

        $this->info("Found {$assets->count()} assets to update.");
        $this->newLine();

        $updated = 0;
        $skipped = 0;

        foreach ($assets as $asset) {
            $category = $asset->category?->name ?? 'Unknown';
            $isWorkstationAsset = $asset->category?->is_workstation_asset ?? true;

            // If asset is assigned to an employee, use their branch/position as workstation
            if ($asset->assignedEmployee) {
                $employee = $asset->assignedEmployee;
                $branchName = $employee->branch?->branch_name ?? 'N/A';
                $positionTitle = $employee->position?->title ?? 'N/A';

                if ($employee->branch_id && $employee->position_id) {
                    if ($dryRun) {
                        $this->line("Would update: <comment>{$asset->asset_name}</comment> ({$category}) - Workstation: {$branchName} - {$positionTitle}");
                    } else {
                        $asset->workstation_branch_id = $employee->branch_id;
                        $asset->workstation_position_id = $employee->position_id;
                        $asset->save();
                        $this->line("✓ Updated: <info>{$asset->asset_name}</info> ({$category}) - Workstation: {$branchName} - {$positionTitle}");
                    }
                    $updated++;
                } else {
                    $this->line("⊘ Skipped: <comment>{$asset->asset_name}</comment> ({$category}) - Employee missing branch/position");
                    $skipped++;
                }
            } else {
                // Unassigned asset - skip or handle specially
                $this->line("⊘ Skipped: <comment>{$asset->asset_name}</comment> ({$category}) - No assigned employee");
                $skipped++;
            }
        }

        $this->newLine();
        $this->info('Summary:');
        $this->line("  Updated: <info>{$updated}</info>");
        $this->line("  Skipped: <comment>{$skipped}</comment>");

        if ($dryRun) {
            $this->newLine();
            $this->warn('DRY RUN - No changes were saved. Run without --dry-run to apply changes.');
        }

        return self::SUCCESS;
    }
}
