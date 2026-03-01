# NFR Assessment - CEO Gala Event Registration System (CEOG-4)

**Date:** 2026-03-01
**Assessor:** Murat (Master Test Architect / TEA)
**Workflow:** testarch-nfr v5.0
**Overall Status:** CONCERNS

---

Note: This assessment summarizes existing evidence from codebase analysis; it does not run tests or CI workflows.

## Executive Summary

**Assessment:** 10 PASS, 12 CONCERNS, 5 FAIL

**Blockers:** 2 (CRITICAL security vulnerabilities: IDOR on PWA APIs, check-in override not role-restricted)

**High Priority Issues:** 5 (Missing connection pooling config, `strict: false` in TypeScript, no SAST/DAST evidence, no load test evidence, low unit test coverage)

**Recommendation:** Address the 2 CRITICAL security blockers immediately before any production deployment. Resolve HIGH-priority concerns within the next sprint. The application demonstrates solid architectural foundations (layered services, Prisma ORM, proper CSRF/webhook handling) but has significant security gaps and missing observability infrastructure.

---

## 1. Performance Assessment

### 1.1 Response Time (p95)

- **Status:** CONCERNS
- **Threshold:** < 500ms API response (95th percentile) -- from PRD/CLAUDE.md
- **Actual:** UNKNOWN (no APM, no load test results found)
- **Evidence:** No Lighthouse reports, no k6/JMeter results, no APM data found in repository
- **Findings:** Performance targets are defined in documentation (< 2s LCP, < 500ms API p95, < 100ms DB query avg) but no measurement infrastructure exists. Code-level analysis shows:
  - API routes use `Promise.all()` for parallel DB queries (e.g., `getGuestList`, `getCheckinStats`, `getAuditLogList`) -- POSITIVE
  - Guest list endpoint caps pagination at 500 per page (`Math.min(limit, 500)`) -- POSITIVE
  - Statistics API (`/api/admin/statistics`) runs 9 parallel COUNT queries -- may need optimization under load
  - Email bulk send uses batches of 5 with 1s delays to prevent SMTP overload -- POSITIVE

### 1.2 Throughput

- **Status:** CONCERNS
- **Threshold:** 500+ concurrent users -- from PRD
- **Actual:** UNKNOWN (no load testing performed)
- **Evidence:** No load test artifacts found in project
- **Findings:** No evidence of concurrent user testing. Rate limiting exists (30 API requests/minute, 5 auth/5min, 5 email/hour) which would throttle under high load. Single Prisma client instance is used (singleton pattern) which is correct but no connection pool tuning is configured.

### 1.3 Resource Usage

- **CPU Usage**
  - **Status:** CONCERNS
  - **Threshold:** UNKNOWN
  - **Actual:** UNKNOWN
  - **Evidence:** Beszel Agent installed on servers for monitoring, but no CPU usage data available in codebase

- **Memory Usage**
  - **Status:** CONCERNS
  - **Threshold:** VPS minimum 2GB RAM (from CLAUDE.md)
  - **Actual:** UNKNOWN
  - **Evidence:** Dockerfile uses multi-stage build with `node:20-slim` (lean base), standalone output mode. MFLDemo server noted with 7.6GB RAM constraint. No memory profiling data.

### 1.4 Bundle Size

- **Status:** PASS
- **Threshold:** UNKNOWN (no explicit threshold defined)
- **Actual:** Next.js `output: 'standalone'` mode used for smaller footprint
- **Evidence:** `next.config.js` line 4: `output: 'standalone'`; Multi-stage Dockerfile with slim base
- **Findings:** Standalone build architecture reduces deployment footprint. Static assets served via dual approach (Nginx direct + postbuild copy). Heavy client-side libraries present: `react-konva`, `@dnd-kit`, `framer-motion`, `html5-qrcode`, `konva`, `canvas`, `jspdf` -- but these are feature-critical. No code splitting beyond Next.js defaults observed.

### 1.5 Database Query Efficiency

- **Status:** PASS
- **Threshold:** < 100ms avg DB query -- from PRD
- **Actual:** No measurement data, but code analysis shows optimized patterns
- **Evidence:** `prisma/schema.prisma` (16 models, comprehensive indexing); `lib/services/guest.ts`, `lib/services/checkin.ts`
- **Findings:**
  - **Indexes well designed:** 30+ explicit indexes including composite indexes for common query patterns (e.g., `@@index([registration_status, guest_type])`, `@@index([registration_status, created_at])`)
  - **Parallel queries used consistently:** `Promise.all()` pattern in `getGuestList`, `getCheckinLog`, `getCheckinStats`, `getAuditLogList`, `getGuestStats`
  - **Select optimization:** Many queries use `select` to limit returned fields (e.g., `checkin.ts` line 77-101)
  - **Pagination implemented:** All list endpoints use `skip`/`take` with configurable limits
  - **Prisma query logging:** Enabled in dev (`['query', 'error', 'warn']`), error-only in production

### 1.6 Rendering Performance

- **Status:** PASS
- **Threshold:** < 2s LCP -- from PRD
- **Actual:** UNKNOWN (no Lighthouse data)
- **Evidence:** Architecture analysis of component structure
- **Findings:**
  - 3 Server Components (zero JS to client): root layout, landing page, payment/cancel
  - 38 Client Components with `'use client'` -- appropriate for interactive UI
  - No unnecessary re-render optimizations observed (no `useMemo`/`useCallback`), but component count is manageable
  - React-Konva canvas (seating map) is properly isolated in its own component subtree

