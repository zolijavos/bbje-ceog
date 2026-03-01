# Adversarial General Review: CEOG-4

**Date**: 2026-03-01
**Reviewer**: BMad Adversarial Review Agent (Claude Opus 4.6)
**Content Type**: Full codebase review (production-declared Next.js 14+ application)
**Project**: CEO Gala Event Registration System

---

## Executive Summary

This project is declared "PRODUCTION READY" with all 38/38 stories completed across 7 epics. After a thorough adversarial review of the codebase -- including the Prisma schema, middleware, API routes, services, authentication, configuration, and deployment artifacts -- I have identified **27 findings** ranging from critical security vulnerabilities to architectural inconsistencies and operational risks. Several of these findings directly contradict the project's own documentation, which openly acknowledges known security issues but has not resolved them.

The project functions, but "production ready" is a generous characterization. What follows is a precise accounting of what is wrong, what is missing, and what will bite someone in production.

---

## Critical Findings

### 1. CREDENTIALS COMMITTED TO VERSION CONTROL

**Severity**: CRITICAL
**File**: `.env.dev` (present in working directory, visible in `git status` as `?? .env.dev`)

The `.env.dev` file contains live credentials in plaintext:
- Stripe test API keys (`sk_test_...`, `pk_test_...`, webhook secret)
- Gmail SMTP credentials (`zolijavos@gmail.com` with app password `ucgtikfsqvukpivw`)
- Database passwords (`CeogDev2026Secure!`, `CeogDevRoot2026!`)
- Application secrets (APP_SECRET, QR_SECRET, NEXTAUTH_SECRET -- all 64-char hex strings)
- Full `DATABASE_URL` with credentials embedded

This file is listed in `git status` as untracked (`?? .env.dev`), meaning it exists in the working directory. The `.gitignore` evidently does not cover it since git sees it as an untracked candidate. If it has ever been committed in history, every secret listed is compromised. The Stripe keys, Gmail credentials, and application secrets are all exposed. The Dockerfile's builder stage even attempts to copy this file into the image (`RUN cp .env.dev .env.local 2>/dev/null || true`). This is the single most dangerous finding in this review.

### 2. REGISTRATION ENDPOINTS LACK SERVER-SIDE AUTHENTICATION (IDOR)

**Severity**: CRITICAL
**Files**: `app/api/registration/submit/route.ts`, `app/api/registration/confirm/route.ts` (inferred from architecture)

The paid registration endpoint (`POST /api/registration/submit`) accepts a raw `guest_id` in the request body with **zero authentication**. There is no session check, no magic link re-validation, no token verification. Any attacker who guesses or enumerates guest IDs (sequential integers starting from 1) can:

- Submit paid registration for any paying guest, injecting arbitrary billing and partner data
- Associate a fake partner email with any guest's registration
- Set arbitrary profile fields (company, position, dietary requirements) for any guest

The magic link flow validates the link on the *frontend page*, but the actual API endpoint that processes the registration has no server-side verification that the caller is the legitimate guest. The `guest_id` is blindly trusted from the request body. The only "protection" is the partner email uniqueness check, which is a business rule, not a security control.

### 3. CHECK-IN OVERRIDE NOT ROLE-RESTRICTED IN API

**Severity**: CRITICAL
**File**: `app/api/checkin/submit/route.ts`, `lib/services/checkin.ts`

The check-in submit endpoint accepts `override: true` from any authenticated user (admin OR staff). The project's own CLAUDE.md documentation explicitly calls this out as a known critical security issue:

> "Check-in override not role-restricted in API: `/api/checkin/submit` accepts `is_override: true` from Staff role too. Only the frontend hides the button."

Despite being documented as a known issue, it remains unfixed. The `submitCheckin` service function (`lib/services/checkin.ts`, line 157) accepts `override` as a plain boolean with no role check. A staff user can override duplicate check-in protections by sending `{ "registrationId": 123, "override": true }` directly to the API, completely defeating the purpose of the admin-only override control described in the permission matrix.

### 4. PERVASIVE AUTHORIZATION BYPASS: requireAuth vs requireAdmin

