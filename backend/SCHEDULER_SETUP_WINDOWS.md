# Laravel Scheduler Setup for Windows - Book Value Auto-Depreciation

## Overview
This system automatically decreases asset book values daily based on depreciation calculations. The scheduler runs predefined tasks at specific times.

## Current Schedule Configuration

The system is configured in `routes/console.php` to run:

### Daily Book Value Updates
- **8:00 AM** - Morning update (weekdays)
- **12:00 PM** - Midday update (weekdays)
- **5:00 PM** - Evening update (weekdays)

### Hourly Catch-up
- **Every hour from 8 AM to 6 PM** (weekdays)
- Ensures no updates are missed

## Quick Start - Option 1: Windows Task Scheduler (Recommended)

### Step 1: Open Windows Task Scheduler
1. Press `Win + R`
2. Type `taskschd.msc` and press Enter

### Step 2: Create New Task
1. Click "Create Basic Task" in the right panel
2. Name: `Laravel Scheduler - MIS System`
3. Description: `Runs Laravel task scheduler every minute for asset depreciation`

### Step 3: Configure Trigger
1. Select "Daily"
2. Start date: Today
3. Recur every: 1 day
4. Click "Next"

### Step 4: Configure Action
1. Select "Start a program"
2. Program/script: Browse and select `C:\www\project\mis-system\backend\run-scheduler.bat`
3. Start in: `C:\www\project\mis-system\backend`
4. Click "Next" and "Finish"

### Step 5: Advanced Settings (IMPORTANT)
1. Right-click the newly created task → Properties
2. Go to "Triggers" tab → Edit the trigger
3. Check "Repeat task every: **1 minute**"
4. For a duration of: "Indefinitely"
5. Check "Enabled"
6. Click OK

7. Go to "Conditions" tab
8. **Uncheck** "Start the task only if the computer is on AC power"
9. **Uncheck** "Stop if the computer switches to battery power"

10. Go to "Settings" tab
11. Check "Run task as soon as possible after a scheduled start is missed"
12. Check "If the task fails, restart every: 1 minute"
13. Attempt to restart up to: 3 times

14. Click OK

### Step 6: Verify Setup
Run this command in PowerShell or CMD:
```bash
cd C:\www\project\mis-system\backend
php artisan schedule:list
```

You should see output like:
```
  0 8 * * 1-5 ..... php artisan assets:update-book-values
  0 12 * * 1-5 .... php artisan assets:update-book-values
  0 17 * * 1-5 .... php artisan assets:update-book-values
  0 * * * 1-5 ..... php artisan assets:catchup (between 8:00-18:00)
```

## Quick Start - Option 2: Manual Testing

Test the scheduler manually:

```bash
cd C:\www\project\mis-system\backend

# Run scheduler once (processes all due tasks)
php artisan schedule:run

# Or run book value update directly
php artisan assets:update-book-values

# Check logs
type storage\logs\scheduler.log
```

## Quick Start - Option 3: Development Mode (Background Process)

For development/testing, run the scheduler in watch mode:

```bash
cd C:\www\project\mis-system\backend

# Runs scheduler every minute automatically (Ctrl+C to stop)
php artisan schedule:work
```

**Note:** This keeps a terminal window open. Good for testing, not for production.

## Verification

### Check if Scheduler is Working

1. **View scheduled commands:**
   ```bash
   php artisan schedule:list
   ```

2. **Check scheduler logs:**
   ```bash
   type storage\logs\scheduler.log
   ```

3. **Manually trigger book value update:**
   ```bash
   php artisan assets:update-book-values
   ```

4. **Check asset book values in database:**
   ```sql
   SELECT id, asset_name, acq_cost, purchase_date, book_value,
          DATEDIFF(day, purchase_date, GETDATE()) as days_elapsed
   FROM assets
   ORDER BY purchase_date DESC
   LIMIT 10;
   ```

### Expected Behavior

- **Daily Depreciation Formula:**
  ```
  Daily Depreciation = Acquisition Cost ÷ (Estimated Life in Years × 365)
  ```

- **Book Value Formula:**
  ```
  Book Value = MAX(1, Acquisition Cost - (Daily Depreciation × Days Elapsed))
  ```

- **Example:**
  - Asset Cost: ₱100,000
  - Estimated Life: 5 years (1,825 days)
  - Daily Depreciation: ₱100,000 ÷ 1,825 = **₱54.79 per day**
  - After 30 days: ₱100,000 - (₱54.79 × 30) = **₱98,356.30**
  - After 1 year: ₱100,000 - (₱54.79 × 365) = **₱80,002.08**

## Troubleshooting

### Scheduler Not Running

**Problem:** Book values not updating automatically

**Solutions:**
1. Check if Windows Task Scheduler task is enabled
2. Check if PHP is in system PATH: `php -v`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Check scheduler logs: `storage/logs/scheduler.log`
5. Manually run: `php artisan schedule:run`

### Book Values Still Not Decreasing

**Problem:** Scheduler runs but values don't change

**Check:**
1. Verify assets have `purchase_date`, `acq_cost`, and `estimate_life` set
2. Run update command manually with verbose output:
   ```bash
   php artisan assets:update-book-values -v
   ```
3. Check for errors in `storage/logs/laravel.log`

### Permission Issues

**Problem:** Access denied errors

**Solution:**
1. Run CMD or PowerShell as Administrator
2. Set proper permissions on `storage/` directory:
   ```bash
   icacls storage /grant Users:(OI)(CI)F /T
   ```

## Logs and Monitoring

- **Scheduler Log:** `storage/logs/scheduler.log`
- **Laravel Log:** `storage/logs/laravel.log`
- **Book Value Update Log:** Check artisan command output

## Available Artisan Commands

```bash
# Update book values for all assets
php artisan assets:update-book-values

# Recalculate all book values (force update)
php artisan assets:recalculate-book-values

# Run both book values and status transitions
php artisan assets:catchup

# Transition asset statuses (New → Functional)
php artisan assets:transition-statuses

# List all scheduled tasks
php artisan schedule:list

# Test scheduler (runs once)
php artisan schedule:run

# Run scheduler continuously (development)
php artisan schedule:work
```

## Production Deployment Checklist

- [ ] Windows Task Scheduler task created
- [ ] Task set to repeat every 1 minute
- [ ] Task set to run indefinitely
- [ ] Task enabled and running
- [ ] Logs directory writable
- [ ] Tested manually with `php artisan schedule:run`
- [ ] Verified book values are updating
- [ ] Monitoring logs for errors

## Support

If issues persist:
1. Check `storage/logs/scheduler.log`
2. Run manual update: `php artisan assets:update-book-values -v`
3. Verify database connection
4. Check PHP version (requires PHP 8.2+)
