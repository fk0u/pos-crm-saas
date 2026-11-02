#!/usr/bin/env bash

set -e

VPS_HOST="${1:-kou@100.115.253.55}"
TARGET_DIR="~/projects/pos-crm-saas"

echo "=========================================================="
echo "🚀 Deploying Omnipoint POS & CRM to VPS ($VPS_HOST)..."
echo "=========================================================="

echo "[1/4] Ensuring remote target directory exists..."
ssh -o BatchMode=yes "$VPS_HOST" "mkdir -p $TARGET_DIR"

echo "[2/4] Synchronizing codebase via rsync..."
rsync -avz --delete \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude 'vendor' \
    --exclude 'database/database.sqlite' \
    --exclude '.env' \
    ./ "$VPS_HOST:$TARGET_DIR/"

echo "[3/4] Preparing remote .env.docker..."
ssh -o BatchMode=yes "$VPS_HOST" "cd $TARGET_DIR && test -f .env || cp .env.docker .env"

echo "[4/4] Building and launching Docker Compose containers on VPS..."
ssh -o BatchMode=yes "$VPS_HOST" "cd $TARGET_DIR && docker compose down && docker compose build && docker compose up -d"

echo "=========================================================="
echo "✅ Deployment completed successfully!"
echo "=========================================================="
ssh -o BatchMode=yes "$VPS_HOST" "cd $TARGET_DIR && docker compose ps"
