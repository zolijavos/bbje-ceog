# CEO Gala registration - v2 - Epic Breakdown

**Author:** Javo!
**Date:** 2025-11-27
**Project Level:** Simple (Quick Flow Track)
**Target Scale:** 500 vendég, 100 egyidejű felhasználó

---

## Overview

Ez a dokumentum tartalmazza a CEO Gala registration rendszer teljes epic és story breakdown-ját, amely a [FUNKCIONALIS-KOVETELMENY.md](./FUNKCIONALIS-KOVETELMENY.md) és [tech-spec.md](./tech-spec.md) dokumentumokból lett levezetve.

**Státusz:** ✅ PRODUCTION READY - 7/7 epic kész (38/38 story done). Részletes státusz: [sprint-status.yaml](sprint-artifacts/sprint-status.yaml)

## Epic Összefoglaló

A projekt **7 epic**-re van bontva, amelyek mindegyike egy önálló, user value-t szállító fázist reprezentál:

- **Epic 1: Core Registration (MVP)** ✅ - Alapvető regisztrációs folyamat és vendégkezelés (9 story)
- **Epic 2: Payment & Ticketing** ✅ - Fizetési integráció és QR jegy rendszer (6 story)
- **Epic 3: Check-in System** ✅ - Mobil beléptetési alkalmazás QR scannerrel (4 story)
- **Epic 4: Seating Management** ✅ - Asztalfoglalási és ülésrend menedzsment (5 story)
- **Epic 5: Guest Profile Extension** ✅ - Vendég profil bővítés (4 story)
- **Epic 6: PWA Guest App** ✅ - Progressive Web App vendégeknek (8 story)
- **Epic 7: Applicant Flow** ✅ - Nyilvános jelentkezési folyamat (2 story)

Minden epic **vertikális szeletelésű** - teljes funkcionalitást szállít (frontend + backend + database), nem technikai rétegek szerint van strukturálva.

---

## Funkcionális Követelmények Inventory

### FR Kategóriák (FUNKCIONALIS-KOVETELMENY.md alapján)

**2.1 Címlista & Meghívó Kezelés:**
- FR-2.1.1: CSV Vendéglista Importálás (max 10,000 sor, email validáció, duplikáció kezelés)
- FR-2.1.2: Email Meghívó Küldése (magic link, 5 perc expiry, rate limiting)

**2.2 Regisztráció Flow:**
- FR-2.2.1: Magic Link Validáció (SHA-256 hash, lejárati idő, rate limiting)
- FR-2.2.2: VIP Vendég Regisztráció (ingyenes flow, azonnali QR jegy)
- FR-2.2.3: Fizető Vendég Regisztráció (számlázási adatok, partner info, fizetési mód választás)

**2.3 Online Fizetés:**
- FR-2.3.1: Stripe Checkout Integráció (Visa/MC/Amex, webhook validation)
- FR-2.3.2: Manuális Fizetés Jóváhagyás (banki átutalás, admin approval)

**2.4 Jegykiadás & QR Rendszer:**
- FR-2.4.1: QR Kód Generálás (JWT token, HMAC-SHA256, 48h expiry)
- FR-2.4.2: E-jegy Email Küldése (PDF melléklet, QR code inline)

**2.5 Check-in Rendszer:**
- FR-2.5.1: Mobil QR Szkennelő Alkalmazás (html5-qrcode, színes kártyák: zöld/sárga/piros)
- FR-2.5.2: Check-in Napló & Duplikáció Kezelés (UNIQUE constraint, admin override)

**2.6 Asztalfoglalás & Ülésrend:**
- FR-2.6.1: Asztal CRUD (név, kapacitás, típus: VIP/standard/reserved)
- FR-2.6.2: Vendég-Asztal Hozzárendelés (manual assignment, seat number)
- FR-2.6.3: Drag-and-Drop Térképszerkesztő (@dnd-kit/core, pos_x/pos_y koordináták)
- FR-2.6.4: Tömeges CSV Asztalfoglalás (bulk import, guest_email → table_name mapping)

**2.7 Admin Dashboard:**
- FR-2.7.1: Vendéglista Szűrés & Keresés (kategória, status, asztal, pagination)
- FR-2.7.2: Vendég CRUD (létrehozás, szerkesztés, törlés, status update)
- FR-2.7.3: Check-in Log Viewer (időbélyeg, staff, szűrés)
- FR-2.7.4: Exportálások (guest list CSV, seating arrangement CSV)

---

## FR Coverage Map

**Epic 1: Core Registration (MVP)**
- FR-2.1.1 (CSV import)
- FR-2.1.2 (Magic link email)
- FR-2.2.1 (Magic link validation)
- FR-2.2.2 (VIP registration - basic flow)
- FR-2.2.3 (Paid registration - form only, no payment yet)
- FR-2.7.1 (Guest list filtering)
- FR-2.7.2 (Guest CRUD)

**Epic 2: Payment & Ticketing**
- FR-2.3.1 (Stripe Checkout)
- FR-2.3.2 (Manual payment approval)
- FR-2.4.1 (QR code generation)
- FR-2.4.2 (E-ticket email)
- FR-2.2.2 (VIP registration - QR ticket flow)
- FR-2.2.3 (Paid registration - complete payment flow)

**Epic 3: Check-in System**
- FR-2.5.1 (Mobile QR scanner app)
- FR-2.5.2 (Check-in log & duplicate detection)
- FR-2.7.3 (Check-in log viewer)

**Epic 4: Seating Management**
- FR-2.6.1 (Table CRUD)
- FR-2.6.2 (Guest-table assignment)
- FR-2.6.3 (Drag-and-drop seating map)
- FR-2.6.4 (Bulk CSV assignment)
- FR-2.7.4 (Seating export)

---

## Epic 1: Core Registration (MVP)

**Epic Goal:** Adminok kezelhetik a vendéglistát és küldhetnek meghívókat, vendégek pedig regisztrálhatnak magic link-kel (VIP és fizető flow alapjai).

**User Value:** Az eseményszervezők importálhatják a vendéglistát, automatikus meghívókat küldhetnek, és a vendégek passwordless authentication-nel regisztrálhatnak.

**FRs Covered:** FR-2.1.1, FR-2.1.2, FR-2.2.1, FR-2.2.2, FR-2.2.3 (form only), FR-2.7.1, FR-2.7.2

**Total Stories:** 9

---

### Story 1.1: Project Foundation & Database Setup

**As a** developer,
**I want** a fully configured Next.js project with Prisma database connection,
**So that** I can start building features on a solid foundation.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** I run the project setup commands
**Then** the Next.js 14 App Router project is initialized with TypeScript, Tailwind CSS, and ESLint configured

**And** Prisma schema is defined with all 8 tables (guests, registrations, payments, checkins, tables, table_assignments, users, email_logs)

**And** Database connection is established (MySQL on port 3307: ceog_1)

**And** Initial Prisma migration is created and applied (`npx prisma migrate dev`)

**And** Seed script populates test data (2 admin users, 5 tables, 6 guests)

**And** `npm run dev` starts the development server on localhost:3000

**And** Environment variables are configured (.env.local with DATABASE_URL, APP_SECRET, QR_SECRET, NEXTAUTH_SECRET)

**Prerequisites:** None (first story)

