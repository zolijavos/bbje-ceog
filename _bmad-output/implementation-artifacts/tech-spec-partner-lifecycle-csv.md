---
title: 'Partner Lifecycle Management + CSV Seating Partner-Awareness'
slug: 'partner-lifecycle-csv'
created: '2026-03-23'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js 14', 'Prisma ORM', 'MySQL 8', 'TypeScript', 'React 18', 'Tailwind CSS']
files_to_modify: ['lib/services/partner.ts (NEW)', 'lib/services/seating.ts', 'lib/services/audit.ts', 'app/api/admin/guests/[id]/partner/route.ts (NEW)', 'app/admin/guests/GuestFormModal.tsx', 'app/admin/guests/RemovePartnerModal.tsx (NEW)', 'app/admin/guests/ChangePartnerModal.tsx (NEW)', 'lib/i18n/translations.ts']
code_patterns: ['Prisma $transaction for cascade operations', 'getPartnerGuestId() bidirectional partner lookup', 'assignGuestToTable() auto-partner assignment', 'removeGuestFromTable() auto-partner removal', 'createAuditLog() non-throwing audit pattern', 'processVIPRegistration() partner Guest creation pattern']
test_patterns: ['Vitest unit tests in tests/unit/', 'Playwright E2E in tests/e2e/']
---

# Tech-Spec: Partner Lifecycle Management + CSV Seating Partner-Awareness

**Created:** 2026-03-23

## Overview

### Problem Statement

Az admin felületen jelenleg nincs lehetőség partner törlésére vagy cseréjére invited vendégeknél. Ha egy partner lemondja a részvételt, az admin nem tudja eltávolítani a rendszerből — manuális DB módosítás kell. Emellett a seating CSV exportból nem derül ki, ki kinek a partnere, ami az ülésrend kézi szerkesztésekor hibákhoz vezethet (pl. párok szétválasztása különböző asztalokhoz).

### Solution

Három összefüggő feature egyben:
1. **Partner törlés** — Admin eltávolíthatja a partnert (cascade: Guest, Registration, TableAssignment, EmailLog). Az ülőhely felszabadul.
2. **Partner csere** — Admin lecseréli a partnert egy másik személyre. Régi partner törlés + új partner létrehozás és linkelés, automatikus ültetés a fő vendég asztalához.
3. **CSV seating export/import bővítés** — `partner_of_email` oszlop hozzáadása az exporthoz, hogy az admin lássa a partner kapcsolatokat. Import: duplikáció-kezelés ha mindkét fél szerepel a CSV-ben.

### Scope

**In Scope:**
- Partner törlés API endpoint + admin UI gomb/modal
- Partner csere API endpoint + admin UI form/modal
- CSV export `partner_of_email` oszlop
- CSV import duplikáció-kezelés (skip already assigned partner)
- Közös service layer (`lib/services/partner.ts`)
- Audit log mindkét művelethez
- i18n (HU/EN) az összes új UI elemhez

**Out of Scope:**
- `paying_paired` / `paying_single` guest_type váltás (nincs paying vendég)
- Vendég oldali partner kezelés (PWA-ból vagy regisztrációs linkről)
- Partner email értesítés törléskor (admin manuálisan intézi)
- Meglévő partner-change spec (`docs/specs/PARTNER-CHANGE-FEATURE-SPEC.md`) — ez a spec azt felváltja

## Context for Development

### Codebase Patterns

