# Partner Csere Funkció - Technikai Specifikáció

**Verzió:** 1.0
**Dátum:** 2026-02-10
**Státusz:** Tervezés befejezve, implementációra vár
**Becsült effort:** 1.5-2 nap

---

## 1. Összefoglaló

Az admin felületen lehetőség a `paying_paired` típusú vendégek partnerének cseréjére. A régi partner törlésre kerül, az új partner regisztrálásra és automatikus jegy küldésre.

### 1.1 Döntések

| Kérdés | Döntés |
|--------|--------|
| Régi partner kezelése | **Teljes törlés** (cascade: Registration, TableAssignment, stb.) |
| Email régi partnernek | **Nincs** automatikus értesítés |
| Email új partnernek | **Van** - automatikus QR jegy küldés |
| Check-in ütközés | **Blokkolás** - ha régi partner már check-in volt, csere tiltva |
| Ültetés | **Automatikus** - új partner a fő vendég asztalához (ha van kapacitás) |

---

## 2. Validációs szabályok

### 2.1 Blokkolási feltételek

| Eset | Hibaüzenet | Hibakód |
|------|------------|---------|
| Fő vendég nem `paying_paired` | "Partner csere csak páros jegyes vendégeknél lehetséges" | `INVALID_GUEST_TYPE` |
| Régi partner már check-in volt | "A partner már bejelentkezett az eseményen, csere nem lehetséges" | `PARTNER_ALREADY_CHECKED_IN` |
| Új partner = fő vendég email | "Nem adhatod meg saját magad partnerként" | `SELF_PAIRING_NOT_ALLOWED` |
| Új partner = másik vendég partnere | "Ez a vendég már [Név] partnere" | `ALREADY_PARTNER_OF_OTHER` |
| Új partner = fő vendég saját partnerrel | "Ez a vendég saját páros jeggyel rendelkezik" | `GUEST_HAS_OWN_PARTNER` |
| Asztal kapacitás túllépés | Figyelmeztetés (nem blokk) | `TABLE_CAPACITY_WARNING` |

### 2.2 Engedélyezett esetek

| Eset | Viselkedés |
|------|------------|
| Új partner email nem létezik | Új Guest + Registration létrehozása |
| Új partner létezik, nincs párja, nincs regisztrációja | Meglévő Guest linkelése + Registration létrehozása |
| Új partner létezik, nincs párja, van regisztrációja | Meglévő Guest linkelése, meglévő Registration használata |

---

## 3. Adatbázis műveletek

### 3.1 Törlési sorrend (cascade)

```
1. Checkin rekord ellenőrzés → Ha van: BLOCK
2. TableAssignment törlése (régi partner)
3. Registration törlése (régi partner)
4. Guest törlése (régi partner)
   └── EmailLog rekordok törlődnek (cascade)
```

### 3.2 Létrehozási sorrend

```
1. Guest létrehozás VAGY linkelés (új partner)
   ├── paired_with_id = fő vendég ID
   ├── registration_status = 'registered'
   └── pwa_auth_code = generált kód
2. Registration létrehozás (ha még nincs)
   └── ticket_type = 'paid_paired'
3. TableAssignment létrehozás (fő vendég asztala, ha van kapacitás)
4. QR kód generálás + jegy email küldés (async)
5. Fő vendég Registration frissítése
   ├── partner_first_name
   ├── partner_last_name
   └── partner_email
6. AuditLog bejegyzés
```

---

## 4. API Specifikáció

### 4.1 Endpoint

```
POST /api/admin/guests/[id]/change-partner
```

### 4.2 Request Body

```typescript
interface ChangePartnerRequest {
  partner_first_name: string;      // Kötelező
  partner_last_name: string;       // Kötelező
  partner_email: string;           // Kötelező, email format
  partner_title?: string;          // Opcionális (Mr., Ms., Dr., stb.)
  partner_phone?: string;          // Opcionális
  partner_company?: string;        // Opcionális
  partner_position?: string;       // Opcionális
  partner_dietary_requirements?: string;  // Opcionális
}
```

