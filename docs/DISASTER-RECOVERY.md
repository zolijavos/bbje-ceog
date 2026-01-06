# Disaster Recovery Plan - CEO Gala 2026

> **Verzió**: 1.0
> **Utolsó frissítés**: 2026-01-05
> **Felelős**: DevOps / System Admin

---

## 📋 Tartalomjegyzék

1. [Áttekintés](#áttekintés)
2. [RTO és RPO Célok](#rto-és-rpo-célok)
3. [Backup Stratégia](#backup-stratégia)
4. [Restore Eljárások](#restore-eljárások)
5. [Katasztrófa Forgatókönyvek](#katasztrófa-forgatókönyvek)
6. [Monitoring és Alerting](#monitoring-és-alerting)
7. [Tesztelési Ütemterv](#tesztelési-ütemterv)
8. [Kapcsolattartók](#kapcsolattartók)

---

## Áttekintés

### Rendszer Architektúra

```
┌─────────────────────────────────────────────────────────────┐
│                    Hetzner VPS (Production)                  │
│                    IP: 46.202.153.178                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Nginx     │→ │   PM2       │→ │   Next.js App       │  │
│  │   (proxy)   │  │   (process) │  │   (Node.js 18+)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           ↓                                  │
│                   ┌─────────────┐                           │
│                   │  MySQL 8.0  │                           │
│                   │  (ceog DB)  │                           │
│                   └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │  Local Backups         │
              │  /var/backups/ceog     │
              └────────────────────────┘
                           ↓
              ┌────────────────────────┐
              │  Offsite Storage       │
              │  (Hetzner Storage Box) │
              └────────────────────────┘
```

### Kritikus Komponensek

| Komponens | Kritikusság | RPO | RTO |
|-----------|-------------|-----|-----|
| MySQL Database | 🔴 KRITIKUS | 8 óra | 30 perc |
| Next.js Application | 🟡 MAGAS | N/A (git) | 15 perc |
| Nginx Config | 🟢 KÖZEPES | N/A | 10 perc |
| Environment Variables | 🔴 KRITIKUS | N/A | 5 perc |
| SSL Certificates | 🟡 MAGAS | N/A | 30 perc |

---

## RTO és RPO Célok

### Recovery Point Objective (RPO)
> **Maximális elfogadható adatvesztés**

| Tier | RPO | Leírás |
|------|-----|--------|
| Tier 1 | 8 óra | Napi 3x automatikus backup (02:00, 10:00, 18:00) |
| Tier 2 | 1 óra | Binary log replay (PITR) |
| Tier 3 | 0 | Real-time replication (nem implementált) |

### Recovery Time Objective (RTO)
> **Maximális elfogadható leállás**

| Scenario | RTO | Eljárás |
|----------|-----|---------|
| Database korrupció | 30 perc | Restore from backup |
| VPS leállás | 2 óra | Új VPS + full restore |
| Alkalmazás hiba | 15 perc | Git checkout + redeploy |
| Teljes adatközpont kiesés | 4 óra | Offsite restore új lokációra |

---

## Backup Stratégia

### 3-2-1 Szabály

```
3 → Minimum 3 másolat az adatból
2 → 2 különböző tárolóeszközön
1 → 1 példány offsite (távoli helyen)
```

### Automatikus Backup Ütemezés

```bash
# Crontab bejegyzés (crontab -e)
# Naponta 3x: 02:00, 10:00, 18:00
0 2,10,18 * * * /var/www/ceog/scripts/backup-db.sh >> /var/log/ceog-backup.log 2>&1

# Heti offsite sync (vasárnap 04:00)
0 4 * * 0 rclone sync /var/backups/ceog hetzner-storage:ceog-backups --max-age 14d
```

### Backup Script Használata

```bash
# Manuális backup készítése
/var/www/ceog/scripts/backup-db.sh

# Backup integritás ellenőrzése
/var/www/ceog/scripts/backup-db.sh --verify-only

# Backup fájlok listázása
ls -lh /var/backups/ceog/
```

### Backup Fájl Formátum

```
ceog_YYYYMMDD_HHMMSS.sql.gz
│    │        │
│    │        └── Időbélyeg (óra, perc, mp)
│    └─────────── Dátum
└──────────────── Prefix (adatbázis név)

Példa: ceog_20260105_180000.sql.gz
```

### Megőrzési Politika

| Típus | Megőrzés | Példány |
|-------|----------|---------|
| Napi backup | 30 nap | ~90 fájl |
| Heti összesítő | 12 hét | 12 fájl |
| Havi archívum | 12 hónap | 12 fájl |

---

## Restore Eljárások

### Gyors Restore (< 5 perc)

```bash
# 1. Alkalmazás leállítása
pm2 stop ceog

# 2. Legutóbbi backup visszaállítása
/var/www/ceog/scripts/restore-db.sh

# 3. Alkalmazás újraindítása (automatikus a script végén)
```

### Restore Konkrét Időpontból

```bash
# Elérhető backupok listázása
/var/www/ceog/scripts/restore-db.sh --list

# Konkrét backup visszaállítása
/var/www/ceog/scripts/restore-db.sh ceog_20260105_100000.sql.gz

# Dry-run (csak ellenőrzés)
/var/www/ceog/scripts/restore-db.sh --dry-run ceog_20260105_100000.sql.gz
```

### Point-in-Time Recovery (PITR)

```bash
# Binary log engedélyezése szükséges!
# Lásd: /etc/mysql/mysql.conf.d/mysqld.cnf

# PITR adott időpontra
/var/www/ceog/scripts/restore-db.sh --pitr ceog_20260105_020000.sql.gz '2026-01-05 14:30:00'
```

### Teljes VPS Újraépítés

```bash
# 1. Új VPS létrehozása (Hetzner Cloud Console)
# 2. Alap setup futtatása
ssh root@NEW_IP
apt update && apt upgrade -y
apt install -y nginx mysql-server nodejs npm git

# 3. Alkalmazás klónozása
cd /var/www
git clone https://github.com/YOUR_ORG/ceog.git
cd ceog

# 4. Dependencies telepítése
npm install
npx prisma generate

# 5. Environment variables visszaállítása
# (biztonságos tárolóból - pl. 1Password, Vault)
cp /secure/backup/.env /var/www/ceog/.env

# 6. Database restore
mkdir -p /var/backups/ceog
# Backup másolása offsite storage-ból
rclone copy hetzner-storage:ceog-backups/ceog_LATEST.sql.gz /var/backups/ceog/
/var/www/ceog/scripts/restore-db.sh

# 7. Nginx konfiguráció
cp /var/www/ceog/deploy/nginx.conf /etc/nginx/sites-available/ceog
ln -s /etc/nginx/sites-available/ceog /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 8. SSL tanúsítvány
certbot --nginx -d ceogala.hu -d www.ceogala.hu

# 9. PM2 setup
npm run build
pm2 start npm --name "ceog" -- start
pm2 save
pm2 startup

# 10. Ellenőrzés
curl -I https://ceogala.hu/api/health
```

---

## Katasztrófa Forgatókönyvek

### Scenario 1: Véletlen Adattörlés

**Trigger**: Téves DELETE/DROP utasítás

**Eljárás**:
1. Azonnal állítsd le az alkalmazást: `pm2 stop ceog`
2. NE futtass további DB műveleteket!
3. Határozd meg az utolsó helyes állapotot
4. Restore a megfelelő backupból
5. Ellenőrizd az adatintegritást
6. Indítsd újra: `pm2 start ceog`

**Megelőzés**:
- Soha ne futtass DELETE WHERE feltétel nélkül
- Használj tranzakciókat kritikus műveleteknél
- Test environment-ben próbáld ki először

### Scenario 2: Database Korrupció

**Trigger**: Áramkimaradás, disk hiba, MySQL crash

**Eljárás**:
```bash
# 1. Ellenőrizd a MySQL státuszt
systemctl status mysql
journalctl -u mysql --since "1 hour ago"

# 2. Próbáld meg a repair-t
mysqlcheck -u root -p --auto-repair ceog

# 3. Ha sikertelen, restore from backup
/var/www/ceog/scripts/restore-db.sh

# 4. Binary log replay (ha elérhető)
# Ez visszaállítja a backup óta történt változásokat
```

### Scenario 3: VPS Teljes Kiesés

**Trigger**: Hardware hiba, adatközpont probléma

**Eljárás**:
1. Hozz létre új VPS-t (azonos régióban vagy másikban)
2. Kövesd a "Teljes VPS Újraépítés" lépéseit
3. Frissítsd a DNS rekordokat
4. Értesítsd a felhasználókat

**Időbecslés**: ~2 óra (DNS propagáció: +24 óra)

### Scenario 4: Ransomware / Security Breach

**Trigger**: Támadás, kompromittált rendszer

**Eljárás**:
1. **AZONNAL** válaszd le a VPS-t a hálózatról
2. Ne fizess váltságdíjat!
3. Értesítsd a security csapatot
4. Forensic vizsgálat (ha szükséges)
5. Új VPS telepítés TISZTA backup-ból
6. Jelszavak, API kulcsok cseréje
7. Security audit

---

## Monitoring és Alerting

### Automatikus Ellenőrzések

```bash
# Backup monitoring script (cron: minden órában)
#!/bin/bash
LATEST="/var/backups/ceog/ceog_LATEST.sql.gz"
MAX_AGE=32400  # 9 óra (másodpercben)

if [ ! -f "$LATEST" ]; then
    echo "CRITICAL: No backup found!" | mail -s "CEOG Backup ALERT" admin@ceogala.hu
    exit 1
fi

AGE=$(($(date +%s) - $(stat -c %Y "$LATEST")))
if [ $AGE -gt $MAX_AGE ]; then
    echo "WARNING: Backup is $((AGE/3600)) hours old" | mail -s "CEOG Backup Warning" admin@ceogala.hu
fi
```

### Health Check Endpoint

```bash
# API health check
curl -s https://ceogala.hu/api/health | jq

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-05T21:00:00.000Z"
}
```

### Alert Szabályok

| Metrika | Warning | Critical | Action |
|---------|---------|----------|--------|
| Backup age | > 10 óra | > 24 óra | Email + SMS |
| Disk usage | > 80% | > 95% | Email |
| DB connections | > 80 | > 100 | Email |
| API response time | > 2s | > 5s | Email |

---

## Tesztelési Ütemterv

### Havi Tesztek

| Teszt | Gyakoriság | Felelős | Utolsó |
|-------|------------|---------|--------|
| Backup integrity | Naponta (auto) | Script | - |
| Restore drill (staging) | Havonta | DevOps | - |
| Full DR drill | Negyedévente | DevOps + PM | - |
| Security audit | Félévente | Security | - |

### Restore Drill Checklist

- [ ] Staging környezet előkészítése
- [ ] Legutóbbi backup letöltése
- [ ] Restore végrehajtása
- [ ] Adatintegritás ellenőrzése (row counts)
- [ ] Alkalmazás funkcionális teszt
- [ ] Teljesítmény teszt
- [ ] Dokumentáció frissítése
- [ ] Eredmények rögzítése

---

## Kapcsolattartók

### Elsődleges Kontaktok

| Szerep | Név | Telefon | Email |
|--------|-----|---------|-------|
| System Admin | TBD | +36-XX-XXX-XXXX | admin@ceogala.hu |
| DevOps Lead | TBD | +36-XX-XXX-XXXX | devops@ceogala.hu |
| Project Manager | TBD | +36-XX-XXX-XXXX | pm@ceogala.hu |

### Szolgáltatók

| Szolgáltató | Support | SLA |
|-------------|---------|-----|
| Hetzner VPS | https://console.hetzner.cloud | 99.9% |
| Domain (DNS) | - | - |
| SSL (Let's Encrypt) | https://letsencrypt.org | N/A |

### Eszkaláció

```
L1: System Admin (0-15 perc)
    ↓
L2: DevOps Lead (15-30 perc)
    ↓
L3: Project Manager + CTO (30+ perc)
```

---

## Dokumentum Történet

| Verzió | Dátum | Szerző | Változások |
|--------|-------|--------|------------|
| 1.0 | 2026-01-05 | Murat (TEA) | Kezdeti verzió |

---

> **Megjegyzés**: Ez a dokumentum élesítés előtt frissítendő a valós kapcsolattartói adatokkal és a végleges offsite storage konfigurációval.
