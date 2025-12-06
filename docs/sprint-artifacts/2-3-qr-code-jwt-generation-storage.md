# Story 2.3: QR Code JWT Generation & Storage

## Story Information
- **Epic**: Epic 2 - Payment & Ticketing
- **Story ID**: 2-3
- **Status**: done
- **Priority**: High

## User Story
**AS A** registered guest who has completed payment
**I WANT** a unique QR code ticket generated
**SO THAT** I can use it for event check-in

## Acceptance Criteria

### AC1: JWT Token Generation
```gherkin
GIVEN a guest has completed payment (VIP or paid)
WHEN the QR code is generated
THEN a JWT token is created with:
  - registration_id
  - guest_id
  - ticket_type
  - issued_at (iat)
  - expires_at (exp) - event day + 24 hours
```

### AC2: QR Code Image Generation
```gherkin
GIVEN a valid JWT token
WHEN the QR code image is requested
THEN a QR code PNG image is generated containing the JWT
AND the QR code is readable by standard QR scanners
```

### AC3: Token Storage
```gherkin
GIVEN a QR code is generated for a registration
WHEN the generation completes
THEN the JWT token is stored in registration.qr_code_hash
AND qr_code_generated_at timestamp is recorded
```

### AC4: Token Uniqueness
```gherkin
GIVEN multiple QR code requests for the same registration
WHEN generating QR codes
THEN only one unique token exists per registration
AND regeneration updates the existing token
```

### AC5: Token Verification
```gherkin
GIVEN a JWT token from a QR code
WHEN verifying the token
THEN valid tokens return payload with guest info
AND expired/invalid tokens throw appropriate errors
```

## Technical Implementation

### Files to Create
- `lib/services/qr-ticket.ts` - QR code and JWT service
- `app/api/ticket/generate/route.ts` - Generate QR code endpoint
- `app/api/ticket/verify/route.ts` - Verify QR code endpoint
- `tests/unit/qr-ticket.test.ts` - Unit tests

### JWT Payload Structure
```typescript
interface TicketPayload {
  registration_id: number;
  guest_id: number;
  ticket_type: 'vip_free' | 'paid_single' | 'paid_paired';
  guest_name: string;
  iat: number; // issued at
  exp: number; // expires at
}
```

### Environment Variables
- `QR_SECRET` - JWT signing secret (min 64 chars)
- `EVENT_DATE` - Event date for expiry calculation (optional, default: 2025-05-15)

## Definition of Done
- [x] JWT token generation with proper payload
- [x] QR code image generation (PNG/Data URL)
- [x] Token storage in database
- [x] Token verification function
- [x] Unit tests pass (min 8 tests) - 13 tests passed
- [x] TypeScript compiles without errors

## Dependencies
- Story 2.1 & 2.2 (Payment completed)
- `qrcode` npm package (already installed)
- `jsonwebtoken` npm package (already installed)
