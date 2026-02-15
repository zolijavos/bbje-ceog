#!/bin/bash

# ===========================================
# CEO Gala 2026 - Hostinger VPS Deploy Script
# ===========================================
# Usage:
#   1. Upload this script to VPS: scp scripts/deploy-vps.sh user@vps-ip:~/
#   2. SSH into VPS: ssh user@vps-ip
#   3. Run: chmod +x deploy-vps.sh && sudo ./deploy-vps.sh
# ===========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - MODIFY THESE
DOMAIN="ceogala.hu"
APP_NAME="ceog"
APP_DIR="/var/www/$APP_NAME"
DB_NAME="ceog"
DB_USER="ceog_user"
NODE_VERSION="20"
PORT="3000"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   CEO Gala 2026 - VPS Deployment${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./deploy-vps.sh)${NC}"
    exit 1
fi

# ===========================================
# STEP 1: System Update
# ===========================================
echo -e "${YELLOW}[1/8] Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# ===========================================
# STEP 2: Install Node.js
# ===========================================
echo -e "${YELLOW}[2/8] Installing Node.js ${NODE_VERSION}...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}Node.js $(node -v) installed${NC}"
else
    echo -e "${GREEN}Node.js $(node -v) already installed${NC}"
fi

# ===========================================
# STEP 3: Install MySQL
# ===========================================
echo -e "${YELLOW}[3/8] Installing MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    apt-get install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    echo -e "${GREEN}MySQL installed${NC}"
else
    echo -e "${GREEN}MySQL already installed${NC}"
fi

# ===========================================
# STEP 4: Install Nginx
# ===========================================
echo -e "${YELLOW}[4/8] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}Nginx installed${NC}"
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

# ===========================================
# STEP 5: Install PM2
# ===========================================
echo -e "${YELLOW}[5/8] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}PM2 installed${NC}"
else
    echo -e "${GREEN}PM2 already installed${NC}"
fi

# ===========================================
# STEP 6: Create MySQL Database
# ===========================================
echo -e "${YELLOW}[6/8] Setting up MySQL database...${NC}"
echo ""
echo -e "${BLUE}Enter a strong password for database user '${DB_USER}':${NC}"
read -s DB_PASS
echo ""

mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}Database '${DB_NAME}' created with user '${DB_USER}'${NC}"

# ===========================================
# STEP 7: Setup Application Directory
# ===========================================
echo -e "${YELLOW}[7/8] Setting up application directory...${NC}"
mkdir -p $APP_DIR
chown -R $SUDO_USER:$SUDO_USER $APP_DIR

# Generate secrets
APP_SECRET=$(openssl rand -hex 32)
QR_SECRET=$(openssl rand -hex 32)
NEXTAUTH_SECRET=$(openssl rand -hex 16)

# Create .env template
cat > $APP_DIR/.env.template <<EOF
# Database
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}"

# App Secrets (auto-generated)
APP_SECRET="${APP_SECRET}"
QR_SECRET="${QR_SECRET}"

# NextAuth
NEXTAUTH_URL="https://${DOMAIN}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# Stripe (add your keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email SMTP (configure later)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@${DOMAIN}"
SMTP_PASS="smtp_password"
EOF

echo -e "${GREEN}Created .env.template at ${APP_DIR}${NC}"

# ===========================================
# STEP 8: Configure Nginx
# ===========================================
echo -e "${YELLOW}[8/8] Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/$APP_NAME <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:${PORT};
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t && systemctl reload nginx

echo -e "${GREEN}Nginx configured for ${DOMAIN}${NC}"

# ===========================================
# SUMMARY
# ===========================================
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   Installation Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Upload your application code:"
echo -e "   ${YELLOW}scp -r ./* user@vps-ip:${APP_DIR}/${NC}"
echo ""
echo "2. SSH into VPS and setup app:"
echo -e "   ${YELLOW}cd ${APP_DIR}${NC}"
echo -e "   ${YELLOW}cp .env.template .env${NC}"
echo -e "   ${YELLOW}nano .env  # Add Stripe keys${NC}"
echo -e "   ${YELLOW}npm install${NC}"
echo -e "   ${YELLOW}npx prisma generate${NC}"
echo -e "   ${YELLOW}npx prisma db push${NC}"
echo -e "   ${YELLOW}npm run build${NC}"
echo ""
echo "3. Start with PM2:"
echo -e "   ${YELLOW}pm2 start npm --name \"${APP_NAME}\" -- start${NC}"
echo -e "   ${YELLOW}pm2 save${NC}"
echo -e "   ${YELLOW}pm2 startup${NC}"
echo ""
echo "4. Setup SSL (after DNS is configured):"
echo -e "   ${YELLOW}apt install certbot python3-certbot-nginx${NC}"
echo -e "   ${YELLOW}certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  pm2 status          - Check app status"
echo "  pm2 logs ${APP_NAME}      - View logs"
echo "  pm2 restart ${APP_NAME}   - Restart app"
echo "  pm2 monit           - Monitor resources"
echo ""
echo -e "${GREEN}Database credentials saved in: ${APP_DIR}/.env.template${NC}"
echo ""
