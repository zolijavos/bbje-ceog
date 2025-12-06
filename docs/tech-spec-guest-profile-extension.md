# Tech-Spec: Vendég Profil Bővítés

> **Projekt:** CEO Gala Registration System v2
> **Típus:** Brownfield - Adatmodell bővítés
> **Dátum:** 2025-11-29
> **Státusz:** DRAFT

---

## 1. Kontextus Összefoglaló

### Betöltött Dokumentumok
- ✅ Funkcionális követelmények: `docs/FUNKCIONALIS-KOVETELMENY.md`
- ✅ Prisma séma: `prisma/schema.prisma` (8 tábla, működő struktúra)
- ✅ Regisztrációs űrlapok: `app/register/*/page.tsx`
- ✅ Admin felület: `app/admin/*`

### Projekt Stack
- **Runtime:** Node.js 20.x
- **Framework:** Next.js 14+ App Router
- **Nyelv:** TypeScript 5.x
- **ORM:** Prisma 5.19+
- **DB:** MySQL 8.0+
- **CSS:** Tailwind CSS 3.x
- **Tesztek:** Vitest (unit), Playwright (e2e)

### Meglévő Struktúra
```
app/
├── register/              # Regisztrációs oldalak
│   ├── vip/page.tsx       # VIP regisztráció
│   ├── paying/page.tsx    # Fizetős regisztráció
│   └── components/        # Form komponensek
├── admin/
│   ├── guests/            # Vendég kezelés
│   └── seating/           # Ültetési terv
lib/
├── services/              # Üzleti logika
│   └── registration.ts    # Regisztrációs szolgáltatás
prisma/
└── schema.prisma          # Adatbázis séma
```

---

## 2. A Változtatás Leírása

### Probléma Meghatározás
A jelenlegi vendég adatmodell nem tartalmazza a következő, az esemény lebonyolításához szükséges információkat:
1. **Megszólítás/előtag** - Hivatalos megszólításhoz (Dr., Prof., stb.)
2. **Részletes számlázási adatok** - Fizetős vendégeknél cég, adószám, cím
3. **Ültetési preferenciák** - Kivel szeretne egy asztalnál ülni
4. **Diétás igények** - Ételérzékenység, vegetáriánus, stb.
5. **Partner adatok** - Páros jegynél kötelező partner info QR kód generáláshoz
6. **GDPR hozzájárulás** - Adatkezelési nyilatkozat
7. **Lemondási feltételek** - Feltételek elfogadásának rögzítése

### Megoldás Áttekintés
Bővíteni kell a `Guest` és `Registration` modelleket új mezőkkel, valamint egy új `BillingInfo` modellt kell létrehozni a számlázási adatok strukturált tárolására.

### Scope - Benne Van
- Guest modell bővítése: `title` mező
- Guest modell bővítése: `dietary_requirements`, `seating_preferences`
- Új BillingInfo modell fizetős vendégekhez
- Registration modell bővítése: `gdpr_consent`, `cancellation_accepted`, `gdpr_consent_at`, `cancellation_accepted_at`
- Partner mezők validációja páros jegynél
- Regisztrációs űrlapok frissítése

### Scope - Nincs Benne
- Email sablonok módosítása
- Admin felület UI változtatás (csak meglévő mezők megjelenítése)
- QR kód generálás módosítása
- Fizetési folyamat módosítása

---

## 3. Forrásfájl Változtatások

### CREATE - Új Fájlok
| Fájl | Leírás |
|------|--------|
| `prisma/migrations/XXXX_guest_profile_extension/migration.sql` | DB migráció |
| `lib/validations/guest-profile.ts` | Zod validációs sémák |
| `app/register/components/GuestProfileFields.tsx` | Közös profil mezők komponens |
| `app/register/components/BillingForm.tsx` | Számlázási űrlap komponens |
| `app/register/components/ConsentCheckboxes.tsx` | GDPR és lemondási feltételek |

### MODIFY - Módosítandó Fájlok
| Fájl | Változtatás |
|------|-------------|
| `prisma/schema.prisma` | Guest, Registration modell bővítés + BillingInfo modell |
| `lib/services/registration.ts` | Új mezők kezelése |
| `app/register/vip/page.tsx` | Profil mezők hozzáadása |
| `app/register/paying/page.tsx` | Számlázási űrlap + profil mezők |
| `app/api/registration/submit/route.ts` | Validáció bővítés |

---

## 4. Technikai Megközelítés

### 4.1 Prisma Séma Módosítások

