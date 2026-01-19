#!/bin/bash
# =============================================
# CEO Gala - Nginx Konfiguráció
# =============================================
# Beállítja az Nginx reverse proxy-t
#
# Használat: sudo bash setup-nginx.sh
# =============================================

set -e

# Színek
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    exit 1
fi

print_header "CEO Gala - Nginx Konfiguráció"

# ============================================
# Domain bekérése
# ============================================
read -p "Domain név (pl. ceogala.hu): " DOMAIN

if [ -z "$DOMAIN" ]; then
    print_error "Domain név megadása kötelező!"
    exit 1
fi

# www előtag
read -p "www előtag is legyen ($DOMAIN + www.$DOMAIN)? (i/n) [i]: " USE_WWW
USE_WWW=${USE_WWW:-i}

if [ "$USE_WWW" = "i" ]; then
    SERVER_NAME="$DOMAIN www.$DOMAIN"
else
    SERVER_NAME="$DOMAIN"
fi

# ============================================
# Nginx konfiguráció létrehozása
# ============================================
print_header "Nginx konfiguráció generálása"

NGINX_CONF="/etc/nginx/sites-available/ceog"

cat > "$NGINX_CONF" <<EOF
# CEO Gala - Nginx konfiguráció
# Generálva: $(date)

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=general_limit:10m rate=30r/s;

upstream ceog_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_NAME;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/ceog_access.log;
    error_log /var/log/nginx/ceog_error.log;

    # Max upload size
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Static files caching (Next.js)
    location /_next/static {
        alias /var/www/ceog/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Public static files
    location /static {
        alias /var/www/ceog/public;
        expires 7d;
        add_header Cache-Control "public";
        access_log off;
    }

    # Favicon
    location = /favicon.ico {
        alias /var/www/ceog/public/favicon.ico;
        expires 7d;
        access_log off;
    }

    # API rate limiting
    location /api {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://ceog_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Stripe webhook (higher timeout)
    location /api/stripe/webhook {
        limit_req zone=api_limit burst=5 nodelay;

        proxy_pass http://ceog_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }

    # Main application
    location / {
        limit_req zone=general_limit burst=50 nodelay;

        proxy_pass http://ceog_backend;
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
EOF

print_success "Nginx konfiguráció létrehozva: $NGINX_CONF"

# ============================================
# Site engedélyezése
# ============================================
print_header "Site aktiválása"

# Symlink létrehozása
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/ceog
print_success "Site aktiválva"

# Default site letiltása (opcionális)
if [ -f /etc/nginx/sites-enabled/default ]; then
    read -p "Letiltod az alapértelmezett Nginx site-ot? (i/n) [i]: " DISABLE_DEFAULT
    DISABLE_DEFAULT=${DISABLE_DEFAULT:-i}

    if [ "$DISABLE_DEFAULT" = "i" ]; then
        rm -f /etc/nginx/sites-enabled/default
        print_success "Alapértelmezett site letiltva"
    fi
fi

# ============================================
# Konfiguráció tesztelése
# ============================================
print_header "Konfiguráció tesztelése"

if nginx -t; then
    print_success "Nginx konfiguráció valid"
else
    print_error "Nginx konfiguráció hibás!"
    exit 1
fi

# ============================================
# Nginx újraindítása
# ============================================
print_header "Nginx újraindítása"

systemctl reload nginx
print_success "Nginx újraindítva"

# ============================================
# Összefoglaló
# ============================================
print_header "Nginx beállítás kész!"

echo ""
echo -e "${GREEN}Az Nginx konfigurálva a következő domain(ek)re:${NC}"
echo "  $SERVER_NAME"
echo ""
echo -e "${YELLOW}Fontos: A site jelenleg HTTP-n fut (port 80)${NC}"
echo ""
echo -e "${CYAN}Következő lépés - SSL tanúsítvány:${NC}"
echo "  1. Győződj meg róla, hogy a DNS rekordok a szerver IP-jére mutatnak"
echo "  2. Futtasd: bash deploy/setup-ssl.sh"
echo ""
echo -e "${CYAN}Tesztelés:${NC}"
echo "  curl http://$DOMAIN"
echo ""
