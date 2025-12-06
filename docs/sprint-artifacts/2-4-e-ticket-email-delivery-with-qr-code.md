# Story 2.4: E-Ticket Email Delivery with QR Code

## Story Information
- **Epic**: Epic 2 - Payment & Ticketing
- **Story ID**: 2-4
- **Status**: done
- **Priority**: High

## User Story
**AS A** fizeto vendeg
**I WANT** to receive a professional e-ticket email with my QR code
**SO THAT** I can download it to my phone and use it at the event entrance

## Acceptance Criteria

### AC1: Email Template Composition
```gherkin
GIVEN a QR code has been generated for a registration (Story 2.3)
WHEN the ticket delivery service is triggered
THEN an email is composed with:
  - Subject: "CEO Gala 2025 - E-ticket - [Guest Name]"
  - Event details: CEO Gala 2025, 2025. majus 15., 18:00
  - Guest name and ticket type
  - QR code image embedded inline (Base64 data URL)
  - Instructions: "Mutasd fel ezt a QR kodot a belepeskor"
```

### AC2: Email Delivery
```gherkin
GIVEN a valid email composition
WHEN the email is sent via Nodemailer (from Story 1.3)
THEN the delivery is attempted with retry logic (3 attempts)
AND the email reaches the guest's inbox
```

### AC3: Success Logging
```gherkin
GIVEN email sending succeeds
WHEN logging the delivery
THEN an email_logs record is created with:
  - guest_id -> current guest ID
  - email_type -> 'ticket_delivery'
  - status -> 'sent'
  - sent_at -> current timestamp
```

### AC4: Failure Logging
```gherkin
GIVEN email sending fails
WHEN logging the failure
THEN an email_logs record is created with:
  - status -> 'failed'
  - error_message -> error details
AND the error is logged to console
```

### AC5: Integration with Payment Flow
```gherkin
GIVEN a payment is confirmed (webhook or manual approval)
WHEN the guest registration is updated to 'paid'
THEN QR generation (Story 2.3) is triggered
AND email delivery is triggered with the QR code
```

## Technical Implementation

### Files to Create/Modify
- `lib/email-templates/ticket-delivery.ts` - Email template
- `lib/services/email.ts` - Add sendTicketEmail function
- `app/api/stripe/webhook/route.ts` - Trigger email after payment

### Email Template Structure
```typescript
interface TicketEmailParams {
  guestName: string;
  ticketType: 'vip_free' | 'paid_single' | 'paid_paired';
  qrCodeDataUrl: string; // Base64 PNG
}
```

### Service Function Signature
```typescript
export async function sendTicketEmail(
  registrationId: number,
  qrDataUrl: string
): Promise<EmailResult>;
```

## Definition of Done
- [x] Email template with QR code inline
- [x] sendTicketEmail function implemented
- [x] Integration with payment webhook
- [x] Logging to email_logs table
- [x] Unit tests pass (12 tests)
- [x] TypeScript compiles without errors

## Dependencies
- Story 2.3 (QR generation) - DONE
- Story 1.3 (Email service) - DONE
- Story 2.2 (Webhook handler) - DONE