- **Partner reláció**: `Guest.paired_with_id` (UNIQUE, nullable) — partner rekordnál a fő vendég ID-ja, fő vendégnél `null`. Inverz: `Guest.partner_of` relation.
- **Partner lookup**: `getPartnerGuestId(guestId)` helper (`seating.ts:260-282`) — bidirektionális, mindkét irányból megtalálja a partnert.
- **Cascade minta**: `prisma.$transaction()` — assign/remove/move mindig tranzakcióban, partner automatikusan kezelve.
- **Audit pattern**: `createAuditLog()` (`audit.ts:120-149`) — nem dob hibát, session-ből veszi a user-t, `AuditAction` union type.
- **Partner Guest létrehozás**: `processVIPRegistration()` (`registration.ts:305-381`) — Guest + Registration + PWA auth code, `paired_with_id` linkelés tranzakcióban.
- **GuestFormModal partner szekció**: Háromféle megjelenítés:
  - `partnerGuest` objektum → linked partner (read-only, purple box, 530-588 sor)
  - `isPartner && pairedWith` → ez a vendég partner (blue box, 592-607 sor)
  - `partner_name && !partnerGuest` → legacy Registration adat (disabled inputs, 611-641 sor)

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `prisma/schema.prisma:40-45` | Guest partner reláció (paired_with_id, partner_of) |
| `lib/services/seating.ts:260-282` | `getPartnerGuestId()` — bidirektionális partner lookup |
| `lib/services/seating.ts:287-400` | `assignGuestToTable()` — auto partner assign |
| `lib/services/seating.ts:405-454` | `removeGuestFromTable()` — auto partner remove |
| `lib/services/seating.ts:889-925` | `exportSeatingArrangement()` — CSV export |
| `lib/services/seating.ts:790-880` | `bulkAssignFromCsv()` — CSV import |
| `lib/services/audit.ts:12-25` | `AuditAction` type definíció |
| `lib/services/audit.ts:120-149` | `createAuditLog()` — audit log minta |
| `lib/services/registration.ts:305-381` | Partner Guest létrehozás minta (VIP flow) |
| `app/admin/guests/GuestFormModal.tsx:529-642` | Partner szekciók (3 variáció) |
| `app/api/admin/guests/[id]/route.ts` | Meglévő guest CRUD — auth, response pattern |
| `lib/i18n/translations.ts:254,300,815` | Meglévő partner fordítási kulcsok |

### Technical Decisions

- Invited vendégek partnere a `Guest.paired_with_id` relációval van linkelve (nem guest_type alapján)
- A partner is saját Guest + Registration + QR kódot kap (nem csak adat a fő vendég Registration-jében)
- A seating service már automatikusan kezeli a partner párokat (assign/remove/move együtt)
- Közös service layer: partner törlés és csere 60%-ban átfed (cascade törlés logika közös)
- **Audit action**: Új `PARTNER_REMOVE` és `PARTNER_CHANGE` action-ök az `AuditAction` type-ba
- **API design**: Egy endpoint két action-nel: `POST /api/admin/guests/[id]/partner` body-ban `action: 'remove' | 'replace'`
- **CSV export**: `partner_of_email` oszlop hozzáadása — üres ha nem partner, fő vendég email-je ha partner
- **CSV import**: `assignGuestToTable()` már auto-assign-olja a partnert → ha a partner külön sorban is van, "already assigned" → skip (warning, nem error)

## Implementation Plan

### Tasks

- [x] Task 1: Partner service layer létrehozása
  - File: `lib/services/partner.ts` (NEW)
  - Action: Új service fájl a partner lifecycle logikával
  - Funkciók:
    - `validatePartnerAction(mainGuestId, action)` — ellenőrzi, hogy a fő vendégnek van-e partnere, partner nincs-e check-in-elve
    - `removePartner(mainGuestId)` — cascade törlés tranzakcióban:
      1. Partner `TableAssignment` törlése (ha van)
      2. Partner `Checkin` rekord ellenőrzés → ha van: BLOCK
      3. Partner `Registration` törlése
      4. Partner `EmailLog` rekordok törlése
      5. Fő vendég `Registration.partner_*` mezők nullázása
      6. Partner `Guest` rekord törlése
      7. Asztal státusz frissítése (`updateTableStatus`)
    - `replacePartner(mainGuestId, newPartnerData)` — `removePartner()` + új partner létrehozás:
      1. Régi partner `removePartner()` hívás
      2. Új Guest rekord létrehozása (`paired_with_id = mainGuestId`, PWA auth code generálás)
      3. Új Registration létrehozása
      4. Fő vendég `Registration.partner_*` mezők frissítése
      5. Automatikus ültetés fő vendég asztalához (ha van és van kapacitás) — `assignGuestToTable()` hívás
      6. QR kód generálás + ticket email küldés (async, `generatePairedTicketsWithRetry` minta)
  - Notes: A `processVIPRegistration()` partner létrehozás mintáját követi (`registration.ts:305-381`). Prisma `$transaction` az egész művelethez.

