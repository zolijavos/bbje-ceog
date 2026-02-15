# CEO Gála - Kliens Telepítési Checklist

## 1. Klienstől szükséges információk

### Szerver hozzáférés
- [ ] **Szerver IP cím**: _______________
- [ ] **SSH port**: _______________ (alapértelmezett: 22)
- [ ] **SSH felhasználó**: _______________ (root/ubuntu/egyéb)
- [ ] **SSH autentikáció**:
  - [ ] Jelszó: _______________
  - [ ] SSH kulcs (publikus kulcs küldése a kliensnek)

### Domain & SSL
- [ ] **Domain név**: _______________ (pl. ceogala.client.hu)
- [ ] **SSL tanúsítvány**:
  - [ ] Let's Encrypt (mi állítjuk be)
  - [ ] Kliens biztosítja a cert fájlokat

### Adatbázis
- [ ] **Adatbázis típus**: MySQL 8.0+ / PostgreSQL 14+
- [ ] **DB host**: _______________ (localhost / külső)
- [ ] **DB név**: _______________
- [ ] **DB felhasználó**: _______________
- [ ] **DB jelszó**: _______________

### Stripe fizetés
- [ ] **Stripe fiók**: Kliens saját fiókja
- [ ] **Publishable Key** (pk_live_...): _______________
- [ ] **Secret Key** (sk_live_...): _______________
- [ ] **Webhook Secret** (whsec_...): _______________ (telepítés után generáljuk)

### Email (SMTP)
- [ ] **SMTP host**: _______________ (pl. smtp.gmail.com)
- [ ] **SMTP port**: _______________ (587/465/25)
- [ ] **SMTP felhasználó**: _______________
- [ ] **SMTP jelszó**: _______________
- [ ] **Feladó email**: _______________ (pl. noreply@client.hu)
- [ ] **Feladó név**: _______________ (pl. "CEO Gála 2026")

### Egyéb beállítások
- [ ] **Admin email**: _______________ (első admin felhasználó)
- [ ] **Admin jelszó**: _______________ (erős jelszó!)
- [ ] **Esemény dátuma**: _______________ (QR kód lejárathoz)

---

## 2. Szerver előkészítés (mi végezzük)

### Szükséges szoftverek
```bash
# Node.js 18+ telepítése
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 telepítése
sudo npm install -g pm2

# Nginx telepítése
sudo apt-get install -y nginx

# MySQL telepítése (ha nincs)
sudo apt-get install -y mysql-server
```

### Könyvtár létrehozása
```bash
sudo mkdir -p /var/www/ceog
sudo chown $USER:$USER /var/www/ceog
```

---

## 3. Alkalmazás telepítése

### Klónozás GitHub-ról
```bash
cd /var/www/ceog
git clone git@github.com:zolijavos/bbje-ceog.git .
```

### Környezeti változók (.env)
```bash
cp .env.example .env
nano .env
```

**.env tartalma:**
```env
# Adatbázis
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"

# App titkos kulcsok (generálni: openssl rand -hex 32)
APP_SECRET="64_karakter_random_string"
QR_SECRET="64_karakter_random_string"
NEXTAUTH_SECRET="32_karakter_random_string"

# URL
NEXTAUTH_URL="https://DOMAIN"
NEXT_PUBLIC_BASE_URL="https://DOMAIN"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user@example.com"
SMTP_PASS="password"
EMAIL_FROM="noreply@example.com"
EMAIL_FROM_NAME="CEO Gála 2026"
```

### Függőségek telepítése
```bash
npm install
```

### Adatbázis inicializálás
```bash
npx prisma generate
npx prisma migrate deploy
```

### Admin felhasználó létrehozása
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const hash = await bcrypt.hash('ADMIN_JELSZO', 12);
  await prisma.user.upsert({
    where: { email: 'ADMIN_EMAIL' },
    update: { password_hash: hash },
    create: {
      email: 'ADMIN_EMAIL',
      password_hash: hash,
      role: 'admin'
    }
  });
  console.log('Admin létrehozva!');
}
createAdmin();
"
```

### Build
```bash
npm run build
```

---

## 4. PM2 beállítása

### Alkalmazás indítása
```bash
pm2 start npm --name "ceog" -- start
pm2 save
pm2 startup
```

---

## 5. Nginx konfiguráció

### Config fájl létrehozása
```bash
sudo nano /etc/nginx/sites-available/ceog
```

**Tartalom:**
```nginx
server {
    listen 80;
    server_name DOMAIN;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name DOMAIN;

    ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;

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
    }

    location /_next/static/ {
        alias /var/www/ceog/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL tanúsítvány (Let's Encrypt)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d DOMAIN
```

### Nginx engedélyezése
```bash
sudo ln -s /etc/nginx/sites-available/ceog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Stripe Webhook beállítása

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://DOMAIN/api/stripe/webhook`
3. Events kiválasztása:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Webhook Secret másolása → `.env` `STRIPE_WEBHOOK_SECRET`

---

## 7. Tesztelés

### Ellenőrzőlista
- [ ] Oldal elérhető HTTPS-en
- [ ] Admin bejelentkezés működik
- [ ] Vendég import működik (CSV)
- [ ] Magic link email megérkezik
- [ ] Regisztráció működik
- [ ] Stripe fizetés működik (teszt módban először!)
- [ ] QR kód generálás működik
- [ ] Check-in működik

### Teszt parancsok
```bash
# Alkalmazás státusz
pm2 status

# Logok ellenőrzése
pm2 logs ceog --lines 50

# Nginx státusz
sudo systemctl status nginx
```

---

## 8. Karbantartás

### Frissítés
```bash
cd /var/www/ceog
git pull origin main
npm install
npm run build
pm2 restart ceog
```

### Backup
```bash
# Adatbázis backup
mysqldump -u USER -p DATABASE > backup_$(date +%Y%m%d).sql
```

---

## Kapcsolat

Problémák esetén: **[kapcsolattartó email]**
