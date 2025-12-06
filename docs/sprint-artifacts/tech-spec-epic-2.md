# Epic 2: Payment & Ticketing - Tech Context

**Created:** 2025-11-28
**Epic Goal:** Stripe fizetesi integracio es QR jegy generalas automatizalasa

---

## Epic Overview

### User Value
Vendegek zokkenomentesen tudnak fizetni bankkartyaval (Stripe) vagy atutalassal, es automatikusan megkapjak a QR kodos e-ticketet, amely a beleptetehez szukseges.

### FRs Covered
- FR-2.3.1: Stripe Checkout Integracio
- FR-2.3.2: Manualis Fizetes Jovahagyas
- FR-2.4.1: QR Kod Generalas
- FR-2.4.2: E-jegy Email Kuldese

### Stories in Epic
1. **Story 2.1**: Stripe Checkout Session Integration
2. **Story 2.2**: Stripe Webhook Handler & Payment Confirmation
3. **Story 2.3**: QR Code JWT Generation & Storage
4. **Story 2.4**: E-Ticket Email Delivery with QR Code
5. **Story 2.5**: Manual Bank Transfer Payment Approval
6. **Story 2.6**: Payment Status Dashboard for Guests

---

## Technical Architecture

### New Dependencies Required

```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "jsonwebtoken": "^9.0.0",
    "qrcode": "^1.5.3"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.0",
    "@types/qrcode": "^1.5.0"
  }
}
```

### Environment Variables (New)

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Event Configuration
EVENT_DATE=2025-02-15
EVENT_TICKET_PRICE_SINGLE=20000
EVENT_TICKET_PRICE_PAIRED=40000
```

### Database Schema (Existing Tables Used)

```prisma
model Payment {
  id                       Int          @id @default(autoincrement())
  registration_id          Int
  stripe_session_id        String?      @unique @db.VarChar(255)
  stripe_payment_intent_id String?      @db.VarChar(255)
  amount                   Int          // Amount in HUF (integer fillér)
  currency                 String       @default("huf") @db.VarChar(3)
  status                   PaymentStatus @default(pending)
  payment_method           PaymentMethod?
  paid_at                  DateTime?
  created_at               DateTime     @default(now())
  updated_at               DateTime     @updatedAt

  registration             Registration @relation(fields: [registration_id], references: [id])
}

model Registration {
  // Existing fields...
  qr_code_hash             String?      @db.VarChar(255)
  // ... relations
}
```

### Service Layer Architecture

```
lib/services/
├── payment.ts          # Stripe operations, payment confirmation
├── ticketing.ts        # QR code generation, JWT creation
└── email.ts            # Extended with ticket delivery
```

---

## Story 2.1: Stripe Checkout Session Integration

### API Endpoint
`POST /api/stripe/create-checkout`

### Request/Response
```typescript
// Request
interface CreateCheckoutRequest {
  registration_id: number;
}

