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

// Schedule asset status transitions - runs during business hours
Schedule::command('assets:transition-statuses')
    ->dailyAt('09:00')  // Morning check
    ->weekdays()
    ->description('Transition assets from "New" to "Functional" (morning)');

Schedule::command('assets:transition-statuses')
    ->dailyAt('15:00')  // Afternoon check
    ->weekdays()
    ->description('Transition assets from "New" to "Functional" (afternoon)');

// Optional: Catch-up command that runs every hour during business hours (8am-6pm)
// Useful if you want frequent updates throughout the day
Schedule::command('assets:catchup')
    ->hourly()
    ->between('8:00', '18:00')
    ->weekdays()
    ->description('Hourly catch-up for asset updates during business hours');
