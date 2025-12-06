# CEO Gala Rendszer - Gap/Fit Analízis v2

**Készítette:** Mary (Business Analyst Agent)
**Dátum:** 2025-12-03 (Frissítve)
**Forrás:** CEOG-meeting-2025-12-03.md + Javo tisztázó válaszai
**Státusz:** ✅ VÉGLEGES

---

## 1. Vezetői Összefoglaló

### Jelenlegi Állapot
- **Epic 1-5 KÉSZ** (~80% teljes funkcionalitás)
- Core regisztráció, fizetés, check-in, ültetés működik

### Új Fő Követelmények
| # | Funkció | Prioritás | Becsült Idő |
|---|---------|-----------|-------------|
| 1 | **Vendég PWA** (letölthető app) | 🔴 KRITIKUS | 5-8 nap |
| 2 | **Jelentkező (Applicant)** flow | 🔴 KRITIKUS | 3-4 nap |
| 3 | **Páros fizetés opciók** (egyben/külön) | 🔴 KRITIKUS | 2-3 nap |
| 4 | **Ütemezett email emlékeztetők** | 🟡 KÖZEPES | 1-2 nap |
| 5 | **Páros szétválasztás** az ültetésnél | 🟡 KÖZEPES | 1 nap |
| 6 | **Telefonszám kötelező** | 🟢 EGYSZERŰ | 0.5 nap |

**Összes becsült ráfordítás: 12-18 nap**
**Deadline: December 31 → Go-live: Január 5**

---

## 2. Megerősített Döntések

### Technikai Döntések ✅
| Döntés | Választás | Indoklás |
|--------|-----------|----------|
| **Fizetési szolgáltató** | Stripe | Gyors integráció, megbízható |
| **Push notification** | Firebase (FCM) | Ingyenes, jól dokumentált |
| **PWA belépés** | QR kód alapú | Egyszerű, biztonságos |
| **Branding** | "Powered by MyForge Labs" | Marketing érték |

### Üzleti Döntések ✅
| Döntés | Részletek |
|--------|-----------|
| **Web regisztráció** | Megmarad a PWA mellett |
| **PWA letöltés** | Csak regisztráció után |
| **Jelentkező jóváhagyás előtt** | NEM léphet be a PWA-ba |
| **Páros fizetés** | Fő vendég fizet mindig, de választhat módot |
| **Páros ültetés** | Default: együtt mozognak, de admin szétválaszthatja |
| **Admin push küldés** | Csak web dashboardból (nem PWA-ból) |

---

## 3. Új Epic-ek és Story-k

### Epic 6: Vendég PWA (Progressive Web App)
**Prioritás:** 🔴 KRITIKUS
**Becsült idő:** 5-8 nap

| Story | Leírás | Idő |
|-------|--------|-----|
| **6-1** | PWA alapok (manifest.json, service worker, install prompt) | 1 nap |
| **6-2** | QR kód alapú bejelentkezés (scan vagy kód beírás) | 1 nap |
| **6-3** | Vendég profil megtekintés és szerkesztés | 1-2 nap |
| **6-4** | QR kód megjelenítés és letöltés (offline is!) | 0.5 nap |
| **6-5** | Asztalszám megjelenítés | 0.5 nap |
| **6-6** | Firebase Push Notification integráció | 1-2 nap |
| **6-7** | Offline cache stratégia (QR kód) | 0.5 nap |
| **6-8** | "Powered by MyForge Labs" branding | 0.5 nap |

#### PWA Funkciók Részletezve