// Response
interface CreateCheckoutResponse {
  checkout_url: string;
  session_id: string;
}
```

### Implementation Notes
- Use Stripe Checkout hosted page (not custom UI)
- Line items: Single ticket (20,000 Ft) or Paired ticket (40,000 Ft)
- Metadata: `{registration_id, guest_id, ticket_type}`
- Success URL: `/payment/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/payment/cancel`

### Service Function
```typescript
// lib/services/payment.ts
export async function createCheckoutSession(registrationId: number): Promise<{
  checkout_url: string;
  session_id: string;
}> {
  // 1. Load registration with guest
  // 2. Calculate price based on ticket_type
  // 3. Create Stripe Checkout Session
  // 4. Create Payment record with status=pending
  // 5. Return checkout URL
}
```

---

## Story 2.2: Stripe Webhook Handler

### API Endpoint
`POST /api/stripe/webhook`

### Webhook Events Handled
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

### Implementation Notes
- MUST use `request.text()` for raw body (signature validation)
- Validate signature with `stripe.webhooks.constructEvent()`
- Idempotency: Check if payment already marked as completed
- Use Prisma transaction for atomic updates

### Service Function
```typescript
// lib/services/payment.ts
export async function confirmPayment(sessionId: string): Promise<void> {
  // 1. Find payment by stripe_session_id
  // 2. Update payment status to 'completed'
  // 3. Update registration status
  // 4. Trigger QR generation (Story 2.3)
}
```

---

## Story 2.3: QR Code JWT Generation

### JWT Payload Structure
```typescript
interface QRTokenPayload {
  registration_id: number;
  guest_id: number;
  ticket_type: string;
  iat: number;  // Issued at
  exp: number;  // Expiry (event date - 1 day)
}
```

### Implementation Notes
- Sign with `QR_SECRET` using HS256
- Store SHA-256 hash of token in `registrations.qr_code_hash`
- Generate QR code image as Base64 PNG
- DO NOT store the JWT itself in database

### Service Function
```typescript
// lib/services/ticketing.ts
export async function generateQRTicket(registrationId: number): Promise<{
  qrDataUrl: string;
  token: string;
}> {
  // 1. Load registration
  // 2. Generate JWT with expiry
  // 3. Generate QR code image from JWT
  // 4. Store hash in registration
  // 5. Return Base64 data URL
}
```

---

## Story 2.4: E-Ticket Email Delivery

### Email Template
- Subject: "CEO Gala 2025 - E-ticket - [Guest Name]"
- Body: Event details, QR code inline, instructions

### Implementation Notes
- Reuse Nodemailer from Epic 1
- Embed QR as `<img src="data:image/png;base64,..." />`
- Log to `email_logs` table

### Service Function
```typescript
// lib/services/email.ts
export async function sendTicketEmail(
  registrationId: number,
  qrDataUrl: string
): Promise<void> {
  // 1. Load registration with guest
  // 2. Compose email with QR inline
  // 3. Send via Nodemailer
  // 4. Log to email_logs
}
```

---

## Story 2.5: Manual Payment Approval

### API Endpoint
`PATCH /api/admin/guests/[id]/approve-payment`

### Implementation Notes
- Admin auth required
- Updates payment status to 'completed'
- Triggers QR generation and email delivery
- Transaction for atomicity

---

## Story 2.6: Payment Status Dashboard

### API Endpoints
- `GET /api/registration/status?email={email}`
- `POST /api/registration/resend-ticket`

### Page Routes
- `/registration/status` - Public status check
- Bank transfer details display
- QR resend functionality

---

## Testing Strategy

### Unit Tests
- JWT generation/verification
- QR code creation
- Payment status transitions

### Integration Tests
- Stripe webhook signature validation (mock)
- Payment flow: pending -> completed -> ticket_issued

### E2E Tests
- Full payment flow with Stripe test mode
- Manual approval flow
- Status page functionality

---

## Security Considerations

1. **Stripe Webhook**: Always validate signature
2. **JWT Tokens**: Use strong QR_SECRET (64+ chars)
3. **Rate Limiting**: Status page queries (10/hour/email)
4. **Data Exposure**: Don't expose sensitive payment details on status page

---

## Migration Notes

No database migrations required - using existing schema tables:
- `payments` table
- `registrations.qr_code_hash` field

---

## Dependencies on Epic 1

- Story 1.7: Paid registration form (creates registration records)
- Story 1.3: Email service (Nodemailer setup)
- Story 1.2: Admin authentication

---

## Estimated Complexity

| Story | Complexity | New Code | Risk |
|-------|------------|----------|------|
| 2.1   | Medium     | ~150 LOC | Low - Stripe SDK well documented |
| 2.2   | Medium     | ~100 LOC | Medium - Webhook reliability |
| 2.3   | Low        | ~80 LOC  | Low - Standard JWT/QR |
| 2.4   | Low        | ~60 LOC  | Low - Extends existing email |
| 2.5   | Low        | ~50 LOC  | Low - Simple CRUD |
| 2.6   | Medium     | ~120 LOC | Low - Public read-only |

**Total Estimated LOC:** ~560 lines
