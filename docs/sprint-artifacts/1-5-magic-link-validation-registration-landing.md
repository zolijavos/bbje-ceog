# Story 1.5: Magic Link Validation & Registration Landing

Status: drafted
Epic: Epic 1 - Core Registration (MVP)
Story ID: 1.5
Created: 2025-11-28
Author: Claude (BMad Workflow)

---

## Story

As a **guest**,
I want to **click a magic link in my invitation email and be validated**,
so that **I can access a personalized registration page to confirm my attendance**.

## Context

Ez az ötödik story az Epic 1: Core Registration (MVP) epic-ben. Az Epic 1 tech context teljes részleteket tartalmaz a rendszer architektúrájáról és technikai követelményeiről ([tech-spec-epic-1.md](./tech-spec-epic-1.md)).

**Előfeltétel:** Story 1.3 (Email Service Setup & Magic Link Sender) - magic link hash generálás és email küldés.

**Folytatás:** Story 1.6 (VIP Guest Registration) és Story 1.7 (Paid Guest Registration Form) - a landing page után a vendég típusától függően különböző regisztrációs flow-k.

## Acceptance Criteria

### AC-1.5.1: Magic Link URL Processing

**Given** I received an invitation email with a magic link
**When** I click the link `/register?code={hash}&email={email}`
**Then** the system validates the hash against the database

**And** the system checks if the magic link has expired (5 minutes from generation)

### AC-1.5.2: Successful Validation - Welcome Page

**Given** I click a valid, non-expired magic link
**When** the validation succeeds
**Then** I see a welcome page with:
- Personal greeting: "Üdvözöljük, {name}!"
- My guest category displayed (VIP / Fizető vendég)
- Clear call-to-action to proceed with registration

### AC-1.5.3: Invalid Hash Error

**Given** I click a magic link with an invalid/modified hash
**When** the validation fails
**Then** I see an error page with:
- Error message: "Érvénytelen meghívó link"
- "Új link kérése" button to request a new magic link

### AC-1.5.4: Expired Link Error

**Given** I click a magic link after 5 minutes from generation
**When** the validation fails due to expiry
**Then** I see an error page with:
- Error message: "A meghívó link lejárt"
- "Új link kérése" button (bypasses rate limit for expired links)
- Explanation that links are valid for 5 minutes

### AC-1.5.5: Request New Link Flow

**Given** I am on the error page with an expired/invalid link
**When** I click "Új link kérése" button
**Then** I see a form to enter my email address

**And** after submitting a valid email that exists in the guest list

**Then** a new magic link email is sent (bypasses hourly rate limit if previous link was expired)

---

## Tasks / Subtasks

### Task 1: Registration Landing Page (AC: #1.5.1, #1.5.2)
- [ ] Create page route: `app/register/page.tsx`
  - [ ] Extract `code` and `email` from searchParams
  - [ ] Call `validateMagicLink(hash, email)` server-side
  - [ ] On success: Fetch guest data (name, guest_type)
  - [ ] Render appropriate component based on validation result
- [ ] Create `RegisterWelcome` client component
  - [ ] Display personalized greeting
  - [ ] Show guest category badge
  - [ ] "Folytatás" button to proceed to registration

### Task 2: Error Page Components (AC: #1.5.3, #1.5.4)
- [ ] Create `RegisterError` component
  - [ ] Accept `errorType` prop: 'invalid' | 'expired' | 'not_found'
  - [ ] Display appropriate error message
  - [ ] "Új link kérése" button linking to request form
- [ ] Differentiate expired vs invalid error messages

### Task 3: Request New Link Page (AC: #1.5.5)
- [ ] Create page: `app/register/request-link/page.tsx`
  - [ ] Email input form
  - [ ] Submit handler
- [ ] Create API route: `app/api/register/request-link/route.ts`
  - [ ] POST handler accepting `{ email: string }`
  - [ ] Check if guest exists
  - [ ] Bypass rate limit if `reason: 'expired'` query param present
  - [ ] Generate new magic link and send email
  - [ ] Return success/error response

### Task 4: Extended Magic Link Validation (AC: #1.5.1)
- [ ] Update `validateMagicLink` in `lib/auth/magic-link.ts` (if needed)
  - [ ] Return detailed error type ('invalid' | 'expired' | 'no_link')
  - [ ] Include guest data on success (name, guest_type, status)

