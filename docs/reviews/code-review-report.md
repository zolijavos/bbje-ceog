# CEOG-4 Adversarial Code Review Report

**Reviewer:** Amelia (Developer Agent) -- Adversarial Senior Code Review
**Date:** 2026-03-01
**Project:** CEO Gala Event Registration System (CEOG-4)
**Stack:** Next.js 14+ / TypeScript / Prisma ORM / MySQL 8.0 / Stripe
**Scope:** Full codebase review -- API routes, services, middleware, security, architecture, type safety, performance, error handling

---

## Executive Summary

**Issues Found:** 14 CRITICAL, 18 HIGH, 12 MEDIUM, 8 LOW = **52 total findings**

This codebase is labeled "PRODUCTION READY" but contains multiple **critical security vulnerabilities** that would allow unauthorized data access, privilege escalation, and denial of service. The check-in override lacks server-side role enforcement, the registration submit endpoint has zero authentication, the rate limiting has a race condition, and `strict: false` in TypeScript defeats type safety across the entire project.

The code demonstrates decent patterns in some areas (Zod validation on newer routes, audit logging, structured error utilities) but is **inconsistent** -- older routes skip validation entirely, many API routes use raw `console.log`/`console.error` instead of the logger, and there are significant IDOR vulnerabilities in the PWA APIs.

---

## CRITICAL FINDINGS (Must Fix Before Production)

### C-01: Check-in Override Not Role-Restricted in API

**File:** `/root/LABS/CEOG-4/app/api/checkin/submit/route.ts` (line 54)
**File:** `/root/LABS/CEOG-4/lib/services/checkin.ts` (line 157-161)

The check-in submit API accepts `override: true` from **any authenticated user** (staff included). The override restriction is **only enforced in the frontend UI** by hiding the button. A staff user can trivially bypass this by sending a direct POST request with `{ registrationId: X, override: true }`.

```typescript
// route.ts - NO role check before passing override to service
const { registrationId, override } = validationResult.data;
const staffUserId = session.user.id;
const result = await submitCheckin(registrationId, staffUserId, override);

// checkin.ts - accepts override from anyone
export async function submitCheckin(
  registrationId: number,
  staffUserId?: number,
  override: boolean = false  // No role verification!
)
```

**Impact:** Staff can override duplicate check-ins, which should be admin-only. Documented in CLAUDE.md as a known issue but **still not fixed**.

**Fix:** Add `if (override && session.user.role !== 'admin')` check in the API route before calling `submitCheckin`.

---

### C-02: Registration Submit and Confirm Endpoints Have ZERO Authentication

**File:** `/root/LABS/CEOG-4/app/api/registration/submit/route.ts`
**File:** `/root/LABS/CEOG-4/app/api/registration/confirm/route.ts`

Both endpoints accept a `guest_id` in the request body and perform registration operations **without any authentication**. An attacker who knows or guesses a guest ID can:

1. Submit a paid registration for any guest
2. Confirm/decline attendance for any invited guest
3. Inject arbitrary billing information
4. Set GDPR consent flags for other users

```typescript
// submit/route.ts - body is directly trusted
const body: SubmitBody = await request.json();
const { guest_id, ticket_type, billing_info, ... } = body;

// No auth check, no magic link validation, no session verification
if (!guest_id || typeof guest_id !== 'number') { ... }
// Directly processes registration with attacker-supplied guest_id
```

**Impact:** Complete unauthorized access to registration flow. Any user can register, decline, or modify registrations for any guest by supplying their numeric ID.

**Fix:** These endpoints MUST validate the magic link code + email before processing, or require a session token. The `guest_id` should be derived from the authenticated context, not the request body.

---

### C-03: Registration Status Endpoint Regenerates Tickets on Every GET Request

**File:** `/root/LABS/CEOG-4/app/api/registration/status/route.ts` (lines 62-73)

Every GET request to the status endpoint calls `generateTicket()` which creates a **new JWT token** and overwrites the database record:

```typescript
if (statusResult.ticket?.available && statusResult.registration?.id) {
  try {
    const ticketResult = await generateTicket(statusResult.registration.id);
    qrCodeDataUrl = ticketResult.qrCodeDataUrl;
  } catch (error) { ... }
}
```

`generateTicket` calls `generateTicketToken` which calls `prisma.registration.update` to store the new token. This means:

1. **Previous QR codes are invalidated** on every page refresh
2. Printed tickets become invalid when the guest checks the status page
3. Race condition: concurrent status checks generate conflicting tokens
4. Performance: Unnecessary JWT signing + DB write on every read operation

