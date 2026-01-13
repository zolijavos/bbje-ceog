# Tech-Spec: Attendance Commitment (Részvételi Kötelezettségvállalás) - MVP

**Létrehozva:** 2026-01-11
**Státusz:** Fejlesztésre Kész
**Verzió:** v2.9.0

---

## Áttekintés

### Probléma

VIP vendégek ingyenes jegyet kapnak, de ha regisztrálnak és nem jönnek el, helyet foglalnak más elől. Az ügyfél kérése szerint (2026-01-05 meeting):

> "Ha valaki akceptálja a jegyet és beregisztrál és nem jön el, akkor időben lemondták, vagy fizet."

Jelenleg hiányzik:
- Egyértelmű no-show policy szöveg a regisztrációs checkbox-ban
- PWA-ban lemondási lehetőség a vendégeknek
- No-show lista generálása az esemény után

### Megoldás (MVP)

1. **No-show szöveg frissítése** - Consent checkbox szöveg bővítése a no-show fee-vel
2. **PWA lemondás oldal** - Vendégek lemondhatják részvételüket a PWA-ban
3. **No-show lista** - Admin látja az esemény után, kik voltak no-show (regisztrált, de nem jelent meg)

### Hatókör (Benne/Kívül)

**Benne (MVP):**
- ConsentCheckboxes.tsx szöveg frissítése (HU/EN)
- Új `/pwa/cancel` oldal (lemondás felület)
- Új `/api/registration/cancel` endpoint
- Registration model: `cancelled_at` mező
- Admin guest list: No-show filter és badge
- No-show CSV export

**Kívül (Második kör):**
- Emlékeztető email küldés (E-7, E-10)
- No-show fizetési felszólítás email
- No-show statisztikák dashboard

---

## Fejlesztési Kontextus

### Kódbázis Minták

| Minta | Leírás |
|-------|--------|
| **PWA Pages** | `app/pwa/*/page.tsx` - Client components with auth check |
| **PWA Auth** | `pwa_auth_code` cookie + `/api/pwa/auth` validation |
| **API Routes** | `app/api/*/route.ts` - Zod validation, try-catch error handling |
| **Prisma** | `lib/prisma.ts` singleton client |
| **Admin Filters** | `registrationStatus` query param in guest list |

### Referencia Fájlok

**Consent:**
- `app/register/components/ConsentCheckboxes.tsx` - Jelenlegi checkbox (line 64-95)

**PWA:**
- `app/pwa/dashboard/page.tsx` - Dashboard struktúra (auth, layout)
- `app/pwa/profile/page.tsx` - Form típusú PWA oldal minta
- `app/pwa/components/ui/Button3D.tsx` - PWA gombok

**API:**
- `app/api/pwa/profile/route.ts` - PWA auth minta
- `app/api/registration/submit/route.ts` - Registration update minta

**Admin:**
- `app/admin/guests/page.tsx` - Guest list filters (line 30-80)
- `lib/services/guest.ts` - Guest query logic

### Technikai Döntések

| Döntés | Választás | Indoklás |
|--------|-----------|----------|
| Lemondás flag | `cancelled_at` DateTime | Timestamp jobb audit-hoz, mint boolean |
| Lemondás soft delete | Registration marad | Audit trail megőrzése |
| No-show számítás | Query alapú | Nincs külön mező, dinamikus |
| No-show kritérium | `registered + !checked_in + !cancelled + event_passed` | Egyértelmű definíció |

---

## Implementációs Terv

### Task 1: Prisma Schema Módosítás

**Fájl:** `prisma/schema.prisma`

**Változások:**
```prisma
model Registration {
  // ... meglévő mezők ...

  // Lemondási feltételek (MEGLÉVŐ)
  cancellation_accepted    Boolean   @default(false)
  cancellation_accepted_at DateTime?

  // CANCELLED státusz (ÚJ)
  cancelled_at             DateTime?  // NULL = aktív, NOT NULL = lemondva
  cancellation_reason      String?    @db.VarChar(500)  // Opcionális indoklás

  // ... relations ...
}
```

**Migráció:**
```sql
ALTER TABLE registrations
ADD COLUMN cancelled_at DATETIME NULL,
ADD COLUMN cancellation_reason VARCHAR(500) NULL;
```

### Task 2: ConsentCheckboxes Szöveg Frissítése

