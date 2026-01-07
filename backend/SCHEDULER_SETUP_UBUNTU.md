# Laravel Scheduler Setup for Ubuntu Linux - Production Deployment

## Overview
Complete guide for setting up automatic daily book value depreciation on Ubuntu server in production.

## Prerequisites

- Ubuntu Server (18.04, 20.04, 22.04, or 24.04)
- PHP 8.2 or higher installed
- Laravel application deployed
- Web server (Nginx/Apache) configured
- Database (PostgreSQL) running

## Quick Start - Cron Job Setup (Recommended)

### Step 1: Edit Crontab

Open the crontab editor for your web server user (usually `www-data` or your deployment user):

```bash
# If using www-data user
sudo crontab -u www-data -e

# OR if using your deployment user (e.g., ubuntu, deploy, etc.)
crontab -e
```

### Step 2: Add Laravel Scheduler Cron Entry

Add this single line at the end of the crontab file:

```cron
* * * * * cd /var/www/mis-system/backend && php artisan schedule:run >> /dev/null 2>&1
```

**Important:** Replace `/var/www/mis-system/backend` with your actual application path.

### Step 3: Verify Crontab

View the installed crontab to confirm:

```bash
# For www-data user
sudo crontab -u www-data -l

# OR for your user
crontab -l
```

You should see your Laravel scheduler entry.

### Step 4: Test the Scheduler

```bash
cd /var/www/mis-system/backend

# Test scheduler manually
php artisan schedule:run

# View scheduled tasks
php artisan schedule:list

# Test book value update
php artisan assets:update-book-values
```

## Alternative: Cron with Logging (Recommended for Debugging)

For production monitoring, use this cron entry with logging:

```cron
* * * * * cd /var/www/mis-system/backend && php artisan schedule:run >> storage/logs/cron.log 2>&1
```

This logs all cron output to `storage/logs/cron.log` for debugging.

## Production Setup - Systemd Service (Advanced)

For better control and monitoring, create a systemd service.

### Step 1: Create Service File

```bash
sudo nano /etc/systemd/system/laravel-scheduler.service
```

### Step 2: Add Service Configuration

```ini
[Unit]
Description=Laravel Scheduler for MIS System
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/mis-system/backend
ExecStart=/usr/bin/php artisan schedule:work
Restart=always
RestartSec=3

# Environment variables
Environment="PATH=/usr/local/bin:/usr/bin:/bin"

# Logging
StandardOutput=append:/var/www/mis-system/backend/storage/logs/scheduler.log
StandardError=append:/var/www/mis-system/backend/storage/logs/scheduler-error.log

[Install]
WantedBy=multi-user.target
```

**Important:** Update paths and user/group according to your setup.

### Step 3: Enable and Start Service

```bash
# Reload systemd to recognize new service
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable laravel-scheduler

# Start the service
sudo systemctl start laravel-scheduler

# Check status
sudo systemctl status laravel-scheduler
```

### Step 4: Service Management Commands

```bash
# Start service
sudo systemctl start laravel-scheduler

# Stop service
sudo systemctl stop laravel-scheduler

# Restart service
sudo systemctl restart laravel-scheduler

# View service status
sudo systemctl status laravel-scheduler

# View logs
sudo journalctl -u laravel-scheduler -f

# View last 100 lines
sudo journalctl -u laravel-scheduler -n 100
```

## Production Setup - Supervisor (Alternative)

Supervisor is another popular process manager for Laravel applications.

### Step 1: Install Supervisor

```bash
sudo apt update
sudo apt install supervisor
```

### Step 2: Create Supervisor Configuration

```bash
sudo nano /etc/supervisor/conf.d/laravel-scheduler.conf
```

### Step 3: Add Configuration

```ini
[program:laravel-scheduler]
process_name=%(program_name)s
command=php /var/www/mis-system/backend/artisan schedule:work
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/mis-system/backend/storage/logs/scheduler.log
stopwaitsecs=3600
```

### Step 4: Start Supervisor

```bash
# Reread configuration
sudo supervisorctl reread

# Update supervisor
sudo supervisorctl update

# Start the scheduler
sudo supervisorctl start laravel-scheduler

# Check status
sudo supervisorctl status laravel-scheduler
```

### Step 5: Supervisor Management Commands

```bash
# Start scheduler
sudo supervisorctl start laravel-scheduler

# Stop scheduler
sudo supervisorctl stop laravel-scheduler

# Restart scheduler
sudo supervisorctl restart laravel-scheduler

# View status
sudo supervisorctl status

# View logs
sudo supervisorctl tail -f laravel-scheduler
```

