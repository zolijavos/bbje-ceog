# Story 1.9: Admin Guest CRUD Operations

**Epic:** Epic 1 - Core Registration (MVP)
**Status:** In Progress
**Created:** 2025-11-28

---

## User Story

**As an** admin user,
**I want** to create, edit, and delete guests manually,
**So that** I can manage the guest list without relying on CSV imports.

---

## Acceptance Criteria

### AC-1.9.1: Add New Guest

**Given** I am on the guest list dashboard (`/admin/guests`)
**When** I click "Add New Guest" button
**Then** I see a modal form with fields:
- Email (required, unique)
- Name (required)
- Guest Type (dropdown: VIP / PAID_SINGLE / PAID_PAIRED)
- Phone (optional)
- Company (optional)
- Notes (optional)

**When** I submit the form with valid data
**Then** a new guest is created in `guests` table with status="invited"
**And** I see a success message: "Vendeg sikeresen hozzaadva"
**And** the guest appears in the guest list

### AC-1.9.2: Edit Guest

**When** I click "Edit" for a guest
**Then** I see a pre-filled form with the guest's current data
**And** I can update any field except email (email is immutable identifier)

**When** I save changes
**Then** the `guests` record is updated
**And** the `updated_at` timestamp is refreshed
**And** I see a success message: "Vendeg adatai frissitve"

### AC-1.9.3: Delete Guest

**When** I click "Delete" for a guest
**Then** I see a confirmation modal: "Biztosan torolni szeretned [Name]-t? Ez a muvelet nem vonhato vissza."

**When** I confirm deletion
**Then** the guest and all related records are deleted (CASCADE: registrations, checkins, table_assignments, email_logs)
**And** the guest disappears from the list
**And** I see a success message: "Vendeg torolve"

### AC-1.9.4: Validation

**When** I try to create a guest with an existing email
**Then** I see an error: "Ez az email cim mar letezik"

**When** I try to save with empty required fields
**Then** I see validation errors below each invalid field

---

## Technical Notes

### API Endpoints
- `POST /api/admin/guests` - Create guest
- `PATCH /api/admin/guests/[id]` - Update guest
- `DELETE /api/admin/guests/[id]` - Delete guest

### Frontend Components
- `app/admin/guests/AddGuestModal.tsx` - Create modal
- `app/admin/guests/EditGuestModal.tsx` - Edit modal
- `app/admin/guests/DeleteConfirmModal.tsx` - Delete confirmation

### Service Layer
- `lib/services/guest.ts` with CRUD functions:
  - `createGuest(data)`
  - `updateGuest(id, data)`
  - `deleteGuest(id)`

### Validation
- Zod schemas for create/update payloads
- Email uniqueness check via Prisma

---

## Dependencies

- **Story 1.2**: Admin Authentication (protected routes)
- **Story 1.8**: Admin Guest List Dashboard (UI integration)

---

## Test Scenarios

### E2E Tests
1. Add guest modal opens and closes
2. Create guest with valid data succeeds
3. Create guest with duplicate email fails
4. Edit guest modal shows current data
5. Update guest data succeeds
6. Delete guest with confirmation succeeds
7. Cancel delete preserves guest
8. Form validation shows errors for empty required fields

---

## Definition of Done

- [ ] Add Guest modal/form implemented
- [ ] Create guest API endpoint works
- [ ] Edit Guest modal/form implemented
- [ ] Update guest API endpoint works
- [ ] Delete guest with confirmation works
- [ ] Delete guest API endpoint with CASCADE works
- [ ] Form validation works
- [ ] E2E tests passing
- [ ] Code review completed
