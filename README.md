# CEO Gala Registration System 🎫

VIP gála esemény regisztrációs rendszer invitation-only alapon, fizetési integrációval, QR ticketing-gel, és check-in menedzsmenttel.

## 📋 Projekt Áttekintés

**Státusz:** ✅ Production Ready (v2.17.0)
**Tech Stack:** Next.js 14+, Prisma, MySQL 8.0, Playwright, Stripe, Nodemailer
**Fejlesztés:** Minden fázis befejezve (7/7 epic, 38/38 story)
**Deployment:** Hetzner VPS (Ubuntu) + PM2 + Nginx

### Főbb Funkciók

- 🎟️ **Magic Link Regisztráció** - Email-alapú passwordless auth
- 💳 **Stripe Payment Integration** - Kártyás + banki átutalás
- 📱 **QR Ticketing** - JWT-alapú e-jegyek
- ✅ **Mobile Check-in** - QR scanner app staff részére
- 🪑 **Asztalfoglalás** - Drag-and-drop seating map
- 👨‍💼 **Admin Dashboard** - Guest management, reports

## 🚀 Quick Start (Lokális Fejlesztés)

### Előfeltételek

- Node.js 18+
- Docker Desktop (WSL2 backend)
- Git

### 1. Klónozás

```bash
git clone https://github.com/zolijavos/bbje-ceog.git ceog
cd ceog
```

### 2. Dependencies

```bash
npm install
```

### 3. MySQL Database (Docker)

```bash
# Indítás
docker-compose up -d

# Ellenőrzés
docker-compose ps
```

**MySQL kapcsolódási adatok:**
- Host: localhost:3306
- User: ceog_user
- Password: ceog_password
- Database: ceog_dev
- **phpMyAdmin:** http://localhost:8080

### 4. Environment Variables

```bash
# .env.local fájl létrehozása
cp .env.example .env.local

# Secrets generálás
openssl rand -base64 64  # APP_SECRET
openssl rand -base64 64  # QR_SECRET
openssl rand -base64 32  # NEXTAUTH_SECRET
```

Frissítsd `.env.local` fájlt a generált secret-ekkel és Stripe test API key-ekkel.

### 5. Database Setup

```bash
# Prisma client generálás
npx prisma generate

# Migrations futtatása
npx prisma migrate dev

# (Opcionális) Seed tesztadatokkal
npm run db:seed

# (Opcionális) Prisma Studio (DB GUI)
npx prisma studio
```

### 6. Development Server

```bash
npm run dev
```

**Elérhető:** http://localhost:3000

### 7. Testing

```bash
# Playwright browsers telepítése
npx playwright install --with-deps

# E2E tesztek GUI mode-ban
npx playwright test --ui

# Headless mode
npx playwright test
```

## 📁 Projekt Struktúra

```
ceog-gala/
├── .github/
│   └── workflows/
│       ├── playwright-test.yml    # E2E testing CI
│       └── deploy-vps.yml         # VPS deployment
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Auth routes
│   ├── admin/                    # Admin dashboard
│   ├── checkin/                  # Check-in app
│   ├── api/                      # API routes
│   └── components/               # React components
├── lib/                          # Business logic
│   ├── services/                # Service layer
│   ├── db/                      # Prisma client
│   └── utils/                   # Helpers
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Migration history
├── tests/
│   ├── e2e/                     # Playwright E2E tests
│   └── unit/                    # Vitest unit tests
├── scripts/
│   ├── vps-initial-setup.sh     # VPS first-time setup
│   └── deploy-manual.sh         # Manual deployment
├── docs/
│   ├── DEPLOYMENT.md            # Deployment guide
│   ├── FUNKCIONALIS-KOVETELMENY.md  # Functional requirements (HU)
│   ├── research-atdd-testing-2025-11-27.md  # ATDD research
│   └── tech-spec.md             # Technical specification
├── docker-compose.yml            # Local MySQL setup
└── .env.example                  # Environment template
```

## 🧪 Testing Strategy (Hybrid ATDD)

### Playwright E2E Testing

```bash
# GUI mode (lokálisan)
npx playwright test --ui

# Headless mode
npx playwright test

# Specific test
npx playwright test tests/e2e/payment.spec.ts

# Debug mode
npx playwright test --debug
```

### ATDD (Acceptance Test-Driven Development)

**Szelektív használat:**
- ✅ **Fázis 2 (Payment):** ATDD with playwright-bdd (Gherkin syntax)
- ✅ **Fázis 3 (Check-in):** ATDD with playwright-bdd
- ❌ **Fázis 1, 4:** Traditional Playwright E2E

**Példa Gherkin scenario:**

```gherkin
Feature: Stripe Payment Processing

  Scenario: Successful card payment
    Given I am logged in as "john@test.com"
    When I complete Stripe checkout with test card "4242424242424242"
    Then I see "Payment Successful" confirmation
    And I receive ticket email with QR code
```

