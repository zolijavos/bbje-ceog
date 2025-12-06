# CEO Gala registration - v2 - Technical Specification

**Author:** Javo!
**Date:** 2025-11-27
**Project Level:** Simple (Quick Flow Track)
**Change Type:** Greenfield - Új rendszer fejlesztés
**Development Context:** Greenfield - Next.js 14+ full-stack application

---

## Context

### Available Documents

A következő dokumentumok állnak rendelkezésre és be lettek töltve:

1. **Technikai Kutatás** (`docs/research-technical-2025-11-27.md` - 1,613 sor)
   - React drag-and-drop library összehasonlítás (dnd-kit, React-Konva, hybrid megoldás)
   - **Fő ajánlás**: @dnd-kit/core használata a seating map implementációhoz
   - dnd-kit jellemzők: DOM-alapú, 4.5M heti letöltés, kiváló TypeScript támogatás
   - Implementációs időbecslés: 5-7 nap a seating map-ra
   - ORM összehasonlítás: Prisma vs Drizzle (mindkét opció életképes)
   - QR code scanner: html5-qrcode ajánlott (2M+ heti letöltés), 2-3 nap implementáció

2. **Projekt Kontextus** (`CLAUDE.md` - 363 sor)
   - Teljes funkcionális követelmény dokumentáció hivatkozás
   - Next.js 14+ App Router architecture
   - 11 táblás adatbázis séma (guests, registrations, payments, checkins, tables, table_assignments, users, email_logs, billing_info, email_templates, rate_limit_entries)
   - Komplett API endpoint specifikáció
   - Security követelmények (magic link, bcrypt, JWT tokens)
   - 4 fejlesztési fázis terv (MVP registration → Payment & Ticketing → Check-in → Seating)

3. **Funkcionális Követelmény** (hivatkozott: `docs/FUNKCIONALIS-KOVETELMENY.md` - 997 sor, Hungarian)
   - **Forrás igazság** minden funkcionális követelményhez
   - Részletes API specifikációk
   - Adatbázis séma definíciók (MySQL/PostgreSQL)
   - Email template tartalmak
   - Validációs szabályok
   - Teljesítmény követelmények

**Státusz**: ✅ PRODUCTION READY - 7 epic, 38 story DONE. Részletes státusz: [sprint-status.yaml](sprint-artifacts/sprint-status.yaml)

### Project Stack

**Framework & Runtime:**
- **Next.js 14+** App Router - Full-stack React framework (frontend + backend API routes)
- **React 18** - UI komponens library
- **TypeScript** - Type-safe development (ajánlott, opcionális)
- **Node.js 18+** - JavaScript runtime environment

**Database:**
- **MySQL 8.0+** (production) VAGY **PostgreSQL 14+** - Relational database
- **Prisma ORM** - Type-safe database client, auto-generated types, migration management
- Alternatíva: **Drizzle ORM** (ha lighter weight preferált)

**Styling:**
- **Tailwind CSS** - Utility-first CSS framework
- Mobile-first responsive design (44x44px min touch targets, WCAG 2.1 AA)

**Interactive Features:**
- **@dnd-kit/core** - Drag-and-drop seating map (kutatás alapján választva)
- **html5-qrcode** - Mobile QR code scanning a check-in rendszerhez

**External Services:**
- **Stripe SDK** (stripe npm package) - Payment processing (Checkout Session + webhooks)
- **Nodemailer** - Email delivery (SMTP provider TBD)
- **qrcode** npm package - QR code generation JWT token-ekből
- **jsonwebtoken** - JWT token creation/validation

**Testing:**
- **Vitest** VAGY **Jest** - Unit & integration testing
- **Playwright** - E2E testing (opcionális)

**Hosting (ajánlott):**
- **Vercel** - Next.js hosting (free tier, automatic HTTPS, instant deploys)
- **PlanetScale** (MySQL) VAGY **Neon** (PostgreSQL) - Managed database (free tier available)
- Alternatívák: Railway, Render, Hetzner VPS (€5/hó)

**Státusz**: ✅ Telepítve - package.json konfigurálva, összes függőség működik.

### Codebase Structure

**Teljesen Implementált Projekt** - 7 epic, 38 story kész. Struktúra a CLAUDE.md alapján:

```
app/                        # Next.js App Router (routing + API)
├── (auth)/                # Authentication pages (grouped route)
│   ├── register/          # Magic link registration flow
│   └── admin/login/       # Admin login page
├── admin/                 # Admin dashboard pages (protected)
│   ├── guests/           # Guest list management
│   ├── tables/           # Table/seating management UI
│   └── checkin-log/      # Check-in reports & logs
├── checkin/              # Mobile check-in app (staff)
├── api/                  # API Route Handlers (backend)
│   ├── registration/     # Guest registration endpoints
│   ├── stripe/          # Payment & webhook handlers
│   ├── checkin/         # Check-in validation
│   └── admin/           # Admin CRUD operations
└── components/           # React components
    ├── ui/              # Reusable UI (buttons, forms, etc.)
    ├── seating/         # Seating map components (dnd-kit)
    └── forms/           # Registration & admin forms

lib/                      # Business logic & utilities
├── services/            # Business logic layer
│   ├── registration.ts  # Registration business logic
│   ├── payment.ts       # Stripe payment handling
│   ├── checkin.ts       # Check-in validation logic
│   └── seating.ts       # Seating assignment logic
├── db/                  # Database client
│   └── prisma.ts       # Prisma client singleton
├── auth/               # Authentication utilities
│   ├── magic-link.ts   # Magic link generation/validation
│   └── session.ts      # Admin session management
└── utils/              # Helper functions

prisma/
├── schema.prisma       # Database schema (8 tables)
└── migrations/         # Auto-generated migrations

public/                 # Static assets
├── images/
└── fonts/

tests/                  # Test suites
├── unit/              # Unit tests (Vitest/Jest)
├── integration/       # Integration tests
└── e2e/              # E2E tests (Playwright)
```

**Key Architecture Patterns** (létrehozandó):
- **Server Components** (default) - Server-side rendering, zero client JS
- **Client Components** (`'use client'`) - Interactive UI (drag-drop, QR scanner)
- **API Routes** (`app/api/**/route.ts`) - RESTful endpoints
- **Service Layer** (`lib/services/`) - Business logic separation
- **Repository Pattern** (Prisma models) - Data access abstraction

---

## The Change

### Problem Statement

**Üzleti probléma:**

A VIP gála események szervezése jelenleg manuális, időigényes és hibára hajlamos folyamat. Az event organizerek nehezen kezelik a vendéglista importálását, a meghívók kiküldését, a regisztrációs folyamatot, a fizetés nyomon követését, az asztalfoglalást és a check-in folyamatot. Nincs egységes, integrált rendszer, amely mindezeket egy helyen, digitálisan kezeli.

**Technikai probléma:**

Szükség van egy **full-stack web alkalmazásra**, amely:
- **Invitation-only** alapon működik (nem nyilvános regisztráció, csak meghívott vendégek)
- **Magic link authentication** - egyszerű, jelszó nélküli bejelentkezés vendégeknek
- **Multi-role system** - vendégek (VIP & paying), adminok, check-in staff
- **Payment processing** - online fizetés (Stripe) és banki átutalás kezelése
- **QR ticketing** - biztonságos, hamisíthatatlan QR kódos jegyek JWT-vel
- **Table assignment** - vizuális, drag-and-drop asztalfoglalási térkép
- **Real-time check-in** - mobil QR scanner app a beléptetéshez

**Skálázhatósági követelmények:**
- **500 vendég** kezelése egyidejűleg (max 10,000 skálázhatóság)
- **100 egyidejű felhasználó** check-in során
- **50+ asztal** vizuális menedzsmentje
- **< 2 másodperc** oldalbetöltési idő (LCP)
- **< 500 ms** API válaszidő (95th percentile)

**Időkorlát:**
- **1 hónap** teljes fejlesztési idő (2025. december vége)
- **MVP-first approach** - alapfunkciók előre, opcionális funkciók később

### Proposed Solution

**Architektúra Overview:**

Egy **Next.js 14+ App Router** alapú full-stack web alkalmazás, amely egyesíti a frontend (React 18 + Tailwind CSS) és backend (API routes + Prisma ORM) funkciókat egyetlen deployable egységben.

**4-Fázisú Implementációs Stratégia:**

1. **Fázis 1: Core Registration (MVP)** - Alapvető regisztrációs folyamat
   - CSV alapú vendéglista import (admin)
   - Magic link authentication (passwordless, email-based)
   - VIP vendég regisztráció (ingyenes, automatikus jóváhagyás)
   - Fizető vendég regisztráció (kézi admin jóváhagyás szükséges)
   - Admin CRUD műveletek (vendéglista kezelés)

2. **Fázis 2: Payment & Ticketing** - Fizetés és jegykezelés
   - Stripe Checkout Session integráció (online card payment)
   - Bank transfer opció (manuális payment_status kezelés)
   - QR kód generálás JWT tokennel (ticket security)
   - Email kiküldés (registration confirmation, payment receipt, ticket delivery)
   - Admin payment tracking dashboard

3. **Fázis 3: Check-in System** - Beléptetési rendszer
   - Mobil QR scanner app (html5-qrcode library)
   - Real-time check-in validáció (JWT verify, duplicate prevention)
   - Check-in log tárolás (timestamp, staff_id)
   - Admin override funkcionalitás (manual check-in)
   - Check-in report export

4. **Fázis 4: Seating Management** - Asztalfoglalás
   - Table CRUD admin interface
   - Guest → Table assignment logic
   - Drag-and-drop seating map (@dnd-kit/core)
   - Visual table layout editor
   - Seating chart export

**Technológiai Stack Döntések:**

- **Database:** MySQL 8.0+ (PlanetScale free tier - 5GB storage, branching support)
- **ORM:** Prisma (type-safe schema, auto-generated types, migration management)
- **Authentication:**
  - Vendégek: Magic link (email-based, passwordless, jwt token)
  - Admin: NextAuth.js v5 (bcrypt hashed password, session management)
- **Payment:** Stripe SDK (Checkout Session + webhooks a payment_status szinkronizációhoz)
- **Email:** Resend (3,000 email/month free tier, Next.js-friendly API, konfigurálható más SMTP-re)
- **QR Generation:** qrcode npm package (JWT token → PNG image)
- **QR Scanning:** html5-qrcode (mobil kamera access, real-time scanning)
- **Drag-and-Drop:** @dnd-kit/core (DOM-based, accessibility-first, 4.5M weekly downloads)

**Security Architecture:**

