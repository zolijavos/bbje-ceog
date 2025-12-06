# Story 2.1: Stripe Checkout Session Integration

**Epic:** Epic 2 - Payment & Ticketing
**Status:** In Progress
**Created:** 2025-11-28

---

## User Story

**As a** fizeto vendeg,
**I want** biztonságosan fizetni bankkartyaval Stripe-on keresztul,
**So that** a regisztracióm utan azonnal befejezhetem a fizetest es megkaphassam a jegyemet.

---

## Acceptance Criteria

### AC-2.1.1: Checkout Session Creation
**Given** I have completed the paid guest registration form (Story 1.7)
**When** I click "Fizetes bankkartyaval" button
**Then** a Stripe Checkout Session is created via API call to `/api/stripe/create-checkout`

### AC-2.1.2: Session Configuration
**And** the session includes:
- Line items: ticket type, unit price (20,000 Ft or 40,000 Ft), quantity
- Customer email prefilled from registration
- Success URL: `{NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `{NEXT_PUBLIC_APP_URL}/payment/cancel`
- Metadata: `{registration_id, guest_id, ticket_type}`

### AC-2.1.3: Redirect to Stripe
**When** the Checkout Session is created successfully
**Then** I am redirected to the Stripe hosted checkout page
**And** I can enter card details and complete payment

### AC-2.1.4: Success Redirect
**When** payment succeeds
**Then** I am redirected to `/payment/success` with session_id in query params
**And** I see a success message: "Sikeres fizetes! E-ticketedet emailben kuldtuk."

### AC-2.1.5: Cancel Redirect
**When** I cancel payment
**Then** I am redirected to `/payment/cancel`
**And** I can return to the registration to try again

---

## Technical Notes

### Dependencies
- `stripe` npm package (v14.0+)
- Environment: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### API Endpoint
`POST /api/stripe/create-checkout`

### Request/Response
```typescript
// Request
interface CreateCheckoutRequest {
  registration_id: number;
}

// Response (success)
interface CreateCheckoutResponse {
  checkout_url: string;
  session_id: string;
}

// Response (error)
interface ErrorResponse {
  success: false;
  error: string;
}
```

### Service Layer
- File: `lib/services/payment.ts`
- Function: `createCheckoutSession(registrationId: number)`

### Database Updates
- Create `Payment` record with status='pending' before redirect

### Frontend
- Button on paid registration success page
- Redirect handling in `/payment/success` and `/payment/cancel` pages

---

## Implementation Checklist

- [ ] Create `lib/services/payment.ts` with Stripe client
- [ ] Create `POST /api/stripe/create-checkout` endpoint
- [ ] Add "Fizetes bankkartyaval" button to paid registration page
- [ ] Create `/payment/success` page
- [ ] Create `/payment/cancel` page
- [ ] Add Stripe env vars to `.env.local`
- [ ] Test with Stripe test mode

---

## Test Cases

### Unit Tests
- [ ] `createCheckoutSession` creates valid Stripe session
- [ ] Payment record created with status='pending'
- [ ] Correct line item pricing (single vs paired)

### E2E Tests
- [ ] Payment button visible on paid registration page
- [ ] Success page shows correct message
- [ ] Cancel page allows retry

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] TypeScript type check passing
- [ ] Code reviewed
- [ ] Documentation updated
