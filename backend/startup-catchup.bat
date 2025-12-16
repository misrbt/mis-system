@echo off
echo ========================================
echo Running Asset Management Catch-Up
echo ========================================
echo.

cd /d "%~dp0"

echo Updating book values...
php artisan assets:update-book-values
echo.

echo Transitioning statuses...
php artisan assets:transition-statuses
echo.

echo ========================================
echo Catch-Up Complete!
echo ========================================
echo.
pause