Részletek: [docs/research-atdd-testing-2025-11-27.md](docs/research-atdd-testing-2025-11-27.md)

## 🚢 Deployment

### GitHub Actions CI/CD (Automatikus)

**Minden push → main branch:**
1. ✅ Playwright E2E tesztek futnak (GitHub Actions runner)
2. ✅ Ha tesztek OK → Automatikus deploy Hostinger VPS-re
3. ✅ PM2 restart production-ben

### Manual Deployment

```bash
# SSH deploy
bash scripts/deploy-manual.sh

# Vagy közvetlenül:
ssh root@YOUR_VPS_IP
cd /var/www/ceog-gala
git pull origin main
npm install
npx prisma migrate deploy
npm run build
pm2 restart ceog-gala
```

**Részletes deployment guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🗄️ Database Schema (Prisma)

**11 fő tábla:**
- `guests` - Vendéglista (email, first_name, last_name, title, kategória, status)
- `registrations` - Regisztrációs adatok (jegytípus, partner info, GDPR)
- `payments` - Stripe fizetések (session_id, összeg, status)
- `checkins` - Check-in log (időbélyeg, staff, override)
- `tables` - Asztal definíciók (név, kapacitás, pozíció)
- `table_assignments` - Asztalfoglalások (guest → table mapping)
- `users` - Admin/staff felhasználók (bcrypt password, role)
- `email_logs` - Email delivery tracking
- `email_templates` - Reusable email templates
- `billing_info` - Számlázási adatok (cég, adószám)
- `scheduled_emails` - Ütemezett email küldések

**Schema megtekintése:**
```bash
npx prisma studio
# Visit: http://localhost:5555
```

## 📚 Dokumentáció

- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Teljes deployment guide (lokális → VPS)
- **[FUNKCIONALIS-KOVETELMENY.md](docs/FUNKCIONALIS-KOVETELMENY.md)** - Funkcionális követelmények (HU, 997 sor)
- **[research-atdd-testing-2025-11-27.md](docs/research-atdd-testing-2025-11-27.md)** - ATDD metodológia kutatás
- **[CLAUDE.md](CLAUDE.md)** - Claude Code AI assistant instrukciók

## 🔧 Befejezett Fejlesztési Fázisok

### ✅ Epic 1: Core Registration
- Magic link authentication
- Admin login & session
- Guest list CRUD operations
- CSV import

### ✅ Epic 2: Payment & Ticketing
- Stripe Checkout integration
- Webhook handling
- QR code generation (JWT)
- Email delivery (tickets)

### ✅ Epic 3: Check-in System
- Mobile QR scanner (html5-qrcode)
- Check-in validation API
- Duplicate prevention
- Admin override

### ✅ Epic 4: Seating Management
- Table CRUD
- Drag-and-drop seating map (React-Konva)
- Bulk CSV assignment
- Seating export

### ✅ Epic 5: Guest Profile Extension
- Extended guest profile (title, phone, company)
- Dietary requirements & seating preferences
- Zod validation schemas

### ✅ Epic 6: PWA Guest App
- Progressive Web App (manifest.json, service worker)
- Code-based authentication
- Offline QR ticket display
- Push notification infrastructure

### ✅ Epic 7: Applicant Flow
- Public application form
- Admin applicant management (approve/reject)
- Magic link expiry handling

## 🛠️ Tech Stack Details

**Frontend:**
- Next.js 14+ (App Router)
- React 18 (Server + Client Components)
- TypeScript 5.5
- Tailwind CSS 3.4
- React-DnD-Kit (drag-and-drop)

**Backend:**
- Next.js API Routes
- Prisma ORM 5.19
- MySQL 8.0+ (Docker lokálisan, natív VPS-en)
- Node.js 18+

**External Services:**
- Stripe SDK (payment processing)
- Nodemailer (email delivery via SMTP)
- html5-qrcode (QR scanning)
- qrcode (QR generation)

**Testing:**
- Playwright 1.44 (E2E)
- playwright-bdd (Gherkin ATDD)
- Vitest 1.6 (unit/integration)

**DevOps:**
- GitHub Actions (CI/CD)
- Docker Compose (lokális MySQL)
- PM2 (process manager VPS-en)
- Nginx (reverse proxy)

## 🤝 Contributing

Ez egy 1 hónap timeline-os projekt AI-assisted fejlesztéssel (BMad Method).

**Development workflow:**
1. Feature branch létrehozása
2. Lokális fejlesztés + Playwright tesztek
3. Pull Request GitHub-on
4. Automatikus E2E tesztek (GitHub Actions)
5. Code review
6. Merge to main → Automatikus VPS deploy

## 📄 License

Proprietary - CEO Gala registration system

---

**Verzió:** 2.17.0 (Production)
**Utolsó frissítés:** 2026-01-22
**Karbantartó:** MyForge Labs

**Telepítési útmutató:** [INSTALL.md](INSTALL.md)
**Support:** [GitHub Issues](https://github.com/zolijavos/bbje-ceog/issues)
