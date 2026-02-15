#!/bin/bash
#
# CEO Gala Database Restore Script
# Restore MySQL database from backup with safety checks
#
# Usage:
#   ./restore-db.sh                    # Restore from latest backup
#   ./restore-db.sh <backup_file>      # Restore from specific backup
#   ./restore-db.sh --list             # List available backups
#   ./restore-db.sh --dry-run          # Show what would be restored
#

set -euo pipefail

# Configuration
BACKUP_DIR="/var/backups/ceog"
DB_NAME="ceog"
DB_USER="root"
LATEST_LINK="${BACKUP_DIR}/ceog_LATEST.sql.gz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${GREEN}INFO${NC}: $1"; }
log_warn() { echo -e "${YELLOW}WARN${NC}: $1"; }
log_error() { echo -e "${RED}ERROR${NC}: $1"; }

# List available backups
list_backups() {
    echo -e "\n${CYAN}Available Backups:${NC}"
    echo "----------------------------------------"

    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi

    local count=0
    for backup in $(ls -t "$BACKUP_DIR"/ceog_*.sql.gz 2>/dev/null); do
        count=$((count + 1))
        local size=$(du -h "$backup" | cut -f1)
        local date=$(stat -c %y "$backup" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
        local name=$(basename "$backup")

        if [ "$backup" = "$(readlink -f $LATEST_LINK 2>/dev/null)" ]; then
            echo -e "  ${GREEN}* $name${NC} ($size) - $date [LATEST]"
        else
            echo "    $name ($size) - $date"
        fi
    done

    if [ $count -eq 0 ]; then
        log_warn "No backups found in $BACKUP_DIR"
    else
        echo "----------------------------------------"
        echo "Total: $count backup(s)"
    fi
}

# Get current database stats
get_db_stats() {
    echo -e "\n${CYAN}Current Database Stats:${NC}"
    mysql -u "$DB_USER" -e "
        SELECT 'Guests' as 'Table', COUNT(*) as 'Rows' FROM Guest
        UNION ALL
        SELECT 'Registrations', COUNT(*) FROM Registration
        UNION ALL
        SELECT 'Payments', COUNT(*) FROM Payment
        UNION ALL
        SELECT 'Check-ins', COUNT(*) FROM Checkin
        UNION ALL
        SELECT 'Tables', COUNT(*) FROM \`Table\`
        UNION ALL
        SELECT 'Table Assignments', COUNT(*) FROM TableAssignment;
    " "$DB_NAME" 2>/dev/null || echo "Could not retrieve stats"
}

# Restore database
restore_db() {
    local backup_file="${1:-$LATEST_LINK}"
    local dry_run="${2:-false}"

    # Resolve symlink
    if [ -L "$backup_file" ]; then
        backup_file=$(readlink -f "$backup_file")
    fi

    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi

    log_info "Backup file: $backup_file"

    # Verify backup integrity first
    log_info "Verifying backup integrity..."
    if ! gunzip -t "$backup_file" 2>/dev/null; then
        log_error "Backup file is corrupted!"
        exit 1
    fi
    log_info "Backup integrity: OK"

    # Show backup info
    local size=$(du -h "$backup_file" | cut -f1)
    local table_count=$(zcat "$backup_file" | grep -c "^CREATE TABLE" || echo "0")
    echo -e "\n${CYAN}Backup Info:${NC}"
    echo "  File: $(basename $backup_file)"
    echo "  Size: $size"
    echo "  Tables: $table_count"

    # Show current state
    get_db_stats

    if [ "$dry_run" = "true" ]; then
        echo -e "\n${YELLOW}DRY RUN - No changes made${NC}"
        exit 0
    fi

    # Safety confirmation
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  WARNING: This will REPLACE all data in database '$DB_NAME'  ║${NC}"
    echo -e "${RED}║  All current data will be LOST!                            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    read -p "Type 'RESTORE' to confirm: " confirm

    if [ "$confirm" != "RESTORE" ]; then
        log_warn "Restore cancelled"
        exit 0
    fi

    # Stop the application
    log_info "Stopping application..."
    pm2 stop ceog 2>/dev/null || true

    # Create a safety backup before restore
    local safety_backup="${BACKUP_DIR}/ceog_pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
    log_info "Creating safety backup: $safety_backup"
    mysqldump --single-transaction -u "$DB_USER" "$DB_NAME" 2>/dev/null | gzip > "$safety_backup"

    # Restore
    log_info "Restoring database from backup..."
    gunzip < "$backup_file" | mysql -u "$DB_USER" "$DB_NAME"

    if [ $? -eq 0 ]; then
        log_info "Database restored successfully!"

        # Show new stats
        get_db_stats

        # Restart application
        log_info "Starting application..."
        pm2 start ceog 2>/dev/null || true

        echo -e "\n${GREEN}Restore completed successfully!${NC}"
        echo "Safety backup saved: $safety_backup"
    else
        log_error "Restore failed!"
        log_info "Attempting to restore from safety backup..."
        gunzip < "$safety_backup" | mysql -u "$DB_USER" "$DB_NAME"
        pm2 start ceog 2>/dev/null || true
        exit 1
    fi
}

# Point-in-time restore (if binary logs available)
pitr_restore() {
    local backup_file="$1"
    local target_time="$2"

    log_info "Point-in-Time Recovery to: $target_time"

    # First restore base backup
    restore_db "$backup_file"

    # Apply binary logs up to target time
    log_info "Applying binary logs..."

    local binlog_dir="/var/log/mysql"
    if [ -d "$binlog_dir" ]; then
        mysqlbinlog --stop-datetime="$target_time" "$binlog_dir"/mysql-bin.* 2>/dev/null | mysql -u "$DB_USER" "$DB_NAME"
        log_info "Binary logs applied successfully"
    else
        log_warn "Binary log directory not found. PITR not available."
    fi
}

# Main
main() {
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   CEO Gala Database Restore Tool       ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"

    case "${1:-}" in
        --list|-l)
            list_backups
            ;;
        --dry-run|-n)
            restore_db "${2:-$LATEST_LINK}" "true"
            ;;
        --pitr)
            if [ -z "${2:-}" ] || [ -z "${3:-}" ]; then
                echo "Usage: $0 --pitr <backup_file> <target_datetime>"
                echo "Example: $0 --pitr ceog_20260105.sql.gz '2026-01-05 14:30:00'"
                exit 1
            fi
            pitr_restore "$2" "$3"
            ;;
        --help|-h)
            echo "Usage: $0 [option] [backup_file]"
            echo ""
            echo "Options:"
            echo "  (none)              Restore from latest backup"
            echo "  <backup_file>       Restore from specific backup"
            echo "  --list, -l          List available backups"
            echo "  --dry-run, -n       Show what would be restored"
            echo "  --pitr <file> <dt>  Point-in-time recovery"
            echo "  --help, -h          Show this help"
            ;;
        "")
            restore_db "$LATEST_LINK"
            ;;
        *)
            if [ -f "$1" ]; then
                restore_db "$1"
            elif [ -f "$BACKUP_DIR/$1" ]; then
                restore_db "$BACKUP_DIR/$1"
            else
                log_error "Unknown option or file not found: $1"
                echo "Use --help for usage information"
                exit 1
            fi
            ;;
    esac
}

main "$@"