**Technical Notes:**
- Next.js 14.2.0, React 18.3.0, TypeScript 5.5.0
- Prisma 5.19.0 with MySQL provider
- Tailwind CSS 3.4.0 with mobile-first config
- Package.json scripts: dev, build, start, lint, type-check, db:generate, db:migrate, db:seed, db:studio
- Directory structure: app/, lib/, prisma/, public/, tests/
- Prisma client singleton pattern in `lib/db/prisma.ts`
- **STATUS**: ✅ LARGELY COMPLETE - package.json, prisma/schema.prisma, prisma/seed.ts, .env.local már léteznek

---

### Story 1.2: Admin Authentication & Session Management

**As an** admin user,
**I want** to log in securely with email and password,
**So that** I can access the admin dashboard and manage guests.

**Acceptance Criteria:**

**Given** I am an unauthenticated admin
**When** I navigate to `/admin/login`
**Then** I see a login form with email and password fields

**And** I can enter credentials (admin@ceogala.test / Admin123!)

**When** I submit the form with valid credentials
**Then** my password is verified using bcrypt (cost=12)

**And** a secure session cookie is created (HttpOnly, Secure, SameSite=Strict)

**And** I am redirected to `/admin` dashboard

**When** I try to access `/admin/*` routes without authentication
**Then** I am redirected to `/admin/login`

**And** the session expires after 24 hours of inactivity

**Prerequisites:** Story 1.1 (database with users table)

**Technical Notes:**
- NextAuth.js 4.24.0 with Credentials provider
- bcryptjs for password hashing/verification
- Session storage: JWT strategy or database sessions
- Middleware: `middleware.ts` for route protection
- Login page: `app/(auth)/admin/login/page.tsx`
- API route: `app/api/auth/[...nextauth]/route.ts`
- Role-based access: admin, staff roles in users table

---

### Story 1.3: Email Service Setup & Magic Link Sender

**As an** admin user,
**I want** to send magic link invitation emails to guests,
**So that** they can register without needing passwords.

**Acceptance Criteria:**

**Given** the email service is configured (Nodemailer with SMTP)
**When** I select a guest from the guest list
**Then** I can click "Send Invitation" button

**And** a magic link email is sent to the guest's email address

**When** the email is sent successfully
**Then** the magic link hash is generated (SHA-256 of email + APP_SECRET + timestamp)

**And** the hash and expiry timestamp are saved to `guests.magic_link_hash` and `magic_link_expires_at`

**And** the email contains:
  - Personal greeting ("Kedves [Név]!")
  - Event details (date, location)
  - Magic link URL: `https://domain.com/register?code={hash}&email={email}`
  - Contact information

**And** rate limiting prevents more than 5 resend attempts per hour per email

**When** email delivery fails
**Then** an error is logged to `email_logs` table with status="failed" and error_message

**Prerequisites:** Story 1.1 (database), Story 1.2 (admin auth to trigger action)

**Technical Notes:**
- Nodemailer 7.0.7 with SMTP transport (credentials in .env.local)
- Email templates: HTML + plain text fallback in `lib/templates/`
- Service layer: `lib/services/email.ts` with `sendMagicLinkEmail()` function
- Magic link generation: `lib/auth/magic-link.ts` with `generateHash()` and `verifyHash()`
- Rate limiting: Check `email_logs` table for recent sends (1-hour window)
- Queue processing: Simple in-memory queue (future: Redis/Bull) to avoid blocking
- Email log: `email_logs` table with guest_id, email_type="magic_link", recipient, subject, status, sent_at

---

### Story 1.4: CSV Guest List Import

**As an** admin user,
**I want** to upload a CSV file with guest information,
**So that** I can quickly populate the guest list without manual data entry.

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I navigate to `/admin/guests/import`
**Then** I see a file upload form accepting CSV files

**When** I upload a valid CSV file with columns: email, name, guest_type
**Then** the CSV is parsed and validated

**And** duplicate emails are detected and flagged

**And** invalid email formats are rejected with error messages

**When** validation passes
**Then** guests are bulk inserted into `guests` table with status="invited"

**And** I see a success message: "X guests imported successfully"

**And** I see a detailed log of any errors (row number, error type)

**When** the file exceeds 10,000 rows
**Then** an error is shown: "Maximum 10,000 guests per import"

**And** the import is rejected

**Prerequisites:** Story 1.2 (admin auth)

**Technical Notes:**
- CSV parsing: Use `papaparse` or native Node.js csv-parser
- File upload: multipart/form-data handling in API route
- API endpoint: `POST /api/admin/guests/import`
- Frontend: `app/admin/guests/import/page.tsx` with file input, progress bar
- Validation: Zod schema for email format, enum for guest_type
- Service layer: `lib/services/registration.ts` with `importGuestsFromCSV()` function
- Bulk insert: Prisma `createMany()` for performance
- Error handling: Return array of {row, email, error} for display
- CSV utilities: `lib/utils/csv.ts` with parsing/validation helpers

---

### Story 1.5: Magic Link Validation & Registration Landing

**As a** guest,
**I want** to click the magic link in my invitation email,
**So that** I can access my registration page without needing a password.

**Acceptance Criteria:**

**Given** I received a magic link invitation email
**When** I click the link (e.g., `/register?code={hash}&email={email}`)
**Then** the system validates the magic link hash

**And** checks that the link has not expired (5 minutes from first click)

**And** verifies the hash matches the expected SHA-256 value

**When** validation succeeds
**Then** I see a personalized welcome page with my name and guest category

**And** I see registration options based on my guest_type:
  - VIP: "Confirm Attendance" button
  - PAID_SINGLE/PAID_PAIRED: "Start Registration" button

**When** validation fails (invalid or expired hash)
**Then** I see an error page: "Invalid or expired invitation link"

**And** I see a "Request New Link" button

**When** I click "Request New Link"
**Then** rate limiting checks are performed (max 5 requests/hour)

**And** a new magic link email is sent if allowed

**Prerequisites:** Story 1.3 (magic link generation)

**Technical Notes:**
- Registration page: `app/(auth)/register/page.tsx`
- URL params parsing: Next.js `searchParams`
- Service layer: `lib/auth/magic-link.ts` with `validateMagicLink()` function
- Hash verification: SHA-256 of `email + APP_SECRET + timestamp`
- Expiry check: Compare `magic_link_expires_at` with current time
- Rate limiting: Query `email_logs` for recent magic link sends
- Session creation: Store guest_id in session cookie for subsequent pages
- Error handling: Clear error messages with actionable next steps

---

### Story 1.6: VIP Guest Registration (Instant Confirmation)

**As a** VIP guest,
**I want** to confirm my attendance with one click,
**So that** I can quickly RSVP without filling forms.

**Acceptance Criteria:**

**Given** I am a VIP guest who clicked a valid magic link
**When** I see the welcome page
**Then** I see my name, event details, and a large "Confirm Attendance" button

**When** I click "Confirm Attendance"
**Then** my registration status is updated from "invited" to "registered"

**And** I see a success message: "Thank you for confirming! Your ticket will arrive shortly."

**And** I am informed that QR ticket generation will happen in Epic 2 (placeholder for now)

**When** I click "Decline Attendance"
**Then** my status is updated to "declined"

**And** I see a polite message thanking me for the response

**Prerequisites:** Story 1.5 (magic link validation)

