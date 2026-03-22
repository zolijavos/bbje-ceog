# Komponens Inventár - CEO Gala Regisztrációs Rendszer

**Generálva:** 2026-02-15
**Utolsó frissítés:** 2026-03-22
**Keretrendszer:** React 18 + Next.js 14 (App Router)

---

## Áttekintés

A projekt ~90+ React komponenst tartalmaz, amelyek Server és Client komponensekre oszlanak. Az alábbi kategóriákba sorolhatók:

| Kategória | Darabszám | Típus |
|-----------|-----------|-------|
| **Globális** | 5 | Layout, Footer, Providers, Theme |
| **Admin Dashboard** | 25+ | CRUD, szűrők, modálok, navigáció |
| **Ültetés (Seating)** | 12 | DnD, Konva canvas, chips, keresés, szűrők |
| **Live Display** | 3 | Ültetési kijelző, SSE, háttérkép overlay |
| **Regisztráció** | 10+ | Formok, welcome, error, success |
| **PWA** | 15+ | Dashboard, ticket, profil, UI kit |
| **Check-in** | 2 | QR szkenner, layout |
| **Egyéb oldalak** | 5+ | Státusz, help, terms, privacy |

## Globális Komponensek (app/components/)

| Komponens | Fájl | Típus | Leírás |
|-----------|------|-------|--------|
| **GlobalProviders** | GlobalProviders.tsx | Client | App-szintű provider-ek (Theme, Session) |
| **ThemeProvider** | ThemeProvider.tsx | Client | Dark/Light mód Context |
| **ThemeToggle** | ThemeToggle.tsx | Client | Téma váltó gomb |
| **Footer** | Footer.tsx | Server | Desktop lábléc |
| **MobileFooter** | MobileFooter.tsx | Client | Mobil lábléc + MyForge Labs branding |

## Admin Dashboard Komponensek

### Navigáció & Layout

| Komponens | Fájl | Leírás |
|-----------|------|--------|
| **AdminHeader** | admin/AdminHeader.tsx | Desktop dropdown navigáció (Dashboard, Guests, Event, Comms, System) |
| **MobileTabBar** | admin/components/MobileTabBar.tsx | Mobil 5-tab navigáció (Guests, Tables, Email, Checkin, Applicants) |
| **PageHeader** | admin/components/PageHeader.tsx | Oldalfejléc + breadcrumb |
| **LanguageToggle** | admin/components/LanguageToggle.tsx | HU/EN nyelv váltó |
| **AdminThemeToggle** | admin/components/AdminThemeToggle.tsx | Admin dark mode |
| **Providers** | admin/Providers.tsx | Admin Context provider-ek (Language) |
| **DashboardContent** | admin/DashboardContent.tsx | Fő dashboard tartalom (statisztikák) |

### Vendég Kezelés (admin/guests/)

| Komponens | Fájl | Leírás |
|-----------|------|--------|
| **GuestList** | guests/GuestList.tsx | Fő vendéglista táblázat + szűrők + bulk műveletek |
| **GuestFormModal** | guests/GuestFormModal.tsx | Vendég létrehozás/szerkesztés form |
| **GuestFilters** | guests/components/GuestFilters.tsx | Kategória/státusz/asztal szűrők |
| **GuestPagination** | guests/components/GuestPagination.tsx | Lapozás |
| **GuestBulkActions** | guests/components/GuestBulkActions.tsx | Tömeges műveletek (email, törlés) |
| **Notification** | guests/components/Notification.tsx | Toast értesítés |
| **DeleteConfirmModal** | guests/DeleteConfirmModal.tsx | Törlés megerősítő modál |
| **EmailPreviewModal** | guests/EmailPreviewModal.tsx | Email előnézet modál |
| **PaymentApprovalModal** | guests/PaymentApprovalModal.tsx | Banki fizetés jóváhagyás |
| **ImportForm** | guests/import/ImportForm.tsx | CSV import form (PapaParse) |

**Custom Hook:** `useGuestList.ts` - Vendéglista state management (fetch, filter, paginate, sort)

### Ültetési Rend (admin/seating/)