## Verification

### 1. Check Scheduled Tasks

```bash
cd /var/www/mis-system/backend
php artisan schedule:list
```

Expected output:
```
  0 8  * * 1-5  php artisan assets:update-book-values
  0 12 * * 1-5  php artisan assets:update-book-values
  0 17 * * 1-5  php artisan assets:update-book-values
  0 *  * * 1-5  php artisan assets:catchup (8:00-18:00)
```

### 2. Manually Test Book Value Update

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
```

### 3. Monitor Logs

```bash
# Cron logs (if configured)
tail -f storage/logs/cron.log

# Scheduler logs
tail -f storage/logs/scheduler.log

# Laravel logs
tail -f storage/logs/laravel.log
```

### 4. Check Database

Verify book values are decreasing:

```bash
# Using PostgreSQL
sudo -u postgres psql mis_database

# Query recent assets
SELECT id, asset_name, acq_cost, purchase_date, book_value,
       EXTRACT(DAY FROM (CURRENT_DATE - purchase_date)) as days_elapsed,
       ROUND(acq_cost / (estimate_life * 365), 2) as daily_depreciation
FROM assets
ORDER BY purchase_date DESC
LIMIT 10;
```

## Cron Job Examples

### Basic Cron (Minimal)

```cron
* * * * * cd /var/www/mis-system/backend && php artisan schedule:run >> /dev/null 2>&1
```

### With Logging

```cron
* * * * * cd /var/www/mis-system/backend && php artisan schedule:run >> storage/logs/cron.log 2>&1
```

### With Full Path

```cron
* * * * * cd /var/www/mis-system/backend && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

### With Error Notification (Email)

```cron
* * * * * cd /var/www/mis-system/backend && php artisan schedule:run || echo "Scheduler failed" | mail -s "Laravel Scheduler Error" admin@example.com
```

## File Permissions

Ensure proper permissions for the scheduler to work:

```bash
# Set ownership (adjust user/group as needed)
sudo chown -R www-data:www-data /var/www/mis-system/backend

# Storage and cache directories must be writable
sudo chmod -R 775 /var/www/mis-system/backend/storage
sudo chmod -R 775 /var/www/mis-system/backend/bootstrap/cache

# Logs directory
sudo chmod -R 775 /var/www/mis-system/backend/storage/logs
```

## Environment Configuration

### 1. Check PHP CLI Path

```bash
which php
# Output: /usr/bin/php
```

Use this path in cron jobs if needed.

### 2. Verify PHP Version

```bash
php -v
# Should be PHP 8.2 or higher
```

### 3. Check Laravel Environment

```bash
cd /var/www/mis-system/backend
php artisan --version
php artisan env
```

## Troubleshooting

### Cron Not Running

**Problem:** Scheduler doesn't execute

**Solutions:**

1. **Check cron service status:**
   ```bash
   sudo systemctl status cron
   # OR on older systems
   sudo service cron status
   ```

2. **Restart cron service:**
   ```bash
   sudo systemctl restart cron
   # OR
   sudo service cron restart
   ```

3. **Check syslog for cron entries:**
   ```bash
   sudo grep CRON /var/log/syslog
   ```

4. **Verify crontab syntax:**
   ```bash
   # Check for errors
   sudo crontab -u www-data -l
   ```

### Permission Denied Errors

**Problem:** Scheduler can't write logs or access files

**Solutions:**

```bash
# Fix storage permissions
sudo chown -R www-data:www-data /var/www/mis-system/backend/storage
sudo chmod -R 775 /var/www/mis-system/backend/storage

# Fix cache permissions
sudo chmod -R 775 /var/www/mis-system/backend/bootstrap/cache

# Check SELinux (if enabled)
sudo setenforce 0  # Temporarily disable to test
```

### Book Values Not Updating

**Problem:** Scheduler runs but values don't change

**Check:**

1. **Run update manually with verbose output:**
   ```bash
   cd /var/www/mis-system/backend
   php artisan assets:update-book-values -v
   ```

2. **Check Laravel logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

3. **Verify database connection:**
   ```bash
   php artisan tinker
   >>> \DB::connection()->getPdo();
   >>> \App\Models\Asset::count();
   ```

4. **Check asset data:**
   ```bash
   php artisan tinker
   >>> $asset = \App\Models\Asset::first();
   >>> $asset->calculateBookValue();
   ```

### Systemd Service Won't Start

