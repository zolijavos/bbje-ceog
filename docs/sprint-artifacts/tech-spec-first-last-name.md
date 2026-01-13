# Tech-Spec: First Name / Last Name Szétválasztás

**Létrehozva:** 2026-01-09
**Státusz:** Fejlesztésre Kész
**Verzió:** v2.7.0

---

## Áttekintés

### Probléma

Jelenleg a rendszer egyetlen `name` mezőben tárolja a vendégek teljes nevét. Ez problémákat okoz:
- Nem szabványos adatstruktúra (legtöbb rendszer külön kezeli)
- CSV export/import nehézkes
- Nemzetközi nevek kezelése problémás
- Partner nevek szintén egyetlen mezőben tárolódnak

### Megoldás

A `name` mező szétválasztása `first_name` és `last_name` mezőkre:
- **Guest** model: `name` → `first_name` + `last_name`
- **Registration** model: `partner_name` → `partner_first_name` + `partner_last_name`
- Angol sorrend használata (First Name Last Name)
- Meglévő adatok automatikus migrálása

### Hatókör (Benne/Kívül)

**Benne:**
- Prisma schema módosítás
- Migráció script (magyar név → angol sorrend)
- API endpoints frissítése
- Form komponensek frissítése
- Guest list táblázat
- CSV export/import
- PWA profil

**Kívül:**
- Email template `{{name}}` változó (marad computed)
- Check-in kijelző (computed full name)
- Seating map (computed full name)

---

## Fejlesztési Kontextus

### Kódbázis Minták

| Minta | Leírás |
|-------|--------|
| **Validation** | Zod schemas az API route fájlok elején |
| **Auth** | `requireAuth()` helper minden admin endpoint-hoz |
| **Audit** | `createAuditLog()` minden admin műveletnél |
| **Error Format** | `{ success: boolean, error?: string }` |
| **Services** | `lib/services/*.ts` üzleti logika |

### Referencia Fájlok

**Schema:**
- `prisma/schema.prisma` - Guest model (line 17-62), Registration model (line 64-89)

**API Routes:**
- `app/api/admin/guests/route.ts` - Zod schema példa (line 17-28)
- `app/api/apply/route.ts` - Applicant create (line 16-26)
- `app/api/registration/submit/route.ts` - Paid registration (line 24-40)

**Services:**
- `lib/services/guest.ts` - GuestListItem interface (line 24-43)

**Forms:**
- `app/admin/guests/GuestFormModal.tsx` - Admin form
- `app/apply/page.tsx` - Public application
- `app/register/paid/PaidRegistrationForm.tsx` - Paid registration
- `app/register/vip/VIPConfirmation.tsx` - VIP registration

### Technikai Döntések

| Döntés | Választás | Indoklás |
|--------|-----------|----------|
| Név sorrend | Angol (First Last) | User kérés |
| Meglévő `name` mező | Törlés migráció után | Tiszta schema |
| Computed full name | Getter függvény | Display célokra |
| Partner nevek | Szétválasztás | Konzisztencia |
| Szemét adatok | Törlés | Teszt adatok |

---

## Implementációs Terv

### Task 1: Prisma Schema Módosítás

**Fájl:** `prisma/schema.prisma`

**Változások:**
```prisma
model Guest {
  // Régi:
  // name String @db.VarChar(255)

  // Új:
  first_name String @db.VarChar(127)
  last_name  String @db.VarChar(127)

  // ... többi mező változatlan
}

model Registration {
  // Régi:
  // partner_name String? @db.VarChar(255)

  // Új:
  partner_first_name String? @db.VarChar(127)
  partner_last_name  String? @db.VarChar(127)

  // ... többi mező változatlan
}
```

### Task 2: Migráció Script

**Fájl:** `prisma/migrations/XXXXXX_split_name_fields/migration.sql`

**Logika:**
1. Új oszlopok hozzáadása (`first_name`, `last_name`)
2. Adatok migrálása magyar → angol sorrendre
3. Szemét adatok törlése (ID: 649, 650, 651, 652, 653, 654, 655, 656)
4. Régi `name` oszlop törlése
5. Partner nevek migrálása a Registration táblában

