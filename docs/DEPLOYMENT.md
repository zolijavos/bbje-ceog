# Deployment Guide - CEO Gala Registration System

Ez a dokumentum a lokális fejlesztéstől a production VPS deployment-ig végigvezet minden lépésen.

---

## 📋 Tartalom

1. [Lokális Fejlesztési Környezet Setup](#1-lokális-fejlesztési-környezet-setup-wsl2-ubuntu)
2. [GitHub Repository Setup](#2-github-repository-setup)
3. [Hostinger VPS Initial Setup](#3-hostinger-vps-initial-setup)
4. [GitHub Actions CI/CD Setup](#4-github-actions-cicd-setup)
5. [Deployment Workflow](#5-deployment-workflow)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Lokális Fejlesztési Környezet Setup (WSL2 Ubuntu)

### 1.1 Előfeltételek

```bash
# Node.js 18+ telepítés (ha még nincs)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Docker Desktop telepítés Windows-on (WSL2 backend)
# Download: https://www.docker.com/products/docker-desktop/
```

### 1.2 Projekt Klónozása

```bash
cd /home/javo/DEV
git clone https://github.com/YOUR_USERNAME/CEOG-1.git
cd CEOG-1
```

### 1.3 Dependencies Telepítése

```bash
npm install
```

### 1.4 MySQL Database Indítása (Docker Compose)

```bash
# MySQL + phpMyAdmin indítása
docker-compose up -d

# Ellenőrzés
docker-compose ps

# Logs megtekintése
docker-compose logs -f mysql

# Leállítás (adatok megmaradnak)
docker-compose down

# Teljes reset (ADATOK TÖRLÉSE!)
docker-compose down -v
```

**Kapcsolódási adatok:**
- **MySQL Host:** localhost
- **Port:** 3306
- **User:** ceog_user
- **Password:** ceog_password
- **Database:** ceog_dev
- **phpMyAdmin:** http://localhost:8080

### 1.5 Environment Variables Setup

```bash
# .env.local fájl létrehozása
cp .env.example .env.local

# Secrets generálás
openssl rand -base64 64  # APP_SECRET és QR_SECRET
openssl rand -base64 32  # NEXTAUTH_SECRET
```

**Frissítsd .env.local tartalmát:**

```env
DATABASE_URL="mysql://ceog_user:ceog_password@localhost:3306/ceog_dev"

APP_SECRET="PASTE_GENERATED_64_CHAR_SECRET_HERE"
QR_SECRET="PASTE_GENERATED_64_CHAR_SECRET_HERE"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="PASTE_GENERATED_32_CHAR_SECRET_HERE"

# Stripe Test Mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY"
STRIPE_SECRET_KEY="sk_test_YOUR_KEY"
STRIPE_WEBHOOK_SECRET="whsec_test_YOUR_KEY"

# Email (Mailtrap for testing)
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your_mailtrap_user"
SMTP_PASS="your_mailtrap_pass"
SMTP_FROM="noreply@ceogala.test"
```

### 1.6 Prisma Database Setup

```bash
# Prisma Client generálás
npx prisma generate

# Database migráció
npx prisma migrate dev --name initial_schema

# (Opcionális) Seed adatbázis test adatokkal
npm run db:seed

# Prisma Studio (DB GUI)
npx prisma studio
# Visit: http://localhost:5555
```

### 1.7 Development Server Indítása

```bash
# Next.js dev server
npm run dev

# Visit: http://localhost:3000
```

### 1.8 Playwright Setup (E2E Testing)

```bash
# Playwright browsers telepítése
npx playwright install --with-deps

# Playwright UI mode (GUI testing)
npx playwright test --ui

# Headless mode
npx playwright test

# Specific test futtatása
npx playwright test tests/e2e/payment.spec.ts

# Debug mode
npx playwright test --debug
```

---

## 2. GitHub Repository Setup

### 2.1 GitHub Repository Létrehozása

1. GitHub-on: **New Repository**
2. Repository name: `ceog-gala` (vagy tetszőleges)
3. Private/Public választás
4. **NE** add hozzá README, .gitignore (már van a projektben)

### 2.2 Git Remote Setup

```bash
cd /home/javo/DEV/CEOG-1

# Git init (ha még nincs)
git init

# Remote hozzáadása
git remote add origin https://github.com/YOUR_USERNAME/ceog-gala.git

# Első commit
git add .
git commit -m "Initial commit: CEO Gala registration system"

# Push to GitHub
git push -u origin main
```

### 2.3 GitHub Secrets Beállítása (CI/CD-hez)

**GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

#### Stripe Test Keys (GitHub Actions Testing)

| Secret Name | Value | Hol találod |
|-------------|-------|-------------|
| `STRIPE_TEST_PUBLISHABLE_KEY` | `pk_test_...` | [Stripe Dashboard - Test Mode](https://dashboard.stripe.com/test/apikeys) |
| `STRIPE_TEST_SECRET_KEY` | `sk_test_...` | Stripe Dashboard - Test Mode |
| `STRIPE_TEST_WEBHOOK_SECRET` | `whsec_test_...` | Stripe Dashboard - Webhooks |

#### VPS Deployment Secrets

| Secret Name | Value | Leírás |
|-------------|-------|--------|
| `VPS_HOST` | `123.45.67.89` | Hostinger VPS IP címe |
| `VPS_USERNAME` | `root` | SSH username (általában root) |
| `VPS_SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | SSH private key (lásd alább) |
| `VPS_SSH_PORT` | `22` | SSH port (default: 22) |

**SSH Private Key Generálás:**

```bash
# Lokális gépen (WSL2)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/vps_deploy_key

# Public key feltöltése VPS-re
ssh-copy-id -i ~/.ssh/vps_deploy_key.pub root@YOUR_VPS_IP

# Private key tartalmának másolása (GitHub Secret-be)
cat ~/.ssh/vps_deploy_key
```

Másold be a **teljes private key**-t (beleértve `-----BEGIN...` és `-----END...` sorokat) a `VPS_SSH_PRIVATE_KEY` secret-be.

---

## 3. Hostinger VPS Initial Setup

### 3.1 SSH Kapcsolódás VPS-hez

```bash
# Első SSH bejelentkezés
ssh root@YOUR_VPS_IP

# Ha custom port:
ssh -p 2222 root@YOUR_VPS_IP
```

### 3.2 Automatikus VPS Setup Script Futtatása

**VPS-en futtatandó:**

```bash
# Script letöltése (ha már GitHub-on van a projekt)
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/ceog-gala/main/scripts/vps-initial-setup.sh

# Vagy ha még nincs GitHub-on, másold át SCP-vel:
# scp scripts/vps-initial-setup.sh root@YOUR_VPS_IP:/root/

# Futtatás
bash vps-initial-setup.sh
```

**Script végigvezet:**
1. ✅ Node.js 18 telepítés (nvm)
2. ✅ MySQL 8.0 telepítés
3. ✅ Production database létrehozása
4. ✅ PM2 telepítés
5. ✅ Nginx telepítés
6. ✅ SSL certificate setup (Certbot)
7. ✅ Projekt klónozása GitHub-ról
8. ✅ `.env` production fájl létrehozása
9. ✅ Prisma migrations futtatása
10. ✅ Next.js build
11. ✅ PM2 process indítása

### 3.3 Manual VPS Setup (ha script nélkül)

<details>
<summary>Kattints a részletes manual setup-hoz</summary>

#### 3.3.1 Node.js Telepítés

```bash
# nvm telepítés
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc

# Node.js 18
nvm install 18
nvm use 18
nvm alias default 18
```

#### 3.3.2 MySQL Telepítés

```bash
apt update
apt install mysql-server -y
systemctl start mysql
systemctl enable mysql

# Biztonságos telepítés
mysql_secure_installation

# Database létrehozása
mysql -u root -p
```

```sql
CREATE DATABASE ceog_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ceog_prod_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON ceog_production.* TO 'ceog_prod_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3.3.3 PM2 + Nginx Telepítés

```bash
npm install -g pm2
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

#### 3.3.4 Projekt Setup

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/YOUR_USERNAME/ceog-gala.git
cd ceog-gala

npm install

# .env production file
nano .env
```

#### 3.3.5 Nginx Configuration

```bash
nano /etc/nginx/sites-available/ceog-gala
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/ceog-gala /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 3.3.6 SSL Certificate

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

</details>

---

## 4. GitHub Actions CI/CD Setup

### 4.1 Workflow Fájlok

Két GitHub Actions workflow létrehozva:

1. **`.github/workflows/playwright-test.yml`** - E2E tesztek minden push-ra
2. **`.github/workflows/deploy-vps.yml`** - Automatikus deployment VPS-re (main branch push)

### 4.2 Workflow Működése

#### Playwright Test Workflow (minden push-ra)

```
Push to GitHub (any branch)
  ↓
GitHub Actions indít Ubuntu runner-t
  ↓
MySQL 8.0 Docker container indítása
  ↓
npm install + Prisma setup
  ↓
Playwright browsers telepítése
  ↓
E2E tesztek futtatása (headless mode)
  ↓
Test reports feltöltése (artifacts)
```

#### VPS Deploy Workflow (csak main branch push)

```
Push to main branch
  ↓
SSH kapcsolódás VPS-hez
  ↓
git pull origin main
  ↓
npm install (új dependencies)
  ↓
Prisma migrations (npx prisma migrate deploy)
  ↓
Next.js build
  ↓
PM2 restart
  ↓
(Opcionális) Smoke tests futtatása VPS-en
```

### 4.3 Manual Workflow Indítás

GitHub Repository → **Actions** → **Deploy to Hostinger VPS** → **Run workflow**

---

## 5. Deployment Workflow

### 5.1 Normál Fejlesztési Ciklus

```bash
# 1. Lokális fejlesztés (WSL2)
cd /home/javo/DEV/CEOG-1
npm run dev

# 2. Fejlesztés + tesztelés
# ... kód írás ...

# 3. Playwright tesztek lokálisan
npx playwright test --ui

# 4. Git commit
git add .
git commit -m "feat: payment flow implementation"

# 5. Push GitHub-ra
git push origin main
```

**Automatikus folyamat:**
1. ✅ GitHub Actions: Playwright E2E tesztek futnak
2. ✅ Ha tesztek OK → Automatikus deploy VPS-re
3. ✅ PM2 restart production-ben
4. ✅ Email notification (ha beállítva)

### 5.2 Manual Deploy (ha GitHub Actions nem megy)

```bash
# Lokális gépről (WSL2)
bash scripts/deploy-manual.sh

# Vagy közvetlenül SSH-val:
ssh root@YOUR_VPS_IP << 'DEPLOY'
cd /var/www/ceog-gala
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart ceog-gala
DEPLOY
```

### 5.3 Hotfix Deploy (gyors bugfix)

```bash
# 1. Fix készítése lokálisan
# ... kód fix ...

# 2. Commit + push
git add .
git commit -m "hotfix: critical payment bug"
git push origin main

# 3. GitHub Actions automatikusan deploy-ol

# 4. Monitoring
ssh root@YOUR_VPS_IP 'pm2 logs ceog-gala --lines 50'
```

---

## 6. Troubleshooting

### 6.1 Lokális Fejlesztési Problémák

**Problem:** MySQL connection error

```bash
# Ellenőrizd Docker container fut-e
docker-compose ps

# Indítsd újra
docker-compose down
docker-compose up -d

# Ellenőrizd .env.local DATABASE_URL-t
cat .env.local | grep DATABASE_URL
```

**Problem:** Prisma migration fails

```bash
# Reset database (FIGYELEM: törli az adatokat!)
npx prisma migrate reset

# Vagy manual reset:
docker-compose down -v
docker-compose up -d
npx prisma migrate dev
```

**Problem:** Playwright tests fail locally

```bash
# Reinstall browsers
npx playwright install --with-deps

# Clear cache
rm -rf playwright-report test-results

# Run single test in debug mode
npx playwright test tests/e2e/payment.spec.ts --debug
```

### 6.2 GitHub Actions Problémák

**Problem:** Playwright tests timeout

- Ellenőrizd MySQL service health check-et
- Növeld timeout-ot: `timeout-minutes: 60` → `120`

**Problem:** SSH deploy fails

```bash
# Ellenőrizd GitHub Secrets-et:
# - VPS_HOST (IP cím helyes-e)
# - VPS_SSH_PRIVATE_KEY (teljes key benne van-e)

# Teszteld SSH connection-t lokálisan:
ssh -i ~/.ssh/vps_deploy_key root@YOUR_VPS_IP
```

### 6.3 VPS Production Problémák

**Problem:** PM2 process crashed

```bash
ssh root@YOUR_VPS_IP

# PM2 status
pm2 status

# Logs megtekintése
pm2 logs ceog-gala --lines 100

# Restart
pm2 restart ceog-gala

# Full restart (újraolvassa .env-t)
pm2 delete ceog-gala
pm2 start npm --name "ceog-gala" -- start
pm2 save
```

**Problem:** Database connection error on VPS

```bash
# Ellenőrizd MySQL fut-e
systemctl status mysql

# Ellenőrizd .env DATABASE_URL-t
cat /var/www/ceog-gala/.env | grep DATABASE_URL

# Teszteld MySQL connection-t
mysql -u ceog_prod_user -p ceog_production
```

**Problem:** Nginx 502 Bad Gateway

```bash
# Ellenőrizd Next.js fut-e
pm2 status

# Ellenőrizd Nginx config
nginx -t

# Nginx logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### 6.4 SSL Certificate Problémák

```bash
# Certbot certificate renewal
certbot renew --dry-run

# Force renew
certbot renew --force-renewal

# Check certificate expiry
certbot certificates
```

---

## 7. Useful Commands Cheatsheet

### Lokális (WSL2)

```bash
# Docker
docker-compose up -d          # Start MySQL
docker-compose down           # Stop (data persists)
docker-compose down -v        # Stop + delete data
docker-compose logs -f mysql  # View logs

# Development
npm run dev                   # Start dev server
npx prisma studio             # DB GUI

# Testing
npx playwright test --ui      # GUI mode
npx playwright test           # Headless
npx playwright codegen        # Record tests

# Database
npx prisma migrate dev        # Create migration
npx prisma migrate reset      # Reset DB
npx prisma db seed            # Seed data
```

### VPS (Production)

```bash
# SSH
ssh root@YOUR_VPS_IP

# PM2
pm2 status                    # List processes
pm2 logs ceog-gala            # View logs
pm2 restart ceog-gala         # Restart app
pm2 monit                     # Monitor CPU/RAM

# MySQL
mysql -u ceog_prod_user -p    # Login to MySQL
systemctl status mysql        # MySQL status

# Nginx
nginx -t                      # Test config
systemctl reload nginx        # Reload config
tail -f /var/log/nginx/error.log  # Error logs

# Git
cd /var/www/ceog-gala
git pull origin main          # Update code
git status                    # Check status
```

---

## 8. Security Checklist

### Production .env File

- [ ] Új `APP_SECRET` generálva (NE UGYANAZ mint lokális!)
- [ ] Új `QR_SECRET` generálva
- [ ] Új `NEXTAUTH_SECRET` generálva
- [ ] Stripe **LIVE** mode keys (pk_live_, sk_live_)
- [ ] Production SMTP credentials
- [ ] `NODE_ENV=production`
- [ ] HTTPS URL-ek mindenhol

### VPS Security

- [ ] MySQL `root` password erős
- [ ] UFW firewall engedélyezve (22, 80, 443)
- [ ] SSH key-based auth (password auth letiltva)
- [ ] Nginx security headers beállítva
- [ ] SSL certificate automatikus renewal
- [ ] Fail2ban telepítve (SSH brute-force védelem)

### GitHub Security

- [ ] Private repository (ha szükséges)
- [ ] `.env` fájlok `.gitignore`-ban
- [ ] GitHub Secrets helyesen beállítva
- [ ] SSH deploy key csak read-only (ahol elég)

---

**Utolsó frissítés:** 2025-11-27
**Verzió:** 1.0
**Karbantartó:** Javo
