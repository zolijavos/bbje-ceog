#!/bin/bash

# ===========================================
# CEO Gala 2026 - Application Deploy Script
# ===========================================
# Run this locally to deploy/update the app to VPS
# Usage: ./scripts/deploy-app.sh user@vps-ip
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="ceog"
APP_DIR="/var/www/$APP_NAME"

# Check argument
if [ -z "$1" ]; then
    echo -e "${RED}Usage: ./scripts/deploy-app.sh user@vps-ip${NC}"
    echo "Example: ./scripts/deploy-app.sh root@123.45.67.89"
    exit 1
fi

VPS_HOST="$1"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   CEO Gala 2026 - Deploying to VPS${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# ===========================================
# STEP 1: Build locally
# ===========================================
echo -e "${YELLOW}[1/4] Building application locally...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Generate Prisma client
npx prisma generate

# Build Next.js
npm run build

echo -e "${GREEN}Build complete!${NC}"

# ===========================================
# STEP 2: Sync files to VPS
# ===========================================
echo -e "${YELLOW}[2/4] Syncing files to VPS...${NC}"

# Files/folders to exclude from sync
EXCLUDES=(
    "node_modules"
    ".git"
    ".env"
    ".env.local"
    ".next/cache"
    "*.log"
    ".DS_Store"
    "coverage"
    "tests"
    ".vscode"
    ".idea"
)

# Build rsync exclude arguments
EXCLUDE_ARGS=""
for item in "${EXCLUDES[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$item"
done

# Sync with rsync
rsync -avz --progress --delete \
    $EXCLUDE_ARGS \
    ./ ${VPS_HOST}:${APP_DIR}/

echo -e "${GREEN}Files synced!${NC}"

# ===========================================
# STEP 3: Install dependencies on VPS
# ===========================================
echo -e "${YELLOW}[3/4] Installing dependencies on VPS...${NC}"

ssh ${VPS_HOST} << 'ENDSSH'
cd /var/www/ceog
npm install --production
npx prisma generate
ENDSSH

echo -e "${GREEN}Dependencies installed!${NC}"

# ===========================================
# STEP 4: Restart application
# ===========================================
echo -e "${YELLOW}[4/4] Restarting application...${NC}"

ssh ${VPS_HOST} << 'ENDSSH'
cd /var/www/ceog

# Check if PM2 process exists
if pm2 list | grep -q "ceog"; then
    pm2 restart ceog
    echo "Application restarted"
else
    pm2 start npm --name "ceog" -- start
    pm2 save
    echo "Application started"
fi

# Show status
pm2 status
ENDSSH

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "View logs: ${YELLOW}ssh ${VPS_HOST} 'pm2 logs ceog'${NC}"
echo ""