**Fájl:** `app/register/components/ConsentCheckboxes.tsx`

**Jelenlegi szöveg (line 78-80):**
```tsx
I acknowledge that registration cancellation is possible no later than 7 days
before the event. Cancellation policy details are available...
```

**Új szöveg (HU - VIP):**
```tsx
Tudomásul veszem, hogy regisztrációm lemondása az esemény előtt 7 nappal lehetséges.
Ha regisztrálok és nem jelenek meg (no-show), a szervezőnek jogában áll a jegy
árának megfelelő díjat (50.000 Ft) felszámítani.
```

**Új szöveg (EN - VIP):**
```tsx
I acknowledge that registration cancellation is possible no later than 7 days
before the event. If I register and do not attend (no-show), the organizer
reserves the right to charge a fee equivalent to the ticket price (50,000 HUF).
```

**Implementáció:**
```tsx
interface ConsentCheckboxesProps {
  // ... meglévő props ...
  guestType?: 'vip' | 'paying_single' | 'paying_paired' | 'applicant';
  language?: 'hu' | 'en';
}

// Kondicionális szöveg guest type alapján
const getCancellationText = (guestType: string, language: string) => {
  const isVip = guestType === 'vip' || guestType === 'applicant';

  if (language === 'hu') {
    return isVip
      ? 'Tudomásul veszem, hogy regisztrációm lemondása az esemény előtt 7 nappal lehetséges. Ha regisztrálok és nem jelenek meg (no-show), a szervezőnek jogában áll a jegy árának megfelelő díjat (50.000 Ft) felszámítani.'
      : 'Tudomásul veszem, hogy regisztrációm lemondása az esemény előtt 7 nappal lehetséges.';
  }

  return isVip
    ? 'I acknowledge that registration cancellation is possible no later than 7 days before the event. If I register and do not attend (no-show), the organizer reserves the right to charge a fee equivalent to the ticket price (50,000 HUF).'
    : 'I acknowledge that registration cancellation is possible no later than 7 days before the event.';
};
```

### Task 3: PWA Lemondás Oldal

**Új fájl:** `app/pwa/cancel/page.tsx`

**Felület leírás:**
1. Header: "Lemondás" / "Cancel Attendance"
2. Figyelmeztető szöveg (sárga warning box)
3. Opcionális indoklás textarea
4. "Mégse" és "Lemondás megerősítése" gombok
5. Sikeres lemondás utáni visszajelzés

**Komponens struktúra:**
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Warning, CheckCircle } from '@phosphor-icons/react';
import Card from '../components/ui/Card';
import Button3D from '../components/ui/Button3D';

