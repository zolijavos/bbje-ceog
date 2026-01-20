# CEO Gala Regisztrációs Rendszer - Telepítési Útmutató

**Verzió**: 2.8.0
**Utolsó frissítés**: 2026-01-13

---

## Tartalomjegyzék

1. [Rendszerkövetelmények](#rendszerkövetelmények)
2. [Technológiai Stack](#technológiai-stack)
3. [Hagyományos Telepítés (PM2 + Nginx)](#hagyományos-telepítés-pm2--nginx)
4. [Docker Telepítés](#docker-telepítés)
5. [Környezeti Változók](#környezeti-változók)
6. [Adatbázis Beállítás](#adatbázis-beállítás)
7. [SSL Konfiguráció](#ssl-konfiguráció)
8. [Stripe Webhook Beállítás](#stripe-webhook-beállítás)
9. [Telepítés Utáni Ellenőrzés](#telepítés-utáni-ellenőrzés)
10. [Karbantartási Parancsok](#karbantartási-parancsok)

---

## Rendszerkövetelmények

### Minimum Hardver

| Komponens | Minimum | Ajánlott |
|-----------|---------|----------|
| **CPU** | 1 vCPU | 2 vCPU |
| **RAM** | 2 GB | 4 GB |
| **Tárhely** | 20 GB SSD | 40 GB SSD |
| **Hálózat** | 100 Mbps | 1 Gbps |

### Operációs Rendszer

- **Ubuntu 22.04 LTS** vagy **Ubuntu 24.04 LTS** (ajánlott)
- **Debian 12** (alternatíva)

### Szükséges Portok

| Port | Szolgáltatás | Hozzáférés |
|------|--------------|------------|
| 22 | SSH | Csak admin |
| 80 | HTTP (Nginx) | Nyilvános |
| 443 | HTTPS (Nginx + SSL) | Nyilvános |
| 3000 | Next.js Alkalmazás | Csak belső |
| 3306 | MySQL Adatbázis | Csak belső |

---

## Technológiai Stack

| Komponens | Verzió | Cél |
|-----------|--------|-----|
| **Node.js** | 20.x LTS | JavaScript futtatókörnyezet |
| **Next.js** | 14.x | React keretrendszer (frontend + API) |
| **MySQL** | 8.0+ | Relációs adatbázis |
| **Prisma** | 5.x | Adatbázis ORM |
| **PM2** | Legújabb | Folyamatkezelő (hagyományos) |
| **Nginx** | Legújabb | Reverse proxy + SSL lezárás |
| **Docker** | 24.x+ | Konténerizáció (opcionális) |

---

## Hagyományos Telepítés (PM2 + Nginx)

### 1. Lépés: Rendszer Függőségek Telepítése

```bash
# Rendszer frissítése
sudo apt update && sudo apt upgrade -y

# Alapvető csomagok telepítése
sudo apt install -y curl git build-essential

# Node.js 20 LTS telepítése
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Node.js telepítés ellenőrzése
node --version  # v20.x.x kell legyen
npm --version   # 10.x.x kell legyen

# PM2 globális telepítése
sudo npm install -g pm2

# MySQL 8.0 telepítése
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql

# Nginx telepítése
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Certbot telepítése SSL-hez
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Lépés: MySQL Konfigurálás

```bash
# MySQL biztonságos telepítés
sudo mysql_secure_installation

# Adatbázis és felhasználó létrehozása
sudo mysql -u root -p
```

```sql
CREATE DATABASE ceog_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ceog_user'@'localhost' IDENTIFIED BY 'EROS_JELSZO_IDE';
GRANT ALL PRIVILEGES ON ceog_production.* TO 'ceog_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Lépés: Alkalmazás Telepítése

```bash
# Alkalmazás könyvtár létrehozása
sudo mkdir -p /var/www/ceog
sudo chown $USER:$USER /var/www/ceog

# Repository klónozása (vagy fájlok másolása)
cd /var/www
git clone <REPOSITORY_URL> ceog
cd ceog

# Függőségek telepítése
npm ci --production=false

# Környezeti fájl létrehozása
cp .env.example .env
nano .env  # Szerkesztés produkciós értékekkel (lásd Környezeti Változók szekció)

# Prisma kliens generálása
npx prisma generate

# Adatbázis migrációk futtatása
npx prisma migrate deploy

# Kezdeti adatok betöltése (opcionális - admin felhasználót hoz létre)
npm run db:seed

# Alkalmazás buildelése
npm run build

# Indítás PM2-vel
pm2 start npm --name "ceog" -- start
pm2 save
pm2 startup  # Kövesd a kimenet utasításait
```

### 4. Lépés: Nginx Konfigurálás

Hozd létre a `/etc/nginx/sites-available/ceog` fájlt:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # HTTP átirányítás HTTPS-re
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL tanúsítványok (Certbot fogja hozzáadni)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Biztonsági fejlécek
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy beállítások
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Statikus fájlok cache-elése
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    # Email képek (emailekhez használt képek)
    location /email-assets {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

Oldal engedélyezése:

```bash
sudo ln -s /etc/nginx/sites-available/ceog /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Alapértelmezett oldal eltávolítása
sudo nginx -t  # Konfiguráció tesztelése
sudo systemctl reload nginx
```

### 5. Lépés: SSL Konfigurálás

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Docker Telepítés

### 1. Lépés: Docker Telepítése

```bash
# Docker telepítése
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Docker Compose telepítése
sudo apt install -y docker-compose-plugin

# Kijelentkezés és újra bejelentkezés a csoport változások érvényesítéséhez
```

### 2. Lépés: docker-compose.yml Létrehozása

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://ceog_user:ceog_jelszo@db:3306/ceog_production
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - ceog-network

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_jelszo_ide
      MYSQL_DATABASE: ceog_production
      MYSQL_USER: ceog_user
      MYSQL_PASSWORD: ceog_jelszo
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - ceog-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - ceog-network

volumes:
  mysql_data:

networks:
  ceog-network:
    driver: bridge
```

### 3. Lépés: Telepítés Docker-rel

```bash
# Repository klónozása
git clone <REPOSITORY_URL> ceog
cd ceog

# Környezeti fájl létrehozása
cp .env.example .env
nano .env  # Szerkesztés produkciós értékekkel

# Konténerek buildelése és indítása
docker compose up -d --build

# Adatbázis migrációk futtatása
docker compose exec app npx prisma migrate deploy

# Kezdeti adatok betöltése (opcionális)
docker compose exec app npm run db:seed

# Logok megtekintése
docker compose logs -f app
```

---

## Környezeti Változók

Hozd létre a `.env` fájlt az alábbi változókkal:

```env
# ============================================
# ADATBÁZIS (Kötelező)
# ============================================
DATABASE_URL="mysql://ceog_user:AZ_ADATBAZIS_JELSZAVAD@localhost:3306/ceog_production"

# ============================================
# ALKALMAZÁS TITKOK (Kötelező)
# Generálás: openssl rand -base64 64
# ============================================
APP_SECRET="GENERALJ_64_KARAKTERES_VELETLENSZERU_STRINGET_MAGIC_LINKEKHEZ"
QR_SECRET="GENERALJ_64_KARAKTERES_VELETLENSZERU_STRINGET_QR_JEGYEKHEZ"

# ============================================
# NEXTAUTH (Kötelező)
# Generálás: openssl rand -base64 64
# ============================================
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="GENERALJ_64_KARAKTERES_VELETLENSZERU_STRINGET_ADMIN_SESSIONHOZ"

# ============================================
# STRIPE FIZETÉS (Kötelező)
# Beszerezhető: https://dashboard.stripe.com/apikeys
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_A_TE_PUBLISHABLE_KULCSOD"
STRIPE_SECRET_KEY="sk_live_A_TE_SECRET_KULCSOD"
STRIPE_WEBHOOK_SECRET="whsec_A_TE_WEBHOOK_SECRETED"

# ============================================
# EMAIL SMTP (Kötelező)
# ============================================
SMTP_HOST="smtp.emailszolgaltato.com"
SMTP_PORT=587
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="AZ_SMTP_JELSZAVAD"
SMTP_FROM="noreply@yourdomain.com"

# ============================================
# ALKALMAZÁS BEÁLLÍTÁSOK
# ============================================
NODE_ENV="production"
APP_URL="https://yourdomain.com"
MAGIC_LINK_EXPIRY_HOURS=24
NEXT_PUBLIC_MAGIC_LINK_EXPIRY_HOURS=24
SHOW_TABLE_NUMBERS=true
```

### Titkok Generálása

```bash
# APP_SECRET, QR_SECRET és NEXTAUTH_SECRET generálása (mind 64 karakter)
openssl rand -base64 64
```

---

## Adatbázis Beállítás

### Kezdeti Migráció

```bash
# Prisma kliens generálása
npx prisma generate

# Migrációk alkalmazása produkciós adatbázisra
npx prisma migrate deploy
```

### Seed Adatok (Opcionális)

Alapértelmezett admin felhasználót és teszt adatokat hoz létre:

```bash
npm run db:seed
```

**Alapértelmezett Admin Belépési Adatok** (első bejelentkezés után változtasd meg):
- Email: `admin@ceogala.test`
- Jelszó: `Admin123!`

### Adatbázis Mentés

```bash
# Mentés készítése
mysqldump -u ceog_user -p ceog_production > backup_$(date +%Y%m%d).sql

# Mentés visszaállítása
mysql -u ceog_user -p ceog_production < backup_20260113.sql
```

---

## SSL Konfiguráció

### Let's Encrypt Használata (Ajánlott)

```bash
# Certbot telepítése
sudo apt install -y certbot python3-certbot-nginx

# Tanúsítvány beszerzése
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Automatikus megújítás automatikusan be van állítva
# Megújítás tesztelése
sudo certbot renew --dry-run
```

### Egyedi Tanúsítvány Használata

Helyezd a tanúsítványokat a `/etc/nginx/ssl/` mappába:
- `certificate.crt` - SSL tanúsítvány
- `private.key` - Privát kulcs
- `ca_bundle.crt` - CA bundle (ha szükséges)

---

## Stripe Webhook Beállítás

### Konfiguráció a Stripe Dashboardban

1. Menj a https://dashboard.stripe.com/webhooks oldalra
2. Kattints az "Add endpoint" gombra
3. Add meg az endpoint URL-t: `https://yourdomain.com/api/stripe/webhook`
4. Válaszd ki az eseményeket:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Másold ki a webhook signing secret-et a `.env` fájlba `STRIPE_WEBHOOK_SECRET` néven

### Webhook Tesztelése

```bash
# Stripe CLI használatával (fejlesztéshez)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Telepítés Utáni Ellenőrzés

### Állapot Ellenőrzések

```bash
# Alkalmazás állapot ellenőrzése
pm2 status

# Alkalmazás logok megtekintése
pm2 logs ceog --lines 100

# Nginx állapot ellenőrzése
sudo systemctl status nginx

# MySQL állapot ellenőrzése
sudo systemctl status mysql

# HTTPS tesztelése
curl -I https://yourdomain.com
```

### Funkcionális Tesztek

1. **Főoldal**: Látogasd meg a `https://yourdomain.com` címet - be kell töltődnie
2. **Admin Bejelentkezés**: Látogasd meg a `https://yourdomain.com/admin` címet - bejelentkezési űrlap kell megjelenjen
3. **API Állapot**: Látogasd meg a `https://yourdomain.com/api/health` címet - OK-t kell visszaadnia
4. **Email Képek**: Látogasd meg a `https://yourdomain.com/email-assets/CEO_Gala_2026_invitation_header_709x213.jpg` címet - be kell töltődnie a képnek

---

## Karbantartási Parancsok

### Alkalmazás Kezelés

```bash
# Alkalmazás újraindítása
pm2 restart ceog

# Alkalmazás leállítása
pm2 stop ceog

# Logok megtekintése
pm2 logs ceog

# Erőforrások figyelése
pm2 monit
```

### Adatbázis Kezelés

```bash
# Prisma Studio megnyitása (grafikus felület)
npx prisma studio

# Migrációk futtatása
npx prisma migrate deploy

# Adatbázis visszaállítása (FIGYELEM: minden adatot töröl)
npx prisma migrate reset
```

### Frissítések

```bash
# Legújabb kód letöltése
cd /var/www/ceog
git pull origin main

# Függőségek telepítése
npm ci

# Migrációk futtatása
npx prisma migrate deploy

# Újrabuildelés
npm run build

# Újraindítás
pm2 restart ceog
```

### Logok

```bash
# Alkalmazás logok
pm2 logs ceog

# Nginx hozzáférési logok
sudo tail -f /var/log/nginx/access.log

# Nginx hiba logok
sudo tail -f /var/log/nginx/error.log

# MySQL logok
sudo tail -f /var/log/mysql/error.log
```

---

## Támogatás

Technikai problémák esetén lépj kapcsolatba a fejlesztő csapattal vagy tekintsd meg a projekt dokumentációját.

**Repository**: `<REPOSITORY_URL>`
**Dokumentáció**: `/docs` mappa a repository-ban
