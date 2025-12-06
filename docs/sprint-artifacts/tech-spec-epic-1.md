# Epic Technical Specification: Core Registration (MVP)

Date: 2025-11-27
Author: Javo!
Epic ID: 1
Status: Draft

---

## Overview

Az **Epic 1: Core Registration (MVP)** a CEO Gala regisztrációs rendszer alapvető funkcionalitását biztosítja, amely lehetővé teszi az adminok számára a vendéglista kezelését, a meghívók automatikus kiküldését, valamint a vendégek számára a passwordless (magic link alapú) regisztrációt. Ez az epic az első működőképes verzió (MVP), amely teljes vertikális szeleteket szállít - mindegyik story tartalmazza a frontend, backend és database rétegeket.

Az epic fő célja egy invitation-only regisztrációs folyamat létrehozása, ahol a VIP vendégek egyszerű "Confirm Attendance" kattintással regisztrálhatnak, míg a fizető vendégek (PAID_SINGLE/PAID_PAIRED) kitölthetik számlázási adataikat és partner információikat. A fizetési integráció az Epic 2-ben kerül implementálásra, így ez az epic csak a regisztrációs formokat és az adatbázis alapokat tartalmazza.

**Kiemelt tulajdonságok:**
- CSV-alapú vendéglista import validációval (max 10,000 sor)
- Magic link authentication (SHA-256 hash, 5 perces expiry)
- Dual-flow regisztráció (VIP instant vs Paid form-based)
- Admin dashboard vendégkezeléssel (CRUD operations)
- Email service integráció (Nodemailer + SMTP)

## Objectives and Scope

### In Scope

**Epic 1 céljai:**
1. **Vendéglista Menedzsment** - Admin CSV import, manuális CRUD operations
2. **Magic Link Authentication** - Passwordless vendég bejelentkezés email-alapú tokennel
3. **VIP Regisztráció** - Instant confirmation flow QR jegy placeholder-rel
4. **Paid Regisztráció Form** - Számlázási és partner adatok gyűjtése (fizetés Epic 2-ben)
5. **Admin Dashboard** - Vendéglista szűrés, keresés, bulk email küldés
6. **Email Service** - Magic link és confirmation email küldés

**Lefedett FR-ek (FUNKCIONALIS-KOVETELMENY.md):**
- FR-2.1.1: CSV Vendéglista Importálás
- FR-2.1.2: Email Meghívó Küldése (magic link)
- FR-2.2.1: Magic Link Validáció
- FR-2.2.2: VIP Vendég Regisztráció (form part)
- FR-2.2.3: Fizető Vendég Regisztráció (form only, no payment)
- FR-2.7.1: Vendéglista Szűrés & Keresés
- FR-2.7.2: Vendég CRUD

**9 User Story:**
- Story 1.1: Project Foundation & Database Setup ✅ (már nagyrészt kész)
- Story 1.2: Admin Authentication & Session Management
- Story 1.3: Email Service Setup & Magic Link Sender
- Story 1.4: CSV Guest List Import
- Story 1.5: Magic Link Validation & Registration Landing
- Story 1.6: VIP Guest Registration (Instant Confirmation)
- Story 1.7: Paid Guest Registration Form (No Payment Yet)
- Story 1.8: Admin Guest List Dashboard
- Story 1.9: Admin Guest CRUD Operations

### Out of Scope

**Epic 2-re halasztva:**
- Stripe Checkout Session integráció
- QR kód JWT generálás és tárolás
- E-ticket PDF generálás és email küldés
- Payment status tracking és webhook handling
- Manuális payment approval (bank transfer)

**Epic 3-ra halasztva:**
- Mobil QR code scanner app
- Check-in validáció és duplikáció kezelés
- Check-in log dashboard

**Epic 4-re halasztva:**
- Table CRUD és assignment logic
- Drag-and-drop seating map (@dnd-kit/core)
- Bulk CSV table assignment
- Seating export funkcionalitás

**Soha nem scope:**
- Multi-event support (csak 1 esemény)
- Real-time chat vagy notifications
- Third-party social login (csak email-based magic link)

## System Architecture Alignment

**Next.js 14+ App Router Pattern:**

Ez az epic a Next.js App Router full-stack architektúrát használja, ahol a frontend (React Server + Client Components) és backend (API Route Handlers) egyetlen codebase-ben vannak. Az alábbi komponensek kerülnek létrehozásra:

**Frontend Réteg (app/ directory):**
- `app/(auth)/register/page.tsx` - Magic link landing page (Server Component)
- `app/(auth)/register/vip/page.tsx` - VIP regisztrációs flow (Client Component)
- `app/(auth)/register/paid/page.tsx` - Paid regisztrációs multi-step form (Client Component)
- `app/admin/login/page.tsx` - Admin login form (Client Component)
- `app/admin/guests/page.tsx` - Guest list dashboard (Server Component + Client filters)
- `app/admin/guests/import/page.tsx` - CSV import UI (Client Component)
- `app/components/forms/` - Reusable form components (React Hook Form + Zod)
- `app/components/ui/` - UI primitives (Button, Table, Modal, etc.)