**Technical Notes:**
- Frontend: `app/(auth)/register/vip/page.tsx` with two buttons
- API endpoint: `POST /api/registration/confirm` with body: {guest_id, attendance: true/false}
- Service layer: `lib/services/registration.ts` with `processVIPRegistration()` function
- Database update: Update `guests.registration_status` to "registered" or "declined"
- Registration record: Insert into `registrations` table with ticket_type="vip_free"
- Epic 2 placeholder: Show message "QR ticket will be generated after payment system integration"
- Redirect: After confirmation, redirect to `/register/success` page

---

### Story 1.7: Paid Guest Registration Form (No Payment Yet)

**As a** paying guest,
**I want** to fill out my registration and billing information,
**So that** I can prepare for payment (which will be available in Epic 2).

**Acceptance Criteria:**

**Given** I am a PAID_SINGLE or PAID_PAIRED guest who clicked a valid magic link
**When** I start registration
**Then** I see a multi-step form:
  - Step 1: Ticket type selection (single or paired - only if PAID_PAIRED guest_type)
  - Step 2: Billing information (name, company, tax number, address)
  - Step 3: Partner details (only if paired ticket selected)

**When** I select "Paired Ticket"
**Then** I see additional fields for partner name and partner email

**When** I submit the form with all required fields
**Then** the data is validated (email format, required fields)

**And** a `registrations` record is created with:
  - ticket_type: "paid_single" or "paid_paired"
  - billing_name, billing_address, billing_tax_number
  - partner_name, partner_email (if paired)
  - payment_method: null (will be set in Epic 2)

**And** guest status is updated to "registered"

**And** I see a success message: "Registration saved! Payment integration coming in Epic 2."

**When** validation fails
**Then** I see clear error messages below each invalid field

**And** the form preserves my entered data for correction

**Prerequisites:** Story 1.5 (magic link validation)

**Technical Notes:**
- Frontend: `app/(auth)/register/paid/page.tsx` with multi-step form (React state or library like react-hook-form)
- API endpoint: `POST /api/registration/submit` with full form data
- Service layer: `lib/services/registration.ts` with `processPaidRegistration()` function
- Validation: Zod schema for form fields (email, required strings, address structure)
- Database: Insert into `registrations` table, update `guests.registration_status`
- Form components: `app/components/forms/RegistrationForm.tsx` with progressive disclosure
- Responsive design: Mobile-first, single-column layout, 44x44px touch targets
- Accessibility: ARIA labels, keyboard navigation, clear focus indicators

---

### Story 1.8: Admin Guest List Dashboard

**As an** admin user,
**I want** to view and filter the complete guest list,
**So that** I can monitor registration status and manage guests.

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I navigate to `/admin/guests`
**Then** I see a paginated table of all guests with columns:
  - Name
  - Email
  - Guest Type (VIP / PAID_SINGLE / PAID_PAIRED)
  - Status (invited / registered / approved / declined)
  - Table Assignment (if assigned)
  - Actions (Edit / Delete / Send Invitation)

**When** I use the search bar
**Then** I can filter guests by name or email (case-insensitive)

**When** I use the category filter dropdown
**Then** I can filter by guest_type (All / VIP / Paid Single / Paid Paired)

**When** I use the status filter dropdown
**Then** I can filter by registration_status (All / Invited / Registered / Approved / Declined)

**When** I click "Send Invitation" for a guest
**Then** a magic link email is sent (calls Story 1.3 email service)

**When** I change the page size dropdown (10 / 25 / 50 items per page)
**Then** the table updates with the selected number of rows

**And** pagination controls update accordingly

**Prerequisites:** Story 1.2 (admin auth), Story 1.3 (email service), Story 1.4 (CSV import - creates guests)

**Technical Notes:**
- Frontend: `app/admin/guests/page.tsx` with server component for initial data, client component for filters
- API endpoint: `GET /api/admin/guests?page=1&limit=25&search=&type=&status=`
- Service layer: `lib/services/registration.ts` with `getGuestList()` function with pagination
- Database query: Prisma `findMany()` with where clause, skip, take for pagination
- Table component: Use `@tanstack/react-table` or simple native table with Tailwind
- Filters: Client-side state management, debounced search input
- Actions: Buttons trigger API calls (send email, edit redirect, delete confirmation modal)
- Responsive: Horizontal scroll on mobile, sticky header

---

### Story 1.9: Admin Guest CRUD Operations

**As an** admin user,
**I want** to create, edit, and delete guests manually,
**So that** I can manage the guest list without relying on CSV imports.

**Acceptance Criteria:**

**Given** I am on the guest list dashboard (`/admin/guests`)
**When** I click "Add New Guest" button
**Then** I see a modal or form page with fields:
  - Email (required, unique)
  - Name (required)
  - Guest Type (dropdown: VIP / PAID_SINGLE / PAID_PAIRED)
  - Phone (optional)
  - Company (optional)
  - Notes (optional)

**When** I submit the form with valid data
**Then** a new guest is created in `guests` table with status="invited"

**And** I see a success message: "Guest added successfully"

**And** the guest appears in the guest list

**When** I click "Edit" for a guest
**Then** I see a pre-filled form with the guest's current data

**And** I can update any field except email (email is immutable identifier)

**When** I save changes
**Then** the `guests` record is updated

**And** the `updated_at` timestamp is refreshed

**When** I click "Delete" for a guest
**Then** I see a confirmation modal: "Are you sure you want to delete [Name]? This action cannot be undone."

**When** I confirm deletion
**Then** the guest and all related records are deleted (CASCADE: registrations, checkins, table_assignments, email_logs)

**And** the guest disappears from the list

**Prerequisites:** Story 1.8 (guest list dashboard)

**Technical Notes:**
- Frontend: Modal component for create/edit forms using `@headlessui/react` or native dialog
- API endpoints:
  - `POST /api/admin/guests` - Create
  - `PATCH /api/admin/guests/[id]` - Update
  - `DELETE /api/admin/guests/[id]` - Delete
- Service layer: `lib/services/registration.ts` with CRUD functions
- Validation: Zod schemas for create/update payloads
- Database: Prisma `create()`, `update()`, `delete()` with CASCADE relations
- UX: Form validation with real-time feedback, loading states, error handling
- Security: CSRF protection, admin role verification in API routes

---

## Epic 2: Payment & Ticketing

**Epic Goal:** Stripe fizetési integráció implementálása és QR jegy generálás automatizálása, hogy fizető vendégek online fizetés után automatikusan megkapják e-ticket-jüket, valamint banki átutalással fizető vendégek manuális jóváhagyás után kapjanak jegyet.

**User Value:** Vendégek zökkenőmentesen tudnak fizetni bankkártyával (Stripe) vagy átutalással, és automatikusan megkapják a QR kódos e-ticketet, amely a beléptetéshez szükséges.

**FRs Covered:** FR-2.3.1, FR-2.3.2, FR-2.4.1, FR-2.4.2, FR-2.2.2 (payment part), FR-2.2.3 (payment part)

**Total Stories:** 6

---

### Story 2.1: Stripe Checkout Session Integration

**As a** fizető vendég,
**I want** to biztonságosan fizetni bankkártyával Stripe-on keresztül,
**So that** a regisztrációm után azonnal befejezhetem a fizetést és megkaphassam a jegyemet.

**Acceptance Criteria:**

