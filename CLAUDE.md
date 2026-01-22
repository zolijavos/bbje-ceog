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
- **MySQL 8.0+** (production) or **PostgreSQL 14+**
- **Prisma ORM** - Type-safe database access with migrations
- Alternative: **Drizzle ORM** for lighter weight

### External Services
- **Stripe SDK (Node.js)** - Payment processing
- **Nodemailer** - Email delivery (SMTP provider to be determined)
- **qrcode** npm package - QR code generation
- **jsonwebtoken** - JWT token handling

### Frontend
- **React 18** - UI components
- **Tailwind CSS** - Utility-first styling
- **React-Konva** or **React-DnD-Kit** - Interactive drag-and-drop seating maps
- **html5-qrcode** - Mobile QR scanning
- **i18n (Internationalization)** - Hungarian (default) & English, Context-based with localStorage persistence

### Hosting & Infrastructure
- **Current Production**: Hetzner VPS (46.202.153.178) with PM2 + Nginx
- **Database**: MySQL 8.0 on same VPS
- Alternative deployment: **Vercel** (free tier) + **PlanetScale** (MySQL)
- Minimum VPS: 2GB RAM, 20GB SSD

## Architecture

### Next.js App Router Pattern
```
app/                    # Next.js App Router (routing + API)
├── (routes)/          # Page routes
├── api/               # API Route Handlers (backend endpoints)
└── components/        # React components

lib/                   # Business logic layer
├── services/          # Business logic (registration, payment, check-in)
├── db/               # Prisma client & database utilities
└── utils/            # Helper functions

prisma/
└── schema.prisma     # Database schema & migrations
```

### Server & Client Components
- **Server Components** (default) - Fetch data server-side, zero JS to client
- **Client Components** (`'use client'`) - Interactive UI (drag-drop, QR scanner)
- **API Routes** (`app/api/**/route.ts`) - REST endpoints for client interactions

### Project Structure
```
app/                        # Next.js App Router
├── (auth)/                # Authentication grouped routes
├── admin/                 # Admin dashboard (12 sections)
│   ├── guests/           # Guest CRUD, import, bulk actions
│   ├── tables/           # Table management
│   ├── seating/          # Drag-drop seating map
│   ├── payments/         # Payment status & approvals
│   ├── checkin/          # Check-in dashboard
│   ├── checkin-log/      # Check-in history
│   ├── applicants/       # Applicant approval
│   ├── email/            # Email sending
│   ├── changelog/        # Version changelog with test links
│   └── release-testing/  # Manual release test steps by version
├── apply/                 # Public applicant registration
├── checkin/              # Mobile QR scanner
├── pwa/                  # Progressive Web App for guests
│   ├── dashboard/        # Guest dashboard
│   ├── profile/          # Profile view/edit
│   ├── ticket/           # QR ticket display
│   └── table/            # Table info
├── register/             # Magic link registration
│   ├── vip/              # Invited guest flow (free ticket)
│   └── paid/             # Paid flow with billing
├── payment/              # Payment pages
│   ├── success/          # Stripe success redirect
│   └── cancel/           # Stripe cancel redirect
├── api/                  # 30+ API endpoints
│   ├── admin/            # Admin CRUD operations
│   ├── registration/     # Guest registration
│   ├── stripe/           # Payment & webhooks
│   ├── checkin/          # Check-in validation
│   └── pwa/              # PWA-specific APIs
└── components/           # React components

lib/                      # Business logic & utilities
├── services/            # Core business logic
├── validations/         # Zod schemas
├── utils/               # Helper functions
├── i18n/                # Internationalization (HU/EN translations)
└── prisma.ts            # Prisma client singleton

prisma/
├── schema.prisma        # Database schema (11 models)
└── migrations/          # Auto-generated migrations

tests/
├── unit/                # Vitest unit tests
└── e2e/                 # Playwright E2E tests
    └── fixtures/        # Custom test fixtures
```

## Database Schema

11 Prisma models in [prisma/schema.prisma](prisma/schema.prisma):

