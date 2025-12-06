# Story 1.2: Admin Authentication & Session Management

Status: done
Completed: 2025-11-28

Epic: Epic 1 - Core Registration (MVP)
Story ID: 1.2
Created: 2025-11-27
Author: Javo!

---

## Story

As an **admin user**,
I want to **log in securely with email and password**,
so that **I can access the admin dashboard and manage guests**.

## Context

Ez a második story az Epic 1: Core Registration (MVP) epic-ben. Az Epic 1 tech context teljes részleteket tartalmaz a rendszer architektúrájáról és technikai követelményeiről ([tech-spec-epic-1.md](./tech-spec-epic-1.md)).

**Előfeltétel:** Story 1.1 (Project Foundation & Database Setup) - database schema `users` táblával, seed script 2 admin userrel.

**Folytatás:** Story 1.3 (Email Service Setup) - email küldés admin dashboard-ról triggert igényel admin auth-t.

## Acceptance Criteria

### AC-1.2.1: Login Form Megjelenítés

**Given** I am an unauthenticated admin
**When** I navigate to `/admin/login`
**Then** I see a login form with email and password fields

**And** I can enter credentials (admin@ceogala.test / Admin123!)

### AC-1.2.2: Sikeres Bejelentkezés

**When** I submit the form with valid credentials
**Then** my password is verified using bcrypt (cost=12)

**And** a secure session cookie is created (HttpOnly, Secure, SameSite=Strict)

**And** I am redirected to `/admin` dashboard

### AC-1.2.3: Route Protection

**When** I try to access `/admin/*` routes without authentication
**Then** I am redirected to `/admin/login`

**And** the session expires after 24 hours of inactivity

### AC-1.2.4: Invalid Credentials Handling

**When** I submit the form with invalid credentials
**Then** I see an error message: "Invalid email or password"

**And** I remain on the login page

**And** rate limiting prevents brute-force attacks (max 5 attempts/5 minutes)

---

## Tasks / Subtasks

### Task 1: NextAuth.js Setup & Configuration (AC: #1.2.2, #1.2.3)
- [ ] Install NextAuth.js 4.24.11 + bcryptjs dependencies
  ```bash
  npm install next-auth@4.24.11 bcryptjs @types/bcryptjs
  ```
- [ ] Create NextAuth.js config file: `app/api/auth/[...nextauth]/route.ts`
  - [ ] Configure Credentials provider
  - [ ] Implement authorize() callback with Prisma user lookup
  - [ ] bcrypt.compare() password verification
  - [ ] Return user object (id, email, name, role) on success
- [ ] Configure session strategy: JWT (default)
- [ ] Set session maxAge: 24 hours (86400 seconds)
- [ ] Configure secure cookie options:
  ```typescript
  cookies: {
    sessionToken: {
      name: 'ceog.session-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
  ```
- [ ] Add NEXTAUTH_SECRET and NEXTAUTH_URL to .env.local

### Task 2: Login Page UI Component (AC: #1.2.1)
- [ ] Create login page: `app/(auth)/admin/login/page.tsx` (client component)
- [ ] Design form layout (mobile-first, Tailwind CSS):
  - Email input (type="email", autocomplete="email")
  - Password input (type="password", autocomplete="current-password")
  - "Login" button (primary, full-width)
  - Error message display area
- [ ] Add form validation (client-side):
  - Email format validation (basic regex or HTML5 validation)
  - Required field checks
- [ ] Implement form submission handler:
  - Call signIn('credentials', { email, password, redirect: false })
  - Handle response (success → redirect /admin, error → show message)
- [ ] Add loading state during authentication (disabled button, spinner)
- [ ] Accessibility: ARIA labels, keyboard navigation, focus management

### Task 3: Middleware Route Protection (AC: #1.2.3)
- [ ] Create `middleware.ts` in project root
- [ ] Implement NextAuth.js middleware wrapper:
  ```typescript
  export { default } from 'next-auth/middleware';
  export const config = {
    matcher: ['/admin/:path*']  // Protect all /admin/* routes
  };
  ```
- [ ] Test unauthenticated access → redirect to /admin/login
- [ ] Test authenticated access → allow through
- [ ] Add redirect URL preservation (returnUrl query param)