- [x] Task 2: Audit action típusok bővítése
  - File: `lib/services/audit.ts`
  - Action: `AuditAction` type bővítése: `| 'PARTNER_REMOVE' | 'PARTNER_CHANGE'`
  - Notes: Nincs más módosítás — a `createAuditLog()` generikus, az új action-ök automatikusan működnek.

- [x] Task 3: Partner API endpoint
  - File: `app/api/admin/guests/[id]/partner/route.ts` (NEW)
  - Action: `POST` handler a partner műveletekhez
  - Request body:
    ```typescript
    // Partner törlés
    { action: 'remove' }
    // Partner csere
    { action: 'replace', partner: { first_name, last_name, email, title?, phone?, company?, position?, dietary_requirements? } }
    ```
  - Validációk:
    - Admin session ellenőrzés (NextAuth `getServerSession`)
    - Fő vendég létezik és van partnere
    - `replace` esetén: partner email ≠ fő vendég email, partner email nem másik vendég partnere, partner GDPR consent
    - Partner nincs check-in-elve (ha igen: 409 Conflict)
  - Response: `{ success: true, removedPartner: { id, name, email }, newPartner?: { id, name, email }, tableAssignment?: { tableName } }`
  - Error response: `{ success: false, error: string, code: string }`
  - Notes: Auth minta a meglévő `app/api/admin/guests/[id]/route.ts`-ből. Audit log hívás a service layer-ben.

- [x] Task 4: CSV export partner oszlop
  - File: `lib/services/seating.ts` — `exportSeatingArrangement()` (889-925 sor)
  - Action: `partner_of_email` oszlop hozzáadása
  - Módosítások:
    1. Query bővítése: `include: { guest: { select: { ..., paired_with_id: true, paired_with: { select: { email: true } } } } }`
    2. Header: `table_name,table_type,guest_first_name,guest_last_name,guest_email,guest_type,seat_number,partner_of_email`
    3. Row: partner vendégnél `a.guest.paired_with?.email || ''`, fő vendégnél üres string
  - Notes: A `partner_of_email` oszlop csak a partner sorában van kitöltve (a fő vendég email-jével). A fő vendég sorában üres. Ez egyértelmű: ha a mező nem üres, az a vendég partner.

- [x] Task 5: CSV import duplikáció-kezelés
  - File: `lib/services/seating.ts` — `bulkAssignFromCsv()` (790-880 sor)
  - Action: "Already assigned" hiba átminősítése warning-ra
  - Módosítás: Ha `assignGuestToTable()` dob "GUEST_ALREADY_ASSIGNED" hibát, azt `warnings` tömbbe gyűjtjük `errors` helyett. A response-ban megkülönböztetjük: `{ imported, errors, warnings }`.
  - Notes: Így ha a fő vendég auto-assign-olja a partnert, majd a partner sora is jön a CSV-ben, az nem error hanem warning lesz.

- [x] Task 6: i18n fordítások
  - File: `lib/i18n/translations.ts`
  - Action: Új kulcsok hozzáadása az EN és HU blokkhoz
  - Kulcsok:
    ```
    partnerSection.title / Partner kezelése
    partnerSection.removeButton / Partner törlése
    partnerSection.changeButton / Partner cseréje
    removePartner.title / Partner eltávolítása
    removePartner.warning / "{name}" törlésre kerül a rendszerből. Az ülőhelye felszabadul.
    removePartner.checkinBlocked / A partner már bejelentkezett, törlés nem lehetséges.
    removePartner.confirm / Törlés megerősítése
    removePartner.success / Partner sikeresen eltávolítva.
    changePartner.title / Partner cseréje
    changePartner.warning / A jelenlegi partner ({name}) törlésre kerül.
    changePartner.submitButton / Partner mentése és jegy küldése
    changePartner.success / Partner sikeresen cserélve. QR jegy elküldve: {email}
    changePartner.error.selfPairing / Nem adhatod meg saját magad partnerként
    changePartner.error.alreadyPartner / Ez a vendég már {name} partnere
    changePartner.error.checkinBlocked / A partner már bejelentkezett, csere nem lehetséges
    changePartner.firstName / Partner keresztnév
    changePartner.lastName / Partner vezetéknév
    changePartner.email / Partner email
    ```