export default function PWACancelPage() {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/registration/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pwa-bg-base flex items-center justify-center p-4">
        <Card variant="elevated" className="text-center max-w-sm">
          <CheckCircle size={64} weight="fill" className="mx-auto mb-4 text-green-500" />
          <h2 className="font-display text-xl font-semibold pwa-text-primary mb-2">
            Lemondás sikeres
          </h2>
          <p className="pwa-text-secondary text-sm mb-4">
            Részvételed lemondásra került. Köszönjük, hogy időben jeleztél!
          </p>
          <Link href="/pwa/dashboard">
            <Button3D variant="secondary">Vissza a főoldalra</Button3D>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pwa-bg-base pb-20">
      {/* Header */}
      <header className="pwa-bg-header px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/pwa/dashboard" className="pwa-text-inverse opacity-70 hover:opacity-100">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display text-xl pwa-text-inverse">Részvétel lemondása</h1>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Warning Card */}
        <Card variant="elevated" className="border-l-4 border-amber-500">
          <div className="flex gap-3">
            <Warning size={24} weight="fill" className="text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold pwa-text-primary mb-1">Biztosan lemondod?</h3>
              <p className="text-sm pwa-text-secondary">
                A lemondás végleges. A helyed felszabadul más vendég számára.
              </p>
            </div>
          </div>
        </Card>

        {/* Reason Input */}
        <Card variant="static">
          <label className="block mb-2 text-sm font-medium pwa-text-primary">
            Lemondás oka (opcionális)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Pl.: Betegség, munkahelyi elfoglaltság..."
            className="w-full p-3 rounded-lg border pwa-border bg-transparent pwa-text-primary resize-none"
            rows={3}
            maxLength={500}
          />
        </Card>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href="/pwa/dashboard" className="flex-1">
            <Button3D variant="secondary" className="w-full">Mégse</Button3D>
          </Link>
          <Button3D
            variant="danger"
            className="flex-1"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'Feldolgozás...' : 'Lemondás'}
          </Button3D>
        </div>
      </div>
    </div>
  );
}
```

### Task 4: Lemondás API Endpoint

**Új fájl:** `app/api/registration/cancel/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { EVENT_CONFIG } from '@/lib/config/event';

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    // 1. Auth check (PWA auth code from cookie)
    const cookieStore = cookies();
    const authCode = cookieStore.get('pwa_auth_code')?.value;

    if (!authCode) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Find guest by auth code
    const guest = await prisma.guest.findFirst({
      where: { pwa_auth_code: authCode },
      include: { registration: true },
    });

    if (!guest || !guest.registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // 3. Check if already cancelled
    if (guest.registration.cancelled_at) {
      return NextResponse.json({ error: 'Already cancelled' }, { status: 400 });
    }

    // 4. Check if event has passed
    const eventDate = new Date(EVENT_CONFIG.date);
    if (new Date() > eventDate) {
      return NextResponse.json({ error: 'Event has already passed' }, { status: 400 });
    }

    // 5. Check if within cancellation deadline (7 days before)
    const deadline = new Date(eventDate);
    deadline.setDate(deadline.getDate() - 7);

    if (new Date() > deadline) {
      return NextResponse.json({
        error: 'Cancellation deadline has passed (7 days before event)'
      }, { status: 400 });
    }

    // 6. Parse body
    const body = await request.json();
    const { reason } = cancelSchema.parse(body);

    // 7. Update registration
    await prisma.registration.update({
      where: { id: guest.registration.id },
      data: {
        cancelled_at: new Date(),
        cancellation_reason: reason || null,
      },
    });

    // 8. Update guest status to 'cancelled' (optional: új enum érték)
    // await prisma.guest.update({
    //   where: { id: guest.id },
    //   data: { registration_status: 'cancelled' },
    // });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Cancel registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 });
  }
}
```

### Task 5: Admin Guest List - No-Show Filter és Badge

**Fájl:** `app/admin/guests/page.tsx`

**Új filter opció:**
```typescript
// Filter options bővítése
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'invited', label: 'Invited' },
  { value: 'registered', label: 'Registered' },
  { value: 'cancelled', label: 'Cancelled' },  // ÚJ
  { value: 'no-show', label: 'No-Show' },      // ÚJ
  // ... többi
];
```

**No-show meghatározás (backend):**

**Fájl:** `lib/services/guest.ts`

```typescript
// No-show filter logika
if (filters.status === 'no-show') {
  // No-show = registered + no check-in + not cancelled + event passed
  const eventDate = new Date(EVENT_CONFIG.date);
  const eventPassed = new Date() > eventDate;

  if (!eventPassed) {
    // Event hasn't happened yet - no no-shows possible
    return { guests: [], total: 0 };
  }

  where = {
    ...where,
    registration: {
      isNot: null,
      cancelled_at: null,  // Not cancelled
    },
    checkin: null,  // No check-in record
  };
}

if (filters.status === 'cancelled') {
  where = {
    ...where,
    registration: {
      cancelled_at: { not: null },
    },
  };
}
```

**Badge megjelenítés a guest list-ben:**
```tsx
// Guest list row-ban
{guest.registration?.cancelled_at && (
  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
    Lemondva
  </span>
)}

{isNoShow(guest) && (
  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded">
    No-Show
  </span>
)}
```

### Task 6: No-Show CSV Export

**Fájl:** `app/api/admin/guests/export/route.ts`

**Új export opció:**
```typescript
// Query param: ?filter=no-show
if (filter === 'no-show') {
  guests = await getNoShowGuests();
}

async function getNoShowGuests() {
  const eventDate = new Date(EVENT_CONFIG.date);

  return prisma.guest.findMany({
    where: {
      registration: {
        isNot: null,
        cancelled_at: null,
      },
      checkin: null,
    },
    include: {
      registration: true,
    },
  });
}
```

### Task 7: PWA Dashboard - Lemondás Gomb

**Fájl:** `app/pwa/dashboard/page.tsx`

**Új gomb a dashboard-on:**
```tsx
// Quick Actions szekció - új gomb
{!registration?.cancelled_at && !isEventPassed && (
  <Link href="/pwa/cancel">
    <Button3D variant="secondary" size="sm">
      <XCircle size={18} />
      Lemondás
    </Button3D>
  </Link>
)}