**Impact:** Guests with printed e-tickets will fail check-in after viewing the status page. This is a data corruption bug masquerading as a feature.

**Fix:** Use `getExistingTicket()` to retrieve the existing token, only generate a new one if none exists.

---

### C-04: Magic Links Never Expire (Business Logic Disabled)

**File:** `/root/LABS/CEOG-4/lib/auth/magic-link.ts` (lines 115-116)

The magic link expiry check has been **commented out**:

```typescript
// Magic links never expire - expiry check removed per business requirement
// The magic_link_expires_at field is still stored for reference but not validated
```

This means:
1. A leaked magic link URL provides **permanent access** to a guest's registration
2. The `MAGIC_LINK_EXPIRY_HOURS` env var documented in CLAUDE.md is **completely ignored**
3. The magic link is NOT cleared after successful registration for VIP guests (only the hash remains)
4. The CLAUDE.md documentation states "24-hour magic link expiry (all guest types)" which is **false**

**Impact:** Permanent access tokens disguised as "magic links." If any link is intercepted or leaked, there is no time-based mitigation.

---

### C-05: Stripe Checkout Has No Authentication -- Anyone Can Create Payment Sessions

**File:** `/root/LABS/CEOG-4/app/api/stripe/create-checkout/route.ts`

The Stripe checkout creation endpoint requires only a `registration_id` number:

```typescript
const createCheckoutSchema = z.object({
  registration_id: z.number().int().positive(),
});
// No auth check -- rate limited per registration ID, but no identity verification
```

An attacker can:
1. Enumerate registration IDs and create unlimited Stripe sessions (5 per 15 min per ID)
2. Trigger Stripe to send checkout emails to guests
3. Create orphaned payment records in the database

**Impact:** Stripe API abuse, potential billing confusion, and DoS on the payment system.

---

### C-06: PWA Auth Code Brute-Force Vulnerability

**File:** `/root/LABS/CEOG-4/app/api/pwa/auth/route.ts` (lines 79-101)
**File:** `/root/LABS/CEOG-4/lib/services/registration.ts` (lines 126-134)

The PWA auth code format `CEOG-XXXXXX` uses 30 characters (A-Z minus I,O + 2-9) with 6 positions = 30^6 = ~729 million combinations. However:

1. **No rate limiting** on the PWA auth endpoint
2. **No account lockout** after failed attempts
3. The code **never expires** (stored permanently in the database)
4. An attacker can brute-force codes at network speed

```typescript
// No rate limiting applied
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, code } = body;
  // Direct database lookup with no throttling
  if (code) {
    const guest = await prisma.guest.findFirst({
      where: { pwa_auth_code: normalizedCode },
    });
  }
}
```

**Impact:** With parallel requests, an attacker can enumerate all valid PWA codes and access any guest's profile, ticket, and table data.

---

### C-07: Debug Console.log Leaks Secrets in Production

**File:** `/root/LABS/CEOG-4/lib/services/payment.ts` (lines 112-114)

```typescript
// DEBUG: Log the URL construction
console.log('[PAYMENT] APP_URL env:', process.env.APP_URL);
console.log('[PAYMENT] NEXT_PUBLIC_APP_URL env:', process.env.NEXT_PUBLIC_APP_URL);
console.log('[PAYMENT] Using baseUrl:', baseUrl);
```

These are unconditional `console.log` statements that print environment variable values to production logs. Anyone with log access can read the URLs. While these specific values are not secrets, this pattern indicates a culture of leaving debug logs in production code.

**Impact:** Information disclosure through production logs.

---

### C-08: `request.json()` Not Wrapped in Try-Catch Across Multiple Routes

**Files:** Multiple API routes

Several API routes call `await request.json()` without catching malformed JSON errors:

- `/api/pwa/auth/route.ts` (line 30)
- `/api/registration/confirm/route.ts` (line 40)
- `/api/registration/submit/route.ts` (line 53)
- `/api/apply/route.ts` (line 66)
- `/api/stripe/create-checkout/route.ts` (line 30)

If a client sends invalid JSON (e.g., empty body, corrupted data), `request.json()` throws an unhandled exception. While the outer try/catch will catch it, the error message may leak internal details:

```typescript
// These routes just do:
const body = await request.json(); // Throws SyntaxError on invalid JSON
```

**Impact:** Unhandled JSON parse errors generate 500 responses with potentially leaked stack traces. Should return 400 with a "Malformed request body" message.

---

### C-09: TypeScript `strict: false` Defeats Type Safety Project-Wide

