#!/bin/bash
set -e

PROJECT_DIR="/var/www/staging/mis-system"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "======================================"
echo " MIS-SYSTEM — Staging Deploy"
echo "======================================"

echo "[1/6] Pulling latest code from staging..."
git -C "$PROJECT_DIR" pull origin staging

echo "[2/6] Installing backend dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction --working-dir="$BACKEND_DIR"

echo "[3/6] Running database migrations..."
php "$BACKEND_DIR/artisan" migrate --force

echo "[4/6] Caching config, routes, views..."
php "$BACKEND_DIR/artisan" config:cache
php "$BACKEND_DIR/artisan" route:cache
php "$BACKEND_DIR/artisan" view:cache

echo "[5/6] Building frontend..."
npm ci --prefix "$FRONTEND_DIR"
npm run build --prefix "$FRONTEND_DIR"

echo "[6/6] Restarting services..."
pm2 restart mis-helpdesk-realtime

echo ""
echo "✓ MIS Staging deploy complete!"