```prisma
// Guest modell bővítés
model Guest {
  // ... meglévő mezők ...

  // ÚJ MEZŐK
  title                String?         @db.VarChar(50)  // Dr., Prof., stb.
  dietary_requirements String?         @db.Text         // Diéta, allergia
  seating_preferences  String?         @db.Text         // Ültetési preferenciák
}

// Registration modell bővítés
model Registration {
  // ... meglévő mezők ...

  // ÚJ MEZŐK - Consent
  gdpr_consent              Boolean   @default(false)
  gdpr_consent_at           DateTime?
  cancellation_accepted     Boolean   @default(false)
  cancellation_accepted_at  DateTime?

  // Partner mezők már léteznek, de validáció erősítése szükséges
  // partner_name és partner_email kötelezővé válik paid_paired esetén

  // Relációk
  billing_info BillingInfo?
}

// ÚJ MODELL - Számlázási információk
model BillingInfo {
  id              Int          @id @default(autoincrement())
  registration_id Int          @unique
  billing_name    String       @db.VarChar(255)  // Számlázási név
  company_name    String?      @db.VarChar(255)  // Cégnév (opcionális)
  tax_number      String?      @db.VarChar(50)   // Adószám (opcionális)
  address_line1   String       @db.VarChar(255)  // Cím 1. sor
  address_line2   String?      @db.VarChar(255)  // Cím 2. sor (opcionális)
  city            String       @db.VarChar(100)  // Város
  postal_code     String       @db.VarChar(20)   // Irányítószám
  country         String       @default("HU") @db.VarChar(2)  // Országkód
  created_at      DateTime     @default(now())
  updated_at      DateTime     @updatedAt

  // Reláció
  registration Registration @relation(fields: [registration_id], references: [id], onDelete: Cascade)

  @@map("billing_info")
}
```

### 4.2 Validációs Séma (Zod)

```typescript
// lib/validations/guest-profile.ts
import { z } from 'zod';

export const titleOptions = ['', 'Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.'] as const;

export const guestProfileSchema = z.object({
  title: z.enum(titleOptions).optional(),
  dietary_requirements: z.string().max(500).optional(),
  seating_preferences: z.string().max(500).optional(),
});

export const billingInfoSchema = z.object({
  billing_name: z.string().min(2, 'Számlázási név kötelező').max(255),
  company_name: z.string().max(255).optional(),
  tax_number: z.string().regex(/^[0-9]{8}-[0-9]-[0-9]{2}$/, 'Érvénytelen adószám formátum').optional(),
  address_line1: z.string().min(5, 'Cím kötelező').max(255),
  address_line2: z.string().max(255).optional(),
  city: z.string().min(2, 'Város kötelező').max(100),
  postal_code: z.string().regex(/^[0-9]{4}$/, 'Érvénytelen irányítószám'),
  country: z.string().length(2).default('HU'),
});

export const consentSchema = z.object({
  gdpr_consent: z.literal(true, {
    errorMap: () => ({ message: 'GDPR hozzájárulás kötelező' }),
  }),
  cancellation_accepted: z.literal(true, {
    errorMap: () => ({ message: 'Lemondási feltételek elfogadása kötelező' }),
  }),
});

export const pairedTicketPartnerSchema = z.object({
  partner_name: z.string().min(2, 'Partner neve kötelező'),
  partner_email: z.string().email('Érvénytelen email cím'),
});
```

### 4.3 Meglévő Konvenciók Követése

A projekt már használja a következő mintákat:
- **TypeScript strict mode** - Minden típus explicit
- **Zod validáció** - API route-okban
- **Prisma tranzakciók** - Kapcsolódó műveleteknél
- **Server Actions** - Form submission
- **Tailwind utility classes** - CSS-hez a globals.css design system alapján

---

## 5. Integrációs Pontok

### Belső Modulok
- `lib/services/registration.ts` - Regisztrációs logika bővítése
- `lib/db/prisma.ts` - Prisma client (nincs változás)
- `app/api/registration/*` - API route-ok bővítése

### Külső Szolgáltatások
- Nincs új integráció - csak adatmodell változás

### Adatbázis Interakciók
- **Guest tábla** - 3 új nullable oszlop
- **Registration tábla** - 4 új oszlop (2 boolean, 2 datetime)
- **BillingInfo tábla** - Új tábla, 1:1 kapcsolat Registration-nel

---

## 6. Fejlesztési Útmutató