**Problem:** Service fails to start

**Solutions:**

1. **Check service status:**
   ```bash
   sudo systemctl status laravel-scheduler -l
   ```

2. **View detailed logs:**
   ```bash
   sudo journalctl -u laravel-scheduler -n 50 --no-pager
   ```

3. **Check file paths and permissions:**
   ```bash
   ls -la /var/www/mis-system/backend/artisan
   sudo -u www-data php /var/www/mis-system/backend/artisan schedule:work
   ```

4. **Reload and restart:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart laravel-scheduler
   ```

## Monitoring and Alerts

### 1. Create Health Check Script

```bash
sudo nano /usr/local/bin/check-scheduler.sh
```

```bash
#!/bin/bash

LOG_FILE="/var/www/mis-system/backend/storage/logs/scheduler.log"
ALERT_EMAIL="admin@example.com"

# Check if scheduler ran in last 2 minutes
if ! grep -q "$(date -d '2 minutes ago' '+%Y-%m-%d %H:%M')" "$LOG_FILE"; then
    echo "Laravel scheduler may not be running!" | mail -s "Scheduler Alert" "$ALERT_EMAIL"
fi
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/check-scheduler.sh
```

### 2. Add Monitoring Cron

```cron
*/5 * * * * /usr/local/bin/check-scheduler.sh
```

## Production Deployment Checklist

- [ ] Cron job added to www-data or deployment user
- [ ] Cron service running and enabled
- [ ] PHP path verified in cron
- [ ] File permissions set correctly (775 for storage)
- [ ] Tested manual scheduler run
- [ ] Verified book values are updating
- [ ] Logs directory writable
- [ ] Monitoring/alerting configured
- [ ] Systemd service OR Supervisor configured (optional)
- [ ] Health checks in place
- [ ] Documentation updated with actual paths

## Performance Optimization

### 1. Enable Laravel Queue for Heavy Tasks

If you have many assets, consider using queues:

```bash
# In routes/console.php, modify to use queue
Schedule::command('assets:update-book-values')
    ->dailyAt('08:00')
    ->runInBackground();
```

### 2. Database Optimization

Add indexes for performance:

```sql
CREATE INDEX idx_assets_purchase_date ON assets(purchase_date);
CREATE INDEX idx_assets_estimate_life ON assets(estimate_life);
```

### 3. Cache Configuration

Ensure Laravel cache is configured:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Available Artisan Commands

```bash
# Update book values (smart - only updates changed values)
php artisan assets:update-book-values

# Recalculate all book values (force update)
php artisan assets:recalculate-book-values

# Run all catch-up tasks (book values + status transitions)
php artisan assets:catchup

# Transition asset statuses
php artisan assets:transition-statuses

# List scheduled tasks
php artisan schedule:list

# Run scheduler once
php artisan schedule:run

# Run scheduler continuously
php artisan schedule:work

# Test scheduler (shows what would run)
php artisan schedule:test
```

## Support and Maintenance

### Regular Maintenance Tasks

```bash
# Weekly: Clear old logs
find storage/logs -name "*.log" -mtime +30 -delete

# Monthly: Optimize database
php artisan optimize:clear

# Check disk space
df -h
```

### Backup Scheduler Configuration

```bash
# Backup crontab
sudo crontab -u www-data -l > ~/crontab-backup-$(date +%Y%m%d).txt

# Backup systemd service
sudo cp /etc/systemd/system/laravel-scheduler.service ~/scheduler-service-backup-$(date +%Y%m%d).service
```

## Security Considerations

1. **Use dedicated user for Laravel:**
   - Don't run as root
   - Use www-data or dedicated deployment user

2. **Restrict file permissions:**
   - 644 for files
   - 755 for directories
   - 775 for storage and cache

3. **Secure environment file:**
   ```bash
   chmod 600 /var/www/mis-system/backend/.env
   ```

4. **Enable firewall:**
   ```bash
   sudo ufw enable
   sudo ufw allow 'Nginx Full'
   ```

## Conclusion

Your Laravel scheduler is now configured for production on Ubuntu. Book values will automatically decrease daily based on depreciation calculations.

**Recommended Approach:**
- **Development:** Use `schedule:work` command or Windows Task Scheduler
- **Production:** Use cron job (simple) or systemd service (advanced)

For questions or issues, check:
- `/var/www/mis-system/backend/storage/logs/laravel.log`
- `/var/www/mis-system/backend/storage/logs/scheduler.log`
- `sudo grep CRON /var/log/syslog`
