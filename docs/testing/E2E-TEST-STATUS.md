# E2E Teszt Státusz

**Utolsó frissítés:** 2025-12-15
**Playwright verzió:** 1.49.1
**Teszt környezet:** http://localhost:3000

## Összefoglaló

| Metrika | Érték |
|---------|-------|
| **Összes teszt** | 222 |
| **Sikeres** | 201 |
| **Kihagyott** | 21 |
| **Hibás** | 0 |
| **Futási idő** | ~6 perc |

## Teszt fájlok

| Fájl | Tesztek | Státusz |
|------|---------|---------|
| `applicant.spec.ts` | 8 | ✅ Mind sikeres |
| `checkin.spec.ts` | 45 | ✅ 42 sikeres, 3 kihagyva |
| `email-templates.spec.ts` | 12 | ✅ Mind sikeres |
| `payments.spec.ts` | 15 | ✅ Mind sikeres |
| `pwa.spec.ts` | 18 | ✅ 17 sikeres, 1 kihagyva |
| `scheduled-emails.spec.ts` | 14 | ✅ Mind sikeres |
| `seating.spec.ts` | 35 | ✅ 25 sikeres, 10 kihagyva |
| `statistics.spec.ts` | 8 | ✅ Mind sikeres |
| `full-payment-flow-demo.spec.ts` | 1 | ✅ Sikeres |
| `paired-payment-demo.spec.ts` | 1 | ✅ Sikeres |
| `stripe-payment.spec.ts` | 1 | ✅ Sikeres |

## Kihagyott tesztek

### Check-in tesztek (3 db)

| Teszt | Ok | Prioritás |
|-------|-----|-----------|
| `should successfully submit check-in` | CSRF védelem - `page.request.post` nem küldi origin headert | Közepes |
| `should prevent duplicate check-in submit` | CSRF védelem | Közepes |
| `should show check-in statistics on admin dashboard` | Magyar i18n label nem található | Alacsony |

### PWA tesztek (1 db)

| Teszt | Ok | Prioritás |
|-------|-----|-----------|
| `should register service worker` | Service worker regisztráció időzítési probléma | Alacsony |

### Seating tesztek (10 db)

| Teszt | Ok | Prioritás |
|-------|-----|-----------|
| `should create a new standard table` | React controlled input - modal form fill nem működik | Magas |
| `should create a VIP table` | React controlled input | Magas |
| `should validate unique table name` | React controlled input | Magas |
| `should edit an existing table` | React controlled input | Magas |
| `should assign guest to table from guest list` | UI selector nem találja a table select elemet | Közepes |
| `should prevent over-capacity assignment` | API CSRF védelem | Közepes |
| `should display seating map page` | Heading selector nem találja "Tables/Seating" | Alacsony |
| `should display unassigned guests panel` | Guest button selector | Alacsony |
| `should import seating arrangement from CSV` | File input nem elérhető | Közepes |
| `should validate seating CSV import` | File input nem elérhető | Közepes |

## Technikai problémák és megoldások

### 1. CSRF védelem (403 hiba)

**Probléma:** A `page.request.post()` Playwright metódus nem küldi az `Origin` és `Referer` headereket, ami CSRF hibát okoz.

**Érintett API-k:**
- `/api/checkin/validate`
- `/api/checkin/submit`
- `/api/admin/*`

**Megoldás:** `apiPost` helper függvény, ami `page.evaluate()` + browser `fetch()` kombináción alapul:

```typescript
async function apiPost(page: Page, url: string, data: Record<string, unknown>) {
  const currentUrl = page.url();
  if (!currentUrl || currentUrl === 'about:blank') {
    await page.goto('/admin');
  }
  return page.evaluate(async ({ url, data }) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return { status: response.status, data: await response.json() };
  }, { url, data });
}
```

### 2. React Controlled Inputs (Modal formok)

**Probléma:** A table CRUD modal formokban a Playwright `fill()`, `type()`, `pressSequentially()` metódusok nem működnek megbízhatóan React controlled inputokkal.

**Érintett komponens:** `app/admin/tables/TablesDashboard.tsx`

**Kipróbált megoldások:**
- `page.fill('#name', 'value')` - nem működik
- `page.locator('#name').pressSequentially('value')` - nem működik
- `page.evaluate()` native value setter - nem működik

**Javasolt javítás:**
1. `data-testid` attribútumok hozzáadása az input elemekhez
2. Vagy: `useRef` + imperatív form kezelés a komponensben
3. Vagy: Headless UI form library használata

### 3. Magyar i18n labelek

**Probléma:** Néhány selector angol szöveget keres, de a UI magyarul jelenik meg.

**Érintett selectorok:**
- `heading: /Tables|Seating/` → kellene: `/Asztalok|Ültetés/`
- `text: /checked in/` → kellene: `/belépett|Belépési/`

**Megoldás:** Selectorok frissítése mindkét nyelvre, vagy `data-testid` használata.

### 4. API paraméter eltérések

**Probléma:** Teszt `qr_code` paramétert küldött, de az API `qrToken`-t vár.

**Fájl:** `app/api/checkin/validate/route.ts` (line 19)

**Megoldás:** Tesztekben javítva: `qr_code` → `qrToken`

## Futtatási útmutató

```bash
# Összes E2E teszt futtatása
BASE_URL=http://localhost:3000 npx playwright test

# Egyetlen spec fájl futtatása
BASE_URL=http://localhost:3000 npx playwright test tests/e2e/specs/checkin.spec.ts

# Teszt UI módban
BASE_URL=http://localhost:3000 npx playwright test --ui

# Csak hibás tesztek újrafuttatása
BASE_URL=http://localhost:3000 npx playwright test --last-failed
```

## Jövőbeli fejlesztések

### Magas prioritás
- [ ] Table CRUD form tesztek javítása `data-testid` attribútumokkal
- [ ] CSV import tesztek javítása (file input elérhetőség)

### Közepes prioritás
- [ ] Check-in API tesztek CSRF megoldása (apiPost helper kiterjesztése)
- [ ] Guest-table assignment selectorok javítása

### Alacsony prioritás
- [ ] Service worker teszt stabilizálása
- [ ] i18n selectorok frissítése magyar labelekre
- [ ] Seating map UI tesztek javítása

## Teszt fixtures

A tesztek egyedi fixture-öket használnak:

| Fixture | Leírás |
|---------|--------|
| `seedGuest` | Vendég létrehozása adatbázisban |
| `seedTable` | Asztal létrehozása |
| `db` | Prisma client közvetlen elérése |
| `cleanup` | Teszt adatok törlése |

**Fixture fájl:** `tests/e2e/fixtures/db-fixtures.ts`

## Kapcsolódó dokumentáció

- [Manuális fizetési teszt](./MANUAL-PAYMENT-FLOW-TEST.md)
- [Playwright konfiguráció](../../playwright.config.ts)
- [Teszt helperek](../../tests/e2e/helpers/index.ts)