**Backend API Réteg (app/api/):**
- `app/api/auth/[...nextauth]/route.ts` - NextAuth.js Credentials provider
- `app/api/registration/submit/route.ts` - Paid guest registration form submit
- `app/api/registration/confirm/route.ts` - VIP confirmation endpoint
- `app/api/admin/guests/route.ts` - Guest list CRUD (GET, POST)
- `app/api/admin/guests/[id]/route.ts` - Single guest update/delete (PATCH, DELETE)
- `app/api/admin/guests/import/route.ts` - CSV upload and bulk insert
- `app/api/email/send-magic-link/route.ts` - Magic link email trigger

**Service Layer (lib/services/):**
- `lib/services/registration.ts` - Guest registration business logic
  - `processVIPRegistration()`
  - `processPaidRegistration()`
  - `importGuestsFromCSV()`
  - `getGuestList(filters, pagination)`
- `lib/services/email.ts` - Email delivery abstraction
  - `sendMagicLinkEmail(guest)`
  - `sendConfirmationEmail(guest)`
- `lib/auth/magic-link.ts` - Magic link generation/validation
  - `generateMagicLinkHash(email, timestamp)`
  - `validateMagicLink(hash, email)`

**Database Layer (Prisma ORM):**
- `prisma/schema.prisma` - 8 táblás séma (már definiálva Story 1.1-ben)
- `lib/db/prisma.ts` - Prisma Client singleton pattern
- 4 fő tábla használata Epic 1-ben:
  - `guests` - Vendég master tábla
  - `registrations` - Regisztrációs adatok (ticket_type, billing info)
  - `users` - Admin accounts (bcrypt password hash)
  - `email_logs` - Email delivery tracking

**Middleware & Authentication:**
- `middleware.ts` - Route protection (admin routes require session)
- NextAuth.js session management (JWT strategy, HttpOnly cookies)
- Role-based access control (admin, staff roles)

**Tech Stack Alignment:**
- ✅ Next.js 14.2+ App Router
- ✅ React 18 (Server + Client Components pattern)
- ✅ TypeScript 5.5+ (type-safe development)
- ✅ Tailwind CSS 3.4+ (mobile-first responsive design)
- ✅ Prisma 5.19+ ORM (MySQL 8.0+ provider)
- ✅ NextAuth.js 4.24+ (admin authentication)
- ✅ Nodemailer 7.0+ (email service)
- ✅ papaparse vagy csv-parser (CSV parsing)
- ✅ bcryptjs (password hashing)
- ✅ zod (form validation schemas)

## Detailed Design

### Services and Modules

| Service Module | Felelősség | Fő Funkciók | Input | Output | Owner |
|----------------|-----------|-------------|-------|--------|-------|
| **registration.ts** | Guest regisztráció és vendéglista menedzsment | `processVIPRegistration()`, `processPaidRegistration()`, `importGuestsFromCSV()`, `getGuestList()`, `createGuest()`, `updateGuest()`, `deleteGuest()` | Guest form data, CSV file, filters | Guest object, validation errors, list with pagination | lib/services/ |
| **email.ts** | Email delivery orchestration | `sendMagicLinkEmail()`, `sendConfirmationEmail()`, `sendBulkEmails()`, `logEmailDelivery()` | Guest data, email template type | Email delivery status, EmailLog record | lib/services/ |
| **magic-link.ts** | Magic link generation and validation | `generateMagicLinkHash()`, `validateMagicLink()`, `isExpired()`, `checkRateLimit()` | Email, timestamp, hash | Hash string, validation result | lib/auth/ |
| **validation.ts** | Form and CSV data validation | `validateGuestData()`, `validateCSVRow()`, `validateEmail()`, `sanitizeInput()` | Form data, CSV row | Validation errors array, sanitized data | lib/utils/ |
| **csv.ts** | CSV parsing and processing | `parseCSV()`, `validateCSVFormat()`, `bulkInsertGuests()` | CSV file buffer | Parsed rows array, error log | lib/utils/ |

**Service Dependencies:**
- `registration.ts` → `email.ts` (send magic links after import)
- `registration.ts` → `validation.ts` (validate guest data)
- `registration.ts` → `csv.ts` (CSV import flow)
- `email.ts` → Nodemailer (external SMTP)
- `magic-link.ts` → crypto (Node.js native, SHA-256)

**Error Handling Pattern:**
Minden service Result<T, Error> pattern-t használ:
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

### Data Models and Contracts

**Epic 1 Primary Tables (4 of 8 total):**

#### 1. `guests` Table
```prisma
model Guest {
  id                     Int                @id @default(autoincrement())
  email                  String             @unique @db.VarChar(255)
  name                   String             @db.VarChar(255)
  guest_type             GuestType          // vip, paying_single, paying_paired
  registration_status    RegistrationStatus @default(invited)
  magic_link_hash        String?            @db.VarChar(255)
  magic_link_expires_at  DateTime?
  created_at             DateTime           @default(now())
  updated_at             DateTime           @updatedAt
}
```
**Purpose:** Master vendég tábla, minden vendég egy rekord
**Key Constraints:**
- `email` UNIQUE (primary identifier)
- `registration_status` default: invited
- `magic_link_expires_at` nullable (only set when magic link sent)