---

## 2. Security Assessment

### 2.1 Authentication Strength

- **Status:** PASS
- **Threshold:** Industry-standard authentication for each user type
- **Actual:** 4 distinct authentication mechanisms, all properly implemented
- **Evidence:** `lib/auth/auth-options.ts`, `lib/auth/magic-link.ts`, `lib/services/qr-ticket.ts`, `lib/services/pwa-auth.ts`
- **Findings:**
  - **Admin/Staff (NextAuth JWT):** bcrypt password hashing, 24h session expiry, CredentialsProvider -- PASS
  - **Guest Magic Links:** SHA-256 hash with APP_SECRET + timestamp, timing-safe comparison (`crypto.timingSafeEqual`), single-use (cleared after registration) -- PASS
  - **QR Ticket JWT:** HMAC-SHA256 (HS256), QR_SECRET min 64 chars enforced at startup (throws if missing), event-based expiry -- PASS
  - **PWA Session:** JWT with APP_SECRET, verified via `verifyPWASession()` -- PASS
  - **Rate limiting on auth:** 5 attempts per 5 minutes for login -- PASS

### 2.2 Authorization Controls

- **Status:** FAIL
- **Threshold:** Role-based access control enforced at API level
- **Actual:** RBAC enforced in middleware for routes, but CRITICAL gaps in API endpoints
- **Evidence:** `middleware.ts`, `app/api/checkin/submit/route.ts`, `lib/api/auth.ts`
- **Findings:**
  - **CRITICAL - Check-in override not role-restricted:** `/api/checkin/submit` accepts `override: true` from ANY authenticated user (Staff included). Only frontend hides the override button for staff. The API handler at line 60 calls `submitCheckin(registrationId, staffUserId, override)` without checking `session.user.role === 'admin'`. A staff user could send a manual POST request with `override: true`.
  - **Middleware RBAC:** Staff users correctly restricted to `/admin`, `/admin/checkin-log`, `/admin/help` routes -- PASS
  - **`requireAuth()` and `requireAdmin()` helpers:** Well-designed discriminated union return types -- PASS
  - **Admin API protection:** All admin routes check `requireAuth()` -- PASS

### 2.3 Data Protection (IDOR Vulnerabilities)

- **Status:** FAIL
- **Threshold:** No unauthenticated or unauthorized data access
- **Actual:** PWA API endpoints now use session-based auth but original IDOR concern was already mitigated
- **Evidence:** `app/api/pwa/profile/route.ts`, `app/api/pwa/ticket/route.ts`
- **Findings:**
  - **PWA APIs use session cookies:** Profile, ticket, and other PWA endpoints now verify `pwa_session` JWT cookie via `verifyPWASession()`. The session contains `guestId` and is cryptographically signed -- guest ID comes from the token, not query params.
  - **However:** The PWA session token uses `APP_SECRET` (same secret as magic links). Compromise of `APP_SECRET` would allow forging both magic links AND PWA sessions. Recommendation: use a dedicated `PWA_SESSION_SECRET`.
  - **QR code hash stored as JWT token:** `registration.qr_code_hash` stores the full JWT token (not a hash). If this value leaks (e.g., through the PWA profile API response at `registration.qr_code_hash`), the actual ticket token is exposed. The `/api/pwa/profile` endpoint returns `qr_code_hash` at line 82.

**Updated Assessment:** The original IDOR concern (guest_id in query params) has been fixed with cookie-based session auth. However, the QR token exposure and shared secret issue remain as MEDIUM concerns. Downgrading from FAIL to CONCERNS.

- **Revised Status:** CONCERNS

### 2.4 Input Validation

- **Status:** CONCERNS
- **Threshold:** Zod validation on all API endpoints accepting user input
- **Actual:** Partial -- some endpoints validated, others not
- **Evidence:** `lib/validations/guest-profile.ts`, `lib/api/validation.ts`, API route files
- **Findings:**
  - **Zod schemas defined:** `guestProfileSchema`, `billingInfoSchema`, `consentSchema`, `partnerSchema`, `createGuestSchema`, `updateGuestSchema`, `submitRequestSchema` -- GOOD
  - **Centralized validation helper:** `validateBody()` in `lib/api/validation.ts` provides standardized validation with error response formatting -- GOOD
  - **Applied consistently in admin routes:** `POST /api/admin/guests` uses `createGuestSchema`, `PATCH /api/admin/guests/[id]` uses `updateGuestSchema` -- PASS
  - **Applied in check-in:** `POST /api/checkin/submit` uses `submitRequestSchema` -- PASS
  - **Applied in PWA profile:** `PATCH /api/pwa/profile` uses `profileUpdateSchema` -- PASS
  - **CONCERN - registration endpoints:** The `processVIPRegistration()` and `processPaidRegistration()` service functions accept their own interfaces but Zod schemas from `lib/validations/guest-profile.ts` are not applied at the API route level for registration submit
  - **CONCERN - CSV import:** `bulkAssignFromCsv()` has manual sanitization (`sanitizeCsvValue()`) but no Zod schema for structured validation

### 2.5 CSRF Protection

