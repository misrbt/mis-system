# Laravel Scheduler - Automatic Book Value Depreciation

## Overview

This system automatically decreases asset book values daily based on straight-line depreciation calculations. No manual intervention required - just set it up once and it runs automatically.

## 📊 How Depreciation Works

### Formula
```
Daily Depreciation = Acquisition Cost ÷ (Estimated Life in Years × 365)
Book Value = MAX(₱1, Acquisition Cost - (Daily Depreciation × Days Since Purchase))
```

### Example Calculation
```
Asset: ASUS Gaming Laptop
- Acquisition Cost: ₱100,000
- Estimated Life: 5 years (1,825 days)
- Daily Depreciation: ₱100,000 ÷ 1,825 = ₱54.79 per day

Day 1:  ₱100,000 - ₱54.79   = ₱99,945.21
Day 30: ₱100,000 - ₱1,643.70 = ₱98,356.30
Year 1: ₱100,000 - ₱19,998   = ₱80,002 (20% annual depreciation)
Year 5: ₱100,000 - ₱100,000  = ₱1 (minimum book value)
```

### Real Results
From actual test run:
```
Asset #1 (ASUS gaming): ₱14,958.9 → ₱14,808.22 (-₱150.68/day)
Asset #2 (UPS):         ₱2,486.3  → ₱2,448.63  (-₱37.67/day)
Asset #13 (GPU RTX):    ₱249,486  → ₱248,973   (-₱513.70/day)
```

## 📅 Automatic Schedule

The system runs book value updates at these times:

| Time | Task | Frequency |
|------|------|-----------|
| 8:00 AM | Morning book value update | Weekdays |
| 12:00 PM | Midday book value update | Weekdays |
| 5:00 PM | Evening book value update | Weekdays |
| Every hour | Catch-up (8 AM - 6 PM) | Weekdays |

**Note:** Times are in server timezone. Multiple runs per day ensure updates happen even if server was offline.

## 🚀 Quick Start

### For Windows Development

**Option 1: Continuous Mode (Easiest)**
```
Double-click: backend\start-scheduler-continuous.bat
```
Keep the window open - scheduler runs automatically.

**Option 2: Windows Task Scheduler**
```
See: backend\SCHEDULER_SETUP_WINDOWS.md
```
Runs in background, no window needed.

### For Ubuntu Production

**Option 1: Automated Setup (Recommended)**
```bash
cd /var/www/mis-system/backend
chmod +x setup-scheduler-ubuntu.sh
./setup-scheduler-ubuntu.sh
```

**Option 2: Manual Cron Setup**
```bash
crontab -e
# Add this line:
* * * * * cd /var/www/mis-system/backend && php artisan schedule:run >> /dev/null 2>&1
```

**Option 3: Systemd Service**
```bash
sudo cp laravel-scheduler.service /etc/systemd/system/
sudo systemctl enable laravel-scheduler
sudo systemctl start laravel-scheduler
```

## 📚 Documentation Files

| File | Purpose | Platform |
|------|---------|----------|
| `SCHEDULER_SETUP_WINDOWS.md` | Complete Windows setup guide | Windows |
| `SCHEDULER_SETUP_UBUNTU.md` | Complete Ubuntu/Linux guide | Linux |
| `UBUNTU_DEPLOYMENT_QUICK_START.md` | Quick production deployment | Linux |
| `SCHEDULER_README.md` | This file - Overview | All |

## 🔧 Configuration Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `run-scheduler.bat` | Runs scheduler once | Windows - Manual testing |
| `start-scheduler-continuous.bat` | Continuous scheduler | Windows - Development |
| `setup-scheduler-ubuntu.sh` | Automated Ubuntu setup | Linux - Initial setup |
| `laravel-scheduler.service` | Systemd service config | Linux - Production |
| `laravel-scheduler.conf` | Supervisor config | Linux - Alternative |

## 🎯 Available Commands

### Book Value Updates

```bash
# Smart update (only updates changed values)
php artisan assets:update-book-values

# Force recalculation of all assets
php artisan assets:recalculate-book-values

# Catch-up (book values + status transitions)
php artisan assets:catchup
```

### Scheduler Management

```bash
# List all scheduled tasks
php artisan schedule:list

# Run scheduler once (processes due tasks)
php artisan schedule:run

# Run continuously (development mode)
php artisan schedule:work

# Test schedule (dry run)
php artisan schedule:test
```

