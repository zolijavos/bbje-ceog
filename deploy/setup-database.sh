#!/bin/bash
# =============================================
# CEO Gala - Adatbázis Beállítás
# =============================================
# Létrehozza a production adatbázist és felhasználót
#
# Használat: sudo bash setup-database.sh
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

print_header "CEO Gala - Adatbázis Beállítás"

# ============================================
# Adatok bekérése
# ============================================
echo ""
echo "Adatbázis konfiguráció:"
echo "----------------------"

read -p "Adatbázis név [ceog_production]: " DB_NAME
DB_NAME=${DB_NAME:-ceog_production}

read -p "Adatbázis felhasználó [ceog_user]: " DB_USER
DB_USER=${DB_USER:-ceog_user}

# Jelszó generálás vagy bekérés
echo ""
echo "Adatbázis jelszó:"
echo "  1) Automatikus generálás (ajánlott)"
echo "  2) Saját jelszó megadása"
read -p "Válassz [1]: " PASSWORD_CHOICE
PASSWORD_CHOICE=${PASSWORD_CHOICE:-1}

if [ "$PASSWORD_CHOICE" = "1" ]; then
    DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    echo ""
    print_success "Generált jelszó: $DB_PASSWORD"
    echo -e "${YELLOW}FONTOS: Mentsd el ezt a jelszót!${NC}"
else
    read -sp "Add meg a jelszót: " DB_PASSWORD
    echo ""
fi

# ============================================
# MySQL root jelszó
# ============================================
echo ""
read -sp "MySQL root jelszó (ha van, üres ha nincs): " MYSQL_ROOT_PASSWORD
echo ""

# ============================================
# Adatbázis létrehozása
# ============================================
print_header "Adatbázis létrehozása"

if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    MYSQL_CMD="mysql"
else
    MYSQL_CMD="mysql -u root -p$MYSQL_ROOT_PASSWORD"
fi

# Ellenőrizzük, hogy létezik-e már az adatbázis
if $MYSQL_CMD -e "USE $DB_NAME" 2>/dev/null; then
    print_warning "Az adatbázis '$DB_NAME' már létezik!"
    read -p "Törlöd és újra létrehozod? (i/n) [n]: " RECREATE
    RECREATE=${RECREATE:-n}

    if [ "$RECREATE" = "i" ]; then
        $MYSQL_CMD -e "DROP DATABASE $DB_NAME;"
        print_success "Régi adatbázis törölve"
    else
        echo "Meglévő adatbázis használata..."
    fi
fi

# Adatbázis és felhasználó létrehozása
$MYSQL_CMD <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

print_success "Adatbázis '$DB_NAME' létrehozva"
print_success "Felhasználó '$DB_USER' létrehozva"

# ============================================
# DATABASE_URL generálása
# ============================================
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}"

print_header "Konfiguráció mentése"

# Mentés ideiglenes fájlba
CONFIG_FILE="/var/www/ceog/.db-config"
cat > "$CONFIG_FILE" <<EOF
# Automatikusan generált adatbázis konfiguráció
# Generálva: $(date)
# FONTOS: Ez a fájl érzékeny adatokat tartalmaz!

DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DATABASE_URL=$DATABASE_URL
EOF

chmod 600 "$CONFIG_FILE"

print_success "Konfiguráció mentve: $CONFIG_FILE"

# ============================================
# Összefoglaló
# ============================================
print_header "Adatbázis beállítás kész!"

echo ""
echo -e "${GREEN}Adatbázis adatok:${NC}"
echo "  Név:       $DB_NAME"
echo "  Felhasználó: $DB_USER"
echo "  Jelszó:    $DB_PASSWORD"
echo ""
echo -e "${YELLOW}DATABASE_URL (másold a .env fájlba):${NC}"
echo ""
echo "$DATABASE_URL"
echo ""
echo -e "${YELLOW}Következő lépés:${NC}"
echo "  bash deploy/configure.sh"
echo ""
