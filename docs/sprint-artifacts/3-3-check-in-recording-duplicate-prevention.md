# Story 3.3: Check-in Recording & Duplicate Prevention

## Story Information
- **Epic**: Epic 3 - Check-in System
- **Story ID**: 3-3
- **Status**: done
- **Priority**: High

## User Story
**AS A** check-in staff member
**I WANT** to record successful check-ins and prevent duplicates
**SO THAT** each guest can only enter once unless an admin override is used

## Acceptance Criteria (BDD)

### Scenario 1: First-time check-in
```gherkin
Given a guest has a valid ticket
And they have not checked in before
When I submit the check-in
Then a check-in record is created
And I see a success confirmation
```

### Scenario 2: Duplicate check-in attempt
```gherkin
Given a guest has already checked in
When their ticket is scanned again
Then the check-in is blocked
And I see a warning with the previous check-in time
```

### Scenario 3: Admin override
```gherkin
Given a guest has already checked in
And I am logged in as an admin
When I use the override option
Then a new check-in record is created
And the previous one is replaced
And the is_override flag is set to true
```

## Technical Notes

### API Endpoint
- `POST /api/checkin/submit`
- Request: `{ registrationId: number, override?: boolean }`
- Override requires admin session

### Database Constraint
```sql
-- Unique constraint prevents duplicates at DB level
registration_id Int @unique
```

### Service Function
```typescript
// lib/services/checkin.ts
export async function submitCheckin(
  registrationId: number,
  staffUserId?: number,
  override?: boolean
): Promise<CheckinSubmitResponse>
```

## Definition of Done
- [x] POST /api/checkin/submit endpoint created
- [x] Duplicate prevention with UNIQUE constraint
- [x] Admin override functionality
- [x] is_override flag tracking
- [x] Unit tests pass
- [x] TypeScript compiles without errors

## Dependencies
- Story 3.1 (Validation API) - DONE
- Story 1.2 (Admin auth) - DONE
