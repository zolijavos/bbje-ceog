#!/bin/bash
# =============================================
# CEO Gala - Alkalmazás Frissítése
# =============================================
# Frissíti az alkalmazást a legújabb verzióra
#
# Használat: sudo bash update.sh
# =============================================

set -e

# Színek
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

INSTALL_PATH="/var/www/ceog"

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

print_header "CEO Gala - Alkalmazás Frissítése"

# ============================================
# Jelenlegi verzió
# ============================================
if [ -f "package.json" ]; then
    CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "ismeretlen")
    echo "Jelenlegi verzió: $CURRENT_VERSION"
fi

# ============================================
# Git pull (ha git repo)
# ============================================
if [ -d ".git" ]; then
    print_header "Git frissítés"

    # Lokális változások ellenőrzése
    if ! git diff-index --quiet HEAD --; then
        print_warning "Lokális változások találhatók!"
        read -p "Eldobod a változásokat? (i/n) [n]: " DISCARD
        DISCARD=${DISCARD:-n}

        if [ "$DISCARD" = "i" ]; then
            git checkout -- .
            print_success "Változások eldobva"
        else
            print_error "Frissítés megszakítva"
            exit 1
        fi
    fi

    git pull origin main
    print_success "Git frissítés kész"
fi

# ============================================
# Függőségek frissítése
# ============================================
print_header "Függőségek frissítése"

npm install --omit=dev
print_success "Függőségek frissítve"

# ============================================
# Prisma generálás
# ============================================
print_header "Prisma client generálása"

npx prisma generate
print_success "Prisma client kész"

# ============================================
# Migrációk futtatása
# ============================================
print_header "Adatbázis migrációk"

echo "Új migrációk ellenőrzése..."
npx prisma migrate deploy
print_success "Migrációk alkalmazva"

# ============================================
# Alkalmazás újrabuildelése
# ============================================
print_header "Alkalmazás buildelése"

npm run build
print_success "Build sikeres"

# ============================================
# PM2 újraindítása
# ============================================
print_header "Alkalmazás újraindítása"

pm2 restart ceog
print_success "Alkalmazás újraindítva"

# ============================================
# Ellenőrzés
# ============================================
sleep 3
pm2 status

# Verzió
if [ -f "package.json" ]; then
    NEW_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "ismeretlen")
    echo ""
    echo -e "${GREEN}Frissítés kész!${NC}"
    echo "  Előző verzió: $CURRENT_VERSION"
    echo "  Új verzió:    $NEW_VERSION"
fi

echo ""
echo -e "${CYAN}Logok megtekintése:${NC}"
echo "  pm2 logs ceog --lines 50"
echo ""