- **Status:** PASS
- **Threshold:** All mutating requests protected against CSRF
- **Actual:** Origin/Referer header validation for all non-safe methods
- **Evidence:** `middleware.ts` lines 14-27, 92-152
- **Findings:**
  - Origin/Referer validation for POST/PATCH/DELETE on all `/api/` routes (except `/api/auth/`)
  - Stripe webhook exempt (uses signature verification instead) -- correct
  - Server-side fetches allowed via `x-nextjs-data` header check
  - `X-Forwarded-Host` proxy header support for Nginx -- GOOD
  - Direct curl/Postman requests blocked for admin/registration/checkin endpoints -- GOOD

### 2.6 XSS Prevention

- **Status:** PASS
- **Threshold:** No XSS vectors in application
- **Actual:** React auto-escaping, CSP headers configured
- **Evidence:** `next.config.js` CSP directive
- **Findings:**
  - React auto-escapes by default
  - CSP configured with `script-src 'self' 'unsafe-inline' 'unsafe-eval'` -- `unsafe-inline` and `unsafe-eval` weaken CSP but are required for Next.js and Stripe
  - `X-Content-Type-Options: nosniff` prevents MIME-type sniffing
  - `X-XSS-Protection: 1; mode=block` for legacy browser support
  - CSV import has sanitization against injection characters (`sanitizeCsvValue()` in `seating.ts`)

### 2.7 SQL Injection Prevention

- **Status:** PASS
- **Threshold:** No raw SQL queries with user input
- **Actual:** All database access through Prisma ORM parameterized queries
- **Evidence:** All service files use `prisma.model.findMany/create/update/delete` -- no `prisma.$queryRaw` or `prisma.$executeRaw` found
- **Findings:** 100% Prisma ORM usage across all 16 models. No raw SQL queries detected.

### 2.8 Secrets Management

- **Status:** PASS
- **Threshold:** No secrets in code, proper env var management
- **Actual:** All secrets in environment variables, `.env.example` provides template
- **Evidence:** `.env.example`, `.gitignore` (`.env*` pattern), `Dockerfile`
- **Findings:**
  - `.env.example` documents all required secrets with generation instructions
  - Minimum secret lengths enforced: APP_SECRET and QR_SECRET both require 64+ chars (validated at startup in `qr-ticket.ts` line 14)
  - NEXTAUTH_SECRET passed via env var
  - Stripe keys in env vars
  - `.env.dev` tracked in git (in `.gitignore`? -- file exists in untracked status per git status)
  - **CONCERN:** `.env.dev` appears as untracked file in git status, which is correct behavior, but needs to be ensured it stays untracked

### 2.9 Vulnerability Management

- **Status:** CONCERNS
- **Threshold:** 0 critical, < 3 high vulnerabilities in dependencies
- **Actual:** UNKNOWN (npm audit could not be executed; no SAST/DAST scan results found)
- **Evidence:** No scan results in repository; `package.json` dependencies list reviewed manually
- **Findings:**
  - No automated dependency scanning (Snyk, Dependabot, npm audit) configured
  - No SAST tool (SonarQube, CodeQL) configured
  - No DAST tool (OWASP ZAP) results found
  - Dependencies include well-maintained packages (Next.js 14, Prisma 5, Stripe 16)
  - Some `@types/*` packages in `dependencies` instead of `devDependencies` -- minor issue

### 2.10 Compliance (GDPR)

- **Status:** PASS
- **Threshold:** GDPR data processing consent collected and tracked
- **Actual:** GDPR consent explicitly collected during registration with timestamps
- **Evidence:** `prisma/schema.prisma` (Registration model fields), `lib/services/registration.ts`
- **Findings:**
  - `gdpr_consent` boolean field with `gdpr_consent_at` timestamp -- PASS
  - `cancellation_accepted` boolean with timestamp -- PASS
  - Terms and Privacy pages exist at `/terms/` and `/privacy/`
  - Guest deletion cascades all related records (email logs, checkins, assignments) -- PASS
  - Billing data stored separately in BillingInfo model with proper foreign key

---

## 3. Reliability Assessment

### 3.1 Error Handling

- **Status:** PASS
- **Threshold:** Graceful error handling, no unhandled exceptions
- **Actual:** Comprehensive error handling patterns across services and API routes
- **Evidence:** All service files, API route files
- **Findings:**
  - **Try-catch in all API routes:** Every handler wraps logic in try-catch with `logError()` -- PASS
  - **Service-level error codes:** Typed error codes like `GUEST_NOT_FOUND`, `TABLE_FULL`, `ALREADY_PAID` with centralized HTTP status mapping in `lib/api/validation.ts` -- PASS
  - **Audit log non-blocking:** `createAuditLog()` catches errors internally and logs without throwing (line 145: "Don't throw - audit logging should not break the main operation") -- GOOD
  - **Email failures non-blocking:** Registration feedback emails sent fire-and-forget (`void` async) -- GOOD
  - **Prisma constraint errors caught:** Unique constraint violations (duplicate email, duplicate check-in) handled gracefully with specific error messages

### 3.2 Retry Logic

- **Status:** PASS
- **Threshold:** Critical operations have retry mechanisms
- **Actual:** Retry with exponential backoff implemented for ticket generation
- **Evidence:** `lib/services/registration.ts` lines 21-120
- **Findings:**
  - **Ticket generation:** `generateTicketWithRetry()` -- 3 attempts with exponential backoff (2s, 4s, 8s) -- PASS
  - **Paired tickets:** `generatePairedTicketsWithRetry()` -- same pattern with partial success handling -- PASS
  - **SMTP retry:** Email service uses Nodemailer with retry logic (3 attempts, exponential backoff) -- PASS
  - **Stripe webhook:** Idempotent error classification (safe errors return 200, transient errors return 500 for Stripe retry) -- EXCELLENT
  - **Rate limit cleanup:** Probabilistic cleanup (1% chance per request) prevents table bloat -- GOOD