```
┌─────────────────────────────────────────────────────────┐
│  📱 CEO Gála 2025 - Vendég App                         │
│  Powered by MyForge Labs                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 Kovács János                                        │
│  VIP Vendég                                             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🎫 DIGITÁLIS JEGY                              │   │
│  │  ┌─────────┐                                    │   │
│  │  │ QR KÓD  │  [Letöltés]                        │   │
│  │  │  📷     │                                    │   │
│  │  └─────────┘                                    │   │
│  │  Offline is elérhető ✓                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🪑 Asztalszám: 17 (VIP)                               │
│                                                         │
│  ────────────────────────────────────────────────────  │
│                                                         │
│  📋 ADATAIM                                             │
│  ├─ Név: Kovács János                                  │
│  ├─ Email: kovacs@example.com                          │
│  ├─ Telefon: +36 30 123 4567                           │
│  ├─ Cég: ABC Kft.                                      │
│  ├─ Beosztás: Ügyvezető                                │
│  ├─ Diétás igény: Gluténmentes                         │
│  └─ Ültetési preferencia: Kiss Péter mellett           │
│                                                         │
│  [✏️ Adatok módosítása]                                 │
│                                                         │
│  ────────────────────────────────────────────────────  │
│                                                         │
│  👫 PARTNER                                             │
│  Kovácsné Éva                                           │
│  [Partner adatok megtekintése]                          │
│                                                         │
│  ────────────────────────────────────────────────────  │
│                                                         │
│  📍 HELYSZÍN                                            │
│  Marriott Hotel Budapest                                │
│  [Térkép megnyitása]                                    │
│                                                         │
│  🚗 Parkolás: B2 szint, VIP parkoló                    │
│  👔 Dress code: Black tie                               │
│                                                         │
│  ⏱️ Még 5 nap az eseményig!                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### PWA Belépési Flow

```
┌────────────────────────────────────────┐
│  CEO Gála 2025                         │
│  ───────────────────────────────       │
│                                        │
│  Üdvözlünk!                            │
│                                        │
│  Lépj be a jegyeden található          │
│  QR kóddal vagy regisztrációs kóddal.  │
│                                        │
│  ┌────────────────────────────────┐    │
│  │  [📷 QR Kód Beolvasása]        │    │
│  └────────────────────────────────┘    │
│                                        │
│  vagy                                  │
│                                        │
│  Regisztrációs kód:                    │
│  ┌────────────────────────────────┐    │
│  │  CEOG-________                 │    │
│  └────────────────────────────────┘    │
│  [Belépés]                             │
│                                        │
│  ───────────────────────────────       │
│  Nincs QR kódod?                       │
│  [📧 Email-es belépés kérése]          │
│                                        │
│  ───────────────────────────────       │
│  Powered by MyForge Labs               │
└────────────────────────────────────────┘
```

---

### Epic 7: Jelentkező (Applicant) Flow
**Prioritás:** 🔴 KRITIKUS
**Becsült idő:** 3-4 nap

| Story | Leírás | Idő |
|-------|--------|-----|
| **7-1** | GuestType.applicant + RegistrationStatus.pending_approval enum | 0.5 nap |
| **7-2** | Publikus jelentkezési oldal (`/apply`) | 1 nap |
| **7-3** | Admin: Jelentkezések listája + jóváhagyás/elutasítás | 1 nap |
| **7-4** | Automatikus email: elfogadva (magic link) vagy elutasítva | 0.5-1 nap |

#### Jelentkezési Form Kötelező Mezők

| Mező | Kötelező | Megjegyzés |
|------|----------|------------|
| Név | ✅ | |
| Email | ✅ | |
| Telefonszám | ✅ | |
| Cég | ✅ | |
| Beosztás | ✅ | |
| Diétás igény | ✅ | |
| Ültetési preferencia | ✅ | |

#### Jelentkezési Flow

```
┌─────────────────┐
│  Publikus URL   │
│  /apply         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Jelentkezési    │
│ form kitöltése  │
│ (kötelező mezők)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ "Köszönjük!     │
│ Hamarosan       │
│ értesítünk"     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Admin Dashboard: Jelentkezések      │
│ ┌─────────────────────────────────┐ │
│ │ Kovács János | ABC Kft | CEO    │ │
│ │ [✅ Jóváhagyás] [❌ Elutasítás] │ │
│ └─────────────────────────────────┘ │
└────────┬───────────────┬────────────┘
         │               │
    Jóváhagyva      Elutasítva
         │               │
         ▼               ▼
┌─────────────────┐ ┌─────────────────┐
│ Email:          │ │ Email:          │
│ "Örömmel        │ │ "Sajnáljuk,     │
│ értesítünk..."  │ │ a helyek        │
│ + Magic Link    │ │ elfogytak"      │
│ (→ fizetős flow)│ │                 │
└─────────────────┘ └─────────────────┘
```

---

### Epic 8: Páros Jegy Fizetési Opciók
**Prioritás:** 🔴 KRITIKUS
**Becsült idő:** 2-3 nap

| Story | Leírás | Idő |
|-------|--------|-----|
| **8-1** | "Fizetés egyben / külön" opció a regisztrációs formban | 0.5 nap |
| **8-2** | Külön fizetési mód választás (fővendég kártya, partner átutalás) | 1 nap |
| **8-3** | 2 Stripe line item vagy 2 session kezelése | 1 nap |
| **8-4** | Részleges fizetés státusz kezelése | 0.5 nap |

#### Fizetési Logika

```
Páros regisztráció:

┌─────────────────────────────────────────────────────────┐
│ FIZETÉSI OPCIÓK                                         │
│                                                         │
│ ○ Egyben fizetek (mindkét jegyet)                       │
│   └─ 1 Stripe session, 2 line item                      │
│                                                         │
│ ● Külön-külön fizetek                                   │
│   ├─ Saját jegyem: [Kártya ▼]      30.000 Ft           │
│   └─ Partner jegye: [Átutalás ▼]   30.000 Ft           │
│                                                         │
│ Összesen: 60.000 Ft                                     │
│                                                         │
│ [Tovább a fizetéshez]                                   │
└─────────────────────────────────────────────────────────┘

