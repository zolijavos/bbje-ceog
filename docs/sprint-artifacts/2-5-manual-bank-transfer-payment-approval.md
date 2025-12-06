# Story 2.5: Manual Bank Transfer Payment Approval

## Story Information
- **Epic**: Epic 2 - Payment & Ticketing
- **Story ID**: 2-5
- **Status**: done
- **Priority**: High

## User Story
**AS AN** admin
**I WANT** to manually approve payments made via bank transfer
**SO THAT** guests who choose offline payment can receive their tickets after verification

## Acceptance Criteria

### AC1: Admin Filter for Bank Transfer Payments
```gherkin
GIVEN I am logged in as admin
WHEN I navigate to /admin/guests dashboard
THEN I see a filter option for payment status
AND I can filter for "Atutalasra var" (awaiting bank transfer)
```

### AC2: Approve Payment Button
```gherkin
GIVEN I see a guest with pending bank transfer payment
WHEN I click "Fizetes jovahagyasa" button
THEN an API call is made to PATCH /api/admin/guests/{id}/approve-payment
```

### AC3: Payment Record Update
```gherkin
GIVEN the approve-payment API is called
WHEN the payment is approved
THEN the payment record is updated:
  - payment_status -> 'paid'
  - paid_at -> current timestamp
AND the guest registration_status -> 'approved'
```

### AC4: Automatic Ticket Generation and Email
```gherkin
GIVEN the payment is approved
WHEN the status update completes
THEN QR generation (Story 2.3) is triggered
AND email delivery (Story 2.4) is triggered
```

### AC5: UI Feedback
```gherkin
GIVEN the approval succeeds
WHEN the API returns success
THEN I see success toast: "Fizetes jovahagyva, e-ticket elkuldve"
AND the guest row updates to show "Jegy kiadva" status
```

## Technical Implementation

### Files to Create/Modify
- `app/api/admin/guests/[id]/approve-payment/route.ts` - API endpoint
- `app/admin/guests/components/ApprovePaymentButton.tsx` - UI component
- `lib/services/payment.ts` - Already has approveManualPayment()

### API Endpoint
```
PATCH /api/admin/guests/{id}/approve-payment
Authorization: Admin session required
Response: { success: true, message: string }
```

## Definition of Done
- [x] API endpoint for manual approval
- [x] ApprovePaymentButton component
- [x] Integration with QR generation and email
- [x] Unit tests pass (23 tests)
- [x] TypeScript compiles without errors

## Dependencies
- Story 1.2 (Admin auth) - DONE
- Story 1.8 (Admin dashboard) - DONE
- Story 2.3 (QR generation) - DONE
- Story 2.4 (Email delivery) - DONE
