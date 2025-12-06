# Story 3.1: QR Code Validation API (JWT Verification)

## Story Information
- **Epic**: Epic 3 - Check-in System
- **Story ID**: 3-1
- **Status**: done
- **Priority**: High

## User Story
**AS A** check-in staff member
**I WANT** to validate scanned QR codes via API
**SO THAT** I can verify guest tickets are authentic before allowing entry

## Acceptance Criteria (BDD)

### Scenario 1: Valid QR code
```gherkin
Given a guest has a valid e-ticket QR code
When I scan and send the QR token to the API
Then I should receive guest details (name, ticket type)
And the response should indicate the ticket is valid
```

### Scenario 2: Expired QR code
```gherkin
Given a guest has an expired QR code (after event date)
When I scan and send the QR token to the API
Then I should receive an error response
And the error type should be "EXPIRED_TOKEN"
```

### Scenario 3: Invalid/Tampered QR code
```gherkin
Given someone has a tampered or fake QR code
When the token is sent to the API
Then I should receive an error response
And the error type should be "INVALID_TOKEN"
```

### Scenario 4: Already checked-in guest
```gherkin
Given a guest has already been checked in
When their QR code is scanned again
Then I should receive the guest details
And a warning that they are already checked in
And the previous check-in timestamp and staff name
```

## Technical Notes

### API Endpoint
- `POST /api/checkin/validate`
- No authentication required (scanner app use)
- Rate limited to prevent abuse

### Request/Response
```typescript
// Request
interface ValidateRequest {
  qrToken: string;  // JWT from QR code
}

// Response
interface ValidateResponse {
  valid: boolean;
  error?: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'REGISTRATION_NOT_FOUND';
  guest?: {
    id: number;
    name: string;
    ticketType: string;
    partnerName: string | null;
  };
  registration?: {
    id: number;
  };
  alreadyCheckedIn: boolean;
  previousCheckin?: {
    checkedInAt: string;
    staffName: string | null;
  };
}
```

### Service Function
```typescript
// lib/services/checkin.ts
export async function validateCheckinToken(qrToken: string): Promise<ValidateResponse>
```

## Definition of Done
- [x] POST /api/checkin/validate endpoint created
- [x] JWT verification with QR_SECRET
- [x] Expiry check implemented
- [x] Registration lookup from JWT payload
- [x] Duplicate check-in detection
- [x] Unit tests pass (27 tests)
- [x] TypeScript compiles without errors

## Dependencies
- Story 2.3 (QR code JWT generation) - DONE