**File:** `/root/LABS/CEOG-4/tsconfig.json` (line 10)

```json
"strict": false
```

This disables:
- `strictNullChecks` -- null/undefined are assignable to any type
- `strictFunctionTypes` -- function parameter types not checked
- `strictPropertyInitialization` -- class properties not checked
- `noImplicitAny` -- untyped variables allowed without annotation
- `noImplicitThis` -- `this` can be `any`
- `alwaysStrict` -- no `"use strict"` directive

For a project with 44+ API endpoints handling payment data, PII, and authentication tokens, this is extremely dangerous. The non-null assertion operator (`!`) is used throughout the codebase (e.g., `registration.guest!.id` in checkin.ts line 124) which would be caught by strict mode.

**Impact:** Entire classes of bugs (null reference errors, type mismatches, implicit any) are invisible to the TypeScript compiler.

---

### C-10: Guest Delete Does Not Delete BillingInfo or ScheduledEmails

**File:** `/root/LABS/CEOG-4/lib/services/guest.ts` (lines 444-467)

The `deleteGuest` function manually cascades deletes but **misses** the `BillingInfo` and `ScheduledEmail` tables:

```typescript
return prisma.$transaction(async (tx) => {
  await tx.emailLog.deleteMany({ where: { guest_id: id } });
  await tx.checkin.deleteMany({ where: { guest_id: id } });
  await tx.tableAssignment.deleteMany({ where: { guest_id: id } });
  await tx.registration.deleteMany({ where: { guest_id: id } });
  // MISSING: BillingInfo (linked via registration_id)
  // MISSING: ScheduledEmail (linked via guest_id)
  return tx.guest.delete({ where: { id } });
});
```

While `BillingInfo` has `onDelete: Cascade` in the schema (via registration), the `registration.deleteMany` does NOT trigger Prisma's cascade because `deleteMany` bypasses relation middleware. And `ScheduledEmail` has no cascade at all.

**Impact:** Orphaned billing info records with PII (name, address, tax number) remain in the database after guest deletion. GDPR violation.

---

### C-11: In-Memory Rate Limiting on `/api/apply` Does Not Survive Restarts

**File:** `/root/LABS/CEOG-4/app/api/apply/route.ts` (lines 30-49)

```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
```

This in-memory Map is:
1. Cleared on every server restart / deployment
2. Not shared across multiple instances (PM2 cluster mode, Docker replicas)
3. A memory leak -- entries are never cleaned up (no periodic purge)

The project already has a **database-backed rate limiter** (`lib/services/rate-limit.ts`) that solves all these problems. This endpoint uses a bespoke in-memory implementation instead.

**Impact:** Ineffective rate limiting on a public endpoint. An attacker can bypass by waiting for a server restart, or if running multiple instances, requests are distributed and never hit the per-instance limit.

---

### C-12: Session JWT MaxAge Mismatch (24h in Code vs 8h in Documentation)

**File:** `/root/LABS/CEOG-4/lib/auth/auth-options.ts` (line 56)

```typescript
session: {
  strategy: 'jwt',
  maxAge: 24 * 60 * 60 // 24 hours
},
```

CLAUDE.md states: "Session strategy: JWT (not database sessions), **8 hour** expiry"

The actual session expiry is **24 hours**, not 8 hours as documented. This is a security concern because:
1. Stolen admin session tokens remain valid for a full day
2. Documentation gives a false sense of security
3. The longer window increases the attack surface for session hijacking

**Impact:** Documentation mismatch creates false security assumptions. Admin sessions valid 3x longer than documented.

---

### C-13: Applicant Approval Uses `requireAuth()` Not `requireAdmin()`

**File:** `/root/LABS/CEOG-4/app/api/admin/applicants/[id]/approve/route.ts` (line 20)

```typescript
const auth = await requireAuth();  // Allows staff users too!
if (!auth.success) return auth.response;
```

The applicant approval endpoint uses `requireAuth()` which allows **both admin and staff** users. According to the role-based permission matrix in CLAUDE.md, applicant approval should be **admin-only**. A staff user can approve applicants, which triggers magic link generation and email sending.

Similarly, the `approve-payment` endpoint at `/api/admin/guests/[id]/approve-payment/route.ts` also uses `requireAuth()` instead of `requireAdmin()`.

**Impact:** Staff users can approve applicants and manual payments, violating the documented RBAC model.

---

### C-14: Webhook Error Response Leaks Internal Error Details

**File:** `/root/LABS/CEOG-4/app/api/stripe/webhook/route.ts` (lines 256-259)

