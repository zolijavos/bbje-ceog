# 🧪 Email Scheduler Test Review

**Dátum**: 2025-12-19
**Reviewer**: Murat (TEA - Test Engineering Architect)
**Scope**: Email Scheduler Service + Bulk API + Recent Modifications

---

## 1. Executive Summary

### Risk Score: 🔴 HIGH

| Kategória | Értékelés | Indoklás |
|-----------|-----------|----------|
| **Test Coverage** | 🔴 KRITIKUS | 0% unit teszt, csak alapszintű E2E |
| **Business Impact** | 🔴 HIGH | Email deliverability = user engagement |
| **Security** | 🟡 MEDIUM | Zod validáció jó, de batch processing sebezhetőség |
| **Complexity** | 🟡 MEDIUM | 644 sor, 11 exported function, 3 auto-scheduler |

### Azonnali teendők:
1. ❌ **Unit tesztek írása** az email-scheduler.ts-hez
2. ❌ **Bulk API E2E tesztek** bővítése
3. ❌ **Rate limiting tesztek** hiányoznak
4. ⚠️ **Error recovery tesztek** szükségesek

---

## 2. Code Analysis

### 2.1 Email Scheduler Service (`lib/services/email-scheduler.ts`)

**644 sor | 11 exported function | 0 unit teszt**

#### Exported Functions:

| Function | Lines | Risk | Test Status |
|----------|-------|------|-------------|
| `scheduleEmail()` | 25-53 | MEDIUM | ❌ No test |
| `cancelScheduledEmail()` | 58-69 | LOW | ❌ No test |
| `processScheduledEmails()` | 74-183 | 🔴 HIGH | ❌ No test |
| `runAutomaticSchedulers()` | 188-222 | HIGH | ❌ No test |
| `schedulePaymentReminders()` | 227-313 | HIGH | ❌ No test |
| `scheduleEventReminders()` | 318-402 | HIGH | ❌ No test |
| `scheduleGenericEmails()` | 407-492 | MEDIUM | ❌ No test |
| `getScheduledEmails()` | 497-560 | LOW | ❌ No test |
| `getSchedulerStats()` | 565-605 | LOW | ❌ No test |
| `initializeDefaultConfigs()` | 610-644 | LOW | ❌ No test |

#### Kritikus Risk Areas:

**1. `processScheduledEmails()` - NO TRANSACTION SAFETY**
```typescript
// Line 91-98: Status update without transaction
for (const scheduled of pendingEmails) {
  await prisma.scheduledEmail.update({
    where: { id: scheduled.id },
    data: { status: 'processing' },  // ⚠️ What if next step fails?
  });
  // ... processing that might fail
}
```
**Risk**: Ha a feldolgozás félbeszakad, az email "processing" státuszban ragad.

**2. JSON.parse without try-catch**
```typescript
// Line 114-116
const storedVariables = scheduled.variables
  ? JSON.parse(scheduled.variables)  // ⚠️ Malformed JSON = crash
  : {};
```
**Risk**: Sérült JSON adat az egész batch-et leállítja.

**3. No retry logic for failed emails**
```typescript
// Line 165-175: Failed = done, no retry
await prisma.scheduledEmail.update({
  where: { id: scheduled.id },
  data: { status: 'failed', error_message: errorMessage },
});
```
**Risk**: Átmeneti hálózati hiba = végleges failure.

---

### 2.2 Bulk API (`app/api/admin/scheduled-emails/bulk/route.ts`)

**194 sor | Zod validation ✅ | Deduplication ✅**

#### Pozitívumok:
- ✅ Zod schema enum validáció (SQL injection védelem)
- ✅ `MAX_BULK_RECIPIENTS = 1000` limit
- ✅ Existing pending email deduplication
- ✅ Admin role check

#### Hiányosságok:
- ❌ Nincs E2E teszt a bulk endpointra
- ❌ Nincs teszt a 1000+ recipient limit-re
- ❌ Nincs teszt a deduplication-re

---

### 2.3 Existing E2E Tests (`tests/e2e/specs/scheduled-emails.spec.ts`)

**158 sor | 10 teszt | Mind UI-focused**

