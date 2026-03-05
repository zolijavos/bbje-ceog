# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CEO Gala Event Registration System** - A web-based SaaS platform for managing invitation-only VIP events with comprehensive registration, payment processing, QR ticketing, check-in, and seating management capabilities.

**Current Status**: ✅ **PRODUCTION READY** - All 7 epics completed (38/38 stories done). See [docs/sprint-artifacts/sprint-status.yaml](docs/sprint-artifacts/sprint-status.yaml) for full status tracking. Original functional requirements documented in [docs/FUNKCIONALIS-KOVETELMENY.md](docs/FUNKCIONALIS-KOVETELMENY.md) (Hungarian).

**Multi-Role System**:
- Invited & paying guests (magic link authentication, registration flows)
- Administrators (guest management, seating arrangements, reports)
- Check-in staff (mobile QR scanner for event entry)

## Technology Stack

### Full-Stack Framework
- **Next.js 14+** with App Router - React framework for both frontend and backend
- **TypeScript** - Type-safe development (recommended but optional)
- **Node.js 18+** - JavaScript runtime

### Database & ORM
- **MySQL 8.0+** (production, Hetzner VPS)
- **Prisma ORM** ^5.19.0 - Type-safe database access with migrations
- 16 models, 10 enums (see [data-models.md](docs/data-models.md))

### External Services
- **Stripe** ^16.12.0 - Payment processing (Checkout Sessions + webhooks)
- **Nodemailer** ^7.0.7 - Email delivery (SMTP, retry + rate limiting)
- **qrcode** - QR code generation (PNG Data URL)
- **jsonwebtoken** - JWT token handling (QR tickets)
- **bcryptjs** - Password hashing (admin/staff)
- **node-cron** - Email scheduler

### Frontend
- **React 18** ^18.3.0 - UI components (~80+ components, 38 client / 3 server)
- **Tailwind CSS** ^3.4.0 - Utility-first styling (tailwind-merge + clsx)
- **React-Konva** + **@dnd-kit** - Seating map (canvas + drag-and-drop)
- **html5-qrcode** - Mobile QR scanning
- **Framer Motion** ^12.23.25 - Animations
- **Phosphor Icons** (@phosphor-icons/react) - Icon library
- **PapaParse** - CSV parsing (guest import)
- **i18n**: React Context (`LanguageContext`) + `useLanguage()` hook, HU (default) + EN

### Hosting & Infrastructure
- **Production**: Hetzner VPS with PM2 + Nginx + Let's Encrypt SSL
- **Database**: MySQL 8.0 on same VPS
- **Build**: Next.js `output: 'standalone'` mode
- Minimum VPS: 2GB RAM, 20GB SSD

## Architecture

### Layered Architecture
```
Nginx (SSL, static files) → Next.js 14+ (App Router) → MySQL 8.0+

Layers:
1. Middleware      → Auth (NextAuth JWT), CSRF (Origin/Referer), RBAC (admin/staff)
2. Presentation    → Server Components (default) + Client Components ('use client')
3. API             → app/api/**/route.ts (44 REST endpoints)
4. Business Logic  → lib/services/ (email, registration, checkin, rate-limit, audit, scheduler)
5. Data Access     → Prisma ORM (singleton client, lib/prisma.ts)
6. Database        → MySQL 8.0+ (16 models, 10 enums)
```

Full architecture documentation: [docs/architecture.md](docs/architecture.md)

### Server & Client Components
- **Server Components** (default, 3 total) - Zero JS to client: root layout, landing page, payment/cancel
- **Client Components** (`'use client'`, 38 total) - Interactive UI with useState/useEffect
- **API Routes** (`app/api/**/route.ts`) - 36 route files with named exports (GET, POST, PATCH, DELETE)

