# Architektúra Dokumentáció - CEO Gala Regisztrációs Rendszer

**Generálva:** 2026-02-15 | **Frissítve:** 2026-03-22
**Verzió:** 4.1.0
**Típus:** Monolith Full-Stack Web Alkalmazás

---

## 1. Architektúra Áttekintés

### 1.1 Magas Szintű Architektúra

```
┌──────────────────────────────────────────────────────────────────┐
│                           Kliensek                               │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│  Admin   │  Staff   │  Vendég  │  PWA     │Jelentkező│  Display │
│ Dashboard│ Check-in │ Register │  App     │  Form    │  Screen  │
└──────┬───┴────┬─────┴────┬─────┴───┬──────┴────┬─────┴────┬─────┘
       │        │          │         │           │          │
       ▼        ▼          ▼         ▼           ▼          ▼
┌──────────────────────────────────────────────────────────────────┐
│               Nginx Reverse Proxy (SSL)                          │
│               HSTS, CSP, X-Frame-Options                         │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                     Next.js 14+                                   │
│                   (App Router)                                    │
├──────────────────────────────────────────────────────────────────┤
│  Middleware Layer                                                 │
│  ├── Auth Protection (NextAuth JWT)                              │
│  ├── CSRF Validation (Origin/Referer)                            │
│  └── Role-Based Access Control (admin/staff)                     │
├──────────────────────────────────────────────────────────────────┤
│  Presentation Layer                                               │
│  ├── Server Components (alapértelmezett, zero JS)                │
│  ├── Client Components ('use client' - interaktív)               │
│  └── Layouts (Root, Admin, PWA, Checkin, Display)                │
├──────────────────────────────────────────────────────────────────┤
│  API Layer (app/api/**/route.ts)                                  │
│  ├── Admin endpoints (~55+, auth required)                       │
│  ├── Registration endpoints (publikus + magic link)              │
│  ├── Payment endpoints (Stripe + refund)                         │
│  ├── Check-in endpoints (staff + admin)                          │
│  ├── PWA endpoints (guest auth code + SSE)                       │
│  └── SSE streaming (display + PWA events)                        │
├──────────────────────────────────────────────────────────────────┤
│  Business Logic Layer (lib/services/)                             │
│  ├── Registration Service                                        │
│  ├── Payment Service (Stripe SDK)                                │
│  ├── Email Service (Nodemailer + retry + rate limit)             │
│  ├── Check-in Service (QR validation)                            │
│  ├── Seating Service (table assignment)                          │
│  ├── Event Broadcaster Service (SSE pub/sub)                     │
│  ├── Audit Service (action logging)                              │
│  └── Scheduler Service (node-cron)                               │
├──────────────────────────────────────────────────────────────────┤
│  Data Access Layer                                                │
│  └── Prisma ORM (singleton client)                               │
└──────────────────────────┬───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                     MySQL 8.0+                                    │
│               16 modell, 11 enum                                 │
└──────────────────────────────────────────────────────────────────┘

Külső Szolgáltatások:
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Stripe     │ │    SMTP      │ │  Firebase    │
│  (fizetés)   │ │   (email)    │ │  (push FCM)  │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 1.2 Alkalmazás Rétegei

| Réteg | Technológia | Felelősség |
|-------|-------------|------------|
| **Proxy** | Nginx + Let's Encrypt | SSL termination, static file serving, reverse proxy |
| **Middleware** | Next.js Middleware | Auth, CSRF, role-based access control |
| **Prezentáció** | React 18 (Server/Client) | UI renderelés, interaktivitás |
| **API** | Next.js Route Handlers | REST endpoints, SSE streaming, request/response kezelés |
| **Üzleti logika** | lib/services/ | Domain logika, validáció, integráció, event broadcasting |
| **Adat hozzáférés** | Prisma ORM | Adatbázis műveletek, migrációk |
| **Adatbázis** | MySQL 8.0 | Perzisztens adattárolás |
| **Process Manager** | PM2 | Standalone Next.js szerver kezelés |

## 2. Authentikáció és Biztonság

### 2.1 Háromféle Auth Megközelítés

```
1. Admin/Staff Bejelentkezés (NextAuth.js)
   ├── CredentialsProvider (email + password)
   ├── JWT session stratégia (8 óra)
   ├── bcrypt jelszó hash
   └── Role-based middleware (admin vs staff)

