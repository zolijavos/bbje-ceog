#!/bin/bash
# =============================================
# CEO Gala - Release Csomag Létrehozása
# =============================================
# Létrehoz egy tiszta telepítési csomagot
# dokumentáció és fejlesztői fájlok nélkül
#
# Használat: bash create-release.sh [verzió]
# Példa:    bash create-release.sh v1.0.0
# =============================================

set -e

# Színek
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

# Verzió paraméter
VERSION=${1:-"v1.0.0"}
SOURCE_DIR="/var/www/ceog"
RELEASE_DIR="/tmp/ceog-release-${VERSION}"
ARCHIVE_NAME="ceog-${VERSION}.tar.gz"

print_header "CEO Gala - Release Csomag: $VERSION"

# ============================================
# Előkészítés
# ============================================
print_header "1. Release mappa előkészítése"

# Töröljük ha létezik
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

print_success "Release mappa: $RELEASE_DIR"

# ============================================
# Fájlok másolása (kizárásokkal)
# ============================================
print_header "2. Fájlok másolása"

cd "$SOURCE_DIR"

# Rsync kizárásokkal
rsync -av --progress \
    --exclude='.git' \
    --exclude='.next' \
    --exclude='node_modules' \
    --exclude='docs/' \
    --exclude='_bmad/' \
    --exclude='bmad-custom-src/' \
    --exclude='.agent/' \
    --exclude='.claude/' \
    --exclude='.codex/' \
    --exclude='.gemini/' \
    --exclude='.vercel/' \
    --exclude='.vscode/' \
    --exclude='.idea/' \
    --exclude='tests/' \
    --exclude='test-results/' \
    --exclude='playwright-report/' \
    --exclude='coverage/' \
    --exclude='*.excalidraw' \
    --exclude='CLAUDE.md' \
    --exclude='REFACTORING_SUMMARY.md' \
    --exclude='README.md' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='.env.development*' \
    --exclude='.db-config' \
    --exclude='ecosystem.config.js' \
    --exclude='*.sql' \
    --exclude='backup_*.sql' \
    --exclude='test-*.js' \
    --exclude='test-*.csv' \
    --exclude='check-*.js' \
    --exclude='simulate-*.js' \
    --exclude='send-qr*.js' \
    --exclude='*.tsbuildinfo' \
    --exclude='.workflow-init-temp.yaml' \
    --exclude='.npmrc' \
    --exclude='playwright.config.ts' \
    --exclude='vitest.config.ts' \
    --exclude='scripts/capture-*.mjs' \
    --exclude='scripts/debug-*.mjs' \
    --exclude='scripts/full-screenshots.mjs' \
    --exclude='scripts/generate-*.js' \
    --exclude='scripts/payment-*.mjs' \
    --exclude='scripts/screenshots.mjs' \
    --exclude='scripts/seating-*.mjs' \
    --exclude='scripts/take-screenshots.ts' \
    --exclude='scripts/test-*.mjs' \
    ./ "$RELEASE_DIR/"

print_success "Fájlok másolva"

# ============================================
# Production .gitignore másolása
# ============================================
print_header "3. Production konfiguráció"

cp "$SOURCE_DIR/deploy/.gitignore.production" "$RELEASE_DIR/.gitignore"
print_success "Production .gitignore beállítva"

# Átnevezzük a .env.production.example-t
cp "$SOURCE_DIR/deploy/.env.production.example" "$RELEASE_DIR/.env.example"
print_success ".env.example létrehozva"

# ============================================
# Tisztítás
# ============================================
print_header "4. Tisztítás"

cd "$RELEASE_DIR"

# Üres mappák törlése
find . -type d -empty -delete 2>/dev/null || true

# Felesleges fájlok törlése
rm -f .npmrc .workflow-init-temp.yaml 2>/dev/null || true
rm -f *.tsbuildinfo next-env.d.ts 2>/dev/null || true

print_success "Tisztítás kész"

# ============================================
# Fájlok listázása
# ============================================
print_header "5. Release tartalom"

echo "Fő mappák:"
ls -la "$RELEASE_DIR"

echo ""
echo "Deploy szkriptek:"
ls -la "$RELEASE_DIR/deploy/"

# Méret
RELEASE_SIZE=$(du -sh "$RELEASE_DIR" | cut -f1)
FILE_COUNT=$(find "$RELEASE_DIR" -type f | wc -l)

echo ""
echo -e "${CYAN}Statisztika:${NC}"
echo "  Méret: $RELEASE_SIZE"
echo "  Fájlok: $FILE_COUNT db"

# ============================================
# Archívum készítése
# ============================================
print_header "6. Archívum készítése"

cd /tmp
tar -czvf "$ARCHIVE_NAME" -C "$RELEASE_DIR" .

ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
print_success "Archívum létrehozva: /tmp/$ARCHIVE_NAME ($ARCHIVE_SIZE)"

# ============================================
# Összefoglaló
# ============================================
print_header "Release csomag kész!"

echo ""
echo -e "${GREEN}Létrehozott fájlok:${NC}"
echo "  Mappa:   $RELEASE_DIR"
echo "  Archívum: /tmp/$ARCHIVE_NAME"
echo ""
echo -e "${YELLOW}Következő lépések:${NC}"
echo ""
echo "1. Archívum feltöltése a célszerverre:"
echo "   scp /tmp/$ARCHIVE_NAME user@szerver:/var/www/"
echo ""
echo "2. Kicsomagolás a szerveren:"
echo "   cd /var/www && mkdir ceog && tar -xzvf $ARCHIVE_NAME -C ceog"
echo ""
echo "3. Telepítés futtatása:"
echo "   cd /var/www/ceog && sudo bash deploy/install.sh"
echo ""
echo -e "${CYAN}Vagy Git-be push-olás:${NC}"
echo ""
echo "   cd $RELEASE_DIR"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Release $VERSION'"
echo "   git remote add origin https://github.com/zolijavos/bbje-ceog.git"
echo "   git push -u origin main --force"
echo ""