### Project Structure (Full details: [docs/source-tree-analysis.md](docs/source-tree-analysis.md))
```
app/                        # Next.js App Router
├── (auth)/admin/login/    # Admin/Staff login page
├── admin/                 # Admin dashboard (16 sections)
│   ├── guests/           # Guest CRUD + import + bulk actions + modals
│   │   ├── components/   # GuestFilters, GuestBulkActions, GuestPagination, Notification
│   │   ├── hooks/        # useGuestList.ts (CRUD, filter, paginate, sort)
│   │   └── import/       # CSV import form (PapaParse)
│   ├── seating/          # Drag-drop seating map
│   │   ├── components/   # FloorPlanCanvas (Konva), DraggableGuest, DroppableTable, GuestChip
│   │   └── hooks/        # useSeatingDnd.ts (@dnd-kit state)
│   ├── tables/           # Table CRUD
│   ├── payments/         # Payment status & approvals
│   ├── applicants/       # Applicant approve/reject
│   ├── checkin-log/      # Check-in history (real-time)
│   ├── email-logs/       # Email delivery log
│   ├── email-templates/  # Email template CRUD
│   ├── scheduled-emails/ # Scheduled email queue
│   ├── audit-log/        # Audit trail viewer
│   ├── statistics/       # Dashboard statistics
│   ├── users/            # Admin user management
│   ├── changelog/        # Version changelog
│   ├── release-testing/  # Manual test steps by version
│   ├── help/             # Admin FAQ (50+ entries, 12 categories)
│   ├── diagrams/         # Architecture diagram viewer
│   ├── pwa-apps/         # PWA app management
│   └── components/       # Shared admin UI: AdminThemeToggle, LanguageToggle, MobileTabBar, PageHeader
├── apply/                 # Public applicant registration
├── checkin/              # Mobile QR scanner (standalone, SessionProvider)
├── pwa/                  # Progressive Web App for guests
│   ├── dashboard/        # Guest dashboard
│   ├── profile/          # Profile view/edit
│   ├── ticket/           # QR ticket display
│   └── table/            # Table info + tablemates
├── register/             # Magic link registration
│   ├── vip/              # Invited guest flow (free ticket)
│   ├── paid/             # Paid flow (multi-step: billing + partner)
│   ├── success/          # Registration success page
│   ├── declined/         # Declined invitation page
│   └── request-link/     # Lost link request form
├── payment/              # Payment pages
│   ├── success/          # Stripe success redirect
│   └── cancel/           # Stripe cancel redirect
├── help/                  # Public FAQ for guests
├── status/                # System status page
├── terms/ + privacy/      # Legal pages
├── api/                   # 44 HTTP endpoints in 36 route files
│   ├── auth/             # NextAuth [...nextauth]
│   ├── admin/            # Admin CRUD (~30 endpoints)
│   ├── registration/     # Guest registration (validate, submit, partner, apply)
│   ├── stripe/           # Payment (create-checkout, webhook)
│   ├── checkin/          # Check-in (validate, submit)
│   └── pwa/              # PWA (auth, profile, ticket, table, push-subscribe)
└── components/            # Global: GlobalProviders, ThemeProvider, ThemeToggle, Footer, MobileFooter

lib/                       # Business logic & utilities
├── services/             # 7+ services: email, registration, checkin, rate-limit, audit, scheduler, seating
├── validations/          # Zod schemas: registration, applicant, guest
├── utils/                # auth, magic-link, qr, helpers
├── i18n/                 # LanguageContext.tsx, translations.ts, admin-help-translations.ts
└── prisma.ts             # Prisma client singleton (global dev hot-reload safe)

prisma/
├── schema.prisma         # Database schema (16 models, 10 enums)
└── migrations/           # Auto-generated SQL migrations

tests/
├── unit/                 # Vitest unit tests
└── e2e/                  # Playwright E2E tests (201 passed, 21 skipped)
    └── fixtures/         # Custom test fixtures
```

## Database Schema

16 Prisma models + 10 enums in [prisma/schema.prisma](prisma/schema.prisma). Full details: [docs/data-models.md](docs/data-models.md)