| Test | Priority | Coverage |
|------|----------|----------|
| Page display | P1 | ✅ Basic |
| Table visible | P1 | ✅ Basic |
| Status column | P2 | ✅ Basic |
| Create form opens | P1 | ✅ Basic |
| Template selection | P2 | ✅ Basic |
| Recipient selection | P2 | ✅ Basic |
| Datetime picker | P2 | ✅ Basic |
| Cancel button | P2 | ⚠️ Conditional |
| Email logs | P2 | ✅ Basic |
| Scheduler status | P3 | ⚠️ Conditional |

**Missing Critical Tests:**
- ❌ Actual email scheduling via API
- ❌ Bulk scheduling flow
- ❌ Email delivery verification
- ❌ Rate limiting behavior
- ❌ Error scenarios

---

## 3. Recommended Test Strategy

### 3.1 Unit Tests (Priority: P0)

**File: `tests/unit/services/email-scheduler.test.ts`**

```typescript
// Recommended test structure
describe('scheduleEmail', () => {
  it('should create scheduled email with valid params');
  it('should return error on database failure');
  it('should default schedule_type to "manual"');
  it('should handle missing optional fields');
});

describe('processScheduledEmails', () => {
  it('should process only pending emails with due scheduled_for');
  it('should batch process max 50 emails');
  it('should update status to "processing" before sending');
  it('should update status to "sent" on success');
  it('should update status to "failed" with error message on failure');
  it('should handle guest not found');
  it('should handle malformed JSON in variables');
  it('should log email delivery on success');
  it('should continue processing after individual failure');
});

describe('schedulePaymentReminders', () => {
  it('should find guests with pending payments');
  it('should skip guests with existing pending reminder');
  it('should respect interval_days config');
  it('should schedule for configured send_time');
  it('should include correct template variables');
});

describe('scheduleEventReminders', () => {
  it('should only schedule within 2 days of reminder date');
  it('should skip already scheduled/sent guests');
  it('should include table assignment in variables');
});
```

### 3.2 Integration Tests (Priority: P1)

**File: `tests/integration/email-scheduler.test.ts`**

```typescript
describe('Email Scheduler Integration', () => {
  describe('Bulk Scheduling', () => {
    it('should schedule emails for filtered guest types');
    it('should enforce MAX_BULK_RECIPIENTS limit');
    it('should deduplicate existing pending emails');
    it('should reject past scheduled_for dates');
    it('should validate template_slug against DEFAULT_TEMPLATES');
  });

  describe('Processing Pipeline', () => {
    it('should process scheduled → sent in correct order');
    it('should handle concurrent processing calls');
    it('should not reprocess "processing" status emails');
  });
});
```

### 3.3 E2E Tests (Priority: P1)

**File: `tests/e2e/specs/bulk-email-scheduling.spec.ts`**

```typescript
test.describe('Bulk Email Scheduling', () => {
  test('[P0] should schedule bulk emails via admin UI', async ({ page }) => {
    // Navigate to scheduled emails
    // Select template
    // Select guest type filter
    // Set future date/time
    // Submit bulk schedule
    // Verify success message with count
    // Verify emails appear in pending list
  });

  test('[P1] should show error when no guests match filter', async ({ page }) => {
    // Select impossible filter combination
    // Submit
    // Verify error message
  });

  test('[P1] should skip already scheduled guests', async ({ page }) => {
    // Schedule for guest
    // Try to schedule same template again
    // Verify skipped count in response
  });

  test('[P2] should cancel pending scheduled email', async ({ page }) => {
    // Create scheduled email
    // Find in list
    // Click cancel
    // Verify status changes to cancelled
  });
});
```

---

## 4. Security Test Recommendations

### 4.1 Input Validation Tests

```typescript
describe('Bulk API Security', () => {
  it('should reject invalid guest_types enum values', async () => {
    const response = await fetch('/api/admin/scheduled-emails/bulk', {
      method: 'POST',
      body: JSON.stringify({
        filter: { guest_types: ['sql_injection; DROP TABLE;'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate,
      }),
    });
    expect(response.status).toBe(400);
  });

  it('should reject invalid template_slug', async () => {
    const response = await fetch('/api/admin/scheduled-emails/bulk', {
      method: 'POST',
      body: JSON.stringify({
        filter: { guest_types: ['vip'] },
        template_slug: '../../../etc/passwd',
        scheduled_for: futureDate,
      }),
    });
    expect(response.status).toBe(400);
  });

  it('should require admin role', async () => {
    // Login as staff user
    const response = await fetch('/api/admin/scheduled-emails/bulk', {
      method: 'POST',
      // ... valid body
    });
    expect(response.status).toBe(403);
  });
});
```

