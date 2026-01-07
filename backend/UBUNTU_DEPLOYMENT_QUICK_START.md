# Ubuntu Production Deployment - Quick Start Guide

## 📋 Pre-Deployment Checklist

- [ ] Ubuntu Server 20.04+ installed
- [ ] PHP 8.2+ installed
- [ ] PostgreSQL database running
- [ ] Nginx/Apache configured
- [ ] Application deployed to server
- [ ] `.env` file configured
- [ ] Database migrated: `php artisan migrate`
- [ ] Dependencies installed: `composer install --optimize-autoloader --no-dev`

## 🚀 Quick Deployment (5 Minutes)

### Method 1: Automated Setup (Recommended)

```bash
# Navigate to application
cd /var/www/mis-system/backend

# Make setup script executable
chmod +x setup-scheduler-ubuntu.sh

# Run automated setup
./setup-scheduler-ubuntu.sh
```

Done! The script will:
- ✅ Add cron job automatically
- ✅ Set file permissions
- ✅ Test the scheduler
- ✅ Verify book value updates

### Method 2: Manual Setup (3 Commands)

```bash
# 1. Add cron job
(crontab -l 2>/dev/null; echo "* * * * * cd /var/www/mis-system/backend && php artisan schedule:run >> /dev/null 2>&1") | crontab -

# 2. Set permissions
sudo chmod -R 775 /var/www/mis-system/backend/storage
sudo chmod -R 775 /var/www/mis-system/backend/bootstrap/cache

# 3. Test
cd /var/www/mis-system/backend && php artisan schedule:list
```

## ✅ Verify It's Working

```bash
# Check cron is installed
crontab -l | grep schedule:run

# Test book value update
php artisan assets:update-book-values

# View scheduled tasks
php artisan schedule:list
```

Expected output:
```
  0 8  * * 1-5  php artisan assets:update-book-values
  0 12 * * 1-5  php artisan assets:update-book-values
  0 17 * * 1-5  php artisan assets:update-book-values
```

## 📊 How It Works

**Automatic Daily Depreciation:**
```
Daily Depreciation = Acquisition Cost ÷ (Estimated Life × 365)
Book Value = MAX(₱1, Acquisition Cost - (Daily Depreciation × Days Elapsed))
```

**Schedule:**
- 8:00 AM - Morning update
- 12:00 PM - Midday update
- 5:00 PM - Evening update
- Hourly catch-up (8 AM - 6 PM)

All times are server time, weekdays only.

## 🔍 Monitoring

```bash
# View logs
tail -f storage/logs/laravel.log

# Check cron logs (if logging enabled)
tail -f storage/logs/cron.log

# Check last cron execution
sudo grep CRON /var/log/syslog | tail -20
```

## 🆘 Troubleshooting

### Cron not running?

```bash
# Check cron service
sudo systemctl status cron

# Restart cron
sudo systemctl restart cron
```

### Permission errors?

```bash
# Fix ownership (adjust user as needed)
sudo chown -R www-data:www-data /var/www/mis-system/backend

# Fix permissions
sudo chmod -R 775 /var/www/mis-system/backend/storage
```

### Book values not updating?

```bash
# Run manually with output
php artisan assets:update-book-values -v

# Check Laravel logs
tail -f storage/logs/laravel.log
```

## 🔧 Advanced Setup (Optional)

### Systemd Service (Better Control)

```bash
# Copy service file
sudo cp laravel-scheduler.service /etc/systemd/system/

# Edit paths in service file
sudo nano /etc/systemd/system/laravel-scheduler.service

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable laravel-scheduler
sudo systemctl start laravel-scheduler

# Check status
sudo systemctl status laravel-scheduler
```

### Supervisor (Alternative)

```bash
# Install
sudo apt install supervisor

# Copy config
sudo cp laravel-scheduler.conf /etc/supervisor/conf.d/

# Edit paths in config
sudo nano /etc/supervisor/conf.d/laravel-scheduler.conf

# Start
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-scheduler
```

## 📦 Included Files

- `setup-scheduler-ubuntu.sh` - Automated setup script
- `laravel-scheduler.service` - Systemd service file
- `laravel-scheduler.conf` - Supervisor configuration
- `SCHEDULER_SETUP_UBUNTU.md` - Detailed documentation

## 🎯 Production Best Practices

1. **Use dedicated user (not root)**
   ```bash
   sudo -u www-data crontab -e
   ```

2. **Enable logging for debugging**
   ```cron
   * * * * * cd /path && php artisan schedule:run >> storage/logs/cron.log 2>&1
   ```

3. **Monitor disk space**
   ```bash
   # Clean old logs weekly
   find storage/logs -name "*.log" -mtime +30 -delete
   ```

4. **Set up alerts**
   - Monitor `storage/logs/laravel.log` for errors
   - Set up email alerts for failures
   - Use monitoring tools (UptimeRobot, New Relic, etc.)

## 🔐 Security

```bash
# Secure .env file
chmod 600 .env

# Restrict file permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# Storage and cache writable
chmod -R 775 storage bootstrap/cache
```

## 📞 Need More Help?

- **Full documentation:** `SCHEDULER_SETUP_UBUNTU.md`
- **Windows setup:** `SCHEDULER_SETUP_WINDOWS.md`
- **Test commands:** `php artisan schedule:list`
- **Laravel docs:** https://laravel.com/docs/scheduling

---

**Your book values will now automatically decrease daily! 🎉**

For questions, check the logs in `storage/logs/`
