#!/usr/bin/env bash

set -e

VPS_HOST="${1:-ec2-vps}"
TARGET_DIR="${2:-~/projects/pos-crm-saas}"
APP_URL="${3:-https://pos.kousozo.tech}"

echo "=========================================================="
echo "🚀 Deploying Omnipoint POS & CRM to VPS ($VPS_HOST)..."
echo "Target Directory: $TARGET_DIR"
echo "Public Domain:    $APP_URL"
echo "=========================================================="

echo "[1/4] Ensuring remote target directory exists..."
ssh "$VPS_HOST" "mkdir -p $TARGET_DIR"

echo "[2/4] Synchronizing codebase via rsync..."
rsync -avz --delete \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude 'vendor' \
    --exclude 'database/database.sqlite' \
    --exclude '.env' \
    ./ "$VPS_HOST:$TARGET_DIR/"

echo "[3/4] Preparing remote .env configuration..."
ssh "$VPS_HOST" "cd $TARGET_DIR && test -f .env || cp .env.docker .env && sed -i 's|^APP_URL=.*|APP_URL=$APP_URL|g' .env"

echo "[4/4] Building and launching Docker Compose containers on VPS..."
ssh "$VPS_HOST" "cd $TARGET_DIR && sudo docker compose down 2>/dev/null || true && sudo docker compose build && sudo docker compose up -d"

echo "=========================================================="
echo "✅ Deployment completed successfully!"
echo "=========================================================="
ssh "$VPS_HOST" "cd $TARGET_DIR && sudo docker compose ps"
