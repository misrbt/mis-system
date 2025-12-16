<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CatchupAssetUpdates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assets:catchup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Catch up on missed asset updates (book values and status transitions)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Running catch-up for missed asset updates...');

        // Run both update commands
        $this->info("\n=== Updating Book Values ===");
        $this->call('assets:update-book-values');

        $this->info("\n=== Transitioning Statuses ===");
        $this->call('assets:transition-statuses');

        $this->info("\n✅ Catch-up completed successfully!");

        return 0;
    }
}