{registration?.cancelled_at && (
  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
    <p className="text-sm pwa-text-secondary">
      Részvételed lemondva: {formatDate(registration.cancelled_at)}
    </p>
  </div>
)}
```

---

## Elfogadási Kritériumok

### AC1: No-Show Szöveg
- [ ] **Given** VIP vendég a regisztrációs oldalon
- [ ] **When** megtekinti a cancellation checkbox szövegét
- [ ] **Then** látja a no-show fee figyelmeztetést (50.000 Ft)
- [ ] **And** a szöveg HU/EN nyelven is helyes

### AC2: PWA Lemondás
- [ ] **Given** regisztrált vendég a PWA dashboard-on
- [ ] **When** rákattint a "Lemondás" gombra
- [ ] **Then** megnyílik a lemondás oldal megerősítő kérdéssel
- [ ] **When** megerősíti a lemondást
- [ ] **Then** a registration `cancelled_at` mező kitöltődik
- [ ] **And** sikeres visszajelzést kap

### AC3: Lemondási Határidő
- [ ] **Given** vendég 5 nappal az esemény előtt
- [ ] **When** megpróbálja lemondani
- [ ] **Then** hibaüzenetet kap, hogy lejárt a határidő

### AC4: Admin No-Show Filter
- [ ] **Given** admin az esemény után a guest list-en
- [ ] **When** kiválasztja a "No-Show" filtert
- [ ] **Then** látja azokat, akik regisztráltak de nem jelentek meg
- [ ] **And** nem látja a lemondottakat

### AC5: No-Show Export
- [ ] **Given** admin a no-show listával
- [ ] **When** exportál CSV-t
- [ ] **Then** a fájl tartalmazza a no-show vendégek adatait

---

## Függőségek

### Külső Függőségek
- Nincs új npm package

### Belső Függőségek
- EVENT_CONFIG.date helyes beállítása
- PWA auth működése
- Prisma migrate futtatása

---

## Tesztelési Stratégia

### Manuális Tesztek
1. VIP regisztráció - checkbox szöveg ellenőrzése
2. PWA lemondás - teljes flow
3. Lemondás határidő (mock dátum)
4. Admin no-show filter az esemény után (mock check-in adatok)
5. CSV export no-show listával

### E2E Tesztek (Playwright)
- `pwa-cancel.spec.ts` - PWA lemondás flow
- `admin-noshow-filter.spec.ts` - No-show filter

---

## Rollback Terv

```bash
# Kód visszaállítás:
git checkout main

# DB visszaállítás (új oszlopok törlése):
ALTER TABLE registrations DROP COLUMN cancelled_at;
ALTER TABLE registrations DROP COLUMN cancellation_reason;

# Rebuild + restart:
npm run build && pm2 restart ceog
```

---

## Becsült Érintett Fájlok

| Kategória | Fájlok |
|-----------|--------|
| Schema | `prisma/schema.prisma` |
| Migration | `prisma/migrations/XXXXXX_add_cancelled_at/` |
| Consent | `app/register/components/ConsentCheckboxes.tsx` |
| PWA | `app/pwa/cancel/page.tsx` (új), `app/pwa/dashboard/page.tsx` |
| API | `app/api/registration/cancel/route.ts` (új) |
| Admin | `app/admin/guests/page.tsx`, `lib/services/guest.ts` |
| Export | `app/api/admin/guests/export/route.ts` |
| **Összesen** | ~8 fájl (2 új) |

---

## Második Kör (Jövőbeli Bővítések)

A következő feature-ök a második körben kerülnek implementálásra:

1. **Emlékeztető emailek** - E-10 és E-7 nappal az esemény előtt
2. **No-show fizetési felszólítás** - Email template + automatikus küldés
3. **No-show statisztikák** - Dashboard widget összesítéssel
4. **RegistrationStatus enum bővítés** - `cancelled` érték

---

*Tech-Spec készítette: Claude (Architect)*
*Dátum: 2026-01-11*