### Status Transitions

```bash
# Auto-transition "New" → "Functional" after 30 days
php artisan assets:transition-statuses
```

## 📋 Schedule Configuration

The schedule is defined in `routes/console.php`:

```php
// Book value updates - 3 times daily
Schedule::command('assets:update-book-values')
    ->dailyAt('08:00')
    ->weekdays();

Schedule::command('assets:update-book-values')
    ->dailyAt('12:00')
    ->weekdays();

Schedule::command('assets:update-book-values')
    ->dailyAt('17:00')
    ->weekdays();

// Hourly catch-up during business hours
Schedule::command('assets:catchup')
    ->hourly()
    ->between('8:00', '18:00')
    ->weekdays();
```

## ✅ Verification

### 1. Check Schedule

```bash
php artisan schedule:list
```

Expected output:
```
  0 8  * * 1-5  php artisan assets:update-book-values ....... Next Due: X hours
  0 12 * * 1-5  php artisan assets:update-book-values ....... Next Due: X hours
  0 17 * * 1-5  php artisan assets:update-book-values ....... Next Due: X hours
  0 *  * * 1-5  php artisan assets:catchup .................. Next Due: X minutes
```

### 2. Test Manually

```bash
php artisan assets:update-book-values
```

Expected output:
```
Starting book value update for all assets...
Asset #1 (ASUS gaming): ₱14958.9 → ₱14808.22
Asset #2 (UPS): ₱2486.3 → ₱2448.63
...
Book value update completed!
Updated: 7 assets
Skipped (no change): 1 assets
Total processed: 8 assets
```

### 3. Monitor Logs

**Windows:**
```bash
type storage\logs\scheduler.log
type storage\logs\laravel.log
```

**Linux:**
```bash
tail -f storage/logs/scheduler.log
tail -f storage/logs/laravel.log
tail -f storage/logs/cron.log
```

### 4. Check Database

```sql
-- PostgreSQL
SELECT
    id,
    asset_name,
    acq_cost,
    book_value,
    purchase_date,
    estimate_life,
    EXTRACT(DAY FROM (CURRENT_DATE - purchase_date)) as days_elapsed,
    ROUND(acq_cost / (estimate_life * 365), 2) as daily_depreciation,
    ROUND(acq_cost - book_value, 2) as total_depreciated
FROM assets
ORDER BY purchase_date DESC
LIMIT 10;
```

## 🔍 Monitoring and Alerts

### Log Files

- `storage/logs/laravel.log` - Main application log
- `storage/logs/scheduler.log` - Scheduler execution log
- `storage/logs/cron.log` - Cron job output (if configured)

### Health Checks

```bash
# Check if scheduler ran recently
grep "Running scheduled command" storage/logs/laravel.log | tail -5

# Check for errors
grep "ERROR" storage/logs/laravel.log | tail -10

# Check book value updates
grep "book value update" storage/logs/laravel.log | tail -10
```

## 🐛 Troubleshooting

### Problem: Scheduler Not Running

**Windows:**
1. Check if `start-scheduler-continuous.bat` is running
2. Verify Task Scheduler task is enabled
3. Check Windows Task Scheduler history

**Linux:**
1. Check cron service: `sudo systemctl status cron`
2. Verify crontab: `crontab -l | grep schedule`
3. Check syslog: `sudo grep CRON /var/log/syslog`

### Problem: Book Values Not Updating

1. **Run manually to see errors:**
   ```bash
   php artisan assets:update-book-values -v
   ```

2. **Check asset data:**
   ```bash
   php artisan tinker
   >>> $asset = \App\Models\Asset::first();
   >>> $asset->calculateBookValue();
   ```

3. **Verify required fields:**
   - `purchase_date` must be set
   - `acq_cost` must be set
   - `estimate_life` must be set

4. **Check logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Problem: Permission Denied

**Windows:**
```bash
# Run as Administrator
icacls storage /grant Users:(OI)(CI)F /T
```