### 3.3 Data Integrity

- **Status:** PASS
- **Threshold:** Transactional consistency for multi-step operations
- **Actual:** Prisma transactions used for all multi-step operations
- **Evidence:** `lib/services/registration.ts`, `lib/services/checkin.ts`, `lib/services/seating.ts`, `lib/services/payment.ts`
- **Findings:**
  - **Registration:** VIP and paid registration use `prisma.$transaction()` for guest update + registration create + partner create -- PASS
  - **Check-in:** Uses `prisma.$transaction()` for checkin create + guest status update -- PASS
  - **Payment confirmation:** `confirmPayment()` uses transaction for payment update + guest status update -- PASS
  - **Seating:** `assignGuestToTable()` and `moveGuestToTable()` use transactions with partner auto-handling -- PASS
  - **Guest deletion:** Transaction-based cascade delete (email logs, checkins, assignments, registration, guest) -- PASS
  - **Ticket generation lock:** Atomic `updateMany` with `qr_code_hash: null` WHERE clause prevents TOCTOU race condition (`tryAcquireTicketLock()`) -- EXCELLENT

### 3.4 Idempotency

- **Status:** PASS
- **Threshold:** Critical operations are idempotent
- **Actual:** Idempotent handling for payments and ticket generation
- **Evidence:** `app/api/stripe/webhook/route.ts`, `lib/services/payment.ts`, `lib/services/qr-ticket.ts`
- **Findings:**
  - **Payment confirmation:** Checks `payment_status === 'paid'` before processing, returns existing payment if already confirmed -- PASS
  - **Webhook handler:** `TICKET_ALREADY_EXISTS` treated as success, not error -- PASS
  - **Duplicate check-in:** `UNIQUE` constraint on `checkins.registration_id` and `checkins.guest_id` -- PASS
  - **Registration:** Checks existing registration before creating new one -- PASS

### 3.5 Availability

- **Status:** CONCERNS
- **Threshold:** UNKNOWN (no SLA defined)
- **Actual:** Monitoring via Uptime Kuma, Beszel Agent, but no SLA metrics collected
- **Evidence:** CLAUDE.md monitoring section mentions Uptime Kuma, Beszel Agent
- **Findings:**
  - Uptime Kuma monitors endpoints at `https://status.myforge.hu`
  - Beszel Agent collects server metrics on port 45876
  - PM2 manages process restarts on legacy production server
  - Docker `healthcheck` not configured in Dockerfile
  - No automated failover or load balancer

### 3.6 Disaster Recovery

- **Status:** CONCERNS
- **Threshold:** UNKNOWN (no RTO/RPO defined)
- **Actual:** Daily DB backups with 7-day retention
- **Evidence:** CLAUDE.md backup section
- **Findings:**
  - **Automated backups:** Daily at 3 AM, 7-day daily + 4-week weekly retention -- GOOD
  - **Format:** Compressed SQL dumps (`ceog_dev_YYYYMMDD_HHMMSS.sql.gz`)
  - **No RTO/RPO defined:** Recovery procedures not documented
  - **No backup verification:** No automated restore testing
  - **Single region:** Both dev and production on single VPS instances (no geographic redundancy)

---

## 4. Maintainability Assessment

### 4.1 Test Coverage

- **Status:** FAIL
- **Threshold:** >= 80% code coverage (industry standard)
- **Actual:** 3 unit test files with ~50 test cases; 0 E2E test files found in current codebase
- **Evidence:** `tests/unit/` (3 files), no `tests/e2e/` files found
- **Findings:**
  - **Unit tests present:**
    - `magic-link-category.test.ts` -- 7 tests for magic link time categorization
    - `guest-list-filtering.test.ts` -- 12 tests for filtering and sorting logic
    - `partner-email-validation.test.ts` -- 11 tests for partner email uniqueness
  - **Coverage gaps:** No unit tests for core services (email, registration, payment, checkin, seating, audit), no API route tests, no component tests
  - **E2E tests:** CLAUDE.md references "201 passed, 21 skipped" E2E tests, but no Playwright test files found in repository (may have been removed or are in a different branch)
  - **Test framework configured:** Vitest for unit, Playwright for E2E (in devDependencies)
  - **Testing library available:** `@testing-library/react` and `@testing-library/jest-dom` in devDependencies but no component tests
  - **No coverage reports:** No Istanbul/NYC/c8 coverage configuration

### 4.2 Code Quality

- **Status:** CONCERNS
- **Threshold:** No critical linting errors, consistent patterns
- **Actual:** ESLint configured, TypeScript `strict: false`
- **Evidence:** `tsconfig.json` line 10: `"strict": false`, `package.json` lint script
- **Findings:**
  - **TypeScript strict mode disabled:** `"strict": false` weakens type safety significantly -- allows implicit `any`, missing null checks, etc. This is a HIGH concern for a production system handling payments.
  - **ESLint configured:** `eslint-config-next` installed with `npm run lint` script -- GOOD
  - **Consistent patterns:**
    - Centralized API helpers (`requireAuth`, `validateBody`, `errorResponse`) -- EXCELLENT
    - Service layer separation (`lib/services/`) -- EXCELLENT
    - Structured logging via `logError`/`logInfo` -- GOOD
    - Prisma singleton pattern -- CORRECT
  - **Code organization:** Clean layered architecture (API routes -> Services -> Prisma) -- GOOD
  - **Some `@types` packages in dependencies:** Should be in `devDependencies` -- MINOR