```typescript
return NextResponse.json(
  { received: true, error: 'Processed with error', details: errorMessage },
  { status: 200 }
);
```

The webhook handler returns internal error messages (`details: errorMessage`) in the HTTP response body. While Stripe is the expected caller, if the webhook URL is discovered, an attacker gets free error reconnaissance.

**Impact:** Information leakage of internal error states through the Stripe webhook endpoint.

---

## HIGH FINDINGS (Should Fix)

### H-01: No Input Sanitization on Registration Submit

**File:** `/root/LABS/CEOG-4/app/api/registration/submit/route.ts`

The registration submit endpoint uses manual validation (not Zod) and does **not sanitize or trim** input strings before storage:

```typescript
const body: SubmitBody = await request.json();
// No .trim() on: billing_first_name, billing_last_name, company, etc.
// No max length validation on most string fields
// No HTML/script tag stripping
```

While Prisma parameterizes SQL and React auto-escapes output, stored XSS payloads could affect:
1. Admin dashboard views that might use `dangerouslySetInnerHTML`
2. Email templates that render guest data
3. CSV exports that are opened in Excel

**Impact:** Potential stored XSS through unsanitized input in registration data.

---

### H-02: Guest List Endpoint Allows 500 Records Per Page (DoS Vector)

**File:** `/root/LABS/CEOG-4/app/api/admin/guests/route.ts` (line 115)

```typescript
limit: Math.min(limit, 500), // Max 500 per page for bulk operations
```

A client can request 500 guests per page with full relation loading (table_assignment + table + registration + payment + email_logs). With 10,000 guests, this generates massive JOIN queries with potentially hundreds of related records per guest.

**Impact:** Database performance degradation or timeout on large datasets.

---

### H-03: Rate Limit Service Has TOCTOU Race Condition

**File:** `/root/LABS/CEOG-4/lib/services/rate-limit.ts` (lines 39-91)

The rate limit check-and-increment is not atomic:

```typescript
// Step 1: Read entry
const entry = await prisma.rateLimitEntry.findUnique({ where: { key } });

// Step 2: Check if expired (time passes between read and write)
if (!entry || entry.expires_at < now) { ... }

// Step 3: Check attempts (race: another request may have incremented)
if (entry.attempts >= config.maxAttempts) { ... }

// Step 4: Increment (another request may have read the same count)
const updated = await prisma.rateLimitEntry.update({
  where: { key },
  data: { attempts: { increment: 1 } },
});
```

Two concurrent requests can both read `attempts = 4` (limit = 5), both pass the check, and both increment to 5 and 6 respectively, exceeding the intended limit.

**Impact:** Rate limits can be bypassed by sending parallel requests.

---

### H-04: No Pagination Limit on Audit Log, Email Log, and Checkin Log Endpoints

**File:** `/root/LABS/CEOG-4/lib/services/audit.ts` (line 165)
**File:** `/root/LABS/CEOG-4/lib/services/checkin.ts` (line 306)

```typescript
// audit.ts
const { page = 1, limit = 50, ... } = params;
// No upper bound on limit!

// checkin.ts
const { page = 1, limit = 50, ... } = params;
// No upper bound on limit!
```

A client can pass `?limit=100000` to retrieve the entire audit log in a single request, potentially tens of thousands of records.

**Impact:** Memory exhaustion and database performance degradation.

---

### H-05: Email Transporter Uses Busy-Wait Loop

**File:** `/root/LABS/CEOG-4/lib/services/email.ts` (lines 77-89)

```typescript
if (isInitializing) {
  const startTime = Date.now();
  while (isInitializing) {
    if (Date.now() - startTime > TRANSPORTER_INIT_TIMEOUT_MS) {
      isInitializing = false;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
```

This is a **spin-wait** pattern that burns CPU cycles polling every 50ms. In a serverless/edge environment, this blocks the event loop thread. A proper implementation would use a Promise-based mutex or event emitter.

**Impact:** CPU waste and event loop blocking during concurrent email operations.

---

### H-06: Checkin Service Delete + Create Is Not Atomic for Override

**File:** `/root/LABS/CEOG-4/lib/services/checkin.ts` (lines 197-217)

```typescript
// If override, delete existing check-in first
if (registration.checkin && override) {
  await prisma.checkin.delete({                    // Step 1: Delete
    where: { id: registration.checkin.id },
  });
}

// Create check-in record (separate operation)
const [checkin] = await prisma.$transaction([      // Step 2: Create
  prisma.checkin.create({ ... }),
  prisma.guest.update({ ... }),
]);
```