| Komponens | Fájl | Leírás |
|-----------|------|--------|
| **SeatingDashboard** | seating/SeatingDashboard.tsx | **REDESIGN:** Fő ültetés felület, dual-mód (Grid + Floor Plan), keresés, szűrők, összenyitás/összecsukás, DnD |
| **UnassignedPanel** | seating/components/UnassignedPanel.tsx | Bal oldali sidebar, nem ültetett vendégek típus szerinti csoportosítással (VIP, Invited, Paying Single, Paying Paired) |
| **DroppableTable** | seating/components/DroppableTable.tsx | **REDESIGN:** @dnd-kit asztal cél terület, kapacitás progress bar, szín-kódolás, összenyitás/összecsukás, hover tooltip, inline szerkesztő modál, regisztrációs státusz pontok |
| **GuestChip** | seating/components/GuestChip.tsx | **REDESIGN:** Vendég chip — státusz pont, VIP badge, típus badge, keresési kiemelés |
| **PairedGuestChip** | seating/components/PairedGuestChip.tsx | **ÚJ:** Páros vendég chip — dupla vendég megjelenítés, összekötő ikon, „2 seats" lila badge |
| **SeatingSearchBar** | seating/components/SeatingSearchBar.tsx | **ÚJ:** Globális keresés, találat szám, törlés gomb, i18n támogatás |
| **SeatingFilters** | seating/components/SeatingFilters.tsx | **ÚJ:** Szűrő chip-ek (All/Available/Full/Empty), rendezés dropdown, Expand/Collapse All |
| **FloorPlanEditor** | seating/components/FloorPlanEditor.tsx | **REDESIGN:** Alaprajz szerkesztő — szoba konfiguráció panel, export (PNG/PDF jsPDF-en keresztül), auto-arrange, jelmagyarázat |
| **FloorPlanCanvas** | seating/components/FloorPlanCanvas.tsx | **REDESIGN:** React-Konva canvas — asztalok húzása, átméretezés, zoom/pan, heatmap overlay, spotlight keresés, szín-kódolás |
| **DraggableGuest** | seating/components/DraggableGuest.tsx | @dnd-kit húzható vendég elem (useSortable wrapper), GuestChip vagy PairedGuestChip renderelés |

**Típusdefiníciók:** `seating/types.ts` — Guest, Assignment, TableData, DraggableGuest, STATUS_DOT_COLORS

**Custom Hook:** `useSeatingDnd.ts` — DnD state management: activeGuest, sourceContainerId, assign/unassign/move műveletek

### Check-in Napló (admin/checkin-log/)

| Komponens | Fájl | Leírás |
|-----------|------|--------|
| **CheckinLogDashboard** | checkin-log/CheckinLogDashboard.tsx | Valós idejű check-in napló, lapozás, szűrők, keresés, CSV export |

### Egyéb Admin Oldalak

| Komponens | Fájl | Leírás |
|-----------|------|--------|
| **ApplicantList** | applicants/ApplicantList.tsx | Jelentkezők approve/reject |
| **AuditLogList** | audit-log/AuditLogList.tsx | Szűrhető audit napló |
| **PaymentsDashboard** | payments/PaymentsDashboard.tsx | Fizetések kezelése |
| **TablesDashboard** | tables/TablesDashboard.tsx | Asztal CRUD |
| **UsersDashboard** | users/UsersDashboard.tsx | Admin felhasználók |
| **EmailLogsDashboard** | email-logs/EmailLogsDashboard.tsx | Email napló |
| **EmailTemplatesDashboard** | email-templates/EmailTemplatesDashboard.tsx | Email sablonok szerkesztése |
| **ScheduledEmailsDashboard** | scheduled-emails/ScheduledEmailsDashboard.tsx | Ütemezett emailek |
| **StatisticsContent** | statistics/StatisticsContent.tsx | Dashboard statisztikák |

## Live Seating Display (app/display/)

Élő ültetési kijelző — teljes képernyős nézet, valós idejű SSE frissítéssel.

| Komponens | Fájl | Típus | Leírás |
|-----------|------|-------|--------|
| **DisplayLayout** | display/layout.tsx | Server | Display layout — elrejti a globális lábléceket a teljes képernyős megjelenítéshez |
| **SeatingPage** | display/seating/page.tsx | Server | Szerver komponens, admin-only hitelesítés |
| **SeatingDisplay** | display/seating/SeatingDisplay.tsx | Client | **ÚJ:** SSE stream listener (EventSource), 24 asztal pozíció, check-in számláló, háttérkép overlay |

## Regisztrációs Komponensek (app/register/)

| Komponens | Fájl | Leírás |
|-----------|------|--------|
| **RegisterWelcome** | RegisterWelcome.tsx | Üdvözlő képernyő (magic link validálás) |
| **RegisterError** | RegisterError.tsx | Hibakezelő (lejárt/érvénytelen link) |
| **VIPConfirmation** | vip/VIPConfirmation.tsx | VIP regisztráció megerősítés |
| **AlreadyRegistered** | vip/AlreadyRegistered.tsx | Már regisztrált üzenet |
| **PaidRegistrationForm** | paid/PaidRegistrationForm.tsx | Fizető regisztráció form (billing + partner) |
| **BillingForm** | components/BillingForm.tsx | Számlázási adatok form |
| **ConsentCheckboxes** | components/ConsentCheckboxes.tsx | GDPR + lemondási feltételek |
| **GuestProfileFields** | components/GuestProfileFields.tsx | Profil mezők (title, phone, company, position) |
| **ThemeSwitcher** | components/ThemeSwitcher.tsx | Regisztráció téma váltó |
| **RequestLinkForm** | request-link/RequestLinkForm.tsx | Elveszett link kérés form |
| **SuccessContent** | success/SuccessContent.tsx | Sikeres regisztráció oldal |
| **DeclinedContent** | declined/DeclinedContent.tsx | Elutasított meghívás oldal |

