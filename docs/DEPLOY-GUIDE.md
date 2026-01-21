# CEO Gala 2026 - Telepítési Útmutató

Ez az útmutató segít a CEO Gala regisztrációs rendszer telepítésében és frissítésében.

## Tartalomjegyzék

1. [Követelmények](#követelmények)
2. [Első telepítés](#első-telepítés)
3. [Frissítés meglévő rendszeren](#frissítés-meglévő-rendszeren)
4. [Konfigurációs fájlok](#konfigurációs-fájlok)
5. [Adatbázis műveletek](#adatbázis-műveletek)
6. [Hibaelhárítás](#hibaelhárítás)

---

## Követelmények

### Szerver
- **OS**: Ubuntu 22.04+ vagy Debian 11+
- **RAM**: Minimum 2GB
- **Tárhely**: Minimum 10GB SSD
- **Node.js**: 18.x vagy újabb
- **MySQL**: 8.0+

### Szoftverek
```bash
# Node.js telepítése (ha még nincs)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 telepítése (process manager)
sudo npm install -g pm2

# Nginx (webszerver)
sudo apt-get install -y nginx
```

---

## Első telepítés

### 1. Projekt letöltése

```bash
# Mappa létrehozása
sudo mkdir -p /var/www/ceog
sudo chown $USER:$USER /var/www/ceog

# Git clone
cd /var/www
git clone <repository-url> ceog
cd ceog
```

### 2. Függőségek telepítése

```bash
npm install
```

### 3. Környezeti változók beállítása

```bash
cp .env.example .env
nano .env
```

Kötelező változók:
```bash
# Adatbázis
DATABASE_URL="mysql://felhasznalo:jelszo@localhost:3306/ceog_db"

# Alkalmazás titkok (generálj véletlenszerű 64+ karakteres stringeket)
APP_SECRET="<64+ karakter véletlenszerű string>"
QR_SECRET="<64+ karakter véletlenszerű string>"
NEXTAUTH_SECRET="<32+ karakter véletlenszerű string>"
NEXTAUTH_URL="https://your-domain.com"

# Stripe (fizetés)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@ceogala.hu"
SMTP_PASS="<smtp jelszo>"
SMTP_FROM="CEO Gala <noreply@ceogala.hu>"

# Alkalmazás URL
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### 4. Adatbázis inicializálása

```bash
# Prisma client generálása
npx prisma generate

# Adatbázis schema alkalmazása
npx prisma db push

# (Opcionális) Seed adatok
npx prisma db seed
```

### 5. Admin felhasználó létrehozása

```bash
npx tsx scripts/create-admin.ts admin@ceogala.hu JelszoItt123! Admin Felhasznalo
```

### 6. Alkalmazás build

```bash
npm run build
```

### 7. PM2 konfiguráció

```bash
# ecosystem.config.js létrehozása
cp ecosystem.config.example.js ecosystem.config.js
nano ecosystem.config.js
```

PM2 indítása:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Nginx konfiguráció

```bash
sudo nano /etc/nginx/sites-available/ceog
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /_next/static {
        alias /var/www/ceog/.next/static;
        expires 365d;
        access_log off;
    }

    # Email assets
    location /email-assets {
        alias /var/www/ceog/public/email-assets;
        expires 365d;
        access_log off;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ceog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. SSL tanúsítvány (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Frissítés meglévő rendszeren

### Automatikus frissítés (ajánlott)

```bash
cd /var/www/ceog

# Legújabb kód letöltése
git pull origin main

# Függőségek frissítése
npm install

# Prisma client újragenerálása (ha változott a schema)
npx prisma generate

# Adatbázis migrációk alkalmazása (ha vannak)
npx prisma db push

# Build és újraindítás
npm run deploy
```

### Manuális frissítés

```bash
cd /var/www/ceog

git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart ceog
```

---

## Konfigurációs fájlok

### Fontos fájlok
| Fájl | Leírás |
|------|--------|
| `.env` | Környezeti változók (titkok!) |
| `ecosystem.config.js` | PM2 konfiguráció |
| `prisma/schema.prisma` | Adatbázis séma |

### Biztonsági megjegyzések
- **SOHA ne commitold a `.env` fájlt!**
- Az `ecosystem.config.js` is tartalmazhat titkokat - óvatosan kezeld
- A Stripe webhook secret-et gondosan őrizd

---

## Adatbázis műveletek

### Prisma Studio (vizuális DB eszköz)
```bash
npx prisma studio
```
Böngészőben: http://localhost:5555

### Backup készítése
```bash
mysqldump -u user -p ceog_db > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
mysql -u user -p ceog_db < backup_file.sql
```

### Email sablon frissítése adatbázisban

Ha a kódban változott az email sablon, de az adatbázisban van override:

```sql
-- Ellenőrzés
SELECT slug, updated_at FROM EmailTemplate WHERE slug = 'magic_link';

-- Törlés (hogy a kód default-ja érvényesüljön)
DELETE FROM EmailTemplate WHERE slug = 'magic_link';

-- Vagy frissítés
UPDATE EmailTemplate SET html_body = '<új tartalom>' WHERE slug = 'magic_link';
```

---

## Hibaelhárítás

### Alkalmazás nem indul

```bash
# Logok ellenőrzése
pm2 logs ceog --lines 100

# Státusz
pm2 status

# Újraindítás
pm2 restart ceog
```

### "Port already in use" hiba

```bash
# Port foglaltság ellenőrzése
lsof -i :3000

# Process leállítása
pm2 kill
pm2 start ecosystem.config.js
```

### Adatbázis kapcsolat hiba

```bash
# MySQL státusz
sudo systemctl status mysql

# Kapcsolat teszt
mysql -u user -p -e "SELECT 1"

# .env ellenőrzése
cat .env | grep DATABASE_URL
```

### Static fájlok nem töltődnek

```bash
# Ellenőrzés
ls -la .next/static/

# Nginx config teszt
sudo nginx -t

# Nginx újraindítás
sudo systemctl reload nginx
```

### Email nem érkezik

1. Ellenőrizd a `.env` SMTP beállításait
2. Nézd meg a PM2 logokat: `pm2 logs ceog`
3. Ellenőrizd az `EmailLog` táblát az adatbázisban

---

## Hasznos parancsok

```bash
# PM2 műveletek
pm2 status                    # Státusz
pm2 restart ceog             # Újraindítás
pm2 logs ceog                # Logok
pm2 monit                    # Real-time monitor

# Build
npm run build                # Next.js build
npm run deploy               # Build + restart

# Adatbázis
npx prisma studio            # Vizuális DB kezelő
npx prisma generate          # Client újragenerálás
npx prisma db push           # Schema alkalmazás
```

---

## Kapcsolat

Ha problémába ütközöl:
- Technikai támogatás: [Fejlesztő email]
- Dokumentáció: `/var/www/ceog/docs/`

---

*Utolsó frissítés: 2026-01-21*
