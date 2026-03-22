# Forrás Fa Elemzés - CEO Gala Regisztrációs Rendszer

**Generálva:** 2026-02-15 | **Frissítve:** 2026-03-22
**Szkennelési mélység:** Exhaustive

---

## Teljes Könyvtárstruktúra

```
ceog-gala/                          # Projekt gyökér
├── app/                            # ⭐ Next.js App Router (fő alkalmazás)
│   ├── (auth)/                     # Csoportosított auth route-ok
│   │   └── admin/
│   │       └── login/
│   │           └── page.tsx        # Admin/Staff bejelentkezési oldal
│   │
│   ├── admin/                      # ⭐ Admin Dashboard (12+ szekció)
│   │   ├── AdminHeader.tsx         # Desktop navigáció (dropdown menü)
│   │   ├── DashboardContent.tsx    # Fő dashboard tartalom
│   │   ├── Providers.tsx           # Admin-szintű provider-ek (Language, Theme)
│   │   ├── layout.tsx              # Admin layout (header + sidebar + mobile tabs)
│   │   ├── page.tsx                # Dashboard főoldal
│   │   ├── applicants/             # Jelentkező kezelés
│   │   │   ├── ApplicantList.tsx   # Jelentkezők lista + approve/reject
│   │   │   ├── loading.tsx         # Skeleton loader
│   │   │   └── page.tsx            # Server Component oldal
│   │   ├── audit-log/              # Audit napló
│   │   │   ├── AuditLogList.tsx    # Szűrhető audit lista
│   │   │   └── page.tsx
│   │   ├── changelog/              # Verzió changelog
│   │   │   └── page.tsx
│   │   ├── checkin-log/            # Check-in napló
│   │   │   ├── CheckinLogDashboard.tsx  # Valós idejű check-in lista
│   │   │   └── page.tsx
│   │   ├── components/             # Admin-specifikus UI elemek
│   │   │   ├── AdminThemeToggle.tsx     # Dark/Light mód
│   │   │   ├── LanguageToggle.tsx       # HU/EN nyelv választó
│   │   │   ├── MobileTabBar.tsx         # Mobil navigáció (5 tab)
│   │   │   └── PageHeader.tsx           # Oldalfejléc + breadcrumb
│   │   ├── diagrams/               # Diagram dashboard
│   │   │   ├── DiagramsIframe.tsx
│   │   │   └── page.tsx
│   │   ├── email-logs/             # Email napló
│   │   │   ├── EmailLogsDashboard.tsx
│   │   │   └── page.tsx
│   │   ├── email-templates/        # Email sablon kezelés
│   │   │   ├── EmailTemplatesDashboard.tsx
│   │   │   └── page.tsx
│   │   ├── guests/                 # ⭐ Vendég kezelés (CRUD)
│   │   │   ├── DeleteConfirmModal.tsx    # Törlés megerősítő
│   │   │   ├── EmailPreviewModal.tsx     # Email előnézet
│   │   │   ├── GuestFormModal.tsx        # Vendég szerkesztő form
│   │   │   ├── GuestList.tsx             # Fő vendéglista
│   │   │   ├── PaymentApprovalModal.tsx  # Banki fizetés jóváhagyás
│   │   │   ├── components/
│   │   │   │   ├── GuestBulkActions.tsx  # Tömeges műveletek
│   │   │   │   ├── GuestFilters.tsx      # Szűrők (kategória, státusz, asztal)
│   │   │   │   ├── GuestPagination.tsx   # Lapozás
│   │   │   │   └── Notification.tsx      # Toast értesítések
│   │   │   ├── hooks/
│   │   │   │   └── useGuestList.ts       # Vendéglista state management hook
│   │   │   ├── import/
│   │   │   │   ├── ImportForm.tsx        # CSV import form
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── help/                   # Admin súgó (50+ FAQ)
│   │   │   └── page.tsx
│   │   ├── payments/               # Fizetés kezelés
│   │   │   ├── PaymentsDashboard.tsx
│   │   │   └── page.tsx
│   │   ├── pwa-apps/               # PWA app kezelés
│   │   │   └── page.tsx
│   │   ├── release-testing/        # Release tesztelés
│   │   │   └── page.tsx
│   │   ├── scheduled-emails/       # Ütemezett emailek
│   │   │   ├── ScheduledEmailsDashboard.tsx
│   │   │   └── page.tsx
│   │   ├── seating/                # ⭐ Ültetési rend (DnD)
│   │   │   ├── SeatingDashboard.tsx      # Fő ültetés felület
│   │   │   ├── components/
│   │   │   │   ├── DraggableGuest.tsx    # Húzható vendég elem
│   │   │   │   ├── DroppableTable.tsx    # Asztal cél terület
│   │   │   │   ├── FloorPlanCanvas.tsx   # React-Konva canvas
│   │   │   │   ├── FloorPlanEditor.tsx   # Alaprajz szerkesztő
│   │   │   │   ├── GuestChip.tsx         # Vendég chip
│   │   │   │   ├── PairedGuestChip.tsx   # Páros vendég chip (partner megjelenítés)
│   │   │   │   ├── SeatingSearchBar.tsx  # Vendég keresés az ültetésen
│   │   │   │   ├── SeatingFilters.tsx    # Ültetés szűrők (típus, státusz)
│   │   │   │   ├── UnassignedPanel.tsx   # Nem ültetett vendégek
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   └── useSeatingDnd.ts      # DnD state management
│   │   │   ├── page.tsx
│   │   │   └── types.ts                  # Ültetés típusok (SeatingGuest, SeatingTable, stb.)
│   │   ├── statistics/             # Statisztikák
│   │   │   ├── StatisticsContent.tsx
│   │   │   └── page.tsx
│   │   ├── tables/                 # Asztal kezelés (CRUD)
│   │   │   ├── TablesDashboard.tsx
│   │   │   └── page.tsx
│   │   └── users/                  # Admin felhasználó kezelés
│   │       ├── UsersDashboard.tsx
│   │       └── page.tsx
│   │
│   ├── api/                        # ⭐ REST API Endpoints (62 route fájl)
│   │   ├── admin/                  # Admin API-k (auth required)
│   │   │   ├── applicants/         # Jelentkező CRUD + approve/reject
│   │   │   ├── audit-log/          # Audit napló API
│   │   │   ├── checkin-log/        # Check-in napló
│   │   │   ├── checkin-stats/      # Check-in statisztikák
│   │   │   ├── display-stream/     # SSE stream élő kijelzőhöz (valós idejű frissítés)
│   │   │   ├── email-logs/         # Email napló CRUD
│   │   │   ├── email-templates/    # Email sablon CRUD + preview
│   │   │   ├── guests/             # Vendég CRUD + import/export
│   │   │   ├── payments/           # Fizetés kezelés + refund ([id]/refund/)
│   │   │   ├── scheduled-emails/   # Ütemezett email CRUD + bulk + trigger
│   │   │   ├── scheduler-config/   # Email ütemező konfiguráció CRUD ([id]/)
│   │   │   ├── seating-display-data/ # Ültetési kijelző adatok (display oldalhoz)
│   │   │   ├── seating-export/     # Ültetés CSV export
│   │   │   ├── seating-stats/      # Ültetés statisztikák
│   │   │   ├── statistics/         # Dashboard statisztikák
│   │   │   ├── table-assignments/  # Asztal hozzárendelés + bulk (bulk/)
│   │   │   ├── tables/             # Asztal CRUD + pozíció ([id]/position/)
│   │   │   ├── test-results/       # Teszt eredmények + export (export/)
│   │   │   └── users/              # Admin felhasználó CRUD
│   │   ├── apply/                  # Publikus jelentkezés
│   │   ├── auth/[...nextauth]/     # NextAuth bejelentkezés
│   │   ├── checkin/                # Check-in validáció + submit
│   │   ├── email/                  # Email küldés (magic link)
│   │   ├── health/                 # Health check endpoint
│   │   ├── pwa/                    # PWA API-k (auth, profile, ticket, push, events)
│   │   ├── register/               # Link kérés API
│   │   ├── registration/           # Regisztráció submit/confirm/cancel/status
│   │   ├── stripe/                 # Stripe checkout + webhook
│   │   └── ticket/                 # Jegy generálás + ellenőrzés
│   │
│   ├── apply/                      # Publikus jelentkezési űrlap
│   │   └── page.tsx
│   ├── checkin/                    # ⭐ Mobil QR szkenner
│   │   ├── CheckinScanner.tsx      # html5-qrcode integráció
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── display/                    # ⭐ Élő kijelző (nagykivetítő)
│   │   ├── layout.tsx              # Display layout (minimal, fullscreen)
│   │   └── seating/
│   │       ├── page.tsx            # Ültetési kijelző oldal
│   │       └── SeatingDisplay.tsx  # SSE-alapú valós idejű ültetési térkép
│   ├── components/                 # Globális komponensek
│   │   ├── Footer.tsx              # Desktop lábléc
│   │   ├── GlobalProviders.tsx     # App-szintű provider-ek
│   │   ├── MobileFooter.tsx        # Mobil lábléc ("Powered by MyForge Labs")
│   │   ├── ThemeProvider.tsx       # Dark/Light mód provider
│   │   └── ThemeToggle.tsx         # Téma váltó gomb
│   ├── globals.css                 # Tailwind CSS alap stílusok
│   ├── help/                       # Publikus FAQ oldal
│   │   └── page.tsx
│   ├── layout.tsx                  # ⭐ Root Layout (HTML, metadata, providers)
│   ├── page.tsx                    # Főoldal (landing page)
│   ├── payment/                    # Stripe redirect oldalak
│   │   ├── cancel/page.tsx
│   │   └── success/page.tsx
│   ├── privacy/                    # Adatvédelmi tájékoztató
│   │   └── page.tsx
│   ├── pwa/                        # ⭐ PWA Vendég Alkalmazás
│   │   ├── cancel/page.tsx         # Regisztráció lemondás
│   │   ├── components/
│   │   │   ├── WelcomeModal.tsx    # Üdvözlő modal
│   │   │   └── ui/                 # PWA UI könyvtár
│   │   │       ├── BottomSheet.tsx
│   │   │       ├── Button3D.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── FlipClock.tsx   # Visszaszámláló
│   │   │       ├── Skeleton.tsx
│   │   │       ├── ThemeToggle.tsx
│   │   │       ├── Toast.tsx
│   │   │       └── index.ts
│   │   ├── dashboard/page.tsx      # Vendég dashboard
│   │   ├── error.tsx               # Error boundary
│   │   ├── feedback/page.tsx       # Visszajelzés
│   │   ├── gallery/page.tsx        # Fotó galéria
│   │   ├── help/page.tsx           # PWA súgó
│   │   ├── hooks/
│   │   │   ├── useHaptic.ts        # Haptikus visszajelzés
│   │   │   ├── useTheme.ts         # Téma kezelés
│   │   │   └── useToast.ts         # Toast értesítések
│   │   ├── layout.tsx              # PWA layout + manifest
│   │   ├── offline/page.tsx        # Offline fallback
│   │   ├── page.tsx                # PWA login (auth code)
│   │   ├── profile/page.tsx        # Profil szerkesztés
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx    # PWA téma provider
│   │   ├── ticket/page.tsx         # QR jegy megjelenítés
│   │   └── utils/
│   │       └── calendar.ts         # ICS naptár export
│   ├── register/                   # ⭐ Vendég Regisztrációs Folyamatok
│   │   ├── RegisterError.tsx       # Hibakezelő
│   │   ├── RegisterWelcome.tsx     # Üdvözlő képernyő
│   │   ├── components/
│   │   │   ├── BillingForm.tsx     # Számlázási adatok form
│   │   │   ├── ConsentCheckboxes.tsx  # GDPR + lemondási feltételek
│   │   │   ├── GuestProfileFields.tsx # Profil adatok form
│   │   │   └── ThemeSwitcher.tsx   # Téma váltó
│   │   ├── declined/               # Meghívás elutasítás
│   │   │   ├── DeclinedContent.tsx
│   │   │   └── page.tsx
│   │   ├── page.tsx                # Magic link belépési pont
│   │   ├── paid/                   # Fizetős regisztráció
│   │   │   ├── PaidRegistrationForm.tsx  # Fizetős form (billing + partner)
│   │   │   └── page.tsx
│   │   ├── request-link/           # Link kérés (elveszett magic link)
│   │   │   ├── RequestLinkForm.tsx
│   │   │   ├── RequestLinkWrapper.tsx
│   │   │   └── page.tsx
│   │   ├── success/                # Sikeres regisztráció
│   │   │   ├── SuccessContent.tsx
│   │   │   └── page.tsx
│   │   └── vip/                    # VIP (ingyenes) regisztráció
│   │       ├── AlreadyRegistered.tsx
│   │       ├── VIPConfirmation.tsx
│   │       └── page.tsx
│   ├── status/                     # Regisztrációs státusz oldal
│   │   ├── StatusContent.tsx
│   │   ├── StatusError.tsx
│   │   └── page.tsx
│   └── terms/                      # Felhasználási feltételek
│       └── page.tsx
│
├── lib/                            # ⭐ Üzleti Logika Réteg
│   ├── api/                        # API helper-ek
│   │   ├── auth.ts                 # Auth validáció API route-okhoz
│   │   ├── index.ts                # API response helper-ek
│   │   ├── params.ts               # Query param feldolgozás
│   │   └── validation.ts           # Zod validáció wrapper
│   ├── auth/                       # Authentikáció
│   │   ├── auth-options.ts         # NextAuth konfiguráció
│   │   ├── magic-link.ts           # Magic link generálás/validálás
│   │   └── session.ts              # Session helper-ek
│   ├── config/                     # Konfigurációs állandók
│   │   ├── constants.ts            # App konstansok
│   │   └── event.ts                # Esemény konfigurációk
│   ├── constants.ts                # Legacy konstansok
│   ├── db/
│   │   └── prisma.ts               # Prisma Client singleton
│   ├── email-templates/            # Email HTML sablonok
│   │   ├── magic-link.ts           # Magic link email sablon
│   │   └── ticket-delivery.ts      # Jegy kézbesítő email sablon
│   ├── i18n/                       # Többnyelvűség (HU/EN)
│   │   ├── LanguageContext.tsx      # React Context provider
│   │   ├── admin-help-translations.ts  # Admin FAQ fordítások
│   │   └── translations.ts         # Fő fordítási fájl
│   ├── services/                   # ⭐ Üzleti szolgáltatások
│   │   ├── audit.ts                # Audit napló szolgáltatás
│   │   ├── checkin.ts              # Check-in validálás + rögzítés
│   │   ├── csv.ts                  # CSV import/export
│   │   ├── email-scheduler.ts      # Email ütemező logika
│   │   ├── email-templates.ts      # DB sablon betöltés + változó helyettesítés
│   │   ├── email.ts                # Email küldés (Nodemailer + retry)
│   │   ├── event-broadcaster.ts    # SSE esemény broadcast (élő kijelző frissítés)
│   │   ├── guest.ts                # Vendég CRUD üzleti logika
│   │   ├── payment.ts              # Stripe fizetés kezelés
│   │   ├── pwa-auth.ts             # PWA kód-alapú auth
│   │   ├── qr-ticket.ts            # QR jegy generálás (JWT)
│   │   ├── rate-limit.ts           # Rate limiting
│   │   ├── registration.ts         # Regisztráció üzleti logika
│   │   ├── scheduler-cron.ts       # node-cron ütemező
│   │   └── seating.ts              # Ültetés logika
│   ├── utils/                      # Segéd funkciók
│   │   ├── csrf.ts                 # CSRF token kezelés
│   │   ├── env.ts                  # Környezeti változó validáció
│   │   ├── errors.ts               # Hiba osztályok
│   │   ├── logger.ts               # Naplózás
│   │   └── name.ts                 # Név formázás
│   └── validations/                # Zod sémák
│       └── guest-profile.ts        # Vendég profil validáció
│
├── prisma/                         # Adatbázis
│   ├── schema.prisma               # ⭐ Prisma séma (16 modell, 10 enum, TestResult + TestStatus v4.1)
│   └── migrations/                 # Automatikus migrációk
│
├── public/                         # Statikus fájlok
│   ├── diagrams/                   # SVG diagramok (dashboard, wireframe)
│   ├── email-assets/               # Email képek (fejléc, logó)
│   ├── icons/                      # PWA ikonok (72-512px SVG)
│   ├── images/                     # Általános képek
│   ├── manifest.json               # PWA manifest (vendég)
│   ├── manifest-staff.json         # PWA manifest (staff)
│   ├── mockups/                    # HTML mockupok
│   ├── sw.js                       # Service Worker
│   ├── test-screenshots/           # Teszt képernyőképek
│   └── test-videos/                # Demó videók (11 db)
│
├── deploy/                         # VPS Telepítési Csomag
│   ├── install.sh                  # Rendszer komponensek
│   ├── setup-database.sh           # MySQL beállítás
│   ├── setup-nginx.sh              # Nginx reverse proxy
│   ├── setup-ssl.sh                # Let's Encrypt SSL
│   ├── configure.sh                # Interaktív konfiguráció
│   ├── start.sh                    # Build + PM2 indítás
│   ├── update.sh                   # Frissítés
│   ├── backup.sh                   # DB mentés
│   ├── deploy.sh                   # Teljes deploy
│   ├── quick-setup.sh              # Gyors telepítés
│   └── README.md                   # Telepítési útmutató
│
├── docker/                         # Docker konfigurációk
│   ├── mysql/init.sql              # MySQL inicializáció
│   └── nginx/nginx.conf            # Nginx konfig
│
├── scripts/                        # Karbantartó szkriptek
│   ├── seed-production.js          # Adatbázis seedelés (22 vendég)
│   ├── create-admin.js             # Admin létrehozás
│   ├── reset-password.ts           # Jelszó visszaállítás
│   ├── backup-db.sh                # DB mentés
│   ├── restore-db.sh               # DB visszaállítás
│   ├── deploy-*.sh                 # Deploy szkriptek (5 verzió)
│   └── check-api.mjs              # API health check
│
├── tests/                          # Tesztek
│   ├── setup.ts                    # Vitest beállítás
│   ├── unit/                       # Unit tesztek
│   │   ├── guest-list-filtering.test.ts
│   │   ├── magic-link-category.test.ts
│   │   └── partner-email-validation.test.ts
│   └── e2e/                        # Playwright E2E tesztek
│       ├── display-seating.spec.ts           # Ültetési kijelző tesztek
│       ├── display-layout-extended.spec.ts   # Kijelző layout tesztek
│       ├── checkin-card-rendering.spec.ts    # Check-in kártya megjelenítés
│       ├── checkin-full-flow.spec.ts         # Teljes check-in folyamat
│       └── checkin-scanner-extended.spec.ts  # Szkenner kiterjesztett tesztek
│
├── test-data/                      # Teszt CSV fájlok
│   ├── guest-import-test.csv
│   ├── guest-import-minimal.csv
│   └── guest-import-*.csv
│
├── types/                          # TypeScript típus kiterjesztések
│   └── next-auth.d.ts              # NextAuth session típusok
│
├── docs/                           # Dokumentáció
│   ├── CLIENT-SETUP-GUIDE.md       # Kliens telepítési útmutató
│   ├── CLIENT-DEPLOYMENT-CHECKLIST.md
│   ├── CLIENT-INFO-REQUEST.md
│   ├── bugs/                       # Bug jelentések
│   ├── design-specs/               # UI/UX specifikációk
│   ├── diagrams/                   # Excalidraw diagramok
│   ├── email-templates/            # Email sablon dokumentáció
│   └── specs/                      # Feature specifikációk
│
├── CLAUDE.md                       # AI fejlesztői instrukciók
├── README.md                       # Projekt README
├── INSTALL.md                      # Telepítési útmutató
├── QUICKSTART.md                   # Gyors indulás
├── RELEASE-NOTES.md                # Verziótörténet
├── Dockerfile                      # Docker build
├── docker-compose.yml              # Lokális fejlesztés (MySQL + phpMyAdmin)
├── docker-compose.dev.yml          # Dev override
├── docker-compose.prod.yml         # Production override
├── middleware.ts                    # ⭐ Auth + CSRF middleware
├── instrumentation.ts              # Next.js instrumentáció
├── next.config.js                  # Next.js konfig (standalone + security headers)
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript konfig
├── tailwind.config.ts              # Tailwind CSS konfig
├── vitest.config.ts                # Unit teszt konfig
├── postcss.config.js               # PostCSS konfig
├── ecosystem.config.js             # PM2 konfig (gitignored)
└── vercel.json                     # Vercel deployment konfig
```

