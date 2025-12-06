# Story 5.4: Fizetős Regisztráció Számlázási Űrlap

> **Epic:** 5 - Vendég Profil Bővítés
> **Státusz:** TODO
> **Prioritás:** HIGH

---

## User Story

**Mint** fizetős vendég,
**Szeretném** megadni a számlázási adataimat a regisztráció során,
**Hogy** szabályos számlát kaphassak a jegyvásárlásról.

## Elfogadási Kritériumok (BDD)

### AC1: Számlázási űrlap megjelenése
```gherkin
Given a fizetős regisztrációs űrlap megjelenik
When a vendég a számlázási szekciót látja
Then a következő mezők jelennek meg:
  - Számlázási név (kötelező)
  - Cégnév (opcionális)
  - Adószám (opcionális, magyar formátum)
  - Cím 1. sor (kötelező)
  - Cím 2. sor (opcionális)
  - Város (kötelező)
  - Irányítószám (kötelező, 4 számjegy)
  - Ország (alapértelmezett: HU)
```

### AC2: Számlázási név validáció
```gherkin
Given a számlázási űrlap kitöltése alatt van
When a vendég megadja a számlázási nevet
Then minimum 2 karakter szükséges
And maximum 255 karakter engedélyezett
```

### AC3: Adószám validáció
```gherkin
Given a számlázási űrlap kitöltése alatt van
When a vendég megadja az adószámot
Then a magyar adószám formátum ellenőrzött (12345678-1-42)
And hibás formátumnál hibaüzenet jelenik meg
And a mező opcionális, üresen hagyható
```

### AC4: Irányítószám validáció
```gherkin
Given a számlázási űrlap kitöltése alatt van
When a vendég megadja az irányítószámot
Then pontosan 4 számjegy szükséges
And hibás formátumnál hibaüzenet jelenik meg
```

### AC5: Páros jegy partner adatok
```gherkin
Given a fizetős vendég páros jegyet választ
When az űrlapot kitölti
Then a partner neve kötelező mező
And a partner email címe kötelező mező
And érvényes email formátum szükséges
And a partner adatok nélkül nem küldhető be az űrlap
```

### AC6: Profil mezők (öröklés Story 5.3-ból)
```gherkin
Given a fizetős regisztrációs űrlap megjelenik
Then a megszólítás, diétás igények, ültetési preferenciák mezők is megjelennek
And a GDPR és lemondási feltételek checkbox-ok kötelezőek
```

### AC7: Adatok mentése
```gherkin
Given a fizetős vendég sikeresen beküldti az űrlapot
Then a BillingInfo rekord létrejön a billing_info táblában
And a registration_id-vel összekapcsolva
And az összes mező helyesen mentődik
```

## Technikai Részletek

### Módosítandó Fájlok

| Fájl | Művelet | Leírás |
|------|---------|--------|
| `app/register/paying/page.tsx` | MODIFY | Számlázási űrlap + profil mezők |
| `app/register/components/BillingForm.tsx` | CREATE | Számlázási űrlap komponens |
| `app/register/components/PartnerFields.tsx` | CREATE | Partner adatok komponens |
| `app/api/registration/submit/route.ts` | MODIFY | BillingInfo mentés |
| `lib/services/registration.ts` | MODIFY | BillingInfo tranzakció |

### BillingForm Komponens

```tsx
// BillingForm.tsx
interface BillingFormProps {
  errors?: Record<string, string[]>;
  defaultValues?: Partial<BillingInfoInput>;
}

export function BillingForm({ errors, defaultValues }: BillingFormProps) {
  return (
    <div className="panel p-6">
      <h3 className="text-lg font-semibold mb-4">Számlázási adatok</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Számlázási név */}
        <div className="md:col-span-2">
          <label>Számlázási név *</label>
          <input type="text" name="billing_name" required />
        </div>

        {/* Cégnév */}
        <div>
          <label>Cégnév</label>
          <input type="text" name="company_name" />
        </div>

        {/* Adószám */}
        <div>
          <label>Adószám</label>
          <input
            type="text"
            name="tax_number"
            placeholder="12345678-1-42"
          />
        </div>

        {/* Cím mezők */}
        <div className="md:col-span-2">
          <label>Cím *</label>
          <input type="text" name="address_line1" required />
        </div>

        <div className="md:col-span-2">
          <label>Cím 2. sor</label>
          <input type="text" name="address_line2" />
        </div>

        <div>
          <label>Város *</label>
          <input type="text" name="city" required />
        </div>

        <div>
          <label>Irányítószám *</label>
          <input
            type="text"
            name="postal_code"
            pattern="[0-9]{4}"
            required
          />
        </div>

        <div>
          <label>Ország</label>
          <select name="country" defaultValue="HU">
            <option value="HU">Magyarország</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

### Partner Fields Komponens

```tsx
// PartnerFields.tsx - Páros jegynél kötelező
interface PartnerFieldsProps {
  isRequired: boolean;
  errors?: Record<string, string[]>;
}

export function PartnerFields({ isRequired, errors }: PartnerFieldsProps) {
  if (!isRequired) return null;

  return (
    <div className="panel p-6">
      <h3 className="text-lg font-semibold mb-4">Partner adatok</h3>
      <p className="text-sm text-neutral-500 mb-4">
        A partner adatai szükségesek a névre szóló QR-kódos jegy kiállításához.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Partner neve *</label>
          <input type="text" name="partner_name" required />
        </div>
        <div>
          <label>Partner email címe *</label>
          <input type="email" name="partner_email" required />
        </div>
      </div>
    </div>
  );
}
```

### Service Módosítás

```typescript
// lib/services/registration.ts
export async function createPaidRegistration(
  guestId: number,
  data: PaidSingleRegistrationInput | PaidPairedRegistrationInput
) {
  return prisma.$transaction(async (tx) => {
    // Guest profil frissítés
    await tx.guest.update({
      where: { id: guestId },
      data: {
        title: data.title,
        dietary_requirements: data.dietary_requirements,
        seating_preferences: data.seating_preferences,
      },
    });

    // Registration létrehozás
    const registration = await tx.registration.create({
      data: {
        guest_id: guestId,
        ticket_type: 'partner_name' in data ? 'paid_paired' : 'paid_single',
        partner_name: 'partner_name' in data ? data.partner_name : null,
        partner_email: 'partner_email' in data ? data.partner_email : null,
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        cancellation_accepted: true,
        cancellation_accepted_at: new Date(),
      },
    });

    // BillingInfo létrehozás
    await tx.billingInfo.create({
      data: {
        registration_id: registration.id,
        ...data.billing_info,
      },
    });

    return registration;
  });
}
```

## Tesztelési Terv

- [ ] Unit teszt: billingInfoSchema validáció
- [ ] Unit teszt: partnerSchema validáció páros jegynél
- [ ] E2E teszt: Fizetős single regisztráció számlázási adatokkal
- [ ] E2E teszt: Fizetős paired regisztráció partner + számlázási adatokkal
- [ ] Adószám formátum validáció teszt
- [ ] Irányítószám validáció teszt
- [ ] BillingInfo rekord létrejön az adatbázisban

## Definition of Done

- [ ] Kód implementálva
- [ ] Validáció működik (Zod sémák)
- [ ] BillingInfo mentődik tranzakcióban
- [ ] Partner adatok kötelezők páros jegynél
- [ ] Tesztek átmennek
- [ ] Code review kész
- [ ] Staging-en működik
