# Story 1.7: Paid Guest Registration Form (No Payment Yet)

**Epic:** Epic 1 - Core Registration (MVP)
**Status:** Done
**Created:** 2025-11-28

---

## User Story

**As a** paying guest,
**I want** to fill out my registration and billing information,
**So that** I can prepare for payment (which will be available in Epic 2).

---

## Acceptance Criteria

### AC-1.7.1: Multi-Step Registration Form

**Given** I am a PAID_SINGLE or PAID_PAIRED guest who clicked a valid magic link
**When** I start registration
**Then** I see a multi-step form:
- Step 1: Ticket type selection (single or paired - only if PAID_PAIRED guest_type)
- Step 2: Billing information (name, company, tax number, address)
- Step 3: Partner details (only if paired ticket selected)

### AC-1.7.2: Paired Ticket Selection

**When** I select "Paired Ticket"
**Then** I see additional fields for partner name and partner email

### AC-1.7.3: Successful Form Submission

**When** I submit the form with all required fields
**Then**:
- Data is validated (email format, required fields)
- A `registrations` record is created with:
  - ticket_type: "paid_single" or "paid_paired"
  - billing_name, billing_address, billing_tax_number
  - partner_name, partner_email (if paired)
  - payment_method: null (will be set in Epic 2)
- Guest status is updated to "registered"
- I see a success message: "Regisztráció mentve! A fizetés hamarosan elérhető lesz."

### AC-1.7.4: Validation Errors

**When** validation fails
**Then** I see clear error messages below each invalid field
**And** the form preserves my entered data for correction

### AC-1.7.5: Non-Paid Guest Redirect

**Given** I am a VIP guest
**When** I try to access `/register/paid`
**Then** I am redirected to the VIP registration page

### AC-1.7.6: Already Registered Handling

**Given** I am a paid guest who has already registered
**When** I try to access the paid registration page
**Then** I see a message: "Már regisztráltál erre az eseményre."

---

## Technical Notes

### Frontend Components
- Page: `app/register/paid/page.tsx` (server component)
- Form: `app/register/paid/PaidRegistrationForm.tsx` (client component)
- Multi-step wizard with React state

### API Endpoints
- `POST /api/registration/submit` - Handles paid registration submission
  - Request body:
    ```typescript
    {
      guest_id: number;
      ticket_type: 'paid_single' | 'paid_paired';
      billing_name: string;
      billing_address: string;
      billing_tax_number?: string;
      partner_name?: string;
      partner_email?: string;
    }
    ```
  - Response: `{ success: boolean, message: string, registrationId?: number }`

### Service Layer
- `lib/services/registration.ts`:
  - `processPaidRegistration(guestId, formData)` function
  - Validates guest type (paying_single, paying_paired)
  - Creates registration record
  - Updates guest status

### Validation
- Zod schema for form validation
- Required: billing_name, billing_address
- Optional: billing_tax_number
- Conditional: partner_name, partner_email (if paired)

### Form Fields
- **Billing Name**: Required, min 2 chars
- **Billing Address**: Required, min 10 chars
- **Tax Number**: Optional, format validation
- **Partner Name**: Required if paired
- **Partner Email**: Required if paired, email format

---

## Dependencies

- **Story 1.5**: Magic Link Validation & Registration Landing (provides guest context)
- **Story 1.6**: VIP Registration (reuse success page)

---

## Out of Scope (Epic 2)

- Payment method selection
- Stripe integration
- Bank transfer flow
- QR code generation

---

## Test Scenarios

### E2E Tests
1. Paid single guest can view registration form
2. Paid single guest can submit billing info
3. Paid paired guest can select ticket type
4. Paired ticket shows partner fields
5. Partner info is saved correctly
6. Validation errors display correctly
7. Already registered guest sees message
8. VIP guest is redirected to VIP page

### Unit Tests
1. `processPaidRegistration` with single ticket
2. `processPaidRegistration` with paired ticket
3. Form validation schema
4. Partner email validation

---

## Definition of Done

- [x] Paid registration page renders with form
- [x] Single ticket type saves correctly
- [x] Paired ticket type saves with partner info
- [x] Billing information is stored
- [x] Validation errors display properly
- [x] Success page shows after submission
- [x] Already registered users see status message
- [x] VIP users redirected appropriately
- [x] E2E tests passing (18 tests)
- [x] Code review completed