## PWA Komponensek (app/pwa/)

### PWA UI Kit (app/pwa/components/ui/)

| Komponens | Fájl | Leírás |
|-----------|------|--------|
| **BottomSheet** | ui/BottomSheet.tsx | iOS-stílusú bottom sheet |
| **Button3D** | ui/Button3D.tsx | 3D hatású gomb |
| **Card** | ui/Card.tsx | Kártya komponens |
| **FlipClock** | ui/FlipClock.tsx | Flip-clock visszaszámláló |
| **Skeleton** | ui/Skeleton.tsx | Skeleton loader |
| **ThemeToggle** | ui/ThemeToggle.tsx | PWA téma váltó |
| **Toast** | ui/Toast.tsx | Toast értesítés |

### PWA Oldalak

| Komponens | Fájl | Leírás |
|-----------|------|--------|
| **WelcomeModal** | components/WelcomeModal.tsx | Üdvözlő modal (első belépés) |
| **ThemeProvider** | providers/ThemeProvider.tsx | PWA-specifikus téma Context |

### PWA Custom Hooks

| Hook | Fájl | Leírás |
|------|------|--------|
| **useHaptic** | hooks/useHaptic.ts | Haptikus visszajelzés (vibráció) |
| **useTheme** | hooks/useTheme.ts | Téma kezelés + localStorage |
| **useToast** | hooks/useToast.ts | Toast értesítések |

## Check-in Komponensek (app/checkin/)

| Komponens | Fájl | Leírás |
|-----------|------|--------|
| **CheckinScanner** | CheckinScanner.tsx | **REDESIGN:** CEO Gala sötétkék téma (#0a1628 + #d4af37 arany), 4 szín-kódolt kártya (ZÖLD/SÁRGA/PIROS/KÉK), VIP badge (arany), vendég infó doboz (asztal, étrend, partner), admin override, PWA install prompt |

## Szerviz Réteg (lib/services/)

| Szolgáltatás | Fájl | Leírás |
|--------------|------|--------|
| **EventBroadcaster** | lib/services/event-broadcaster.ts | **ÚJ:** In-memory pub/sub SSE eseményekhez (check-in broadcast) |
| **SeatingService** | lib/services/seating.ts | **BŐVÍTVE:** Asztal CRUD, ültetés hozzárendelés, auto-arrange, statisztikák |
| **CheckinService** | lib/services/checkin.ts | **BŐVÍTVE:** Check-in validálás + event broadcasting SSE-n keresztül |
| **EmailService** | lib/services/email.ts | Email küldés, retry logika, rate limiting, CID csatolmányok |
| **RegistrationService** | lib/services/registration.ts | Regisztráció feldolgozás |
| **RateLimitService** | lib/services/rate-limit.ts | IP/kulcs alapú rate limiting |
| **AuditService** | lib/services/audit.ts | Audit trail naplózás |
| **SchedulerService** | lib/services/scheduler.ts | Ütemezett email végrehajtás (node-cron) |

## State Management Összefoglaló

### React Context Provider-ek

| Context | Provider Fájl | Hook | Leírás |
|---------|---------------|------|--------|
| **Language** | lib/i18n/LanguageContext.tsx | `useLanguage()` | HU/EN fordítások |
| **Theme (Global)** | app/components/ThemeProvider.tsx | - | Dark/Light mód |
| **Theme (PWA)** | app/pwa/providers/ThemeProvider.tsx | `useTheme()` | PWA téma |
| **Session** | NextAuth SessionProvider | `useSession()` | Admin auth |
| **Admin Providers** | app/admin/Providers.tsx | - | Language + Theme wrapping |

### Custom Hook-ok

| Hook | Fájl | Leírás |
|------|------|--------|
| `useGuestList` | admin/guests/hooks/useGuestList.ts | Vendéglista CRUD, szűrés, lapozás |
| `useSeatingDnd` | admin/seating/hooks/useSeatingDnd.ts | @dnd-kit DnD state: activeGuest, sourceContainerId, assign/unassign/move |
| `useLanguage` | lib/i18n/LanguageContext.tsx | Nyelv váltás + t() fordító |
| `useTheme` | app/pwa/hooks/useTheme.ts | PWA téma + localStorage |
| `useToast` | app/pwa/hooks/useToast.ts | Toast értesítések |
| `useHaptic` | app/pwa/hooks/useHaptic.ts | Haptikus visszajelzés |

### localStorage Kulcsok

| Kulcs | Használat |
|-------|-----------|
| `admin-language` | Admin nyelv beállítás (hu/en) |
| `theme` / `pwa-theme` | Dark/Light mód |
| `ceog-guest-*` | PWA vendég adatok cache |
