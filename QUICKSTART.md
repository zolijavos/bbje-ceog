# CEO Gala - Quick Start Guide

Ez a gyors útmutató 5 perc alatt végigvezet a telepítésen.

## Előfeltételek

- Ubuntu 22.04+ szerver
- Root SSH hozzáférés
- Domain név (pl. ceogala.hu)

## Telepítés

### 1. Kód letöltése

```bash
cd /var/www
git clone https://github.com/zolijavos/bbje-ceog.git ceog
cd ceog
```

### 2. Rendszer telepítése

```bash
sudo bash deploy/install.sh
```

### 3. Adatbázis létrehozása

```bash
sudo bash deploy/setup-database.sh
```

### 4. Konfigurálás

```bash
sudo bash deploy/configure.sh
```

### 5. Indítás

```bash
sudo bash deploy/start.sh
```

### 6. Nginx + SSL

```bash
sudo bash deploy/setup-nginx.sh
sudo bash deploy/setup-ssl.sh
```

## Frissítés

Bármikor egyetlen paranccsal frissítheted:

```bash
cd /var/www/ceog
sudo bash deploy/deploy.sh main
```

A script automatikusan:
- Backupol
- Frissít Git-ről
- Telepít
- Buildel
- Újraindít
- Health check-el

## Health Check

```bash
curl http://localhost:3000/api/health
```

Válasz: `{"status":"healthy",...}`

## Admin Belépés

1. Nyisd meg: `https://TE_DOMAIN/admin/login`
2. Hozz létre admin felhasználót:
   ```bash
   node scripts/create-admin.js
   ```

## Logok

```bash
pm2 logs ceog --lines 50
```

## Segítség

Részletes útmutató: [INSTALL.md](./INSTALL.md)

---

**MyForge Labs** | Built with Claude Code
