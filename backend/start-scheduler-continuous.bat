@echo off
REM Continuous Laravel Scheduler Runner for Development/Testing
REM This keeps running and executes the scheduler every minute
REM Press Ctrl+C to stop

echo.
echo ========================================
echo Laravel Scheduler - Continuous Mode
echo ========================================
echo.
echo This will run the Laravel scheduler every minute.
echo Book values will automatically decrease daily.
echo.
echo Press Ctrl+C to stop the scheduler.
echo.
echo ========================================
echo.

cd /d "%~dp0"

REM Run the scheduler in continuous mode
php artisan schedule:work

pause