Mindkét esetben a FŐ VENDÉG indítja a folyamatot!
```

#### Adatbázis Módosítás

```prisma
model Payment {
  // ... existing fields ...

  // Új mező: kinek a jegye
  ticket_for    TicketFor  @default(self)  // self, partner, combined
}

enum TicketFor {
  self      // Saját jegy
  partner   // Partner jegye
  combined  // Mindkettő egyben
}
```

---

### Epic 9: Ütemezett Email Emlékeztetők
**Prioritás:** 🟡 KÖZEPES
**Becsült idő:** 1-2 nap

| Story | Leírás | Idő |
|-------|--------|-----|
| **9-1** | Automatikus fizetési emlékeztető (pending → X nap után) | 1 nap |
| **9-2** | Admin: Emlékeztető beállítások (napok száma, max küldés) | 0.5 nap |
| **9-3** | Emlékeztető email template | 0.5 nap |

#### Emlékeztető Logika

```
Beállítások:
- Első emlékeztető: 3 nap után
- Második emlékeztető: 7 nap után
- Végső felszólítás: 14 nap után (+ figyelmeztetés a törlésre)

Cron job (napi 1x):
1. Lekérdezés: pending fizetések
2. Ellenőrzés: hány nap telt el
3. Email küldés (ha esedékes)
4. Log tárolás (ne küldjön duplán)
```

---

### Epic 10: Admin Bővítések & Kisebb Módosítások
**Prioritás:** 🟡 KÖZEPES
**Becsült idő:** 2-3 nap

| Story | Leírás | Idő |
|-------|--------|-----|
| **10-1** | Telefonszám mező hozzáadása (Guest model + formok) | 0.5 nap |
| **10-2** | Páros vendégek szétválasztása az ültetésnél | 1 nap |
| **10-3** | Check-in utáni asztalszám értesítés (push + email) | 0.5 nap |
| **10-4** | Admin manuális regisztráció létrehozás | 1 nap |

#### Páros Szétválasztás UX

```
Jobb-klikk a páros vendég chip-en:

┌─────────────────────────┐
│ 📋 Kovács pár           │
│ ─────────────────────── │
│ 🔓 Szétválasztás        │ ← Külön mozgathatók lesznek
│ 🔗 Újra összekapcsolás  │ ← Ha már szét vannak
│ ─────────────────────── │
│ 📝 Megjegyzés           │
│ ❌ Eltávolítás          │
└─────────────────────────┘

Szétválasztás után:
- Két külön chip jelenik meg
- Halvány vonal köti össze őket (vizuális jelzés)
- Egyenként mozgathatók
```

---

## 4. Meglévő Funkciók Állapota

### ✅ Teljesen Kész (Nincs Módosítás)

| Funkció | Epic | Megjegyzés |
|---------|------|------------|
| CSV vendéglista import | Epic 1 | OK |
| Magic link generálás/validálás | Epic 1 | OK |
| VIP regisztráció | Epic 1 | OK |
| Stripe Checkout | Epic 2 | OK |
| Stripe Webhook | Epic 2 | OK |
| QR kód generálás | Epic 2 | OK |
| E-ticket email | Epic 2 | OK |
| Check-in scanner | Epic 3 | OK |
| Check-in napló | Epic 3 | OK |
| Asztal CRUD | Epic 4 | OK |
| Drag-and-drop ültetés | Epic 4 | OK |
| Email template szerkesztő | Epic 5 | ✅ Már működik! |
| Profil mezők (diéta, preferencia) | Epic 5 | OK |
| Billing form | Epic 5 | OK |

### ⚠️ Módosítás Szükséges

| Funkció | Módosítás | Epic |
|---------|-----------|------|
| Guest model | + phone mező | Epic 10 |
| Paid regisztráció form | + fizetési opciók | Epic 8 |
| Ültetési térkép | + szétválasztás | Epic 10 |
| Check-in success | + asztalszám push | Epic 10 |

---

## 5. Időterv Javaslat

```
📅 DECEMBER 2025

Hét 1 (Dec 3-8):
├─ Dec 3-4:  Epic 10 (telefonszám, kisebb módosítások)
├─ Dec 5-6:  Epic 7 (Jelentkező flow)
└─ Dec 7-8:  Epic 8 (Páros fizetési opciók)

Hét 2 (Dec 9-15):
├─ Dec 9-10:  Epic 6 (PWA alapok, auth)
├─ Dec 11-12: Epic 6 (PWA profil, QR)
├─ Dec 13-14: Epic 6 (PWA push, offline)
└─ Dec 15:    Epic 9 (Email emlékeztetők)