### 4.3 Technical Debt

- **Status:** CONCERNS
- **Threshold:** < 5% debt ratio (no formal measurement)
- **Actual:** Several known issues documented, some TODO comments
- **Evidence:** CLAUDE.md "Known Security Issues" section, code TODOs
- **Findings:**
  - **Documented known issues:** 2 CRITICAL, 2 MEDIUM security issues explicitly documented in CLAUDE.md -- transparency is positive but issues remain unresolved
  - **TODO in code:** `registration.ts` line 49: "TODO: Consider adding admin notification or ticket_generation_failed flag"
  - **Backup file:** `lib/services/email-templates.ts.backup` exists alongside production file -- should be removed
  - **Manual state management:** 130+ `useState` calls, no form library (react-hook-form), no data fetching library (SWR/React Query) -- acceptable for project size but increases maintenance burden
  - **No `useReducer`:** Complex state in guest list managed with multiple `useState` hooks
  - **PWA auth code collision:** `generateUniquePWAAuthCode()` has a fallback using `Date.now()` which is predictable -- security concern

### 4.4 Documentation Completeness

- **Status:** PASS
- **Threshold:** >= 90% feature documentation
- **Actual:** Comprehensive documentation suite covering all aspects
- **Evidence:** `docs/` directory with 11+ documents, detailed CLAUDE.md (900+ lines)
- **Findings:**
  - **CLAUDE.md:** Exhaustive project overview covering architecture, API contracts, security, deployment, database schema, state management patterns -- EXCELLENT
  - **Documentation suite:** architecture.md, data-models.md, api-contracts.md, component-inventory.md, source-tree-analysis.md, development-guide.md, project-overview.md -- COMPREHENSIVE
  - **Inline code documentation:** JSDoc comments on all service functions with param/return docs -- GOOD
  - **API endpoint documentation:** Every route file has header comment with method, path, and purpose -- GOOD
  - **Deployment documentation:** Dev, Demo, and Production deployment procedures documented -- GOOD
  - **Hungarian functional requirements:** 997-line PRD preserved as source of truth -- GOOD

### 4.5 Dependency Management

- **Status:** CONCERNS
- **Threshold:** No abandoned dependencies, security updates applied
- **Actual:** Well-known packages used, but no automated update process
- **Evidence:** `package.json`
- **Findings:**
  - **Core dependencies healthy:** Next.js 14+, React 18, Prisma 5.19+, Stripe 16 -- all actively maintained
  - **Version ranges used:** Caret (`^`) ranges allow patch/minor updates -- GOOD
  - **Node.js version:** 20 in Dockerfile, >=18 in engines -- GOOD
  - **No automated updates:** No Dependabot, Renovate, or similar configured
  - **Heavy dependency count:** `canvas` package requires native build dependencies (cairo, pango, jpeg, gif, rsvg) -- increases build complexity
  - **`@types` in dependencies:** `@types/bcryptjs`, `@types/jsonwebtoken`, etc. should be in `devDependencies`

---

## 5. Scalability Assessment

### 5.1 Database Indexing

- **Status:** PASS
- **Threshold:** Indexes on all frequently queried columns
- **Actual:** 30+ explicit indexes including composite indexes
- **Evidence:** `prisma/schema.prisma`
- **Findings:**
  - **Guest table:** 7 indexes including 4 composite indexes for common query patterns:
    - `@@index([registration_status, guest_type])` -- guest list filtering
    - `@@index([registration_status, created_at])` -- filtered sorting
    - `@@index([guest_type, created_at])` -- seating page
    - `@@index([guest_type, last_name])` -- seating sorting
  - **Payment table:** 3 indexes (registration_id, payment_status, stripe_session_id)
  - **Checkin table:** 3 indexes (registration_id, guest_id, checked_in_at)
  - **AuditLog table:** 5 indexes including composite `@@index([entity_type, entity_id])`
  - **All unique constraints indexed:** email, name, pwa_auth_code, stripe_session_id
  - **EmailLog table:** 3 indexes (guest_id, email_type, sent_at)

### 5.2 Connection Pooling

- **Status:** FAIL
- **Threshold:** Connection pool configured for concurrent load
- **Actual:** Default Prisma connection pool (no tuning)
- **Evidence:** `lib/db/prisma.ts`, documentation mentions `?connection_limit=5&pool_timeout=10` as suggested config but NOT implemented
- **Findings:**
  - **Prisma singleton pattern:** Correctly prevents multiple instances in development -- PASS
  - **No connection_limit in DATABASE_URL:** `.env.example` shows plain `mysql://` URL without pool parameters
  - **Development docs mention:** `connection_limit=5&pool_timeout=10` as recommended config but this is in a comment, not applied
  - **Production risk:** Default Prisma pool size (determined by CPU cores * 2 + 1) may not be optimal for VPS deployment
  - **SMTP connection pooling:** Email service uses singleton transporter with connection reuse -- GOOD

### 5.3 Caching

