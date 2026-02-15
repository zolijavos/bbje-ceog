#!/bin/bash

# ==================================
# CEO Gala - Manual VPS Deployment
# ==================================
# Run this script to manually deploy to VPS
# Usage: bash scripts/deploy-manual.sh

set -e  # Exit on error

echo "🚀 Starting manual deployment to VPS..."

# VPS Configuration
read -p "Enter VPS IP or hostname: " VPS_HOST
read -p "Enter SSH username (default: root): " VPS_USER
VPS_USER=${VPS_USER:-root}

read -p "Enter SSH port (default: 22): " VPS_PORT
VPS_PORT=${VPS_PORT:-22}

echo "📡 Connecting to ${VPS_USER}@${VPS_HOST}:${VPS_PORT}..."

# Deploy via SSH
ssh -p "$VPS_PORT" "${VPS_USER}@${VPS_HOST}" << 'DEPLOY_SCRIPT'
    set -e

    echo "🚀 Deployment started on VPS..."

    # Navigate to project directory
    cd /var/www/ceog-gala || exit 1

    # Pull latest changes
    echo "📥 Pulling latest changes from GitHub..."
    git pull origin main

    # Install/update dependencies
    echo "📦 Installing dependencies..."
    npm install

    # Run database migrations
    echo "🗄️ Running Prisma migrations..."
    npx prisma generate
    npx prisma migrate deploy

    # Build Next.js application
    echo "🏗️ Building Next.js application..."
    npm run build

    # Restart PM2 process
    echo "🔄 Restarting PM2 process..."
    pm2 restart ceog-gala || pm2 start npm --name "ceog-gala" -- start

    # Save PM2 process list
    pm2 save

    echo "✅ Deployment completed successfully!"

    # Show PM2 status
    echo ""
    echo "📊 PM2 Status:"
    pm2 status

    echo ""
    echo "📝 Recent logs:"
    pm2 logs ceog-gala --lines 20 --nostream
DEPLOY_SCRIPT

echo ""
echo "============================================"
echo "✅ Manual Deployment Complete!"
echo "============================================"
echo ""
echo "📋 Useful Commands:"
echo ""
echo "Check PM2 status:"
echo "  ssh ${VPS_USER}@${VPS_HOST} -p ${VPS_PORT} 'pm2 status'"
echo ""
echo "View logs:"
echo "  ssh ${VPS_USER}@${VPS_HOST} -p ${VPS_PORT} 'pm2 logs ceog-gala'"
echo ""
echo "Restart application:"
echo "  ssh ${VPS_USER}@${VPS_HOST} -p ${VPS_PORT} 'pm2 restart ceog-gala'"
echo ""
echo "============================================"