**Severity**: CRITICAL
**Files**: 33 admin API route files

Of the ~35 admin API route files under `app/api/admin/`, **33 use `requireAuth()`** (which allows both admin AND staff access) while only **2 use `requireAdmin()`** (CSV import at `guests/import/route.ts` and audit log at `audit-log/route.ts`). A handful of routes add inline role checks (`auth.session.user.role !== 'admin'`) -- specifically the scheduler config, user management, scheduled email creation, and trigger endpoints -- but the vast majority do not.

This means a staff user authenticated via `/admin/login` can call the following APIs directly:
- **Guest CRUD**: Create, update, and delete any guest (`/api/admin/guests`, `/api/admin/guests/[id]`)
- **Applicant management**: Approve or reject applicants (`/api/admin/applicants/[id]/approve`, `/reject`)
- **Payment approval**: Approve manual bank transfer payments (`/api/admin/guests/[id]/approve-payment`)
- **Table management**: Create, update, and delete tables (`/api/admin/tables`)
- **Seating assignments**: Assign and unassign guests to tables (`/api/admin/table-assignments`)
- **Email templates**: View, create, update, and delete email templates (`/api/admin/email-templates`)
- **Email logs**: View and delete email delivery logs (`/api/admin/email-logs`)
- **Data export**: Export guest lists and seating arrangements (`/api/admin/guests/export`, `/api/admin/seating-export`)
- **Statistics**: View all dashboard statistics (`/api/admin/statistics`)
- **Payments**: View all payment records (`/api/admin/payments`)

The middleware (`middleware.ts`) protects admin *pages* from staff access by checking `staffAllowedPaths`, but the API endpoints behind those pages are wide open. Any staff user with browser developer tools, curl, or a REST client can bypass the frontend restrictions entirely.

---

## High Severity Findings

### 5. MAGIC LINK EXPIRY CHECK DISABLED

**Severity**: HIGH
**File**: `lib/auth/magic-link.ts`, lines 115-116

The code contains this comment:

```typescript
// Magic links never expire - expiry check removed per business requirement
// The magic_link_expires_at field is still stored for reference but not validated
```

The CLAUDE.md documentation states "24-hour magic link expiry (all guest types)" as a completed feature (Epic 7). The database schema stores `magic_link_expires_at`. The `.env.example` documents `MAGIC_LINK_EXPIRY_HOURS=24`. Yet the actual validation code **never checks the expiry**. Magic links are valid forever once generated. This is a direct contradiction of the documented security posture and means a leaked or intercepted magic link provides permanent access to that guest's registration.

### 6. QR TOKEN STORED AS FULL JWT IN DATABASE

**Severity**: HIGH
**Files**: `lib/services/qr-ticket.ts`, `prisma/schema.prisma` (Registration model), `lib/services/checkin.ts`

The `qr_code_hash` field (named "hash" but storing a full JWT token) contains the complete JWT ticket token in the database. During check-in validation (`lib/services/checkin.ts`, line 114), the system compares the presented token directly against the stored value:

```typescript
if (registration.qr_code_hash !== qrToken) {
  return { valid: false, error: 'TOKEN_MISMATCH', alreadyCheckedIn: false };
}
```

This design means:
- Anyone with database read access (DB admin, SQL injection, backup access) has valid tickets for every guest
- The field is named `qr_code_hash` suggesting it stores a hash, but it stores the raw JWT -- misleading for anyone auditing the schema
- The column is `@db.VarChar(500)` -- JWT tokens with guest name, registration ID, and ticket type can approach or exceed this limit depending on name length
- The full JWT is also returned in the PWA ticket API response (`app/api/pwa/ticket/route.ts`, line 103: `qrToken`) and stored in `EmailLog.html_body` as part of QR code emails

### 7. TYPESCRIPT STRICT MODE DISABLED

**Severity**: HIGH
**File**: `tsconfig.json`

```json
"strict": false
```

