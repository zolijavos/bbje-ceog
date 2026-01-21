# CEO Gala - Telepítési Útmutató

Ez a dokumentum részletesen bemutatja a CEO Gala esemény regisztrációs rendszer telepítését egy tiszta Ubuntu szerverre.

## Tartalomjegyzék

1. [Rendszerkövetelmények](#rendszerkövetelmények)
2. [Gyors telepítés (automatizált)](#gyors-telepítés-automatizált)
3. [Manuális telepítés](#manuális-telepítés)
4. [Konfigurációs változók](#konfigurációs-változók)
5. [Stripe beállítása](#stripe-beállítása)
6. [Email (SMTP) beállítása](#email-smtp-beállítása)
7. [DNS és SSL](#dns-és-ssl)
8. [Első bejelentkezés](#első-bejelentkezés)
9. [Frissítés és karbantartás](#frissítés-és-karbantartás)
10. [Hibaelhárítás](#hibaelhárítás)

---

## Rendszerkövetelmények

### Szerver
- **OS**: Ubuntu 22.04 LTS vagy újabb
- **CPU**: Minimum 1 vCPU (ajánlott: 2 vCPU)
- **RAM**: Minimum 2 GB (ajánlott: 4 GB)
- **Tárhely**: Minimum 20 GB SSD
- **Hálózat**: Nyitott portok: 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Szoftverkövetelmények
- Node.js 18 LTS vagy újabb
- MySQL 8.0 vagy MariaDB 10.6+
- Nginx (reverse proxy)
- PM2 (process manager)
- Certbot (SSL tanúsítvány)

### Külső szolgáltatások
- **Stripe fiók** - fizetés feldolgozáshoz
- **SMTP szerver** - email küldéshez (Gmail, Hostinger, Mailgun, stb.)
- **Domain név** - saját domain a rendszerhez

---

## Gyors telepítés (automatizált)

A legegyszerűbb módja a telepítésnek az automatizált szkriptek használata.

### 1. Forráskód letöltése

```bash
cd /var/www
git clone https://github.com/zolijavos/bbje-ceog.git ceog
cd ceog
```

### 2. Rendszer telepítése

```bash
sudo bash deploy/install.sh
```

Ez telepíti:
- Node.js 18
- MySQL 8.0
- PM2
- Nginx
- Certbot

### 3. Adatbázis létrehozása

```bash
sudo bash deploy/setup-database.sh
```

Interaktívan bekéri:
- Adatbázis név
- Felhasználó
- Jelszó (generálható automatikusan)

### 4. Alkalmazás konfigurálása

```bash
sudo bash deploy/configure.sh
```

Interaktívan bekéri az összes szükséges beállítást és létrehozza a `.env` fájlt.

### 5. PM2 konfiguráció

```bash
cp deploy/ecosystem.config.example.js ecosystem.config.js
```

Ha más útvonalra telepítettél (nem `/var/www/ceog`), szerkeszd a `cwd` értékét az `ecosystem.config.js` fájlban.

### 6. Alkalmazás indítása

```bash
sudo bash deploy/start.sh
```

Ez:
- Telepíti a függőségeket
- Futtatja a migrációkat
- Buildeli az alkalmazást
- Elindítja PM2-vel

### 7. Nginx beállítása

```bash
sudo bash deploy/setup-nginx.sh
```

### 8. SSL tanúsítvány

```bash
sudo bash deploy/setup-ssl.sh
```

---

## Manuális telepítés

Ha részletesebb kontrollt szeretnél, követheted a manuális lépéseket.

### 1. Rendszer frissítése

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Node.js 18 telepítése

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # v18.x.x
```

### 3. MySQL telepítése

```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

### 4. Adatbázis létrehozása

```bash
sudo mysql
```

```sql
CREATE DATABASE ceog_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ceog_user'@'localhost' IDENTIFIED BY 'ERŐS_JELSZÓ';
GRANT ALL PRIVILEGES ON ceog_production.* TO 'ceog_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. PM2 telepítése

```bash
sudo npm install -g pm2
```

### 6. Projekt letöltése

```bash
cd /var/www
git clone https://github.com/zolijavos/bbje-ceog.git ceog
cd ceog
```

### 7. Környezeti változók beállítása

```bash
cp deploy/.env.production.example .env
nano .env
```

Töltsd ki az összes változót (lásd: [Konfigurációs változók](#konfigurációs-változók))

### 8. Függőségek és build

```bash
npm install --omit=dev
npx prisma generate
npx prisma migrate deploy
npm run build
```

### 9. PM2 indítása

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Konfigurációs változók

A `.env` fájlban az alábbi változókat kell beállítani:

### Adatbázis

| Változó | Leírás | Példa |
|---------|--------|-------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/ceog` |

### Alkalmazás

| Változó | Leírás | Példa |
|---------|--------|-------|
| `NODE_ENV` | Környezet | `production` |
| `APP_URL` | Alkalmazás URL | `https://ceogala.hu` |
| `APP_SECRET` | Magic link titkosítás (64 kar.) | `openssl rand -hex 64` |
| `QR_SECRET` | QR kód JWT titkosítás (64 kar.) | `openssl rand -hex 64` |
| `MAGIC_LINK_EXPIRY_HOURS` | Link lejárati idő | `24` |
| `SHOW_TABLE_NUMBERS` | Asztalszámok láthatósága | `true` |

### NextAuth (Admin bejelentkezés)

| Változó | Leírás | Példa |
|---------|--------|-------|
| `NEXTAUTH_URL` | Alkalmazás URL | `https://ceogala.hu` |
| `NEXTAUTH_SECRET` | Session titkosítás (64 kar.) | `openssl rand -hex 64` |

### Stripe (Fizetés)

| Változó | Leírás | Hol található |
|---------|--------|---------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key | Stripe Dashboard → API keys |
| `STRIPE_SECRET_KEY` | Secret key | Stripe Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Webhooks |

### Email (SMTP)

| Változó | Leírás | Példa |
|---------|--------|-------|
| `SMTP_HOST` | SMTP szerver | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Felhasználó | `noreply@ceogala.hu` |
| `SMTP_PASS` | Jelszó | `app_specific_password` |
| `SMTP_FROM` | Feladó email | `noreply@ceogala.hu` |

### Titkos kulcsok generálása

```bash
# APP_SECRET, QR_SECRET és NEXTAUTH_SECRET (mind 64 karakter)
openssl rand -hex 64
```

---

## Stripe beállítása

### 1. Stripe fiók létrehozása

1. Regisztrálj: https://dashboard.stripe.com/register
2. Aktiváld az éles módot (szükséges cégadatok megadása)

### 2. API kulcsok

1. Stripe Dashboard → Developers → API keys
2. Másold ki a **Live mode** kulcsokat:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

### 3. Webhook beállítása

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint:
   - URL: `https://TE_DOMAIN/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Másold ki a Signing secret: `whsec_...`

### 4. Termékek létrehozása (opcionális)

Ha fix árakkal dolgozol, hozd létre a termékeket a Stripe Dashboard-on.

---

## Email (SMTP) beállítása

### Gmail használata

1. Google Fiók → Biztonság → 2FA bekapcsolása
2. App jelszó generálása: https://myaccount.google.com/apppasswords
3. Beállítások:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=te_email@gmail.com
   SMTP_PASS=xxxx_xxxx_xxxx_xxxx  # App jelszó
   ```

### Hostinger Email

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@tedomained.hu
SMTP_PASS=email_jelszó
```

### Email tesztelése

Az adminisztrátor felületről tesztelheted az email küldést, vagy közvetlenül:

```bash
cd /var/www/ceog
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: 'teszt@email.hu',
  subject: 'Teszt',
  text: 'Ez egy teszt email'
}).then(console.log).catch(console.error);
"
```

---

## DNS és SSL

### DNS beállítása

A domain szolgáltatódnál állítsd be az A rekordot:

| Típus | Név | Érték |
|-------|-----|-------|
| A | @ | SZERVER_IP |
| A | www | SZERVER_IP |

vagy CNAME:

| Típus | Név | Érték |
|-------|-----|-------|
| A | @ | SZERVER_IP |
| CNAME | www | ceogala.hu |

### SSL tanúsítvány (Let's Encrypt)

```bash
sudo bash deploy/setup-ssl.sh
```

Vagy manuálisan:

```bash
sudo certbot --nginx -d ceogala.hu -d www.ceogala.hu
```

A tanúsítvány automatikusan megújul (certbot timer).

---

## Első bejelentkezés

### Admin felhasználó létrehozása

Az első alkalmazás indítás után hozz létre egy admin felhasználót az interaktív szkripttel:

```bash
cd /var/www/ceog
node scripts/create-admin.js
```

A szkript interaktívan bekéri:
- Email cím
- Jelszó (minimum 8 karakter)
- Név (opcionális)

Példa:
```
Admin email: admin@ceogala.hu
Password (min 8 chars): TitkosJelszo123
Name (optional): Gála Admin

Admin user created successfully!
  Email: admin@ceogala.hu
  Role:  admin
```

### Belépés

Az admin felületet a `/admin/login` URL-en éred el:

```
https://DOMAIN/admin/login
```

---

## Frissítés és karbantartás

### Automatikus frissítés (ajánlott)

A legegyszerűbb módszer az automatizált deploy szkript használata:

```bash
cd /var/www/ceog
sudo bash deploy/deploy.sh [branch]
```

Például a `feature/first-last-name` branch telepítéséhez:

```bash
sudo bash deploy/deploy.sh feature/first-last-name
```

**Mit csinál a szkript automatikusan:**
1. ✅ Pre-flight ellenőrzések (Node.js, PM2, fájlok)
2. ✅ Adatbázis backup készítése
3. ✅ Git pull a megadott branch-ről
4. ✅ Függőségek telepítése
5. ✅ Prisma client generálása
6. ✅ Adatbázis migráció
7. ✅ Production build
8. ✅ PM2 újraindítás
9. ✅ Health check ellenőrzés
10. ✅ Régi backupok törlése (utolsó 5 megtartása)

**Környezeti változók (opcionális):**
```bash
INSTALL_PATH=/var/www/ceog           # Telepítési útvonal
PM2_APP_NAME=ceog                    # PM2 alkalmazás neve
HEALTH_CHECK_URL=http://localhost:3000/api/health  # Health check URL
```

### Health Check Endpoint

A `/api/health` endpoint segítségével ellenőrizheted az alkalmazás állapotát:

```bash
curl http://localhost:3000/api/health
```

Válasz:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2026-01-21T18:47:32.225Z",
  "checks": {
    "database": { "status": "ok", "latency": 16 },
    "environment": { "status": "ok" }
  }
}
```

Státuszok: `healthy` | `degraded` | `unhealthy`

### Manuális frissítés (legacy)

```bash
sudo bash deploy/update.sh
```

Vagy kézzel:

```bash
cd /var/www/ceog
git pull origin main
npm install --omit=dev
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart ceog
```

### Adatbázis backup

Automatikus backup az `deploy/deploy.sh` futtatásakor.

Manuális backup:
```bash
sudo bash deploy/backup.sh
```

A backupok itt találhatók: `/var/www/backups/`

### Logok megtekintése

```bash
# PM2 logok
pm2 logs ceog

# Nginx logok
tail -f /var/log/nginx/ceog_access.log
tail -f /var/log/nginx/ceog_error.log
```

### PM2 parancsok

```bash
pm2 status        # Állapot
pm2 restart ceog  # Újraindítás
pm2 stop ceog     # Leállítás
pm2 logs ceog     # Logok
pm2 monit         # Monitoring
```

---

## Hibaelhárítás

### Az alkalmazás nem indul

1. Ellenőrizd a logokat:
   ```bash
   pm2 logs ceog --lines 100
   ```

2. Ellenőrizd a .env fájlt:
   ```bash
   cat /var/www/ceog/.env
   ```

3. Ellenőrizd az adatbázis kapcsolatot:
   ```bash
   mysql -u ceog_user -p ceog_production -e "SELECT 1"
   ```

### 502 Bad Gateway

1. Ellenőrizd, hogy az app fut-e:
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. Ellenőrizd az Nginx konfigurációt:
   ```bash
   nginx -t
   ```

### Email nem megy ki

1. Ellenőrizd az SMTP beállításokat
2. Nézd meg a logokat: `pm2 logs ceog | grep -i email`
3. Gmail esetén: App jelszó kell, nem a normál jelszó

### Stripe webhook nem működik

1. Ellenőrizd a webhook URL-t a Stripe Dashboard-on
2. Ellenőrizd a `STRIPE_WEBHOOK_SECRET` értékét
3. Nézd meg a Stripe webhook eseményeket: Dashboard → Webhooks → Events

### SSL tanúsítvány probléma

```bash
# Tanúsítvány állapota
certbot certificates

# Manuális megújítás
certbot renew

# Nginx újraindítás
systemctl reload nginx
```

---

## Támogatás

Ha problémába ütközöl:

1. Ellenőrizd a logokat
2. Nézd át ezt a dokumentációt
3. GitHub Issues: https://github.com/zolijavos/bbje-ceog/issues
