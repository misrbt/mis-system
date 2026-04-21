<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule asset book value updates - runs multiple times during business hours
// This ensures updates happen even if server was off during scheduled time
Schedule::command('assets:update-book-values')
    ->dailyAt('08:00')  // Morning when server starts
    ->weekdays()         // Monday-Friday only
    ->description('Update book values for all assets (morning)');

Schedule::command('assets:update-book-values')
    ->dailyAt('12:00')  // Midday
    ->weekdays()
    ->description('Update book values for all assets (midday)');

Schedule::command('assets:update-book-values')
    ->dailyAt('17:00')  // Before server shutdown
    ->weekdays()
    ->description('Update book values for all assets (evening)');

// Note: assets:transition-statuses is no longer scheduled. The "New → Functional
// after 30 days" transition now happens automatically via AssetObserver::retrieved(),
// triggered the next time the asset is loaded from the database. The artisan command
// is kept as an optional manual fallback (php artisan assets:transition-statuses).

// Cleanup expired defective assets - runs hourly to ensure timely deletion
Schedule::command('cleanup:expired-defective-assets')
    ->hourly()
    ->description('Delete expired defective assets that have passed their delete_after_at timestamp');