For a "production ready" application handling payment processing (Stripe), personally identifiable information (names, emails, phone numbers, addresses, tax numbers), and authentication (JWT tokens, bcrypt hashes), running without TypeScript strict mode is reckless. This means:
- Implicit `any` types are allowed everywhere (no `noImplicitAny`)
- No strict null checks (`strictNullChecks` off) -- null/undefined access errors are not caught at compile time
- No strict property initialization -- class fields can be used before assignment
- The 130+ `useState` calls, 30+ `useEffect` hooks, and 44 API endpoints all lack the type safety guarantees that `strict: true` provides
- The non-null assertions (`!`) scattered through the codebase (e.g., `registration.guest!.id` in `checkin.ts`) would be flagged by strict mode

### 8. FIRE-AND-FORGET TICKET GENERATION VIA setTimeout

**Severity**: HIGH
**File**: `lib/services/registration.ts`, lines 434-449

After VIP registration, QR ticket generation and email delivery are scheduled via `setTimeout` with a 3-minute delay:

```typescript
const QR_EMAIL_DELAY_MS = 3 * 60 * 1000; // 3 minutes
setTimeout(() => {
  void generateTicketWithRetry(result.registration.id, 3);
}, QR_EMAIL_DELAY_MS);
```

Problems:
- If the server restarts or the process crashes within the 3-minute window, the ticket is never generated and no one is notified
- `setTimeout` handles are not tracked; there is no way to cancel, monitor, or retry them
- The `void` keyword explicitly discards the promise, meaning unhandled rejections are silently swallowed
- In a standalone Next.js deployment behind PM2 or Docker, `setTimeout` callbacks may not fire reliably during graceful shutdown
- There is no persistent record that ticket generation was requested -- if it fails silently, the admin has no way to know without manually checking each guest
- The retry mechanism (`generateTicketWithRetry` with exponential backoff) is well-implemented internally, but it only helps if the `setTimeout` callback actually executes

### 9. IN-MEMORY RATE LIMITING ON PUBLIC APPLY ENDPOINT

**Severity**: HIGH
**File**: `app/api/apply/route.ts`, lines 30-48

The public applicant endpoint (`POST /api/apply`) uses an in-memory `Map` for rate limiting:

```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
```

This is:
- **Reset on every server restart or deployment** -- an attacker just needs to wait for a deploy
- **Not shared across instances** -- if horizontal scaling is ever added, each instance has its own map
- **A memory leak** -- entries are added but never cleaned up (no TTL, no periodic purge, no max size)
- **Inconsistent with the rest of the codebase** -- the project has a fully-functional database-based `checkRateLimit` service in `lib/services/rate-limit.ts` that survives restarts and works across instances, but this endpoint does not use it
- **The only publicly-accessible endpoint** (no auth required) that creates database records, making it the most important endpoint to rate-limit properly

### 10. SESSION MAXAGE MISMATCH WITH DOCUMENTATION

**Severity**: HIGH
**File**: `lib/auth/auth-options.ts`

```typescript
session: {
  strategy: 'jwt',
  maxAge: 24 * 60 * 60 // 24 hours
}
```

The CLAUDE.md documentation states: "Session strategy: JWT (not database sessions), **8 hour** expiry". The actual code sets the session maxAge to 24 hours. This is either a documentation inaccuracy or a code defect. Either way, it represents a disconnect between the documented security posture and actual behavior. For an admin/staff session that can approve payments and manage guest data, the session lifetime has direct security implications.

---

## Medium Severity Findings

### 11. INCONSISTENT VALIDATION: ZOD SCHEMAS DEFINED BUT NOT USED

**Severity**: MEDIUM
**Files**: `lib/validations/guest-profile.ts`, `app/api/registration/submit/route.ts`

The project defines comprehensive Zod validation schemas in `lib/validations/guest-profile.ts`:
- `guestProfileSchema` -- phone, company, position, dietary requirements
- `billingInfoSchema` -- full billing address with Hungarian tax number validation
- `consentSchema` -- GDPR and cancellation acceptance
- `partnerSchema` -- partner name and email
- `paidSingleRegistrationSchema` and `paidPairedRegistrationSchema` -- combined schemas

