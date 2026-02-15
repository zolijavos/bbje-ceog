#!/bin/bash
# =============================================
# CEO Gala - Adatbázis Backup
# =============================================
# Teljes adatbázis mentés időbélyeggel
#
# Használat: sudo bash backup.sh
# =============================================

set -e

# Színek
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

INSTALL_PATH="/var/www/ceog"
BACKUP_DIR="/var/backups/ceog"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

cd "$INSTALL_PATH"

print_header "CEO Gala - Adatbázis Backup"

# ============================================
# Backup mappa létrehozása
# ============================================
mkdir -p "$BACKUP_DIR"
print_success "Backup mappa: $BACKUP_DIR"

# ============================================
# Adatbázis adatok kiolvasása
# ============================================
if [ ! -f ".env" ]; then
    echo "Hiba: .env fájl nem található!"
    exit 1
fi

# DATABASE_URL parse-olása
DATABASE_URL=$(grep "^DATABASE_URL" .env | cut -d'"' -f2)

# mysql://user:password@host:port/database formátum parse-olása
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Adatbázis: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"

# ============================================
# Backup készítése
# ============================================
print_header "Backup készítése"

BACKUP_FILE="$BACKUP_DIR/ceog_backup_${TIMESTAMP}.sql"

mysqldump -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -P"$DB_PORT" \
    --single-transaction \
    --routines \
    --triggers \
    "$DB_NAME" > "$BACKUP_FILE"

print_success "Backup mentve: $BACKUP_FILE"

# ============================================
# Tömörítés
# ============================================
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
print_success "Tömörítve: $BACKUP_FILE ($BACKUP_SIZE)"

# ============================================
# Régi backupok törlése (30 napnál régebbiek)
# ============================================
print_header "Régi backupok törlése"

DELETED=$(find "$BACKUP_DIR" -name "ceog_backup_*.sql.gz" -mtime +30 -delete -print | wc -l)
echo "Törölt régi backup fájlok: $DELETED"

# ============================================
# Összefoglaló
# ============================================
print_header "Backup kész!"

echo ""
echo "Backup fájl: $BACKUP_FILE"
echo "Méret: $BACKUP_SIZE"
echo ""
echo -e "${YELLOW}Visszaállítás:${NC}"
echo "  gunzip < $BACKUP_FILE | mysql -u USER -p DATABASE"
echo ""

# Backup fájlok listázása
echo "Meglévő backupok:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -5 || echo "  (nincs backup)"