**Given** I have completed the paid guest registration form (Story 1.7)
**When** I click "Fizetés bankkártyával" button
**Then** a Stripe Checkout Session is created via API call to `/api/stripe/create-checkout`

**And** the session includes:
- Line items: ticket type, unit price (20,000 Ft or 40,000 Ft), quantity
- Customer email prefilled from registration
- Success URL: `{NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `{NEXT_PUBLIC_APP_URL}/payment/cancel`
- Metadata: `{registration_id, guest_id, ticket_type}`

**When** the Checkout Session is created successfully
**Then** I am redirected to the Stripe hosted checkout page

**And** I can enter card details and complete payment

**When** payment succeeds
**Then** I am redirected to `/payment/success` with session_id in query params

**And** I see a success message: "Sikeres fizetés! E-ticketedet emailben küldtük."

**Prerequisites:** Story 1.7 (paid registration form), Story 1.2 (email service)

**Technical Notes:**
- Stripe SDK: `stripe` npm package (v14.0+)
- API route: `app/api/stripe/create-checkout/route.ts`
- Environment variables: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Payment record created with status `pending` before redirect
- Success page: `app/payment/success/page.tsx`
- Cancel page: `app/payment/cancel/page.tsx`
- Checkout mode: `payment` (one-time payment)
- Currency: `huf` (Hungarian Forint)
- Service layer: `lib/services/payment.ts` → `createCheckoutSession(registrationId)`

---

### Story 2.2: Stripe Webhook Handler & Payment Confirmation

**As an** event organizer,
**I want** to automatically confirm payments via Stripe webhooks,
**So that** payment records are reliably updated even if users close the browser after payment.

**Acceptance Criteria:**

**Given** Stripe sends a `checkout.session.completed` webhook event
**When** the webhook is received at `/api/stripe/webhook`
**Then** the webhook signature is validated using `Stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`

**And** if signature is invalid, return 400 status with error message

**When** signature is valid
**Then** extract `session_id`, `payment_intent`, `amount_total`, and `metadata` from event

**And** find the corresponding `payments` record by `stripe_session_id`

**And** update the record:
- `status` → `completed`
- `stripe_payment_intent_id` → payment_intent ID
- `paid_at` → current timestamp

**And** update the `registrations` record referenced by `metadata.registration_id`:
- `status` → `paid`

**And** trigger Story 2.3 (QR code generation) asynchronously

**And** return 200 status to Stripe

**When** webhook processing fails
**Then** log error to `console.error` and return 500 status (Stripe will retry)

**Prerequisites:** Story 2.1 (Stripe Checkout), Story 1.1 (database schema)

**Technical Notes:**
- API route: `app/api/stripe/webhook/route.ts`
- Webhook endpoint must be registered in Stripe Dashboard
- Use `request.text()` to get raw body (required for signature validation)
- Webhook secret: `STRIPE_WEBHOOK_SECRET` (different from API secret)
- Add `disable_verify: false` in signature validation
- Event types to handle: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
- Idempotency: check if payment already marked as `completed` before updating
- Service layer: `lib/services/payment.ts` → `confirmPayment(sessionId)`
- Transaction safety: wrap updates in Prisma `$transaction()` for atomicity

---

### Story 2.3: QR Code JWT Generation & Storage

**As a** fizető vendég,
**I want** to automatically receive a unique QR code after payment,
**So that** I can use it for event check-in without manual admin intervention.

**Acceptance Criteria:**

**Given** a payment has been confirmed (via webhook in Story 2.2)
**When** the payment confirmation service is triggered
**Then** a JWT token is generated for the registration using `jsonwebtoken` library

**And** the JWT payload includes:
```json
{
  "registration_id": 123,
  "guest_id": 456,
  "ticket_type": "single_paid",
  "iat": 1735000000,
  "exp": 1735257600
}
```

**And** the token is signed with `QR_SECRET` environment variable using HMAC-SHA256 (HS256)

**When** the token is generated
**Then** the token hash is computed using SHA-256 (for database storage)

**And** the `registrations` record is updated:
- `qr_code_hash` → SHA-256 hash of JWT token
- `status` → `ticket_issued`

**And** a QR code image is generated from the JWT token using `qrcode` npm package

**And** the QR image is encoded as Base64 PNG data URL

**And** trigger Story 2.4 (email ticket delivery) with QR data URL

**Prerequisites:** Story 2.2 (payment confirmation), Story 1.1 (database schema)

**Technical Notes:**
- JWT library: `jsonwebtoken` npm package (v9.0+)
- QR library: `qrcode` npm package (v1.5+)
- Service layer: `lib/services/ticketing.ts` → `generateQRTicket(registrationId)`
- Token expiry calculation: `Math.floor(Date.parse(eventDate) / 1000) - 86400` (event day - 1 day)
- QR code options: `{type: 'image/png', width: 300, margin: 2}`
- Hash algorithm: `crypto.createHash('sha256').update(token).digest('hex')`
- Environment variable: `QR_SECRET` (min 64 chars)
- **DO NOT** store the JWT token itself in database - only the hash
- Event date config: hardcoded as `2025-02-15` or from environment variable

---

### Story 2.4: E-Ticket Email Delivery with QR Code

**As a** fizető vendég,
**I want** to receive a professional e-ticket email with my QR code,
**So that** I can download it to my phone and use it at the event entrance.

**Acceptance Criteria:**

**Given** a QR code has been generated for a paid registration (Story 2.3)
**When** the ticket delivery service is triggered
**Then** an email is composed with the following structure:

**Subject:** "CEO Gála 2025 - E-ticket - [Guest Name]"

**Body (HTML):**
- Event details: CEO Gála 2025, 2025. február 15., 18:00
- Guest name and ticket type (Egyedi jegy / Páros jegy)
- QR code image embedded inline (Base64 data URL)
- Instructions: "Mutasd fel ezt a QR kódot a belépéskor"
- Footer: Contact info and terms link

**And** the email is sent via Nodemailer SMTP service (from Story 1.3)

**When** email sending succeeds
**Then** create an `email_logs` record:
- `guest_id` → current guest ID
- `email_type` → `ticket_delivery`
- `sent_at` → current timestamp
- `status` → `sent`

**When** email sending fails
**Then** create an `email_logs` record with `status` → `failed` and `error_message`

**And** log error to console for admin review

**And** queue retry attempt (optional for MVP)

**Prerequisites:** Story 2.3 (QR generation), Story 1.3 (email service)

**Technical Notes:**
- Email template: `lib/email/templates/ticket-delivery.tsx` (React Email or HTML string)
- Service layer: `lib/services/email.ts` → `sendTicketEmail(registrationId, qrDataUrl)`
- Inline QR: `<img src="data:image/png;base64,..." alt="QR Code" />`
- Nodemailer config: reuse from Story 1.3
- Email queue: consider `bull` or `bee-queue` for production (optional)
- Attachment option: also attach QR as separate PNG file for iOS Wallet compatibility
- Template styling: Mobile-first responsive HTML with inline CSS

---

### Story 2.5: Manual Bank Transfer Payment Approval

**As an** admin,
**I want** to manually approve payments made via bank transfer,
**So that** guests who choose offline payment can receive their tickets after verification.

**Acceptance Criteria:**

**Given** I am logged in as admin (Story 1.2)
**When** I navigate to `/admin/guests` dashboard (Story 1.8)
**Then** I see a filter option: "Fizetési státusz: Átutalásra vár"

**And** I can see all registrations with `payment_method: 'bank_transfer'` and `status: 'awaiting_payment'`

**When** I verify that the bank transfer has been received (manual bank statement check)
**Then** I click "Fizetés jóváhagyása" button next to the guest entry

**And** an API call is made to `PATCH /api/admin/guests/{id}/approve-payment`

**When** the API endpoint is called
**Then** the `payments` record is updated:
- `status` → `completed`
- `paid_at` → current timestamp

**And** the `registrations` record is updated:
- `status` → `paid`

**And** trigger Story 2.3 (QR generation) and Story 2.4 (email delivery) automatically

**When** the approval succeeds
**Then** I see a success toast: "Fizetés jóváhagyva, e-ticket elküldve"

**And** the guest row updates to show status: "Jegy kiadva"

**Prerequisites:** Story 1.8 (admin dashboard), Story 2.3 (QR generation), Story 2.4 (email delivery)

**Technical Notes:**
- API route: `app/api/admin/guests/[id]/approve-payment/route.ts`
- Authorization: check NextAuth session, require `role: 'admin'`
- Button component: `app/admin/guests/components/ApprovePaymentButton.tsx` (client component)
- Service layer: `lib/services/payment.ts` → `approveManualPayment(registrationId)`
- Transaction: wrap status updates + QR generation in Prisma `$transaction()`
- Email notification: reuse Story 2.4 service
- UI feedback: Optimistic UI update with rollback on error

---

### Story 2.6: Payment Status Dashboard for Guests

**As a** fizető vendég,
**I want** to check my payment and ticket status after registration,
**So that** I can confirm my ticket was issued or see pending payment instructions.

**Acceptance Criteria:**

**Given** I am a paid guest who completed registration (Story 1.7)
**When** I visit `/registration/status?email={my_email}` (public page, no auth required)
**Then** I see my registration summary:
- Guest name and ticket type
- Payment method (Bankkártya / Banki átutalás)
- Payment status badge:
  - "Sikeres fizetés ✅" if status = `paid` or `ticket_issued`
  - "Fizetésre vár ⏳" if status = `awaiting_payment`
  - "Feldolgozás alatt..." if status = `registered` (edge case)

**When** my status is `awaiting_payment` and `payment_method: 'bank_transfer'`
**Then** I see bank transfer details:
- Bank name: "OTP Bank"
- Account number: "11111111-22222222-33333333"
- Reference code: "GALA-{registration_id}"
- Amount: "20,000 Ft" or "40,000 Ft"

**And** I see a note: "Kérjük, az utalás közleményében add meg a referencia kódot."

**When** my status is `ticket_issued`
**Then** I see a success message: "E-ticketed sikeresen kiküldve az emailedre!"

**And** I see a "QR kód újraküldése" button

**When** I click "QR kód újraküldése"
**Then** Story 2.4 (email delivery) is re-triggered for my registration

**And** I see a toast: "E-ticket újraküldve!"

**Prerequisites:** Story 1.7 (registration), Story 2.2 (payment confirmation)

**Technical Notes:**
- Page: `app/registration/status/page.tsx`
- Query param validation: email format check
- API route: `GET /api/registration/status?email={email}`
- Rate limiting: max 10 requests per hour per email (prevent abuse)
- Resend button: calls `POST /api/registration/resend-ticket` with email param
- Service layer: `lib/services/registration.ts` → `getRegistrationStatus(email)`
- Security: no sensitive data exposed (e.g., full payment details)
- UX: Clear iconography, color-coded status badges

---

## Epic 3: Check-in System

**Epic Goal:** Mobil QR szkennelő alkalmazás és check-in napló implementálása, hogy a rendezvény beléptetési személyzete gyorsan és megbízhatóan tudja validálni a vendégeket QR kód alapján.

**User Value:** A beléptetési folyamat automatizált, gyors és hibamentes - a személyzet egyszerűen beolvassa a QR kódot, azonnal látja a vendég státuszát (érvényes/már bent van/érvénytelen), és egy kattintással rögzítheti a belépést.

**FRs Covered:** FR-2.5.1, FR-2.5.2, FR-2.7.3

**Total Stories:** 4

---

### Story 3.1: QR Code Validation API & JWT Verification

**As a** check-in staff member,
**I want** the system to validate QR codes in real-time,
**So that** I can instantly know if a guest's ticket is valid.

**Acceptance Criteria:**

**Given** a QR code is scanned containing a JWT token
**When** the token is sent to `/api/checkin/validate` endpoint
**Then** the JWT signature is verified using `QR_SECRET` environment variable

**And** if signature is invalid, return 400 status with error: `{valid: false, reason: 'invalid_signature'}`

**When** signature is valid
**Then** check if the token has expired (compare `exp` claim with current timestamp)

**And** if expired, return 200 status with: `{valid: false, reason: 'expired', expiryDate: '2025-02-14'}`

**When** token is valid and not expired
**Then** extract `registration_id` and `guest_id` from payload

**And** query the database for registration details (guest name, ticket type, registration status)

**And** check if the registration has already been checked in (query `checkins` table by `registration_id`)

**When** registration is already checked in
**Then** return 200 status with:
```json
{
  "valid": false,
  "reason": "already_checked_in",
  "guest": {"name": "John Doe", "ticket_type": "single_paid"},
  "checkin_details": {
    "checked_in_at": "2025-02-15T18:05:00Z",
    "staff_name": "Staff User"
  }
}
```

**When** registration is valid and not checked in
**Then** return 200 status with:
```json
{
  "valid": true,
  "guest": {
    "id": 456,
    "name": "John Doe",
    "ticket_type": "single_paid",
    "registration_id": 123
  }
}
```

**Prerequisites:** Story 2.3 (QR JWT generation), Story 1.1 (database schema)

**Technical Notes:**
- API route: `app/api/checkin/validate/route.ts`
- JWT verification: `jsonwebtoken.verify(token, QR_SECRET)` with error handling
- Service layer: `lib/services/checkin.ts` → `validateQRToken(token)`
- Database query: Join `registrations`, `guests`, and `checkins` tables
- Error responses: Always return 200 with `{valid: false, reason: ...}` for business logic errors
- Only return 400/500 for technical errors (malformed request, server errors)
- No authentication required (public endpoint for check-in app)

---

### Story 3.2: Mobile QR Scanner Interface

**As a** check-in staff member,
**I want** a mobile-friendly QR scanner app,
**So that** I can use my phone or tablet to scan guest tickets at the entrance.

**Acceptance Criteria:**

**Given** I am a check-in staff member
**When** I navigate to `/checkin` on my mobile device
**Then** I see a login prompt (simple PIN code: 1234 for MVP)

**When** I enter the correct PIN
**Then** I see the QR scanner interface with:
- Live camera feed with viewfinder overlay
- "Scan QR Code" heading
- Status indicator (Ready / Scanning / Processing)

**When** I point the camera at a QR code
**Then** the code is automatically detected and decoded using `html5-qrcode` library

**And** the extracted JWT token is sent to Story 3.1 validation API

**When** validation API returns `{valid: true}`
**Then** I see a **GREEN card** displaying:
- Guest name (large font)
- Ticket type badge (VIP / Egyedi jegy / Páros jegy)
- "Érvényes jegy ✓" status message
- Large "Beléptetés" button (green, prominent)

**When** I tap "Beléptetés" button
**Then** Story 3.3 check-in recording API is called

**And** I see a success animation with checkmark

**And** the scanner resets to "Ready" state after 2 seconds

**When** validation API returns `{valid: false, reason: 'already_checked_in'}`
**Then** I see a **YELLOW card** displaying:
- Guest name
- "Már bent van ⚠️" warning message
- Check-in timestamp (e.g., "18:05-kor belépett")
- Staff name who checked them in
- "Admin felülbírálás" button (yellow, secondary style) - only visible if I have admin role

**When** validation API returns `{valid: false, reason: 'expired'}` or `{reason: 'invalid_signature'}`
**Then** I see a **RED card** displaying:
- "Érvénytelen jegy ✗" error message
- Reason details (lejárt / hibás QR kód)
- "Új szkennelés" button to reset scanner

**Prerequisites:** Story 3.1 (validation API)

**Technical Notes:**
- Page: `app/checkin/page.tsx` (client component with 'use client')
- QR scanner: `html5-qrcode` library (v2.3+)
- Camera permissions: Request on page load with clear error handling
- Scanner config: `{fps: 10, qrbox: 250, aspectRatio: 1.0}`
- Responsive: Full viewport height, large touch targets (min 60px)
- Color-coded cards: Tailwind utility classes (bg-green-100, bg-yellow-100, bg-red-100)
- PIN auth: Simple session storage (no NextAuth - separate from admin auth)
- Haptic feedback: `navigator.vibrate(200)` on successful scan (if available)
- Auto-reset: Clear card after 5 seconds of inactivity

---

### Story 3.3: Check-in Recording & Duplicate Prevention

**As a** check-in staff member,
**I want** the system to prevent duplicate check-ins,
**So that** guests cannot enter multiple times with the same ticket.

**Acceptance Criteria:**

**Given** I have scanned a valid QR code (green card shown in Story 3.2)
**When** I tap the "Beléptetés" button
**Then** an API call is made to `POST /api/checkin/submit` with payload:
```json
{
  "registration_id": 123,
  "guest_id": 456,
  "staff_user_id": null,
  "is_override": false
}
```

**When** the API endpoint receives the request
**Then** check if a `checkins` record already exists for this `registration_id`

**And** if a record exists and `is_override: false`, return 409 status with error:
```json
{
  "success": false,
  "error": "already_checked_in",
  "checkin_details": {
    "checked_in_at": "2025-02-15T18:05:00Z",
    "staff_name": "Staff User"
  }
}
```

**When** no existing record is found or `is_override: true`
**Then** insert a new `checkins` record:
- `registration_id` → from payload (UNIQUE constraint enforces duplicate prevention)
- `guest_id` → from payload
- `staff_user_id` → from payload (can be null for MVP)
- `checked_in_at` → current timestamp
- `is_override` → from payload (default: false)

**And** return 201 status with:
```json
{
  "success": true,
  "checkin_id": 789,
  "checked_in_at": "2025-02-15T18:15:00Z"
}
```

**When** database constraint violation occurs (duplicate `registration_id`)
**Then** catch the Prisma error and return 409 status (same as manual duplicate check)

**When** admin override is requested (`is_override: true`)
**Then** delete the existing `checkins` record first (if exists)

**And** insert new record with `is_override: true`

**And** log the override action to console for audit trail

**Prerequisites:** Story 3.1 (validation API), Story 3.2 (scanner interface)

**Technical Notes:**
- API route: `app/api/checkin/submit/route.ts`
- Service layer: `lib/services/checkin.ts` → `recordCheckIn(data)`
- Database: `checkins` table with UNIQUE constraint on `registration_id`
- Error handling: Catch Prisma `PrismaClientKnownRequestError` with code `P2002` (unique violation)
- Transaction safety: Use Prisma `$transaction()` for override (delete + insert)
- Idempotency: Multiple identical requests within 1 second return same result (dedupe logic)
- Audit log: Log all overrides with timestamp, guest_id, staff_user_id for compliance

---

### Story 3.4: Admin Check-in Log Dashboard

**As an** admin user,
**I want** to view the complete check-in log with filtering,
**So that** I can monitor attendance and investigate any issues.

**Acceptance Criteria:**

**Given** I am logged in as admin (Story 1.2)
**When** I navigate to `/admin/checkin-log`
**Then** I see a paginated table with columns:
- Check-in Time (sortable, default: newest first)
- Guest Name (linked to guest detail page)
- Ticket Type (VIP / Egyedi / Páros)
- Staff Name (if recorded)
- Override Flag (badge: "Override" if `is_override: true`)

**When** I use the date range filter
**Then** I can select start and end dates to filter check-ins

**And** the table updates to show only check-ins within the selected range

**When** I use the search bar
**Then** I can search by guest name (case-insensitive)

**And** the table filters in real-time

**When** I click "Export CSV" button
**Then** a CSV file is downloaded with all filtered check-in records

**And** the CSV includes all columns from the table plus registration_id

**When** I change the sort order (click column header)
**Then** the table re-sorts by that column (toggle ascending/descending)

**When** I change the page size (10 / 25 / 50 / 100)
**Then** the table updates with the selected number of rows

**And** pagination controls adjust accordingly

**Prerequisites:** Story 3.3 (check-in recording), Story 1.2 (admin auth)

**Technical Notes:**
- Page: `app/admin/checkin-log/page.tsx`
- API route: `GET /api/admin/checkin-log?page=1&limit=25&search=&startDate=&endDate=&sortBy=checked_in_at&sortOrder=desc`
- Service layer: `lib/services/checkin.ts` → `getCheckInLog(filters)`
- Database query: Join `checkins`, `guests`, `registrations`, and `users` tables
- Date filtering: Use Prisma `gte` and `lte` operators on `checked_in_at`
- CSV export: API route `GET /api/admin/checkin-log/export` with same filter params
- CSV library: Use `papaparse` or native `JSON.stringify` → CSV conversion
- Real-time updates: Optional WebSocket or polling for live event monitoring (future enhancement)
- Statistics: Show summary counts (total checked in, overrides count, last 1 hour count)

---

## Epic 4: Seating Management

**Epic Goal:** Interaktív asztalfoglalási rendszer implementálása drag-and-drop térképszerkesztővel, hogy adminok vizuálisan rendezhetik az ülésrendet és egyszerűen kezelhetik a vendég-asztal hozzárendeléseket.

**User Value:** Az eseményszervezők könnyedén létrehozhatják az asztalelrendezést, drag-and-drop-pal rendezhetik át az asztalokat a térképen, vendégeket rendelhetnek hozzájuk, és exportálhatják az ülésrendet CSV formátumban.

**FRs Covered:** FR-2.6.1, FR-2.6.2, FR-2.6.3, FR-2.6.4, FR-2.7.4

**Total Stories:** 5

---

### Story 4.1: Table CRUD Operations

**As an** admin user,
**I want** to create, edit, and delete tables,
**So that** I can set up the venue layout before assigning guests.

**Acceptance Criteria:**

**Given** I am logged in as admin (Story 1.2)
**When** I navigate to `/admin/tables`
**Then** I see a list of all existing tables with columns:
- Table Name (e.g., "VIP-1", "Table 5")
- Capacity (number of seats)
- Table Type (VIP / Standard / Reserved)
- Status (Active / Inactive)
- Assigned Guests Count (e.g., "5/8")
- Actions (Edit / Delete / View Assignments)

**When** I click "Add New Table" button
**Then** I see a modal form with fields:
- Table name (required, UNIQUE)
- Capacity (required, number 1-20)
- Table type (dropdown: VIP / Standard / Reserved)
- Position X (optional, number for map placement)
- Position Y (optional, number for map placement)

**When** I submit the form with valid data
**Then** a new `tables` record is created with status="active"

**And** I see a success message: "Table created successfully"

**And** the table appears in the table list

**When** I click "Edit" for a table
**Then** I see a pre-filled form with current table data

**And** I can update any field except name (name is immutable identifier)

**When** I save changes
**Then** the `tables` record is updated

**And** the `updated_at` timestamp is refreshed

**When** I click "Delete" for a table
**Then** I see a confirmation modal: "Are you sure? This will unassign all X guests from this table."

**When** I confirm deletion
**Then** all `table_assignments` records for this table are deleted (CASCADE)

**And** the `tables` record is deleted

**And** the table disappears from the list

**Prerequisites:** Story 1.2 (admin auth)

**Technical Notes:**
- Page: `app/admin/tables/page.tsx`
- API endpoints:
  - `GET /api/admin/tables` - List all tables
  - `POST /api/admin/tables` - Create table
  - `PATCH /api/admin/tables/[id]` - Update table
  - `DELETE /api/admin/tables/[id]` - Delete table
- Service layer: `lib/services/seating.ts` → `createTable()`, `updateTable()`, `deleteTable()`
- Validation: Zod schema for table data (name UNIQUE, capacity 1-20)
- Database: Prisma operations with CASCADE delete for `table_assignments`
- Modal: Use `@headlessui/react` Dialog component
- Table list: Show assigned guest count via JOIN query with `table_assignments`

---

### Story 4.2: Manual Guest-to-Table Assignment

**As an** admin user,
**I want** to manually assign guests to specific tables and seats,
**So that** I can create the seating arrangement for the event.

**Acceptance Criteria:**

**Given** I am on the guest list dashboard (`/admin/guests`)
**When** I click "Assign to Table" button for a guest
**Then** I see a modal with:
- Guest name and ticket type
- Table dropdown (list of all active tables with available capacity)
- Seat number input (1-20)

**When** I select a table
**Then** the dropdown shows table capacity and current occupancy (e.g., "VIP-1 (5/8 seats)")

**And** unavailable seat numbers are disabled in the seat input

**When** I submit the assignment with valid data
**Then** a `table_assignments` record is created:
- `table_id` → selected table
- `guest_id` → current guest (UNIQUE constraint)
- `seat_number` → entered seat number
- `assigned_at` → current timestamp

**And** if the guest was previously assigned to another table, the old assignment is deleted first

**And** I see a success message: "[Guest Name] assigned to [Table Name], Seat [Number]"

**And** the guest list row updates to show the table assignment

**When** I try to assign a guest to a full table
**Then** I see an error: "Table is at full capacity (X/X seats)"

**And** the assignment is rejected

**When** I try to assign a seat number already taken
**Then** I see an error: "Seat [Number] is already assigned to [Other Guest Name]"

**And** the assignment is rejected

**When** I click "Unassign" for an assigned guest
**Then** I see a confirmation modal: "Remove [Guest Name] from [Table Name]?"

**When** I confirm
**Then** the `table_assignments` record is deleted

**And** the seat becomes available again

**Prerequisites:** Story 4.1 (table CRUD), Story 1.8 (guest list)

**Technical Notes:**
- API endpoint: `POST /api/admin/table-assignments` with body: `{guest_id, table_id, seat_number}`
- API endpoint: `DELETE /api/admin/table-assignments/[id]`
- Service layer: `lib/services/seating.ts` → `assignGuestToTable()`, `unassignGuest()`
- Validation:
  - Check table capacity before assignment
  - Verify seat_number is not already taken (UNIQUE index on `table_id, seat_number`)
  - Check `guest_id` UNIQUE constraint (one guest = one table)
- Transaction: Wrap delete + insert in Prisma `$transaction()` for reassignment
- Modal: Real-time capacity check when table is selected
- Error handling: Catch Prisma unique constraint violations (P2002)

---

### Story 4.3: Bulk CSV Table Assignment

**As an** admin user,
**I want** to upload a CSV file with guest-table mappings,
**So that** I can quickly assign many guests at once instead of manually one-by-one.

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I navigate to `/admin/tables/bulk-assign`
**Then** I see a file upload form accepting CSV files

**And** I see a sample CSV template download link with headers: `guest_email, table_name, seat_number`

**When** I upload a valid CSV file
**Then** the CSV is parsed and validated row-by-row

**And** for each row:
- Verify `guest_email` exists in `guests` table
- Verify `table_name` exists in `tables` table
- Verify `seat_number` is within table capacity
- Verify seat is not already assigned

**When** validation passes for all rows
**Then** all assignments are created in a single database transaction

**And** I see a success message: "X guests assigned successfully"

**When** validation fails for any row
**Then** I see a detailed error report with:
- Row number
- Guest email
- Error type (guest not found / table not found / seat taken / invalid seat number)

**And** NO assignments are created (all-or-nothing transaction)

**And** I can download the error report as CSV

**When** a CSV row would reassign a guest (guest already has a table)
**Then** the old assignment is deleted and the new one is created (update behavior)

**Prerequisites:** Story 4.2 (manual assignment), Story 1.4 (CSV parsing pattern)

**Technical Notes:**
- Page: `app/admin/tables/bulk-assign/page.tsx`
- API endpoint: `POST /api/admin/table-assignments/bulk` with multipart CSV upload
- Service layer: `lib/services/seating.ts` → `bulkAssignGuestsFromCSV(csvData)`
- CSV parsing: Use `papaparse` library
- Validation: Zod schema for each row (email format, required fields)
- Database: Use Prisma `$transaction()` to wrap all insertions (rollback on any error)
- Error handling: Collect all validation errors before returning (don't stop at first error)
- CSV utilities: Reuse from Story 1.4
- Sample template: Provide downloadable CSV with 3 example rows

---

### Story 4.4: Interactive Drag-and-Drop Seating Map

**As an** admin user,
**I want** to visually arrange tables on a floor plan using drag-and-drop,
**So that** I can create an intuitive visual representation of the venue layout.

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I navigate to `/admin/tables/map`
**Then** I see a canvas-based seating map editor

**And** all existing tables are rendered as draggable circles/rectangles positioned at (`pos_x`, `pos_y`)

**And** each table shows:
- Table name label
- Capacity indicator (e.g., "8")
- Occupancy color coding (empty: gray, partial: yellow, full: green)

**When** I drag a table to a new position
**Then** the table moves smoothly with my cursor

**And** when I release the mouse, an API call updates `tables.pos_x` and `pos_y`

**And** the new position is persisted to the database

**When** I click on a table
**Then** I see a popup with:
- Table details (name, capacity, type)
- List of assigned guests with seat numbers
- "Edit Table" button (opens Story 4.1 edit modal)
- "Assign Guests" button (opens Story 4.2 assignment modal)

**When** I click "Add New Table" on the map
**Then** a new table is created at the clicked coordinates

**And** a quick-create form appears with default name "Table X" and capacity 8

**And** I can immediately edit the name and capacity

**When** I zoom in/out using mouse wheel or touch gestures
**Then** the canvas scales proportionally

**And** table sizes and labels adjust for readability

**When** I click "Save Layout" button
**Then** all table positions are batch-updated in the database

**And** I see a success message: "Seating layout saved"

**Prerequisites:** Story 4.1 (table CRUD), Story 4.2 (guest assignment)

**Technical Notes:**
- Page: `app/admin/tables/map/page.tsx` (client component)
- Drag-and-drop library: `@dnd-kit/core` with `useDraggable` hook
- Canvas: HTML5 Canvas or SVG with pan/zoom support
- Alternative: Use `react-konva` for full canvas control with shapes
- API endpoint: `PATCH /api/admin/tables/bulk-positions` with array of `{id, pos_x, pos_y}`
- Service layer: `lib/services/seating.ts` → `updateTablePositions()`
- Real-time updates: Auto-save positions 500ms after drag ends (debounced)
- Responsive: Desktop-first (1200px+ recommended), mobile warning for small screens
- Table rendering: Circle shape with radius based on capacity (r = 20 + capacity * 2)
- Color coding: Tailwind colors - gray-300 (empty), yellow-300 (partial), green-300 (full)

---

### Story 4.5: Seating Arrangement Export & Reports

**As an** admin user,
**I want** to export the complete seating arrangement as CSV and PDF,
**So that** I can share it with event staff and venue coordinators.

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I navigate to `/admin/reports/seating`
**Then** I see a summary dashboard with:
- Total tables count
- Total assigned guests count
- Total unassigned guests count
- VIP tables count
- Average table occupancy percentage

**When** I click "Export Seating as CSV" button
**Then** a CSV file is downloaded with columns:
- Table Name
- Seat Number
- Guest Name
- Guest Email
- Ticket Type
- Table Type

**And** the CSV is sorted by table name, then seat number

**And** the filename includes current date: `seating-arrangement-2025-02-15.csv`

**When** I click "Export Guest List as CSV" button
**Then** a CSV file is downloaded with all guest data including:
- Name, Email, Guest Type, Registration Status, Table Assignment, Payment Status

**When** I click "Print Seating Chart" button
**Then** a printer-friendly page opens with:
- Event title and date
- Table-by-table breakdown (table name → guest list with seat numbers)
- Clear typography optimized for A4 printing

**When** I use the filter options
**Then** I can filter the export by:
- Table type (VIP / Standard / Reserved / All)
- Assignment status (Assigned / Unassigned / All)
- Guest type (VIP / Paid Single / Paid Paired / All)

**And** the export includes only filtered records

**Prerequisites:** Story 4.2 (guest assignments), Story 1.8 (guest list)

**Technical Notes:**
- Page: `app/admin/reports/seating/page.tsx`
- API endpoints:
  - `GET /api/admin/reports/seating-stats` - Summary statistics
  - `GET /api/admin/reports/seating-export?format=csv&filter=...` - CSV export
  - `GET /api/admin/reports/guest-list-export?format=csv` - Full guest export
- Service layer: `lib/services/seating.ts` → `getSeatingReport(filters)`
- CSV generation: Use `papaparse` or native JSON → CSV conversion
- Statistics: Aggregate queries with Prisma `groupBy()` and `count()`
- Print view: Separate print-optimized page at `/admin/reports/seating/print`
- Print CSS: Use `@media print` styles for clean A4 layout
- Download headers: `Content-Disposition: attachment; filename=seating-arrangement-YYYY-MM-DD.csv`

---

## FR Coverage Matrix (Final)

| FR Code | FR Név | Epic | Stories |
|---------|--------|------|---------|
| FR-2.1.1 | CSV Vendéglista Importálás | Epic 1 | 1.4 |
| FR-2.1.2 | Email Meghívó Küldése | Epic 1 | 1.3 |
| FR-2.2.1 | Magic Link Validáció | Epic 1 | 1.5 |
| FR-2.2.2 | VIP Vendég Regisztráció | Epic 1, Epic 2 | 1.6, 2.3, 2.4 |
| FR-2.2.3 | Fizető Vendég Regisztráció | Epic 1, Epic 2 | 1.7, 2.1, 2.5, 2.6 |
| FR-2.3.1 | Stripe Checkout Integráció | Epic 2 | 2.1, 2.2 |
| FR-2.3.2 | Manuális Fizetés Jóváhagyás | Epic 2 | 2.5 |
| FR-2.4.1 | QR Kód Generálás | Epic 2 | 2.3 |
| FR-2.4.2 | E-jegy Email Küldése | Epic 2 | 2.4 |
| FR-2.5.1 | Mobil QR Szkennelő | Epic 3 | 3.1, 3.2 |
| FR-2.5.2 | Check-in Napló & Duplikáció | Epic 3 | 3.3, 3.4 |
| FR-2.6.1 | Asztal CRUD | Epic 4 | 4.1 |
| FR-2.6.2 | Vendég-Asztal Hozzárendelés | Epic 4 | 4.2, 4.3 |
| FR-2.6.3 | Drag-and-Drop Térképszerkesztő | Epic 4 | 4.4 |
| FR-2.6.4 | Tömeges CSV Asztalfoglalás | Epic 4 | 4.3 |
| FR-2.7.1 | Vendéglista Szűrés & Keresés | Epic 1 | 1.8 |
| FR-2.7.2 | Vendég CRUD | Epic 1 | 1.9 |
| FR-2.7.3 | Check-in Log Viewer | Epic 3 | 3.4 |
| FR-2.7.4 | Exportálások (seating) | Epic 4 | 4.5 |

**Coverage: 15/15 FRs (100%)**

---

## Summary

**CEO Gala Registration System - Epic & Story Breakdown Complete**

**Total Epics:** 4
**Total Stories:** 24

### Epic Breakdown:
- **Epic 1: Core Registration (MVP)** - 9 stories
- **Epic 2: Payment & Ticketing** - 6 stories
- **Epic 3: Check-in System** - 4 stories
- **Epic 4: Seating Management** - 5 stories

### Key Deliverables:
✅ Teljes regisztrációs flow (VIP + fizető vendégek)
✅ Stripe fizetési integráció webhook validációval
✅ QR kódos jegyrendszer JWT tokenekkel
✅ Mobil check-in alkalmazás színkódolt feedback-kel
✅ Interaktív drag-and-drop asztalfoglalási térkép
✅ CSV import/export minden major feature-höz
✅ Admin dashboard teljes vendég- és eseménykezeléssel

### Next Steps:
1. **Sprint Planning:** Use `/bmad:bmm:workflows:sprint-planning` to generate sprint status tracking
2. **Story Contexting:** Use `/bmad:bmm:workflows:epic-tech-context` for Epic 1 before implementation
3. **Story Drafting:** Use `/bmad:bmm:workflows:create-story` to generate individual story files
4. **Implementation:** Start with Story 1.1 (already partially complete)

---

_Ez a dokumentum a [FUNKCIONALIS-KOVETELMENY.md](./FUNKCIONALIS-KOVETELMENY.md) és [tech-spec.md](./tech-spec.md) alapján készült._

_Minden story BDD Given/When/Then formátumú acceptance criteria-val rendelkezik, amely közvetlenül implementálható és tesztelhető._

---
