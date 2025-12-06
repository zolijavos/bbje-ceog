# Epic 6: PWA - Vendég App (Progressive Web App)

**Prioritás:** 🔴 KRITIKUS
**Becsült idő:** 5-8 nap
**Készült:** 2025-12-03

---

## Epic Goal

Mobil-barát Progressive Web App létrehozása vendégek számára, ahol:
- QR kóddal vagy regisztrációs kóddal beléphetnek
- Megtekinthetik és szerkeszthetik profil adataikat
- Letölthetik/megtekinthetik a QR jegyüket (offline is!)
- Látják az asztalszámukat
- Push értesítéseket kaphatnak

## User Value

A vendégek mobilon kényelmesen elérhetik jegyüket és információikat, offline is működik a QR kód megjelenítése, és push értesítésekkel kaphatnak fontos információkat az eseményről.

---

## Technical Architecture

### Route Structure

```
app/
├── (pwa)/                      # PWA route group (no admin header)
│   ├── layout.tsx              # PWA-specific layout
│   ├── page.tsx                # PWA landing/login page
│   ├── dashboard/              # Guest dashboard (main screen)
│   │   └── page.tsx
│   ├── profile/                # Profile view/edit
│   │   └── page.tsx
│   └── ticket/                 # QR ticket display
│       └── page.tsx
├── api/
│   └── pwa/
│       ├── auth/route.ts       # QR/code-based authentication
│       ├── profile/route.ts    # Profile CRUD
│       └── push/route.ts       # Push token registration
```

### PWA Files

