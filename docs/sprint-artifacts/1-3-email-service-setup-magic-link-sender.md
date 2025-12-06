# Story 1.3: Email Service Setup & Magic Link Sender

Status: done
Completed: 2025-11-28

Epic: Epic 1 - Core Registration (MVP)
Story ID: 1.3
Created: 2025-11-28
Author: Javo!

---

## Story

As an **admin user**,
I want to **send magic link invitation emails to guests from the admin dashboard**,
so that **guests can securely access the registration system using passwordless authentication**.

## Context

Ez a harmadik story az Epic 1: Core Registration (MVP) epic-ben. Az Epic 1 tech context teljes részleteket tartalmaz a rendszer architektúrájáról és technikai követelményeiről ([tech-spec-epic-1.md](./tech-spec-epic-1.md)).

**Előfeltétel:** Story 1.2 (Admin Authentication & Session Management) - admin session szükséges az email küldéshez.

**Folytatás:** Story 1.4 (CSV Guest List Import) - bulk import után automatikus email küldés opció.

## Acceptance Criteria

### AC-1.3.1: Magic Link Hash Generation

**Given** I have a guest record with email address
**When** I trigger magic link email sending
**Then** a unique hash is generated using SHA-256(email + APP_SECRET + timestamp)

**And** the hash is stored in `guests.magic_link_hash` column

**And** the expiry timestamp (5 minutes from generation) is stored in `guests.magic_link_expires_at`

### AC-1.3.2: Email Sending Functionality

**Given** I am on the admin dashboard or guest list
**When** I click "Send Invitation" for a guest
**Then** a magic link email is sent via Nodemailer SMTP

**And** the email contains:
- Personal greeting with guest name
- Event information
- Magic link URL: `/register?code={hash}&email={email}`
- Clear call-to-action button

### AC-1.3.3: Rate Limiting

**Given** I have already sent 5 magic link emails to a guest in the last hour
**When** I try to send another magic link email
**Then** I receive an error: "Rate limit exceeded. Maximum 5 emails per hour."

**And** the email is NOT sent

### AC-1.3.4: Email Logging

**Given** a magic link email is sent (or fails)
**When** the delivery attempt completes
**Then** a record is created in `email_logs` table with:
- `guest_id` - reference to guest
- `email_type` = "magic_link"
- `recipient` - email address
- `subject` - email subject
- `status` = "sent" or "failed"
- `error_message` - if failed
- `sent_at` - timestamp

### AC-1.3.5: Bulk Email Sending

**Given** I have selected multiple guests from the guest list
**When** I click "Send Invitations" bulk action
**Then** magic link emails are sent to all selected guests

**And** I see a summary: "X emails sent, Y failed"

**And** failed emails are logged with error details

---

## Tasks / Subtasks

### Task 1: Email Service Module Setup (AC: #1.3.2)
- [ ] Install Nodemailer dependency: `npm install nodemailer @types/nodemailer`
- [ ] Create email service: `lib/services/email.ts`
  - [ ] Configure SMTP transport with environment variables
  - [ ] Create `sendEmail()` base function with retry logic
  - [ ] Implement error handling and logging
- [ ] Add environment variables to `.env.local`:
  ```
  SMTP_HOST=smtp.mailtrap.io
  SMTP_PORT=587
  SMTP_USER=your_username
  SMTP_PASS=your_password
  SMTP_FROM=noreply@ceogala.test
  ```
- [ ] Create email templates directory: `lib/email-templates/`

### Task 2: Magic Link Hash Generation (AC: #1.3.1)
- [ ] Create magic link utility: `lib/auth/magic-link.ts`
  - [ ] Implement `generateMagicLinkHash(email: string): { hash: string, expiresAt: Date }`
    - Use crypto.createHash('sha256') with email + APP_SECRET + timestamp
    - Set expiry to 5 minutes from now
  - [ ] Implement `validateMagicLink(hash: string, email: string): Promise<boolean>`
    - Lookup guest by email
    - Compare hash
    - Check expiry
    - Return validation result
- [ ] Update Prisma schema if needed (verify `magic_link_hash` and `magic_link_expires_at` columns exist)