## Kritikus Könyvtárak

| Könyvtár | Cél | Fontosság |
|----------|-----|-----------|
| `app/api/` | REST API endpoints (62 route fájl) | Kritikus - teljes backend |
| `app/admin/` | Admin dashboard (16+ szekció) | Kritikus - kezelőfelület |
| `app/register/` | Vendég regisztrációs folyamatok | Kritikus - core üzleti flow |
| `app/display/` | Élő ültetési kijelző (SSE) | Fontos - eseménynapi megjelenítés |
| `app/pwa/` | PWA vendég alkalmazás | Fontos - vendég élmény |
| `app/checkin/` | QR szkenner | Fontos - eseménynapi művelet |
| `lib/services/` | Üzleti logika (16 szolgáltatás) | Kritikus - core logika |
| `lib/auth/` | Authentikáció (NextAuth + magic link) | Kritikus - biztonság |
| `lib/i18n/` | Többnyelvűség (HU/EN) | Fontos - lokalizáció |
| `prisma/` | Adatbázis séma és migrációk | Kritikus - adatréteg |
| `deploy/` | VPS telepítési szkriptek | Fontos - production ops |

## Belépési Pontok

| Belépési Pont | Fájl | Leírás |
|---------------|------|--------|
| Root Layout | `app/layout.tsx` | HTML head, global providers, metadata |
| Middleware | `middleware.ts` | Auth + CSRF validálás |
| Admin Layout | `app/admin/layout.tsx` | Admin shell (header, sidebar, tabs) |
| PWA Layout | `app/pwa/layout.tsx` | PWA shell (manifest, service worker) |
| Display Layout | `app/display/layout.tsx` | Élő kijelző shell (fullscreen, minimal) |
| NextAuth | `app/api/auth/[...nextauth]/route.ts` | Bejelentkezési endpoint |
| Prisma Client | `lib/db/prisma.ts` | Adatbázis singleton |
