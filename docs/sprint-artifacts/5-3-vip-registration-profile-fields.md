# Story 5.3: VIP Regisztráció Profil Mezők

> **Epic:** 5 - Vendég Profil Bővítés
> **Státusz:** TODO
> **Prioritás:** HIGH

---

## User Story

**Mint** VIP vendég,
**Szeretném** megadni a megszólításomat, diétás igényeimet és ültetési preferenciáimat,
**Hogy** a személyre szabott kiszolgálást kaphassak az eseményen.

## Elfogadási Kritériumok (BDD)

### AC1: Megszólítás mező
```gherkin
Given a VIP regisztrációs űrlap megjelenik
When a vendég kiválaszt egy megszólítást a dropdown-ból (Dr., Prof., stb.)
Then a kiválasztott érték mentődik a guest.title mezőbe
And a mező opcionális, üresen is hagyható
```

### AC2: Diétás igények mező
```gherkin
Given a VIP regisztrációs űrlap megjelenik
When a vendég kitölti a diétás igények mezőt
Then a szöveg mentődik a guest.dietary_requirements mezőbe
And maximum 500 karakter bevihető
And a mező opcionális
```

### AC3: Ültetési preferenciák mező
```gherkin
Given a VIP regisztrációs űrlap megjelenik
When a vendég kitölti az ültetési preferenciák mezőt
Then a szöveg mentődik a guest.seating_preferences mezőbe
And maximum 500 karakter bevihető
And a mező opcionális
```

### AC4: GDPR hozzájárulás
```gherkin
Given a VIP regisztrációs űrlap megjelenik
When a vendég be akarja küldeni az űrlapot
Then a GDPR checkbox bejelölése kötelező
And a gdpr_consent = true és gdpr_consent_at = aktuális timestamp mentődik
```

### AC5: Lemondási feltételek elfogadása
```gherkin
Given a VIP regisztrációs űrlap megjelenik
When a vendég be akarja küldeni az űrlapot
Then a lemondási feltételek checkbox bejelölése kötelező
And a cancellation_accepted = true és cancellation_accepted_at = aktuális timestamp mentődik
```

## Technikai Részletek

### Módosítandó Fájlok

| Fájl | Művelet | Leírás |
|------|---------|--------|
| `app/register/vip/page.tsx` | MODIFY | Új mezők hozzáadása az űrlaphoz |
| `app/register/components/GuestProfileFields.tsx` | CREATE | Közös profil mezők komponens |
| `app/register/components/ConsentCheckboxes.tsx` | CREATE | GDPR és lemondási checkbox-ok |
| `app/api/registration/submit/route.ts` | MODIFY | Validáció bővítése |
| `lib/services/registration.ts` | MODIFY | Új mezők mentése |

### UI Komponensek

```tsx
// GuestProfileFields.tsx
<div className="space-y-4">
  {/* Megszólítás - dropdown */}
  <select name="title">
    <option value="">-- Válasszon --</option>
    <option value="Dr.">Dr.</option>
    <option value="Prof.">Prof.</option>
    {/* ... */}
  </select>

  {/* Diétás igények - textarea */}
  <textarea
    name="dietary_requirements"
    maxLength={500}
    placeholder="Pl: vegetáriánus, gluténmentes, laktózmentes..."
  />

  {/* Ültetési preferenciák - textarea */}
  <textarea
    name="seating_preferences"
    maxLength={500}
    placeholder="Kivel szeretne egy asztalnál ülni?"
  />
</div>
```

### Validáció

```typescript
import { vipRegistrationSchema } from '@/lib/validations/guest-profile';

// API route-ban
const result = vipRegistrationSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
}
```

## Tesztelési Terv

- [ ] Unit teszt: validációs sémák
- [ ] E2E teszt: VIP regisztráció teljes flow új mezőkkel
- [ ] Hibaüzenetek megjelenése validációs hibáknál
- [ ] Checkbox-ok nélkül nem küldhető be az űrlap

## Definition of Done

- [ ] Kód implementálva
- [ ] Validáció működik
- [ ] Tesztek átmennek
- [ ] Code review kész
- [ ] Staging-en működik
