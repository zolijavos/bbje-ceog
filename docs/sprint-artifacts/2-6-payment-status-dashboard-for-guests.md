# Story 2.6: Payment Status Dashboard for Guests

## Story Information
- **Epic**: Epic 2 - Payment & Ticketing
- **Story ID**: 2-6
- **Status**: done
- **Priority**: Medium

## User Story
**AS A** registered guest
**I WANT** to check my payment and ticket status
**SO THAT** I know if my registration is confirmed and can access my e-ticket

## Acceptance Criteria (BDD)

### Scenario 1: View payment status with magic link
```gherkin
Given I have a valid magic link
When I visit the status page with my magic link token
Then I should see my registration details
And I should see my payment status (pending/paid/failed)
And if paid I should see a "Download Ticket" button
```

### Scenario 2: VIP guest views status
```gherkin
Given I am a VIP guest with a valid magic link
When I visit the status page
Then I should see my registration is confirmed
And I should see "VIP - Ingyenes" as payment status
And I should see a "Download Ticket" button
```

### Scenario 3: Guest with pending bank transfer
```gherkin
Given I selected bank transfer as payment method
And my payment is still pending
When I visit the status page
Then I should see "Atutalasra varunk" message
And I should see the bank account details again
And I should NOT see a ticket download option
```

### Scenario 4: Invalid or expired magic link
```gherkin
Given I have an invalid or expired magic link
When I visit the status page
Then I should see an error message
And I should see instructions to contact support
```

## Technical Notes

### Page Route
- `/status?token={magic_link_hash}&email={email}`
- Alternative: `/register/status?token=...&email=...`

### API Endpoint
- `GET /api/registration/status?token={hash}&email={email}`
- Returns: registration details, payment status, ticket availability

### Response Structure
```typescript
interface StatusResponse {
  success: boolean;
  guest: {
    name: string;
    email: string;
    guestType: 'vip' | 'paying_single' | 'paying_paired';
  };
  registration: {
    ticketType: string;
    createdAt: string;
  };
  payment: {
    status: 'pending' | 'paid' | 'failed' | null;
    method: 'card' | 'bank_transfer' | null;
    paidAt: string | null;
  };
  ticket: {
    available: boolean;
    qrCodeDataUrl: string | null;
  };
}
```

### UI Components
- Status card with guest info
- Payment status badge (color-coded)
- Bank transfer details (if pending)
- Ticket download button (if paid/VIP)
- QR code display

## Definition of Done
- [x] Status page created at /status route
- [x] API endpoint for status lookup
- [x] VIP guests can view their ticket
- [x] Paid guests can view their ticket
- [x] Pending guests see bank transfer info
- [x] Unit tests pass (36 tests)
- [x] TypeScript compiles without errors

## Dependencies
- Story 1.5 (Magic link validation) - DONE
- Story 2.3 (QR code generation) - DONE
- Story 2.4 (E-ticket email) - DONE