```
public/
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker
└── icons/
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

### Database Changes

```prisma
model Guest {
  // ... existing fields ...

  pwa_auth_code    String?   @unique @db.VarChar(20)  // PWA login code (e.g., "CEOG-ABC123")
  push_token       String?   @db.VarChar(500)          // Firebase FCM token
}
```

---

## Stories

### Story 6-1: PWA Basics (manifest, service worker, install prompt)

**As a** guest,
**I want** to install the CEO Gala app on my phone,
**So that** I can access it like a native app.

**Acceptance Criteria:**

**Given** I visit the PWA URL on a mobile device
**When** the page loads
**Then** I see an "Add to Home Screen" prompt (on supported browsers)

**And** the manifest.json defines:
- App name: "CEO Gála 2025"
- Short name: "CEO Gála"
- Theme color: #1e293b (slate-800)
- Background color: #ffffff
- Display: standalone
- Start URL: /pwa
- Icons: 72, 96, 128, 144, 152, 192, 384, 512px

**And** a service worker is registered for offline support

**Technical Notes:**
- Use `next-pwa` package or manual service worker
- manifest.json in /public
- Service worker caches: app shell, QR code images, profile data
- Install prompt: Use `beforeinstallprompt` event

---

### Story 6-2: QR-based Authentication

**As a** guest,
**I want** to log in by scanning my ticket QR code or entering a code,
**So that** I can access my profile without remembering a password.

**Acceptance Criteria:**

**Given** I am on the PWA login page
**When** I see the login options
**Then** I can either:
1. Scan my ticket QR code using the camera
2. Enter my registration code manually (e.g., "CEOG-ABC123")

**When** I scan a valid QR code (JWT from e-ticket)
**Then** the JWT is validated via `/api/pwa/auth`

**And** if valid, a PWA session is created (cookie or localStorage)

**And** I am redirected to `/pwa/dashboard`

**When** I enter a valid registration code
**Then** the code is validated against `guests.pwa_auth_code`

**And** if valid, session is created and I'm redirected

**When** validation fails
**Then** I see an error message: "Invalid QR code or registration code"

**Technical Notes:**
- QR scanner: `html5-qrcode` library (same as check-in)
- Auth endpoint: `POST /api/pwa/auth` with `{token: string}` or `{code: string}`
- Session: JWT stored in httpOnly cookie or localStorage with 30-day expiry
- Generate `pwa_auth_code` when ticket is issued (Story 2.3)

---

### Story 6-3: Guest Profile View & Edit

**As a** guest,
**I want** to view and edit my profile information,
**So that** I can update my dietary requirements or contact info.

**Acceptance Criteria:**

**Given** I am logged into the PWA
**When** I navigate to `/pwa/profile`
**Then** I see my current profile data:
- Name (read-only)
- Email (read-only)
- Phone (editable)
- Company (editable)
- Position (editable)
- Dietary requirements (editable)
- Seating preferences (editable)

**When** I edit a field and tap "Save"
**Then** the changes are saved via `PATCH /api/pwa/profile`

**And** I see a success message: "Profile updated"

**When** I have a partner (paired ticket)
**Then** I also see partner info section (read-only for now)

**Technical Notes:**
- API: `GET /api/pwa/profile` (fetch), `PATCH /api/pwa/profile` (update)
- Validation: Same Zod schemas as registration
- UI: Form with inline editing, mobile-optimized

---

### Story 6-4: QR Code Display (Offline Support)

**As a** guest,
**I want** to view my QR ticket even without internet,
**So that** I can enter the event even if my connection fails.

**Acceptance Criteria:**

**Given** I am logged into the PWA
**When** I navigate to `/pwa/ticket` or tap "My Ticket"
**Then** I see my QR code displayed large and centered

**And** below the QR code I see:
- My name
- Ticket type (VIP / Egyedi jegy / Páros jegy)
- Registration ID

**When** I tap "Save to Photos"
**Then** the QR code image is downloaded to my device

**When** I am offline
**Then** the QR code still displays from cached data

**And** I see an offline indicator: "Offline - QR saved locally"

**Technical Notes:**
- Cache QR code in service worker on first load
- Store QR data URL in IndexedDB as backup
- Download: Use `<a download>` with data URL or canvas.toBlob()
- Show cached version when offline (navigator.onLine check)

---

### Story 6-5: Table Number Display

**As a** guest,
**I want** to see my assigned table number,
**So that** I know where to sit at the event.

**Acceptance Criteria:**

**Given** I am logged into the PWA
**When** I am on the dashboard
**Then** I see my table assignment prominently:
- "Asztalszám: 17 (VIP)" if assigned
- "Asztal még nincs kiosztva" if not assigned

**When** I have a partner
**Then** I see confirmation that we're at the same table (or different if separated)

**Technical Notes:**
- Fetch from `/api/pwa/profile` includes table_assignment relation
- Display table name and type (VIP/Standard/Reserved)
- Cache table info for offline display

---

### Story 6-6: Firebase Push Notification Integration

**As an** admin,
**I want** to send push notifications to guests,
**So that** I can communicate important updates.

**Acceptance Criteria:**

**Given** a guest has installed the PWA
**When** they first open the app
**Then** they are prompted to allow notifications

**When** they allow notifications
**Then** a Firebase FCM token is generated

**And** the token is saved to `guests.push_token` via `POST /api/pwa/push`

**When** admin sends a notification (future story)
**Then** guests receive it on their device (even when app is closed)

**Technical Notes:**
- Firebase SDK: `firebase` npm package
- FCM setup: Firebase Console project, config in env vars
- Service worker handles background notifications
- Store token on backend for admin to send notifications

---

### Story 6-7: Offline Cache Strategy

**As a** guest,
**I want** the app to work offline,
**So that** I can access my ticket and info without internet.

**Acceptance Criteria:**

**Given** I have visited the PWA while online
**When** I go offline
**Then** I can still:
- View my QR ticket
- See my profile data
- See my table assignment

**And** I see an offline banner: "Offline mode - Some features unavailable"

**When** I come back online
**Then** the banner disappears

**And** any cached data is synced (if applicable)

**Technical Notes:**
- Service worker caches:
  - App shell (HTML, CSS, JS)
  - Profile data (JSON)
  - QR code image (data URL or image)
- Cache strategy: Network-first for fresh data, cache fallback
- IndexedDB for structured data backup
- Online/offline detection: `navigator.onLine` + event listeners

---

### Story 6-8: "Powered by MyForge Labs" Branding

**As a** business owner,
**I want** MyForge Labs branding on the PWA,
**So that** we get marketing exposure.

**Acceptance Criteria:**

**Given** the PWA is displayed
**When** I look at the footer
**Then** I see "Powered by MyForge Labs" with subtle styling

**And** the text links to myforgelabs.com (new tab)

**Technical Notes:**
- Footer component in PWA layout
- Subtle gray text, doesn't distract from main content
- Link: `<a href="https://myforgelabs.com" target="_blank" rel="noopener">`

---

## Implementation Order

1. **6-1**: PWA basics (foundation)
2. **6-2**: QR authentication (entry point)
3. **6-3**: Profile view/edit
4. **6-4**: QR display + offline
5. **6-5**: Table number
6. **6-7**: Offline strategy (enhancement)
7. **6-6**: Push notifications (optional if time-constrained)
8. **6-8**: Branding (quick)

---

## Environment Variables

```bash
# Firebase (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## UI Mockup Reference

See gap-fit-analysis-2025-12-03.md section 3 for ASCII mockups of:
- PWA main dashboard
- Login screen with QR scanner

---

*Document created by DEV agent - Ready for implementation*