**Migráció SQL:**
```sql
-- 1. Új oszlopok hozzáadása
ALTER TABLE guests ADD COLUMN first_name VARCHAR(127);
ALTER TABLE guests ADD COLUMN last_name VARCHAR(127);

-- 2. Adatok migrálása (magyar: Vezetéknév Keresztnév → angol: first=Keresztnév, last=Vezetéknév)
UPDATE guests SET
  first_name = TRIM(SUBSTRING_INDEX(
    CASE
      WHEN name LIKE 'Dr. %' THEN SUBSTRING(name, 5)
      ELSE name
    END, ' ', -1)),
  last_name = CONCAT(
    CASE WHEN name LIKE 'Dr. %' THEN 'Dr. ' ELSE '' END,
    TRIM(SUBSTRING_INDEX(
      CASE
        WHEN name LIKE 'Dr. %' THEN SUBSTRING(name, 5)
        ELSE name
      END, ' ', 1))
  )
WHERE name LIKE '% %';

-- Egyszavas nevek
UPDATE guests SET
  first_name = name,
  last_name = ''
WHERE name NOT LIKE '% %';

-- 3. Szemét adatok törlése
DELETE FROM guests WHERE id IN (649, 650, 651, 652, 653, 654, 655, 656);

-- 4. Oszlopok finalizálása
ALTER TABLE guests DROP COLUMN name;
ALTER TABLE guests MODIFY first_name VARCHAR(127) NOT NULL;
ALTER TABLE guests MODIFY last_name VARCHAR(127) NOT NULL;

-- 5. Partner nevek migrálása
ALTER TABLE registrations ADD COLUMN partner_first_name VARCHAR(127);
ALTER TABLE registrations ADD COLUMN partner_last_name VARCHAR(127);

UPDATE registrations SET
  partner_first_name = TRIM(SUBSTRING_INDEX(partner_name, ' ', -1)),
  partner_last_name = TRIM(SUBSTRING_INDEX(partner_name, ' ', 1))
WHERE partner_name IS NOT NULL AND partner_name LIKE '% %';

UPDATE registrations SET
  partner_first_name = partner_name,
  partner_last_name = ''
WHERE partner_name IS NOT NULL AND partner_name NOT LIKE '% %';

ALTER TABLE registrations DROP COLUMN partner_name;
```

### Task 3: TypeScript Interfaces & Zod Schemas

**Fájlok:**
- `lib/services/guest.ts` - GuestListItem interface
- `app/api/admin/guests/route.ts` - createGuestSchema
- `app/api/apply/route.ts` - applySchema

**Változások:**
```typescript
// Régi:
name: z.string().min(1, 'Name is required')

// Új:
first_name: z.string().min(1, 'First name is required'),
last_name: z.string().min(1, 'Last name is required'),
```

### Task 4: API Endpoints Frissítése

| Endpoint | Fájl | Változás |
|----------|------|----------|
| GET/POST /api/admin/guests | `route.ts` | Schema + response |
| PATCH /api/admin/guests/[id] | `[id]/route.ts` | Update fields |
| POST /api/admin/guests/import | `import/route.ts` | CSV columns |
| GET /api/admin/guests/export | `export/route.ts` | CSV columns |
| POST /api/apply | `route.ts` | Create fields |
| POST /api/registration/submit | `route.ts` | Partner fields |
| POST /api/registration/confirm | `route.ts` | VIP partner fields |
| GET/PATCH /api/pwa/profile | `route.ts` | Profile fields |

### Task 5: Form Komponensek Frissítése

| Komponens | Változás |
|-----------|----------|
| `GuestFormModal.tsx` | `name` input → `first_name` + `last_name` inputs |
| `page.tsx` (apply) | `name` input → `first_name` + `last_name` inputs |
| `PaidRegistrationForm.tsx` | Partner input szétválasztás |
| `VIPConfirmation.tsx` | Partner input szétválasztás |
| `GuestProfileFields.tsx` | Ellenőrizni kell - ha van name, frissíteni |

### Task 6: Display & Export Frissítése

| Komponens | Változás |
|-----------|----------|
| Guest list táblázat | Name oszlop → computed `${first_name} ${last_name}` |
| CSV export | `name` → `first_name`, `last_name` oszlopok |
| CSV import | Új oszlopok kezelése |
| PWA profile | Display frissítés |