### 4.3 Response - Sikeres (200)

```typescript
interface ChangePartnerSuccessResponse {
  success: true;
  oldPartner: {
    id: number;
    name: string;
    email: string;
    deleted: true;
  };
  newPartner: {
    id: number;
    name: string;
    email: string;
    isExistingGuest: boolean;  // true ha meglévő guest volt
  };
  tableAssignment: {
    tableId: number;
    tableName: string;
    seatNumber: number | null;
  } | null;  // null ha nincs hely vagy fő vendég nincs ültetve
  ticketSent: true;
  auditLogId: number;
}
```

### 4.4 Response - Hibák

```typescript
// 400 - Validációs hiba
interface ValidationErrorResponse {
  success: false;
  error: 'INVALID_GUEST_TYPE' | 'SELF_PAIRING_NOT_ALLOWED' |
         'ALREADY_PARTNER_OF_OTHER' | 'GUEST_HAS_OWN_PARTNER';
  message: string;  // Magyar nyelvű hibaüzenet
}

// 409 - Conflict (check-in blokk)
interface ConflictErrorResponse {
  success: false;
  error: 'PARTNER_ALREADY_CHECKED_IN';
  message: string;
  checkinDetails: {
    checkedInAt: string;  // ISO date
    staffName: string;
  };
}

// 404 - Vendég nem található
interface NotFoundErrorResponse {
  success: false;
  error: 'GUEST_NOT_FOUND';
  message: string;
}
```

---

## 5. Service Layer

### 5.1 Új fájl: `lib/services/partner.ts`

```typescript
// Fő függvények
export async function changePartner(
  mainGuestId: number,
  newPartnerData: ChangePartnerRequest
): Promise<ChangePartnerResult>;

export async function validatePartnerChange(
  mainGuestId: number,
  newPartnerEmail: string
): Promise<ValidationResult>;

// Belső helper függvények
async function deleteOldPartner(partnerId: number): Promise<void>;
async function createOrLinkNewPartner(
  mainGuestId: number,
  data: ChangePartnerRequest
): Promise<{ partnerId: number; isNew: boolean }>;
async function assignPartnerToTable(
  partnerId: number,
  mainGuestId: number
): Promise<TableAssignment | null>;
```

### 5.2 Audit Log Action

```typescript
// lib/services/audit.ts - új action típus
type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'APPROVE' | 'REJECT'
  | 'PARTNER_CHANGE';  // ← Új

// Audit log payload partner cserénél
{
  action: 'PARTNER_CHANGE',
  entityType: 'guest',
  entityId: mainGuestId,
  entityName: 'Fő vendég neve',
  oldValues: {
    partnerId: oldPartnerId,
    partnerName: 'Régi Partner Név',
    partnerEmail: 'regi@email.com'
  },
  newValues: {
    partnerId: newPartnerId,
    partnerName: 'Új Partner Név',
    partnerEmail: 'uj@email.com'
  }
}
```

---

## 6. Frontend Komponensek

### 6.1 Módosítandó fájlok

| Fájl | Változtatás |
|------|-------------|
| `app/admin/guests/GuestFormModal.tsx` | Partner szekció hozzáadása `paying_paired` vendégeknél |
| `lib/i18n/translations.ts` | HU/EN fordítások |

### 6.2 Új fájlok

| Fájl | Leírás |
|------|--------|
| `app/admin/guests/ChangePartnerModal.tsx` | Partner csere modal form |
| `app/admin/guests/PartnerSection.tsx` | Partner megjelenítő szekció |

### 6.3 UI Flow

```
GuestFormModal (paying_paired vendég)
└── PartnerSection
    ├── Jelenlegi partner adatok megjelenítése
    │   ├── Név
    │   ├── Email
    │   └── Státusz (check-in, ültetés)
    └── [Partner cseréje] gomb
        └── ChangePartnerModal
            ├── Figyelmeztetés: "A jelenlegi partner törlésre kerül"
            ├── Form mezők (új partner adatok)
            └── [Mégse] [Partner mentése és jegy küldése]
```

### 6.4 i18n kulcsok