- **Magic Link:** JWT token (24h expiry) email-ben küldve, one-time használat
- **Admin Session:** NextAuth.js JWT session (httpOnly cookie, 7 day expiry)
- **Password Storage:** bcrypt hash (cost factor: 12)
- **QR Ticket:** JWT token (event_id, guest_id, expiry) → QR code PNG
- **API Protection:** Middleware-based auth check (public routes: /api/registration, protected: /api/admin/*)

**Testability-First Approach (Prioritás #1):**

- **Manual Testing Support:**
  - Stripe test mode (4242 4242 4242 4242 test card)
  - Email preview endpoint (GET /api/dev/email-preview/:template)
  - Seed script (npm run db:seed) - 50 test guests, 10 tables
  - Admin dev account (admin@test.com / TestPassword123!)

- **Automated Testing Infrastructure:**
  - **E2E Testing:** Playwright (Chrome, Firefox, Safari cross-browser)
  - **Visual Testing:** Playwright screenshots + Percy.io integráció (opcionális)
  - **API Testing:** Vitest + supertest (API route unit tests)
  - **Component Testing:** Vitest + React Testing Library
  - **Payment Flow Testing:** Stripe CLI webhook forwarding (local testing)

- **Test Coverage Célok:**
  - API routes: 80%+ coverage
  - Business logic (lib/services/): 90%+ coverage
  - Critical paths (registration, payment, check-in): 100% E2E coverage

**Deployment Architecture:**

- **Hosting:** Vercel (Next.js optimized, automatic HTTPS, preview deployments)
- **Database:** PlanetScale (MySQL, free tier, connection pooling)
- **Email:** Resend (production SMTP, 3K/month free)
- **Payment:** Stripe (production mode, webhook endpoint: /api/stripe/webhook)
- **Monitoring:** Vercel Analytics + Sentry error tracking (opcionális)

**Skálázhatóság:**

- **Edge-ready:** Next.js API routes támogatják a Vercel Edge Runtime-ot (opcionális optimalizáció)
- **Connection Pooling:** Prisma Data Proxy vagy PlanetScale built-in pooling
- **Caching:** Next.js fetch cache + React Server Component cache (automatic)
- **Image Optimization:** Next.js Image komponens (automatic WebP conversion, lazy loading)

### Scope

**In Scope:**

**Fázis 1: Core Registration (MVP) - TELJES SCOPE:**
- CSV vendéglista import funkcionalitás (admin)
- Guest táblázat séma (Prisma schema definition)
- Magic link email generálás és validáció (JWT-based)
- VIP vendég self-registration flow (automatic approval)
- Fizető vendég self-registration flow (pending → admin approval)
- Admin authentication (NextAuth.js v5 + bcrypt)
- Admin guest list CRUD operations (create, read, update, delete)
- Registration confirmation email küldés

**Fázis 2: Payment & Ticketing - TELJES SCOPE:**
- Stripe Checkout Session integráció (online payment)
- Payment táblázat séma (payment_method: card | bank_transfer)
- Bank transfer manual payment tracking (admin marks as paid)
- Payment status transitions (pending → paid → failed)
- QR code generation (JWT token → PNG image, qrcode library)
- Ticket delivery email (QR code attachment)
- Admin payment dashboard (filter by status, export)
- Stripe webhook handler (/api/stripe/webhook - checkout.session.completed)

**Fázis 3: Check-in System - TELJES SCOPE:**
- Mobil check-in app UI (responsive, mobile-first)
- QR code scanner integráció (html5-qrcode, camera access)
- Check-in validáció logika (JWT verify, duplicate check, payment check)
- Checkins táblázat séma (guest_id, timestamp, staff_id)
- Admin manual check-in override (bypass QR)
- Check-in log viewer (real-time updates)
- Check-in report export (CSV, PDF)

**Fázis 4: Seating Management - TELJES SCOPE:**
- Tables táblázat séma (table_number, capacity, x, y coordinates)
- Table_assignments táblázat séma (guest_id, table_id)
- Table CRUD admin interface
- Guest → Table assignment editor
- Drag-and-drop seating map (@dnd-kit/core)
- Visual table layout editor (add, move, resize tables)
- Seating chart export (PDF, image)

**Testability Infrastructure - TELJES SCOPE:**
- Database seed script (50 test guests, 10 tables, sample payments)
- Email preview endpoint (GET /api/dev/email-preview/:template)
- Stripe test mode configuration (test API keys, webhook testing)
- E2E test suite (Playwright - critical paths: registration, payment, check-in)
- API unit tests (Vitest - lib/services/ business logic)
- Component tests (Vitest + React Testing Library - UI components)
- Test documentation (README.testing.md - how to run tests, test data setup)

**Deployment & DevOps - TELJES SCOPE:**
- Vercel deployment configuration (vercel.json, environment variables)
- PlanetScale database setup (connection string, migration workflow)
- Prisma migrations (initial schema, future migrations)
- Environment variable documentation (.env.example)
- Production monitoring setup (Vercel Analytics, error tracking)

**Out of Scope:**

**Nem implementált funkciók (későbbi verzióra):**
- **Multi-event support** - Jelenleg 1 event hardcoded (future: events táblázat)
- **Guest +1 management** - Companion/plus-one guest handling (future: guest_companions táblázat)
- **Dietary restrictions tracking** - Meal preferences (future: dietary_preferences mező)
- **Seating preferences** - Guest seating requests (future: seating_notes mező)
- **Email template customization UI** - Admin email editor (jelenleg: hardcoded templates)
- **SMS notifications** - Csak email notificationök (future: Twilio integráció)
- **Multi-language support** - Csak Magyar nyelv (future: i18n)
- **Guest profile photos** - Avatar upload (future: file storage)
- **Table reservation conflicts** - Overbooking detection (future: capacity validation)
- **Real-time seating updates** - Live collaboration (future: WebSocket)

**Nem támogatott payment módok:**
- PayPal (csak Stripe + bank transfer)
- Cash payment tracking
- Installment plans (részletfizetés)
- Refund management (visszatérítés)

**Nem támogatott export formátumok:**
- Excel (.xlsx) export - Csak CSV
- iCalendar (.ics) integration
- Google Sheets sync

**Nem implementált security features:**
- Two-factor authentication (2FA)
- Rate limiting (API brute-force protection)
- CAPTCHA (bot protection)
- Admin role-based permissions (jelenleg: minden admin full access)

**Nem támogatott deployment környezetek:**
- Self-hosted deployment (csak Vercel)
- Docker containerization
- Kubernetes orchestration
- Multi-region deployment

---

## Implementation Details

### Source Tree Changes

**Új fájlok létrehozása (Greenfield):**

```
/
├── .env.example                      # Environment variables template
├── .env.local                        # Local dev environment (gitignored)
├── .gitignore                        # Git ignore patterns
├── next.config.js                    # Next.js configuration
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── vitest.config.ts                  # Vitest test configuration
├── playwright.config.ts              # Playwright E2E configuration
├── README.md                         # Project documentation
├── README.testing.md                 # Testing guide
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (HTML shell, metadata)
│   ├── page.tsx                      # Landing page (public)
│   ├── globals.css                   # Global Tailwind styles
│   │
│   ├── (auth)/                       # Auth routes group (layout sharing)
│   │   ├── layout.tsx                # Auth layout (centered card)
│   │   ├── register/                 # Guest registration
│   │   │   └── page.tsx              # Magic link form
│   │   ├── verify/                   # Magic link verification
│   │   │   └── page.tsx              # JWT token validation
│   │   └── admin/
│   │       └── login/
│   │           └── page.tsx          # Admin login form
│   │
│   ├── admin/                        # Admin dashboard (protected routes)
│   │   ├── layout.tsx                # Admin layout (sidebar navigation)
│   │   ├── page.tsx                  # Dashboard overview
│   │   ├── guests/                   # Guest management
│   │   │   ├── page.tsx              # Guest list table
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Guest detail/edit
│   │   │   └── import/
│   │   │       └── page.tsx          # CSV import UI
│   │   ├── payments/                 # Payment tracking
│   │   │   ├── page.tsx              # Payment dashboard
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Payment detail
│   │   ├── tables/                   # Table management
│   │   │   ├── page.tsx              # Table list CRUD
│   │   │   └── seating-map/
│   │   │       └── page.tsx          # Drag-drop seating map
│   │   └── checkin-log/
│   │       └── page.tsx              # Check-in log viewer
│   │
│   ├── checkin/                      # Mobile check-in app
│   │   ├── layout.tsx                # Mobile-optimized layout
│   │   └── page.tsx                  # QR scanner interface
│   │
│   ├── api/                          # API Route Handlers
│   │   ├── registration/
│   │   │   ├── route.ts              # POST /api/registration (magic link request)
│   │   │   └── verify/
│   │   │       └── route.ts          # GET /api/registration/verify?token=...
│   │   ├── stripe/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts          # POST /api/stripe/checkout (create session)
│   │   │   └── webhook/
│   │   │       └── route.ts          # POST /api/stripe/webhook (Stripe events)
│   │   ├── checkin/
│   │   │   ├── validate/
│   │   │   │   └── route.ts          # POST /api/checkin/validate (QR verify)
│   │   │   └── manual/
│   │   │       └── route.ts          # POST /api/checkin/manual (admin override)
│   │   ├── admin/
│   │   │   ├── guests/
│   │   │   │   ├── route.ts          # GET, POST /api/admin/guests
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts      # GET, PATCH, DELETE /api/admin/guests/:id
│   │   │   │   └── import/
│   │   │   │       └── route.ts      # POST /api/admin/guests/import (CSV)
│   │   │   ├── tables/
│   │   │   │   ├── route.ts          # GET, POST /api/admin/tables
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # PATCH, DELETE /api/admin/tables/:id
│   │   │   ├── assignments/
│   │   │   │   └── route.ts          # POST /api/admin/assignments (bulk assign)
│   │   │   └── payments/
│   │   │       ├── route.ts          # GET /api/admin/payments
│   │   │       └── [id]/
│   │   │           └── route.ts      # PATCH /api/admin/payments/:id
│   │   └── dev/
│   │       └── email-preview/
│   │           └── [template]/
│   │               └── route.ts      # GET /api/dev/email-preview/:template
│   │
│   └── components/                   # React components
│       ├── ui/                       # Reusable UI primitives
│       │   ├── button.tsx            # Button component
│       │   ├── input.tsx             # Input component
│       │   ├── table.tsx             # Table component
│       │   ├── card.tsx              # Card component
│       │   ├── dialog.tsx            # Modal dialog
│       │   └── spinner.tsx           # Loading spinner
│       ├── seating/                  # Seating map components
│       │   ├── seating-map.tsx       # Drag-drop map container
│       │   ├── table-item.tsx        # Draggable table component
│       │   └── guest-list.tsx        # Unassigned guest list
│       ├── forms/                    # Form components
│       │   ├── registration-form.tsx # Guest registration form
│       │   ├── login-form.tsx        # Admin login form
│       │   └── csv-upload-form.tsx   # CSV import form
│       └── checkin/
│           ├── qr-scanner.tsx        # QR scanner component (html5-qrcode)
│           └── checkin-result.tsx    # Scan result display
│
├── lib/                              # Business logic & utilities
│   ├── services/                     # Business logic layer
│   │   ├── registration.ts           # Registration logic (magic link, approval)
│   │   ├── payment.ts                # Payment logic (Stripe, bank transfer)
│   │   ├── checkin.ts                # Check-in validation logic
│   │   ├── seating.ts                # Seating assignment logic
│   │   └── email.ts                  # Email sending logic
│   ├── db/
│   │   └── prisma.ts                 # Prisma client singleton
│   ├── auth/
│   │   ├── magic-link.ts             # Magic link generation/validation
│   │   ├── session.ts                # Admin session management
│   │   └── middleware.ts             # Auth middleware
│   ├── utils/
│   │   ├── jwt.ts                    # JWT token utilities
│   │   ├── qr.ts                     # QR code generation utilities
│   │   ├── csv.ts                    # CSV parsing utilities
│   │   └── validation.ts             # Zod validation schemas
│   └── email-templates/              # Email HTML templates
│       ├── registration-confirmation.tsx  # React Email template
│       ├── payment-receipt.tsx            # React Email template
│       └── ticket-delivery.tsx            # React Email template
│
├── prisma/
│   ├── schema.prisma                 # Database schema (8 tables)
│   ├── migrations/                   # Auto-generated migrations
│   │   └── (migration folders)
│   └── seed.ts                       # Database seeding script
│
├── public/                           # Static assets
│   ├── images/
│   │   └── logo.png                  # Event logo
│   └── fonts/                        # Custom fonts (optional)
│
└── tests/                            # Test suites
    ├── unit/                         # Unit tests (Vitest)
    │   ├── services/
    │   │   ├── registration.test.ts
    │   │   ├── payment.test.ts
    │   │   ├── checkin.test.ts
    │   │   └── seating.test.ts
    │   └── utils/
    │       ├── jwt.test.ts
    │       └── validation.test.ts
    ├── integration/                  # Integration tests (Vitest)
    │   └── api/
    │       ├── registration.test.ts
    │       ├── stripe.test.ts
    │       └── checkin.test.ts
    └── e2e/                          # E2E tests (Playwright)
        ├── registration.spec.ts      # Registration flow
        ├── payment.spec.ts           # Payment flow
        ├── checkin.spec.ts           # Check-in flow
        └── seating.spec.ts           # Seating management
```

**Fájl számok összegzése:**
- **App Router pages:** 15 route pages
- **API Route Handlers:** 18 endpoints
- **React Components:** 15 components
- **Business Logic (lib/):** 14 service/utility files
- **Email Templates:** 3 templates
- **Tests:** 12 test files
- **Config fájlok:** 9 configuration files
- **Összesen:** ~86 új fájl (excluding migrations, node_modules)

### Technical Approach

**1. Database Schema Design (Prisma + MySQL):**

**Központi táblák (8 darab):**

```prisma
// prisma/schema.prisma

model Guest {
  id                 Int      @id @default(autoincrement())
  email              String   @unique
  first_name         String
  last_name          String
  phone              String?
  guest_type         String   // 'vip' | 'paying'
  registration_status String  // 'invited' | 'pending' | 'approved' | 'declined'
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt

  // Relations
  registrations      Registration[]
  payments           Payment[]
  checkins           Checkin[]
  table_assignment   TableAssignment?
}

model Registration {
  id          Int      @id @default(autoincrement())
  guest_id    Int
  token       String   @unique  // Magic link JWT token
  used_at     DateTime?
  expires_at  DateTime
  created_at  DateTime @default(now())

  guest       Guest    @relation(fields: [guest_id], references: [id])
}

model Payment {
  id                 Int      @id @default(autoincrement())
  guest_id           Int
  amount             Decimal  @db.Decimal(10, 2)
  currency           String   @default("HUF")
  payment_method     String   // 'card' | 'bank_transfer'
  payment_status     String   // 'pending' | 'paid' | 'failed'
  stripe_session_id  String?  @unique
  paid_at            DateTime?
  created_at         DateTime @default(now())

  guest              Guest    @relation(fields: [guest_id], references: [id])
}

model Checkin {
  id          Int      @id @default(autoincrement())
  guest_id    Int
  checked_in_at DateTime @default(now())
  staff_id    Int?     // Admin user who performed check-in
  method      String   // 'qr' | 'manual'

  guest       Guest    @relation(fields: [guest_id], references: [id])
  staff       User?    @relation(fields: [staff_id], references: [id])
}

model Table {
  id          Int      @id @default(autoincrement())
  table_number Int     @unique
  capacity    Int
  x_position  Int?     // Canvas X coordinate for drag-drop
  y_position  Int?     // Canvas Y coordinate for drag-drop
  created_at  DateTime @default(now())

  assignments TableAssignment[]
}

model TableAssignment {
  id          Int      @id @default(autoincrement())
  guest_id    Int      @unique
  table_id    Int
  assigned_at DateTime @default(now())

  guest       Guest    @relation(fields: [guest_id], references: [id])
  table       Table    @relation(fields: [table_id], references: [id])
}

model User {
  id          Int      @id @default(autoincrement())
  email       String   @unique
  password    String   // bcrypt hashed
  role        String   @default("admin") // 'admin' | 'staff'
  created_at  DateTime @default(now())

  checkins    Checkin[]
}

model EmailLog {
  id          Int      @id @default(autoincrement())
  recipient   String
  subject     String
  template    String   // 'registration_confirmation' | 'payment_receipt' | 'ticket_delivery'
  sent_at     DateTime @default(now())
  status      String   // 'sent' | 'failed'
  error       String?  @db.Text
}
```

**2. Authentication Strategy:**

**Guest Authentication (Magic Link):**
- Flow: Email → JWT token → Email link → Token verification → Session creation
- Implementation:
  ```typescript
  // lib/auth/magic-link.ts
  export async function generateMagicLink(email: string): Promise<string> {
    const token = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '24h' })
    await prisma.registration.create({
      data: { guest_id, token, expires_at: new Date(Date.now() + 24*60*60*1000) }
    })
    return `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`
  }

  export async function verifyMagicLink(token: string): Promise<Guest | null> {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    const registration = await prisma.registration.findUnique({ where: { token } })
    if (!registration || registration.used_at) return null
    await prisma.registration.update({ where: { id: registration.id }, data: { used_at: new Date() } })
    return await prisma.guest.findUnique({ where: { id: registration.guest_id } })
  }
  ```

**Admin Authentication (NextAuth.js v5):**
- Provider: Credentials (email + password)
- Password hashing: bcrypt (cost factor: 12)
- Session: JWT stored in httpOnly cookie
- Implementation:
  ```typescript
  // app/api/auth/[...nextauth]/route.ts
  export const authOptions: NextAuthConfig = {
    providers: [
      CredentialsProvider({
        async authorize(credentials) {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (!user) return null
          const valid = await bcrypt.compare(credentials.password, user.password)
          return valid ? user : null
        }
      })
    ],
    session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 } // 7 days
  }
  ```

**3. Payment Processing (Stripe Integration):**

**Checkout Flow:**
```typescript
// lib/services/payment.ts
export async function createCheckoutSession(guestId: number): Promise<string> {
  const guest = await prisma.guest.findUnique({ where: { id: guestId } })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency: 'huf', product_data: { name: 'VIP Gála Jegy' }, unit_amount: 50000 }, quantity: 1 }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
    metadata: { guest_id: guestId }
  })

  await prisma.payment.create({
    data: { guest_id: guestId, amount: 50000, currency: 'HUF', payment_method: 'card', payment_status: 'pending', stripe_session_id: session.id }
  })

  return session.url
}
```

**Webhook Handler (payment status sync):**
```typescript
// app/api/stripe/webhook/route.ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const event = stripe.webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET!)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    await prisma.payment.update({
      where: { stripe_session_id: session.id },
      data: { payment_status: 'paid', paid_at: new Date() }
    })
    // Trigger ticket email
    await sendTicketEmail(session.metadata.guest_id)
  }

  return NextResponse.json({ received: true })
}
```

**4. QR Code Ticketing:**

**QR Generation:**
```typescript
// lib/utils/qr.ts
export async function generateTicketQR(guestId: number): Promise<Buffer> {
  const token = jwt.sign({ guest_id: guestId, type: 'ticket' }, process.env.JWT_SECRET!, { expiresIn: '30d' })
  return await QRCode.toBuffer(token)
}
```

**QR Validation (Check-in):**
```typescript
// lib/services/checkin.ts
export async function validateTicket(token: string, staffId: number): Promise<{ valid: boolean, guest?: Guest, error?: string }> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { guest_id: number }
    const guest = await prisma.guest.findUnique({ where: { id: decoded.guest_id }, include: { payments: true, checkins: true } })

    if (!guest) return { valid: false, error: 'Guest not found' }
    if (guest.checkins.length > 0) return { valid: false, error: 'Already checked in' }
    if (!guest.payments.some(p => p.payment_status === 'paid')) return { valid: false, error: 'Payment not confirmed' }

    await prisma.checkin.create({ data: { guest_id: guest.id, staff_id: staffId, method: 'qr' } })
    return { valid: true, guest }
  } catch (err) {
    return { valid: false, error: 'Invalid token' }
  }
}
```

**5. Drag-and-Drop Seating Map (@dnd-kit/core):**

**Implementation Pattern:**
```typescript
// app/components/seating/seating-map.tsx
'use client'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'

export function SeatingMap() {
  const [tables, setTables] = useState<Table[]>([])
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([])

  function handleDragEnd(event) {
    const { active, over } = event
    if (over && over.id.startsWith('table-')) {
      const guestId = active.id
      const tableId = parseInt(over.id.replace('table-', ''))
      // Call API to assign guest to table
      await fetch('/api/admin/assignments', { method: 'POST', body: JSON.stringify({ guestId, tableId }) })
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-8">
        <div className="canvas">{tables.map(t => <TableDropzone table={t} />)}</div>
        <div className="sidebar">{unassignedGuests.map(g => <DraggableGuest guest={g} />)}</div>
      </div>
    </DndContext>
  )
}
```

**6. Email Delivery (Resend + React Email):**

**Template Example:**
```typescript
// lib/email-templates/ticket-delivery.tsx
export function TicketEmail({ guest, qrCode }: { guest: Guest, qrCode: Buffer }) {
  return (
    <Html>
      <Head />
      <Body>
        <h1>Kedves {guest.first_name}!</h1>
        <p>Jegyed a VIP Gálára:</p>
        <img src={`data:image/png;base64,${qrCode.toString('base64')}`} alt="QR Ticket" />
      </Body>
    </Html>
  )
}
```

**Sending Logic:**
```typescript
// lib/services/email.ts
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTicketEmail(guestId: number) {
  const guest = await prisma.guest.findUnique({ where: { id: guestId } })
  const qrCode = await generateTicketQR(guestId)

  await resend.emails.send({
    from: 'VIP Gála <noreply@yourdomain.com>',
    to: guest.email,
    subject: 'Jegyed a VIP Gálára',
    react: TicketEmail({ guest, qrCode })
  })

  await prisma.emailLog.create({
    data: { recipient: guest.email, subject: 'Jegyed a VIP Gálára', template: 'ticket_delivery', status: 'sent' }
  })
}
```

**7. Testing Infrastructure:**

**Test Data Seeding:**
```typescript
// prisma/seed.ts
async function main() {
  // Create admin user
  await prisma.user.create({
    data: { email: 'admin@test.com', password: await bcrypt.hash('TestPassword123!', 12), role: 'admin' }
  })

  // Create 50 test guests
  for (let i = 1; i <= 50; i++) {
    await prisma.guest.create({
      data: {
        email: `guest${i}@test.com`,
        first_name: `Test${i}`,
        last_name: `User`,
        guest_type: i <= 10 ? 'vip' : 'paying',
        registration_status: 'approved'
      }
    })
  }

  // Create 10 tables
  for (let i = 1; i <= 10; i++) {
    await prisma.table.create({ data: { table_number: i, capacity: 8 } })
  }
}
```

**E2E Test Example (Playwright):**
```typescript
// tests/e2e/registration.spec.ts
test('VIP guest registration flow', async ({ page }) => {
  await page.goto('/register')
  await page.fill('[name="email"]', 'vip@test.com')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Magic link sent')).toBeVisible()

  // Simulate clicking magic link (mock email)
  const token = await getLatestMagicLinkToken('vip@test.com')
  await page.goto(`/verify?token=${token}`)
  await expect(page.locator('text=Registration confirmed')).toBeVisible()
})
```

### Existing Patterns to Follow

**GREENFIELD PROJEKT - Új mintázatok létrehozása:**

Mivel ez egy greenfield projekt, nincsenek létező kódminták. Az alábbi konvenciókat követjük:

**1. Next.js App Router Konvenciók:**

- **Server Components (default):** Minden komponens server component, hacsak nem szükséges client-side interakció
- **Client Components (`'use client'`):** Csak interactive komponensekhez (forms, drag-drop, QR scanner)
- **File-based Routing:** `app/` folder struktúra → automatikus route generation
- **API Route Handlers:** `route.ts` fájlok az `app/api/` alatt
- **Colocation:** Komponensek és logika colocation támogatása (`app/components/`, `lib/`)

**2. TypeScript Konvenciók:**

- **Strict Mode:** `tsconfig.json` strict: true
- **Prisma Generated Types:** Automatikusan generált típusok használata
- **Zod Validation:** Request/response validációhoz Zod schemas (`lib/utils/validation.ts`)
- **Type Exports:** Shared types külön fájlokban (`lib/types/`)

**3. Naming Conventions:**

**Fájlok:**
- React komponensek: `PascalCase.tsx` (pl. `SeatingMap.tsx`)
- Utility fájlok: `kebab-case.ts` (pl. `magic-link.ts`)
- API routes: `route.ts` (Next.js konvenció)
- Test fájlok: `*.test.ts` (unit), `*.spec.ts` (E2E)

**Kód:**
- React komponensek: `PascalCase` (pl. `function SeatingMap()`)
- Függvények: `camelCase` (pl. `generateMagicLink()`)
- Konstansok: `UPPER_SNAKE_CASE` (pl. `MAX_FILE_SIZE`)
- Interface/Type: `PascalCase` (pl. `type GuestData`)

**4. Prisma ORM Patterns:**

- **Singleton Pattern:** Egyetlen Prisma client instance (`lib/db/prisma.ts`)
  ```typescript
  // lib/db/prisma.ts
  import { PrismaClient } from '@prisma/client'
  const globalForPrisma = global as unknown as { prisma: PrismaClient }
  export const prisma = globalForPrisma.prisma || new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```

- **Service Layer:** Business logic elválasztása (`lib/services/`)
  - Services directly használják a Prisma clientet
  - API routes hívják a service layert (nem közvetlenül Prismát)

**5. Error Handling Patterns:**

**API Routes:**
```typescript
// app/api/admin/guests/route.ts
export async function GET(req: Request) {
  try {
    const guests = await guestService.getAll()
    return NextResponse.json(guests)
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 })
  }
}
```

**Service Layer:**
```typescript
// lib/services/registration.ts
export async function registerGuest(data: GuestData): Promise<{ success: boolean, guest?: Guest, error?: string }> {
  try {
    const guest = await prisma.guest.create({ data })
    return { success: true, guest }
  } catch (error) {
    return { success: false, error: 'Registration failed' }
  }
}
```

**6. Authentication Middleware Pattern:**

```typescript
// lib/auth/middleware.ts
export async function requireAdmin(req: Request): Promise<User | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return await prisma.user.findUnique({ where: { email: session.user.email } })
}
```

**API Route Protection:**
```typescript
// app/api/admin/guests/route.ts
export async function POST(req: Request) {
  const user = await requireAdmin(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ... admin logic
}
```

**7. Testing Patterns:**

**Service Layer Unit Tests (Vitest):**
```typescript
// tests/unit/services/registration.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerGuest } from '@/lib/services/registration'

describe('registerGuest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create VIP guest with auto-approval', async () => {
    const result = await registerGuest({ email: 'vip@test.com', guest_type: 'vip' })
    expect(result.success).toBe(true)
    expect(result.guest?.registration_status).toBe('approved')
  })
})
```

**E2E Tests (Playwright):**
```typescript
// tests/e2e/payment.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test('should complete Stripe checkout', async ({ page }) => {
    await page.goto('/payment')
    await page.click('button:has-text("Pay with Card")')
    // ... Stripe test card flow
  })
})
```

**8. Environment Variable Pattern:**

**.env.example template:**
```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ceogala"

# Authentication
JWT_SECRET="your-secret-key-here"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email
RESEND_API_KEY="re_..."

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

**9. Component Organization Patterns:**

**Server Component (default):**
```typescript
// app/admin/guests/page.tsx
export default async function GuestsPage() {
  const guests = await prisma.guest.findMany()
  return <GuestTable guests={guests} />
}
```

**Client Component (interactive):**
```typescript
// app/components/seating/seating-map.tsx
'use client'
import { useState } from 'react'
import { DndContext } from '@dnd-kit/core'

export function SeatingMap() {
  const [tables, setTables] = useState([])
  return <DndContext>...</DndContext>
}
```

**10. Code Style & Formatting:**

- **Prettier:** Default config, 2 space indent, single quotes
- **ESLint:** Next.js recommended rules
- **Import Order:** External → Internal → Relative
  ```typescript
  import { useState } from 'react'
  import { NextResponse } from 'next/server'
  import { prisma } from '@/lib/db/prisma'
  import { GuestTable } from './components/GuestTable'
  ```

### Integration Points

**1. External Services Integration:**

**Stripe Payment Platform:**
- **API Endpoints:**
  - Checkout Session creation: `stripe.checkout.sessions.create()`
  - Webhook event handling: `stripe.webhooks.constructEvent()`
- **Integration pont:** `lib/services/payment.ts` + `app/api/stripe/webhook/route.ts`
- **Environment variables:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Test mode:** Test API keys használata development során
- **Webhook endpoint:** `https://yourdomain.com/api/stripe/webhook` (Stripe dashboardban konfigurálva)

**Resend Email Platform:**
- **API Endpoints:** `resend.emails.send()`
- **Integration pont:** `lib/services/email.ts`
- **Environment variables:** `RESEND_API_KEY`
- **Email templates:** React Email komponensek (`lib/email-templates/`)
- **Sender domain:** Verified domain szükséges production-ben (pl. `noreply@yourdomain.com`)

**PlanetScale MySQL Database:**
- **Connection:** Prisma Data Proxy vagy direct connection string
- **Integration pont:** `lib/db/prisma.ts` (Prisma client singleton)
- **Environment variables:** `DATABASE_URL` (connection string)
- **Migration strategy:** Prisma Migrate CLI (`npx prisma migrate dev`)
- **Branching:** PlanetScale branch-based development (optional)

**2. Internal Module Integration:**

**Authentication Flow Integration:**

```
┌─────────────┐      Magic Link       ┌──────────────────┐
│   Guest     │ ──────────────────→   │ lib/auth/        │
│             │                        │ magic-link.ts    │
└─────────────┘                        └──────────────────┘
       ↓                                        ↓
       │                                        │
       │    Email w/ JWT token                 │
       │                                        │
       ↓                                        ↓
┌─────────────┐      Click Link       ┌──────────────────┐
│   Email     │ ──────────────────→   │ app/verify/      │
│   Inbox     │                        │ page.tsx         │
└─────────────┘                        └──────────────────┘
                                               ↓
                                   lib/auth/magic-link.ts
                                   verifyMagicLink(token)
                                               ↓
                                   lib/services/registration.ts
                                   completeRegistration()
```

**Payment → Email Flow Integration:**

```
┌─────────────┐   POST /api/stripe/   ┌──────────────────┐
│   Guest     │   checkout            │ lib/services/    │
│   Browser   │ ───────────────────→  │ payment.ts       │
└─────────────┘                        └──────────────────┘
       ↓                                        ↓
       │                            Create Checkout Session
       │                                        ↓
       │                               Redirect to Stripe
       ↓                                        ↓
┌─────────────┐      Pay with Card    ┌──────────────────┐
│   Stripe    │ ←──────────────────   │   Guest          │
│  Checkout   │                        │   Browser        │
└─────────────┘                        └──────────────────┘
       ↓
       │    Webhook: checkout.session.completed
       ↓
┌─────────────────────────────────────────────────────────┐
│ app/api/stripe/webhook/route.ts                         │
│  → Update payment_status: 'paid'                        │
│  → Trigger email: lib/services/email.ts                 │
│     → Generate QR: lib/utils/qr.ts                      │
│     → Send ticket: Resend API                           │
└─────────────────────────────────────────────────────────┘
```

**Check-in QR Validation Flow:**

```
┌─────────────┐   Scan QR Code        ┌──────────────────┐
│  Staff      │                        │ app/checkin/     │
│  Mobile     │ ──────────────────→   │ page.tsx         │
└─────────────┘                        └──────────────────┘
       ↓                                        ↓
       │                          Extract JWT from QR
       │                                        ↓
       │                        POST /api/checkin/validate
       ↓                                        ↓
┌──────────────────────────────────────────────────────────┐
│ lib/services/checkin.ts                                  │
│  → Verify JWT token (lib/utils/jwt.ts)                   │
│  → Check payment status (lib/services/payment.ts)        │
│  → Check duplicate check-in (Prisma query)               │
│  → Create checkin record (Prisma)                        │
└──────────────────────────────────────────────────────────┘
       ↓
  Return result
       ↓
┌─────────────┐   Show Success/Error  ┌──────────────────┐
│  Staff      │ ←──────────────────   │ app/checkin/     │
│  Mobile     │                        │ page.tsx         │
└─────────────┘                        └──────────────────┘
```

**Seating Assignment Flow Integration:**

```
┌─────────────┐   Drag Guest Card     ┌──────────────────┐
│   Admin     │   to Table            │ app/components/  │
│   Browser   │ ──────────────────→   │ seating/         │
└─────────────┘                        │ seating-map.tsx  │
       ↓                               └──────────────────┘
       │                                        ↓
       │                          @dnd-kit handleDragEnd()
       │                                        ↓
       │                    POST /api/admin/assignments
       ↓                                        ↓
┌──────────────────────────────────────────────────────────┐
│ lib/services/seating.ts                                  │
│  → Validate table capacity (Prisma count query)          │
│  → Check existing assignment (Prisma unique constraint)  │
│  → Create table_assignment record (Prisma)               │
└──────────────────────────────────────────────────────────┘
       ↓
  Return updated assignment
       ↓
┌─────────────┐   Update UI           ┌──────────────────┐
│   Admin     │ ←──────────────────   │ app/components/  │
│   Browser   │                        │ seating/         │
└─────────────┘                        └──────────────────┘
```

**3. Database → Application Integration:**

**Prisma Client Integration Points:**

- **Direct Usage:** Server Components, API routes, server actions
- **Service Layer Wrapper:** `lib/services/*` függvények wrappelve
- **Type Generation:** `npx prisma generate` után automatikus TypeScript types
- **Migration Sync:** `npx prisma migrate dev` után schema.prisma ↔ MySQL sync

**4. Frontend ↔ Backend API Integration:**

**API Route Calling Pattern (Client Components):**

```typescript
// app/components/forms/registration-form.tsx
'use client'

async function handleSubmit(formData: FormData) {
  const res = await fetch('/api/registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: formData.get('email') })
  })

  const data = await res.json()
  if (!res.ok) {
    setError(data.error)
    return
  }

  // Success handling
}
```

**Server Component Data Fetching Pattern:**

```typescript
// app/admin/guests/page.tsx
export default async function GuestsPage() {
  // Direct database query in Server Component
  const guests = await prisma.guest.findMany({
    include: { payments: true, checkins: true }
  })

  return <GuestTable guests={guests} />
}
```

**5. Testing Integration Points:**

**Vitest + Prisma Integration:**
- **Mock Pattern:** `vi.mock('@/lib/db/prisma')` minden service test-ben
- **Test Database:** Separate test database vagy in-memory SQLite

**Playwright + Next.js Dev Server Integration:**
- **webServer:** Playwright auto-starts Next.js dev server
- **baseURL:** `http://localhost:3000` (config-ban)

**Stripe Test Mode Integration:**
- **Test API Keys:** `sk_test_...` és `pk_test_...` használata `.env.test`-ben
- **Webhook Testing:** Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## Development Context

### Relevant Existing Code

**GREENFIELD PROJEKT - Nincs létező kód.**

Releváns referenciaként szolgáló dokumentumok:
- `docs/FUNKCIONALIS-KOVETELMENY.md` - API specifikációk, adatbázis séma, validációs szabályok
- `docs/research-technical-2025-11-27.md` - Library választások (dnd-kit, Prisma, html5-qrcode)
- `CLAUDE.md` - Projekt architektúra és követelmények

### Dependencies

**Framework/Libraries:**

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.19.0",
    "prisma": "^5.19.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/utilities": "^3.2.2",
    "html5-qrcode": "^2.3.8",
    "qrcode": "^1.5.3",
    "stripe": "^14.21.0",
    "resend": "^3.2.0",
    "react-email": "^2.1.0",
    "next-auth": "^5.0.0-beta.19",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.0",
    "papaparse": "^5.4.1"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.14.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/papaparse": "^5.3.14",
    "vitest": "^1.6.0",
    "@vitest/ui": "^1.6.0",
    "playwright": "^1.44.0",
    "@playwright/test": "^1.44.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.3.0"
  }
}
```

**Kritikus függőségek magyarázata:**

- **next@14.2+:** App Router támogatás, Server Components, Server Actions
- **@prisma/client + prisma:** ORM, type-safe database access, migration management
- **@dnd-kit/core:** Drag-and-drop seating map (research alapján választva)
- **html5-qrcode:** QR scanner mobil kamerával
- **qrcode:** QR kód generálás PNG formátumban
- **stripe:** Payment processing SDK
- **resend + react-email:** Email delivery + React-based email templates
- **next-auth@5.0:** NextAuth v5 beta (latest stable App Router support)
- **bcryptjs:** Password hashing admin auth-hoz
- **jsonwebtoken:** JWT token generation/verification (magic link, QR tickets)
- **zod:** Runtime type validation (API request/response)
- **papaparse:** CSV parsing (guest list import)
- **playwright:** E2E testing framework
- **vitest:** Unit/integration testing framework (faster than Jest)

**Internal Modules:**

Nincs belső npm package - minden kód a monorepo-ban van:

- `lib/services/` - Business logic layer
- `lib/auth/` - Authentication utilities
- `lib/utils/` - Helper functions
- `lib/db/` - Prisma client singleton
- `lib/email-templates/` - React Email templates
- `app/components/` - Shared React components

### Configuration Changes

**GREENFIELD - Új konfigurációs fájlok létrehozása:**

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'], // QR code images
  },
  experimental: {
    serverActions: true,
  },
}
module.exports = nextConfig
```

**tailwind.config.js:**
```javascript
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
})
```

### Existing Conventions (Brownfield)

**N/A - GREENFIELD PROJECT**

Nincs létező konvenció, új mintázatokat hozunk létre (lásd "Existing Patterns to Follow" szakasz).

### Test Framework & Standards

**Unit/Integration Testing: Vitest**

- **Framework:** Vitest v1.6+ (Vite-powered, gyorsabb mint Jest)
- **Coverage Tool:** Vitest native coverage (@vitest/coverage-v8)
- **Mocking:** vi.mock() használata Prisma client mockinghoz
- **Assertion Library:** Vitest beépített expect()
- **Test Location:** `tests/unit/`, `tests/integration/`
- **Naming:** `*.test.ts` fájlok
- **Run Command:** `npm run test` vagy `npm run test:watch`

**E2E Testing: Playwright**

- **Framework:** Playwright v1.44+ (@playwright/test)
- **Browsers:** Chromium, Firefox (cross-browser testing)
- **Test Location:** `tests/e2e/`
- **Naming:** `*.spec.ts` fájlok
- **Run Command:** `npx playwright test` vagy `npx playwright test --ui` (visual mode)
- **Screenshots:** Automatikus failure screenshots enabled

**Test Coverage Célok:**

- **Service Layer (lib/services/):** 90%+ coverage
- **API Routes (app/api/):** 80%+ coverage
- **Critical Flows (registration, payment, check-in):** 100% E2E coverage
- **Components:** 70%+ coverage (vitest + React Testing Library)

---

## Implementation Stack

**Frontend Stack:**
- Next.js 14+ App Router (React 18 Server Components + Client Components)
- Tailwind CSS 3.4 (utility-first styling)
- TypeScript 5.5 (type-safe development)
- @dnd-kit/core 6.1 (drag-and-drop seating map)
- html5-qrcode 2.3 (QR scanner component)

**Backend Stack:**
- Next.js API Routes (REST endpoints)
- Prisma ORM 5.19 (database client + migrations)
- MySQL 8.0+ (relational database)
- NextAuth.js 5.0 (admin authentication)
- bcryptjs 2.4 (password hashing)
- jsonwebtoken 9.0 (JWT generation/verification)

**External Services:**
- Stripe 14.21 (payment processing)
- Resend 3.2 + React Email 2.1 (email delivery)
- PlanetScale (MySQL hosting)
- Vercel (Next.js hosting)

**Development Tools:**
- Vitest 1.6 (unit/integration testing)
- Playwright 1.44 (E2E testing)
- Prettier 3.3 (code formatting)
- ESLint 8.57 (linting)

---

## Technical Details

**Adatbázis Kapcsolat:**
- **Driver:** MySQL native driver (Prisma alatt)
- **Connection Pooling:** PlanetScale built-in pooling (max 10 connections free tier)
- **Migration Strategy:** Prisma Migrate (`npx prisma migrate dev`)

**Authentication Részletek:**
- **Guest Magic Link JWT Payload:** `{ email, type: 'magic-link', exp: 24h }`
- **QR Ticket JWT Payload:** `{ guest_id, type: 'ticket', exp: 30d }`
- **Admin Session JWT Payload:** `{ user_id, email, role, exp: 7d }`
- **JWT Secret:** Environment variable `JWT_SECRET` (min 32 chars)

**Stripe Webhook Security:**
- **Signature Verification:** `stripe.webhooks.constructEvent()` automatikus ellenőrzés
- **Raw Body Parsing:** Next.js config: `bodyParser: false` a webhook route-on
- **Idempotency:** Payment táblázat `stripe_session_id` unique constraint

**Email Delivery:**
- **Rate Limit:** Resend free tier: 3,000 emails/month, 100 emails/day
- **SPF/DKIM:** Resend automatikusan konfigurálja (custom domain esetén)
- **Bounce Handling:** Email log táblázat `status` mező ('sent' | 'failed')

**Performance Optimalizációk:**
- **Server Components:** Automatic React Server Components optimalizáció
- **Image Optimization:** Next.js Image komponens (automatic WebP, lazy load)
- **API Route Caching:** Next.js fetch cache (automatic GET route cache)
- **Database Indexing:** Prisma auto-index primary keys, unique constraints

**Security Measures:**
- **SQL Injection Protection:** Prisma ORM prepared statements
- **XSS Protection:** React automatic escaping
- **CSRF Protection:** NextAuth.js beépített CSRF token
- **Environment Variables:** .env.local never committed (gitignore)

---

## Development Setup

**Prerequisites:**
- Node.js 18+ telepítve
- npm vagy pnpm package manager
- MySQL 8.0+ (local vagy PlanetScale account)
- Git telepítve

**Local Development Environment Setup:**

```bash
# 1. Initialize Next.js project
npx create-next-app@latest ceogala --typescript --tailwind --app --no-src-dir
cd ceogala

# 2. Install dependencies
npm install @prisma/client prisma @dnd-kit/core @dnd-kit/utilities html5-qrcode qrcode stripe resend react-email next-auth@beta bcryptjs jsonwebtoken zod papaparse

npm install -D @types/bcryptjs @types/jsonwebtoken @types/papaparse vitest @vitest/ui playwright @playwright/test

# 3. Initialize Prisma
npx prisma init

# 4. Copy .env.example to .env.local
cp .env.example .env.local

# 5. Update DATABASE_URL in .env.local (MySQL connection string)
# 6. Create Prisma schema (copy from tech-spec Technical Approach section)
# 7. Run initial migration
npx prisma migrate dev --name init

# 8. Generate Prisma Client
npx prisma generate

# 9. Seed database with test data
npm run db:seed

# 10. Start development server
npm run dev
```

**package.json Scripts:**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

**Environment Variables (.env.local):**

```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ceogala"

# Authentication
JWT_SECRET="your-random-32-char-secret-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (test mode)
STRIPE_SECRET_KEY="sk_test_your_test_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"

# Email
RESEND_API_KEY="re_your_resend_api_key"

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## Implementation Guide

### Setup Steps

**Step 1: Project Initialization**

```bash
# Create Next.js project
npx create-next-app@latest ceogala --typescript --tailwind --app --no-src-dir
cd ceogala
```

**Step 2: Install ALL Dependencies**

```bash
# Production dependencies
npm install @prisma/client@^5.19.0 prisma@^5.19.0 \
  @dnd-kit/core@^6.1.0 @dnd-kit/utilities@^3.2.2 \
  html5-qrcode@^2.3.8 qrcode@^1.5.3 \
  stripe@^14.21.0 resend@^3.2.0 react-email@^2.1.0 \
  next-auth@5.0.0-beta.19 bcryptjs@^2.4.3 jsonwebtoken@^9.0.2 \
  zod@^3.23.0 papaparse@^5.4.1

# Dev dependencies
npm install -D @types/bcryptjs@^2.4.6 @types/jsonwebtoken@^9.0.6 \
  @types/papaparse@^5.3.14 vitest@^1.6.0 @vitest/ui@^1.6.0 \
  playwright@^1.44.0 @playwright/test@^1.44.0 tsx@^4.7.0
```

**Step 3: Setup Prisma**

```bash
# Initialize Prisma
npx prisma init

# Edit prisma/schema.prisma (copy schema from Technical Approach section)
# Edit .env.local with DATABASE_URL
```

**Step 4: Create Database Schema**

```bash
# Run first migration
npx prisma migrate dev --name init

# Generate Prisma Client types
npx prisma generate
```

**Step 5: Create Seed Script**

```bash
# Create prisma/seed.ts (copy from Technical Approach section)
# Add to package.json:
# "prisma": { "seed": "tsx prisma/seed.ts" }

# Run seed
npx prisma db seed
```

**Step 6: Setup Testing**

```bash
# Install Playwright browsers
npx playwright install

# Create test configs (vitest.config.ts, playwright.config.ts from Configuration Changes section)
```

**Step 7: Verify Setup**

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Should see Next.js default page

# Run tests
npm run test
npm run test:e2e

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Implementation Steps

**Implementációs Stratégia: 4 Fázis**

Mindegyik fázis önálló, tesztelhető release. Minden fázis végén deployable állapotban kell lennie a rendszernek.

---

**FÁZIS 1: Core Registration (MVP) - 7-10 nap**

**Célkitűzés:** Alapvető vendéglista menedzsment + magic link regisztráció + admin CRUD

**1.1 Database & Infrastructure (1-2 nap)**
- ✅ Prisma schema létrehozása (Guest, Registration, User táblák)
- ✅ Initial migration futtatása (`npx prisma migrate dev --name init`)
- ✅ Seed script írása (admin user + 50 test guest)
- ✅ Prisma client singleton létrehozása (`lib/db/prisma.ts`)

**1.2 Authentication Implementation (2-3 nap)**
- ✅ Magic link service (`lib/auth/magic-link.ts`): JWT generation, email sending, verification
- ✅ NextAuth.js setup (`app/api/auth/[...nextauth]/route.ts`): Admin credentials provider
- ✅ Auth middleware (`lib/auth/middleware.ts`): `requireAdmin()` helper
- ✅ Login page (`app/(auth)/admin/login/page.tsx`): Admin login form
- ✅ Email service (`lib/services/email.ts`): Resend integration + template rendering
- ✅ Email templates (`lib/email-templates/registration-confirmation.tsx`)

**1.3 Guest Registration Flow (2-3 nap)**
- ✅ Registration page (`app/(auth)/register/page.tsx`): Email input form
- ✅ Registration API (`app/api/registration/route.ts`): POST magic link request
- ✅ Verify page (`app/(auth)/verify/page.tsx`): Token validation + status display
- ✅ Verify API (`app/api/registration/verify/route.ts`): GET token verification
- ✅ Registration service (`lib/services/registration.ts`): Business logic (VIP auto-approve, paying manual approve)

**1.4 Admin Guest Management (2 nap)**
- ✅ Admin layout (`app/admin/layout.tsx`): Sidebar navigation
- ✅ Guest list page (`app/admin/guests/page.tsx`): Server Component with Prisma fetch
- ✅ Guest detail page (`app/admin/guests/[id]/page.tsx`): Edit guest info
- ✅ CSV import page (`app/admin/guests/import/page.tsx`): CSV upload + parsing
- ✅ Admin API routes (`app/api/admin/guests/`): GET, POST, PATCH, DELETE endpoints
- ✅ CSV import API (`app/api/admin/guests/import/route.ts`): papaparse integration

**1.5 Testing (1 nap)**
- ✅ Unit tests: `tests/unit/services/registration.test.ts`
- ✅ E2E tests: `tests/e2e/registration.spec.ts` (VIP & paying flows)
- ✅ Manual testing: Email delivery, CSV import

**Fázis 1 Acceptance Criteria:**
- ✅ Admin user be tud lépni credentials-szel
- ✅ CSV import működik (50+ guest feltöltés)
- ✅ VIP guest magic link-et kap és automatic approval-lel regisztrál
- ✅ Paying guest magic link-et kap, de "pending" státuszban marad
- ✅ Admin approve-olhat/decline-olhat paying guestet
- ✅ 90%+ test coverage a registration service-en

---

**FÁZIS 2: Payment & Ticketing - 5-7 nap**

**Célkitűzés:** Stripe payment + QR ticket generation + email delivery

**2.1 Stripe Integration (2-3 nap)**
- ✅ Payment táblázat migrációja (Payment model Prisma schemában)
- ✅ Stripe SDK setup (`lib/services/payment.ts`): Checkout Session creation
- ✅ Checkout API (`app/api/stripe/checkout/route.ts`): POST session creation
- ✅ Webhook API (`app/api/stripe/webhook/route.ts`): POST webhook handler (checkout.session.completed)
- ✅ Payment success page (`app/payment/success/page.tsx`): Confirmation screen
- ✅ Payment cancel page (`app/payment/cancel/page.tsx`): Retry button

**2.2 QR Code Ticketing (1-2 nap)**
- ✅ QR utility (`lib/utils/qr.ts`): JWT → QR PNG generation
- ✅ JWT utility (`lib/utils/jwt.ts`): Token sign/verify helpers
- ✅ Ticket email template (`lib/email-templates/ticket-delivery.tsx`): QR code attached
- ✅ Payment receipt template (`lib/email-templates/payment-receipt.tsx`)

**2.3 Bank Transfer Support (1 nap)**
- ✅ Payment dashboard (`app/admin/payments/page.tsx`): Filter by status
- ✅ Payment detail page (`app/admin/payments/[id]/page.tsx`): Manual "Mark as Paid" button
- ✅ Payment API (`app/api/admin/payments/[id]/route.ts`): PATCH payment status

**2.4 Email Automation (1 nap)**
- ✅ Email log táblázat migrációja (EmailLog model)
- ✅ Email service update: Log minden küldött email
- ✅ Email preview endpoint (`app/api/dev/email-preview/[template]/route.ts`): Dev tool email preview

**2.5 Testing (1 nap)**
- ✅ Unit tests: `tests/unit/services/payment.test.ts`
- ✅ Integration tests: `tests/integration/api/stripe.test.ts` (Stripe CLI webhook testing)
- ✅ E2E tests: `tests/e2e/payment.spec.ts` (full payment flow)
- ✅ Manual testing: Stripe test card (4242 4242 4242 4242), QR generation

**Fázis 2 Acceptance Criteria:**
- ✅ Guest checkout flow működik Stripe-pal
- ✅ Webhook automatikusan update-eli payment_status-t "paid"-re
- ✅ QR ticket emailben megérkezik payment után
- ✅ Bank transfer manual payment tracking működik
- ✅ Email log minden küldött emailt naplóz
- ✅ 80%+ test coverage payment logic-on

---

**FÁZIS 3: Check-in System - 4-5 nap**

**Célkitűzés:** Mobil QR scanner + check-in validáció + admin log viewer

**3.1 Check-in Database (1 nap)**
- ✅ Checkin táblázat migrációja (Checkin model, staff_id relation)
- ✅ Check-in service (`lib/services/checkin.ts`): QR validation logic

**3.2 Mobile QR Scanner (2-3 nap)**
- ✅ Check-in layout (`app/checkin/layout.tsx`): Mobile-optimized, no sidebar
- ✅ Scanner page (`app/checkin/page.tsx`): QR scanner UI
- ✅ Scanner component (`app/components/checkin/qr-scanner.tsx`): html5-qrcode wrapper
- ✅ Result component (`app/components/checkin/checkin-result.tsx`): Success/error display
- ✅ Check-in validate API (`app/api/checkin/validate/route.ts`): POST QR token validation
- ✅ Check-in manual API (`app/api/checkin/manual/route.ts`): POST admin manual check-in

**3.3 Admin Check-in Log (1 nap)**
- ✅ Check-in log page (`app/admin/checkin-log/page.tsx`): Real-time checkin list
- ✅ Export button: CSV export funkcionalitás

**3.4 Testing (1 nap)**
- ✅ Unit tests: `tests/unit/services/checkin.test.ts`
- ✅ E2E tests: `tests/e2e/checkin.spec.ts` (QR scan flow mock)
- ✅ Manual testing: Generate test QR code, scan with mobile

**Fázis 3 Acceptance Criteria:**
- ✅ Mobil QR scanner működik (camera access, real-time scanning)
- ✅ Valid QR code → sikeres check-in (checkin record created)
- ✅ Duplicate check-in → error message
- ✅ Unpaid guest → error message
- ✅ Admin manual check-in bypass működik
- ✅ Check-in log real-time frissül
- ✅ 100% E2E coverage check-in flow-ra

---

**FÁZIS 4: Seating Management - 5-7 nap**

**Célkitűzés:** Drag-and-drop seating map + table assignment + visual editor

**4.1 Table Management (1-2 nap)**
- ✅ Tables + TableAssignment táblák migrációja
- ✅ Seating service (`lib/services/seating.ts`): Assignment logic, capacity validation
- ✅ Table CRUD page (`app/admin/tables/page.tsx`): Table list + create/edit/delete
- ✅ Table API (`app/api/admin/tables/route.ts`): GET, POST, PATCH, DELETE

**4.2 Drag-and-Drop Seating Map (3-4 nap)**
- ✅ Seating map page (`app/admin/tables/seating-map/page.tsx`): Canvas layout
- ✅ Seating map component (`app/components/seating/seating-map.tsx`): DndContext setup
- ✅ Table item component (`app/components/seating/table-item.tsx`): Draggable table
- ✅ Guest list component (`app/components/seating/guest-list.tsx`): Unassigned guests
- ✅ Assignment API (`app/api/admin/assignments/route.ts`): POST bulk assignment
- ✅ @dnd-kit drag handlers: handleDragEnd, position updates

**4.3 Visual Layout Editor (1 nap)**
- ✅ Table position persistence (x_position, y_position in DB)
- ✅ Drag table to reposition functionality
- ✅ Seating chart export (PDF/image) - optional nice-to-have

**4.4 Testing (1 nap)**
- ✅ Unit tests: `tests/unit/services/seating.test.ts`
- ✅ E2E tests: `tests/e2e/seating.spec.ts` (drag-drop simulation)
- ✅ Manual testing: Drag 50 guests to 10 tables

**Fázis 4 Acceptance Criteria:**
- ✅ Admin create/edit/delete tables
- ✅ Drag guest card → drop on table → assignment saved
- ✅ Capacity validation: Table full → reject drop
- ✅ Visual table repositioning működik
- ✅ Unassigned guest list dynamically frissül
- ✅ 80%+ test coverage seating logic-on

---

**ÖSSZESÍTETT IDŐBECSLÉS:**
- Fázis 1: 7-10 nap
- Fázis 2: 5-7 nap
- Fázis 3: 4-5 nap
- Fázis 4: 5-7 nap
- **TOTAL: 21-29 nap (3-4 hét, 1 hónap befér!)**

### Testing Strategy

**Pragmatikus Hibrid ATDD Megközelítés** (szelektív alkalmazás)

A projekt **lightweight, szelektív ATDD** módszertant használ a kritikus, stakeholder-intensive flow-knál, kombinálva hagyományos Playwright E2E tesztekkel más fázisokban.

#### Fázisok és Testing Approach

| Fázis | Testing Approach | Tooling | Indoklás |
|-------|------------------|---------|----------|
| **Fázis 1: Registration** | Traditional E2E | Playwright (standard) | Egyszerű CRUD flow → ATDD overkill |
| **Fázis 2: Payment** | **ATDD (szelektív)** | **playwright-bdd + Gherkin** | Stakeholder collaboration kritikus (Stripe test scenarios) |
| **Fázis 3: Check-in** | **ATDD (szelektív)** | **playwright-bdd + Gherkin** | QR validation scenarios → business-readable tests |
| **Fázis 4: Seating** | Traditional E2E | Playwright (standard) | Visual drag-drop → ATDD nem ad hozzáadott értéket |

#### Tooling Stack

**E2E Testing:**
- **Playwright 1.44** - Fő E2E testing framework (headless + GUI mode)
- **playwright-bdd 8.4.1** - Gherkin syntax support ATDD fázisokhoz (Fázis 2 & 3)
- **@playwright/test** - Test runner minden fázishoz

**Unit/Integration Testing:**
- **Vitest 1.6** - Unit és integration tesztek
- **@testing-library/react 16.0** - React component testing

**Lokális vs CI/CD:**
- **Lokális fejlesztés:** Playwright GUI mode (`npx playwright test --ui`) → vizuális debugging
- **GitHub Actions CI:** Headless mode automatikus futtatás minden push-ra
- **VPS Production:** Opcionális headless smoke tesztek (nem kötelező)

#### ATDD Fázisok Részletes Stratégia

**Fázis 2: Payment & Ticketing (ATDD)**

Gherkin feature fájlok:
```gherkin
Feature: Stripe Payment Processing

  Scenario: Successful card payment (VIP free ticket)
    Given I am logged in as VIP guest "vip@ceogala.test"
    When I confirm attendance
    Then I immediately receive QR ticket via email
    And my registration status is "ticket_issued"

  Scenario: Successful card payment (Paid single ticket)
    Given I am logged in as paying guest "paying@ceogala.test"
    And I select "Single Ticket" (25,000 HUF)
    When I complete Stripe checkout with test card "4242424242424242"
    Then I see "Payment Successful" confirmation
    And I receive ticket email with QR code within 2 minutes
    And my payment status is "paid"

  Scenario: Failed card payment
    Given I am logged in as paying guest "paying@ceogala.test"
    When I complete Stripe checkout with declined card "4000000000000002"
    Then I see "Payment Failed" error message
    And my payment status remains "pending"
    And I do NOT receive ticket email

  Scenario: Bank transfer payment (manual approval)
    Given I am logged in as paying guest "bank@ceogala.test"
    When I select "Bank Transfer" payment method
    Then I see bank account details
    And my registration status is "awaiting_payment"
    When admin manually approves my payment
    Then I receive ticket email with QR code
    And my payment status is "paid"
```

**Fázis 3: Check-in System (ATDD)**

Gherkin feature fájlok:
```gherkin
Feature: QR Code Check-in Validation

  Scenario: Valid QR code - First check-in
    Given I am at check-in screen
    When I scan a valid QR code for guest "Kiss Anna"
    Then I see GREEN card with guest name "Kiss Anna"
    And I see ticket type "Paid Single"
    When I click "Check In" button
    Then check-in is recorded with timestamp
    And guest status is "checked_in"

  Scenario: Duplicate check-in attempt
    Given Guest "Tóth Gábor" is already checked in at "2025-01-15 18:30"
    When I scan QR code for "Tóth Gábor"
    Then I see YELLOW card with warning message
    And I see original check-in time "2025-01-15 18:30"
    And I see staff name "Staff Test User"
    And "Check In" button is disabled
    And "Admin Override" button is visible (admin role only)

  Scenario: Invalid/expired QR code
    Given I am at check-in screen
    When I scan an expired QR code
    Then I see RED card with error message "Invalid or expired QR code"
    And I see "Scan Again" button
```

#### Test Coverage Targets

| Layer | Coverage Target | Tools |
|-------|----------------|-------|
| **E2E (Critical Paths)** | 100% happy paths + key error scenarios | Playwright + playwright-bdd |
| **Unit Tests** | 80%+ business logic (services/) | Vitest |
| **Integration Tests** | 70%+ API routes | Vitest + Supertest |
| **Component Tests** | 60%+ React components | Vitest + Testing Library |

#### CI/CD Testing Pipeline

**GitHub Actions - Minden push → main/develop:**
1. ✅ Lint & Type Check (ESLint + TypeScript)
2. ✅ Unit & Integration Tests (Vitest)
3. ✅ E2E Tests (Playwright headless)
4. ✅ Ha minden teszt sikeres → Automatikus VPS deploy

**Lokális Fejlesztés:**
- Fejlesztés közben: `npm run dev` + Playwright GUI mode (`npm run test:ui`)
- Commit előtt: `npm test` (headless full suite)
- Debug: `npm run test:debug` (Playwright inspector)

#### Testing Timeline

- **Fázis 1 (7-10 nap):** ~15 Playwright E2E teszt (registration flow)
- **Fázis 2 (5-7 nap):** ~20 playwright-bdd scenario (payment + webhook)
- **Fázis 3 (4-5 nap):** ~15 playwright-bdd scenario (check-in validation)
- **Fázis 4 (5-7 nap):** ~10 Playwright E2E teszt (seating drag-drop)

**TOTAL:** ~60 E2E teszt + 100+ unit/integration teszt

#### Manual Testing Support

- **Seed Script:** `npm run db:seed` - 6 teszt guest, 2 admin user, 5 asztal
- **Prisma Studio:** `npx prisma studio` - Vizuális adatbázis böngésző (http://localhost:5555)
- **Test Credentials:**
  - Admin: admin@ceogala.test / Admin123!
  - Staff: staff@ceogala.test / Staff123!
  - VIP: vip1@ceogala.test (magic link: `test_hash_vip1@ceogala.test`)
- **Stripe Test Cards:**
  - Success: 4242424242424242
  - Declined: 4000000000000002
  - Insufficient funds: 4000000000009995

**Részletes ATDD kutatás:** [docs/research-atdd-testing-2025-11-27.md](research-atdd-testing-2025-11-27.md)

### Acceptance Criteria

#### Fázis 1: Core Registration (MVP)

**Funkcionális Követelmények:**
- ✅ CSV guest list import működik (email, name, guest_type validációval)
- ✅ Admin login működik (email/password, bcrypt hash)
- ✅ Magic link generálás működik (SHA-256 hash, 5 perc expiry)
- ✅ Magic link email küldés működik (SMTP/Resend integráció)
- ✅ VIP regisztráció működik (confirm → instant ticket)
- ✅ Paid regisztráció form működik (billing adatok, partner info gyűjtés)
- ✅ Guest list CRUD működik (létrehozás, szerkesztés, törlés, státusz update)
- ✅ Guest list filtering működik (kategória, státusz alapján)

**Technikai Követelmények:**
- ✅ Prisma migrations alkalmazva (8 tábla létrehozva)
- ✅ Seed script működik (test data populálás)
- ✅ Next.js dev server fut (localhost:3000)
- ✅ Environment variables beállítva (.env.local)
- ✅ ESLint + TypeScript type check pass

**Tesztelés:**
- ✅ 15+ Playwright E2E teszt pass (registration flow)
- ✅ Magic link validation test pass
- ✅ CSV import edge case test pass (duplikált email, invalid format)

#### Fázis 2: Payment & Ticketing

**Funkcionális Követelmények:**
- ✅ Stripe Checkout Session létrehozás működik (card payment)
- ✅ Stripe webhook működik (checkout.session.completed validation)
- ✅ QR code generálás működik (JWT token, HS256, 48h expiry)
- ✅ PDF e-ticket generálás működik (QR code embed)
- ✅ Ticket email delivery működik (Nodemailer/Resend)
- ✅ Bank transfer flow működik (manual admin approval)
- ✅ Payment status tracking működik (pending → paid → ticket_issued)

**Technikai Követelmények:**
- ✅ Stripe SDK integráció (Node.js)
- ✅ Webhook signature validation (STRIPE_WEBHOOK_SECRET)
- ✅ JWT secret management (QR_SECRET min 64 char)
- ✅ Email queue implementálva (nem blocking)

**Tesztelés (ATDD):**
- ✅ 20+ playwright-bdd scenario pass (Gherkin syntax)
- ✅ Stripe test card scenarios pass (4242, 0002, 9995)
- ✅ Webhook mock test pass (checkout.session.completed)
- ✅ QR code JWT verification test pass

#### Fázis 3: Check-in System

**Funkcionális Követelmények:**
- ✅ QR scanner működik (html5-qrcode library)
- ✅ QR validation működik (JWT verify, expiry check)
- ✅ Check-in recording működik (timestamp, staff user log)
- ✅ Duplicate prevention működik (UNIQUE constraint checkins.registration_id)
- ✅ Color-coded card display működik (GREEN/YELLOW/RED)
- ✅ Admin override működik (force check-in ha duplikáció)
- ✅ Check-in log viewer működik (admin dashboard)

**Technikai Követelmények:**
- ✅ Mobile-first UI (Tailwind responsive)
- ✅ Camera permission handling (browser API)
- ✅ JWT token verification (jsonwebtoken library)
- ✅ Real-time validation API (< 500ms response)

**Tesztelés (ATDD):**
- ✅ 15+ playwright-bdd scenario pass (check-in flow)
- ✅ Valid QR code test pass (GREEN card display)
- ✅ Duplicate check-in test pass (YELLOW card display)
- ✅ Expired QR code test pass (RED card display)
- ✅ Admin override test pass (role-based access)

#### Fázis 4: Seating Management

**Funkcionális Követelmények:**
- ✅ Table CRUD működik (létrehozás, szerkesztés, törlés)
- ✅ Guest-to-table assignment működik (manual)
- ✅ Paired ticket handling működik (2 seat reservation)
- ✅ CSV bulk assignment működik (guest_email, table_name mapping)
- ✅ Drag-and-drop seating map működik (@dnd-kit/core)
- ✅ Seating export működik (CSV letöltés)
- ✅ Capacity validation működik (túlfoglalás prevenciója)

**Technikai Követelmények:**
- ✅ @dnd-kit/core integráció (drag-drop library)
- ✅ React Server Components + Client Components helyes használat
- ✅ Optimistic UI updates (drag során)
- ✅ Visual seating map (pos_x, pos_y koordináták)

**Tesztelés:**
- ✅ 10+ Playwright E2E teszt pass (seating flow)
- ✅ Drag-drop interaction test pass
- ✅ Capacity overflow test pass
- ✅ CSV bulk import edge case test pass

#### Projekt Szintű Acceptance Criteria

**Teljesítmény:**
- ✅ Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- ✅ Átlagos API response time < 500ms (95th percentile)
- ✅ Átlagos DB query time < 100ms
- ✅ Page load time (LCP) < 2 másodperc

**Biztonság:**
- ✅ 100% prepared statements (SQL injection protection)
- ✅ XSS protection (htmlspecialchars/React escape)
- ✅ CSRF token minden POST form-ban
- ✅ Stripe webhook signature validation
- ✅ JWT secret min 64 char (QR_SECRET)
- ✅ bcrypt password hash cost=12
- ✅ HTTPS required production-ben (HSTS header)

**Deployment:**
- ✅ GitHub Actions CI/CD pipeline működik
- ✅ Playwright E2E tesztek pass minden commit-ra
- ✅ Automatikus VPS deploy működik (main branch)
- ✅ PM2 process manager konfigurálva
- ✅ Nginx reverse proxy konfigurálva
- ✅ Database migrations automatikusan futnak deploy során

**Dokumentáció:**
- ✅ README.md frissítve (quick start, deployment guide)
- ✅ DEPLOYMENT.md befejezve (lokális → VPS setup)
- ✅ ATDD research dokumentáció kész
- ✅ Tech-spec befejezve
- ✅ API dokumentáció frissítve

---

## Developer Resources

### File Paths Reference

**Next.js App Router Pages:**
```
app/
├── (auth)/                          # Authentication layout group
│   ├── register/                    # Magic link registration
│   │   └── page.tsx                # Registration form page
│   └── admin/
│       └── login/                   # Admin login
│           └── page.tsx            # Admin login form
├── admin/                           # Admin dashboard (authenticated)
│   ├── layout.tsx                  # Admin layout wrapper
│   ├── page.tsx                    # Dashboard home
│   ├── guests/                     # Guest management
│   │   ├── page.tsx               # Guest list view
│   │   ├── [id]/                  # Guest detail/edit
│   │   │   └── page.tsx
│   │   └── import/                # CSV import
│   │       └── page.tsx
│   ├── tables/                     # Table management
│   │   ├── page.tsx               # Table list
│   │   └── seating-map/           # Drag-drop seating map
│   │       └── page.tsx
│   └── checkin-log/                # Check-in reports
│       └── page.tsx
├── checkin/                         # Mobile check-in app
│   ├── page.tsx                    # QR scanner interface
│   └── scanner/
│       └── page.tsx
└── components/                      # React components
    ├── ui/                         # Reusable UI components
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Card.tsx
    │   └── Modal.tsx
    ├── seating/                    # Seating map components
    │   ├── SeatingMap.tsx          # Main drag-drop map (Client Component)
    │   ├── TableNode.tsx           # Draggable table component
    │   └── GuestAssignmentList.tsx
    ├── forms/                      # Form components
    │   ├── RegistrationForm.tsx
    │   ├── LoginForm.tsx
    │   └── CSVImportForm.tsx
    └── checkin/                    # Check-in components
        ├── QRScanner.tsx           # html5-qrcode wrapper
        ├── CheckinCard.tsx         # Color-coded card (GREEN/YELLOW/RED)
        └── GuestInfoDisplay.tsx
```

**API Routes:**
```
app/api/
├── registration/
│   ├── submit/
│   │   └── route.ts               # POST - Submit guest registration
│   └── partner/
│       └── route.ts               # POST - Add paired ticket partner
├── stripe/
│   ├── create-checkout/
│   │   └── route.ts               # POST - Create Stripe Checkout Session
│   └── webhook/
│       └── route.ts               # POST - Stripe webhook receiver
├── checkin/
│   ├── validate/
│   │   └── route.ts               # POST - Validate QR code JWT
│   └── submit/
│       └── route.ts               # POST - Record check-in event
└── admin/
    ├── guests/
    │   ├── route.ts               # GET - Guest list, POST - Create guest
    │   ├── [id]/
    │   │   └── route.ts           # PATCH - Update guest, DELETE - Delete guest
    │   ├── import/
    │   │   └── route.ts           # POST - CSV import
    │   └── approve-payment/
    │       └── route.ts           # PATCH - Manual bank transfer approval
    ├── tables/
    │   ├── route.ts               # GET - Table list, POST - Create table
    │   └── [id]/
    │       └── route.ts           # PATCH - Update table, DELETE - Delete table
    ├── table-assignments/
    │   ├── route.ts               # POST - Assign guest to table
    │   └── bulk/
    │       └── route.ts           # POST - Bulk CSV assignment
    ├── seating-export/
    │   └── route.ts               # GET - Export seating arrangement CSV
    └── checkin-log/
        └── route.ts               # GET - Check-in log with filters
```

**Business Logic Layer:**
```
lib/
├── services/                        # Business logic services
│   ├── registration.ts             # Registration flow logic
│   │   - generateMagicLink()
│   │   - validateMagicLink()
│   │   - processVIPRegistration()
│   │   - processPaidRegistration()
│   ├── payment.ts                  # Payment processing
│   │   - createStripeCheckoutSession()
│   │   - handleStripeWebhook()
│   │   - verifyWebhookSignature()
│   │   - processPaymentComplete()
│   ├── checkin.ts                  # Check-in logic
│   │   - validateQRCode()
│   │   - recordCheckin()
│   │   - checkDuplicate()
│   │   - adminOverride()
│   ├── seating.ts                  # Seating management
│   │   - assignGuestToTable()
│   │   - validateCapacity()
│   │   - exportSeatingCSV()
│   │   - bulkAssignFromCSV()
│   └── email.ts                    # Email delivery
│       - sendMagicLinkEmail()
│       - sendTicketEmail()
│       - sendConfirmationEmail()
│       - queueEmail()
├── db/                              # Database utilities
│   └── prisma.ts                   # Prisma client singleton
├── auth/                            # Authentication utilities
│   ├── magic-link.ts               # Magic link generation/validation
│   │   - generateHash()
│   │   - verifyHash()
│   │   - checkExpiry()
│   ├── session.ts                  # Admin session management
│   │   - createSession()
│   │   - validateSession()
│   │   - destroySession()
│   └── jwt.ts                      # JWT QR code tokens
│       - generateQRToken()
│       - verifyQRToken()
│       - checkTokenExpiry()
└── utils/                           # Helper functions
    ├── validation.ts               # Input validation (Zod schemas)
    ├── csv.ts                      # CSV parsing/generation
    ├── qrcode.ts                   # QR code generation wrapper
    └── date.ts                     # Date formatting utilities
```

**Database & Configuration:**
```
prisma/
├── schema.prisma                   # Database schema definition
├── migrations/                     # Migration history
│   └── YYYYMMDDHHMMSS_migration_name/
│       └── migration.sql
└── seed.ts                         # Database seed script

.github/workflows/
├── playwright-test.yml             # E2E testing CI
└── deploy-vps.yml                  # VPS deployment automation

scripts/
├── vps-initial-setup.sh            # VPS first-time setup
└── deploy-manual.sh                # Manual deployment script

docs/
├── FUNKCIONALIS-KOVETELMENY.md     # Functional requirements (997 lines)
├── tech-spec.md                    # This document
├── research-atdd-testing-2025-11-27.md  # ATDD research
├── research-technical-2025-11-27.md     # Technical stack research
└── DEPLOYMENT.md                   # Deployment guide
```

### Key Code Locations

**Magic Link Authentication:**
- `lib/auth/magic-link.ts` - Hash generation (SHA-256 + APP_SECRET)
- `lib/services/registration.ts:generateMagicLink()` - Magic link URL builder
- `lib/services/email.ts:sendMagicLinkEmail()` - Email delivery
- `app/(auth)/register/page.tsx` - Registration form (validates hash)

**Admin Authentication:**
- `lib/auth/session.ts` - Session cookie management (HttpOnly, Secure)
- `app/(auth)/admin/login/page.tsx` - Login form
- `app/api/auth/login/route.ts` - Login endpoint (bcrypt verification)
- `app/admin/layout.tsx` - Session validation middleware

**Payment Processing:**
- `lib/services/payment.ts:createStripeCheckoutSession()` - Stripe Checkout Session
- `app/api/stripe/webhook/route.ts` - Webhook receiver (signature validation)
- `lib/services/payment.ts:verifyWebhookSignature()` - Stripe signature check
- `lib/services/payment.ts:processPaymentComplete()` - Post-payment actions (QR generation)

**QR Code Generation:**
- `lib/auth/jwt.ts:generateQRToken()` - JWT token creation (HS256, 48h expiry)
- `lib/utils/qrcode.ts` - qrcode library wrapper (PNG generation)
- `lib/services/payment.ts:processPaymentComplete()` - Trigger after payment
- Payload: `{registration_id, guest_id, ticket_type, iat, exp}`

**Check-in Validation:**
- `app/checkin/page.tsx` - QR scanner UI (html5-qrcode)
- `app/api/checkin/validate/route.ts` - QR code validation endpoint
- `lib/services/checkin.ts:validateQRCode()` - JWT verification
- `lib/services/checkin.ts:checkDuplicate()` - Duplicate detection (UNIQUE constraint)
- `app/components/checkin/CheckinCard.tsx` - Color-coded display (GREEN/YELLOW/RED)

**Seating Management:**
- `app/admin/tables/seating-map/page.tsx` - Drag-and-drop seating map (@dnd-kit/core)
- `app/components/seating/SeatingMap.tsx` - Main map component (Client Component)
- `app/components/seating/TableNode.tsx` - Draggable table component
- `lib/services/seating.ts:assignGuestToTable()` - Assignment logic
- `lib/services/seating.ts:validateCapacity()` - Capacity overflow prevention

**Database Access:**
- `lib/db/prisma.ts` - Prisma client singleton (prevents multiple instances)
- `prisma/schema.prisma` - Schema definition (8 models)
- `prisma/seed.ts` - Test data seed script
- All queries use Prisma Client → 100% prepared statements (SQL injection safe)

**Email Delivery:**
- `lib/services/email.ts` - Nodemailer/Resend wrapper
- `lib/services/email.ts:queueEmail()` - Queue processing (non-blocking)
- Email templates stored in `lib/templates/` (HTML + plain text)

**CSV Processing:**
- `lib/utils/csv.ts` - CSV parsing/generation utilities
- `app/api/admin/guests/import/route.ts` - CSV guest import endpoint
- `lib/services/seating.ts:bulkAssignFromCSV()` - Bulk table assignment

**Security Utilities:**
- `lib/utils/validation.ts` - Zod schemas for input validation
- `lib/auth/jwt.ts` - JWT token utilities (sign/verify)
- `lib/auth/magic-link.ts` - Magic link hash utilities (SHA-256)
- Environment variables: `.env.local` (APP_SECRET, QR_SECRET, STRIPE_WEBHOOK_SECRET)

### Testing Locations

**Playwright E2E Tests:**
```
tests/e2e/
├── phase-1-registration/
│   ├── magic-link.spec.ts          # Magic link flow tests
│   ├── admin-login.spec.ts         # Admin authentication
│   ├── guest-crud.spec.ts          # Guest management CRUD
│   └── csv-import.spec.ts          # CSV import edge cases
├── phase-2-payment/                 # ATDD with playwright-bdd
│   ├── stripe-payment.feature      # Gherkin scenarios
│   ├── bank-transfer.feature       # Manual payment scenarios
│   ├── ticket-generation.feature   # QR ticket generation
│   └── steps/                      # Step definitions
│       ├── payment.steps.ts
│       ├── ticket.steps.ts
│       └── common.steps.ts
├── phase-3-checkin/                 # ATDD with playwright-bdd
│   ├── qr-validation.feature       # QR scanner scenarios
│   ├── duplicate-checkin.feature   # Duplicate prevention
│   ├── admin-override.feature      # Override scenarios
│   └── steps/
│       ├── checkin.steps.ts
│       └── scanner.steps.ts
├── phase-4-seating/
│   ├── table-crud.spec.ts          # Table management
│   ├── drag-drop.spec.ts           # Seating map interactions
│   ├── capacity-validation.spec.ts # Overflow prevention
│   └── csv-assignment.spec.ts      # Bulk assignment
└── fixtures/                        # Test data fixtures
    ├── test-guests.json
    ├── test-tables.json
    └── test-cards.ts               # Stripe test cards
```

**Vitest Unit/Integration Tests:**
```
tests/unit/
├── services/
│   ├── registration.test.ts        # Registration service tests
│   ├── payment.test.ts             # Payment service tests
│   ├── checkin.test.ts             # Check-in service tests
│   └── seating.test.ts             # Seating service tests
├── auth/
│   ├── magic-link.test.ts          # Magic link utilities
│   ├── jwt.test.ts                 # JWT token utilities
│   └── session.test.ts             # Session management
├── utils/
│   ├── validation.test.ts          # Zod schema validation
│   ├── csv.test.ts                 # CSV parsing/generation
│   └── qrcode.test.ts              # QR code generation
└── api/
    ├── registration.test.ts        # Registration API routes
    ├── stripe-webhook.test.ts      # Stripe webhook handling
    ├── checkin.test.ts             # Check-in API routes
    └── admin-guests.test.ts        # Admin CRUD endpoints
```

**Component Tests:**
```
tests/components/
├── forms/
│   ├── RegistrationForm.test.tsx
│   ├── LoginForm.test.tsx
│   └── CSVImportForm.test.tsx
├── seating/
│   ├── SeatingMap.test.tsx
│   ├── TableNode.test.tsx
│   └── GuestAssignmentList.test.tsx
└── checkin/
    ├── QRScanner.test.tsx
    ├── CheckinCard.test.tsx
    └── GuestInfoDisplay.test.tsx
```

**Test Configuration:**
- `playwright.config.ts` - Playwright configuration (headless/GUI, browsers, timeouts)
- `vitest.config.ts` - Vitest configuration (coverage, test environment)
- `tests/helpers/` - Test utilities (database setup, mock factories)
- `tests/fixtures/` - Shared test data and fixtures

### Documentation to Update

**Documentation Updates During Implementation:**

1. **README.md** (már frissítve)
   - Quick start guide ✅
   - Development commands ✅
   - Testing strategy overview ✅
   - Deployment guide link ✅

2. **DEPLOYMENT.md** (már frissítve)
   - Lokális environment setup ✅
   - GitHub Actions CI/CD setup ✅
   - VPS deployment steps ✅
   - Troubleshooting guide ✅

3. **API.md** (létrehozandó)
   - Minden API endpoint dokumentáció
   - Request/response példák
   - Error code referencia
   - Authentication headers

4. **TESTING.md** (létrehozandó)
   - Playwright E2E test írási útmutató
   - playwright-bdd Gherkin syntax guide
   - Test data fixtures használat
   - CI/CD pipeline részletek

5. **SECURITY.md** (létrehozandó)
   - Magic link implementáció részletek
   - JWT token management best practices
   - Stripe webhook signature validation
   - Environment variable management

6. **CHANGELOG.md** (létrehozandó)
   - Version history tracking
   - Feature additions per phase
   - Bug fixes log
   - Breaking changes

**Inline Code Documentation:**
- JSDoc comments minden service function-höz
- Type definitions minden API endpoint-hoz
- Prisma schema comments minden model-hez
- Component props documentation (React)

---

## UX/UI Considerations

### Design Principles

**Mobile-First Responsive Design:**
- Tailwind CSS utility classes
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Check-in app optimalizálva 5-6" phone screen-re
- Touch targets minimum 44x44px (Apple HIG, WCAG 2.1 AA)
- Drag-drop seating map desktop-optimalizált, tablet fallback

**Accessibility (WCAG 2.1 AA):**
- Color contrast ratio min 4.5:1 (text), 3:1 (UI components)
- Keyboard navigation minden interaktív elemen
- ARIA labels form input-okon
- Screen reader támogatás (semantic HTML)
- Focus indicators (outline ring-2 ring-blue-500)

**Color-Coded Check-in System:**
- **GREEN Card**: Valid ticket → Proceed to check-in (bg-green-100, border-green-500, text-green-900)
- **YELLOW Card**: Duplicate attempt → Admin override required (bg-yellow-100, border-yellow-500, text-yellow-900)
- **RED Card**: Invalid/expired QR → Rescan (bg-red-100, border-red-500, text-red-900)

**Form Design:**
- Single-column layout (mobile-first)
- Progressive disclosure (show partner fields csak ha paired ticket)
- Inline validation (Zod schema + real-time feedback)
- Clear error messages (magyar nyelv, user-friendly)
- Loading states minden async action-nél (spinner + disabled button)

**Admin Dashboard:**
- Clean data table layout (@tanstack/react-table vagy native table)
- Filter/search bar sticky header (top-0 sticky)
- Pagination (10/25/50 items per page)
- Bulk actions (select multiple guests → assign table)
- Export buttons (CSV download)

**Drag-and-Drop Seating Map:**
- Visual feedback durante drag (shadow + opacity change)
- Snap-to-grid optional (pos_x, pos_y 10px increments)
- Collision detection (nem lehet átfedés)
- Capacity indicator (X/Y seats filled, color-coded: green<80%, yellow 80-99%, red 100%)
- Undo/redo stack (Ctrl+Z, Ctrl+Y)

**Email Templates:**
- Responsive HTML + plain text fallback
- QR code embed (PNG, 300x300px)
- Magyar nyelv, formális tónus
- Clear CTA buttons (e.g., "Regisztráció folytatása")

### Performance Targets

- **Lighthouse Score:** > 90 (Performance, Accessibility, Best Practices)
- **LCP (Largest Contentful Paint):** < 2 másodperc
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **API Response Time:** < 500ms (95th percentile)
- **Database Query Time:** < 100ms átlag

---

## Testing Approach

**Testing Strategy Overview:**

Lásd **Testing Strategy** szekciót fentebb (1933. sortól) a teljes részletekért. Összefoglalva:

**1. Hybrid ATDD Megközelítés:**
- Fázis 1 (Registration): Traditional Playwright E2E
- Fázis 2 (Payment): **ATDD** (playwright-bdd + Gherkin)
- Fázis 3 (Check-in): **ATDD** (playwright-bdd + Gherkin)
- Fázis 4 (Seating): Traditional Playwright E2E

**2. Testing Piramis:**
```
        E2E (Playwright)
         /          \
        /   ~60      \
       /     tests    \
      /________________\
     Integration (Vitest)
    /                  \
   /      ~100          \
  /        tests         \
 /________________________\
Unit Tests (Vitest)
    ~200+ tests
```

**3. Lokális vs CI/CD:**
- **Lokális:** Playwright GUI mode (`npm run test:ui`) → vizuális debugging
- **CI/CD:** Headless mode GitHub Actions → automatikus minden push-ra

**4. Test Coverage Goals:**
- E2E: 100% critical paths + key error scenarios
- Unit: 80%+ business logic (services/)
- Integration: 70%+ API routes
- Component: 60%+ React components

**5. Manual Testing Support:**
- Seed script (`npm run db:seed`) → 6 guest, 2 admin, 5 asztal
- Prisma Studio → vizuális DB browser
- Stripe test cards (4242, 0002, 9995)

---

## Deployment Strategy

### Deployment Steps

**Teljes deployment guide:** [docs/DEPLOYMENT.md](DEPLOYMENT.md)

**Automatikus GitHub Actions CI/CD Pipeline:**

1. **Trigger:** Push to `main` branch
2. **CI Phase (GitHub Actions runner):**
   ```yaml
   - Checkout code
   - Setup Node.js 18
   - npm install
   - Lint & Type Check (ESLint + tsc)
   - Unit/Integration Tests (Vitest)
   - E2E Tests (Playwright headless + MySQL test DB)
   ```
3. **CD Phase (ha CI pass):**
   ```yaml
   - SSH to Hostinger VPS
   - git pull origin main
   - npm install (production dependencies)
   - npx prisma migrate deploy (apply migrations)
   - npm run build (Next.js production build)
   - pm2 restart ceog-gala (zero-downtime restart)
   - Health check (curl http://localhost:3000/api/health)
   ```

**Manual Deployment (fallback):**

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Navigate to project
cd /var/www/CEOG-1

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Database migrations
npx prisma migrate deploy

# Build Next.js
npm run build

# Restart PM2
pm2 restart ceog-gala

# Check status
pm2 status
pm2 logs ceog-gala --lines 50
```

**Pre-Deployment Checklist:**

- [ ] All E2E tests pass locally (`npm run test`)
- [ ] Prisma migrations generated (`npx prisma migrate dev`)
- [ ] Environment variables up-to-date in VPS `.env.production`
- [ ] Database backup created (`mysqldump ceog_prod > backup_$(date +%F).sql`)
- [ ] Stripe webhook endpoint updated (production URL)
- [ ] Email SMTP credentials configured (production)

**First-Time VPS Setup:**

```bash
# Run initial setup script (once only)
bash scripts/vps-initial-setup.sh

# Script performs:
# - Node.js 18+ installation (nvm)
# - MySQL 8.0 installation + database creation
# - PM2 + Nginx installation
# - SSL certificate (Certbot Let's Encrypt)
# - Project clone + initial build
```

### Rollback Plan

**Rollback Strategy (ha deploy fail vagy critical bug):**

**1. Immediate Rollback (< 5 perc):**

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Rollback git to previous commit
cd /var/www/CEOG-1
git log --oneline -n 10  # Identify previous working commit
git reset --hard <PREVIOUS_COMMIT_HASH>

# Rollback database migrations (ha volt migration)
npx prisma migrate resolve --rolled-back <MIGRATION_NAME>

# Rebuild & restart
npm run build
pm2 restart ceog-gala

# Verify
curl http://localhost:3000/api/health
pm2 logs ceog-gala --lines 50
```

**2. Database Rollback (ha adatsérülés):**

```bash
# Restore from latest backup
mysql -u ceog_user -p ceog_prod < /var/backups/backup_2025-11-27.sql

# Rollback migrations to match code
npx prisma migrate resolve --rolled-back <MIGRATION_NAME>
```

**3. GitHub Actions Rollback:**

- Revert commit on GitHub (Create revert PR)
- Merge revert PR → automatikus redeploy előző verzióra
- Alternatív: Manually trigger previous workflow run (GitHub Actions UI)

**4. Blue-Green Deployment (opcionális future enhancement):**

- Jelenleg nincs implementálva (PM2 single process)
- Future: PM2 cluster mode (2+ processes) → zero-downtime rolling restart
- Future: Nginx load balancing két Next.js instance között

**Rollback Testing:**

- Rollback procedure tesztelése staging environment-ben (ha van)
- Database backup restore tesztelése heti rendszerességgel
- Git rollback gyakorlat minden major release előtt

**Post-Rollback Actions:**

1. Notify stakeholders (email/Slack)
2. Create incident report (JIRA/GitHub Issue)
3. Root cause analysis meeting
4. Fix bug in separate branch
5. Thorough testing before re-deploy

### Monitoring

**Production Monitoring Strategy:**

**1. Application Monitoring:**

- **PM2 Built-in Monitoring:**
  ```bash
  pm2 monit              # Real-time CPU/Memory monitor
  pm2 logs ceog-gala     # Live logs
  pm2 status             # Process status
  ```

- **Custom Health Check Endpoint:**
  ```typescript
  // app/api/health/route.ts
  export async function GET() {
    const dbCheck = await prisma.$queryRaw`SELECT 1`;
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbCheck ? 'connected' : 'disconnected'
    });
  }
  ```

- **Uptime Monitoring (external):**
  - **UptimeRobot** (free tier) → ping health endpoint every 5 min
  - Email/SMS alert ha downtime > 2 perc

**2. Database Monitoring:**

- MySQL slow query log (queries > 1 másodperc)
  ```sql
  SET GLOBAL slow_query_log = 'ON';
  SET GLOBAL long_query_time = 1;
  ```

- Prisma query logging (development only):
  ```typescript
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  ```

- Database backup monitoring (daily cron job)
  ```bash
  0 2 * * * /usr/bin/mysqldump ceog_prod > /var/backups/ceog_$(date +\%F).sql
  ```

**3. Error Tracking:**

- **Console.error logging** → PM2 logs (`pm2 logs ceog-gala --err`)
- **Future enhancement:** Sentry.io integration (error tracking SaaS)
  ```typescript
  import * as Sentry from "@sentry/nextjs";
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  ```

**4. Performance Monitoring:**

- **Lighthouse CI** (GitHub Actions) → automatikus performance report minden deploy után
- **Next.js built-in metrics:**
  ```typescript
  export function reportWebVitals(metric) {
    console.log(metric); // LCP, FID, CLS, FCP, TTFB
  }
  ```

**5. Security Monitoring:**

- **Nginx access logs** → monitor suspicious activity
  ```bash
  tail -f /var/log/nginx/access.log | grep -E "(POST|DELETE|PATCH)"
  ```

- **Failed login attempts** → log to database (email_logs tábla)
- **Stripe webhook signature failures** → alert admin (email)

**6. Business Metrics Dashboard (Admin):**

- Guest registration count (daily/weekly chart)
- Payment success rate (Stripe vs bank transfer)
- Check-in velocity (guests/hour during event)
- Email delivery success rate

**Alert Thresholds:**

- ⚠️ **Warning:** API response time > 500ms (95th percentile)
- 🚨 **Critical:** Downtime > 2 perc
- 🚨 **Critical:** Database connection失败
- ⚠️ **Warning:** Stripe webhook signature validation fail
- 🚨 **Critical:** Email delivery failure rate > 10%

**Monitoring Stack Összefoglaló:**

| Réteg | Tool | Purpose |
|-------|------|---------|
| **Uptime** | UptimeRobot | External health check ping |
| **Process** | PM2 monit | CPU/Memory/Restart count |
| **Logs** | PM2 logs | Application logs (stdout/stderr) |
| **Database** | MySQL slow query log | Performance bottleneck detection |
| **Errors** | Console.error (future: Sentry) | Exception tracking |
| **Performance** | Lighthouse CI + Next.js metrics | Web Vitals monitoring |
| **Security** | Nginx logs + failed auth tracking | Suspicious activity detection |

**Monitoring Dashboard (future enhancement):**
- Grafana + Prometheus stack
- Real-time metrics visualization
- Custom alerts (Slack/Email integration)