**Linux:**
```bash
# Fix permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Problem: Database Connection Error

1. **Check .env file:**
   ```
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=mis_database
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   ```

2. **Test connection:**
   ```bash
   php artisan tinker
   >>> DB::connection()->getPdo();
   ```

## 🔐 Security Considerations

1. **File Permissions (Linux):**
   ```bash
   # Files: 644, Directories: 755
   find . -type f -exec chmod 644 {} \;
   find . -type d -exec chmod 755 {} \;

   # Storage and cache: 775
   chmod -R 775 storage bootstrap/cache

   # .env: 600
   chmod 600 .env
   ```

2. **Run as Non-Root:**
   - Use `www-data` or dedicated user
   - Never run scheduler as root

3. **Secure Logs:**
   - Rotate logs regularly
   - Restrict log file permissions
   - Monitor for sensitive data leaks

## 📈 Performance Optimization

### For Large Datasets

If you have thousands of assets:

1. **Enable database indexing:**
   ```sql
   CREATE INDEX idx_assets_purchase_date ON assets(purchase_date);
   CREATE INDEX idx_assets_estimate_life ON assets(estimate_life);
   CREATE INDEX idx_assets_book_value ON assets(book_value);
   ```

2. **Use chunking in commands:**
   ```php
   // In UpdateAssetBookValues command
   Asset::chunk(100, function ($assets) {
       foreach ($assets as $asset) {
           // Process
       }
   });
   ```

3. **Run updates during off-peak hours:**
   ```php
   // In routes/console.php
   Schedule::command('assets:update-book-values')
       ->dailyAt('02:00');  // 2 AM
   ```

## 🎓 How the System Works

### 1. Scheduler Entry Point

**Cron/Task Scheduler** → `php artisan schedule:run` (every minute)

### 2. Laravel Checks Schedule

Laravel reads `routes/console.php` and checks which tasks are due.

### 3. Execute Due Tasks

If current time matches schedule, Laravel runs the command:
```bash
php artisan assets:update-book-values
```

### 4. Command Logic

Located in `app/Console/Commands/UpdateAssetBookValues.php`:

```php
1. Fetch all assets from database
2. For each asset:
   - Get purchase_date, acq_cost, estimate_life
   - Calculate: days_elapsed = today - purchase_date
   - Calculate: daily_depreciation = acq_cost / (estimate_life × 365)
   - Calculate: new_book_value = max(1, acq_cost - (daily_depreciation × days_elapsed))
   - Compare with current book_value
   - If different, update database
3. Log results
```

### 5. Model Calculation

Located in `app/Models/Asset.php`:

```php
public function calculateBookValue($asOfDate = null) {
    $daysElapsed = $purchaseDate->diffInDays($asOfDate);
    $totalLifeDays = $this->estimate_life * 365;
    $dailyDepreciation = $this->acq_cost / $totalLifeDays;
    $bookValue = max(1, $this->acq_cost - ($dailyDepreciation * $daysElapsed));

    return [
        'book_value' => round($bookValue, 2),
        'daily_depreciation' => round($dailyDepreciation, 2),
        // ... more data
    ];
}
```

## 📞 Support

### Check Documentation

1. **Windows Setup:** `SCHEDULER_SETUP_WINDOWS.md`
2. **Ubuntu Setup:** `SCHEDULER_SETUP_UBUNTU.md`
3. **Quick Start:** `UBUNTU_DEPLOYMENT_QUICK_START.md`

### Check Logs

- `storage/logs/laravel.log`
- `storage/logs/scheduler.log`
- `storage/logs/cron.log` (Linux)

### Test Commands

```bash
# Test scheduler
php artisan schedule:list
php artisan schedule:run

# Test book value update
php artisan assets:update-book-values

# View database
php artisan tinker
>>> \App\Models\Asset::all()->pluck('book_value', 'asset_name');
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Scheduler not running | Check cron/Task Scheduler is active |
| Permission errors | Fix storage permissions (775) |
| Book values not changing | Verify purchase_date, acq_cost, estimate_life are set |
| Database connection | Check .env configuration |
| PHP not found | Add PHP to system PATH |

## 🎉 Success Checklist

- [ ] Scheduler configured (cron or Task Scheduler)
- [ ] Test run successful: `php artisan assets:update-book-values`
- [ ] Schedule list shows tasks: `php artisan schedule:list`
- [ ] Book values are decreasing
- [ ] Logs are being written
- [ ] No errors in laravel.log
- [ ] Permissions set correctly
- [ ] Documentation reviewed
- [ ] Monitoring in place

---

**🎯 Your assets now automatically depreciate daily!**

For questions or issues, check the logs and documentation files listed above.
