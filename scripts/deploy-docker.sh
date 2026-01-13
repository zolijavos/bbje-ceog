#!/bin/bash
# CEO Gala - Docker Deployment Script
# Usage: ./scripts/deploy-docker.sh

set -e

echo "🚀 CEO Gala Docker Deployment"
echo "=============================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "   Copy .env.docker.example to .env and configure it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed!"
    echo "   Install Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not available!"
    exit 1
fi

echo ""
echo "📦 Building Docker image..."
docker compose -f docker-compose.prod.yml build --no-cache

echo ""
echo "🗄️  Starting database..."
docker compose -f docker-compose.prod.yml up -d db
echo "   Waiting for MySQL to be ready..."
sleep 15

echo ""
echo "🔧 Running database migrations..."
docker compose -f docker-compose.prod.yml run --rm app npx prisma db push

echo ""
echo "🌐 Starting all services..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🔗 URLs:"
echo "   App:     http://localhost:3000"
echo "   Admin:   http://localhost:3000/admin"
echo ""
echo "📝 Useful commands:"
echo "   Logs:    docker compose -f docker-compose.prod.yml logs -f"
echo "   Stop:    docker compose -f docker-compose.prod.yml down"
echo "   Restart: docker compose -f docker-compose.prod.yml restart"
echo "   Seed DB: docker compose -f docker-compose.prod.yml exec app npx prisma db seed"