```typescript
// lib/i18n/translations.ts
{
  // Partner szekció
  'partnerSection.title': 'Partner kezelése',
  'partnerSection.currentPartner': 'Jelenlegi partner',
  'partnerSection.noPartner': 'Nincs partner hozzárendelve',
  'partnerSection.changeButton': 'Partner cseréje',

  // Modal
  'changePartner.title': 'Partner cseréje',
  'changePartner.warning': 'A jelenlegi partner ({name}) törlésre kerül a rendszerből.',
  'changePartner.checkinBlocked': 'A partner már bejelentkezett az eseményen, csere nem lehetséges.',
  'changePartner.submitButton': 'Partner mentése és jegy küldése',
  'changePartner.success': 'Partner sikeresen cserélve. QR jegy elküldve: {email}',

  // Hibák
  'changePartner.error.selfPairing': 'Nem adhatod meg saját magad partnerként',
  'changePartner.error.alreadyPartner': 'Ez a vendég már {name} partnere',
  'changePartner.error.hasOwnPartner': 'Ez a vendég saját páros jeggyel rendelkezik',
}
```

---

## 7. Tesztelési terv

### 7.1 Unit tesztek (`tests/unit/partner-change.test.ts`)

| Teszt | Prioritás |
|-------|-----------|
| `validatePartnerChange` - self-pairing blokkolás | P0 |
| `validatePartnerChange` - másik partner ellopás blokkolás | P0 |
| `validatePartnerChange` - saját partnerrel rendelkező vendég blokkolás | P0 |
| `validatePartnerChange` - check-in blokkolás | P0 |
| `changePartner` - új partner létrehozás | P0 |
| `changePartner` - meglévő guest linkelése | P1 |
| `changePartner` - ültetés automatikus | P1 |
| `changePartner` - ültetés kapacitás túllépés | P1 |
| `deleteOldPartner` - cascade törlés | P1 |
| Audit log rögzítés | P2 |

### 7.2 E2E tesztek (`tests/e2e/admin-partner-change.spec.ts`)

| Teszt | Prioritás |
|-------|-----------|
| Partner csere happy path | P0 |
| Check-in blokkolás UI | P0 |
| Validációs hibák megjelenítése | P1 |
| Sikeres csere toast üzenet | P2 |

---

## 8. Implementációs sorrend

```
1. [ ] lib/services/partner.ts - validatePartnerChange()
2. [ ] lib/services/partner.ts - deleteOldPartner()
3. [ ] lib/services/partner.ts - createOrLinkNewPartner()
4. [ ] lib/services/partner.ts - assignPartnerToTable()
5. [ ] lib/services/partner.ts - changePartner() (fő orchestrator)
6. [ ] lib/services/audit.ts - PARTNER_CHANGE action
7. [ ] app/api/admin/guests/[id]/change-partner/route.ts
8. [ ] Unit tesztek
9. [ ] lib/i18n/translations.ts - fordítások
10. [ ] app/admin/guests/PartnerSection.tsx
11. [ ] app/admin/guests/ChangePartnerModal.tsx
12. [ ] app/admin/guests/GuestFormModal.tsx - partner szekció integrálás
13. [ ] E2E tesztek
```

---

## 9. Függőségek

- Nincs új npm package szükséges
- Meglévő szolgáltatások használata:
  - `lib/services/email.ts` - `generateAndSendTicket()`
  - `lib/services/seating.ts` - `assignGuestToTable()`
  - `lib/services/audit.ts` - `createAuditLog()`
  - `lib/services/registration.ts` - `generateUniquePWAAuthCode()`

---

## 10. Party Mode résztvevők

A specifikáció a következő BMAD ügynökök kollaborációjával készült:

- 🏗️ **Winston (Architect)** - Adatbázis és rendszer architektúra
- 📋 **John (PM)** - Követelmények és döntések
- 💻 **Amelia (Dev)** - Implementációs részletek
- 🎨 **Sally (UX Designer)** - Admin UI flow
- 🧪 **Murat (TEA)** - Tesztelési terv

---

*Dokumentum vége*
