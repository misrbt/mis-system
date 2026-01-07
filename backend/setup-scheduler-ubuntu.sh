#!/bin/bash

###############################################################################
# Laravel Scheduler Setup Script for Ubuntu
# This script automates the setup of automatic daily book value depreciation
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Laravel Scheduler Setup for Ubuntu${NC}"
echo -e "${GREEN}Auto Book Value Depreciation${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Detect application path
APP_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "${YELLOW}Application path:${NC} $APP_PATH"

# Detect current user
CURRENT_USER=$(whoami)
echo -e "${YELLOW}Current user:${NC} $CURRENT_USER"

# Ask for confirmation
echo ""
echo -e "${YELLOW}This script will:${NC}"
echo "  1. Add cron job for Laravel scheduler"
echo "  2. Set proper file permissions"
echo "  3. Test the scheduler"
echo "  4. Verify book value updates"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Setup cancelled.${NC}"
    exit 1
fi

# Check if PHP is installed
echo ""
echo -e "${YELLOW}Checking PHP installation...${NC}"
if ! command -v php &> /dev/null; then
    echo -e "${RED}Error: PHP is not installed or not in PATH${NC}"
    echo "Please install PHP 8.2 or higher first."
    exit 1
fi

PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
echo -e "${GREEN}✓ PHP version: $PHP_VERSION${NC}"

# Check if artisan exists
if [ ! -f "$APP_PATH/artisan" ]; then
    echo -e "${RED}Error: artisan file not found in $APP_PATH${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Laravel installation found${NC}"

# Set permissions
echo ""
echo -e "${YELLOW}Setting file permissions...${NC}"

# Make sure storage and cache directories are writable
chmod -R 775 "$APP_PATH/storage" 2>/dev/null || sudo chmod -R 775 "$APP_PATH/storage"
chmod -R 775 "$APP_PATH/bootstrap/cache" 2>/dev/null || sudo chmod -R 775 "$APP_PATH/bootstrap/cache"

echo -e "${GREEN}✓ Permissions set${NC}"

# Test scheduler
echo ""
echo -e "${YELLOW}Testing scheduler...${NC}"
cd "$APP_PATH"

if php artisan schedule:list &>/dev/null; then
    echo -e "${GREEN}✓ Scheduler is working${NC}"
    echo ""
    php artisan schedule:list
else
    echo -e "${RED}Error: Scheduler test failed${NC}"
    exit 1
fi

# Test book value update
echo ""
echo -e "${YELLOW}Testing book value update...${NC}"

if php artisan assets:update-book-values &>/dev/null; then
    echo -e "${GREEN}✓ Book value update is working${NC}"
else
    echo -e "${RED}Warning: Book value update encountered issues${NC}"
    echo "Check logs at: storage/logs/laravel.log"
fi

# Add cron job
echo ""
echo -e "${YELLOW}Setting up cron job...${NC}"

CRON_CMD="* * * * * cd $APP_PATH && php artisan schedule:run >> storage/logs/cron.log 2>&1"

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "schedule:run"; then
    echo -e "${YELLOW}⚠ Cron job already exists${NC}"
    crontab -l | grep "schedule:run"
    echo ""
    read -p "Update existing cron job? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove old entry and add new one
        (crontab -l 2>/dev/null | grep -v "schedule:run"; echo "$CRON_CMD") | crontab -
        echo -e "${GREEN}✓ Cron job updated${NC}"
    else
        echo -e "${YELLOW}Keeping existing cron job${NC}"
    fi
else
    # Add new cron entry
    (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
    echo -e "${GREEN}✓ Cron job added${NC}"
fi

# Verify cron installation
echo ""
echo -e "${YELLOW}Verifying cron installation...${NC}"
if crontab -l | grep -q "schedule:run"; then
    echo -e "${GREEN}✓ Cron job is installed:${NC}"
    crontab -l | grep "schedule:run"
else
    echo -e "${RED}Error: Cron job installation failed${NC}"
    exit 1
fi

# Check cron service
echo ""
echo -e "${YELLOW}Checking cron service...${NC}"

if systemctl is-active --quiet cron 2>/dev/null; then
    echo -e "${GREEN}✓ Cron service is running${NC}"
elif systemctl is-active --quiet cronie 2>/dev/null; then
    echo -e "${GREEN}✓ Cronie service is running${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Could not verify cron service status${NC}"
    echo "You may need to start the cron service manually:"
    echo "  sudo systemctl start cron"
fi

# Final summary
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${GREEN}✓ Laravel scheduler is now configured${NC}"
echo -e "${GREEN}✓ Book values will automatically decrease daily${NC}"
echo ""
echo -e "${YELLOW}How it works:${NC}"
echo "  • Cron runs every minute: schedule:run"
echo "  • Laravel checks scheduled tasks"
echo "  • Book values update at: 8 AM, 12 PM, 5 PM (weekdays)"
echo "  • Hourly catch-up runs: 8 AM - 6 PM (weekdays)"
echo ""
echo -e "${YELLOW}Monitoring:${NC}"
echo "  • Cron log: $APP_PATH/storage/logs/cron.log"
echo "  • Laravel log: $APP_PATH/storage/logs/laravel.log"
echo "  • Scheduler log: $APP_PATH/storage/logs/scheduler.log"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  • View cron jobs: crontab -l"
echo "  • Test scheduler: php artisan schedule:run"
echo "  • List tasks: php artisan schedule:list"
echo "  • Update now: php artisan assets:update-book-values"
echo "  • View logs: tail -f storage/logs/cron.log"
echo ""
echo -e "${YELLOW}For production deployment on Ubuntu server,${NC}"
echo -e "${YELLOW}see: SCHEDULER_SETUP_UBUNTU.md${NC}"
echo ""