### Task 3: Magic Link Email Function (AC: #1.3.2)
- [ ] Create `sendMagicLinkEmail(guestId: number)` in email.ts
  - [ ] Lookup guest by ID
  - [ ] Generate magic link hash (call magic-link.ts)
  - [ ] Update guest record with hash and expiry
  - [ ] Compose email from template:
    - Subject: "CEO Gála - Meghívó regisztrálásra"
    - Body: HTML template with personalized greeting
    - Magic link URL: `{APP_URL}/register?code={hash}&email={encodeURIComponent(email)}`
  - [ ] Send email via Nodemailer
  - [ ] Log delivery to email_logs table
  - [ ] Return success/failure result

### Task 4: Email Template Creation (AC: #1.3.2)
- [ ] Create magic link HTML template: `lib/email-templates/magic-link.ts`
  - [ ] Personalized greeting: "Kedves {name}!"
  - [ ] Event details section (date, venue, description)
  - [ ] Prominent CTA button: "Regisztráció megkezdése"
  - [ ] Footer with contact info
  - [ ] Responsive design (mobile-friendly)
- [ ] Add plain text fallback version

### Task 5: Rate Limiting Implementation (AC: #1.3.3)
- [ ] Implement rate limit check in email.ts:
  ```typescript
  async function checkRateLimit(guestId: number): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recentEmails = await prisma.emailLog.count({
      where: {
        guest_id: guestId,
        email_type: 'magic_link',
        sent_at: { gte: oneHourAgo }
      }
    });
    return recentEmails < 5;
  }
  ```
- [ ] Apply rate limit check before sending
- [ ] Return clear error message when limit exceeded

### Task 6: API Route Handler (AC: #1.3.2, #1.3.5)
- [ ] Create API route: `app/api/email/send-magic-link/route.ts`
  - [ ] POST handler accepting `{ guest_ids: number[] }`
  - [ ] Validate admin session (NextAuth getServerSession)
  - [ ] For each guest_id:
    - Check rate limit
    - Send magic link email
    - Track success/failure
  - [ ] Return summary: `{ success: true, sent: number, failed: number, errors: [] }`
- [ ] Add appropriate error handling and HTTP status codes

### Task 7: Admin UI Integration (AC: #1.3.2, #1.3.5)
- [ ] Add "Send Invitation" button to admin dashboard `/admin` page
  - [ ] Button per guest row (individual send)
  - [ ] Checkbox selection + "Send Invitations" bulk action
- [ ] Implement UI state handling:
  - [ ] Loading state during send
  - [ ] Success toast/notification
  - [ ] Error display with details
- [ ] Add confirmation dialog for bulk send: "Send X invitations?"

### Task 8: Email Logging (AC: #1.3.4)
- [ ] Verify EmailLog model in Prisma schema
- [ ] Implement `logEmailDelivery()` function:
  ```typescript
  await prisma.emailLog.create({
    data: {
      guest_id: guestId,
      email_type: 'magic_link',
      recipient: email,
      subject: subject,
      status: success ? 'sent' : 'failed',
      error_message: error?.message || null
    }
  });
  ```
- [ ] Call logging after each email send attempt

### Task 9: E2E & Integration Testing (AC: All)
- [ ] Write Playwright E2E test: `tests/e2e/email-send.spec.ts`
  - [ ] Test single guest invitation send (mocked SMTP)
  - [ ] Test bulk invitation send
  - [ ] Test rate limit error display
- [ ] Write integration tests: `tests/integration/email-service.test.ts`
  - [ ] Test hash generation (deterministic for same inputs)
  - [ ] Test rate limit logic
  - [ ] Test email logging
  - [ ] Mock Nodemailer transport
- [ ] Write unit tests: `tests/unit/magic-link.test.ts`
  - [ ] Test hash generation algorithm
  - [ ] Test expiry calculation

---

## Dev Notes

### Architecture Patterns

**Email Service Pattern:**
- Singleton Nodemailer transport (connection pooling)
- Queue-based sending for bulk operations (future enhancement)
- Retry logic with exponential backoff (3 attempts)
- Separation: `email.ts` (sending) vs `magic-link.ts` (hash logic)

**Magic Link Security:**
- Hash algorithm: SHA-256 (crypto.createHash)
- Secret: APP_SECRET from environment (min 64 chars)
- Format: `sha256(email + APP_SECRET + timestamp)` → hex string
- Expiry: 5 minutes after generation
- Single-use: Hash cleared after successful validation (Story 1.5)