These schemas are **never imported** by the registration API routes that should use them. Instead, `app/api/registration/submit/route.ts` performs approximately 80 lines of manual validation with individual `if` checks and early returns. This duplicated manual validation:
- Implements different rules than the Zod schemas (e.g., the manual validation checks `phone.trim().length < 9` while the Zod schema uses a Hungarian phone regex)
- Is error-prone and inconsistent
- Creates a maintenance burden where changes must be synchronized across two validation implementations
- Defeats the purpose of having a centralized validation library

### 12. CSRF PROTECTION GAPS FOR NON-ADMIN ENDPOINTS

**Severity**: MEDIUM
**File**: `middleware.ts`, lines 104-118

When no `Origin` or `Referer` header is present, the CSRF validator has a fallthrough that allows requests to several sensitive endpoints:

```typescript
if (!origin && !referer) {
  const isNextInternal = request.headers.get('x-nextjs-data') !== null;
  if (isNextInternal) return true;
  if (pathname.startsWith('/api/admin/') ||
      pathname.startsWith('/api/registration/') ||
      pathname.startsWith('/api/checkin/')) {
    return false;
  }
  return true; // <-- Everything else passes through
}
```

This means the following mutating endpoints are accessible without CSRF protection from non-browser clients (curl, scripts, bots):
- `POST /api/pwa/auth` -- PWA login
- `PATCH /api/pwa/profile` -- Guest profile modification
- `POST /api/pwa/push` -- Push notification subscription
- `POST /api/stripe/create-checkout` -- Stripe session creation
- `POST /api/ticket/verify` -- Ticket verification
- `POST /api/apply` -- Public applicant submission
- `POST /api/email/send-magic-link` -- Magic link email trigger

While some of these endpoints have their own auth (PWA session cookie), the Stripe checkout and magic link endpoints accept only a `registration_id` or `guest_id` -- integers that can be guessed.

### 13. EMAIL HTML BODY STORED IN DATABASE WITHOUT RETENTION POLICY

**Severity**: MEDIUM
**File**: `prisma/schema.prisma`, EmailLog model

```prisma
html_body     String?   @db.LongText     // Full HTML content of the email
```

Every sent email's full HTML body is stored in the `email_logs` table as `LongText`. This includes:
- Inline QR code images as base64-encoded PNGs (each QR code is approximately 10-15 KB base64)
- Full HTML email templates with CSS styling
- Registration confirmation details with PII

For a system targeting 10K guests with multiple email types per guest (magic link, registration confirmation, ticket delivery, payment reminders, event reminders), this table will grow rapidly. There is no retention policy, no cleanup mechanism, no archival strategy, and no index on `sent_at` combined with any filter that would make cleanup queries efficient. The `@@index([sent_at])` exists but only for read queries, not for batch deletion.

### 14. DEVDEPENDENCIES MIXED INTO DEPENDENCIES

**Severity**: MEDIUM
**File**: `package.json`

Build tools, type definitions, and development-only packages are listed under `dependencies` instead of `devDependencies`:
- `prisma` (CLI tool, 40+ MB -- should be devDependency; `@prisma/client` is the runtime dependency)
- `autoprefixer`, `postcss`, `tailwindcss` (build-time only CSS processing)
- `typescript` (build-time only compiler)
- All `@types/*` packages: `@types/bcryptjs`, `@types/jsonwebtoken`, `@types/node`, `@types/nodemailer`, `@types/qrcode`, `@types/react`, `@types/react-dom`, `@types/papaparse`

This bloats the production `node_modules` and the Docker image. While the standalone output mode should ultimately exclude unused packages from the server bundle, having them in `dependencies` means `npm install --production` in any non-Docker context will install all of them.

### 15. DOCKER BUILD BAKES CREDENTIALS INTO IMAGE LAYERS

**Severity**: MEDIUM
**File**: `Dockerfile`, line 16

```dockerfile
RUN cp .env.dev .env.local 2>/dev/null || true
```