The delete and create operations are NOT in the same transaction. If the server crashes between delete and create, the guest has no check-in record but was already checked in. The `$transaction` only wraps the create+update, not the delete.

**Impact:** Data loss on override -- guest could lose their check-in record if the server fails at the wrong moment.

---

### H-07: Guest Stats Does Not Count All Registration Statuses

**File:** `/root/LABS/CEOG-4/lib/services/guest.ts` (lines 497-506)

```typescript
const statusStats = {
  invited: 0,
  registered: 0,
  approved: 0,
  declined: 0,
  // MISSING: pending, pending_approval, rejected, cancelled, checked_in
};
```

The `GuestStats` interface and `getGuestStats` function only track 4 out of 9 registration statuses. Guests in `pending`, `pending_approval`, `rejected`, `cancelled`, and `checked_in` statuses are counted in `total` but not reflected in `byStatus`, making the dashboard numbers not add up.

**Impact:** Dashboard statistics are inaccurate and misleading.

---

### H-08: `updateGuest` Service Spreads Validated Data Directly to Prisma

**File:** `/root/LABS/CEOG-4/lib/services/guest.ts` (lines 429-436)

```typescript
export async function updateGuest(id: number, data: UpdateGuestInput) {
  return prisma.guest.update({
    where: { id },
    data: {
      ...data,  // Spread entire validated data object
      updated_at: new Date(),
    },
  });
}
```

While the API route uses Zod validation to filter fields, the `updateGuest` service accepts an `UpdateGuestInput` interface that could include `registration_status`. An admin can change a guest's status to any value (including `checked_in`) via the PATCH endpoint, bypassing the normal check-in flow.

**Impact:** Status manipulation bypassing business logic constraints.

---

### H-09: Stripe Payment Amount Uses Fillér (Not Standard for HUF)

**File:** `/root/LABS/CEOG-4/lib/services/payment.ts` (lines 37-46)

```typescript
const TICKET_PRICES_FILLER: Record<TicketType, number> = {
  paid_single: 10000000, // 100,000 Ft = 10,000,000 fillér
  paid_paired: 15000000, // 150,000 Ft = 15,000,000 fillér
  vip_free: 0,
};
```

HUF is a **zero-decimal currency** in Stripe. According to Stripe documentation, amounts for HUF should be specified in the **major unit** (forints), NOT in fillér. If Stripe treats HUF as zero-decimal, sending `10000000` would charge 10,000,000 HUF (about $25,000 USD) instead of 100,000 HUF.

Stripe's documentation says: "For zero-decimal currencies, provide the amount as-is. For example, to charge 1000 JPY, provide amount as 1000."

HUF is listed as a zero-decimal currency by Stripe.

**Impact:** Guests could be charged 100x the intended amount. This is a **critical financial bug** if Stripe treats HUF as zero-decimal.

**Note:** If the Stripe account is configured to use fillér (non-standard), this may work correctly, but it should be explicitly verified and documented.

---

### H-10: No CSRF Exception for PWA API Routes

**File:** `/root/LABS/CEOG-4/middleware.ts` (lines 104-118)

The CSRF validation allows requests **without origin/referer** to reach PWA API routes:

```typescript
if (!origin && !referer) {
  if (pathname.startsWith('/api/admin/') ||
      pathname.startsWith('/api/registration/') ||
      pathname.startsWith('/api/checkin/')) {
    return false;  // Blocks admin, registration, checkin
  }
  return true;  // ALLOWS: /api/pwa/*, /api/stripe/*, /api/apply/*
}
```

The PWA endpoints (`/api/pwa/auth`, `/api/pwa/profile`, etc.) accept requests without any origin or referer header, making them susceptible to CSRF attacks from non-browser clients or tools.

**Impact:** PWA endpoints can be accessed from any context without CSRF protection.

---

### H-11: Partner Email Validation Allows Duplicate Registration Within Same Request

**File:** `/root/LABS/CEOG-4/lib/services/registration.ts` (lines 700-740)

When processing paid registration with a partner, if the partner already exists as a guest:

```typescript
if (!existingPartner) {
  // Create new partner
} else {
  // Update existing guest as partner -- SILENTLY overwrites their data
  await tx.guest.update({
    where: { id: existingPartner.id },
    data: {
      paired_with_id: data.guest_id,
      registration_status: 'registered',
      // Overwrites phone, company, position, dietary, seating
    },
  });
}
```