### Task 4: Admin Dashboard Landing Page (AC: #1.2.2)
- [ ] Create admin dashboard: `app/admin/page.tsx` (server component)
- [ ] Display welcome message with admin name (from session)
- [ ] Add navigation links to:
  - Guest List (/admin/guests)
  - CSV Import (/admin/guests/import)
  - Check-in Log (/admin/checkin-log - placeholder Epic 3)
  - Tables Management (/admin/tables - placeholder Epic 4)
- [ ] Add logout button (signOut() from next-auth/react)
- [ ] Show current session info (email, role)

### Task 5: Session Type Definitions & Utilities (AC: #1.2.2)
- [ ] Extend NextAuth session type in `types/next-auth.d.ts`:
  ```typescript
  import { UserRole } from '@prisma/client';

  declare module 'next-auth' {
    interface Session {
      user: {
        id: number;
        email: string;
        name: string;
        role: UserRole;
      };
    }
    interface User {
      id: number;
      role: UserRole;
    }
  }
  ```
- [ ] Create session utility: `lib/auth/session.ts`
  - getServerSession() wrapper for server components
  - requireAuth() helper (throw redirect if unauthenticated)
- [ ] Create client hook: `hooks/useSession.ts` (wrapper for next-auth/react useSession)

### Task 6: Error Handling & Rate Limiting (AC: #1.2.4)
- [ ] Implement rate limiting in authorize() callback:
  - Track failed login attempts (in-memory or Redis - MVP: in-memory Map)
  - Max 5 attempts per email in 5-minute window
  - Return error: "Too many login attempts, try again later"
- [ ] Add error handling in login form:
  - Display user-friendly error messages
  - Clear password field on error
  - Log failed attempts to console (dev only)
- [ ] Add CSRF protection (NextAuth.js built-in)

### Task 7: E2E & Integration Testing (AC: All)
- [ ] Write Playwright E2E test: `tests/e2e/admin-login.spec.ts`
  - Test successful login flow (admin@ceogala.test)
  - Test redirect to /admin dashboard
  - Test invalid credentials error
  - Test unauthenticated /admin access redirect
  - Test logout flow
- [ ] Write integration test for NextAuth API: `tests/integration/auth-api.test.ts`
  - Mock Prisma user lookup
  - Test bcrypt password verification
  - Test session cookie creation
- [ ] Manual testing checklist:
  - [ ] Mobile responsive (iPhone 12, iPad)
  - [ ] Keyboard navigation (Tab order, Enter to submit)
  - [ ] Screen reader accessibility (NVDA/VoiceOver)
  - [ ] Cross-browser (Chrome, Firefox, Safari)

---

## Dev Notes

### Architecture Patterns

**NextAuth.js Credentials Provider Pattern:**
- `app/api/auth/[...nextauth]/route.ts` - Single file exports GET + POST handlers
- Credentials provider requires custom authorize() callback
- Session stored as JWT (stateless, no database storage)
- Middleware automatically protects routes based on matcher config

**Password Security:**
- bcrypt cost factor: 12 (OWASP recommendation, ~250ms hash time)
- Password hashing done in seed script (not in this story)
- Verification: `bcrypt.compare(plainPassword, hashedPassword)`

**Session Management:**
- JWT strategy (default NextAuth.js behavior)
- Payload: { user: { id, email, name, role }, iat, exp }
- Expiry: 24 hours inactivity (session.maxAge: 86400)
- Refresh: Automatic on page load (NextAuth.js middleware)