### Setup Lépések
1. Branch létrehozása: `git checkout -b feature/guest-profile-extension`
2. Prisma séma módosítása
3. Migráció futtatása: `npx prisma migrate dev --name guest_profile_extension`
4. Prisma client generálás: `npx prisma generate`

### Implementációs Lépések

**Fázis 1: Adatmodell (Story 1)**
1. Prisma séma módosítása - Guest modell bővítés
2. BillingInfo modell létrehozása
3. Registration modell bővítés
4. Migráció futtatása

**Fázis 2: Validáció (Story 2)**
1. Zod sémák létrehozása
2. API route validáció bővítése
3. Partner adatok validáció páros jegynél

**Fázis 3: UI Komponensek (Story 3-4)**
1. GuestProfileFields komponens (title, dietary, preferences)
2. BillingForm komponens
3. ConsentCheckboxes komponens
4. Űrlapok integrálása

### Tesztelési Stratégia

**Unit Tesztek (Vitest)**
- Validációs sémák tesztelése
- Service funkciók tesztelése

**E2E Tesztek (Playwright)**
- VIP regisztráció teljes flow új mezőkkel
- Fizetős regisztráció számlázási adatokkal
- Páros jegy partner validáció
- GDPR és lemondási feltételek ellenőrzése

### Elfogadási Kritériumok

1. ✅ Guest-nél opcionális title mező működik (Dr., Prof., stb.)
2. ✅ Dietary és seating preferences mentődik és szerkeszthető
3. ✅ Fizetős regisztrációnál számlázási űrlap megjelenik
4. ✅ BillingInfo adatok mentődnek az adatbázisba
5. ✅ Páros jegynél partner_name és partner_email kötelező
6. ✅ GDPR consent kötelező, timestamp rögzítve
7. ✅ Cancellation accepted kötelező, timestamp rögzítve
8. ✅ Meglévő adatok nem sérülnek (backward compatible migráció)

---

## 7. Fejlesztői Erőforrások

### Fájl Útvonalak
```
prisma/schema.prisma                           # Adatmodell
lib/validations/guest-profile.ts               # Validáció
lib/services/registration.ts                   # Üzleti logika
app/register/components/GuestProfileFields.tsx # Profil komponens
app/register/components/BillingForm.tsx        # Számlázási komponens
app/register/components/ConsentCheckboxes.tsx  # Consent komponens
app/register/vip/page.tsx                      # VIP form
app/register/paying/page.tsx                   # Fizetős form
app/api/registration/submit/route.ts           # API endpoint
```

### Kulcs Kód Helyek
- Guest típus definíció: `types/guest.ts`
- Registration service: `lib/services/registration.ts`
- Form validáció: `lib/validations/`

### Teszt Helyek
- Unit: `tests/unit/validations/`
- E2E: `tests/e2e/registration/`

---

## 8. UX/UI Megfontolások

### Érintett UI Komponensek
- VIP regisztrációs űrlap
- Fizetős regisztrációs űrlap
- Admin vendég részletek oldal (csak megjelenítés)

### Felhasználói Élmény
- **Title mező**: Dropdown selector (optional)
- **Dietary/Preferences**: Textarea, max 500 karakter
- **Számlázási űrlap**: Strukturált form, magyar címformátum
- **Consent checkboxek**: Kötelező, linkelve a teljes szövegekhez

### Akadálymentesség
- ARIA labelek minden form mezőhöz
- Keyboard navigáció támogatás
- Error message-ek screen reader kompatibilisek

---

## 9. Telepítési Stratégia

### Telepítési Lépések
1. Prisma migráció futtatása (backward compatible - új mezők nullable)
2. Kód deploy
3. Teszt staging környezetben
4. Production deploy

### Visszaállítási Terv
1. Git revert az utolsó stabil commit-ra
2. Prisma rollback: `npx prisma migrate resolve --rolled-back MIGRATION_NAME`
3. Újra deploy

### Monitorozás
- Prisma query log figyelése
- Registration API válaszidők
- Adatbázis méret növekedés (BillingInfo tábla)

---

## 10. Validáció Eredmények

| Kritérium | Eredmény |
|-----------|----------|
| Kontextus Gyűjtés | ✅ Teljes |
| Definiáltság | ✅ Minden verzió specifikus |
| Brownfield Integráció | ✅ Meglévő minták követve |
| Stack Illeszkedés | ✅ Tökéletes |
| Implementáció Készültség | ✅ Indítható |

---

**Generálva:** BMAD Tech-Spec Workflow v6.0
**Nyelv:** Magyar