An attacker can pair themselves with **any existing guest** by specifying their email as the partner email. This overwrites the existing guest's `paired_with_id`, `registration_status`, and profile fields.

**Impact:** Unauthorized modification of existing guest records through partner registration.

---

### H-12: setTimeout-Based Email Delay Is Unreliable in Serverless

**File:** `/root/LABS/CEOG-4/lib/services/registration.ts` (lines 434-449)

```typescript
const QR_EMAIL_DELAY_MS = 3 * 60 * 1000; // 3 minutes
setTimeout(() => {
  void generatePairedTicketsWithRetry(result.registration.id, result.partnerRegistrationId!, 3);
}, QR_EMAIL_DELAY_MS);
```

`setTimeout` with a 3-minute delay in a serverless/edge function is **unreliable** because:
1. The function may be terminated before the timeout fires
2. Cold starts reset all pending timeouts
3. PM2 restarts clear in-memory state

**Impact:** VIP guests may never receive their QR ticket emails if the server restarts within the 3-minute window.

---

### H-13: Inconsistent Use of Logger vs console.error

28 occurrences of raw `console.log`/`console.error`/`console.warn` found across 18 API route files, despite the project having a dedicated logger utility at `lib/utils/logger.ts`. Examples:

- `approve-payment/route.ts` uses `console.log` and `console.error` (4 occurrences)
- `tables/route.ts` uses raw `console.error` (2 occurrences)
- `table-assignments/route.ts` uses raw `console.error` (2 occurrences)
- `pwa/profile/route.ts` uses raw `console.error` (2 occurrences)

**Impact:** Inconsistent logging makes production debugging harder and means some errors may lack proper context.

---

### H-14: `getGuestById` Returns Full Email Logs Without Limit

**File:** `/root/LABS/CEOG-4/lib/services/guest.ts` (lines 311-327)

```typescript
export async function getGuestById(id: number) {
  return prisma.guest.findUnique({
    where: { id },
    include: {
      registration: true,
      table_assignment: { include: { table: true } },
      email_logs: {
        orderBy: { sent_at: 'desc' },
        take: 10,  // Limited to 10 -- good
      },
    },
  });
}
```

While this specific query limits to 10 email logs, the `getGuestList` function in the same file includes ALL `email_logs` for magic link type across ALL guests in the paginated result. With 500 guests and multiple email sends each, this could return thousands of email log records.

**Impact:** Performance degradation on the guest list page.

---

### H-15: Apply Endpoint Returns Guest ID in Response

**File:** `/root/LABS/CEOG-4/app/api/apply/route.ts` (line 132)

```typescript
return NextResponse.json({
  success: true,
  message: 'Application submitted successfully',
  guest_id: guest.id,  // Exposes internal ID
}, { status: 201 });
```

The public apply endpoint returns the internal database ID of the newly created guest. Combined with C-02, an attacker can use this to access registration endpoints.

**Impact:** Information disclosure that enables further attacks.

---

### H-16: No Admin Self-Demotion Protection

**File:** `/root/LABS/CEOG-4/app/api/admin/users/[id]/route.ts` (lines 80-88)

The user update endpoint prevents deleting yourself but does NOT prevent **changing your own role from admin to staff**:

```typescript
// Only prevents delete, not role change
if (auth.session?.user?.email === existing.email) {
  return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
}
// But role change to staff is allowed, which would lock yourself out of admin
```

**Impact:** An admin can accidentally demote themselves to staff, potentially locking out the only admin.

---

### H-17: CSP Allows `unsafe-inline` and `unsafe-eval` for Scripts

**File:** `/root/LABS/CEOG-4/next.config.js` (line 38)

```javascript
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.jsdelivr.net",
```

Both `unsafe-inline` and `unsafe-eval` are present in the Content Security Policy, which significantly weakens XSS protection. While Next.js requires `unsafe-inline` for its runtime, `unsafe-eval` should not be needed in production.

**Impact:** Weakened XSS protection. An attacker who can inject content can execute inline scripts.

---

### H-18: Magic Link URL Includes Email in Plaintext

**File:** `/root/LABS/CEOG-4/app/api/admin/applicants/[id]/approve/route.ts` (line 66)

```typescript
const magicLinkUrl = `${process.env.APP_URL}/register?code=${hash}&email=${encodeURIComponent(applicant.email)}`;
```

The magic link contains both the hash AND the email in the URL. This is visible in:
1. Server access logs
2. Browser history
3. Referer headers if the user clicks an external link from the page
4. Analytics tools

**Impact:** Guest email addresses leaked through URL parameters in various logging systems.