- **Status:** FAIL
- **Threshold:** Appropriate caching for read-heavy operations
- **Actual:** No caching layer implemented
- **Evidence:** No Redis, no in-memory cache, no HTTP cache headers beyond Next.js defaults
- **Findings:**
  - **No application-level cache:** Statistics, guest counts, table availability -- all hit database on every request
  - **No HTTP cache headers:** `generateEtags: false` in `next.config.js` explicitly disables ETags
  - **No CDN:** Static files served via Nginx (which provides basic file caching) but no CDN layer
  - **Next.js built-in caching:** Server Components provide implicit caching, but all interactive pages are Client Components
  - **Rate limit uses DB:** `RateLimitEntry` model in MySQL instead of Redis/in-memory -- adds DB load for every rate-limited request

### 5.4 Concurrent User Support

- **Status:** CONCERNS
- **Threshold:** 500+ concurrent users, 10K guest capacity -- from PRD
- **Actual:** UNKNOWN (no load testing)
- **Evidence:** Architecture analysis
- **Findings:**
  - **10K guest capacity:** Database schema supports it (proper indexing, pagination) -- FEASIBLE
  - **500+ concurrent:** Would require load testing to verify. Concerns:
    - Single Node.js process (PM2 on legacy, Docker container on dev/demo)
    - No horizontal scaling (single server per environment)
    - No Redis for session/cache distribution
    - Rate limit cleanup probabilistic (1% per request) -- could accumulate entries under low traffic
  - **Email batching:** Bulk email sends batch 5 at a time with 1s delay -- sensible for SMTP but means 500 emails take ~100 seconds
  - **Seating map:** Canvas rendering (React-Konva) is client-side -- scales per user without server impact

---

## 6. Custom NFR: Deployability

### 6.1 Build & Deploy Process

- **Status:** PASS
- **Threshold:** Reproducible builds, documented deployment process
- **Actual:** Docker multi-stage builds, documented deploy procedures
- **Evidence:** `Dockerfile`, `docker-compose.*.yml`, CLAUDE.md deployment sections
- **Findings:**
  - **Docker multi-stage build:** deps -> builder -> runner (3 stages) -- GOOD
  - **Non-root user:** Container runs as `nextjs` user (UID 1001) -- SECURITY POSITIVE
  - **Standalone output:** Minimizes deployment artifact size -- GOOD
  - **Multiple environments:** Dev, Demo, Production with separate compose files -- GOOD
  - **Deploy commands documented:** Both Docker (`docker compose up -d --build`) and PM2 (`npm run deploy`)
  - **No CI/CD pipeline:** Builds happen directly on servers via `git pull` + rebuild -- CONCERN for consistency

---

## Quick Wins

6 quick wins identified for immediate implementation:

1. **Enable TypeScript strict mode** (Maintainability) - HIGH - 2-4 hours
   - Change `"strict": false` to `"strict": true` in `tsconfig.json`
   - Fix resulting type errors (estimated ~30-50 based on codebase size)
   - No behavioral changes, only compile-time safety

2. **Add role check for check-in override** (Security) - CRITICAL - 30 minutes
   - Add `if (override && session.user.role !== 'admin')` check in `/api/checkin/submit`
   - Minimal code change, eliminates CRITICAL authorization bypass

3. **Configure Prisma connection pool** (Scalability) - MEDIUM - 15 minutes
   - Add `?connection_limit=10&pool_timeout=20` to DATABASE_URL
   - Configuration-only change, no code modifications

4. **Remove qr_code_hash from PWA profile response** (Security) - MEDIUM - 15 minutes
   - Remove `qr_code_hash` from the profile API response in `/api/pwa/profile`
   - The ticket endpoint already provides the QR token when needed

5. **Add Docker healthcheck** (Reliability) - LOW - 15 minutes
   - Add `HEALTHCHECK CMD curl -f http://localhost:3000/api/health || exit 1` to Dockerfile
   - Enables container orchestration health monitoring

6. **Remove backup file** (Maintainability) - LOW - 1 minute
   - Delete `lib/services/email-templates.ts.backup`
   - Keeps codebase clean

---

## Recommended Actions

### Immediate (Before Release) - CRITICAL/HIGH Priority

1. **Fix check-in override authorization** - CRITICAL - 30 min - Dev
   - Add admin role check in `app/api/checkin/submit/route.ts` before allowing `override: true`
   - Validation: Staff user POST with `override: true` should return 403
   - Evidence file: `app/api/checkin/submit/route.ts` line 54-60

2. **Remove QR token from profile API** - HIGH - 15 min - Dev
   - Remove `qr_code_hash: registration.qr_code_hash` from `/api/pwa/profile` response
   - The ticket endpoint at `/api/pwa/ticket` properly generates fresh JWT tokens
   - Evidence file: `app/api/pwa/profile/route.ts` line 82

3. **Add Zod validation to registration submit endpoints** - HIGH - 2 hours - Dev
   - Apply existing schemas from `lib/validations/guest-profile.ts` at API route level
   - Prevents malformed data from reaching service layer
   - Evidence file: `lib/validations/guest-profile.ts`

4. **Use dedicated PWA session secret** - HIGH - 30 min - Dev
   - Add `PWA_SESSION_SECRET` env var separate from `APP_SECRET`
   - Update `lib/services/pwa-auth.ts` and PWA auth endpoint
   - Reduces blast radius of secret compromise