2. Vendég Magic Link Auth
   ├── SHA-256 hash (email + APP_SECRET + timestamp)
   ├── 24 óra lejárat
   ├── Egyszeri használat (cleared after registration)
   └── Rate limit: max 5/típus/óra, 20/összesen/óra

3. PWA Auth Code
   ├── Format: CEOG-XXXXXX (6 alfanumerikus)
   ├── pwa_auth_code mező a Guest táblában
   └── Vendég-specifikus, nincs lejárat
```

### 2.2 CSRF Védelem

```typescript
// middleware.ts - CSRF validáció
// Nem-safe metódusokra (POST, PATCH, DELETE):
// 1. Origin header ellenőrzés az expected host-tal
// 2. Referer header fallback
// 3. Kivételek:
//    - Stripe webhook (signature-based)
//    - Next.js belső fetchek (x-nextjs-data header)
//    - Server-side fetchek (origin nélkül)
```

### 2.3 Security Headers (next.config.js)

| Header | Érték | Cél |
|--------|-------|-----|
| X-Frame-Options | SAMEORIGIN | Clickjacking védelem |
| X-Content-Type-Options | nosniff | MIME sniffing tiltás |
| X-XSS-Protection | 1; mode=block | XSS védelem (legacy) |
| Strict-Transport-Security | max-age=31536000 | HTTPS kikényszerítés |
| Content-Security-Policy | (részletes) | Script/style/connect korlátozás |
| Permissions-Policy | camera=(self) | Kamera QR szkennerhez |
| Referrer-Policy | strict-origin-when-cross-origin | Referrer korlátozás |

### 2.4 Role-Based Access Control

| Funkció | Admin | Staff |
|---------|-------|-------|
| Admin Dashboard (teljes) | ✅ | ❌ → /checkin redirect |
| Vendég CRUD + Import | ✅ | ❌ |
| Jelentkező Kezelés | ✅ | ❌ |
| Fizetés Jóváhagyás + Visszatérítés | ✅ | ❌ |
| Asztal + Ültetés | ✅ | ❌ |
| Email Küldés | ✅ | ❌ |
| QR Szkenner | ✅ (override-dal) | ✅ (basic) |
| Check-in Napló | ✅ | ✅ (csak olvasás) |
| Admin Override | ✅ | ❌ |
| Live Seating Display | ✅ | ❌ |

## 3. Adatarchitektúra

### 3.1 Adatbázis

- **Motor:** MySQL 8.0+
- **ORM:** Prisma ^5.19.0
- **Modellek:** 16 modell + 11 enum
- **Kapcsolódás:** Singleton pattern (`lib/db/prisma.ts`)

### 3.2 Fő Entitás Kapcsolatok

```
Guest (1) ──── (0..1) Registration
  │                      │
  │                      ├── (0..1) Payment
  │                      ├── (0..1) BillingInfo
  │                      └── (0..1) Checkin
  │
  ├── (0..*) TableAssignment ──── Table
  ├── (0..*) EmailLog
  └── (0..1) Guest [paired_with - önhivatkozó]

User ──── (0..*) Checkin [staff_user]