### Core Tables
- **Guest** - Guest list with profile (email UNIQUE, name, title, phone, company, position, guest_type, dietary_requirements, seating_preferences, pwa_auth_code, push_token, magic_link_code/expires, application_message, rejection_reason)
- **Registration** - Registration data (guest_id FK UNIQUE, ticket_type, payment_method, qr_code_hash, GDPR consent, cancellation acceptance, partner_name/email)
- **Payment** - Stripe payments (registration_id FK UNIQUE, stripe_session_id, amount, currency, status, paid_at)
- **Checkin** - Check-in log (registration_id UNIQUE, guest_id UNIQUE, staff_user_id FK, method, is_override)
- **BillingInfo** - Billing details for paying guests (registration_id FK UNIQUE, name, company, tax_number, address)

### Seating Management
- **Table** - Table definitions (name UNIQUE, capacity, type, pos_x, pos_y, status)
- **TableAssignment** - Guest-table mapping (table_id FK, guest_id FK UNIQUE, seat_number)

### Admin & System
- **User** - Admin accounts (email UNIQUE, password_hash bcrypt, role: admin/staff)
- **EmailLog** - Email delivery tracking (guest_id FK, email_type, recipient, subject, status, error_message, sent_at)
- **EmailTemplate** - Reusable email templates (slug UNIQUE, subject, html_body, text_body, variables JSON)
- **SchedulerConfig** - Email scheduler configuration (config_key UNIQUE, enabled, days_before/after, send_time, target_status/types JSON, template_slug)
- **ScheduledEmail** - Scheduled email queue (guest_id FK optional, template_slug, scheduled_for, status, schedule_type)
- **RateLimitEntry** - Rate limiting (key UNIQUE, attempts, expires_at)
- **AuditLog** - Action audit trail (user_id, action, entity_type, entity_id, old_values/new_values JSON, ip_address)
- **TestResult** - Manual test tracking (version, feature_index, status, tester_id FK, step_results JSON)

### Enums
- GuestType: `invited`, `paying_single`, `paying_paired`, `applicant`
- RegistrationStatus: `invited`, `registered`, `approved`, `declined`, `pending_approval`, `rejected`
- TicketType: `vip_free`, `paid_single`, `paid_paired`
- PaymentMethod: `card`, `bank_transfer`
- PaymentStatus: `pending`, `paid`, `failed`, `refunded`
- TableStatus: `available`, `full`, `reserved`
- TableType: `vip`, `standard`
- UserRole: `admin`, `staff`
- ScheduledEmailStatus: `pending`, `processing`, `sent`, `failed`, `cancelled`
- TestStatus: `passed`, `failed`, `not_tested`

## Development Commands

```bash
# Project Setup
npm install                                  # Install dependencies
npx prisma generate                         # Generate Prisma client
npx prisma db push                          # Push schema to database (dev)
npx prisma migrate dev                      # Create & apply migration (production-ready)

# Development Server
npm run dev                                  # Start Next.js dev server (localhost:3000)

# Database Management
npx prisma studio                           # Open database GUI browser
node scripts/seed-production.js             # Seed database with test data (production-ready JS)
npx prisma migrate reset                    # Reset database (dev only)

# Testing
npm run test:unit                           # Vitest unit tests
npx playwright test                         # E2E tests (Playwright)
npx playwright test --ui                    # E2E tests with interactive UI

# E2E teszt státusz: docs/testing/E2E-TEST-STATUS.md (201 passed, 21 skipped)

# Code Quality
npm run lint                                # ESLint
npx tsc --noEmit                            # TypeScript type checking

# Production Build
npm run build                               # Build for production
npm start                                   # Start production server
```

## Key API Endpoints

**Total: 44 HTTP endpoints in 36 route files.** Full API documentation: [docs/api-contracts.md](docs/api-contracts.md)

### Guest Registration (Public)
- `POST /api/registration/validate` - Magic link validation (code + email)
- `POST /api/registration/submit` - Submit registration (VIP: immediate QR; Paid: awaits payment)
- `POST /api/registration/partner` - Add paired ticket partner details
- `POST /api/registration/apply` - Public applicant submission