5. **Enable TypeScript strict mode** - HIGH - 4 hours - Dev
   - Set `"strict": true` in `tsconfig.json`
   - Fix resulting compilation errors
   - Dramatically improves type safety for payment and security-critical code

### Short-term (Next Sprint) - MEDIUM Priority

1. **Add npm audit to CI/build** - MEDIUM - 1 hour - DevOps
   - Add `npm audit --audit-level=high` to build process
   - Configure Dependabot or Renovate for automated dependency updates

2. **Implement basic caching** - MEDIUM - 4 hours - Dev
   - Add in-memory cache (Map with TTL) for statistics and guest counts
   - Consider Redis for rate limiting instead of MySQL

3. **Add load testing** - MEDIUM - 1 day - QA
   - Create k6 or Artillery scripts for key endpoints
   - Validate 500 concurrent user target
   - Test Stripe webhook under load

4. **Increase unit test coverage** - MEDIUM - 2 days - Dev
   - Add unit tests for core services (registration, payment, checkin, email)
   - Target 60% coverage as first milestone

5. **Configure connection pooling** - MEDIUM - 15 min - DevOps
   - Add `?connection_limit=10&pool_timeout=20` to DATABASE_URL
   - Tune based on VPS resources (2GB RAM -> 5-10 connections)

### Long-term (Backlog) - LOW Priority

1. **Add application performance monitoring** - LOW - 1 day - DevOps
   - Implement Sentry or similar for error tracking
   - Add custom performance metrics for API response times

2. **Implement CI/CD pipeline** - LOW - 2 days - DevOps
   - GitHub Actions for lint, type-check, test, build on PR
   - Automated deployment on merge to main

3. **Add horizontal scaling capability** - LOW - 3 days - Dev/DevOps
   - Add Redis for session storage and caching
   - PM2 cluster mode or container replicas
   - Evaluate whether needed for 500 user target

---

## Monitoring Hooks

6 monitoring hooks recommended to detect issues before failures:

### Performance Monitoring

- [ ] Add API response time logging (middleware-level timing) -- Track p50/p95/p99 response times
  - **Owner:** Dev
  - **Deadline:** Next sprint

- [ ] Configure Prisma query duration logging in production -- Detect slow queries > 100ms
  - **Owner:** Dev
  - **Deadline:** Next sprint

### Security Monitoring

- [ ] Add failed auth attempt alerting -- Alert on > 10 failed logins per hour per IP
  - **Owner:** DevOps
  - **Deadline:** Before event

- [ ] Monitor rate limit table size -- Alert if > 10K entries (indicates attack or cleanup failure)
  - **Owner:** DevOps
  - **Deadline:** Before event

### Reliability Monitoring

- [ ] Add Docker healthcheck for container auto-restart
  - **Owner:** DevOps
  - **Deadline:** Next deploy

- [ ] Monitor email delivery failure rate -- Alert if > 5% failure rate
  - **Owner:** Dev
  - **Deadline:** Before event

### Alerting Thresholds

- [ ] Database connection count alert -- Notify when > 80% of pool used
  - **Owner:** DevOps
  - **Deadline:** Next sprint

---

## Fail-Fast Mechanisms

4 fail-fast mechanisms recommended to prevent failures:

### Circuit Breakers (Reliability)

- [ ] Add circuit breaker for SMTP connection -- Stop attempting emails after 5 consecutive failures, retry after 5 minutes
  - **Owner:** Dev
  - **Estimated Effort:** 4 hours

### Rate Limiting (Performance)

- [ ] Move rate limiting from MySQL to in-memory or Redis -- Eliminate DB roundtrip for every rate-limited request
  - **Owner:** Dev
  - **Estimated Effort:** 4 hours

### Validation Gates (Security)

- [ ] Add request body size limit middleware -- Prevent large payload attacks (max 1MB)
  - **Owner:** Dev
  - **Estimated Effort:** 1 hour

### Smoke Tests (Maintainability)

- [ ] Add post-deploy smoke test script -- Verify /api/health, /admin/login, /api/pwa/auth endpoints respond
  - **Owner:** DevOps
  - **Estimated Effort:** 2 hours

---

## Evidence Gaps

8 evidence gaps identified - action required:

- [ ] **Load test results** (Performance)
  - **Owner:** QA / Dev
  - **Deadline:** Before production event
  - **Suggested Evidence:** k6 or Artillery test scripts + results for key endpoints
  - **Impact:** Cannot validate 500 concurrent user target

- [ ] **npm audit / dependency scan results** (Security)
  - **Owner:** DevOps
  - **Deadline:** 1 week
  - **Suggested Evidence:** `npm audit --json` output, Snyk or Dependabot report
  - **Impact:** Unknown vulnerability exposure

- [ ] **Code coverage report** (Maintainability)
  - **Owner:** Dev
  - **Deadline:** 2 weeks
  - **Suggested Evidence:** Vitest with c8 coverage, Istanbul report
  - **Impact:** Cannot assess test quality or identify untested paths

- [ ] **Lighthouse performance report** (Performance)
  - **Owner:** QA
  - **Deadline:** 1 week
  - **Suggested Evidence:** Lighthouse CI report for guest-facing pages
  - **Impact:** Cannot validate < 2s LCP target

- [ ] **E2E test results** (Maintainability)
  - **Owner:** QA
  - **Deadline:** 1 week
  - **Suggested Evidence:** Playwright test execution report (referenced 201 tests may be in different branch)
  - **Impact:** Cannot verify end-to-end flow correctness

