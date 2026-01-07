@echo off
REM Laravel Task Scheduler Runner for Windows
REM This script runs the Laravel scheduler which handles all scheduled tasks
REM including daily book value depreciation updates

cd /d "%~dp0"

REM Run Laravel's scheduler
php artisan schedule:run >> storage/logs/scheduler.log 2>&1

REM Exit
exit
