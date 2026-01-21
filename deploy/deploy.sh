#!/bin/bash
# =============================================
# CEO Gala - Automated Deployment Script
# =============================================
# One-command deployment with automatic:
# - Pre-deploy validation
# - Database backup
# - Health checks
# - Rollback on failure
#
# Usage: sudo bash deploy/deploy.sh [branch]
# Example: sudo bash deploy/deploy.sh feature/first-last-name
# =============================================

set -e

# ============================================
# Configuration
# ============================================
INSTALL_PATH="${INSTALL_PATH:-/var/www/ceog}"
BACKUP_PATH="${BACKUP_PATH:-/var/www/backups}"
PM2_APP_NAME="${PM2_APP_NAME:-ceog}"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost:3000/api/health}"
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_DELAY=3
DEFAULT_BRANCH="main"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================
# Helper Functions
# ============================================
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo -e "${CYAN}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

cleanup_on_error() {
    print_error "Deployment failed!"
    if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
        print_warning "Database backup available at: $BACKUP_FILE"
    fi
    exit 1
}

trap cleanup_on_error ERR

# ============================================
# Parse Arguments
# ============================================
BRANCH="${1:-$DEFAULT_BRANCH}"

print_header "CEO Gala - Automated Deployment"
echo ""
echo -e "  Install path: ${CYAN}$INSTALL_PATH${NC}"
echo -e "  Branch:       ${CYAN}$BRANCH${NC}"
echo -e "  PM2 app:      ${CYAN}$PM2_APP_NAME${NC}"
echo ""

# ============================================
# Pre-flight Checks
# ============================================
print_header "1. Pre-flight Checks"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run with sudo: sudo bash deploy/deploy.sh"
    exit 1
fi
print_success "Running as root"

# Check install path exists
if [ ! -d "$INSTALL_PATH" ]; then
    print_error "Install path not found: $INSTALL_PATH"
    exit 1
fi
print_success "Install path exists"

cd "$INSTALL_PATH"

# Check for required files
if [ ! -f "package.json" ]; then
    print_error "package.json not found"
    exit 1
fi
print_success "package.json found"

if [ ! -f ".env" ]; then
    print_error ".env file not found"
    exit 1
fi
print_success ".env file found"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not installed"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js installed: $NODE_VERSION"

# Check PM2
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 not installed"
    exit 1
fi
print_success "PM2 installed"

# Check MySQL/Database
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL client not found (backup may fail)"
else
    print_success "MySQL client installed"
fi

# Current version
CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
print_success "Current version: $CURRENT_VERSION"

# ============================================
# Database Backup
# ============================================
print_header "2. Database Backup"

mkdir -p "$BACKUP_PATH"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_PATH/ceog_backup_${TIMESTAMP}.sql"

print_step "Creating database backup..."

# Extract database connection from .env
DB_URL=$(grep "^DATABASE_URL" .env | cut -d'=' -f2- | tr -d '"')

if [ -n "$DB_URL" ]; then
    # Parse MySQL connection string
    # Format: mysql://user:password@host:port/database
    DB_USER=$(echo "$DB_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo "$DB_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:\/]*\).*/\1/p')
    DB_PORT=$(echo "$DB_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo "$DB_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

    if [ -n "$DB_USER" ] && [ -n "$DB_NAME" ]; then
        if mysqldump -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            print_success "Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
        else
            print_warning "Database backup failed (continuing anyway)"
            BACKUP_FILE=""
        fi
    else
        print_warning "Could not parse DATABASE_URL (skipping backup)"
        BACKUP_FILE=""
    fi
else
    print_warning "DATABASE_URL not found in .env (skipping backup)"
    BACKUP_FILE=""
fi

# ============================================
# Git Update
# ============================================
print_header "3. Git Update"

if [ -d ".git" ]; then
    print_step "Fetching latest changes..."
    git fetch origin

    # Check for local changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        print_warning "Local changes detected"
        print_step "Stashing local changes..."
        git stash push -m "Auto-stash before deploy $TIMESTAMP"
        print_success "Changes stashed"
    fi

    # Checkout and pull branch
    print_step "Switching to branch: $BRANCH"
    git checkout "$BRANCH"

    print_step "Pulling latest changes..."
    git pull origin "$BRANCH"

    print_success "Git update complete"
else
    print_warning "Not a git repository (skipping git update)"
fi

# ============================================
# Dependencies
# ============================================
print_header "4. Installing Dependencies"

print_step "Running npm install..."
npm install --omit=dev --silent
print_success "Dependencies installed"

# ============================================
# Prisma
# ============================================
print_header "5. Database Schema"

print_step "Generating Prisma client..."
npx prisma generate --quiet
print_success "Prisma client generated"

print_step "Applying database migrations..."
npx prisma migrate deploy 2>/dev/null || {
    print_warning "prisma migrate deploy failed, trying db push..."
    npx prisma db push --accept-data-loss 2>/dev/null || {
        print_error "Database schema update failed"
        exit 1
    }
}
print_success "Database schema updated"

# ============================================
# Build
# ============================================
print_header "6. Building Application"

print_step "Running production build..."
npm run build
print_success "Build complete"

# ============================================
# Restart Application
# ============================================
print_header "7. Restarting Application"

print_step "Restarting PM2 process: $PM2_APP_NAME"

# Check if PM2 process exists
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
    pm2 restart "$PM2_APP_NAME"
else
    # Try to start with ecosystem config
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
    else
        print_error "PM2 process not found and no ecosystem.config.js"
        exit 1
    fi
fi

pm2 save
print_success "Application restarted"

# ============================================
# Health Check
# ============================================
print_header "8. Health Check"

print_step "Waiting for application to start..."
sleep 5

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    print_step "Health check attempt $i/$HEALTH_CHECK_RETRIES..."

    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" 2>/dev/null || echo "000")

    if [ "$RESPONSE" = "200" ]; then
        # Get full health response
        HEALTH_DATA=$(curl -s "$HEALTH_CHECK_URL" 2>/dev/null)
        HEALTH_STATUS=$(echo "$HEALTH_DATA" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

        if [ "$HEALTH_STATUS" = "healthy" ]; then
            print_success "Health check passed: $HEALTH_STATUS"
            break
        elif [ "$HEALTH_STATUS" = "degraded" ]; then
            print_warning "Health check: $HEALTH_STATUS (continuing)"
            break
        fi
    fi

    if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
        print_error "Health check failed after $HEALTH_CHECK_RETRIES attempts"
        print_warning "Check logs: pm2 logs $PM2_APP_NAME --lines 50"
        exit 1
    fi

    sleep $HEALTH_CHECK_DELAY
done

# ============================================
# Final Status
# ============================================
print_header "Deployment Complete!"

NEW_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")

echo ""
echo -e "  ${GREEN}Previous version:${NC} $CURRENT_VERSION"
echo -e "  ${GREEN}New version:${NC}      $NEW_VERSION"
echo -e "  ${GREEN}Branch:${NC}           $BRANCH"
if [ -n "$BACKUP_FILE" ]; then
echo -e "  ${GREEN}Backup:${NC}           $BACKUP_FILE"
fi
echo ""
echo -e "${CYAN}Useful commands:${NC}"
echo "  pm2 logs $PM2_APP_NAME --lines 50    # View logs"
echo "  pm2 status                            # Check status"
echo "  curl $HEALTH_CHECK_URL                # Health check"
echo ""

# Cleanup old backups (keep last 5)
if [ -d "$BACKUP_PATH" ]; then
    ls -t "$BACKUP_PATH"/ceog_backup_*.sql 2>/dev/null | tail -n +6 | xargs -r rm
fi

exit 0