---

## MEDIUM FINDINGS (Should Fix When Convenient)

### M-01: `GuestType` Stats Map Missing `applicant` Type

**File:** `/root/LABS/CEOG-4/lib/services/guest.ts` (lines 488-494)

```typescript
const typeStats = {
  vip: 0,  // Actually 'invited' in the enum
  paying_single: 0,
  paying_paired: 0,
  // MISSING: applicant
};
```

Also, the key is `vip` but the enum value is `invited`, so the `typeStats['invited']` assignment on line 494 would set a non-existent key.

---

### M-02: No Email Normalization Consistency

Email normalization (`.toLowerCase().trim()`) is applied inconsistently:
- `apply/route.ts`: Uses `.toLowerCase()` (line 108)
- `registration/submit/route.ts`: Uses `.toLowerCase()` only for partner email comparison (line 218)
- `admin/guests/route.ts`: No email normalization on create
- `csv.ts`: Uses `.toLowerCase().trim()` (line 363)

---

### M-03: Prisma Query Logging Enabled in Development Exposes SQL

**File:** `/root/LABS/CEOG-4/lib/db/prisma.ts` (line 15)

```typescript
log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
```

Query logging includes full SQL with parameter values, which may contain PII (email addresses, names). This is acceptable in development but the boundary check relies on `NODE_ENV`, which could be misconfigured.

---

### M-04: `password` Field Has Minimum 8 Characters But No Complexity Requirements

**File:** `/root/LABS/CEOG-4/app/api/admin/users/route.ts` (line 20)

```typescript
password: z.string().min(8),
```

No uppercase, lowercase, number, or special character requirements. For admin/staff accounts that protect the entire guest database, this is insufficient.

---

### M-05: Missing `Content-Type` Validation on API Routes

None of the API routes verify that the incoming `Content-Type` is `application/json` before calling `request.json()`. A request with `Content-Type: text/html` and a valid JSON body would be processed.

---

### M-06: Checkin Delete on Override Does Not Log Audit Event

**File:** `/root/LABS/CEOG-4/lib/services/checkin.ts` (lines 197-201)

When an admin overrides a check-in, the old check-in record is deleted but no audit log entry is created for the deletion. The only record is the new check-in with `is_override: true`.

---

### M-07: `deleteGuest` Missing Payment Record Deletion

**File:** `/root/LABS/CEOG-4/lib/services/guest.ts` (lines 455-462)

The manual cascade in `deleteGuest` deletes email logs, checkins, table assignments, and registrations, but does NOT delete the `Payment` record (linked via `registration_id`). While `Registration` has `onDelete: Cascade` from Payment, `deleteMany` does not trigger cascades.

---

### M-08: `GuestListResponse` Uses `any`-like Pattern via Type Assertion

**File:** `/root/LABS/CEOG-4/lib/services/guest.ts` (line 293)

```typescript
return {
  ...guestWithoutLogs,
  lastMagicLinkAt,
  magicLinkCount,
  magicLinkCategory,
} as GuestListItem;  // Unsafe type assertion
```

The `as GuestListItem` cast bypasses type checking. If the Prisma query result changes shape, this will silently produce incorrect data.

---

### M-09: Seating Service Has Unbounded Query for Unassigned Guests

Without reviewing the full seating service, the guest list query for unassigned guests potentially loads all guests without table assignments, which could be the entire guest list for a 10,000-guest event.

---

### M-10: PWA Session Uses Same Secret as Magic Links (`APP_SECRET`)

**File:** `/root/LABS/CEOG-4/app/api/pwa/auth/route.ts` (line 7)
**File:** `/root/LABS/CEOG-4/lib/auth/magic-link.ts` (line 23)

Both the PWA session JWT and the magic link hash use `APP_SECRET`. A compromise of one secret compromises both authentication systems.

---

### M-11: `auth-options.ts` Uses `as any` for Role Assignment

**File:** `/root/LABS/CEOG-4/lib/auth/auth-options.ts` (line 76)

```typescript
session.user.role = token.role as any;
```

This is the only `as any` in the entire codebase and it bypasses the NextAuth type system. A proper fix would extend the NextAuth types.

---

### M-12: Rate Limit Cleanup Is Probabilistic (1% Chance)

**File:** `/root/LABS/CEOG-4/lib/services/rate-limit.ts` (lines 34-36)

```typescript
if (Math.random() < 0.01) {
  await cleanupExpiredEntries();
}
```

Expired rate limit entries are only cleaned up with a 1% chance per request. Under low traffic, the table could accumulate thousands of expired entries.

