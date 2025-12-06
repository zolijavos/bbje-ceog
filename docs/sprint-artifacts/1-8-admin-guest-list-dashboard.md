# Story 1.8: Admin Guest List Dashboard

**Epic:** Epic 1 - Core Registration (MVP)
**Status:** Done
**Created:** 2025-11-28

---

## User Story

**As an** admin user,
**I want** to view and filter the complete guest list,
**So that** I can monitor registration status and manage guests.

---

## Acceptance Criteria

### AC-1.8.1: Guest List Table Display

**Given** I am logged in as admin
**When** I navigate to `/admin/guests`
**Then** I see a paginated table of all guests with columns:
- Name
- Email
- Guest Type (VIP / PAID_SINGLE / PAID_PAIRED)
- Status (invited / registered / approved / declined)
- Table Assignment (if assigned)
- Actions (Edit / Delete / Send Invitation)

### AC-1.8.2: Search Functionality

**When** I use the search bar
**Then** I can filter guests by name or email (case-insensitive)

### AC-1.8.3: Category Filter

**When** I use the category filter dropdown
**Then** I can filter by guest_type (All / VIP / Paid Single / Paid Paired)

### AC-1.8.4: Status Filter

**When** I use the status filter dropdown
**Then** I can filter by registration_status (All / Invited / Registered / Approved / Declined)

### AC-1.8.5: Send Invitation Action

**When** I click "Send Invitation" for a guest
**Then** a magic link email is sent (calls Story 1.3 email service)

### AC-1.8.6: Pagination

**When** I change the page size dropdown (10 / 25 / 50 items per page)
**Then** the table updates with the selected number of rows
**And** pagination controls update accordingly

---

## Technical Notes

### Frontend Components
- Page: `app/admin/guests/page.tsx` (server component for initial data)
- Table: `app/admin/guests/GuestTable.tsx` (client component for interactivity)
- Filters: `app/admin/guests/GuestFilters.tsx` (client component)

### API Endpoint
- `GET /api/admin/guests?page=1&limit=25&search=&type=&status=`
- Response: `{ guests: Guest[], total: number, page: number, limit: number }`

### Service Layer
- `lib/services/guest.ts` with `getGuestList()` function with pagination

### Database Query
- Prisma `findMany()` with where clause, skip, take for pagination
- Include table_assignment relation for assigned table display

---

## Dependencies

- **Story 1.2**: Admin Authentication (protected route)
- **Story 1.3**: Email Service (for send invitation action)
- **Story 1.4**: CSV Import (creates guests to display)

---

## Test Scenarios

### E2E Tests
1. Guest list page displays table with guests
2. Search filters guests by name
3. Search filters guests by email
4. Category filter works for each type
5. Status filter works for each status
6. Pagination shows correct number of items
7. Send invitation triggers email
8. Unauthorized access redirects to login

---

## Definition of Done

- [x] Guest list page renders with table
- [x] Search by name/email works
- [x] Category filter works
- [x] Status filter works
- [x] Pagination works
- [x] Send invitation action works
- [x] E2E tests passing (17 tests)
- [x] Code review completed