### Task 7: Helper Függvény

**Fájl:** `lib/utils/name.ts` (új fájl)

```typescript
/**
 * Combine first and last name into full name (English order)
 */
export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Split Hungarian name format to English order
 * Input: "Kovács János" → Output: { firstName: "János", lastName: "Kovács" }
 */
export function splitHungarianName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();

  // Handle Dr. prefix
  let prefix = '';
  let cleanName = trimmed;
  if (trimmed.startsWith('Dr. ')) {
    prefix = 'Dr. ';
    cleanName = trimmed.slice(4);
  }

  const parts = cleanName.split(' ');

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  // Hungarian: [Vezetéknév] [Keresztnév] → English: first=Keresztnév, last=Vezetéknév
  return {
    firstName: parts.slice(1).join(' '),
    lastName: prefix + parts[0],
  };
}
```

---

## Elfogadási Kritériumok

### AC1: Schema Migráció
- [ ] **Given** a meglévő adatbázis 173 vendéggel
- [ ] **When** futtatom a `npx prisma migrate dev` parancsot
- [ ] **Then** az összes vendég `first_name` és `last_name` mezője ki van töltve
- [ ] **And** a szemét adatok (8 rekord) törölve vannak
- [ ] **And** a partner nevek szét vannak választva

### AC2: Admin Guest Form
- [ ] **Given** admin felhasználó a vendég hozzáadás/szerkesztés modalon
- [ ] **When** kitölti a "First Name" és "Last Name" mezőket
- [ ] **Then** a vendég létrejön/frissül a megfelelő mezőkkel
- [ ] **And** a guest list-ben megjelenik "First Last" formátumban

### AC3: Registration Forms
- [ ] **Given** vendég a regisztrációs űrlapon (VIP/Paid)
- [ ] **When** partner adatokat ad meg
- [ ] **Then** a partner first/last name külön tárolódik
- [ ] **And** az email helyesen kerül elküldésre

### AC4: CSV Export/Import
- [ ] **Given** admin felhasználó az export funkcióban
- [ ] **When** exportál CSV-t
- [ ] **Then** `first_name` és `last_name` külön oszlopokban vannak
- [ ] **And** import támogatja mindkét oszlopot

### AC5: PWA Profile
- [ ] **Given** bejelentkezett vendég a PWA-ban
- [ ] **When** megtekinti a profilját
- [ ] **Then** látja a nevét "First Last" formátumban

### AC6: Rollback
- [ ] **Given** sikertelen deployment
- [ ] **When** visszaállítom a backup-ból
- [ ] **Then** a rendszer működik az eredeti állapotban

---

## Függőségek

### Külső Függőségek
- Nincs új npm package

### Belső Függőségek
- Prisma migrate működő állapot
- MySQL hozzáférés
- PM2 restart jogosultság

---

## Tesztelési Stratégia

### Unit Tesztek
- `splitHungarianName()` helper függvény
- Zod validation schemas

### E2E Tesztek
- Guest form add/edit
- Registration flow (VIP + Paid)
- CSV export/import
- PWA profile

### Manuális Tesztek
- Migration ellenőrzése (spot check 10+ vendég)
- Partner nevek ellenőrzése
- Email küldés partner névvel

---

## Megjegyzések

### Migration Kockázatok
- **Dr. prefix**: Speciális kezelés szükséges
- **Egyszavas nevek**: `first_name`-be kerülnek, `last_name` üres
- **Speciális karakterek**: UTF-8 támogatott

### Rollback Terv
```bash
# Kód visszaállítás:
git checkout master

# DB visszaállítás:
mysql -u root ceog < /var/www/ceog/backup_before_name_split_20260109_174051.sql

# Rebuild + restart:
npm run build && pm2 restart ceog
```

### Becsült Érintett Fájlok
- **Schema:** 1 fájl
- **Migrations:** 1 fájl
- **API Routes:** 8 fájl
- **Components:** 5 fájl
- **Services:** 2 fájl
- **Utils:** 1 új fájl
- **Összesen:** ~18 fájl

---

*Tech-Spec készítette: Winston (Architect) + BMAD Team*
*Dátum: 2026-01-09*
