# Story 2.2: Stripe Webhook Handler - Payment Confirmation

## Story Information
- **Epic**: Epic 2 - Payment & Ticketing
- **Story ID**: 2-2
- **Status**: in-progress
- **Priority**: High

## User Story
**AS A** system administrator
**I WANT** Stripe webhooks to automatically update payment status
**SO THAT** guest registrations are confirmed without manual intervention

## Acceptance Criteria

### AC1: Webhook Signature Validation
```gherkin
GIVEN a webhook request arrives from Stripe
WHEN the signature is validated against STRIPE_WEBHOOK_SECRET
THEN valid signatures are accepted and processed
AND invalid signatures return 400 error
```

### AC2: Checkout Session Completed Event
```gherkin
GIVEN a checkout.session.completed event is received
WHEN the payment session exists in database
THEN the payment status is updated to 'paid'
AND the guest registration_status is updated to 'approved'
AND paid_at timestamp is recorded
```

### AC3: Payment Failed Event
```gherkin
GIVEN a checkout.session.expired or payment_intent.payment_failed event is received
WHEN the payment session exists in database
THEN the payment status is updated to 'failed'
AND the registration remains in 'registered' status
```

### AC4: Idempotency
```gherkin
GIVEN the same webhook event is received multiple times
WHEN processing the event
THEN the system handles it idempotently
AND no duplicate updates occur
```

### AC5: Webhook Response
```gherkin
GIVEN any webhook event is received
WHEN processing completes (success or handled error)
THEN return HTTP 200 with { received: true }
AND Stripe doesn't retry the webhook
```

## Technical Implementation

### Files to Modify/Create
- `app/api/stripe/webhook/route.ts` - Enhance existing webhook handler
- `lib/services/payment.ts` - Add handleExpiredSession function
- `tests/unit/webhook.test.ts` - Webhook-specific unit tests

### Stripe Events to Handle
1. `checkout.session.completed` - Payment successful
2. `checkout.session.expired` - Session timeout
3. `payment_intent.payment_failed` - Payment declined

### Security Requirements
- Raw body parsing (no JSON parsing before signature verification)
- STRIPE_WEBHOOK_SECRET environment variable required
- Log all webhook events for audit

## Definition of Done
- [ ] Webhook signature validation works correctly
- [ ] checkout.session.completed updates payment to 'paid'
- [ ] checkout.session.expired updates payment to 'failed'
- [ ] Idempotent handling of duplicate events
- [ ] Unit tests pass (min 5 tests)
- [ ] TypeScript compiles without errors
- [ ] Webhook can be tested with Stripe CLI

## Dependencies
- Story 2.1 (Stripe Checkout Session) - DONE
- STRIPE_WEBHOOK_SECRET configured in .env.local

## Testing Notes
```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```