**Indexes:**
- `@@index([email])` - fast lookup by email
- `@@index([registration_status])` - filter by status

---

#### 2. `registrations` Table
```prisma
model Registration {
  id                  Int              @id @default(autoincrement())
  guest_id            Int              @unique
  ticket_type         TicketType       // vip_free, paid_single, paid_paired
  partner_name        String?          @db.VarChar(255)
  partner_email       String?          @db.VarChar(255)
  billing_name        String?          @db.VarChar(255)
  billing_address     String?          @db.Text
  billing_tax_number  String?          @db.VarChar(100)
  payment_method      PaymentMethod?   // card, bank_transfer (NULL in Epic 1)
  qr_code_hash        String?          @unique @db.VarChar(500) // Epic 2
  registered_at       DateTime         @default(now())
}
```
**Purpose:** Regisztrációs adatok tárolása (form submissions)
**Epic 1 Usage:**
- VIP guests: csak `ticket_type=vip_free` mentése
- Paid guests: billing + partner adatok mentése, `payment_method=NULL` (Epic 2-ben lesz kitöltve)

**Key Constraints:**
- `guest_id` UNIQUE (1:1 relation with Guest)
- `qr_code_hash` UNIQUE (Epic 2-ben kerül generálásra)

---

#### 3. `users` Table
```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique @db.VarChar(255)
  password_hash String    @db.VarChar(255) // bcrypt cost=12
  name          String    @db.VarChar(255)
  role          UserRole  @default(staff) // admin, staff
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
}
```
**Purpose:** Admin és staff felhasználók (NextAuth.js authentication)
**Epic 1 Usage:**
- Admin login/session management
- Password: bcrypt hash (bcryptjs library, cost factor: 12)
- Role-based access: admin (full access), staff (check-in only - Epic 3)

**Seed Data:**
- 2 admin users: `admin@ceogala.test` / `Admin123!`, `janos@ceogala.test` / `Admin456!`

---

#### 4. `email_logs` Table
```prisma
model EmailLog {
  id            Int       @id @default(autoincrement())
  guest_id      Int
  email_type    String    @db.VarChar(100) // magic_link, confirmation
  recipient     String    @db.VarChar(255)
  subject       String    @db.VarChar(500)
  status        String    @default("sent") @db.VarChar(50) // sent, failed
  error_message String?   @db.Text
  sent_at       DateTime  @default(now())
}
```
**Purpose:** Email delivery tracking és rate limiting
**Epic 1 Email Types:**
- `magic_link` - Meghívó email magic linkkel
- `confirmation` - VIP vendég confirmation email

**Rate Limiting Logic:**
```typescript
// Max 5 magic link emails per hour per guest
const recentEmails = await prisma.emailLog.count({
  where: {
    guest_id: guestId,
    email_type: 'magic_link',
    sent_at: { gte: new Date(Date.now() - 3600000) } // 1 hour ago
  }
});
if (recentEmails >= 5) throw new Error('Rate limit exceeded');
```

---

**Enum Types:**

```typescript
enum GuestType {
  vip              // Free ticket, instant confirmation
  paying_single    // Paid ticket, 1 person
  paying_paired    // Paid ticket, 2 people (main + partner)
}

enum RegistrationStatus {
  invited      // Magic link sent, not yet registered
  registered   // Form submitted (Epic 1 end state)
  approved     // Payment confirmed (Epic 2)
  declined     // Guest declined invitation
}

enum TicketType {
  vip_free       // VIP category
  paid_single    // Single paid ticket
  paid_paired    // Paired paid ticket
}

enum UserRole {
  admin   // Full system access
  staff   // Check-in only (Epic 3)
}
```

---

**TypeScript Type Definitions (auto-generated by Prisma):**

```typescript
import type { Guest, Registration, User, EmailLog } from '@prisma/client';

type GuestWithRegistration = Guest & {
  registration: Registration | null;
};

type PaginatedGuests = {
  guests: GuestWithRegistration[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
```

### APIs and Interfaces

**Epic 1 API Endpoints (Next.js App Router Route Handlers):**

#### Authentication & Session

**`POST /api/auth/[...nextauth]`** - NextAuth.js Credentials Provider
- **Purpose:** Admin login authentication
- **Request Body:**
```typescript
{
  email: string;      // admin@ceogala.test
  password: string;   // Admin123!
}
```
- **Response:** Session cookie (HttpOnly, Secure, SameSite=Strict)
- **Errors:** 401 Unauthorized (invalid credentials), 429 Rate limited

---

#### Guest Registration

**`POST /api/registration/confirm`** - VIP Guest Confirmation
- **Purpose:** VIP vendég attendance confirmation
- **Auth:** Magic link session cookie (guest_id in session)
- **Request Body:**
```typescript
{
  guest_id: number;
  attendance: boolean;  // true = confirm, false = decline
}
```
- **Response:**
```typescript
{
  success: true;
  message: "Registration confirmed";
  registration: Registration;
}
```
- **Side Effects:**
  - Update `guests.registration_status` → `registered` or `declined`
  - Insert `registrations` record (if confirmed)
  - Send confirmation email
