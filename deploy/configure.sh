#!/bin/bash
# =============================================
# CEO Gala - Interaktív Konfiguráló Szkript
# =============================================
# Létrehozza a .env fájlt az összes szükséges beállítással
#
# Használat: sudo bash configure.sh
# =============================================

set -e

# Színek
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Auto-detect install path from script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_PATH="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$INSTALL_PATH/.env"

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

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

generate_secret() {
    openssl rand -hex $1
}

# ============================================
# Kezdés
# ============================================
print_header "CEO Gala - Környezeti Változók Konfigurálása"

if [ -f "$ENV_FILE" ]; then
    print_warning "A .env fájl már létezik!"
    read -p "Felülírod? (i/n) [n]: " OVERWRITE
    OVERWRITE=${OVERWRITE:-n}
    if [ "$OVERWRITE" != "i" ]; then
        echo "Kilépés..."
        exit 0
    fi
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    print_success "Backup készült"
fi

# ============================================
# 1. Domain és URL beállítások
# ============================================
print_header "1. Domain és URL beállítások"

read -p "Domain név (pl. ceogala.hu): " DOMAIN
DOMAIN=${DOMAIN:-localhost}

if [ "$DOMAIN" = "localhost" ]; then
    APP_URL="http://localhost:3000"
else
    APP_URL="https://$DOMAIN"
fi

print_success "APP_URL: $APP_URL"

# ============================================
# 2. Adatbázis beállítások
# ============================================
print_header "2. Adatbázis beállítások"

# Ellenőrizzük, van-e mentett konfig
if [ -f "$INSTALL_PATH/.db-config" ]; then
    print_info "Mentett adatbázis konfiguráció található"
    source "$INSTALL_PATH/.db-config"
    echo "  DATABASE_URL: $DATABASE_URL"
    read -p "Használod ezt? (i/n) [i]: " USE_SAVED
    USE_SAVED=${USE_SAVED:-i}

    if [ "$USE_SAVED" != "i" ]; then
        unset DATABASE_URL
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    read -p "Adatbázis név [ceog_production]: " DB_NAME
    DB_NAME=${DB_NAME:-ceog_production}

    read -p "Adatbázis felhasználó [ceog_user]: " DB_USER
    DB_USER=${DB_USER:-ceog_user}

    read -sp "Adatbázis jelszó: " DB_PASSWORD
    echo ""

    DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}"
fi

print_success "DATABASE_URL beállítva"

# ============================================
# 3. Titkos kulcsok generálása
# ============================================
print_header "3. Titkos kulcsok generálása"

print_info "APP_SECRET generálása (magic link-ekhez)..."
APP_SECRET=$(generate_secret 64)
print_success "APP_SECRET: ${APP_SECRET:0:20}..."

print_info "QR_SECRET generálása (QR kódokhoz)..."
QR_SECRET=$(generate_secret 64)
print_success "QR_SECRET: ${QR_SECRET:0:20}..."

print_info "NEXTAUTH_SECRET generálása (admin session-ökhöz)..."
NEXTAUTH_SECRET=$(generate_secret 32)
print_success "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:20}..."

# ============================================
# 4. Stripe beállítások
# ============================================
print_header "4. Stripe beállítások"

echo "Stripe kulcsok (https://dashboard.stripe.com/apikeys)"
echo ""

read -p "Stripe Publishable Key (pk_live_...): " STRIPE_PUBLISHABLE
if [ -z "$STRIPE_PUBLISHABLE" ]; then
    print_warning "Stripe kulcs nem lett megadva - később kell beállítani!"
    STRIPE_PUBLISHABLE="pk_live_YOUR_KEY_HERE"
fi

read -sp "Stripe Secret Key (sk_live_...): " STRIPE_SECRET
echo ""
if [ -z "$STRIPE_SECRET" ]; then
    STRIPE_SECRET="sk_live_YOUR_KEY_HERE"
fi

read -sp "Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK
echo ""
if [ -z "$STRIPE_WEBHOOK" ]; then
    STRIPE_WEBHOOK="whsec_YOUR_KEY_HERE"
fi

print_success "Stripe kulcsok beállítva"

# ============================================
# 5. Email (SMTP) beállítások
# ============================================
print_header "5. Email (SMTP) beállítások"

echo "SMTP szerver adatok:"
echo ""

read -p "SMTP Host (pl. smtp.gmail.com): " SMTP_HOST
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}