### Core Tables
- **Guest** - Guest list with profile (email UNIQUE, name, title, phone, company, position, guest_type, dietary_requirements, seating_preferences, pwa_auth_code, push_token)
- **Registration** - Registration data (guest_id FK UNIQUE, ticket_type, payment_method, qr_code_hash, GDPR consent, cancellation acceptance)
- **Payment** - Stripe payments (registration_id FK UNIQUE, stripe_session_id, amount, currency, status, paid_at)
- **Checkin** - Check-in log (registration_id UNIQUE, guest_id UNIQUE, staff_user_id FK, method, is_override)
- **BillingInfo** - Billing details for paying guests (registration_id FK UNIQUE, name, company, tax_number, address)

### Seating Management
- **Table** - Table definitions (name UNIQUE, capacity, type, pos_x, pos_y, status)
- **TableAssignment** - Guest-table mapping (table_id FK, guest_id FK UNIQUE, seat_number)

### Admin & System
- **User** - Admin accounts (email UNIQUE, password_hash bcrypt, role: admin/staff)
- **EmailLog** - Email delivery tracking (guest_id FK, email_type, status, error_message)
- **EmailTemplate** - Reusable email templates (slug UNIQUE, subject, html_body, text_body, variables)
- **RateLimitEntry** - Rate limiting (key UNIQUE, attempts, expires_at)

### Enums
- GuestType: `invited`, `paying_single`, `paying_paired`, `applicant`
- RegistrationStatus: `invited`, `registered`, `approved`, `declined`, `pending_approval`, `rejected`
- TicketType: `vip_free`, `paid_single`, `paid_paired`
- PaymentMethod: `card`, `bank_transfer`
- PaymentStatus: `pending`, `paid`, `failed`, `refunded`
- TableStatus: `available`, `full`, `reserved`
- UserRole: `admin`, `staff`

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

### Guest Registration
- `GET /register?code={hash}&email={email}` - Magic link validation & registration form
- `POST /api/registration/submit` - Submit registration data
- `POST /api/registration/partner` - Add paired ticket partner details

### Payment Processing
- `POST /api/stripe/create-checkout` - Create Stripe Checkout Session
- `POST /api/stripe/webhook` - Stripe webhook receiver (signature validation required)
- `GET /payment/success` - Successful payment redirect
- `GET /payment/cancel` - Cancelled payment redirect

### Check-in System
- `POST /api/checkin/validate` - Validate QR code JWT token
- `POST /api/checkin/submit` - Record check-in event

### Admin Dashboard
- `GET /api/admin/guests` - Guest list with filtering (category, status, table) and pagination
- `POST /api/admin/guests/import` - CSV guest list import
- `PATCH /api/admin/guests/{id}/approve-payment` - Manual payment approval (bank transfer)
- `GET|POST /api/admin/tables` - Table list / create table
- `PATCH|DELETE /api/admin/tables/{id}` - Update / delete table
- `POST /api/admin/table-assignments` - Assign guest to table
- `GET /api/admin/seating-export` - Export seating arrangement as CSV
- `GET /api/admin/checkin-log` - Check-in event log with filters
- `GET /api/admin/applicants` - List pending applicants
- `POST /api/admin/applicants/{id}/approve` - Approve applicant & send magic link
- `POST /api/admin/applicants/{id}/reject` - Reject applicant with reason

### Email Management (Admin)
- `GET /api/admin/scheduled-emails` - List scheduled/sent emails
- `POST /api/admin/scheduled-emails/bulk` - Bulk email sending (batch processing)
- `DELETE /api/admin/scheduled-emails/{id}` - Cancel pending scheduled email

### Email Service Features
- **Retry Logic**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Rate Limiting**: 5 per type/hour, 20 total/hour per guest
- **Delivery Logging**: All emails logged to `EmailLog` table
- **Template System**: DB templates with variable substitution + hardcoded fallbacks
- **CID Attachments**: Inline images (QR codes) via Content-ID

## Security Requirements

### Authentication Methods
1. **Magic Link (Guests)**
   - Hash: SHA-256 of `email + APP_SECRET + timestamp`
   - Expiry: **24 hours** from generation
   - Single-use only (cleared after successful registration)
   - Rate limit: Max 5 emails per type per hour, 20 total per hour per guest

2. **Session-Based (Admins)**
   - Password hash: bcrypt with cost=12
   - Session cookie: HttpOnly, Secure, SameSite=Strict
   - Optional: 2FA with Google Authenticator

