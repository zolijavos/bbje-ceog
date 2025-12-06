# Story 1.6: VIP Guest Registration (Instant Confirmation)

**Epic:** Epic 1 - Core Registration (MVP)
**Status:** Done
**Created:** 2025-11-28

---

## User Story

**As a** VIP guest,
**I want** to confirm my attendance with one click,
**So that** I can quickly RSVP without filling forms.

---

## Acceptance Criteria

### AC-1.6.1: VIP Welcome Page Display

**Given** I am a VIP guest who clicked a valid magic link (guest_type = 'vip')
**When** I see the welcome page
**Then** I see:
- My name prominently displayed
- Event details (CEO Gála 2025, dátum, helyszín)
- A large "Részvétel megerősítése" (Confirm Attendance) button
- A secondary "Nem tudok részt venni" (Decline) button

### AC-1.6.2: Attendance Confirmation

**When** I click "Részvétel megerősítése" button
**Then**:
- My registration status is updated from "invited" to "registered"
- A registration record is created with ticket_type = "vip_free"
- I see a success page with message: "Köszönjük a megerősítést! A QR jegyed hamarosan megérkezik."
- I am informed that QR ticket generation will happen in Epic 2

### AC-1.6.3: Attendance Decline

**When** I click "Nem tudok részt venni" button
**Then**:
- My status is updated to "declined"
- I see a polite message: "Köszönjük a visszajelzést. Reméljük, legközelebb találkozunk!"
- No registration record is created

### AC-1.6.4: Already Registered Handling

**Given** I am a VIP guest who has already registered
**When** I try to access the VIP registration page
**Then** I see a message: "Már regisztráltál erre az eseményre."
**And** I see my current registration status

### AC-1.6.5: Non-VIP Redirect

**Given** I am NOT a VIP guest (guest_type != 'vip')
**When** I try to access `/register/vip`
**Then** I am redirected to the appropriate registration page based on my guest_type

---

## Technical Notes

### Frontend Components
- Page: `app/register/vip/page.tsx` (server component)
- Client component: `app/register/vip/VIPConfirmation.tsx`
- Success page: `app/register/success/page.tsx` (shared)

### API Endpoints
- `POST /api/registration/confirm` - Handles VIP confirmation
  - Request body: `{ guest_id: number, attendance: 'confirm' | 'decline' }`
  - Response: `{ success: boolean, message: string, status: string }`

### Service Layer
- `lib/services/registration.ts`:
  - `processVIPRegistration(guestId: number, attendance: 'confirm' | 'decline')`
  - Returns: `{ success: boolean, registration?: Registration }`

### Database Operations
- Update `guests.registration_status` to "registered" or "declined"
- Insert into `registrations` table:
  ```typescript
  {
    guest_id: number,
    ticket_type: 'vip_free',
    status: 'registered',
    created_at: now,
  }
  ```

### Session/Auth
- Guest session from magic link validation (Story 1.5) provides `guest_id`
- Pass `guest_id` via URL params or session storage

---

## Dependencies

- **Story 1.5**: Magic Link Validation & Registration Landing (provides validated guest context)

---

## Out of Scope (Epic 2)

- QR code generation
- E-ticket email delivery
- PDF ticket generation

---

## Test Scenarios

### E2E Tests
1. VIP guest can view confirmation page
2. VIP guest can confirm attendance → status updates
3. VIP guest can decline → status updates
4. Already registered VIP sees appropriate message
5. Non-VIP guest is redirected
6. Success page displays correctly after confirmation

### Unit Tests
1. `processVIPRegistration` with confirm attendance
2. `processVIPRegistration` with decline attendance
3. `processVIPRegistration` when already registered
4. Guest status update validation

---

## Definition of Done

- [x] VIP registration page renders with guest info
- [x] Confirm button updates status to "registered"
- [x] Decline button updates status to "declined"
- [x] Registration record created for confirmed VIPs
- [x] Success page shows appropriate message
- [x] Already registered users see status message
- [x] Non-VIP users redirected appropriately
- [x] E2E tests passing (15 tests)
- [ ] Unit tests passing (not required for this story)
- [x] Code review completed