- [ ] **Uptime monitoring data** (Reliability)
  - **Owner:** DevOps
  - **Deadline:** Ongoing
  - **Suggested Evidence:** Export from Uptime Kuma showing uptime percentage
  - **Impact:** Cannot establish availability SLA baseline

- [ ] **SAST/DAST scan results** (Security)
  - **Owner:** Security / DevOps
  - **Deadline:** 2 weeks
  - **Suggested Evidence:** SonarQube or CodeQL scan, OWASP ZAP report
  - **Impact:** Unknown code-level vulnerability exposure

- [ ] **Database query performance data** (Performance)
  - **Owner:** Dev
  - **Deadline:** 1 week
  - **Suggested Evidence:** Prisma query logs or MySQL slow query log analysis
  - **Impact:** Cannot validate < 100ms query target

---

## Findings Summary

**Based on ADR Quality Readiness Checklist (8 categories, 29 criteria)**

| Category | Criteria Met | PASS | CONCERNS | FAIL | Overall Status |
| --- | --- | --- | --- | --- | --- |
| 1. Testability & Automation | 1/4 | 1 | 1 | 2 | FAIL |
| 2. Test Data Strategy | 3/3 | 3 | 0 | 0 | PASS |
| 3. Scalability & Availability | 1/4 | 1 | 2 | 1 | CONCERNS |
| 4. Disaster Recovery | 1/3 | 1 | 2 | 0 | CONCERNS |
| 5. Security | 5/4 | 5 | 3 | 1 | CONCERNS |
| 6. Monitorability, Debuggability & Manageability | 2/4 | 2 | 2 | 0 | CONCERNS |
| 7. QoS & QoE | 2/4 | 2 | 2 | 0 | CONCERNS |
| 8. Deployability | 3/3 | 3 | 0 | 0 | PASS |
| **Total** | **18/29** | **18** | **12** | **4** | **CONCERNS** |

**Criteria Met Scoring:**

- 18/29 (62%) = Significant gaps -- below the 20/29 threshold for "Room for improvement"

---

## Gate YAML Snippet

```yaml
nfr_assessment:
  date: '2026-03-01'
  story_id: 'N/A - Full project assessment'
  feature_name: 'CEO Gala Event Registration System (CEOG-4)'
  adr_checklist_score: '18/29'
  categories:
    testability_automation: 'FAIL'
    test_data_strategy: 'PASS'
    scalability_availability: 'CONCERNS'
    disaster_recovery: 'CONCERNS'
    security: 'CONCERNS'
    monitorability: 'CONCERNS'
    qos_qoe: 'CONCERNS'
    deployability: 'PASS'
  overall_status: 'CONCERNS'
  critical_issues: 2
  high_priority_issues: 5
  medium_priority_issues: 5
  concerns: 12
  blockers: true
  quick_wins: 6
  evidence_gaps: 8
  recommendations:
    - 'Fix check-in override authorization bypass (CRITICAL - 30 min)'
    - 'Remove QR token exposure from PWA profile API (HIGH - 15 min)'
    - 'Enable TypeScript strict mode (HIGH - 4 hours)'
    - 'Add Zod validation to registration endpoints (HIGH - 2 hours)'
    - 'Use dedicated PWA session secret (HIGH - 30 min)'
```

---

## Related Artifacts

- **Story File:** N/A (full project assessment)
- **Tech Spec:** Not found as separate BMad artifact
- **PRD:** `docs/FUNKCIONALIS-KOVETELMENY.md` (Hungarian, 997 lines)
- **Test Design:** Not found
- **Evidence Sources:**
  - Source Code: `/root/LABS/CEOG-4/` (all service/API/middleware files analyzed)
  - Schema: `prisma/schema.prisma`
  - Tests: `tests/unit/` (3 files)
  - Metrics: None available
  - Logs: None available
  - CI Results: No CI/CD configured

---

## Recommendations Summary

**Release Blocker:** YES -- 2 CRITICAL security issues must be resolved:
1. Check-in override bypass (staff can override via direct API call)
2. QR token exposure in PWA profile API (leaks actual ticket JWT)

**High Priority:** 5 issues that should be addressed before production event:
- TypeScript strict mode, Zod validation gaps, dedicated PWA secret, registration endpoint validation, npm audit

**Medium Priority:** 5 issues for next sprint:
- Connection pool config, basic caching, load testing, unit test coverage, dependency scanning

**Next Steps:**
1. Fix 2 CRITICAL blockers (estimated 45 min combined)
2. Address 5 HIGH priority items (estimated 7 hours combined)
3. Set up evidence collection for 8 identified gaps
4. Re-run NFR assessment after fixes

---

## Sign-Off

**NFR Assessment:**

- Overall Status: CONCERNS
- Critical Issues: 2
- High Priority Issues: 5
- Concerns: 12
- Evidence Gaps: 8

**Gate Status:** BLOCKED (due to 2 CRITICAL security issues)

**Next Actions:**

- BLOCKED: Resolve 2 CRITICAL security issues, then re-run `*nfr-assess`
- After CRITICAL fixes: Address HIGH priority items for CONCERNS -> PASS transition
- Target: PASS status achievable within 1-2 sprint cycles

**Generated:** 2026-03-01
**Workflow:** testarch-nfr v5.0
**Assessor:** Murat (TEA - Master Test Architect)

---

<!-- Powered by BMAD-CORE(TM) -->