**Route Protection:**
- Middleware runs before every request to /admin/*
- Redirects to /admin/login?callbackUrl=/admin/... if unauthenticated
- getServerSession() in server components for user data
- useSession() in client components for reactive session state

### Source Tree Components to Touch

**New Files:**
```
app/
├── (auth)/
│   └── admin/
│       └── login/
│           └── page.tsx          # Login form (Client Component)
├── admin/
│   └── page.tsx                  # Dashboard landing (Server Component)
└── api/
    └── auth/
        └── [...nextauth]/
            └── route.ts          # NextAuth.js config

middleware.ts                     # Route protection

lib/
└── auth/
    └── session.ts               # Session utilities

types/
└── next-auth.d.ts               # NextAuth type extensions

hooks/
└── useSession.ts                # Client session hook
```

**Modified Files:**
```
.env.local                       # Add NEXTAUTH_SECRET, NEXTAUTH_URL
package.json                     # Add next-auth, bcryptjs dependencies
tsconfig.json                    # Ensure types/ directory included
```

**Database Schema (Already Exists - Story 1.1):**
```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique @db.VarChar(255)
  password_hash String    @db.VarChar(255)  // bcrypt cost=12
  name          String    @db.VarChar(255)
  role          UserRole  @default(staff)   // admin, staff
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
}

enum UserRole {
  admin
  staff
}
```

**Seed Data (Already Exists - Story 1.1):**
```typescript
// prisma/seed.ts (existing)
const adminUsers = [
  {
    email: 'admin@ceogala.test',
    password: 'Admin123!',  // bcrypt hash: $2b$12$...
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'janos@ceogala.test',
    password: 'Admin456!',  // bcrypt hash: $2b$12$...
    name: 'János Admin',
    role: 'admin'
  }
];
```

### Testing Standards Summary

**E2E Test Coverage (Playwright):**
- ✅ Happy path: valid credentials → /admin dashboard
- ✅ Error path: invalid credentials → error message
- ✅ Route protection: /admin/* unauthenticated → /admin/login redirect
- ✅ Logout flow: signOut() → redirect to /admin/login
- ✅ Session persistence: page reload maintains session

**Integration Test Coverage (Vitest):**
- ✅ NextAuth authorize() callback with Prisma mock
- ✅ bcrypt password verification (correct + incorrect)
- ✅ Rate limiting logic (5 attempts, 5-minute window)
- ✅ Session cookie configuration

**Manual Test Checklist:**
- [ ] Mobile responsive design (touch targets 44x44px)
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader accessibility (ARIA labels, roles)
- [ ] Cross-browser compatibility (Chrome 90+, Firefox 88+, Safari 14+)
- [ ] Performance (login response < 500ms)

### References

**NextAuth.js Documentation:**
- Credentials Provider: https://next-auth.js.org/providers/credentials
- Middleware: https://next-auth.js.org/configuration/nextjs#middleware
- Session Management: https://next-auth.js.org/configuration/options#session

**Tech Stack Docs:**
- bcryptjs: https://github.com/dcodeIO/bcrypt.js
- Prisma Client: https://www.prisma.io/docs/concepts/components/prisma-client

**FUNKCIONALIS-KOVETELMENY.md Sections:**
- FR-2.7.2: Admin Dashboard Requirements
- Section 3.1: Security Requirements (password hashing, session management)

**Epic 1 Tech Context:**
- [tech-spec-epic-1.md](./tech-spec-epic-1.md) - Section "APIs and Interfaces" (Authentication)
- [tech-spec-epic-1.md](./tech-spec-epic-1.md) - Section "Security" (Admin Session)

---

## Dev Agent Record

### Context Reference
- Epic: Epic 1 - Core Registration (MVP)
- Story Dependencies: Story 1.1 (database + seed script)
- Epic Tech Context: [tech-spec-epic-1.md](./tech-spec-epic-1.md)
- Functional Requirements: [FUNKCIONALIS-KOVETELMENY.md](../FUNKCIONALIS-KOVETELMENY.md)
- Story Context File: [1-2-admin-authentication-session-management.context.xml](./1-2-admin-authentication-session-management.context.xml)

### Agent Model Used
_To be filled by DEV agent during implementation_

### Debug Log References
_To be filled by DEV agent during implementation_

### Completion Notes List
_To be filled by DEV agent after Story Done_

**Example completion notes structure:**
- [ ] New patterns/services created (e.g., session.ts utilities, middleware pattern)
- [ ] Architectural deviations (e.g., JWT vs database sessions decision)
- [ ] Technical debt deferred (e.g., rate limiting Redis integration)
- [ ] Learnings for next stories (e.g., NextAuth v4 quirks, bcrypt performance)

### File List

**NEW FILES (To be created):**
```
app/(auth)/admin/login/page.tsx
app/admin/page.tsx
app/api/auth/[...nextauth]/route.ts
middleware.ts
lib/auth/session.ts
types/next-auth.d.ts
hooks/useSession.ts
tests/e2e/admin-login.spec.ts
tests/integration/auth-api.test.ts
```

**MODIFIED FILES:**
```
.env.local
package.json
```

**DELETED FILES:**
```
(none)
```

---

**Status:** drafted
**Next Step:** Load SM agent and move to `ready-for-dev` after review, then run `story-context` workflow before implementation.
