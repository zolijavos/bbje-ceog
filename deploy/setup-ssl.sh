#!/bin/bash
# =============================================
# CEO Gala - SSL Tanúsítvány Beállítása
# =============================================
# Let's Encrypt SSL tanúsítvány a Certbot-tal
#
# FONTOS: A DNS rekordoknak már a szerver IP-jére kell mutatniuk!
#
# Használat: sudo bash setup-ssl.sh
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

print_header "CEO Gala - SSL Tanúsítvány Beállítása"

# ============================================
# Certbot ellenőrzése
# ============================================
if ! command -v certbot &> /dev/null; then
    print_warning "Certbot nincs telepítve, telepítés..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi
print_success "Certbot elérhető"

# ============================================
# Domain bekérése
# ============================================
echo ""
read -p "Domain név (pl. ceogala.hu): " DOMAIN

if [ -z "$DOMAIN" ]; then
    print_error "Domain név megadása kötelező!"
    exit 1
fi

read -p "www előtag is legyen? (i/n) [i]: " USE_WWW
USE_WWW=${USE_WWW:-i}

read -p "Email cím (a tanúsítvány értesítésekhez): " EMAIL

if [ -z "$EMAIL" ]; then
    print_error "Email cím megadása kötelező!"
    exit 1
fi

# ============================================
# DNS ellenőrzés
# ============================================
print_header "DNS ellenőrzése"

echo "A domain DNS rekordjainak ellenőrzése..."

SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short "$DOMAIN" | head -1)

echo "  Szerver IP: $SERVER_IP"
echo "  Domain IP:  $DOMAIN_IP"

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    print_warning "A domain nem erre a szerverre mutat!"
    echo ""
    echo "A DNS rekordok beállítása szükséges:"
    echo "  $DOMAIN -> A rekord -> $SERVER_IP"

    if [ "$USE_WWW" = "i" ]; then
        echo "  www.$DOMAIN -> A rekord -> $SERVER_IP"
        echo "  VAGY"
        echo "  www.$DOMAIN -> CNAME rekord -> $DOMAIN"
    fi

    echo ""
    read -p "Folytatod mégis? (i/n) [n]: " CONTINUE
    CONTINUE=${CONTINUE:-n}

    if [ "$CONTINUE" != "i" ]; then
        echo "Kilépés. Állítsd be a DNS rekordokat és próbáld újra."
        exit 0
    fi
else
    print_success "DNS rendben - a domain erre a szerverre mutat"
fi

# ============================================
# Certbot futtatása
# ============================================
print_header "SSL tanúsítvány beszerzése"

if [ "$USE_WWW" = "i" ]; then
    CERTBOT_DOMAINS="-d $DOMAIN -d www.$DOMAIN"
else
    CERTBOT_DOMAINS="-d $DOMAIN"
fi

echo "Certbot futtatása..."
echo "Domain(ok): $CERTBOT_DOMAINS"
echo ""

certbot --nginx \
    $CERTBOT_DOMAINS \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --redirect

print_success "SSL tanúsítvány telepítve"

# ============================================
# Automatikus megújítás tesztelése
# ============================================
print_header "Automatikus megújítás beállítása"

# Certbot timer ellenőrzése
if systemctl is-active --quiet certbot.timer; then
    print_success "Certbot timer aktív - automatikus megújítás be van állítva"
else
    print_warning "Certbot timer beállítása..."
    systemctl enable certbot.timer
    systemctl start certbot.timer
fi

# Teszt
echo "Megújítás tesztelése (dry-run)..."
certbot renew --dry-run

print_success "Automatikus megújítás működik"

# ============================================
# Összefoglaló
# ============================================
print_header "SSL beállítás kész!"

echo ""
echo -e "${GREEN}Az SSL tanúsítvány sikeresen telepítve!${NC}"
echo ""
echo -e "${CYAN}A site most elérhető:${NC}"
echo "  https://$DOMAIN"
if [ "$USE_WWW" = "i" ]; then
    echo "  https://www.$DOMAIN"
fi
echo ""
echo -e "${CYAN}Tanúsítvány információk:${NC}"
echo "  certbot certificates"
echo ""
echo -e "${CYAN}Manuális megújítás (ha szükséges):${NC}"
echo "  certbot renew"
echo ""
echo -e "${GREEN}A HTTP forgalom automatikusan átirányítódik HTTPS-re.${NC}"
echo ""
