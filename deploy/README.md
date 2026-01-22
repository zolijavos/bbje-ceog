# CEO Gala - Esemény Regisztrációs Rendszer

Komplett webes SaaS platform VIP események kezelésére: regisztráció, fizetés feldolgozás, QR jegykezelés, check-in és ültetési rend menedzsment.

## Funkciók

- **Vendég regisztráció** - Magic link alapú meghívók, VIP és fizető vendégek kezelése
- **Fizetés feldolgozás** - Stripe integráció (kártya + átutalás)
- **QR jegyek** - Automatikus generálás és email küldés
- **Check-in rendszer** - Mobil QR szkenner személyzet számára
- **Ültetési rend** - Drag-and-drop asztalkezelés
- **Admin felület** - Teljes körű vendég és esemény menedzsment
- **PWA alkalmazás** - Vendégeknek mobil app (jegy, asztal info)
- **Többnyelvűség** - Magyar és angol felület

## Rendszerkövetelmények

- **Szerver**: Ubuntu 22.04 LTS vagy újabb
- **RAM**: Minimum 2 GB (ajánlott: 4 GB)
- **Tárhely**: Minimum 20 GB SSD
- **Node.js**: 18 LTS vagy újabb
- **MySQL**: 8.0 vagy MariaDB 10.6+

### Külső szolgáltatások

- [Stripe](https://stripe.com) fiók - fizetés feldolgozáshoz
- SMTP szerver - email küldéshez (Gmail, Hostinger, stb.)
- Domain név + SSL tanúsítvány

## Gyors telepítés

### 1. Forráskód letöltése

```bash
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

### 4. Konfiguráció

```bash
sudo bash deploy/configure.sh
```

### 5. Alkalmazás indítása

```bash
sudo bash deploy/start.sh
```

### 6. Nginx és SSL

```bash
sudo bash deploy/setup-nginx.sh
sudo bash deploy/setup-ssl.sh
```

## Telepítési szkriptek

| Szkript | Leírás |
|---------|--------|
| `deploy/install.sh` | Rendszer komponensek telepítése |
| `deploy/setup-database.sh` | MySQL adatbázis létrehozása |
| `deploy/configure.sh` | Interaktív konfiguráció (.env) |
| `deploy/start.sh` | Alkalmazás buildelése és indítása |
| `deploy/setup-nginx.sh` | Nginx reverse proxy |
| `deploy/setup-ssl.sh` | Let's Encrypt SSL |
| `deploy/update.sh` | Alkalmazás frissítése |
| `deploy/backup.sh` | Adatbázis mentés |

## Konfiguráció

A `.env` fájlban beállítandó változók:

### Kötelező

| Változó | Leírás |
|---------|--------|
| `DATABASE_URL` | MySQL connection string |
| `APP_URL` | Alkalmazás URL (https://domain.hu) |
| `APP_SECRET` | Magic link titkosítás (64 kar.) |
| `QR_SECRET` | QR kód JWT titkosítás (64 kar.) |
| `NEXTAUTH_SECRET` | Admin session titkosítás (32 kar.) |
| `STRIPE_*` | Stripe API kulcsok |
| `SMTP_*` | Email szerver beállítások |

Részletes leírás: [INSTALL.md](INSTALL.md)

### Titkos kulcsok generálása

```bash
# APP_SECRET és QR_SECRET (64 karakter)
openssl rand -hex 64

# NEXTAUTH_SECRET (32 karakter)
openssl rand -hex 32
```

## Hasznos parancsok

```bash
# Alkalmazás állapota
pm2 status

# Logok megtekintése
pm2 logs ceog

# Újraindítás
pm2 restart ceog

# Adatbázis backup
sudo bash deploy/backup.sh

# Frissítés
sudo bash deploy/update.sh
```

## Technológiai stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Adatbázis**: MySQL 8.0
- **Fizetés**: Stripe
- **Email**: Nodemailer (SMTP)
- **QR kód**: qrcode + jsonwebtoken
- **Ültetési rend**: React-Konva (drag-and-drop)

## Támogatás

Ha problémába ütközöl, nézd át az [INSTALL.md](INSTALL.md) dokumentációt.

---

**Verzió**: 2.17.0
**Licenc**: Proprietary
**Karbantartó**: MyForge Labs