EmailTemplate (standalone)
SchedulerConfig (standalone)
ScheduledEmail (standalone, opcionális guest_id)
RateLimitEntry (standalone)
AuditLog (standalone, opcionális user_id)
TestResult ──── User [tester]
```

### 3.3 Legutóbbi Séma Változások (v4.x)

| Változás | Típus | Leírás |
|----------|-------|--------|
| `Guest.is_vip_reception` | Boolean (default: false) | VIP fogadás jelölő — a check-in szkenner VIP badge-je ezen alapul (NEM `guest_type`) |
| `Payment.stripe_payment_intent_id` | String (opcionális) | Stripe PaymentIntent ID visszatérítésekhez |
| `TestResult` modell | Új tábla | Manuális teszteredmény követés (version, feature_index, status, step_results JSON) |
| `RegistrationStatus` enum | Bővítve | Új érték: `checked_in` — check-in utáni státusz |

Részletes séma: [data-models.md](./data-models.md)

## 4. API Architektúra

### 4.1 Endpoint Kategóriák

**Összesen: ~83 HTTP endpoint ~62 route fájlban**

| Kategória | Prefix | Auth | Endpoint-ek |
|-----------|--------|------|-------------|
| Admin | `/api/admin/*` | Admin session | ~55+ |
| Regisztráció | `/api/registration/*` | Publikus | 5 |
| Stripe | `/api/stripe/*` | Publikus / webhook | 3 |
| Check-in | `/api/checkin/*` | Admin/Staff | 2 |
| PWA | `/api/pwa/*` | Guest auth code | 7+ |
| Auth | `/api/auth/*` | Publikus | NextAuth |
| Egyéb | `/api/apply`, `/api/health` | Publikus | 2+ |

### 4.2 Új API Endpoint-ek (v4.x)

| Endpoint | Metódus | Leírás |
|----------|---------|--------|
| `/api/admin/display-stream` | GET (SSE) | Real-time check-in frissítések a Display Screen-hez |
| `/api/admin/seating-display-data` | GET | Teljes ültetési adat a live display-hez |
| `/api/admin/tables/[id]/position` | PATCH | Asztal pozíció frissítés (floor plan) |
| `/api/admin/table-assignments/bulk` | POST | Tömeges asztalhoz rendelés |
| `/api/admin/seating-stats` | GET | Ültetési statisztikák (foglaltság, szabad helyek) |
| `/api/admin/payments/[id]/refund` | POST | Stripe visszatérítés indítása |
| `/api/admin/email-templates/[slug]/preview` | POST | Email sablon előnézet renderelés |
| `/api/admin/scheduler-config` | GET/POST | Ütemező konfiguráció kezelés |
| `/api/admin/scheduler-config/[id]` | PATCH/DELETE | Egyedi ütemező konfig módosítás/törlés |
| `/api/admin/test-results` | GET/POST | Teszteredmények listázás/mentés |
| `/api/admin/test-results/[id]` | DELETE | Teszteredmény törlés |
| `/api/pwa/events` | GET (SSE) | Real-time események a PWA alkalmazáshoz |

### 4.3 API Design Minták

- **Konvenció:** `route.ts` fájlok Next.js App Router-ben
- **HTTP metódusok:** Named export functions (GET, POST, PATCH, DELETE)
- **Validáció:** Zod sémák (`lib/validations/`)
- **Hibakezelés:** try/catch + NextResponse.json({ error })
- **Lapozás:** Query params (page, limit, search, sortBy, sortOrder)
- **CSRF:** Middleware-szintű Origin/Referer validáció
- **SSE streaming:** ReadableStream + TextEncoder, Server-Sent Events protokoll

## 5. Frontend Architektúra

### 5.1 Renderelési Stratégiák

| Típus | Használat | Példa |
|-------|-----------|-------|
| **Server Component** (alapértelmezett) | Adatlekérdezés, SEO, statikus tartalom | Oldalak (`page.tsx`), Layout-ok |
| **Client Component** (`'use client'`) | Interaktivitás, state, event handling | Formok, DnD, QR szkenner, Display |

**Komponens szám:** ~90+ React komponens

### 5.2 Component Hierarchia

```
Root Layout (app/layout.tsx)
├── GlobalProviders (ThemeProvider, SessionProvider)
│
├── Admin Layout (app/admin/layout.tsx)
│   ├── Providers (LanguageContext)
│   ├── AdminHeader (desktop nav)
│   ├── MobileTabBar (mobil nav)
│   └── [Admin Pages]
│       └── Seating (dual-mode: Grid View + Floor Plan View)
│
├── PWA Layout (app/pwa/layout.tsx)
│   ├── ThemeProvider (PWA-specifikus)
│   ├── SSE EventSource (/api/pwa/events)
│   └── [PWA Pages]
│
├── Checkin Layout (app/checkin/layout.tsx)
│   └── CheckinScanner (CEO Gala dark-blue theme)
│
├── Display Layout (app/display/)
│   └── SeatingDisplay (full-screen, SSE real-time)
│
└── Registration Pages (app/register/)
    ├── VIP flow (ingyenes)
    ├── Paid flow (billing + Stripe)
    └── Request Link flow
```

### 5.3 Új Funkciók Részletezése

#### 5.3.1 Live Seating Display (`/display/seating`)

Valós idejű ülésrend megjelenítő helyszíni nagy képernyőkhöz.

```
Architektúra:
┌──────────────┐     SSE stream      ┌──────────────────┐
│  Check-in    │ ──── broadcast ───→ │  Display Screen   │
│  Scanner     │                     │  /display/seating │
└──────┬───────┘                     └──────────────────┘
       │                                      ▲
       ▼                                      │
┌──────────────┐                     ┌────────┴─────────┐
│ event-       │ ──── SSE push ───→  │  EventSource     │
│ broadcaster  │                     │  /api/admin/      │
│ .ts          │                     │  display-stream   │
└──────────────┘                     └──────────────────┘
```

- **Admin-only access** — full-screen háttérkép overlay
- **24 asztal pozíció** kalibrálva a helyszín alaprajzához
- **Vendég státusz megjelenítés:** szürke italic (nem érkezett) → fekete bold (megérkezett)
- **Counter:** `{checkedIn}/{totalAssigned} CHECKED IN`
- **Háttérkép:** `ceo_gala_asztalterv_FINAL_ures_1.png` (1920x1280, 3:2 aspect ratio)
- **Tipográfia:** Futura font
- **Table mapping:** `Table.name` → `parseInt()` → CSS grid pozíció

#### 5.3.2 Check-in Scanner Redesign (`/checkin`)

CEO Gala arculathoz igazított sötétkék design.

| Elem | Érték |
|------|-------|
| Háttér | Dark-blue gradient (`#0a1628` → `#162447`) |
| Akcentus | Gold (`#d4af37`) |
| Gombok | Burgundy (`#722f37`) |
| VIP badge | `is_vip_reception` mező alapján (NEM `guest_type`) |
| Vendég infó | Asztal, VIP, diéta, partner — check-in ELŐTT ÉS UTÁN is látható |
| Event broadcast | Check-in → display screen + PWA frissítés SSE-n keresztül |

#### 5.3.3 Seating Management Redesign (`/admin/seating`)

Dual-mode ültetéskezelő felület.

```
┌─────────────────────────────────────────────┐
│  Ültetés Kezelő                              │
├──────────────┬──────────────────────────────┤
│  Grid View   │  Floor Plan View             │
│  (kártyák +  │  (Konva canvas +             │
│   DnD)       │   háttérkép)                 │
├──────────────┴──────────────────────────────┤
│  Közös funkciók:                             │
│  ├── Globális keresés (vendég/asztal)        │
│  ├── Filter chips (All/Available/Full/Empty) │
│  ├── Sort opciók                             │
│  ├── Inline asztal szerkesztés               │
│  └── VIP/Standard szekciók                   │
└─────────────────────────────────────────────┘
```

- **Grid View:** Asztal kártyák + @dnd-kit drag-and-drop vendég hozzárendelés
- **Floor Plan View:** React-Konva canvas háttérkép overlay-jel, heatmap, spotlight keresés, auto-arrange, zoom/pan
- **Szín kódolás:** Asztal keretek foglaltság szerint (szürke→kék→zöld→piros), vendég státusz pöttyök
- **Bulk assignment:** Tömeges asztalhoz rendelés API (`POST /api/admin/table-assignments/bulk`)

### 5.4 State Management

| Pattern | Technológia | Használat |
|---------|-------------|-----------|
| **Server State** | Prisma (server components) | Adatlekérdezés, SEO oldalak |
| **Client State** | React useState/useReducer | Form state, UI state |
| **Context** | React Context API | i18n (LanguageContext), Theme (ThemeProvider) |
| **Auth State** | NextAuth/useSession | Admin session |
| **URL State** | searchParams | Szűrők, lapozás |
| **Local Storage** | localStorage | Nyelv beállítás, dark mode |
| **SSE State** | EventSource | Real-time check-in (Display, PWA) |
| **Custom Hooks** | useGuestList, useSeatingDnd, useTheme, useToast, useHaptic | Domain-specifikus logika |

### 5.5 Styling

- **Tailwind CSS** ^3.4.0 - Utility-first
- **tailwind-merge** - Osztály összeolvasztás
- **clsx** - Feltételes osztályok
- **Framer Motion** ^12.23.25 - Animációk
- **Phosphor Icons** (@phosphor-icons/react) - Ikonok
- **Mobile-first** - Responsive design, min 44x44px touch targets
- **CEO Gala arculat** - Dark-blue/gold/burgundy téma (scanner, display)

## 6. Külső Integráció

### 6.1 Stripe (Fizetés)

```
Fizetési Folyamat:
1. Client → POST /api/stripe/create-checkout (session létrehozás)
2. Client → Stripe Checkout redirect (Stripe hosted UI)
3. Stripe → POST /api/stripe/webhook (fizetés visszaigazolás)
   └── Webhook signature validáció (STRIPE_WEBHOOK_SECRET)
4. Client → GET /payment/success (redirect siker oldal)

Visszatérítés:
1. Admin → POST /api/admin/payments/{id}/refund
2. Server → Stripe Refund API (stripe_payment_intent_id alapján)
3. Payment.status → refunded

Támogatott módok:
- Kártyás fizetés (Stripe Checkout Session)
- Banki átutalás (manuális admin jóváhagyás)
- Visszatérítés (Stripe Refund, admin indítja)
```

### 6.2 Nodemailer (Email)

```
Email Küldés Folyamat:
1. Sablon betöltés (DB EmailTemplate VAGY hardcoded fallback)
2. Változó helyettesítés ({{name}}, {{magic_link_url}}, stb.)
3. Rate limit ellenőrzés (5/típus/óra, 20/összesen/óra)
4. Küldés retry logikával (3 próba, exponential backoff: 1s, 2s, 4s)
5. CID melléklet (QR kód inline image)
6. EmailLog rögzítés

Sablon típusok: magic_link, ticket_delivery, payment_reminder, stb.
Előnézet: POST /api/admin/email-templates/{slug}/preview
```

### 6.3 QR Rendszer

```
QR Generálás:
1. JWT token létrehozás (HS256, QR_SECRET)
   Payload: {registration_id, guest_id, ticket_type, iat, exp}
   Lejárat: 48 óra
2. qrcode npm → Data URL (300x300px PNG)
3. Tárolás: Registration.qr_code_hash

QR Validálás (Check-in):
1. html5-qrcode szkenner → JWT token
2. jsonwebtoken.verify(token, QR_SECRET)
3. Prisma query: Registration + Guest lookup
   (bővített válasz: title, dietary_requirements, is_vip_reception, tableName, partner)
4. Duplikáció ellenőrzés (Checkin UNIQUE constraint)
5. Szín-kódolt kártya: Zöld/Sárga/Piros
6. Event broadcast: display screen + PWA frissítés
```

## 7. Real-time Architektúra (SSE)

### 7.1 Event Broadcaster Service (`lib/services/event-broadcaster.ts`)

In-memory pub/sub rendszer Server-Sent Events (SSE) streaming-hez.

```
┌──────────────────────────────────────────────────┐
│              event-broadcaster.ts                 │
├──────────────────────────────────────────────────┤
│  Channels:                                        │
│  ├── Guest subscribers (Map<guestId, callback>)  │
│  └── Display subscribers (Set<callback>)          │
│                                                   │
│  API:                                             │
│  ├── subscribeGuest(guestId, callback)            │
│  ├── broadcastToGuest(guestId, data)              │
│  ├── subscribeDisplay(callback)                   │
│  └── broadcastToDisplay(data)                     │
└──────────────────────────────────────────────────┘
```

**Adatfolyam:**

```
Check-in submit API
  ↓
broadcastToDisplay({ type: 'checkin', guestId, tableName })
broadcastToGuest(guestId, { type: 'checkin-confirmed' })
  ↓                           ↓
Display Screen (SSE)     PWA App (SSE)
/api/admin/display-stream    /api/pwa/events
```

**Korlátok:**
- Single-instance only — a globális Map/Set nem osztott több Node.js process között
- Multi-instance deployment esetén Redis pub/sub szükséges
- Nginx `proxy_buffering off` + `X-Accel-Buffering: no` kell az SSE-hez

### 7.2 SSE Endpoint-ek

| Endpoint | Kliens | Adattartalom |
|----------|--------|-------------|
| `GET /api/admin/display-stream` | Display Screen | Check-in események (guestId, tableName, timestamp) |
| `GET /api/pwa/events` | PWA Guest App | Vendég-specifikus értesítések |

## 8. Deployment Architektúra

### 8.1 Production Environment

```
Hetzner VPS (Ubuntu)
├── Nginx (reverse proxy, SSL, static files)
│   ├── SSL: Let's Encrypt (auto-renewal)
│   ├── Static: .next/static/ közvetlenül
│   ├── Proxy: localhost:3000
│   └── SSE: proxy_buffering off (display-stream, pwa/events)
│
├── PM2 (process manager)
│   └── .next/standalone/server.js
│
├── MySQL 8.0 (helyi)
│   └── ceog adatbázis
│
└── Node.js 18+ (runtime)
```

### 8.2 Build Folyamat

```bash
npm run build          # Next.js build (output: standalone)
# postbuild script → static fájlok másolása standalone-ba
pm2 restart ceog       # Production szerver újraindítás

# VAGY
npm run deploy         # Build + auto-copy static + PM2 restart (ajánlott)
```

### 8.3 Docker Támogatás

- `docker-compose.yml` - Lokális fejlesztés (MySQL + phpMyAdmin)
- `docker-compose.dev.yml` - Dev override
- `docker-compose.prod.yml` - Production override
- `Dockerfile` - Alkalmazás container

## 9. Tesztelési Stratégia

### 9.1 Teszt Szintek

| Szint | Eszköz | Lefedettség | Státusz |
|-------|--------|-------------|---------|
| **Unit** | Vitest + happy-dom | Üzleti logika, validáció, szűrők | ✅ |
| **E2E** | Playwright | Teljes felhasználói folyamatok | 97/97 passing |
| **BDD** | playwright-bdd (Gherkin) | Fizetés, check-in szcenáriók | ✅ |
| **Manuális** | Admin release-testing | Verzió-specifikus teszt lépések | TestResult modell |

### 9.2 Teszt Fájlok

```
tests/
├── setup.ts                          # Vitest konfiguráció
└── unit/
    ├── guest-list-filtering.test.ts  # Vendéglista szűrés tesztek
    ├── magic-link-category.test.ts   # Magic link kategória tesztek
    └── partner-email-validation.test.ts # Partner email validáció
```

### 9.3 Teszt Parancsok

```bash
npm run test:unit          # Unit tesztek (Vitest)
npm run test:e2e           # E2E tesztek (Playwright headless)
npm run test:e2e:ui        # E2E tesztek GUI módban
```

## 10. Teljesítmény Követelmények

| Metrika | Célérték |
|---------|----------|
| Oldal betöltés (LCP) | < 2 másodperc |
| DB lekérdezés (átlag) | < 100ms |
| API válaszidő (95. percentilis) | < 500ms |
| SSE latency (check-in → display) | < 200ms |
| Egyidejű felhasználók | 500+ |
| Vendég kapacitás | 10,000 |

## 11. Lokalizáció (i18n)

- **Nyelvek:** Magyar (alapértelmezett), English
- **Implementáció:** React Context (`LanguageContext`) + `useLanguage()` hook
- **Perzisztencia:** localStorage (`admin-language` kulcs)
- **Fájlok:**
  - `lib/i18n/translations.ts` - Fő fordítások
  - `lib/i18n/admin-help-translations.ts` - Admin FAQ fordítások
  - `lib/i18n/LanguageContext.tsx` - Context provider
