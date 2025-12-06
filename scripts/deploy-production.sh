#!/bin/bash
# =============================================
# CEO Gala - Production Deploy (Minimal Files)
# =============================================
# Usage: bash scripts/deploy-production.sh
# Only uploads production-necessary files

set -e

# Configuration
VPS_USER="root"
VPS_HOST="srv751179.hstgr.cloud"
VPS_PATH="/var/www/ceog"
SSH_PORT="22"

echo "🚀 CEO Gala - Production Deployment"
echo "===================================="
echo ""

# Check if rsync is installed
if ! command -v rsync &> /dev/null; then
    echo "❌ rsync not installed. Install with: sudo apt install rsync"
    exit 1
fi

echo "📦 Syncing production files to VPS..."
echo "   Excluding: docs, screenshots, tests, .bmad, etc."
echo ""

# Rsync with exclusions
rsync -avz --progress \
    --exclude-from='.deployignore' \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    ./ "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/"

echo ""
echo "📡 Running build on VPS..."

ssh "${VPS_USER}@${VPS_HOST}" << 'EOF'
    cd /var/www/ceog

    echo "📦 Installing dependencies..."
    npm install --production=false

    echo "🔧 Generating Prisma client..."
    npx prisma generate

    echo "🏗️ Building Next.js..."
    npm run build

    echo "🔄 Restarting PM2..."
    pm2 restart ceog || pm2 start npm --name "ceog" -- start
    pm2 save

    echo ""
    echo "✅ Deployment complete!"
    pm2 status
EOF

echo ""
echo "===================================="
echo "✅ Production deployment finished!"
echo "===================================="