The builder stage copies the entire working directory into the image (`COPY . .` on line 15) and then attempts to copy `.env.dev` into `.env.local`. Even though the `|| true` makes the copy non-fatal if the file is absent, the `COPY . .` command already includes `.env.dev` in the image layer if it exists in the build context. The builder stage is not the final runner stage, but Docker layer caching means the credentials persist in the build cache and can be extracted with `docker history` or by inspecting intermediate layers.

A `.dockerignore` file should exclude all `.env*` files (except `.env.example`), but no `.dockerignore` was found in the project root.

### 16. NON-ATOMIC CHECK-IN OVERRIDE (DELETE OUTSIDE TRANSACTION)

**Severity**: MEDIUM
**File**: `lib/services/checkin.ts`, lines 197-217

The check-in override first deletes the existing check-in record, then creates a new one inside a transaction:

```typescript
if (registration.checkin && override) {
  await prisma.checkin.delete({ where: { id: registration.checkin.id } });
}

const [checkin] = await prisma.$transaction([
  prisma.checkin.create({ ... }),
  prisma.guest.update({ ... }),
]);
```

The delete happens *outside* the transaction that creates the new check-in and updates the guest status. If the server crashes, the database connection drops, or any error occurs between the delete and the transaction:
- The original check-in record is permanently deleted
- No new check-in record exists
- The guest's attendance data is irrecoverably lost
- The guest's status may be inconsistent (checked_in status without a checkin record)

### 17. NO PASSWORD POLICY ENFORCEMENT

**Severity**: MEDIUM
**Files**: `lib/auth/auth-options.ts`, `app/api/admin/users/route.ts`

The NextAuth `authorize` function accepts any password that matches the bcrypt hash, with no validation of password strength at creation time. The user management API routes (`app/api/admin/users/route.ts`) create and update users but do not enforce:
- Minimum password length
- Character complexity requirements
- Password history checks
- Common password rejection

The seed script uses `Admin123!` and `Staff123!`, which are dictionary-attackable passwords. For a system where admin users can approve financial transactions and access PII, this is insufficient.

### 18. AUDIT LOG SILENTLY SWALLOWS ALL ERRORS

**Severity**: MEDIUM
**File**: `lib/services/audit.ts`, lines 145-148

```typescript
} catch (error) {
  // Don't throw - audit logging should not break the main operation
  console.error('[AUDIT] Failed to create audit log:', error);
}
```

While the principle of not breaking the main operation is sound, completely swallowing audit log failures means:
- Security-relevant events (guest deletion, payment approval, applicant rejection) can be silently unlogged
- Database connectivity issues affecting the audit log will not trigger any alerting
- There is no fallback mechanism (e.g., file-based logging, error tracking service)
- An attacker who can cause audit log writes to fail (e.g., by filling the `audit_logs` table) can operate without trace
- The `console.error` output may be lost entirely in production depending on log configuration

### 19. RAW console.log/console.error IN PRODUCTION CODE

**Severity**: MEDIUM
**Files**: 18 API route files (28 total occurrences)

The project has a dedicated logger utility (`lib/utils/logger.ts`) with `logError` and `logInfo` functions, but 18 API route files still use raw `console.log` and `console.error`. Specific examples:

- `app/api/admin/guests/[id]/approve-payment/route.ts`: 4 occurrences including `console.log` for payment approval events
- `app/api/stripe/webhook/route.ts`: `console.log` for unhandled webhook events
- `app/api/admin/tables/route.ts`: 2 occurrences
- `app/api/admin/table-assignments/route.ts`: 2 occurrences
- `app/api/admin/guests/import/route.ts`: `console.error` for import errors

Additionally, debug logging is left in production code in the payment service (`lib/services/payment.ts`, lines 112-114):
```typescript
console.log('[PAYMENT] APP_URL env:', process.env.APP_URL);
console.log('[PAYMENT] NEXT_PUBLIC_APP_URL env:', process.env.NEXT_PUBLIC_APP_URL);
console.log('[PAYMENT] Using baseUrl:', baseUrl);
```

These debug statements expose environment variable values in production logs.

---

## Low Severity Findings

### 20. TABLE TYPE NOT USING PRISMA ENUM