3. **JWT Tokens (QR Tickets)**
   - Algorithm: HMAC-SHA256 (HS256)
   - Secret: `APP_QR_SECRET` (min 64 chars)
   - Expiry: 48 hours (event day - 1 midnight)
   - Payload: `{registration_id, guest_id, ticket_type, iat, exp}`

### Critical Security Rules
- **SQL Injection**: Prisma ORM handles parameterized queries - NEVER use raw SQL with string concatenation
- **XSS**: React auto-escapes by default; avoid `dangerouslySetInnerHTML`
- **CSRF**: NextAuth handles CSRF tokens for admin sessions
- **HTTPS**: Required in production (configure via Nginx + Let's Encrypt)
- **Stripe Webhooks**: MUST validate signature using `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`

### Environment Variables
Critical secrets in `.env.local` (gitignored):
```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ceog"
# Or PostgreSQL: postgresql://user:password@localhost:5432/ceog

# App Secrets
APP_SECRET=min_64_char_random_string_for_magic_links
QR_SECRET=min_64_char_random_string_for_jwt

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (to be configured later)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@ceogala.hu
SMTP_PASS=smtp_password

# NextAuth (for admin sessions)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_32_char_string
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
| Check-in Log | ✅ View + export | ❌ No access |
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

## Important Context

### Primary Documentation
The complete functional requirements specification is in [docs/FUNKCIONALIS-KOVETELMENY.md](docs/FUNKCIONALIS-KOVETELMENY.md) (997 lines, Hungarian). This is the **source of truth** for:
- Detailed API specifications
- Database schema definitions (originally MySQL, adaptable to PostgreSQL)
- Email templates content
- Validation rules
- Performance requirements (< 2s page load, < 100ms DB queries)
- Scalability targets (500+ concurrent users, 10K guest capacity)

**Tech Stack Decision**: Originally specified PHP/Slim, but migrated to **Next.js** for:
- Faster development (1 month timeline)
- Simpler drag-and-drop seating map (React-Konva)
- Better developer experience
- Easier deployment (Vercel free tier)

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
  - **Files**: `lib/i18n/translations.ts`, `lib/i18n/LanguageContext.tsx`
  - **Usage**: `const { t, language, setLanguage } = useLanguage(); t('keyName')`
- **BMad Method MANDATORY**: Always use BMad agents and workflows - this is critical!
- **Mobile-First**: Tailwind CSS responsive design, min 44x44px touch targets, WCAG 2.1 AA contrast
- **Performance**: Target < 2s LCP, < 100ms avg DB query, < 500ms API response (95th percentile)
- **Email**: Nodemailer with SMTP (queue/batch processing for bulk sends)
- **Seating Map**: React-Konva canvas with drag-and-drop
- **UI Icons**: Phosphor Icons (consistent across admin & PWA)
- **PWA**: Service Worker + Web Push (Firebase FCM)

## Recent UI/UX Improvements

### MobileFooter Component
- **Location**: `app/components/MobileFooter.tsx`
- **Purpose**: Fixed footer on all mobile views with "Built By MyForge Labs" branding
- **Features**: Semi-transparent with backdrop blur, configurable z-index for stacking
- **Usage**:
  ```tsx
  <MobileFooter bottomOffset="3.5rem" zIndex={50} />
  ```

### Email Rate Limiting
Enhanced rate limiting in `lib/services/rate-limit.ts`:
- **Per-type limit**: Max 5 emails per type per hour per guest
- **Global limit**: Max 20 emails per hour per guest
- **Retry logic**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Database**: `RateLimitEntry` model with auto-cleanup

### Admin Dashboard Help
- **Admin Guide**: `/admin/help` - Searchable FAQ with 50+ entries, 12 categories
- **Public FAQ**: `/help` - Registration guide for guests
- **i18n**: Full HU/EN translations in `lib/i18n/admin-help-translations.ts`

### Diagram Dashboard
- **Location**: `docs/diagrams/diagram-dashboard.html`
- **Diagrams**: 28 SVG diagrams (architecture, flows, wireframes, test cases, dataflow)
- **New in v2**: Admin vs Staff Roles, Check-in Override Flow, Email Rate Limiting, Component Architecture
- **Features**: Dark mode, HU/EN toggle, notes with CSV export/import

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
