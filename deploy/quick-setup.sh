#!/bin/bash
# =============================================
# CEO Gala - Quick Non-Interactive Setup
# =============================================
# Creates .env and ecosystem.config.js with provided or default values.
# Useful for testing or when you want to configure manually.
#
# Usage:
#   bash deploy/quick-setup.sh                    # Uses defaults
#   bash deploy/quick-setup.sh --db-url "mysql://..." --domain "ceogala.hu"
#
# Options:
#   --db-url URL       Database connection URL (required for production)
#   --domain DOMAIN    Domain name (default: localhost)
#   --port PORT        Application port (default: 3000)
#   --app-name NAME    PM2 app name (default: ceog)
#   --skip-smtp        Skip SMTP validation requirement
# =============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Auto-detect install path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_PATH="$(dirname "$SCRIPT_DIR")"

# Default values
DB_URL=""
DOMAIN="localhost"
PORT="3000"
APP_NAME="ceog"
SKIP_SMTP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --db-url)
            DB_URL="$2"
            shift 2
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --app-name)
            APP_NAME="$2"
            shift 2
            ;;
        --skip-smtp)
            SKIP_SMTP=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  CEO Gala - Quick Setup${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Install path: ${GREEN}$INSTALL_PATH${NC}"
echo -e "  App name:     ${GREEN}$APP_NAME${NC}"
echo -e "  Port:         ${GREEN}$PORT${NC}"
echo -e "  Domain:       ${GREEN}$DOMAIN${NC}"
echo ""

# Check if .env already exists
if [ -f "$INSTALL_PATH/.env" ]; then
    echo -e "${YELLOW}⚠ .env already exists - backing up to .env.backup${NC}"
    cp "$INSTALL_PATH/.env" "$INSTALL_PATH/.env.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Check database URL
if [ -z "$DB_URL" ]; then
    echo -e "${YELLOW}⚠ No database URL provided!${NC}"
    echo "  Using placeholder: mysql://user:password@localhost:3306/ceog"
    echo "  Edit .env file to set the correct DATABASE_URL"
    DB_URL="mysql://user:password@localhost:3306/ceog"
fi

# Generate secrets
echo -e "${CYAN}→ Generating secrets...${NC}"
APP_SECRET=$(openssl rand -hex 64)
QR_SECRET=$(openssl rand -hex 64)
NEXTAUTH_SECRET=$(openssl rand -hex 32)

# Determine APP_URL
if [ "$DOMAIN" = "localhost" ]; then
    APP_URL="http://localhost:$PORT"
else
    APP_URL="https://$DOMAIN"
fi

# Create .env file
echo -e "${CYAN}→ Creating .env file...${NC}"
cat > "$INSTALL_PATH/.env" <<EOF
# =============================================
# CEO Gala - Environment Configuration
# =============================================
# Generated: $(date)
# Quick setup - review and update as needed
# =============================================

# Database
DATABASE_URL="$DB_URL"

# Application
NODE_ENV="production"
APP_URL="$APP_URL"

# Secrets (auto-generated)
APP_SECRET="$APP_SECRET"
QR_SECRET="$QR_SECRET"

# NextAuth
NEXTAUTH_URL="$APP_URL"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Magic Link
MAGIC_LINK_EXPIRY_HOURS=24
NEXT_PUBLIC_MAGIC_LINK_EXPIRY_HOURS=24

# Show table numbers to guests
SHOW_TABLE_NUMBERS=true

# Stripe (update with your keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY"
STRIPE_SECRET_KEY="sk_test_YOUR_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_KEY"

# SMTP (update with your email service)
# Leave empty to disable email (app will still work for testing)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@$DOMAIN"
EOF

chmod 600 "$INSTALL_PATH/.env"
echo -e "${GREEN}✓ .env created${NC}"

# Create ecosystem.config.js
echo -e "${CYAN}→ Creating ecosystem.config.js...${NC}"
cat > "$INSTALL_PATH/ecosystem.config.js" <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: '.next/standalone/server.js',
    cwd: '$INSTALL_PATH',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    out_file: '/var/log/pm2/$APP_NAME-out.log',
    merge_logs: true,
    time: true
  }]
};
EOF
echo -e "${GREEN}✓ ecosystem.config.js created${NC}"

# Create log directory
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Edit .env to set correct DATABASE_URL"
echo "  2. Edit .env to set Stripe keys (if using payments)"
echo "  3. Edit .env to set SMTP settings (if using email)"
echo "  4. Run: bash deploy/start.sh"
echo ""
echo -e "${CYAN}Quick test (without email):${NC}"
echo "  bash deploy/start.sh"
echo ""