- **Errors:** 400 Bad Request, 404 Guest not found

**`POST /api/registration/submit`** - Paid Guest Registration Form
- **Purpose:** Paid vendég form submission (számlázási + partner adatok)
- **Auth:** Magic link session cookie
- **Request Body:**
```typescript
{
  guest_id: number;
  ticket_type: 'paid_single' | 'paid_paired';
  billing_name: string;
  billing_address: string;
  billing_tax_number?: string;
  partner_name?: string;       // required if paid_paired
  partner_email?: string;      // required if paid_paired
}
```
- **Validation:** Zod schema (email format, required fields)
- **Response:**
```typescript
{
  success: true;
  registration: Registration;
}
```
- **Side Effects:**
  - Update `guests.registration_status` → `registered`
  - Insert `registrations` record with form data
  - `payment_method` remains NULL (Epic 2)
- **Errors:** 400 Validation error, 409 Duplicate registration

---

#### Admin Guest Management

**`GET /api/admin/guests`** - Guest List with Filters & Pagination
- **Purpose:** Admin dashboard vendéglista lekérdezés
- **Auth:** NextAuth session (admin role required)
- **Query Params:**
```typescript
{
  page?: number;          // default: 1
  limit?: number;         // default: 25 (max: 100)
  search?: string;        // email or name (case-insensitive LIKE)
  guest_type?: 'vip' | 'paying_single' | 'paying_paired' | 'all';
  registration_status?: 'invited' | 'registered' | 'approved' | 'declined' | 'all';
}
```
- **Response:**
```typescript
{
  guests: GuestWithRegistration[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
```
- **Performance:** Index-backed queries, pagination limit enforcement

**`POST /api/admin/guests`** - Create New Guest
- **Purpose:** Manuális vendég hozzáadás
- **Auth:** NextAuth admin session
- **Request Body:**
```typescript
{
  email: string;              // UNIQUE constraint
  name: string;
  guest_type: GuestType;
  phone?: string;
  company?: string;
}
```
- **Response:**
```typescript
{
  success: true;
  guest: Guest;
}
```
- **Errors:** 400 Validation error, 409 Email already exists

**`PATCH /api/admin/guests/[id]`** - Update Guest
- **Purpose:** Vendég adatok szerkesztése
- **Auth:** NextAuth admin session
- **Request Body:** Partial<Guest> (all fields optional except email - immutable)
- **Response:** Updated Guest object
- **Errors:** 404 Not found, 400 Validation error

**`DELETE /api/admin/guests/[id]`** - Delete Guest
- **Purpose:** Vendég törlése CASCADE-del
- **Auth:** NextAuth admin session
- **Response:**
```typescript
{
  success: true;
  message: "Guest deleted";
}
```
- **Side Effects:** CASCADE delete registrations, checkins, table_assignments, email_logs
- **Errors:** 404 Not found

**`POST /api/admin/guests/import`** - CSV Bulk Import
- **Purpose:** CSV fájl feltöltés és bulk insert
- **Auth:** NextAuth admin session
- **Request:** multipart/form-data with `file` field (CSV)
- **CSV Format:**
```csv
email,name,guest_type
john@example.com,John Doe,vip
jane@example.com,Jane Smith,paying_single
```
- **Response:**
```typescript
{
  success: true;
  imported: number;
  errors: Array<{ row: number; email: string; error: string }>;
}
```
- **Validation:** Email format, duplicate check, max 10,000 rows
- **Errors:** 400 Invalid CSV format, 413 File too large

---

#### Email Sending

**`POST /api/email/send-magic-link`** - Send Magic Link Email
- **Purpose:** Magic link email kiküldés (manual vagy bulk)
- **Auth:** NextAuth admin session
- **Request Body:**
```typescript
{
  guest_ids: number[];  // Array of guest IDs
}
```
- **Response:**
```typescript
{
  success: true;
  sent: number;
  failed: number;
  errors: Array<{ guest_id: number; error: string }>;
}
```
- **Side Effects:**
  - Generate magic link hash (SHA-256)
  - Update `guests.magic_link_hash` and `magic_link_expires_at`
  - Send email via Nodemailer
  - Log to `email_logs` table
  - Rate limiting check (max 5/hour/guest)
- **Errors:** 429 Rate limit exceeded, 500 SMTP error

---

**Error Response Format (Standardized):**
```typescript
{
  success: false;
  error: {
    code: string;       // 'VALIDATION_ERROR', 'NOT_FOUND', 'RATE_LIMITED'
    message: string;    // Human-readable error message
    details?: any;      // Optional validation details
  }
}
```

### Workflows and Sequencing

**1. Admin CSV Import Flow:**
```
Admin → Upload CSV → Parse & Validate → Bulk Insert → Send Confirmation
  ↓
CSV file (multipart) → papaparse → Zod validation → Prisma createMany → Email queue
  ↓
Error log (duplicates, invalid emails)
```

