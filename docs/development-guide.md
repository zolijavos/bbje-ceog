# Fejlesztési Útmutató - CEO Gala Regisztrációs Rendszer

**Generálva:** 2026-02-15

---

## Előfeltételek

| Követelmény | Verzió | Megjegyzés |
|-------------|--------|------------|
| **Node.js** | >=18.0.0 | LTS ajánlott |
| **npm** | >=9.0.0 | |
| **MySQL** | 8.0+ | Docker-ben vagy natívan |
| **Docker** | Bármely | Opcionális (lokális MySQL-hez) |
| **Git** | Bármely | Verziókezelés |

### Külső Szolgáltatások

- **Stripe fiók** - Fizetés feldolgozáshoz ([dashboard.stripe.com](https://dashboard.stripe.com))
- **SMTP szerver** - Email küldéshez (Gmail, Mailtrap, Hostinger)
- **Domain + SSL** - Production deploymenthez

## Környezet Beállítás

### 1. Forráskód

```bash
git clone https://github.com/zolijavos/bbje-ceog.git ceog
cd ceog
npm install
```

### 2. Adatbázis (Docker)

```bash
# MySQL + phpMyAdmin indítás
docker-compose up -d

# Ellenőrzés
docker-compose ps
```

**Kapcsolati adatok:**
- Host: `localhost:3306`
- User: `ceog_user`
- Password: `ceog_password`
- Database: `ceog_dev`
- phpMyAdmin: `http://localhost:8080`

### 3. Környezeti Változók

```bash
# .env fájl létrehozása
cp .env.example .env

# Titkos kulcsok generálása
openssl rand -hex 64  # APP_SECRET
openssl rand -hex 64  # QR_SECRET
openssl rand -hex 32  # NEXTAUTH_SECRET
```

**Kötelező változók:**

| Változó | Leírás | Példa |
|---------|--------|-------|
| `DATABASE_URL` | MySQL connection string | mysql://ceog_user:ceog_password@localhost:3306/ceog_dev |
| `APP_SECRET` | Magic link titkosítás (64 char) | (generált) |
| `QR_SECRET` | QR JWT titkosítás (64 char) | (generált) |
| `NEXTAUTH_URL` | Alkalmazás URL | http://localhost:3000 |
| `NEXTAUTH_SECRET` | Session titkosítás (32 char) | (generált) |
| `STRIPE_SECRET_KEY` | Stripe test API kulcs | sk_test_... |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | pk_test_... |
| `STRIPE_WEBHOOK_SECRET` | Webhook validáció | whsec_... |
| `SMTP_HOST` | SMTP szerver | sandbox.smtp.mailtrap.io |
| `SMTP_PORT` | SMTP port | 2525 |
| `SMTP_USER` | SMTP felhasználó | (provider-specifikus) |
| `SMTP_PASS` | SMTP jelszó | (provider-specifikus) |
| `SMTP_FROM` | Feladó email | noreply@ceogala.test |
| `APP_URL` | Publikus URL | http://localhost:3000 |

### 4. Adatbázis Migrálás

```bash
# Prisma client generálás
npx prisma generate

# Migrációk futtatása
npx prisma migrate dev

# (Opcionális) Tesztadatok betöltése
npm run db:seed
# VAGY
node scripts/seed-production.js

# (Opcionális) DB GUI megnyitása
npx prisma studio  # → http://localhost:5555
```

### 5. Fejlesztői Szerver

```bash
npm run dev
# → http://localhost:3000
```

**Teszt felhasználók (seed után):**
- Admin: `admin@ceogala.test` / `Admin123!`
- Staff: `staff@ceogala.test` / `Staff123!`

## Fejlesztési Parancsok

### Általános

| Parancs | Leírás |
|---------|--------|
| `npm run dev` | Fejlesztői szerver (hot reload) |
| `npm run build` | Production build |
| `npm start` | Production szerver indítás |
| `npm run lint` | ESLint kód ellenőrzés |
| `npm run type-check` | TypeScript típus ellenőrzés |

### Adatbázis

| Parancs | Leírás |
|---------|--------|
| `npx prisma generate` | Prisma Client újragenerálás |
| `npx prisma migrate dev` | Új migráció + alkalmazás |
| `npx prisma migrate deploy` | Production migráció (alkalmazás) |
| `npx prisma db push` | Schema push (dev, migráció nélkül) |
| `npx prisma db seed` | Seed futtatás |
| `npx prisma migrate reset` | DB reset + újra migráció (DEV ONLY) |
| `npx prisma studio` | Adatbázis GUI böngésző |

### Tesztelés

| Parancs | Leírás |
|---------|--------|
| `npm run test` | Vitest összes teszt |
| `npm run test:unit` | Csak unit tesztek |
| `npm run test:watch` | Vitest watch módban |
| `npm run test:e2e` | Playwright E2E (headless) |
| `npm run test:e2e:ui` | Playwright interaktív UI |
| `npm run test:e2e:debug` | Playwright debug mód |
| `npm run test:e2e:headed` | Playwright böngészővel |

### Deployment

| Parancs | Leírás |
|---------|--------|
| `npm run deploy` | Build + PM2 restart |
| `npm run build` | Next.js standalone build |
| `pm2 status` | Alkalmazás státusz |
| `pm2 restart ceog` | Újraindítás |
| `pm2 logs ceog` | Logok megtekintése |

## Kód Konvenciók

### Fájl Struktúra Szabályok

- **Oldalak:** `app/[route]/page.tsx` - Server Component (alapértelmezett)
- **Interaktív komponensek:** `'use client'` direktíva a fájl elején
- **API endpoints:** `app/api/[route]/route.ts` - Named export (GET, POST, PATCH, DELETE)
- **Üzleti logika:** `lib/services/[service-name].ts`
- **Validáció:** `lib/validations/[schema-name].ts` (Zod)
- **Fordítások:** `lib/i18n/translations.ts`

### Nyelvi Konvenciók

- **Kommunikáció felhasználóval:** Magyar
- **Dokumentáció:** Magyar
- **Kód és kommentek:** Angol
- **Commit üzenetek:** Angol (ajánlott)

### Stílus

- **Tailwind CSS** utility osztályok
- **tailwind-merge** + **clsx** feltételes osztályokhoz
- **Mobile-first** responsive design
- **Phosphor Icons** ikonokhoz
- **44x44px** minimum érintési terület mobilon

### TypeScript

- `strict: false` (tsconfig.json)
- Path alias: `@/*` → gyökér könyvtár
- Zod sémák runtime validáláshoz

## Gyakori Fejlesztési Feladatok

### Új API Endpoint Hozzáadása

```
1. Hozd létre: app/api/[route]/route.ts
2. Definiáld a HTTP metódus függvényt (GET, POST, stb.)
3. Ha admin auth kell, a middleware automatikusan kezeli
4. Zod validáció a request body-ra
5. Prisma query az adatbázishoz
6. NextResponse.json() válasz
```

### Új Admin Oldal Hozzáadása

```
1. Hozd létre: app/admin/[section]/page.tsx (Server Component)
2. Client Component: app/admin/[section]/[Component].tsx ('use client')
3. Fordítási kulcsok: lib/i18n/translations.ts
4. Navigáció frissítés: AdminHeader.tsx + MobileTabBar.tsx
```

### Új Vendég Flow Hozzáadása

```
1. Oldal: app/register/[flow]/page.tsx
2. Form Component: app/register/[flow]/[Form].tsx ('use client')
3. API endpoint: app/api/registration/[action]/route.ts
4. Service logika: lib/services/registration.ts
5. Validáció: lib/validations/[schema].ts
```

## Deployment (Production)

### VPS Telepítés (Első alkalommal)

```bash
# 1. Rendszer komponensek
sudo bash deploy/install.sh

# 2. MySQL beállítás
sudo bash deploy/setup-database.sh

# 3. Konfiguráció (.env)
sudo bash deploy/configure.sh

# 4. Build + indítás
sudo bash deploy/start.sh

# 5. Nginx + SSL
sudo bash deploy/setup-nginx.sh
sudo bash deploy/setup-ssl.sh
```

### Frissítés

```bash
# Automatikus (ajánlott)
sudo bash deploy/update.sh

# VAGY manuális
ssh root@VPS_IP
cd /var/www/ceog
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart ceog
```

### Adatbázis Mentés

```bash
sudo bash deploy/backup.sh
# VAGY
sudo bash scripts/backup-db.sh
```

## Hibakeresés

### Gyakori Problémák

| Probléma | Megoldás |
|----------|---------|
| `PrismaClientInitializationError` | Ellenőrizd `DATABASE_URL` és MySQL futását |
| `CSRF validation failed` | Frontend CSRF header hiányzik, ellenőrizd middleware.ts |
| Stripe webhook hiba | Ellenőrizd `STRIPE_WEBHOOK_SECRET` és signature-t |
| Magic link lejárt | 24 óra limit, új link küldése szükséges |
| Email nem megy ki | SMTP beállítások ellenőrzése, rate limit check |

### Logok

```bash
# PM2 logok (production)
pm2 logs ceog --lines 100

# Next.js dev logok
# A terminálban láthatók `npm run dev` futtatásakor

# Prisma debug
# DATABASE_URL env-ben: ?connection_limit=5&pool_timeout=10
```