### 4.2 Rate Limiting Tests

```typescript
describe('Rate Limiting', () => {
  it('should respect per-guest email rate limit');
  it('should log rate limit exceeded events');
  it('should not bypass rate limit via bulk scheduling');
});
```

---

## 5. Data Factory Recommendations

**File: `tests/factories/scheduled-email.factory.ts`**

```typescript
import { faker } from '@faker-js/faker';

export const createScheduledEmail = (overrides = {}) => ({
  id: faker.number.int({ min: 1, max: 10000 }),
  guest_id: faker.number.int({ min: 1, max: 1000 }),
  template_slug: 'event_reminder',
  scheduled_for: faker.date.future(),
  status: 'pending',
  schedule_type: 'manual',
  variables: JSON.stringify({ guestName: faker.person.fullName() }),
  created_at: new Date(),
  sent_at: null,
  error_message: null,
  ...overrides,
});

export const createBulkScheduleRequest = (overrides = {}) => ({
  filter: {
    guest_types: ['vip'],
    registration_statuses: ['registered'],
  },
  template_slug: 'event_reminder',
  scheduled_for: faker.date.future().toISOString(),
  variables: {},
  ...overrides,
});
```

---

## 6. Test Coverage Targets

| Kategória | Jelenlegi | Cél | Prioritás |
|-----------|-----------|-----|-----------|
| Unit Tests | 0% | 80% | P0 |
| Integration Tests | 0% | 70% | P1 |
| E2E (Happy Path) | 40% | 90% | P1 |
| E2E (Error Scenarios) | 0% | 60% | P2 |
| Security Tests | 0% | 100% | P1 |

---

## 7. Issues Found (Nem módosítandó, csak dokumentáció)

### 7.1 HIGH Severity

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | No transaction for batch processing | `processScheduledEmails:91-98` | Stuck "processing" status |
| 2 | JSON.parse without error handling | `processScheduledEmails:114-116` | Batch crash on bad data |
| 3 | No retry mechanism for failures | `processScheduledEmails:165-175` | Permanent failure on transient errors |

### 7.2 MEDIUM Severity

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 4 | No max retry count tracking | N/A | Infinite retry loops possible (if added) |
| 5 | No dead letter queue | N/A | Failed emails not recoverable |
| 6 | Hardcoded batch size (50) | `processScheduledEmails:89` | No dynamic scaling |

### 7.3 LOW Severity

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 7 | No metrics/telemetry | Throughout | Hard to monitor production |
| 8 | Timezone handling implicit | `schedulePaymentReminders:283` | Potential timezone bugs |

---

## 8. Ajánlott Teszt Implementációs Sorrend

1. **Week 1**: Unit tesztek `processScheduledEmails()` és `scheduleEmail()`
2. **Week 2**: Bulk API integration tesztek
3. **Week 3**: E2E happy path bővítése
4. **Week 4**: Error scenario és security tesztek

---

## 9. Recent Modifications Review

### Security Fix (`e679793`)
- ✅ reCAPTCHA fail-closed - JÓVÁHAGYVA
- ✅ IP validation - JÓVÁHAGYVA
- ✅ Threshold increase 0.3→0.5 - JÓVÁHAGYVA
- ⚠️ Nincs E2E teszt az új security rétegekhez

### PWA Redesign (`fe1f0e9`)
- ✅ Email scheduler service hozzáadva - Kód minőség OK
- ❌ KRITIKUS: Unit tesztek hiányoznak
- ⚠️ E2E tesztek csak UI-t fedik

### Performance Fixes (`86fa62a`)
- ✅ DB indexek - Jó döntés
- ✅ React memo - Megfelelő
- ⚠️ Páros jegy fix nincs tesztelve

---

## 10. Összegzés

**Verdict**: 🔴 **CHANGES REQUESTED**

A bulk email scheduler funkcionálisan működik, de a teszt coverage kritikusan alacsony. Az email küldés üzleti kritikus funkció - egy bug spam flagging-hez vagy missed communication-höz vezethet.

**Minimum követelmény az élesítéshez:**
1. Unit tesztek a `processScheduledEmails()` funkcióhoz
2. E2E teszt a bulk scheduling happy path-ra
3. Error handling teszt malformed JSON-ra

---

*Készítette: Murat (TEA - Test Engineering Architect)*
*Dátum: 2025-12-19*
*Framework: BMad Method v6.0.0*
