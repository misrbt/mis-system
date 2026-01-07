<?php

namespace App\Console\Commands;

use App\Models\AssetMovement;
use Illuminate\Console\Command;
use Carbon\Carbon;

class FixAuditLogDates extends Command
{
    protected $signature = 'audit:fix-dates';
    protected $description = 'Fix date formatting in old audit log entries';

    public function handle()
    {
        $this->info('Fixing date formatting in audit log entries...');
        $this->newLine();

        $movements = AssetMovement::whereNotNull('metadata')->get();
        $fixedCount = 0;
        $totalCount = 0;

        $progressBar = $this->output->createProgressBar($movements->count());
        $progressBar->start();

        foreach ($movements as $movement) {
            $metadata = $movement->metadata;

            if (!isset($metadata['changed_fields'])) {
                $progressBar->advance();
                continue;
            }

            $updated = false;

            foreach ($metadata['changed_fields'] as $key => $field) {
                // Check if it's a date field with ISO format
                if ($field['type'] === 'date') {
                    $totalCount++;

                    // Fix old_value if it's in ISO format
                    if ($field['old_value'] && $this->isISOFormat($field['old_value'])) {
                        try {
                            $metadata['changed_fields'][$key]['old_value'] =
                                Carbon::parse($field['old_value'])->format('M d, Y');
                            $updated = true;
                        } catch (\Exception $e) {
                            // Skip if parsing fails
                        }
                    }

                    // Fix new_value if it's in ISO format
                    if ($field['new_value'] && $this->isISOFormat($field['new_value'])) {
                        try {
                            $metadata['changed_fields'][$key]['new_value'] =
                                Carbon::parse($field['new_value'])->format('M d, Y');
                            $updated = true;
                        } catch (\Exception $e) {
                            // Skip if parsing fails
                        }
                    }
                }
            }

            if ($updated) {
                $movement->metadata = $metadata;
                $movement->save();
                $fixedCount++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("✅ Fixed {$fixedCount} audit log entries");
        $this->info("Total date fields processed: {$totalCount}");
        $this->newLine();
    }

    private function isISOFormat($dateString)
    {
        // Check if string contains ISO 8601 format indicators
        return is_string($dateString) &&
               (str_contains($dateString, 'T') && str_contains($dateString, ':'));
    }
}