**2. Magic Link Email Flow:**
```
Admin → Select Guests → Trigger Send → Generate Hash → Send Email → Log
  ↓
Guest IDs → SHA-256(email + SECRET + timestamp) → Nodemailer SMTP → email_logs
  ↓
Update guests.magic_link_hash + magic_link_expires_at
```

**3. VIP Registration Flow:**
```
Guest → Click Magic Link → Validate Hash → Show Welcome → Confirm → Save → Email
  ↓
URL params (code, email) → magic-link.ts validate → VIP page → POST /api/registration/confirm
  ↓
Update registration_status='registered' → Insert registrations → Send confirmation email
```

**4. Paid Registration Flow:**
```
Guest → Click Magic Link → Validate → Multi-step Form → Submit → Save
  ↓
URL params → magic-link.ts validate → Paid form (3 steps) → POST /api/registration/submit
  ↓
Zod validation → Prisma insert (registrations) → Update status='registered'
  ↓
Note: payment_method=NULL (Epic 2-ben lesz kitöltve)
```

**5. Admin Guest Management Flow:**
```
Admin → Login → Dashboard → Filter/Search → View List → CRUD Actions
  ↓
NextAuth session → GET /api/admin/guests?filters → Prisma query → Paginated response
  ↓
Actions: Create (POST), Update (PATCH), Delete (DELETE), Send Magic Link (POST /api/email/send-magic-link)
```

---

## Non-Functional Requirements

### Performance

**Targets (FUNKCIONALIS-KOVETELMENY.md alapján):**

