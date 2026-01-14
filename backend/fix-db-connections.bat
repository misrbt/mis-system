@echo off
echo ================================================
echo PostgreSQL Connection Limit Fix
echo ================================================
echo.

echo Step 1: Clearing Laravel caches...
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo.
echo Step 2: Optimizing application...
php artisan optimize:clear
php artisan config:cache

echo.
echo ================================================
echo Done! Try logging in again.
echo ================================================
pause
