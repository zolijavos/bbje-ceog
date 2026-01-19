# Story: Meeting 2026-01-15 Követelmények

> **Sprint:** Pre-launch fixes
> **Státusz:** IN_PROGRESS
> **Prioritás:** CRITICAL
> **Forrás:** Ági meeting 2026-01-15

---

## Összefoglaló

7 követelmény az ügyfél meetingről, amelyeket a kedd-szerdai élesítés előtt meg kell oldani.

---

## Tasks

### Task 1: Vendég neve kiemelése minden regisztrációs oldalon
- [ ] **1.1** RegisterWelcome.tsx - név nagyobb és bold
- [ ] **1.2** VIPConfirmation.tsx - név kiemelése
- [ ] **1.3** PaidRegistrationForm.tsx - név kiemelése a header-ben

**AC:** A vendég neve vizuálisan hangsúlyos, könnyen megtalálható minden regisztrációs oldalon.

**Fájlok:**
- `app/register/RegisterWelcome.tsx`
- `app/register/vip/VIPConfirmation.tsx`
- `app/register/paid/PaidRegistrationForm.tsx`

---

### Task 2: Partner title kötelező mező
- [ ] **2.1** PaidRegistrationForm.tsx - partnerTitle mező required ha paired ticket
- [ ] **2.2** Validáció hozzáadása validateStep() függvényben
- [ ] **2.3** Hibaüzenet megjelenítése

**AC:** Ha paired ticket van kiválasztva, a partner title mező kötelező és validált.

**Fájlok:**
- `app/register/paid/PaidRegistrationForm.tsx`

---

### Task 3: Vessző a megszólításnál (email templatek)
- [ ] **3.1** lib/services/email-templates.ts - minden "Dear X!" -> "Dear X,"
- [ ] **3.2** DB email templates ellenőrzése és frissítése

**AC:** Minden email megszólítás után vessző van, nem felkiáltójel (angol konvenció).

**Fájlok:**
- `lib/services/email-templates.ts`

---

### Task 4: Seating preferences mező törlése
- [ ] **4.1** VIPConfirmation.tsx - seating preferences mező törlése
- [ ] **4.2** PaidRegistrationForm.tsx - fő vendég seating preferences törlése
- [ ] **4.3** PaidRegistrationForm.tsx - partner seating preferences törlése
- [ ] **4.4** API route - seating_preferences mező kezelés eltávolítása (ha szükséges)

**AC:** Nincs seating preferences mező a regisztrációs űrlapokon.

**Fájlok:**
- `app/register/vip/VIPConfirmation.tsx`
- `app/register/paid/PaidRegistrationForm.tsx`
- `app/api/registration/submit/route.ts`

---

### Task 5: CEO Gála 2026 felirat mindenhol
- [ ] **5.1** lib/constants.ts - EVENT_NAME konstans hozzáadása/módosítása
- [ ] **5.2** Success oldal - "CEO Gála 2026" használata
- [ ] **5.3** Registration oldalak - event név frissítése
- [ ] **5.4** Email templatek - "CEO Gála 2026" használata

**AC:** Minden guest-facing oldalon és emailben "CEO Gála 2026" jelenik meg.

**Fájlok:**
- `lib/constants.ts`
- `app/register/success/page.tsx`
- `app/register/RegisterWelcome.tsx`
- `lib/services/email-templates.ts`

---

### Task 6: Checked-in státusz hozzáadása
- [ ] **6.1** prisma/schema.prisma - RegistrationStatus enum bővítése 'checked_in' értékkel
- [ ] **6.2** npx prisma generate futtatása
- [ ] **6.3** app/api/checkin/submit/route.ts - státusz frissítése checked_in-re belépéskor
- [ ] **6.4** Admin guest list - checked_in státusz megjelenítése
- [ ] **6.5** Admin guest list - checked_in szűrő hozzáadása

**AC:** Belépéskor a vendég státusza automatikusan 'checked_in'-re vált, és ez szűrhető az admin felületen.

**Fájlok:**
- `prisma/schema.prisma`
- `app/api/checkin/submit/route.ts`
- `app/admin/guests/GuestList.tsx`
- `lib/i18n/translations.ts`

---

### Task 7: No-show email funkció
- [ ] **7.1** Admin guest list - "Not checked in" szűrő hozzáadása
- [ ] **7.2** Bulk email küldés lehetősége a not checked in vendégeknek

**AC:** Admin képes szűrni a nem belépett vendégekre és nekik bulk emailt küldeni.

**Fájlok:**
- `app/admin/guests/GuestList.tsx`
- `app/admin/guests/page.tsx`

---

## Definition of Done

- [ ] Minden task implementálva
- [ ] Prisma schema frissítve és migrate lefutott
- [ ] Build hiba nélkül fut
- [ ] Manuális tesztelés sikeres
- [ ] Deploy production-re
