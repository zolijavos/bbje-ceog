#!/bin/bash
# =============================================
# CEO Gala - Automatikus Telepítő Szkript
# =============================================
# Ez a szkript telepíti az összes szükséges komponenst
# egy friss Ubuntu 22.04+ szerveren.
#
# Használat: sudo bash install.sh
# =============================================

set -e

# Színek a kimenethez
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Segédfüggvények
print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
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

# Root ellenőrzés
if [ "$EUID" -ne 0 ]; then
    print_error "A szkriptet root jogosultsággal kell futtatni!"
    echo "Használat: sudo bash install.sh"
    exit 1
fi

print_header "CEO Gala - Telepítés Indítása"

# ============================================
# 1. Rendszer frissítése
# ============================================
print_header "1. Rendszer frissítése"
apt update && apt upgrade -y
print_success "Rendszer frissítve"

# ============================================
# 2. Alapvető csomagok telepítése
# ============================================
print_header "2. Alapvető csomagok telepítése"
apt install -y curl wget git build-essential unzip software-properties-common
print_success "Alapvető csomagok telepítve"

# ============================================
# 3. Node.js 18 LTS telepítése
# ============================================
print_header "3. Node.js 18 LTS telepítése"

if command -v node &> /dev/null; then
    CURRENT_NODE=$(node -v)
    print_warning "Node.js már telepítve: $CURRENT_NODE"
else
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
print_success "Node.js: $NODE_VERSION"
print_success "npm: $NPM_VERSION"

# ============================================
# 4. MySQL 8.0 telepítése
# ============================================
print_header "4. MySQL 8.0 telepítése"

if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version)
    print_warning "MySQL már telepítve: $MYSQL_VERSION"
else
    apt install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
fi

print_success "MySQL szolgáltatás fut"

# ============================================
# 5. PM2 telepítése (Process Manager)
# ============================================
print_header "5. PM2 telepítése"

if command -v pm2 &> /dev/null; then
    print_warning "PM2 már telepítve"
else
    npm install -g pm2
fi

PM2_VERSION=$(pm2 -v)
print_success "PM2: $PM2_VERSION"

# ============================================
# 6. Nginx telepítése
# ============================================
print_header "6. Nginx telepítése"

if command -v nginx &> /dev/null; then
    print_warning "Nginx már telepítve"
else
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi

print_success "Nginx szolgáltatás fut"

# ============================================
# 7. Certbot telepítése (SSL)
# ============================================
print_header "7. Certbot telepítése (SSL tanúsítványokhoz)"
apt install -y certbot python3-certbot-nginx
print_success "Certbot telepítve"

# ============================================
# 8. UFW tűzfal konfigurálása
# ============================================
print_header "8. Tűzfal konfigurálása"
apt install -y ufw

# Alap szabályok
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

print_warning "Tűzfal szabályok beállítva (de NEM aktiválva)"
echo "Aktiváláshoz futtasd: ufw enable"

# ============================================
# 9. Projekt mappa létrehozása
# ============================================
print_header "9. Projekt mappa előkészítése"

INSTALL_PATH="/var/www/ceog"

if [ -d "$INSTALL_PATH" ]; then
    print_warning "A $INSTALL_PATH mappa már létezik"
else
    mkdir -p "$INSTALL_PATH"
    print_success "Mappa létrehozva: $INSTALL_PATH"
fi

# ============================================
# Összefoglaló
# ============================================
print_header "Telepítés befejezve!"

echo ""
echo -e "${GREEN}Telepített komponensek:${NC}"
echo "  - Node.js $NODE_VERSION"
echo "  - npm $NPM_VERSION"
echo "  - MySQL 8.0"
echo "  - PM2 $PM2_VERSION"
echo "  - Nginx"
echo "  - Certbot"
echo "  - UFW tűzfal"
echo ""
echo -e "${YELLOW}Következő lépések:${NC}"
echo ""
echo "1. MySQL jelszó beállítása:"
echo "   sudo mysql_secure_installation"
echo ""
echo "2. Adatbázis létrehozása:"
echo "   sudo bash deploy/setup-database.sh"
echo ""
echo "3. Alkalmazás konfigurálása:"
echo "   sudo bash deploy/configure.sh"
echo ""
echo "4. Alkalmazás telepítése és indítása:"
echo "   sudo bash deploy/start.sh"
echo ""