Hét 3 (Dec 16-22):
├─ Dec 16-18: Integráció, tesztelés
├─ Dec 19-20: Bug fixing
└─ Dec 21-22: UAT előkészítés

Hét 4 (Dec 23-31):
├─ Dec 23-27: UAT (ügyfél tesztelés)
├─ Dec 28-30: Végső bugfix, finomhangolás
└─ Dec 31:    Freeze, production deploy előkészítés

📅 JANUÁR 2026
└─ Jan 5:    🚀 GO-LIVE
```

---

## 6. Technikai Architektúra Bővítés

### PWA Struktúra

```
app/
├── (pwa)/                      # PWA route group
│   ├── layout.tsx              # PWA layout (no header)
│   ├── page.tsx                # PWA landing/login
│   ├── dashboard/              # Vendég dashboard
│   │   └── page.tsx
│   ├── profile/                # Profil szerkesztés
│   │   └── page.tsx
│   ├── ticket/                 # QR kód megtekintés
│   │   └── page.tsx
│   └── manifest.json           # PWA manifest
├── apply/                      # Jelentkezési oldal (publikus)
│   └── page.tsx
└── api/
    ├── pwa/                    # PWA specifikus API-k
    │   ├── auth/route.ts       # QR/code alapú auth
    │   └── push/route.ts       # Push token regisztráció
    └── admin/
        ├── applicants/         # Jelentkező kezelés
        │   └── route.ts
        └── reminders/          # Email emlékeztetők
            └── route.ts

public/
├── sw.js                       # Service Worker
├── manifest.json               # PWA manifest
└── icons/                      # App ikonok
    ├── icon-192.png
    └── icon-512.png
```

### Firebase Konfiguráció

```typescript
// lib/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const messaging = typeof window !== 'undefined'
  ? getMessaging(app)
  : null;
```

---

## 7. Adatbázis Módosítások Összefoglalva

```prisma
// Módosított Guest model
model Guest {
  // ... existing fields ...

  phone              String?   @db.VarChar(20)  // ÚJ: Telefonszám
  is_pair_separated  Boolean   @default(false) // ÚJ: Pár szétválasztva
  push_token         String?   @db.VarChar(500) // ÚJ: Firebase push token
  pwa_auth_code      String?   @unique @db.VarChar(20) // ÚJ: PWA belépési kód
}

// Módosított Payment model
model Payment {
  // ... existing fields ...

  ticket_for    TicketFor  @default(combined)  // ÚJ: Kinek a jegye
}

// Új enum
enum TicketFor {
  self      // Saját jegy
  partner   // Partner jegye
  combined  // Mindkettő egyben
}

// ÚJ: Email emlékeztető napló
model EmailReminder {
  id              Int      @id @default(autoincrement())
  guest_id        Int
  reminder_type   String   @db.VarChar(50)  // payment_reminder_1, payment_reminder_2, etc.
  sent_at         DateTime @default(now())

  guest Guest @relation(fields: [guest_id], references: [id])

  @@index([guest_id])
  @@map("email_reminders")
}
```

---

## 8. Kockázatok és Mitigáció

| Kockázat | Valószínűség | Hatás | Mitigáció |
|----------|--------------|-------|-----------|
| PWA komplexitás | Közepes | Magas | MVP funkciókra fókuszálás |
| Firebase setup | Alacsony | Közepes | Jól dokumentált, 1 napos munka |
| Páros fizetés edge case-ek | Közepes | Közepes | Alapos tesztelés |
| Időhiány | Közepes | Magas | Prioritizálás, MVP megközelítés |
| Push notification engedély | Közepes | Alacsony | Fallback: email |

---

## 9. Prioritási Sorrend (Ha Időhiány Van)

| Prioritás | Funkció | Kihagyható? |
|-----------|---------|-------------|
| 1 | Telefonszám kötelező | ❌ Nem |
| 2 | Jelentkező flow | ❌ Nem |
| 3 | PWA core (QR, asztalszám) | ❌ Nem |
| 4 | Páros fizetés külön | ⚠️ Részben (csak "egyben" opció) |
| 5 | PWA push notification | ⚠️ Részben (email fallback) |
| 6 | Email emlékeztetők | ⚠️ Manuális admin workaround |
| 7 | Páros szétválasztás | ⚠️ Admin DB módosítás workaround |

---

## 10. Következő Lépések

1. **ASAP**: IT admin kapcsolatfelvétel (hosting, email SMTP)
2. **Dec 4**: Epic 6-10 story-k formalizálása (PM agent)
3. **Dec 4**: Architect agent: Technikai design review
4. **Dec 5**: Fejlesztés indítás

---

*Dokumentum vége - Készítette: Mary (Business Analyst) @ MyForge Labs*