| Metrika | Célérték | Mérési Pont |
|---------|----------|-------------|
| **LCP (Largest Contentful Paint)** | < 2.0s | Admin dashboard, guest registration pages |
| **FID (First Input Delay)** | < 100ms | Form interactions, button clicks |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Page load stability |
| **API Response Time (95th percentile)** | < 500ms | All /api/* endpoints |
| **Database Query Time (avg)** | < 100ms | Prisma queries with indexes |
| **CSV Import (10,000 rows)** | < 30s | Bulk insert with transaction |
| **Concurrent Users** | 100+ | Admin + guest flows simultaneously |

**Optimization Strategies:**
- **Server Components** default → Zero client JS for static content
- **Prisma Connection Pooling** → PlanetScale built-in pooling or Prisma Data Proxy
- **Database Indexes** → All frequently queried columns (email, registration_status)
- **Pagination** → Max 100 items/page, default 25
- **Image Optimization** → Next.js Image component (auto WebP, lazy load)
- **React Server Components Cache** → Automatic fetch memoization

**Performance Monitoring:**
- Vercel Analytics (Web Vitals tracking)
- Prisma query logging (slow query alerts > 500ms)
- SMTP delivery time monitoring

---

### Security

**Authentication Mechanisms:**

1. **Magic Link (Guests):**
   - Hash: `SHA-256(email + APP_SECRET + timestamp)`
   - Expiry: 5 minutes after first click
   - Single-use: Hash cleared after successful validation
   - Rate limiting: Max 5 resend/hour per guest (tracked in email_logs)
   - Storage: `guests.magic_link_hash` + `magic_link_expires_at`

2. **Admin Session (NextAuth.js):**
   - Password: bcrypt hash (cost=12, stored in `users.password_hash`)
   - Session: JWT strategy (HttpOnly cookie, SameSite=Strict, Secure in prod)
   - Expiry: 24 hours inactivity
   - Role-based access: admin (full), staff (check-in only - Epic 3)

**API Security:**
- **CSRF Protection:** NextAuth.js built-in CSRF token validation
- **SQL Injection Prevention:** Prisma parameterized queries (100% coverage)
- **XSS Prevention:** React auto-escaping + Content Security Policy headers
- **Rate Limiting:** Email sending (5/hour), login attempts (5/minute)
- **Input Validation:** Zod schemas for all API payloads
- **File Upload Security:** CSV MIME type validation, max 10MB file size

**Environment Variables (.env.local - gitignored):**
```bash
DATABASE_URL="mysql://user:password@localhost:3307/ceog_1"
APP_SECRET="min_64_char_random_string_for_magic_links"
NEXTAUTH_SECRET="min_32_char_random_string"
NEXTAUTH_URL="http://localhost:3000"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@ceogala.hu"
SMTP_PASS="smtp_password"
```

**HTTPS Enforcement:**
- Development: HTTP allowed (localhost)
- Production: HTTPS required (Vercel automatic)
- HSTS header: `Strict-Transport-Security: max-age=31536000`

---

### Reliability/Availability

**Uptime Target:** 99.5% (43.8 hours/year downtime max)

**Failure Modes & Mitigation:**

| Failure Scenario | Impact | Mitigation |
|------------------|--------|------------|
| **Database Connection Loss** | API 500 errors | Prisma connection pooling, automatic reconnect, Vercel timeout=10s |
| **SMTP Server Down** | Email delivery fails | Queue emails in `email_logs` with status='failed', retry mechanism (3x), fallback SMTP provider |
| **Bulk Import Timeout** | CSV import fails | Transaction rollback, chunked inserts (1000 rows/batch), progress feedback |
| **Magic Link Expiry** | Guest can't register | "Request New Link" button, rate limiting bypass for expired links |
| **Concurrent Session Conflicts** | Data race conditions | Prisma optimistic locking, `updated_at` field version check |

**Error Handling Strategy:**
- All API routes: try/catch with standardized error response
- Database errors: Prisma error codes mapped to HTTP status
- Validation errors: Zod error details returned to client
- Logging: Console errors in dev, Sentry in production (optional)

**Backup & Recovery:**
- Database: PlanetScale automatic daily backups (7-day retention)
- File uploads: No file storage in Epic 1 (CSV processed in-memory)
- Session state: Stateless JWT (no server-side session storage)

---

### Observability

**Logging Levels:**
- **ERROR:** API errors, database errors, email delivery failures
- **WARN:** Rate limit hits, validation failures, duplicate imports
- **INFO:** Successful operations (registration, import, email sent)
- **DEBUG:** SQL queries (Prisma log level in dev only)

**Metrics to Track:**
- Email delivery rate (sent/failed ratio)
- Magic link click-through rate (emails sent vs magic link validations)
- Registration completion rate (magic link clicks vs registrations)
- CSV import success rate (total rows vs errors)
- API endpoint latency (p50, p95, p99)
- Database query performance (slow query log > 100ms)

**Monitoring Tools:**
- **Vercel Analytics:** Web Vitals, API response times
- **Prisma Studio:** Database browser for manual inspection
- **Email Logs Table:** Track all email deliveries with status/error_message
- **Browser DevTools:** Console errors, network tab (dev)
- **(Optional) Sentry:** Error tracking and alerting (production)

**Health Check Endpoint:**
```typescript
GET /api/health
Response: {
  status: 'ok' | 'degraded' | 'down',
  database: 'connected' | 'disconnected',
  timestamp: '2025-11-27T12:00:00Z'
}
```

---

## Dependencies and Integrations

**NPM Dependencies (package.json):**

```json
{
  "dependencies": {
    "next": "^15.0.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.7.2",
    "@prisma/client": "^5.22.0",
    "prisma": "^5.22.0",
    "next-auth": "^4.24.11",
    "bcryptjs": "^2.4.3",
    "zod": "^3.24.1",
    "nodemailer": "^6.9.16",
    "papaparse": "^5.4.1",
    "tailwindcss": "^3.4.15",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.6",
    "@types/bcryptjs": "^2.4.6",
    "@types/nodemailer": "^6.4.17",
    "@types/papaparse": "^5.3.14"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    "vitest": "^2.1.8",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.0",
    "prettier": "^3.4.2"
  }
}
```

**External Services:**
- **MySQL 8.0+ Database** (PlanetScale free tier or local Docker)
- **SMTP Email Provider** (to be configured - Resend, SendGrid, Mailgun, or Gmail SMTP)
- **Vercel Hosting** (automatic HTTPS, CDN, serverless functions)

**Internal Module Dependencies:**
```
app/api/registration/* → lib/services/registration.ts → lib/db/prisma.ts
app/api/admin/* → lib/services/registration.ts → lib/db/prisma.ts
lib/services/email.ts → Nodemailer → External SMTP
lib/auth/magic-link.ts → crypto (Node.js built-in)
```

**Version Constraints:**
- Node.js: >= 18.18.0 (Next.js 14 requirement)
- MySQL: >= 8.0 (Prisma MySQL provider)
- Browser support: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

---

## Acceptance Criteria (Authoritative)

**Epic 1 sikeres ha az alábbi összes criteria teljesül:**

### Story 1.1: Project Foundation ✅
- [x] Next.js 14 projekt inicializálva TypeScript + Tailwind-del
- [x] Prisma schema definiálva 8 táblával
- [x] Database connection működik (MySQL 3307 port)
- [x] Seed script létrehoz 2 admin usert, 5 table-t, 6 guest-et
- [x] `npm run dev` elindítja a dev szervert localhost:3000-en
- [x] Environment variables konfigurálva (.env.local)

### Story 1.2: Admin Authentication
- [ ] `/admin/login` oldal létezik email + password fielddel
- [ ] Valid credentials (admin@ceogala.test / Admin123!) → sikeres login
- [ ] Session cookie létrejön (HttpOnly, Secure, SameSite=Strict)
- [ ] Sikeres login után redirect `/admin` dashboard-ra
- [ ] `/admin/*` routes védettek → unauthenticated user redirect `/admin/login`
- [ ] Session 24 óra után lejár (inactivity)

### Story 1.3: Email Service & Magic Link
- [ ] "Send Invitation" gomb működik admin dashboardon
- [ ] Magic link email elküldésre kerül (Nodemailer SMTP)
- [ ] Magic link hash generálódik (SHA-256)
- [ ] Hash és expiry mentve `guests` táblába
- [ ] Email tartalmazza: személyes megszólítás, esemény info, magic link URL
- [ ] Rate limiting: max 5 email/óra/guest (email_logs alapján)
- [ ] Sikertelen email delivery logged to `email_logs` (status='failed')

### Story 1.4: CSV Guest List Import
- [ ] `/admin/guests/import` oldal CSV file upload form-mal
- [ ] Valid CSV (email, name, guest_type) → sikeres parse
- [ ] Duplicate email detection (hibaüzenet listában)
- [ ] Invalid email format rejection (Zod validation)
- [ ] Successful validation → bulk insert `guests` táblába
- [ ] Success message: "X guests imported successfully"
- [ ] Error log megjelenítése (sor, email, hiba típusa)
- [ ] 10,000+ rows → rejection error

### Story 1.5: Magic Link Validation
- [ ] Magic link URL (`/register?code={hash}&email={email}`) működik
- [ ] Hash validáció (SHA-256 újraszámítás)
- [ ] Expiry check (5 perc első kattintás után)
- [ ] Successful validation → welcome page with guest name + category
- [ ] Invalid/expired hash → error page + "Request New Link" gomb
- [ ] Rate limiting bypass mechanism (ha lejárt link miatt új kérés)

### Story 1.6: VIP Registration
- [ ] VIP guest welcome page "Confirm Attendance" gomb-bal
- [ ] "Confirm" → status update `invited` → `registered`
- [ ] `registrations` record insert (ticket_type=vip_free)
- [ ] Success message: "Thank you for confirming!"
- [ ] "Decline" → status update `declined`

### Story 1.7: Paid Registration Form
- [ ] PAID_SINGLE/PAIRED guest multi-step form (3 lépés)
- [ ] Step 1: Ticket type selection (single vs paired - csak ha PAID_PAIRED type)
- [ ] Step 2: Billing info fields (name, company, tax number, address)
- [ ] Step 3: Partner details (csak páros jegy esetén)
- [ ] Form validation (Zod) - email format, required fields
- [ ] Submit → `registrations` insert + status update `registered`
- [ ] payment_method = NULL (Epic 2-ben kerül kitöltésre)
- [ ] Validation error → field-level error messages

### Story 1.8: Admin Guest List Dashboard
- [ ] `/admin/guests` paginated table (name, email, type, status, table, actions)
- [ ] Search bar (name vagy email case-insensitive)
- [ ] Category filter dropdown (All / VIP / Paid Single / Paid Paired)
- [ ] Status filter dropdown (All / Invited / Registered / Approved / Declined)
- [ ] Page size dropdown (10 / 25 / 50 items/page)
- [ ] Pagination controls működnek
- [ ] "Send Invitation" gomb trigger email service (Story 1.3)

### Story 1.9: Admin Guest CRUD
- [ ] "Add New Guest" modal/form (email, name, guest_type, phone, company, notes)
- [ ] Create → új guest insert + success message + megjelenik listában
- [ ] "Edit" gomb → pre-filled form (email immutable)
- [ ] Update → save changes + `updated_at` refresh
- [ ] "Delete" gomb → confirmation modal
- [ ] Delete confirmation → CASCADE delete (registrations, checkins, etc.) + eltűnik listából
- [ ] Email UNIQUE constraint (duplicate email rejection 409 error)

---

## Traceability Mapping

| AC # | Story | PRD Section | Epic 1 Component | API Endpoint | Test Idea |
|------|-------|-------------|------------------|--------------|-----------|
| AC-1.1 | 1.1 | - | package.json, prisma/schema.prisma | - | E2E: `npm run dev` starts server |
| AC-1.2 | 1.2 | FR-2.7.2 | app/admin/login, NextAuth config | POST /api/auth/[...nextauth] | E2E: Login flow, session cookie validation |
| AC-1.3 | 1.3 | FR-2.1.2 | lib/services/email.ts, lib/auth/magic-link.ts | POST /api/email/send-magic-link | Unit: hash generation, E2E: email delivery |
| AC-1.4 | 1.4 | FR-2.1.1 | app/admin/guests/import, lib/utils/csv.ts | POST /api/admin/guests/import | E2E: CSV upload, validation errors |
| AC-1.5 | 1.5 | FR-2.2.1 | app/(auth)/register/page.tsx, magic-link.ts | GET /register?code=&email= | E2E: Link click, validation, expiry |
| AC-1.6 | 1.6 | FR-2.2.2 | app/(auth)/register/vip/page.tsx | POST /api/registration/confirm | E2E: Confirm attendance, status update |
| AC-1.7 | 1.7 | FR-2.2.3 | app/(auth)/register/paid/page.tsx | POST /api/registration/submit | E2E: Multi-step form, validation |
| AC-1.8 | 1.8 | FR-2.7.1 | app/admin/guests/page.tsx | GET /api/admin/guests | E2E: Filter, search, pagination |
| AC-1.9 | 1.9 | FR-2.7.2 | Admin guest CRUD UI | POST/PATCH/DELETE /api/admin/guests/* | E2E: Create, update, delete flows |

---

## Risks, Assumptions, Open Questions

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **SMTP Email Delivery Failures** | Medium | High | Queue failed emails in `email_logs` with retry mechanism (3x), fallback SMTP provider config |
| **Magic Link Expiry User Frustration** | Medium | Medium | "Request New Link" button prominently displayed, rate limiting bypass for expired links |
| **CSV Import Performance (10K rows)** | Low | Medium | Chunked batch inserts (1000 rows), progress bar feedback, transaction rollback on error |
| **NextAuth.js v5 Migration Complexity** | Low | Low | Use NextAuth.js v4 (stable), defer v5 upgrade to post-Epic 1 |
| **Prisma Connection Pool Exhaustion** | Low | High | PlanetScale built-in pooling (1000 connections), Vercel timeout=10s, connection retry logic |

### Assumptions

- **Assumption 1:** SMTP credentials (Resend, SendGrid, vagy Gmail) rendelkezésre állnak Epic 1 kezdetére
- **Assumption 2:** Story 1.1 már nagyrészt kész (package.json, prisma/schema.prisma, seed script létezik)
- **Assumption 3:** Admin users manuálisan létrehozva seed script-ben (nincs admin self-registration)
- **Assumption 4:** Magic link expiry 5 perc (FUNKCIONALIS-KOVETELMENY.md alapján), nem konfigurace.Visible
- **Assumption 5:** Nincs 2FA Epic 1-ben (csak email + password admin login)

### Open Questions

| Question | Decision Needed By | Impact | Status |
|----------|-------------------|--------|--------|
| **Q1:** Melyik SMTP provider-t használjuk production-ben? (Resend vs SendGrid vs Mailgun) | Story 1.3 start | Email delivery reliability | 🟡 Pending - Resend javasolt (3K/month free) |
| **Q2:** NextAuth.js v4 vagy v5? (v5 beta, breaking changes) | Story 1.2 start | Auth implementation complexity | ✅ Decided - v4 (stable) |
| **Q3:** Prisma migrations vs `db push` development-ben? | Story 1.1 | Database schema management | ✅ Decided - `prisma migrate dev` (production-ready) |
| **Q4:** React Hook Form vagy native forms? | Story 1.7 | Form state management | 🟡 Pending - React Hook Form javasolt (Zod integráció) |
| **Q5:** Tailwind UI komponens library vagy custom? (Headless UI, shadcn/ui) | Story 1.8 | UI development speed | 🟡 Pending - shadcn/ui javasolt (copy-paste components) |

---

## Test Strategy Summary

**Testing Framework Stack:**
- **E2E Testing:** Playwright 1.49+ (Chrome, Firefox cross-browser)
- **Unit/Integration Testing:** Vitest 2.1+ (Vite-native, fast)
- **Component Testing:** Vitest + React Testing Library
- **API Testing:** Vitest + supertest (API route handlers)
- **Type Checking:** TypeScript compiler (tsc --noEmit)

**Test Coverage Targets:**
- **Critical Paths (E2E):** 100% coverage
  - Magic link flow (email send → click → validate → register)
  - VIP registration flow (confirm → save → email)
  - Paid registration flow (form submit → validation → save)
  - Admin login flow (credentials → session → protected routes)
  - CSV import flow (upload → parse → validate → bulk insert)
- **API Routes (Integration):** 80%+ coverage
  - All /api/* endpoints with happy + error paths
  - Authentication middleware
- **Business Logic (Unit):** 90%+ coverage
  - lib/services/registration.ts
  - lib/services/email.ts
  - lib/auth/magic-link.ts
  - lib/utils/csv.ts, lib/utils/validation.ts

**Test Types per Story:**

| Story | E2E Tests | Integration Tests | Unit Tests |
|-------|-----------|-------------------|------------|
| 1.1 | Server startup | Database connection | Prisma client singleton |
| 1.2 | Login flow, session persistence | POST /api/auth/[...nextauth] | bcrypt hash verification |
| 1.3 | Email delivery end-to-end | Email service API | Magic link hash generation |
| 1.4 | CSV upload + import | POST /api/admin/guests/import | CSV parsing, validation |
| 1.5 | Magic link click → validation | GET /register?code=&email= | Hash validation, expiry check |
| 1.6 | VIP confirmation flow | POST /api/registration/confirm | processVIPRegistration() |
| 1.7 | Paid form submission | POST /api/registration/submit | processPaidRegistration(), Zod validation |
| 1.8 | Dashboard filters, pagination | GET /api/admin/guests | getGuestList() with filters |
| 1.9 | Guest CRUD operations | POST/PATCH/DELETE /api/admin/guests/* | createGuest(), updateGuest(), deleteGuest() |

**Manual Testing Checklist (before Story Done):**
- [ ] Mobile responsive design (iPhone 12, iPad)
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari)
- [ ] Accessibility (keyboard navigation, ARIA labels, screen reader)
- [ ] Error messages clarity (user-friendly, actionable)
- [ ] Loading states (spinners, disabled buttons)
- [ ] Form validation (real-time feedback, clear error messages)

**Test Data Management:**
- Seed script: `npm run db:seed` (2 admins, 5 tables, 6 guests)
- Test credentials: `admin@ceogala.test` / `Admin123!`
- Factory functions: `createTestGuest()`, `createTestRegistration()` (Vitest)
- Database reset: `npx prisma migrate reset` (dev only)

**CI/CD Integration (Future):**
- GitHub Actions: Run Vitest + Playwright on every PR
- Vercel Preview Deployments: Automatic E2E testing on preview URLs
- Coverage reporting: Upload to Codecov (optional)
