#!/bin/bash

# ==================================
# CEO Gala - Hostinger VPS Initial Setup
# ==================================
# Run this script ONCE on fresh VPS to setup environment
# Usage: bash scripts/vps-initial-setup.sh

set -e  # Exit on error

echo "🚀 Starting Hostinger VPS Initial Setup..."

# ==================================
# 1. Update System
# ==================================
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# ==================================
# 2. Install Node.js 18+ (via nvm)
# ==================================
echo "📦 Installing Node.js 18 via nvm..."

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

echo "✅ Node.js installed: $(node -v)"
echo "✅ npm installed: $(npm -v)"

# ==================================
# 3. Install MySQL 8.0
# ==================================
echo "🗄️ Installing MySQL 8.0..."
apt install mysql-server -y

# Start MySQL service
systemctl start mysql
systemctl enable mysql

echo "✅ MySQL installed and running"

# ==================================
# 4. Secure MySQL Installation
# ==================================
echo "🔒 Securing MySQL installation..."
echo "⚠️  Please run 'mysql_secure_installation' manually after this script!"

# ==================================
# 5. Create Production Database
# ==================================
echo "🗄️ Creating production database..."

read -p "Enter MySQL root password: " MYSQL_ROOT_PASSWORD
read -p "Enter production database name (default: ceog_production): " DB_NAME
DB_NAME=${DB_NAME:-ceog_production}

read -p "Enter production database user (default: ceog_prod_user): " DB_USER
DB_USER=${DB_USER:-ceog_prod_user}

read -sp "Enter production database password: " DB_PASSWORD
echo

mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<MYSQL_SCRIPT
CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

echo "✅ Database '${DB_NAME}' created with user '${DB_USER}'"

# ==================================
# 6. Install PM2 (Process Manager)
# ==================================
echo "📦 Installing PM2..."
npm install -g pm2

echo "✅ PM2 installed: $(pm2 -v)"

# ==================================
# 7. Install Nginx (Reverse Proxy)
# ==================================
echo "📦 Installing Nginx..."
apt install nginx -y

# Start Nginx
systemctl start nginx
systemctl enable nginx

echo "✅ Nginx installed and running"

# ==================================
# 8. Install Certbot (SSL Certificates)
# ==================================
echo "🔒 Installing Certbot for SSL..."
apt install certbot python3-certbot-nginx -y

echo "✅ Certbot installed"

# ==================================
# 9. Setup Project Directory
# ==================================
echo "📁 Setting up project directory..."

mkdir -p /var/www
cd /var/www

read -p "Enter GitHub repository URL (e.g., https://github.com/username/ceog-gala.git): " REPO_URL

echo "📥 Cloning repository..."
git clone "$REPO_URL" ceog-gala

cd ceog-gala

# ==================================
# 10. Install Project Dependencies
# ==================================
echo "📦 Installing project dependencies..."
npm install

# ==================================
# 11. Setup Environment Variables
# ==================================
echo "⚙️ Creating .env file..."

cat > .env <<ENV_TEMPLATE
# Production Environment Variables
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}"

# TODO: Generate production secrets!
# Run: openssl rand -base64 64
APP_SECRET="GENERATE_NEW_SECRET_64_CHARS_PRODUCTION_XXXXXXXXXXXXXX"
QR_SECRET="GENERATE_NEW_SECRET_64_CHARS_PRODUCTION_YYYYYYYYYYYYYY"

NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="GENERATE_NEW_SECRET_32_CHARS_PRODUCTION_ZZZZ"

# Stripe LIVE mode (update with real keys!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_KEY"
STRIPE_SECRET_KEY="sk_live_YOUR_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_KEY"

# Production SMTP
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=587
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="YOUR_EMAIL_PASSWORD"
SMTP_FROM="noreply@yourdomain.com"

NODE_ENV="production"
APP_URL="https://yourdomain.com"
ENV_TEMPLATE

echo "⚠️  IMPORTANT: Edit /var/www/ceog-gala/.env and update all secrets and credentials!"

# ==================================
# 12. Run Prisma Migrations
# ==================================
echo "🗄️ Running Prisma migrations..."
npx prisma generate
npx prisma migrate deploy

# ==================================
# 13. Build Next.js Application
# ==================================
echo "🏗️ Building Next.js application..."
npm run build

# ==================================
# 14. Setup PM2 Process
# ==================================
echo "🔄 Setting up PM2 process..."
pm2 start npm --name "ceog-gala" -- start
pm2 startup
pm2 save

echo "✅ PM2 process started"

# ==================================
# 15. Configure Nginx
# ==================================
echo "⚙️ Configuring Nginx..."

read -p "Enter your domain name (e.g., ceogala.hu): " DOMAIN_NAME

cat > /etc/nginx/sites-available/ceog-gala <<NGINX_CONFIG
server {
    listen 80;
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_CONFIG

# Enable site
ln -sf /etc/nginx/sites-available/ceog-gala /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx

echo "✅ Nginx configured for ${DOMAIN_NAME}"

# ==================================
# 16. Setup SSL Certificate
# ==================================
echo "🔒 Setting up SSL certificate..."
echo "⚠️  Make sure your domain DNS points to this VPS IP before running certbot!"

read -p "Do you want to setup SSL now? (y/n): " SETUP_SSL

if [ "$SETUP_SSL" = "y" ]; then
    certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME"
    echo "✅ SSL certificate installed"
else
    echo "⚠️  Run this command later to setup SSL:"
    echo "    certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
fi

# ==================================
# 17. Setup Firewall (UFW)
# ==================================
echo "🔒 Configuring firewall..."
apt install ufw -y

ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

echo "⚠️  Firewall rules added but NOT enabled yet!"
echo "    Enable with: ufw enable"

# ==================================
# Final Summary
# ==================================
echo ""
echo "============================================"
echo "✅ VPS Initial Setup Complete!"
echo "============================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. ⚠️  Edit production .env file:"
echo "   nano /var/www/ceog-gala/.env"
echo ""
echo "2. 🔑 Generate production secrets:"
echo "   openssl rand -base64 64  # APP_SECRET and QR_SECRET"
echo "   openssl rand -base64 32  # NEXTAUTH_SECRET"
echo ""
echo "3. 🔒 Run MySQL secure installation:"
echo "   mysql_secure_installation"
echo ""
echo "4. 🔐 Setup GitHub SSH key for deployment:"
echo "   ssh-keygen -t ed25519 -C 'vps@ceogala'"
echo "   cat ~/.ssh/id_ed25519.pub  # Add to GitHub Deploy Keys"
echo ""
echo "5. 🧪 Test the application:"
echo "   Visit: http://${DOMAIN_NAME}"
echo ""
echo "6. 📊 Monitor PM2 processes:"
echo "   pm2 status"
echo "   pm2 logs ceog-gala"
echo ""
echo "============================================"
