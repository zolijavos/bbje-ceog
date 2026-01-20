#!/bin/bash
# =============================================
# CEO Gala - Alkalmazás Indítása
# =============================================
# Telepíti a függőségeket, futtatja a migrációkat,
# buildelei az alkalmazást és elindítja PM2-vel.
#
# Használat: sudo bash start.sh
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

cd "$INSTALL_PATH"

# ============================================
# Előfeltételek ellenőrzése
# ============================================
print_header "Előfeltételek ellenőrzése"

# .env fájl
if [ ! -f ".env" ]; then
    print_error ".env fájl nem található!"
    echo "Futtasd előbb: bash deploy/configure.sh"
    exit 1
fi
print_success ".env fájl megtalálva"

# ecosystem.config.js fájl
if [ ! -f "ecosystem.config.js" ]; then
    print_error "ecosystem.config.js nem található!"
    echo "Másold át a példa fájlt:"
    echo "  cp deploy/ecosystem.config.example.js ecosystem.config.js"
    echo "Ha más útvonalra telepítettél, szerkeszd a 'cwd' értékét!"
    exit 1
fi
print_success "ecosystem.config.js megtalálva"

# Extract app name and port from ecosystem.config.js
APP_NAME=$(grep -oP "name:\s*['\"]?\K[^'\"',]+" ecosystem.config.js | head -1)
APP_PORT=$(grep -oP "PORT:\s*\K[0-9]+" ecosystem.config.js | head -1)
APP_NAME=${APP_NAME:-ceog}
APP_PORT=${APP_PORT:-3000}
print_success "App: $APP_NAME, Port: $APP_PORT"

# Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js nincs telepítve!"
    exit 1
fi
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ szükséges! Telepített verzió: $(node -v)"
    exit 1
fi
print_success "Node.js: $(node -v)"

# npm
if ! command -v npm &> /dev/null; then
    print_error "npm nincs telepítve!"
    exit 1
fi
print_success "npm: $(npm -v)"

# PM2
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 nincs telepítve, telepítés..."
    npm install -g pm2
fi
print_success "PM2: $(pm2 -v)"

# ============================================
# Függőségek telepítése
# ============================================
print_header "Függőségek telepítése"

echo "npm install futtatása..."
npm install --omit=dev 2>&1 | tail -5

print_success "Függőségek telepítve (prisma CLI a dependencies-ben)"

# ============================================
# Prisma client generálása
# ============================================
print_header "Prisma client generálása"

npx prisma generate
print_success "Prisma client kész"

# ============================================
# Adatbázis beállítása
# ============================================
print_header "Adatbázis beállítása"

# Ellenőrizzük az adatbázis kapcsolatot
echo "Adatbázis kapcsolat ellenőrzése..."
if ! npx prisma db execute --stdin <<< "SELECT 1" 2>/dev/null; then
    print_error "Nem sikerült csatlakozni az adatbázishoz!"
    echo "Ellenőrizd a DATABASE_URL értékét a .env fájlban"
    exit 1
fi
print_success "Adatbázis elérhető"

# Ellenőrizzük, hogy friss telepítés-e (nincs Guest tábla)
echo "Adatbázis állapot ellenőrzése..."
if npx prisma db execute --stdin <<< "SELECT 1 FROM Guest LIMIT 1" 2>/dev/null; then
    # Létező adatbázis - migrate deploy
    echo "Létező adatbázis, migrációk futtatása..."
    npx prisma migrate deploy
    print_success "Migrációk sikeresen lefutottak"
else
    # Friss adatbázis - db push
    echo "Friss adatbázis, séma létrehozása..."
    npx prisma db push --accept-data-loss
    print_success "Adatbázis séma létrehozva"
fi

# ============================================
# Alkalmazás buildelése
# ============================================
print_header "Alkalmazás buildelése"

echo "Next.js build futtatása (ez eltarthat pár percig)..."
if ! npm run build; then
    print_error "Build sikertelen! Ellenőrizd a hibaüzenetet fentebb."
    exit 1
fi

print_success "Build sikeres"

# ============================================
# PM2 indítása
# ============================================
print_header "Alkalmazás indítása PM2-vel"

# Leállítjuk ha fut
pm2 stop "$APP_NAME" 2>/dev/null || true
pm2 delete "$APP_NAME" 2>/dev/null || true

# Indítás
pm2 start ecosystem.config.js
pm2 save

# PM2 startup beállítása
pm2 startup systemd -u root --hp /root 2>/dev/null || true

print_success "Alkalmazás elindítva"

# ============================================
# Státusz ellenőrzése
# ============================================
print_header "Alkalmazás állapota"

sleep 3
pm2 status

# Teszt
echo ""
echo "Alkalmazás tesztelése..."
sleep 2

if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT" | grep -q "200\|302"; then
    print_success "Az alkalmazás fut és válaszol!"
else
    print_warning "Az alkalmazás még nem válaszol - várj pár másodpercet"
fi

# ============================================
# Összefoglaló
# ============================================
print_header "Telepítés befejezve!"

echo ""
echo -e "${GREEN}Az alkalmazás sikeresen elindult!${NC}"
echo ""
echo -e "${CYAN}Hasznos parancsok:${NC}"
echo "  pm2 status            - Alkalmazás állapota"
echo "  pm2 logs $APP_NAME    - Logok megtekintése"
echo "  pm2 restart $APP_NAME - Újraindítás"
echo "  pm2 stop $APP_NAME    - Leállítás"
echo ""
echo -e "${YELLOW}Következő lépések:${NC}"
echo "  1. Nginx beállítása: bash deploy/setup-nginx.sh"
echo "  2. SSL tanúsítvány:  bash deploy/setup-ssl.sh"
echo ""
echo -e "${CYAN}Lokális teszt:${NC}"
echo "  curl http://localhost:$APP_PORT"
echo ""