read -p "SMTP Port [587]: " SMTP_PORT
SMTP_PORT=${SMTP_PORT:-587}

read -p "SMTP Felhasználó (email cím): " SMTP_USER
SMTP_USER=${SMTP_USER:-noreply@example.com}

read -sp "SMTP Jelszó: " SMTP_PASS
echo ""
SMTP_PASS=${SMTP_PASS:-your_password}

read -p "Feladó email cím [$SMTP_USER]: " SMTP_FROM
SMTP_FROM=${SMTP_FROM:-$SMTP_USER}

print_success "SMTP beállítások konfigurálva"

# ============================================
# 6. Egyéb beállítások
# ============================================
print_header "6. Egyéb beállítások"

read -p "Magic link lejárati idő (óra) [24]: " MAGIC_LINK_EXPIRY
MAGIC_LINK_EXPIRY=${MAGIC_LINK_EXPIRY:-24}

read -p "Asztalszámok megjelenítése (true/false) [true]: " SHOW_TABLE
SHOW_TABLE=${SHOW_TABLE:-true}

# ============================================
# .env fájl generálása
# ============================================
print_header ".env fájl generálása"

cat > "$ENV_FILE" <<EOF
# =============================================
# CEO Gala - Production Környezeti Változók
# =============================================
# Generálva: $(date)
# FONTOS: Ez a fájl érzékeny adatokat tartalmaz!
# NE commitold Git-be!
# =============================================

# =============================================
# ADATBÁZIS
# =============================================
DATABASE_URL="$DATABASE_URL"

# =============================================
# ALKALMAZÁS
# =============================================
NODE_ENV="production"
APP_URL="$APP_URL"

# Titkos kulcsok (64 karakter)
APP_SECRET="$APP_SECRET"
QR_SECRET="$QR_SECRET"

# Magic link beállítások
MAGIC_LINK_EXPIRY_HOURS=$MAGIC_LINK_EXPIRY
NEXT_PUBLIC_MAGIC_LINK_EXPIRY_HOURS=$MAGIC_LINK_EXPIRY

# Asztalszámok megjelenítése a vendégeknek
SHOW_TABLE_NUMBERS=$SHOW_TABLE

# =============================================
# NEXTAUTH (Admin bejelentkezés)
# =============================================
NEXTAUTH_URL="$APP_URL"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# =============================================
# STRIPE (Fizetés)
# =============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE"
STRIPE_SECRET_KEY="$STRIPE_SECRET"
STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK"

# =============================================
# EMAIL (SMTP)
# =============================================
SMTP_HOST="$SMTP_HOST"
SMTP_PORT=$SMTP_PORT
SMTP_USER="$SMTP_USER"
SMTP_PASS="$SMTP_PASS"
SMTP_FROM="$SMTP_FROM"

# =============================================
# OPCIONÁLIS
# =============================================
# Google Analytics
# NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Sentry hibakezelés
# SENTRY_DSN="https://your-sentry-dsn"
EOF

chmod 600 "$ENV_FILE"
chown root:root "$ENV_FILE"

print_success ".env fájl létrehozva: $ENV_FILE"

# ============================================
# ecosystem.config.js generálása
# ============================================
print_header "PM2 konfiguráció generálása"

cat > "$INSTALL_PATH/ecosystem.config.js" <<EOF
module.exports = {
  apps: [{
    name: 'ceog',
    script: '.next/standalone/server.js',
    cwd: '$INSTALL_PATH',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/pm2/ceog-error.log',
    out_file: '/var/log/pm2/ceog-out.log',
    merge_logs: true,
    time: true
  }]
};
EOF

# Log mappa létrehozása
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2

print_success "ecosystem.config.js létrehozva"

# ============================================
# Összefoglaló
# ============================================
print_header "Konfiguráció befejezve!"

echo ""
echo -e "${GREEN}Beállított értékek:${NC}"
echo "  Domain:     $DOMAIN"
echo "  APP_URL:    $APP_URL"
echo "  SMTP Host:  $SMTP_HOST"
echo ""
echo -e "${YELLOW}Titkos kulcsok mentve a .env fájlba${NC}"
echo ""
echo -e "${YELLOW}Következő lépés:${NC}"
echo "  bash deploy/start.sh"
echo ""
echo -e "${CYAN}Tipp: A beállítások szerkesztése:${NC}"
echo "  nano $ENV_FILE"
echo ""
