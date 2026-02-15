# Email Scheduler Bugs & Fixes

**Dátum:** 2026-02-12
**Azonosította:** Bug investigation session
**Státusz:** ✅ Completed

---

## Mai változtatások összefoglalása (2026-02-12) - ceog-dev

### Bug Fixek

| # | Probléma | Fájl | Státusz |
|---|----------|------|---------|
| 1 | Email tartalom nem mentődik logba | `email-scheduler.ts:187-193` | ✅ Javítva |
| 2 | Magic link hiányzik invitation_reminder-ből | `email-scheduler.ts:131` | ✅ Javítva |
| 3 | "Show more guests" nem kattintható | `ScheduledEmailsDashboard.tsx` | ✅ Javítva |

### Új Funkciók

| # | Feature | Fájl | Státusz |
|---|---------|------|---------|
| 4 | Bulk Email Megerősítő Modal | `ScheduledEmailsDashboard.tsx` | ✅ Kész |
| 5 | Process Now Megerősítő Modal | `ScheduledEmailsDashboard.tsx` | ✅ Kész |
| 6 | Guest Status oszlop a scheduled emails táblában | `ScheduledEmailsDashboard.tsx` | ✅ Kész |
| 7 | Oszlopok rendezhetősége (6 oszlop) | `ScheduledEmailsDashboard.tsx` | ✅ Kész |
| 8 | `invitation_reminder_v2` email template | `email-templates.ts` | ✅ Kész |
| 9 | Pagination (25/50/100) teljes lapozással | `ScheduledEmailsDashboard.tsx` | ✅ Kész |
| 10 | Név szerinti keresés | `ScheduledEmailsDashboard.tsx` | ✅ Kész |
| 11 | Process Now modal fix (helyes összesítés) | `ScheduledEmailsDashboard.tsx` | ✅ Kész |
| 12 | API limit fix (limit=2000 a pagination-höz) | `ScheduledEmailsDashboard.tsx` | ✅ Kész |

### Részletes leírások (új elemek)

#### 8. `invitation_reminder_v2` email template
- **Új subject**: "CEO Gala 2026 – Kindly Confirm Your Attendance"
- **Új sor**: "Please find below the confirmed registration link for your convenience."
- **Módosított**: "via the same link" (volt: "by clicking the registration button")
- **Fájlok**: `email-templates.ts`, `email-scheduler.ts` (magicLinkTemplates)

#### 9. Pagination (25/50/100) teljes lapozással
- Oldalméretek: 25, 50, 100
- Teljes navigáció: ← 1 2 3 ... N →
- "Showing X-Y of Z" visszajelzés

#### 10. Név szerinti keresés
- Guest name és email alapján keres
- Valós idejű szűrés

#### 11-12. Process Now modal és API limit fix
- **Probléma**: A modal csak 50 emailt mutatott 185 helyett
- **Ok**: Az API `limit=50` volt alapértelmezetten
- **Megoldás**: `limit=2000` hozzáadása a fetchEmails híváshoz
- A modal most `stats.pending` értéket használ (szerver oldali összesítés)

---

## 1. Email tartalom nem mentődik a logba

**Fájl:** `lib/services/email-scheduler.ts`
**Sor:** 187-193
**Súlyosság:** Medium

### Probléma
A scheduled emailek küldésekor a `logEmailDelivery` függvény nem kapja meg a `htmlBody` és `textBody` paramétereket, így az email tartalom nem kerül mentésre az `EmailLog` táblába.

### Jelenlegi kód
```typescript
await logEmailDelivery({
  guestId: guest.id,
  recipient: guest.email,
  subject: rendered.subject,
  success: true,
  emailType: scheduled.template_slug,
  // htmlBody és textBody HIÁNYZIK!
});
```

### Javítás
```typescript
await logEmailDelivery({
  guestId: guest.id,
  recipient: guest.email,
  subject: rendered.subject,
  success: true,
  emailType: scheduled.template_slug,
  htmlBody: rendered.html,   // HOZZÁADNI
  textBody: rendered.text,   // HOZZÁADNI
});
```

---

## 2. Magic link nem generálódik invitation_reminder-hez

**Fájl:** `lib/services/email-scheduler.ts`
**Sor:** 131
**Súlyosság:** Critical

### Probléma
Az `invitation_reminder` template használja a `{{magicLinkUrl}}` változót, de nincs benne a magic link generáló template listában. Emiatt a gomb nem tartalmaz működő linket.

### Jelenlegi kód
```typescript
const magicLinkTemplates = ['magic_link', 'magic-link', 'invitation', 'applicant_approval'];
```

### Javítás
```typescript
const magicLinkTemplates = ['magic_link', 'magic-link', 'invitation', 'applicant_approval', 'invitation_reminder'];
```

---

## 3. "Show more guests" nem kattintható

**Fájl:** `app/admin/scheduled-emails/ScheduledEmailsDashboard.tsx`
**Sor:** 1384-1388
**Súlyosság:** Medium (UX)

