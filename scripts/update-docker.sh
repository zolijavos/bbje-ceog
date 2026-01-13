#!/bin/bash
# CEO Gala - Docker Update Script
# Usage: ./scripts/update-docker.sh

set -e

echo "🔄 CEO Gala Docker Update"
echo "========================="

cd "$(dirname "$0")/.."

# Check current status
echo ""
echo "📊 Current status:"
docker compose -f docker-compose.prod.yml ps

# Pull latest code
echo ""
echo "📥 Pulling latest code..."
git pull origin main

# Check if Prisma schema changed
if git diff HEAD~1 --name-only | grep -q "prisma/schema.prisma"; then
    echo ""
    echo "🗄️  Schema changed - running migrations..."
    docker compose -f docker-compose.prod.yml build --no-cache app
    docker compose -f docker-compose.prod.yml run --rm app npx prisma db push
else
    echo ""
    echo "📦 Building new image..."
    docker compose -f docker-compose.prod.yml build app
fi

# Restart with new image
echo ""
echo "🚀 Deploying new version..."
docker compose -f docker-compose.prod.yml up -d --no-deps app

# Show status
echo ""
echo "✅ Update complete!"
echo ""
docker compose -f docker-compose.prod.yml ps

echo ""
echo "📝 View logs: docker compose -f docker-compose.prod.yml logs -f app"