### Payment Processing
- `POST /api/stripe/create-checkout` - Create Stripe Checkout Session (25K HUF single / 45K HUF paired)
- `POST /api/stripe/webhook` - Stripe webhook (signature validation, auto QR + ticket email)

### Check-in System (Admin + Staff)
- `POST /api/checkin/validate` - QR JWT validation (returns green/yellow/red card data)
- `POST /api/checkin/submit` - Record check-in (supports admin override for duplicates)

### Admin Guest Management
- `GET /api/admin/guests` - Guest list (filter, search, paginate, sort)
- `POST /api/admin/guests` - Create guest manually
- `GET|PATCH|DELETE /api/admin/guests/{id}` - Guest CRUD
- `POST /api/admin/guests/import` - JSON guest import (CSV parsed on frontend)
- `PATCH /api/admin/guests/{id}/approve-payment` - Manual bank transfer approval + QR generation
- `POST /api/admin/guests/{id}/resend-magic-link` - Regenerate + send magic link
- `POST /api/admin/guests/{id}/send-ticket` - Send/resend e-ticket email

### Admin Tables & Seating
- `GET|POST /api/admin/tables` - Table list / create
- `PATCH|DELETE /api/admin/tables/{id}` - Update / delete table
- `POST|DELETE /api/admin/table-assignments` - Assign / unassign guest (DELETE uses ?guest_id query)
- `GET /api/admin/seating-export` - CSV export (Content-Type: text/csv)

### Admin Applicants
- `GET /api/admin/applicants` - List (filter by status or "all")
- `POST /api/admin/applicants/{id}/approve` - Approve + generate magic link + send email
- `POST /api/admin/applicants/{id}/reject` - Reject with reason

### Admin Email Management
- `GET /api/admin/scheduled-emails` - Email log (paginated, filterable)
- `POST /api/admin/scheduled-emails/bulk` - Bulk email send (batches of 5, 1s delay between)
- `DELETE /api/admin/scheduled-emails/{id}` - Cancel pending email (soft: status -> cancelled)
- `GET|POST /api/admin/email-templates` - Template list / create
- `PATCH|DELETE /api/admin/email-templates/{id}` - Template update / delete

### Admin Dashboard
- `GET /api/admin/overview` - Dashboard statistics (9 parallel COUNT queries)
- `GET /api/admin/checkin-log` - Check-in log (Admin + Staff access, paginated)
- `GET /api/admin/changelog` - Changelog markdown content

### PWA Guest App (Public, code-based auth)
- `POST /api/pwa/auth` - Auth with CEOG-XXXXXX code
- `GET|PATCH /api/pwa/profile` - Guest profile (read/update, uses ?guest_id)
- `GET /api/pwa/ticket` - QR ticket JWT token
- `GET /api/pwa/table` - Table info + tablemates
- `POST /api/pwa/push-subscribe` - Save Firebase FCM push token

### Email Service Features
- **Retry Logic**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Rate Limiting**: 5 per type/hour, 20 total/hour per guest (key format: `email:{guestId}:{type}`)
- **Delivery Logging**: All emails logged to `EmailLog` table
- **Template System**: DB templates (slug-based) with `{{variable}}` substitution + hardcoded fallbacks
- **CID Attachments**: Inline QR code images via Content-ID

## Security Requirements

### Authentication Methods (3 distinct approaches)
1. **Magic Link (Guests)**
   - Hash: SHA-256 of `email + APP_SECRET + timestamp`
   - Expiry: **24 hours** from generation
   - Single-use only (magic_link_code cleared after successful registration)
   - Rate limit: Max 5 emails per type per hour, 20 total per hour per guest

2. **NextAuth JWT Session (Admin/Staff)**
   - Provider: CredentialsProvider (email + password)
   - Password hash: bcrypt (bcryptjs)
   - Session strategy: **JWT** (not database sessions), **8 hour** expiry
   - Session payload: `{id, email, role, name}`
   - Login page: `/admin/login` (via `(auth)/admin/login/page.tsx`)

