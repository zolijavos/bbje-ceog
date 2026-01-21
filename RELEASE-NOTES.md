# CEO Gala 2026 - Release Notes

## Verzió: 2.13.0 (2026-01-21)

### Főbb változások

#### 1. Egyszerűsített telepítés
A telepítési folyamat jelentősen egyszerűsödött:

- **Automatikus konfiguráció** - A `deploy/configure.sh` script automatikusan felismeri a telepítési útvonalat
- **Gyors teszt mód** - Új `deploy/quick-setup.sh` script gyors, nem-interaktív telepítéshez
- **Javított dokumentáció** - Frissített INSTALL.md és QUICKSTART.md

#### 2. Opcionális külső szolgáltatások
Az alkalmazás most már **elindul és működik** külső szolgáltatások nélkül is:

| Szolgáltatás | Státusz | Következmény ha nincs |
|--------------|---------|----------------------|
| **SMTP (Email)** | Opcionális | Magic linkek, jegyek nem küldhetők |
| **Stripe (Fizetés)** | Opcionális | Kártyás fizetés nem elérhető |

Az app induláskor **warning**-ot ír, de nem áll le:
```
⚠️  Stripe not fully configured - payment functionality will be disabled
⚠️  SMTP not fully configured - email functionality will be disabled
✅ Environment variables validated successfully
```

#### 3. UI/UX javítások
- Sötét téma arany akcentusokkal minden regisztrációs oldalon
- Frissített footer dizájn
- Vendég titulus megjelenítése az üdvözlő oldalon

---

### Telepítési útmutató

#### Gyors telepítés (teszt)
```bash
git clone git@github.com:zolijavos/bbje-ceog.git /var/www/ceog
cd /var/www/ceog
npm install
bash deploy/quick-setup.sh --db-url "mysql://user:pass@localhost:3306/ceog"
npx prisma db push
npm run build
pm2 start ecosystem.config.js
```

#### Production telepítés
```bash
bash deploy/configure.sh  # Interaktív konfiguráció
bash deploy/start.sh      # Build + indítás
```

---

### Konfiguráció

#### Kötelező környezeti változók
```env
DATABASE_URL="mysql://..."
APP_SECRET="min. 64 karakter"
QR_SECRET="min. 64 karakter"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="min. 64 karakter"
```

#### Opcionális (később konfigurálható)
```env
# Stripe - fizetéshez
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# SMTP - email küldéshez
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@..."
SMTP_PASS="..."
```

---

### Commit történet

| Commit | Leírás |
|--------|--------|
| `6e8a0c5` | Stripe lazy initialization |
| `a721dc2` | Stripe konfiguráció opcionális |
| `00ae791` | Deploy scriptek javítása |
| `8c6d4d6` | SMTP opcionális |
| `1578560` | firstName/lastName merge |

---

### Támogatás

- **Dokumentáció**: `/docs/INSTALL.md`, `/docs/QUICKSTART.md`
- **Email**: Javorkás Zoltán (fejlesztő)
- **Tesztelés**: Health check endpoint: `GET /api/health`

---

*Generálva: 2026-01-21*