### Probléma
A Bulk Email preview listában a "+ X more guests..." szöveg nem kattintható. A felhasználó nem tudja megnézni az összes szűrt vendéget.

### Jelenlegi kód
```tsx
{bulkPreviewGuests.length > 50 && (
  <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
    + {bulkPreviewGuests.length - 50} more guests...
  </div>
)}
```

### Javítás
```tsx
const [showAllGuests, setShowAllGuests] = useState(false);
const displayedGuests = showAllGuests ? bulkPreviewGuests : bulkPreviewGuests.slice(0, 50);

// A táblázatban displayedGuests.map() használata
// És a "more guests" div helyett:
{bulkPreviewGuests.length > 50 && !showAllGuests && (
  <button
    onClick={() => setShowAllGuests(true)}
    className="w-full px-4 py-2 bg-yellow-100 text-center text-sm text-yellow-700 hover:bg-yellow-200 cursor-pointer"
  >
    + {bulkPreviewGuests.length - 50} more guests... (click to show all)
  </button>
)}
{showAllGuests && bulkPreviewGuests.length > 50 && (
  <button
    onClick={() => setShowAllGuests(false)}
    className="w-full px-4 py-2 bg-gray-100 text-center text-sm text-gray-600 hover:bg-gray-200 cursor-pointer"
  >
    Show less
  </button>
)}
```

---

## 4. Általános Bulk Email Megerősítő Modal

**Fájl:** `app/admin/scheduled-emails/ScheduledEmailsDashboard.tsx`
**Súlyosság:** High (UX - Prevention)
**Komplexitás:** ⭐⭐ Közepes
**Mockup:** `docs/mockups/bulk-email-confirm-modal-mockup.html`

### Leírás
**MINDEN** bulk email küldés előtt megjelenik egy megerősítő modal, amely:
- Megjeleníti a kiválasztott template nevét és ütemezési időt
- **Bar chart vizualizációval** mutatja a címzettek státusz szerinti bontását
- Admin a látottak alapján dönt a küldésről
- Nincs template-specifikus szabály → egyszerű karbantartás, új template-ekre is működik

```
┌─────────────────────────────────────────────────┐
│  📧 Bulk Email Küldés Megerősítése              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Template: Invitation Reminder                  │
│  Ütemezés: 2026-02-12 14:00                     │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Címzettek státusz szerinti bontása:            │
│                                                 │
│  ┌──────────────┬────────┬───────────────────┐  │
│  │ Státusz      │ Darab  │ Bar chart         │  │
│  ├──────────────┼────────┼───────────────────┤  │
│  │ Registered   │   54   │ ██████████████████│  │
│  │ Invited      │   15   │ █████             │  │
│  │ Declined     │    6   │ ██                │  │
│  │ Pending      │    2   │ █                 │  │
│  └──────────────┴────────┴───────────────────┘  │
│                                                 │
│  Összesen: 77 vendég                            │
│                                                 │
│  [Mégsem]                    [Jóváhagyás]       │
└─────────────────────────────────────────────────┘
```

### Implementáció
```typescript
// Új state
const [showConfirmModal, setShowConfirmModal] = useState(false);

// Státusz bontás számítása
const statusBreakdown = useMemo(() => {
  const counts: Record<string, number> = {};
  bulkPreviewGuests.forEach(g => {
    const status = g.registration_status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}, [bulkPreviewGuests]);

// "Schedule" gomb → modal megnyitása (nem közvetlen küldés)
const handleScheduleClick = () => setShowConfirmModal(true);

// Modal "Jóváhagyás" gomb → tényleges küldés
const handleConfirmSend = () => {
  setShowConfirmModal(false);
  scheduleBulkEmails(); // eredeti API hívás
};
```

### Előnyök
| Előny | Leírás |
|-------|--------|
| Egyszerű | Nincs template-specifikus szabály karbantartás |
| Univerzális | Minden template-re működik, beleértve újakat |
| Átlátható | Admin látja a teljes képet, ő dönt |
| Kevés kód | 1 modal komponens, nincs rule engine |

---

## Kapcsolódó fájlok

| Fájl | Szerep |
|------|--------|
| `lib/services/email-scheduler.ts` | Email ütemezés és küldés |
| `lib/services/email.ts` | Email küldés és logolás |
| `app/admin/scheduled-emails/ScheduledEmailsDashboard.tsx` | Admin UI |

---

## Incident summary (2026-02-11)

83 invitation_reminder email ment ki hibásan:
- 15 Invited (helyes)
- 54 Registered (hibás - már regisztráltak)
- 6 Declined (hibás - visszautasították)
- 1 Pending
- 1 ismeretlen

**Valószínű ok:** Felhasználó összetévesztette a "Guest Type: Invited" és "Registration Status: Invited" szűrőket.

**Analízis CSV:** `docs/invitation-reminder-recipients-analysis.csv`