3. **JWT Tokens (QR Tickets)**
   - Algorithm: HMAC-SHA256 (HS256)
   - Secret: `QR_SECRET` (min 64 chars, env alias: `APP_QR_SECRET`)
   - Expiry: 48 hours
   - Payload: `{registration_id, guest_id, ticket_type, iat, exp}`

4. **PWA Auth Code (Guest App)**
   - Format: `CEOG-XXXXXX` (6 alphanumeric)
   - Stored in: Guest.pwa_auth_code (UNIQUE)
   - Client-side: localStorage key `pwa-auth-code`
   - No expiry (persistent)

### CSRF Protection (middleware.ts)
- **Method**: Origin/Referer header validation (NOT token-based)
- Validates non-safe methods (POST, PATCH, DELETE) against expected host
- **Exceptions**: Stripe webhook (signature-based), Next.js internal fetches (x-nextjs-data header), server-side fetches

### Security Headers (next.config.js)
| Header | Value |
|--------|-------|
| X-Frame-Options | SAMEORIGIN |
| X-Content-Type-Options | nosniff |
| Strict-Transport-Security | max-age=31536000 |
| Content-Security-Policy | script/style/connect restrictions (Stripe compatible) |
| Permissions-Policy | camera=(self) for QR scanner |

### Critical Security Rules
- **SQL Injection**: Prisma ORM handles parameterized queries - NEVER use raw SQL with string concatenation
- **XSS**: React auto-escapes by default; avoid `dangerouslySetInnerHTML`
- **HTTPS**: Required in production (Nginx + Let's Encrypt)
- **Stripe Webhooks**: MUST validate signature using `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`

### Known Security Issues (from API audit)
**CRITICAL:**
1. **IDOR on PWA APIs**: `/api/pwa/profile`, `/api/pwa/ticket`, `/api/pwa/table` only use `guest_id` query param - anyone can query any guest's data if they know the ID. Fix: require PWA auth token validation.
2. **Check-in override not role-restricted in API**: `/api/checkin/submit` accepts `is_override: true` from Staff role too. Only the frontend hides the button. Fix: check session.user.role === 'admin' in API.

**MEDIUM:**
3. **PATCH body injection**: `PATCH /api/admin/guests/{id}` passes body directly to Prisma update without field filtering. Can modify magic_link_code, pwa_auth_code etc.
4. **Missing Zod validation**: Several API endpoints don't apply Zod schemas despite schemas being defined in `lib/validations/`.

### Environment Variables
Critical secrets in `.env` (gitignored). Template: `.env.example`
```bash
# Database
DATABASE_URL="mysql://ceog_user:ceog_password@localhost:3306/ceog_dev"

# App Secrets
APP_SECRET=min_64_char_random_string_for_magic_links
QR_SECRET=min_64_char_random_string_for_jwt

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SMTP)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<provider_specific>
SMTP_PASS=<provider_specific>
SMTP_FROM=noreply@ceogala.test

# NextAuth (JWT sessions)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_32_char_string

# App
APP_URL=http://localhost:3000
MAGIC_LINK_EXPIRY_HOURS=24
SHOW_TABLE_NUMBERS=true
```

## Completed Epics (7/7)

### Epic 1: Core Registration ✅
- CSV guest list import with validation
- Magic link email sending (Nodemailer + SMTP)
- Invited registration flow (free, immediate ticket)
- Paid registration flow with billing form
- Admin dashboard with filtering & pagination

### Epic 2: Payment & Ticketing ✅
- Stripe Checkout Session integration
- Webhook handling with signature validation
- QR code generation (JWT-based)
- E-ticket email delivery
- Manual bank transfer approval

### Epic 3: Check-in System ✅
- Mobile QR scanner (html5-qrcode)
- Check-in validation API (JWT verification)
- Duplicate check-in detection
- Admin override capability
- Real-time check-in log with filters

### Epic 4: Seating Management ✅
- Table CRUD operations
- Manual guest-to-table assignment
- Bulk CSV assignment
- React-Konva drag-and-drop seating map
- Seating arrangement CSV export

### Epic 5: Guest Profile Extension ✅
- Extended guest profile (title, phone, company, position)
- Dietary requirements & seating preferences
- Zod validation schemas
- Invited & paying registration profile forms

### Epic 6: PWA Guest App ✅
- Progressive Web App (manifest.json, service worker)
- Code-based authentication (CEOG-XXXXXX format)
- Guest profile view/edit
- Offline QR ticket display
- Table number display
- Push notification infrastructure (Firebase)
- "Powered by MyForge Labs" branding

### Epic 7: Applicant Flow ✅
- Public application form for non-invited guests
- Admin applicant management (approve/reject)
- 24-hour magic link expiry (all guest types)
- Rejection reason tracking

## Guest Registration Flows

### Invited Flow (Free)
1. Click magic link → auto-authenticate
2. Confirm attendance (Yes/No)
3. Immediate QR ticket generation and email delivery
4. Status: `invited` → `registered` → `ticket_issued`

### Paid Flow (Single/Paired)
1. Click magic link → auto-authenticate
2. Select ticket type (single or paired)
3. Enter billing details + partner info (if paired)
4. Choose payment method:
   - **Card**: Redirect to Stripe Checkout → webhook confirmation → ticket issued
   - **Bank Transfer**: Show account details → admin manual approval → ticket issued
5. Status: `invited` → `registered` → `awaiting_payment` → `paid` → `ticket_issued`

### Paired Ticket Handling
- Partner name and email collected during registration
- Both main guest and partner assigned to same table
- 2 seats reserved automatically

## Check-in Color-Coded Cards

Mobile check-in app displays:
- **GREEN**: Valid ticket → Show guest name, category → "Check In" button
- **YELLOW**: Already checked in → Show warning, original check-in timestamp, staff name → "Admin Override" button (admin role only)
- **RED**: Invalid/expired QR code → Error message → "Scan Again" button

Duplicate check-in prevention: UNIQUE constraint on `checkins.registration_id`

## Admin vs Staff Role Access

### Role-Based Permission Matrix
| Feature | Admin | Staff |
|---------|-------|-------|
| Guest List & CRUD | ✅ Full access | ❌ No access |
| CSV Import | ✅ Bulk import | ❌ No access |
| Applicant Approval | ✅ Approve/Reject | ❌ No access |
| Payment Management | ✅ Manual approval | ❌ No access |
| Table Management | ✅ CRUD + assign | ❌ No access |
| Seating Map | ✅ Drag-and-drop | ❌ No access |
| Email Sending | ✅ Bulk email | ❌ No access |
| Check-in Log | ✅ View + export | ✅ Read-only |
| QR Scanner | ✅ With override | ✅ Basic only |
| Admin Override | ✅ Allow duplicate | ❌ Cannot override |

### Navigation Structure
- **Desktop Admin (AdminHeader.tsx)**: Full dropdown menu (Dashboard, Guests, Event, Comms, System)
- **Mobile Admin (MobileTabBar.tsx)**: 5 primary tabs (Guests, Tables, Email, Check-in, Applicants)
- **Staff View**: Only QR Scanner (`/checkin`) + Check-in Log

### Staff Login Behavior
```typescript
// Staff users auto-redirect to /checkin
if (session.user.role === 'staff') {
  redirect('/checkin');
}
```

### Check-in Override
- **Admin**: Can override duplicate check-in (yellow card → "Admin Override" button)
- **Staff**: Cannot override; must call admin for duplicates

## Generated Documentation (docs/)

Comprehensive project documentation generated via exhaustive codebase scan (2026-02-15). **Start here: [docs/index.md](docs/index.md)**

| Document | Content |
|----------|---------|
| [index.md](docs/index.md) | Master index - entry point to all documentation |
| [architecture.md](docs/architecture.md) | Layered architecture, auth, security, integrations, deployment |
| [data-models.md](docs/data-models.md) | 16 Prisma models, ER diagram, enums, indexes, constraints |
| [api-contracts.md](docs/api-contracts.md) | **44 API endpoints** - full request/response specs, auth matrix, security audit |
| [component-inventory.md](docs/component-inventory.md) | ~80+ React components catalog, state management patterns |
| [source-tree-analysis.md](docs/source-tree-analysis.md) | Full annotated directory tree (700+ files) |
| [development-guide.md](docs/development-guide.md) | Setup, commands, conventions, deployment |
| [project-overview.md](docs/project-overview.md) | Project summary, tech stack, roles, status |

## State Management Patterns

**No external state library** - the project uses only React built-in primitives:

| Pattern | Usage | Where |
|---------|-------|-------|
| `useState` | ~130+ calls total | Every client component |
| `useEffect` | ~30+ | Data fetching, cleanup |
| React Context | 2 providers | `LanguageContext` (i18n), `SessionProvider` (NextAuth) |
| `useRef` | 2 components | QRScanner (scanner instance), SeatingMap (canvas) |
| localStorage | 2 keys | `admin-language` (HU/EN), `pwa-auth-code` (PWA auth) |
| URL state | 4 pages | `useSearchParams` (register, payment) |
| `useReducer` | **Not used** | - |
| Form library | **None** | Manual useState + onChange (no react-hook-form/formik) |
| SWR/React Query | **None** | Manual fetch + useEffect pattern everywhere |

### Key Custom Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useLanguage()` | `lib/i18n/LanguageContext.tsx` | i18n translation + language switch |
| `useGuestList()` | `app/admin/guests/hooks/useGuestList.ts` | Guest list CRUD, filter, paginate, sort |
| `useSeatingDnd()` | `app/admin/seating/hooks/useSeatingDnd.ts` | @dnd-kit drag-and-drop state |

### Common Data Fetching Pattern (repeated in ~15 components)
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => { fetchData(); }, []);
async function fetchData() {
  setLoading(true);
  const res = await fetch('/api/...');
  setData(await res.json());
  setLoading(false);
}
```

## Important Context

### Primary Documentation
The complete functional requirements specification is in [docs/FUNKCIONALIS-KOVETELMENY.md](docs/FUNKCIONALIS-KOVETELMENY.md) (997 lines, Hungarian). This is the **source of truth** for:
- Detailed API specifications
- Database schema definitions
- Email templates content
- Validation rules
- Performance requirements (< 2s page load, < 100ms DB queries)
- Scalability targets (500+ concurrent users, 10K guest capacity)

**Tech Stack Decision**: Originally specified PHP/Slim, migrated to **Next.js** for faster development and better React-Konva DnD support.

### BMad Method Framework
This project uses the BMad Method (v6.0.0) for AI-assisted development. Installed modules:
- **BMM** (BMad Method Module): Project management workflows, 8 specialized agents (PM, Architect, DEV, TEA, etc.)
- **BMB** (BMAD Builder): Module and workflow creation tools
- **CIS** (Creative Innovation Studio): Brainstorming and design workflows

Use BMad workflows for complex tasks:
- `/bmad:bmm:workflows:workflow-init` - Initialize project tracking
- `/bmad:bmm:agents:architect` - Technical design decisions
- `/bmad:bmm:agents:dev` - Implementation guidance

### Development Notes
- **Language**:
  - **Communication with user**: Hungarian (Javo prefers Hungarian)
  - **All documentation**: Hungarian (PRD, tech-spec, architecture, etc.)
  - **Code & comments**: English (industry best practice)
- **i18n (Admin Dashboard)**:
  - **Languages**: Hungarian (default), English
  - **Implementation**: React Context (`LanguageContext`) with `useLanguage()` hook
  - **Persistence**: localStorage key `admin-language`
  - **Files**: `lib/i18n/translations.ts` (~1500 lines), `lib/i18n/LanguageContext.tsx`, `lib/i18n/admin-help-translations.ts` (~800 lines)
  - **Usage**: `const { t, language, setLanguage } = useLanguage(); t('keyName')`
  - **Scope**: Admin pages only (wrapped in `AdminLayout > LanguageProvider`)
- **BMad Method MANDATORY**: Always use BMad agents and workflows - this is critical!
- **Mobile-First**: Tailwind CSS responsive design, min 44x44px touch targets, WCAG 2.1 AA contrast
- **Performance**: Target < 2s LCP, < 100ms avg DB query, < 500ms API response (95th percentile)
- **Seating Map**: React-Konva canvas (FloorPlanCanvas) + @dnd-kit (DraggableGuest/DroppableTable)
- **UI Icons**: Phosphor Icons (@phosphor-icons/react) - consistent across admin & PWA
- **PWA**: Service Worker + Web Push (Firebase FCM), code auth (CEOG-XXXXXX), MobileFooter branding
- **Zod validation**: Schemas defined in `lib/validations/` but NOT consistently applied across all API endpoints
- **TypeScript**: `strict: false` in tsconfig.json, path alias `@/*` -> root

## VPS Deployment (Production)

```bash
# Server Management (PM2)
pm2 status                                   # Check application status
pm2 restart ceog                             # Restart application
pm2 logs ceog                                # View application logs
pm2 logs ceog --lines 100                    # View last 100 log lines

# Deploy Changes (RECOMMENDED)
npm run deploy                               # Build + auto-copy static + PM2 restart

# Manual Deploy (alternative)
npm run build                                # Build Next.js + postbuild copies static files
pm2 restart ceog                             # Apply changes

# Database Operations
npx prisma db push                           # Push schema changes
npx prisma db seed                           # Seed/reset test data

# Nginx
sudo nginx -t                                # Test nginx config
sudo systemctl reload nginx                  # Apply nginx changes
```

### Standalone Build Architecture
A projekt Next.js `output: 'standalone'` módot használ (kisebb footprint, gyorsabb cold start).

**Static fájlok kiszolgálása (dual approach):**
1. **Nginx** közvetlenül szolgálja a `/_next/static/*` fájlokat az `.next/static/` mappából
2. **postbuild script** automatikusan másolja a static fájlokat a standalone mappába (backup)

Ez biztosítja, hogy a static fájlok mindig elérhetők legyenek build után.

### Test Credentials (Seed Data)
```
Admin: admin@ceogala.test / Admin123!
Staff: staff@ceogala.test / Staff123!
```

### Database Seed Script

**Location:** `scripts/seed-production.js` (JavaScript, no ts-node required)

**Run:** `node scripts/seed-production.js`

**Test Data Created (~22 guests covering all cases):**

| Category | Count | Description |
|----------|-------|-------------|
| Users | 2 | Admin + Staff accounts |
| Tables | 5 | 2 VIP + 3 Standard tables |
| Invited Guests | 3 | invited/registered/approved statuses |
| Paying Single | 2 | paid (card) + pending (bank transfer) |
| Paying Paired | 5 pairs | Various payment methods & statuses |
| Unassigned | 6 | 5 single + 1 paired for DnD testing |
| Applicants | 2 | pending_approval + rejected |

**Test Email Addresses:**
```
# Invited (free)
vip1@ceogala.test - Kovács János (invited)
vip2@ceogala.test - Nagy Éva (registered)
vip3@ceogala.test - Szabó Péter (approved, seated)

# Paying Single
paying1@ceogala.test - Kiss Anna (paid, card)
paying2@ceogala.test - Tóth Gábor (pending, bank_transfer)

# Paying Paired (with partners)
paired1@ceogala.test - Molnár László + Réka (paid, bank_transfer)
paired2@ceogala.test - Horváth Attila + Krisztina (paid, card)
paired3@ceogala.test - Szilágyi Márton + Nóra (pending, card)
paired4@ceogala.test - Bíró Tamás + Eszter (paid, bank_transfer)
paired5@ceogala.test - Vincze Gergő + Lilla (pending, bank_transfer)

# Unassigned (for seating DnD testing)
unassigned1-5@ceogala.test - 5 single guests
paired-unassigned@ceogala.test - Papp Zoltán + Judit (paired)
```

### Server Paths
- Application: `/var/www/ceog`
- Nginx config: `/etc/nginx/sites-available/ceog`
- Environment: `/var/www/ceog/.env`
