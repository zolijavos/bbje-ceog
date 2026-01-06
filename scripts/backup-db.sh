#!/bin/bash
#
# CEO Gala Database Backup Script
# Automated MySQL backup with compression and rotation
#
# Usage: ./backup-db.sh [--verify-only]
#
# Cron setup (run 3x daily at 2:00, 10:00, 18:00):
#   0 2,10,18 * * * /var/www/ceog/scripts/backup-db.sh >> /var/log/ceog-backup.log 2>&1
#

set -euo pipefail

# Configuration
BACKUP_DIR="/var/backups/ceog"
DB_NAME="ceog"
DB_USER="root"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ceog_${TIMESTAMP}.sql.gz"
LATEST_LINK="${BACKUP_DIR}/ceog_LATEST.sql.gz"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

# Load environment variables if .env exists
if [ -f /var/www/ceog/.env ]; then
    source /var/www/ceog/.env
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${LOG_PREFIX} ${GREEN}INFO${NC}: $1"
}

log_warn() {
    echo -e "${LOG_PREFIX} ${YELLOW}WARN${NC}: $1"
}

log_error() {
    echo -e "${LOG_PREFIX} ${RED}ERROR${NC}: $1"
}

# Create backup directory if it doesn't exist
ensure_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        sudo mkdir -p "$BACKUP_DIR"
        sudo chown ubuntu:ubuntu "$BACKUP_DIR"
        sudo chmod 750 "$BACKUP_DIR"
    fi
}

# Verify latest backup integrity
verify_backup() {
    local backup_file="${1:-$LATEST_LINK}"

    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi

    log_info "Verifying backup integrity: $backup_file"

    # Test gzip integrity
    if ! gunzip -t "$backup_file" 2>/dev/null; then
        log_error "Backup file is corrupted: $backup_file"
        return 1
    fi

    # Check file size (should be > 1KB for non-empty DB)
    local size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")
    if [ "$size" -lt 1024 ]; then
        log_warn "Backup file is suspiciously small: ${size} bytes"
    fi

    # Count tables in backup
    local table_count=$(zcat "$backup_file" | grep -c "^CREATE TABLE" || echo "0")
    log_info "Backup contains $table_count tables"

    if [ "$table_count" -lt 5 ]; then
        log_warn "Expected at least 5 tables, found $table_count"
    fi

    log_info "Backup verification: PASSED"
    return 0
}

# Create database backup
create_backup() {
    ensure_backup_dir

    log_info "Starting backup of database: $DB_NAME"
    log_info "Backup file: $BACKUP_FILE"

    # Get row counts before backup for verification
    local guest_count=$(mysql -u "$DB_USER" -N -e "SELECT COUNT(*) FROM Guest;" "$DB_NAME" 2>/dev/null || echo "N/A")
    local reg_count=$(mysql -u "$DB_USER" -N -e "SELECT COUNT(*) FROM Registration;" "$DB_NAME" 2>/dev/null || echo "N/A")

    log_info "Pre-backup stats: Guests=$guest_count, Registrations=$reg_count"

    # Create backup with single transaction (consistent snapshot)
    mysqldump \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --add-drop-table \
        --complete-insert \
        --set-gtid-purged=OFF \
        -u "$DB_USER" \
        "$DB_NAME" 2>/dev/null | gzip > "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        # Update latest symlink
        ln -sf "$BACKUP_FILE" "$LATEST_LINK"

        local size=$(du -h "$BACKUP_FILE" | cut -f1)
        log_info "Backup completed successfully: $size"

        # Verify the backup we just created
        verify_backup "$BACKUP_FILE"
    else
        log_error "Backup failed!"
        rm -f "$BACKUP_FILE"
        exit 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days"

    local deleted=$(find "$BACKUP_DIR" -name "ceog_*.sql.gz" -mtime +$RETENTION_DAYS -type f -delete -print | wc -l)

    if [ "$deleted" -gt 0 ]; then
        log_info "Deleted $deleted old backup(s)"
    else
        log_info "No old backups to delete"
    fi

    # Show current backup count and total size
    local count=$(ls -1 "$BACKUP_DIR"/ceog_*.sql.gz 2>/dev/null | wc -l)
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    log_info "Current backups: $count files, total size: $total_size"
}

# Main
main() {
    log_info "=========================================="
    log_info "CEO Gala Database Backup"
    log_info "=========================================="

    if [ "${1:-}" = "--verify-only" ]; then
        verify_backup
        exit $?
    fi

    create_backup
    cleanup_old_backups

    log_info "=========================================="
    log_info "Backup completed successfully!"
    log_info "=========================================="
}

main "$@"