- [x] Task 7: Partner törlés modal
  - File: `app/admin/guests/RemovePartnerModal.tsx` (NEW)
  - Action: Confirmation modal partner törléshez
  - UI elemek:
    - Figyelmeztető szöveg a partner nevével
    - Check-in blokkolás üzenet (ha releváns)
    - [Mégse] + [Törlés megerősítése] gombok
  - Fetch: `POST /api/admin/guests/[id]/partner` body `{ action: 'remove' }`
  - Success: Toast értesítés + GuestFormModal frissítés (parent `onSave` callback)
  - Notes: Tailwind modal minta a meglévő modal komponensekből (pl. GuestFormModal pattern)

- [x] Task 8: Partner csere modal
  - File: `app/admin/guests/ChangePartnerModal.tsx` (NEW)
  - Action: Form modal az új partner adatokkal
  - Form mezők: first_name (kötelező), last_name (kötelező), email (kötelező), title, phone, company, position, dietary_requirements
  - Figyelmeztető szöveg: jelenlegi partner törlésre kerül
  - Fetch: `POST /api/admin/guests/[id]/partner` body `{ action: 'replace', partner: { ... } }`
  - Validáció: email format, kötelező mezők frontend-en
  - Success: Toast értesítés + modal bezárás + GuestFormModal frissítés
  - Notes: Form minta a meglévő guest creation form-ból (GuestFormModal `mode === 'create'` ág)

- [x] Task 9: GuestFormModal partner szekció bővítése
  - File: `app/admin/guests/GuestFormModal.tsx` (529-588 sor módosítása)
  - Action: A meglévő read-only purple partner szekció bővítése két gombbal
  - Módosítások:
    1. Import: `RemovePartnerModal`, `ChangePartnerModal`
    2. State: `showRemovePartnerModal`, `showChangePartnerModal` (useState)
    3. A purple box-ba két gomb hozzáadása a "managed as separate guest" szöveg helyett:
       - `[Partner törlése]` — piros outline gomb → `RemovePartnerModal` megnyitás
       - `[Partner cseréje]` — lila outline gomb → `ChangePartnerModal` megnyitás
    4. Modal renderelés a komponens végén
    5. `onSave` callback továbbhívás modal success után (vendéglista frissítés)
  - Notes: A `useLanguage()` hook-ot használni az i18n kulcsokhoz. A gombok csak az `initialData?.partnerGuest` szekcióban jelennek meg (nem a legacy partner_name szekcióban).

### Acceptance Criteria

**Partner törlés:**
- [x] AC-1: Given egy fő vendég akinek van partnere és a partner nincs check-in-elve, when az admin rákattint a "Partner törlése" gombra és megerősíti, then a partner Guest + Registration + TableAssignment rekordok törlődnek, a fő vendég Registration.partner_* mezői nullázódnak, és az ülőhely felszabadul.
- [x] AC-2: Given egy fő vendég akinek a partnere már check-in-elve van, when az admin megpróbálja törölni a partnert, then a rendszer blokkolja a műveletet hibaüzenettel: "A partner már bejelentkezett, törlés nem lehetséges."
- [x] AC-3: Given egy sikeres partner törlés, when az admin megnézi az audit logot, then PARTNER_REMOVE bejegyzés látható a régi partner adataival.