**Severity**: LOW
**File**: `prisma/schema.prisma`, Table model

```prisma
type       String      @default("standard") @db.VarChar(50) // standard, vip, reserved
```

The `Table.type` field uses a free-form `String` instead of a Prisma `enum`. The project defines enums for `GuestType`, `RegistrationStatus`, `TicketType`, `PaymentMethod`, `PaymentStatus`, `TableStatus`, `UserRole`, `ScheduledEmailStatus`, and `TestStatus` -- but not for table type. This allows invalid values (typos, arbitrary strings) to be inserted without database-level enforcement. A `TableType` enum should be trivial to add given the existing pattern.

### 21. REDUNDANT INDEXES ON UNIQUE COLUMNS

**Severity**: LOW
**File**: `prisma/schema.prisma`

Several models define explicit `@@index` entries on columns that already have a `@unique` constraint (which creates an implicit unique index in MySQL):
- `Guest: @@index([email])` -- `email` already has `@unique`
- `Guest: @@index([pwa_auth_code])` -- `pwa_auth_code` already has `@unique`
- `User: @@index([email])` -- `email` already has `@unique`
- `EmailTemplate: @@index([slug])` -- `slug` already has `@unique`
- `SchedulerConfig: @@index([config_key])` -- `config_key` already has `@unique`
- `RateLimitEntry: @@index([expires_at])` is fine (not unique), but `@@unique([key])` makes the table's implicit primary lookup redundant with any explicit key index

These redundant indexes waste storage and impose minor write-performance overhead for every INSERT and UPDATE on these tables.

### 22. HARDCODED FALLBACK URLS THROUGHOUT CODEBASE

**Severity**: LOW
**Files**: Multiple service and route files

The pattern `process.env.APP_URL || 'https://ceogala.mflevents.space'` appears in at least 6 locations:
- `lib/services/payment.ts` (checkout session URLs)
- `lib/services/email-scheduler.ts` (email template variables, at least 3 occurrences)
- `app/api/admin/applicants/[id]/approve/route.ts` (magic link URL)

If `APP_URL` is misconfigured, empty, or missing in any environment, all generated links (magic links, payment redirects, email links, cancel URLs) silently point to the production server. This means:
- Dev environment users clicking email links get redirected to production
- Demo environment test data gets mixed with production
- The fallback is silently used without any warning or logging

### 23. NO DATABASE CONNECTION POOL CONFIGURATION

**Severity**: LOW
**File**: `lib/db/prisma.ts`

The Prisma client is initialized with no explicit connection pool settings:

```typescript
new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

Prisma defaults to a connection pool size of `num_physical_cpus * 2 + 1`. On the target 2GB RAM VPS with likely 1-2 vCPUs, this gives a pool of 3-5 connections. MySQL 8.0 defaults to 151 max connections. Under concurrent load (webhook processing + admin operations + email scheduling + PWA requests), the small pool could cause connection queueing, and without explicit `connection_limit` or `pool_timeout` configuration, the behavior under load is unpredictable.

### 24. PWA AUTH CODE COLLISION FALLBACK IS PREDICTABLE

**Severity**: LOW
**File**: `lib/services/registration.ts`, lines 139-151

```typescript
async function generateUniquePWAAuthCode(maxRetries = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const code = generatePWAAuthCode();
    const existing = await prisma.guest.findFirst({ where: { pwa_auth_code: code } });
    if (!existing) return code;
  }
  // Fallback: add timestamp suffix
  return `CEOG-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}
```

If all 5 attempts to generate a unique random code collide (increasingly possible as guest count grows toward the 10K target), the fallback generates a code from `Date.now()`. The base-36 representation of a millisecond timestamp has low entropy (~6 chars from a predictable sequence). An attacker who knows the approximate registration time could enumerate possible fallback codes.

### 25. EMAIL SCHEDULER PROCESSES SEQUENTIALLY

**Severity**: LOW
**File**: `lib/services/email-scheduler.ts`, `processScheduledEmails` function

The `processScheduledEmails` function processes pending emails one at a time in a `for` loop:

```typescript
for (const scheduled of pendingEmails) {
  // Mark as processing
  // Fetch guest
  // Parse variables
  // Render template
  // Send email via SMTP
  // Update status
}
```

Each iteration involves multiple database queries, template rendering, and a synchronous SMTP delivery. The batch size is capped at 50, but even 50 sequential SMTP sends (each with connection overhead, TLS handshake, and delivery confirmation) will take 30-60 seconds at best. For the 10K-guest target, sending event reminders to all guests would require 200+ batches processed sequentially across multiple scheduler runs.

### 26. RATE LIMIT CLEANUP IS PROBABILISTIC AND UNCOORDINATED

**Severity**: LOW
**File**: `lib/services/rate-limit.ts`, lines 34-36

```typescript
if (Math.random() < 0.01) {
  await cleanupExpiredEntries();
}
```

Expired rate limit entries are only cleaned up with a 1% probability on each rate limit check. This means:
- Under low traffic, expired entries persist indefinitely, slowly bloating the `rate_limit_entries` table
- Under high traffic, multiple concurrent cleanup operations may run simultaneously without coordination, potentially causing lock contention on the table
- The cleanup is `await`ed, adding latency to 1% of rate-limited requests
- There is no scheduled/cron-based cleanup as a backstop

### 27. SCALABILITY CLAIMS WITHOUT LOAD TESTING EVIDENCE

**Severity**: LOW
**File**: CLAUDE.md, "Performance Requirements" section

The documentation states:
- "500+ concurrent users"
- "10K guest capacity"
- "< 2s page load"
- "< 100ms avg DB query"
- "< 500ms API response (95th percentile)"

There is no evidence of load testing anywhere in the project:
- No k6, artillery, locust, or JMeter test scripts
- No benchmarking results or performance test reports
- No profiling data or flame graphs
- No monitoring dashboards or alerting for performance SLOs

The architecture (single 2GB VPS, single MySQL instance, no Redis/memcached caching layer, no CDN for static assets, serial email processing, no worker queue for background jobs, connection pool defaults) is unlikely to sustain 500 concurrent users without significant performance degradation, particularly during peak operations like bulk email sends or the check-in rush at event start.

---

## Architectural Observations

### Pattern Inconsistencies Across the Codebase

1. **Error handling and response format**: Three distinct patterns coexist:
   - Structured: `{ success: true/false, error: 'CODE', message: 'Human readable' }`
   - Partial: `{ error: 'Human readable message' }` (no `success` field)
   - Mixed languages: Same endpoint returns errors in Hungarian (`'Vendeg nem talalhato'`) and English (`'Failed to update guest'`) depending on the error path

2. **Validation approach**: Three distinct patterns in concurrent use:
   - **Zod with `safeParse()`** and structured error responses via `validateBody()` utility (admin guest CRUD -- best practice)
   - **Zod with `safeParse()`** inline without the utility (check-in, Stripe checkout -- acceptable)
   - **Manual `if` checks** with individual 400 responses (registration submit -- 80+ lines of manual validation that duplicates Zod schemas)

3. **Authentication verification**: Four distinct patterns, one of which is critically broken:
   - `requireAuth()` / `requireAdmin()` utility from `lib/api` (admin routes -- correct but under-applied)
   - `getServerSession(authOptions)` called directly (check-in routes -- correct but inconsistent with utility pattern)
   - `verifyPWASession()` via httpOnly cookie (PWA routes -- correct)
   - **No server-side authentication at all** (registration routes -- broken, relies on frontend magic link validation only)

4. **Logging**: Mix of `logError()`/`logInfo()` from the logger utility and raw `console.log()`/`console.error()` in the same files, sometimes in the same function.

5. **Hungarian vs English**: Error messages, log statements, and API responses inconsistently alternate between Hungarian and English, sometimes within the same endpoint. Example: `approve-payment/route.ts` returns `'Vendeg nem talalhato'` for 404 but `'Failed to approve payment'` would be the 500 error pattern.

### What Works Well

Despite the findings above, several aspects of the codebase are well-implemented:

- **Stripe webhook handler**: The webhook processing has proper signature verification, good idempotency handling (checks `ALREADY_PAID`, `TICKET_ALREADY_EXISTS`), and intelligent error classification that distinguishes between safe-to-acknowledge and retry-worthy errors.
- **Prisma schema design**: The 16 models are well-structured with appropriate relationships, cascading deletes, composite indexes for common query patterns, and proper use of enums for most status fields.
- **CSRF protection approach**: The Origin/Referer validation in middleware is a reasonable choice for this application, with proper exemptions for Stripe webhooks and internal Next.js fetches.
- **Email retry logic**: The email service implements proper exponential backoff (1s, 2s, 4s) with configurable retries, rate limiting per guest/type, and comprehensive delivery logging.
- **PWA session management**: Using httpOnly secure cookies with JWT tokens, proper SameSite settings, and HTTPS detection is the correct approach.
- **Timing-safe comparison**: The magic link validation uses `crypto.timingSafeEqual` for hash comparison, correctly preventing timing side-channel attacks.
- **Audit logging scope**: When it works, the audit log captures meaningful context including IP address, user agent, old values, and new values for change tracking.
- **Ticket generation idempotency**: The `tryAcquireTicketLock` function uses an atomic `updateMany` with a WHERE clause to prevent TOCTOU race conditions during concurrent ticket generation.

---

## Recommendations (Priority Order)

1. **IMMEDIATELY**: Rotate ALL secrets exposed in `.env.dev`. Ensure `.env.dev` is in `.gitignore`. Audit git history with `git log --all --full-history -- .env.dev` and if found, consider the Stripe keys, SMTP credentials, and application secrets compromised. Create a `.dockerignore` excluding all `.env*` files.

2. **IMMEDIATELY**: Add server-side magic link re-validation to `/api/registration/submit` and `/api/registration/confirm`. The endpoints must verify the caller's identity, not just trust a `guest_id` from the request body. Pass the magic link code and email alongside the registration data and re-validate server-side.

3. **BEFORE ANY PRODUCTION USE**: Enforce `requireAdmin()` on all admin-only API routes. Create a systematic mapping of which endpoints should be admin-only vs staff-accessible, and apply the correct guard. At minimum, add a role check for `override: true` in the check-in submit endpoint.

4. **BEFORE ANY PRODUCTION USE**: Enable `"strict": true` in `tsconfig.json` and fix the resulting type errors. This will surface real bugs, especially around null/undefined handling.

5. **SHORT-TERM**: Replace the `setTimeout`-based ticket generation with database-backed deferred processing. Create a `pending_ticket_generation` record in the database and process it via the existing scheduler infrastructure, ensuring recoverability after restarts.

6. **SHORT-TERM**: Use the defined Zod validation schemas (`lib/validations/guest-profile.ts`) consistently in all registration API routes. Remove the 80+ lines of manual validation in `registration/submit/route.ts`.

7. **SHORT-TERM**: Fix the session maxAge to match the documented 8-hour policy, or update the documentation to reflect the actual 24-hour value. Make a deliberate decision and ensure code matches documentation.

8. **SHORT-TERM**: Re-enable magic link expiry validation. If the business truly requires non-expiring links, update the documentation to reflect this and remove the `magic_link_expires_at` field and all references to "24-hour expiry."

9. **SHORT-TERM**: Replace the in-memory rate limiter on `/api/apply` with the database-based `checkRateLimit` service already available in the codebase.

10. **MEDIUM-TERM**: Standardize error response format, validation approach, authentication pattern, and logging across all 44+ API endpoints.

11. **MEDIUM-TERM**: Implement load testing to validate (or invalidate) the 500-concurrent-user and 10K-guest scalability claims.

12. **MEDIUM-TERM**: Add email log retention policy with automated cleanup of entries older than a configurable threshold.

---

*This review was conducted as a read-only adversarial analysis of the CEOG-4 codebase. No files were modified. All file paths and line numbers reference code as observed on 2026-03-01. Findings are ordered by severity within each category.*