### Task 5: Rate Limit Bypass Logic (AC: #1.5.5)
- [ ] Modify email rate limit check in `lib/services/email.ts`
  - [ ] Add `bypassRateLimit: boolean` parameter to `sendMagicLinkEmail`
  - [ ] When bypass=true and previous link was expired, skip rate limit

### Task 6: UI Styling & Responsive Design
- [ ] Tailwind CSS styling for all pages
- [ ] Mobile-responsive layout
- [ ] Loading states during validation
- [ ] Error state styling (red accents)
- [ ] Success state styling (green/blue accents)

### Task 7: E2E Testing (AC: All)
- [ ] Write Playwright E2E test: `tests/e2e/magic-link-validation.spec.ts`
  - [ ] Test valid magic link → welcome page
  - [ ] Test invalid hash → error page
  - [ ] Test expired link → error page with request new link
  - [ ] Test request new link flow
  - [ ] Test guest not found error

### Task 8: Unit Testing
- [ ] Extend unit tests: `tests/unit/magic-link.test.ts`
  - [ ] Test detailed error types
  - [ ] Test rate limit bypass logic

---

## Dev Notes

### Architecture Patterns

**Page Flow:**
```
/register?code={hash}&email={email}
    ↓
validateMagicLink(hash, email)
    ↓
┌─────────────────────────────────┐
│ Success?                        │
│  YES → Welcome Page             │
│        → Continue to 1.6 or 1.7 │
│  NO  → Error Page               │
│        → Request New Link       │
└─────────────────────────────────┘
```

**Guest Type Routing (preparation for Story 1.6/1.7):**
- VIP guests → `/register/vip` (Story 1.6)
- Paying guests → `/register/paid` (Story 1.7)

**Error Types:**
- `invalid` - Hash doesn't match (tampered link)
- `expired` - Link older than 5 minutes
- `not_found` - Guest email not in database
- `no_link` - Guest exists but no magic link generated

### Project Structure Notes

**New Files:**
```
app/
└── register/
    ├── page.tsx                   # Main landing page
    ├── RegisterWelcome.tsx        # Success component
    ├── RegisterError.tsx          # Error component
    └── request-link/
        └── page.tsx               # Request new link page

app/api/
└── register/
    └── request-link/
        └── route.ts               # Request new link API
```

**Modified Files:**
```
lib/auth/magic-link.ts             # Extended validation response
lib/services/email.ts              # Rate limit bypass parameter
```

### Learnings from Previous Stories

**From Story 1.3 (Status: done)**

- **Magic Link Validation**: `validateMagicLink(hash, email)` already implemented in `lib/auth/magic-link.ts`
- **Clear Magic Link**: `clearMagicLink(guestId)` available for single-use links
- **Rate Limiting**: Database-backed via `email_logs` table (5 emails/hour/guest)
- **Email Service**: `sendMagicLinkEmail(guestId)` in `lib/services/email.ts`

**From Story 1.4 (Status: done)**

- **Prisma Singleton**: Use `lib/db/prisma.ts` for all database operations
- **Test Patterns**: Vitest for unit, Playwright for E2E

### References

**Tech Stack Docs:**
- Next.js App Router: https://nextjs.org/docs/app/building-your-application/routing
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components

**FUNKCIONALIS-KOVETELMENY.md Sections:**
- FR-2.2.1: Magic Link Validation
- Section 3.1.2: Magic Link Security Requirements

**Epic 1 Tech Context:**
- [tech-spec-epic-1.md](./tech-spec-epic-1.md) - Section "Story 1.5: Magic Link Validation"
- [tech-spec-epic-1.md](./tech-spec-epic-1.md) - Section "Workflows and Sequencing" (Registration Flow)

---

## Dev Agent Record

### Context Reference
- Epic: Epic 1 - Core Registration (MVP)
- Story Dependencies: Story 1.3 (magic link generation/sending)
- Epic Tech Context: [tech-spec-epic-1.md](./tech-spec-epic-1.md)
- Functional Requirements: [FUNKCIONALIS-KOVETELMENY.md](../FUNKCIONALIS-KOVETELMENY.md)

### Agent Model Used
(To be filled during implementation)

### Debug Log References
(To be filled during implementation)

### Completion Notes List
(To be filled during implementation)

### File List
(To be filled during implementation)