**Partner csere:**
- [x] AC-4: Given egy fő vendég akinek van partnere, when az admin kitölti az új partner adatait és menti, then a régi partner törlődik, az új partner Guest + Registration rekord létrejön paired_with_id-vel linkelve, és az új partner automatikusan a fő vendég asztalához kerül (ha van hely).
- [x] AC-5: Given partner csere, when az új partner email megegyezik a fő vendég email-jével, then a rendszer elutasítja: "Nem adhatod meg saját magad partnerként."
- [x] AC-6: Given partner csere, when az új partner email már egy másik vendég partnereként szerepel, then a rendszer elutasítja: "Ez a vendég már [Név] partnere."
- [x] AC-7: Given sikeres partner csere, when az új partner email-jét ellenőrizzük, then QR ticket email automatikusan kiküldésre került.

**CSV export:**
- [x] AC-8: Given vendégek asztalhoz rendelve (köztük partner párok), when az admin exportálja a seating CSV-t, then a CSV tartalmaz `partner_of_email` oszlopot, ahol a partner sorában a fő vendég email-je szerepel, a fő vendég sorában pedig üres.

**CSV import:**
- [x] AC-9: Given egy CSV ahol a fő vendég és partnere is külön sorban szerepel ugyanahhoz az asztalhoz, when az admin importálja, then a fő vendég sikeresen hozzárendelődik (partnerével együtt auto-assign), és a partner sora warning-ként jelenik meg (nem error), az import összességében sikeres.

## Additional Context

### Dependencies

- Nincs új npm package szükséges
- Meglévő szolgáltatások:
  - `lib/services/seating.ts` — `assignGuestToTable()`, `removeGuestFromTable()`, `updateTableStatus()`
  - `lib/services/email.ts` — `generateAndSendTicket()`, `generateAndSendPairedTickets()`
  - `lib/services/audit.ts` — `createAuditLog()`
  - `lib/services/registration.ts` — `generateUniquePWAAuthCode()`
  - `lib/db/prisma.ts` — Prisma singleton

### Testing Strategy

**Unit tesztek** (`tests/unit/partner-service.test.ts`):
- `validatePartnerAction` — fő vendég nincs partnere → hiba
- `validatePartnerAction` — partner check-in-elve → blokkolás
- `removePartner` — cascade törlés (Guest, Registration, TableAssignment, EmailLog)
- `removePartner` — fő vendég Registration.partner_* nullázás
- `replacePartner` — régi törlés + új létrehozás
- `replacePartner` — auto ültetés fő vendég asztalához
- `replacePartner` — self-pairing blokkolás
- `replacePartner` — dupla partner blokkolás

**E2E tesztek** (`tests/e2e/admin-partner-lifecycle.spec.ts`):
- Partner törlés happy path (UI → API → DB ellenőrzés)
- Partner csere happy path (form kitöltés → success toast)
- Check-in blokkolás megjelenítés
- CSV export partner_of_email oszlop ellenőrzés

### Notes

- **Prisma onDelete: SetNull** — a `Guest.paired_with` reláción `onDelete: SetNull` van beállítva. A cascade törlést manuálisan kell megcsinálni a service-ben, mert a Prisma nem törli automatikusan a partner Registration-t és TableAssignment-jét.
- **Sorrend kritikus** — a törlési sorrend: TableAssignment → Checkin ellenőrzés → Registration → EmailLog → Guest.paired_with_id nullázás → Guest törlés. Ha a Guest-et először töröljük, a `paired_with_id` UNIQUE constraint hibát dob.
- **Legacy partner data** — a `Registration.partner_*` mezők redundánsak a külön Guest rekorddal, de megtartjuk backwards compatibility miatt. Partner törlésnél/cserénél ezeket is frissítjük.
- A régi spec (`docs/specs/PARTNER-CHANGE-FEATURE-SPEC.md`) `paying_paired`-re volt tervezve — ez a spec az invited-only kontextusra épül és felváltja azt.
- Party mode brainstorming eredménye: Winston, John, Amelia, Sally, Murat, Bob ágensek kollaborációja.