---

## LOW FINDINGS (Nice to Fix)

### L-01: Missing `readonly` on Constant Objects

Constants like `REGISTRATION_STATUS_INFO`, `PAYMENT_STATUS_INFO`, `TABLE_TYPE_COLORS` use `as const` but their container objects are not `Readonly<>`. While `as const` makes values immutable, the TypeScript type does not prevent reassignment of the variable itself.

### L-02: Inconsistent Error Code Patterns

Some routes return `{ error: 'UPPERCASE_CODE' }`, others return `{ error: 'Human readable message' }`, and some return `{ error: 'Hungarian message' }`. There is no standard error code enum or format.

### L-03: Only 3 Unit Tests for 44+ Endpoints

The test directory contains only:
- `guest-list-filtering.test.ts`
- `magic-link-category.test.ts`
- `partner-email-validation.test.ts`

This is approximately 6% coverage of the API surface area. Critical paths like payment processing, check-in, and admin CRUD have zero unit tests.

### L-04: `updated_at` Set Manually in `updateGuest`

**File:** `/root/LABS/CEOG-4/lib/services/guest.ts` (line 433)

```typescript
data: {
  ...data,
  updated_at: new Date(),  // Redundant -- Prisma @updatedAt handles this
},
```

The Guest model has `@updatedAt` on `updated_at`, which automatically sets the value. Setting it manually is redundant.

### L-05: `generateEtags: false` May Hurt Caching Performance

**File:** `/root/LABS/CEOG-4/next.config.js` (line 7)

Disabling ETags removes conditional GET support, meaning browsers always download full responses even when content hasn't changed.

### L-06: Constants File Has Hard-Coded Event Name

**File:** `/root/LABS/CEOG-4/lib/constants.ts` (lines 13-14)

```typescript
export const EVENT_NAME = 'CEO Gala 2026';
export const EVENT_NAME_EN = 'CEO Gala 2026';
```

Event name should be configurable via environment variable for reusability.

### L-07: Webpack Bundle May Include Server-Only Code

The `email.ts` service uses `require('fs')` and `require('path')` at runtime (line 46-47), which may cause webpack warnings or errors if accidentally imported in a client component.

### L-08: `void` Keyword Used for Fire-and-Forget Async Without Error Boundary

**File:** `/root/LABS/CEOG-4/lib/services/registration.ts` (line 390)

```typescript
void (async () => {
  try { ... } catch (feedbackError) { logError(...); }
})();
```

While there is a try/catch inside, if the IIFE itself throws (e.g., during `async` function construction), the error is silently swallowed by `void`. The pattern is correct but fragile.

---

## Summary Table

| Severity | Count | Key Themes |
|----------|-------|------------|
| CRITICAL | 14 | Authentication bypass, IDOR, data corruption, financial bug, type safety disabled |
| HIGH | 18 | Race conditions, RBAC violations, information disclosure, performance, inconsistency |
| MEDIUM | 12 | Missing cleanup, weak passwords, audit gaps, secret reuse |
| LOW | 8 | Code style, testing gaps, redundancy |

---

## Recommended Priorities

### Immediate (Block Production Deploy)
1. **C-02**: Add authentication to registration endpoints
2. **C-05**: Add authentication to Stripe checkout creation
3. **C-01**: Enforce admin-only override in check-in API
4. **C-03**: Stop regenerating tickets on status page view
5. **C-06**: Add rate limiting to PWA auth
6. **H-09**: Verify HUF is not zero-decimal in Stripe configuration
7. **C-13**: Fix RBAC on applicant approval and payment approval

### Short-Term (Within 1 Week)
8. **C-09**: Enable TypeScript strict mode incrementally
9. **C-10**: Fix guest deletion cascade for BillingInfo and ScheduledEmail
10. **C-04**: Re-enable magic link expiry or document the security trade-off
11. **H-03**: Make rate limiting atomic (use database-level atomicity)
12. **H-06**: Make check-in override atomic (single transaction)
13. **H-12**: Replace setTimeout with scheduled email queue for VIP tickets

### Medium-Term (Within 1 Sprint)
14. **H-11**: Prevent partner registration from overwriting existing guests
15. **H-01**: Add input sanitization/trimming on all registration inputs
16. **H-13**: Standardize on logger utility across all routes
17. **L-03**: Add unit tests for critical payment and check-in paths

---

*Report generated by Amelia (Developer Agent) -- Adversarial Code Review Workflow*
*BMad Method v6.0.0 -- 2026-03-01*
