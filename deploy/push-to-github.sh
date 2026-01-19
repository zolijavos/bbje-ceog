#!/bin/bash
# =============================================
# CEO Gala - GitHub Push (Deployment Csomag)
# =============================================
# Feltölti a tiszta telepítési csomagot a GitHub-ra
#
# Használat: bash push-to-github.sh
# =============================================

set -e

# Színek
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Konfiguráció
GITHUB_REPO="https://github.com/zolijavos/bbje-ceog.git"
SOURCE_DIR="/var/www/ceog"
TEMP_DIR="/tmp/ceog-github-deploy"

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

print_header "CEO Gala - GitHub Deployment Push"

# ============================================
# Git ellenőrzés
# ============================================
if ! command -v git &> /dev/null; then
    print_error "Git nincs telepítve!"
    exit 1
fi

# ============================================
# Verzió meghatározása
# ============================================
cd "$SOURCE_DIR"

if [ -f "package.json" ]; then
    VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
else
    VERSION="1.0.0"
fi

echo "Verzió: $VERSION"
read -p "Megfelelő ez a verzió? (i/n/egyedi) [i]: " VERSION_OK
VERSION_OK=${VERSION_OK:-i}

if [ "$VERSION_OK" = "n" ]; then
    read -p "Add meg a verziót: " VERSION
elif [ "$VERSION_OK" != "i" ]; then
    VERSION="$VERSION_OK"
fi

# ============================================
# Commit üzenet
# ============================================
DEFAULT_MSG="Release v${VERSION} - CEO Gala deployment package"
read -p "Commit üzenet [$DEFAULT_MSG]: " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-$DEFAULT_MSG}

# ============================================
# Ideiglenes mappa előkészítése
# ============================================
print_header "1. Deployment mappa előkészítése"

rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# ============================================
# Fájlok másolása
# ============================================
print_header "2. Fájlok másolása (dokumentáció nélkül)"

rsync -av \
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
    "$SOURCE_DIR/" "$TEMP_DIR/"

print_success "Fájlok másolva"

# ============================================
# Konfiguráció módosítása
# ============================================
print_header "3. Production konfiguráció"

cd "$TEMP_DIR"

# .gitignore
cp "$SOURCE_DIR/deploy/.gitignore.production" .gitignore
print_success ".gitignore beállítva"

# .env.example
cp "$SOURCE_DIR/deploy/.env.production.example" .env.example
print_success ".env.example létrehozva"

# Tisztítás
rm -f .npmrc .workflow-init-temp.yaml *.tsbuildinfo next-env.d.ts 2>/dev/null || true
find . -type d -empty -delete 2>/dev/null || true

print_success "Tisztítás kész"

# ============================================
# Git inicializálás
# ============================================
print_header "4. Git repository inicializálása"

git init
git add .
git commit -m "$COMMIT_MSG"

print_success "Commit létrehozva"

# ============================================
# Push to GitHub
# ============================================
print_header "5. GitHub Push"

echo "Repository: $GITHUB_REPO"
echo ""
print_warning "FIGYELEM: Ez FELÜLÍRJA a távoli repository-t!"
read -p "Folytatod? (i/n) [n]: " CONTINUE
CONTINUE=${CONTINUE:-n}

if [ "$CONTINUE" != "i" ]; then
    print_warning "Push megszakítva"
    echo ""
    echo "A deployment csomag itt található: $TEMP_DIR"
    echo "Manuálisan feltöltheted:"
    echo "  cd $TEMP_DIR"
    echo "  git remote add origin $GITHUB_REPO"
    echo "  git push -u origin main --force"
    exit 0
fi

# Remote hozzáadása és push
git remote add origin "$GITHUB_REPO"

echo "Push folyamatban..."
git push -u origin main --force

print_success "Sikeresen feltöltve!"

# ============================================
# Összefoglaló
# ============================================
print_header "GitHub Push kész!"

echo ""
echo -e "${GREEN}A deployment csomag feltöltve:${NC}"
echo "  $GITHUB_REPO"
echo ""
echo -e "${CYAN}Az ügyfél letöltheti:${NC}"
echo "  git clone $GITHUB_REPO ceog"
echo "  cd ceog"
echo "  sudo bash deploy/install.sh"
echo ""

# Takarítás
read -p "Törlöd az ideiglenes mappát? (i/n) [i]: " CLEANUP
CLEANUP=${CLEANUP:-i}

if [ "$CLEANUP" = "i" ]; then
    rm -rf "$TEMP_DIR"
    print_success "Ideiglenes mappa törölve"
fi

echo ""
print_success "Kész!"