**Rate Limiting Strategy:**
- Database-backed (email_logs table count)
- Window: 1 hour sliding
- Limit: 5 emails per guest per hour
- Bypass: None in this story (expired link bypass in Story 1.5)

### Project Structure Notes

**New Files:**
```
lib/
├── services/
│   └── email.ts               # Email sending service
├── auth/
│   └── magic-link.ts          # Magic link hash generation/validation
└── email-templates/
    └── magic-link.ts          # HTML email template

app/
└── api/
    └── email/
        └── send-magic-link/
            └── route.ts       # API endpoint

tests/
├── e2e/
│   └── email-send.spec.ts
├── integration/
│   └── email-service.test.ts
└── unit/
    └── magic-link.test.ts
```

**Modified Files:**
```
.env.local                     # SMTP credentials
app/admin/page.tsx             # Add "Send Invitation" button
```

### Learnings from Previous Story

**From Story 1.2 (Status: done)**

- **NextAuth.js Setup Available**: `lib/auth/auth-options.ts` already configured - use `getServerSession(authOptions)` for admin validation
- **Session Type Extensions**: `types/next-auth.d.ts` has user.id, user.role - can use for admin role check
- **Middleware Pattern**: `/admin/*` routes protected - new `/api/email/*` routes need explicit session check
- **Rate Limiting Pattern**: In-memory rate limiter in auth-options.ts - email service should use database-backed for persistence
- **Testing Setup**: Playwright E2E tests configured at `tests/e2e/` - follow same patterns

[Source: docs/sprint-artifacts/1-2-admin-authentication-session-management.md]

### References

**Tech Stack Docs:**
- Nodemailer: https://nodemailer.com/about/
- Node.js Crypto: https://nodejs.org/api/crypto.html

**FUNKCIONALIS-KOVETELMENY.md Sections:**
- FR-2.1.2: Email Meghívó Küldése
- Section 3.1.2: Magic Link Security Requirements

**Epic 1 Tech Context:**
- [tech-spec-epic-1.md](./tech-spec-epic-1.md) - Section "Services and Modules" (email.ts, magic-link.ts)
- [tech-spec-epic-1.md](./tech-spec-epic-1.md) - Section "APIs and Interfaces" (POST /api/email/send-magic-link)
- [tech-spec-epic-1.md](./tech-spec-epic-1.md) - Section "Workflows and Sequencing" (Magic Link Email Flow)

---

## Dev Agent Record

### Context Reference
- Epic: Epic 1 - Core Registration (MVP)
- Story Dependencies: Story 1.2 (admin authentication)
- Epic Tech Context: [tech-spec-epic-1.md](./tech-spec-epic-1.md)
- Functional Requirements: [FUNKCIONALIS-KOVETELMENY.md](../FUNKCIONALIS-KOVETELMENY.md)
- Story Context XML: [1-3-email-service-setup-magic-link-sender.context.xml](./1-3-email-service-setup-magic-link-sender.context.xml)

### Agent Model Used
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References
- Unit tests: `npm run test:unit` - 6 tests passed
- E2E tests: `npm run test:e2e tests/e2e/email-send.spec.ts` - 8 tests passed

### Completion Notes List
- **Email Service Singleton**: Created `lib/services/email.ts` with singleton Nodemailer transport for connection pooling
- **Magic Link Hash**: SHA-256 hash using `email + APP_SECRET + timestamp`, 5-minute expiry
- **Rate Limiting**: Database-backed via `email_logs` table count (5 emails/hour/guest)
- **Prisma Singleton**: Added `lib/db/prisma.ts` for global Prisma client (prevents hot-reload issues)
- **Vitest Config**: Added `vitest.config.ts` and `tests/setup.ts` for unit/integration tests
- **Guest List UI**: Created `/admin/guests` page with "Send Invitation" buttons (individual and bulk)
- **API Validation**: Zod schema validation on POST /api/email/send-magic-link

### File List

**NEW FILES:**
```
lib/db/prisma.ts
lib/services/email.ts
lib/auth/magic-link.ts
lib/email-templates/magic-link.ts
app/api/email/send-magic-link/route.ts
app/admin/guests/page.tsx
app/admin/guests/GuestList.tsx
tests/e2e/email-send.spec.ts
tests/unit/magic-link.test.ts
tests/setup.ts
vitest.config.ts
```

**MODIFIED FILES:**
```
package.json (added vitest test scripts)
```

**DELETED FILES:**
```
(none)
```
