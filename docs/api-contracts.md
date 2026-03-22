# API Szerződések - CEO Gala Regisztrációs Rendszer

**Generálva:** 2026-03-22
**Verzió:** 4.1.0
**Összes endpoint:** 83 HTTP endpoint 62 route fájlban (GET: 33, POST: 30, PATCH: 8, DELETE: 11, PUT: 1)

---

## Tartalomjegyzék

1. [Áttekintés](#1-áttekintés)
2. [Authentikáció & Jogosultságok](#2-authentikáció--jogosultságok)
3. [Vendég Regisztráció (Publikus)](#3-vendég-regisztráció-publikus)
4. [Jelentkezés (Publikus)](#4-jelentkezés-publikus)
5. [Fizetés (Stripe)](#5-fizetés-stripe)
6. [Jegy Kezelés](#6-jegy-kezelés)
7. [Check-in Rendszer](#7-check-in-rendszer)
8. [Admin - Vendégkezelés](#8-admin---vendégkezelés)
9. [Admin - Asztalok & Ültetés](#9-admin---asztalok--ültetés)
10. [Admin - Kijelző & Valós Idejű](#10-admin---kijelző--valós-idejű)
11. [Admin - Fizetések](#11-admin---fizetések)
12. [Admin - Jelentkezők](#12-admin---jelentkezők)
13. [Admin - Email Kezelés](#13-admin---email-kezelés)
14. [Admin - Ütemezett Emailek](#14-admin---ütemezett-emailek)
15. [Admin - Ütemező Konfiguráció](#15-admin---ütemező-konfiguráció)
16. [Admin - Felhasználók](#16-admin---felhasználók)
17. [Admin - Dashboard & Statisztikák](#17-admin---dashboard--statisztikák)
18. [Admin - Audit Log](#18-admin---audit-log)
19. [Admin - Teszt Eredmények](#19-admin---teszt-eredmények)
20. [PWA Vendég Alkalmazás](#20-pwa-vendég-alkalmazás)
21. [Rendszer](#21-rendszer)
22. [Biztonsági Megjegyzések](#22-biztonsági-megjegyzések)

---

## 1. Áttekintés

### API Architektúra

- **Framework:** Next.js 14+ App Router (`app/api/**/route.ts`)
- **Formátum:** JSON (kivéve SSE stream, CSV export)
- **Auth:** NextAuth JWT (admin/staff), Magic Link (vendég), PWA Session Cookie (app)
- **CSRF:** Origin/Referer header validáció (kivéve Stripe webhook)
- **Rate Limiting:** IP + vendég-szintű (email küldésnél)

### Válasz Formátum (általános)

Sikeres válasz:
```json
{ "success": true, "data": { ... } }
```

Hiba válasz:
```json
{ "error": "ERROR_CODE", "message": "Leírás" }
```

### HTTP Státusz Kódok

| Kód | Jelentés |
|-----|----------|
| 200 | Sikeres |
| 201 | Létrehozva |
| 400 | Hibás kérés (validáció) |
| 401 | Nem azonosított |
| 403 | Hozzáférés megtagadva |
| 404 | Nem található |
| 409 | Ütközés (duplikáció) |
| 429 | Túl sok kérés (rate limit) |
| 500 | Szerver hiba |

---

## 2. Authentikáció & Jogosultságok

### NextAuth (Admin/Staff)

```
POST /api/auth/[...nextauth]
```

- **Provider:** CredentialsProvider (email + jelszó)
- **Session:** JWT stratégia, 8 óra lejárat
- **Payload:** `{ id, email, role, name }`
- **Login oldal:** `/admin/login`

### Jogosultsági Mátrix

| Endpoint csoport | Admin | Staff | Vendég | Publikus |
|-------------------|-------|-------|--------|----------|
| `/api/admin/*` | ✅ | ❌ (kivéve check-in) | ❌ | ❌ |
| `/api/admin/checkin-log` | ✅ | ✅ (read-only) | ❌ | ❌ |
| `/api/checkin/*` | ✅ | ✅ | ❌ | ❌ |
| `/api/registration/*` | ❌ | ❌ | ✅ (magic link) | ❌ |
| `/api/pwa/*` | ❌ | ❌ | ✅ (session cookie) | ❌ |
| `/api/apply` | ❌ | ❌ | ❌ | ✅ |
| `/api/health` | ❌ | ❌ | ❌ | ✅ |

---

## 3. Vendég Regisztráció (Publikus)

### GET /api/registration/status

Vendég regisztrációs állapot lekérdezése magic link alapján.

**Auth:** Magic Link (code + email query paraméterek)

**Query paraméterek:**
| Paraméter | Típus | Kötelező | Leírás |
|-----------|-------|----------|--------|
| `code` | string | ✅ | Magic link hash |
| `email` | string | ✅ | Vendég email cím |

**Válasz (200):**
```json
{
  "guest": {
    "id": 1,
    "first_name": "János",
    "last_name": "Kovács",
    "email": "janos@example.com",
    "guest_type": "invited",
    "registration_status": "invited"
  },
  "registration": null,
  "payment": null,
  "ticket": null
}
```

---

### POST /api/registration/confirm

VIP vendég regisztráció megerősítése vagy elutasítása.

**Auth:** Nincs (vendég azonosítás guest_id alapján)

**Request Body:**
```json
{
  "guest_id": 1,
  "attendance": "confirm",
  "title": "Dr.",
  "phone": "+36301234567",
  "company": "ACME Kft.",
  "position": "Igazgató",
  "dietary_requirements": "vegetáriánus",
  "seating_preferences": "ablak mellé",
  "gdpr_consent": true,
  "cancellation_accepted": true,
  "has_partner": true,
  "partner_first_name": "Éva",
  "partner_last_name": "Nagy",
  "partner_email": "eva@example.com",
  "partner_phone": "+36309876543",
  "partner_dietary_requirements": "gluténmentes"
}
```

**Válasz (200):** Regisztráció adatai QR jeggyel.

---

### POST /api/registration/submit

Fizető vendég regisztráció benyújtása (számlázási adatokkal).

**Auth:** Nincs (vendég azonosítás guest_id alapján)

**Request Body:**
```json
{
  "guest_id": 1,
  "ticket_type": "paid_single",
  "payment_method": "card",
  "billing": {
    "name": "Kovács János",
    "company": "ACME Kft.",
    "tax_number": "12345678-2-41",
    "address": "1054 Budapest, Szabadság tér 1."
  },
  "title": "Dr.",
  "phone": "+36301234567",
  "company": "ACME Kft.",
  "position": "Igazgató",
  "gdpr_consent": true,
  "cancellation_accepted": true
}
```

**Válasz (200):** Regisztráció adatai.

---

### POST /api/registration/cancel

Vendég regisztráció lemondása (PWA-ból).

**Auth:** PWA session cookie

**Request Body:**
```json
{
  "reason": "Nem tudok részt venni"
}
```

**Válasz (200):**
```json
{ "success": true, "message": "Registration cancelled" }
```

---

### GET /api/registration/cancel-status

Lemondási lehetőség ellenőrzése (határidő: 7 nap az esemény előtt).

**Auth:** PWA session cookie

**Válasz (200):**
```json
{
  "canCancel": true,
  "deadline": "2026-03-20T00:00:00.000Z",
  "daysRemaining": 5
}
```

---

### POST /api/register/request-link

Új magic link kérése (elveszett/lejárt link esetén).

**Auth:** Publikus (reCAPTCHA + IP rate limit)

**Request Body:**
```json
{
  "email": "vendeg@example.com",
  "recaptchaToken": "..."
}
```

**Rate Limit:** 10 kérés/óra/IP

**Válasz (200):**
```json
{ "success": true, "message": "Ha a megadott email cím szerepel a rendszerben, elküldtük az új linket." }
```

---

### POST /api/email/send-magic-link

Magic link emailek küldése vendégeknek (admin által).

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "guest_ids": [1, 2, 3],
  "template_slug": "magic_link"
}
```

**Válasz (200):**
```json
{
  "success": true,
  "sent": 3,
  "failed": 0,
  "errors": []
}
```

---

## 4. Jelentkezés (Publikus)

### POST /api/apply

Nem meghívott vendég jelentkezése az eseményre.

**Auth:** Publikus

**Request Body:**
```json
{
  "first_name": "Péter",
  "last_name": "Szabó",
  "email": "peter@example.com",
  "title": "Dr.",
  "phone": "+36301234567",
  "company": "Tech Kft.",
  "position": "CTO",
  "application_message": "Szeretnék részt venni az eseményen."
}
```

**Válasz (201):**
```json
{
  "success": true,
  "guest": { "id": 10, "registration_status": "pending_approval" }
}
```

---

## 5. Fizetés (Stripe)

### POST /api/stripe/create-checkout

Stripe Checkout Session létrehozása.

**Auth:** Nincs (registration_id alapján)

**Request Body:**
```json
{
  "registration_id": 1,
  "success_url": "https://ceogala.hu/payment/success",
  "cancel_url": "https://ceogala.hu/payment/cancel"
}
```

**Árak:**
- Egyéni jegy: 25 000 HUF
- Páros jegy: 45 000 HUF

**Válasz (200):**
```json
{
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

---

### POST /api/stripe/redirect-to-checkout

Form POST handler - Stripe Checkout létrehozás és átirányítás.

**Auth:** Nincs (registration_id alapján)

**Request Body (form):**
```json
{
  "registration_id": 1
}
```

**Válasz:** 303 redirect a Stripe Checkout URL-re.

---

### POST /api/stripe/webhook

Stripe webhook fogadása (fizetés megerősítés).

**Auth:** Stripe aláírás validáció (`STRIPE_WEBHOOK_SECRET`)

**Események:**
- `checkout.session.completed` → Fizetés sikeres, QR jegy generálás + email küldés

**Fejlécek:**
```
stripe-signature: t=...,v1=...
Content-Type: application/json (raw body szükséges)
```

**Válasz (200):**
```json
{ "received": true }
```

---

## 6. Jegy Kezelés

### POST /api/ticket/generate

QR jegy generálása regisztrációhoz.

**Auth:** Nincs (belső használat)

**Request Body:**
```json
{
  "registration_id": 1,
  "regenerate": false
}
```

**Válasz (200):**
```json
{
  "success": true,
  "token": "eyJ...",
  "qr_code": "data:image/png;base64,..."
}
```

---

### POST /api/ticket/verify

QR jegy token ellenőrzése.

**Auth:** Nincs

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Válasz (200):**
```json
{
  "success": true,
  "valid": true,
  "data": {
    "registration_id": 1,
    "guest_id": 1,
    "ticket_type": "vip_free"
  }
}
```

---

## 7. Check-in Rendszer

### POST /api/checkin/validate

QR kód validálása check-in előtt.

**Auth:** NextAuth JWT (admin vagy staff)

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Válasz (200) - Zöld kártya (érvényes):**
```json
{
  "status": "valid",
  "color": "green",
  "guest": {
    "id": 1,
    "name": "Dr. Kovács János",
    "guest_type": "invited",
    "ticket_type": "vip_free"
  }
}
```

**Válasz (200) - Sárga kártya (már bejelentkezett):**
```json
{
  "status": "already_checked_in",
  "color": "yellow",
  "guest": { ... },
  "checkin": {
    "checked_in_at": "2026-03-27T19:15:00Z",
    "staff_name": "Staff User"
  }
}
```

**Válasz (200) - Piros kártya (érvénytelen):**
```json
{
  "status": "invalid",
  "color": "red",
  "message": "Érvénytelen vagy lejárt QR kód"
}
```

---

### POST /api/checkin/submit

Check-in rögzítése.

**Auth:** NextAuth JWT (admin vagy staff)

**Request Body:**
```json
{
  "registration_id": 1,
  "guest_id": 1,
  "method": "qr",
  "is_override": false
}
```

| Mező | Típus | Leírás |
|------|-------|--------|
| `method` | string | `"qr"` vagy `"manual"` |
| `is_override` | boolean | Admin felülírás dupla check-in esetén |

**Válasz (200):**
```json
{
  "success": true,
  "checkin": {
    "id": 1,
    "checked_in_at": "2026-03-27T19:30:00Z"
  }
}
```

---

## 8. Admin - Vendégkezelés

### GET /api/admin/guests

Vendéglista lapozással, szűréssel és rendezéssel.

**Auth:** NextAuth JWT (admin)

**Query paraméterek:**

| Paraméter | Típus | Alapért. | Leírás |
|-----------|-------|----------|--------|
| `page` | number | 1 | Oldalszám |
| `limit` | number | 25 | Elemek/oldal |
| `search` | string | - | Keresés (név, email) |
| `type` | string | "all" | Vendég típus szűrő |
| `status` | string | "all" | Regisztrációs státusz szűrő |
| `includeStats` | boolean | false | Statisztikák visszaadása |
| `guest_types` | string | - | Vesszővel elválasztott típusok (invited,paying_single,paying_paired,applicant) |
| `registration_statuses` | string | - | Vesszővel elválasztott státuszok (invited,registered,approved,declined,pending,pending_approval,rejected,cancelled,checked_in) |
| `is_vip_reception` | boolean | - | VIP fogadás szűrő |
| `has_ticket` | boolean | - | Van-e jegye a vendégnek |
| `has_table` | boolean | - | Van-e asztala a vendégnek |
| `magicLinkFilter` | string | - | Magic link szűrő: `sendable`, `ready`, `recent`, `never`, `all` |

**Válasz (200):**
```json
{
  "guests": [
    {
      "id": 1,
      "first_name": "János",
      "last_name": "Kovács",
      "email": "janos@example.com",
      "guest_type": "invited",
      "registration_status": "registered",
      "company": "ACME Kft.",
      "position": "Igazgató"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "totalPages": 6
  },
  "stats": { ... }
}
```

---

### POST /api/admin/guests

Új vendég létrehozása.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "email": "uj@example.com",
  "first_name": "Anna",
  "last_name": "Kiss",
  "guest_type": "invited",
  "company": "Tech Kft.",
  "position": "CTO",
  "title": "Dr.",
  "phone": "+36301234567",
  "is_vip_reception": false
}
```

**Válasz (201):**
```json
{ "success": true, "guest": { "id": 20, ... } }
```

---

### GET /api/admin/guests/{id}

Vendég részletek lekérdezése.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "guest": {
    "id": 1,
    "first_name": "János",
    "last_name": "Kovács",
    "email": "janos@example.com",
    "guest_type": "invited",
    "registration_status": "registered",
    "registration": { ... },
    "payment": { ... },
    "checkin": { ... },
    "table_assignment": { ... }
  }
}
```

---

### PATCH /api/admin/guests/{id}

Vendég adatok módosítása.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "first_name": "János",
  "last_name": "Kovács",
  "company": "Új Kft.",
  "position": "Vezérigazgató"
}
```

**Válasz (200):**
```json
{ "success": true, "guest": { ... } }
```

---

### DELETE /api/admin/guests/{id}

Vendég törlése.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{ "success": true }
```

---

### POST /api/admin/guests/import

Vendégek importálása JSON formátumban (CSV a frontenden kerül feldolgozásra PapaParse-szal).

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "guests": [
    {
      "email": "vendeg1@example.com",
      "first_name": "Anna",
      "last_name": "Kiss",
      "guest_type": "invited",
      "company": "ACME",
      "position": "CEO"
    }
  ]
}
```

**Válasz (200):**
```json
{
  "success": true,
  "imported": 10,
  "skipped": 2,
  "errors": [
    { "row": 3, "error": "Duplicate email" }
  ]
}
```

---

### GET /api/admin/guests/export

Vendéglista exportálása CSV formátumban.

**Auth:** NextAuth JWT (admin)

**Válasz (200):** `Content-Type: text/csv; charset=utf-8`

CSV fejlécek: Név, Email, Típus, Státusz, Cég, Pozíció, Telefon, stb.

---

### PATCH /api/admin/guests/{id}/approve-payment

Banki átutalás manuális jóváhagyása + QR jegy generálás.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "amount": 25000,
  "notes": "Utalás beérkezett 2026-03-15"
}
```

**Válasz (200):**
```json
{
  "success": true,
  "registration": { ... },
  "payment": { "payment_status": "paid" }
}
```

---

## 9. Admin - Asztalok & Ültetés

### GET /api/admin/tables

Asztalok listázása.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "tables": [
    {
      "id": 1,
      "name": "VIP-A1",
      "capacity": 10,
      "type": "vip",
      "pos_x": 150.5,
      "pos_y": 200.3,
      "status": "available",
      "assignments": [ ... ]
    }
  ]
}
```

---

### POST /api/admin/tables

Új asztal létrehozása.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "name": "VIP-A2",
  "capacity": 8,
  "type": "vip",
  "pos_x": 200,
  "pos_y": 150
}
```

**Válasz (201):**
```json
{ "success": true, "table": { "id": 2, ... } }
```

---

### GET /api/admin/tables/{id}

Asztal részletek.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{ "table": { "id": 1, "name": "VIP-A1", "capacity": 10, "assignments": [ ... ] } }
```

---

### PATCH /api/admin/tables/{id}

Asztal adatok módosítása.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "name": "VIP-A1",
  "capacity": 12,
  "type": "vip"
}
```

**Válasz (200):**
```json
{ "success": true, "table": { ... } }
```

---

### DELETE /api/admin/tables/{id}

Asztal törlése (csak ha nincs hozzárendelés).

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{ "success": true }
```

---

### PATCH /api/admin/tables/{id}/position

Asztal pozíció frissítése (drag-and-drop az ültetési térképen).

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "pos_x": 250.5,
  "pos_y": 180.3
}
```

| Mező | Típus | Validáció | Leírás |
|------|-------|-----------|--------|
| `pos_x` | Float | 0-1000 | X koordináta (méterben) |
| `pos_y` | Float | 0-1000 | Y koordináta (méterben) |

**Válasz (200):**
```json
{ "table": { "id": 1, "pos_x": 250.5, "pos_y": 180.3, ... } }
```

---

### GET /api/admin/table-assignments

Összes asztal-hozzárendelés listázása.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "assignments": [
    {
      "id": 1,
      "table_id": 1,
      "guest_id": 5,
      "seat_number": 3,
      "guest": { ... },
      "table": { ... }
    }
  ],
  "unassigned": [ ... ]
}
```

---

### POST /api/admin/table-assignments

Vendég asztalhoz rendelése.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "guestId": 5,
  "tableId": 1,
  "seatNumber": 3
}
```

**Válasz (200):**
```json
{ "success": true, "assignment": { ... } }
```

---

### PATCH /api/admin/table-assignments/{id}

Hozzárendelés áthelyezése másik asztalra.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "tableId": 2
}
```

**Válasz (200):**
```json
{ "success": true, "assignment": { ... } }
```

---

### DELETE /api/admin/table-assignments/{id}

Vendég eltávolítása asztalról.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{ "success": true }
```

---

### POST /api/admin/table-assignments/bulk

CSV alapú tömeges asztal-hozzárendelés.

**Auth:** NextAuth JWT (admin)

**Request Body (JSON):**
```json
{
  "csv": "guest_email,table_name,seat_number\nvendeg@example.com,VIP-A1,1\nmasik@example.com,VIP-A1,2"
}
```

**Request Body (multipart/form-data):**
- `file`: CSV fájl (guest_email, table_name, seat_number oszlopokkal)

**Válasz (200):**
```json
{
  "success": true,
  "assigned": 8,
  "skipped": 1,
  "errors": [
    { "row": 3, "error": "Guest not found: ismeretlen@example.com" }
  ]
}
```

---

### GET /api/admin/seating-export

Ültetési rend exportálása CSV formátumban.

**Auth:** NextAuth JWT (admin)

**Válasz (200):** `Content-Type: text/csv`

CSV fejlécek: Asztal, Szék, Vendég név, Email, Típus

---

### GET /api/admin/seating-stats

Ültetési statisztikák.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "success": true,
  "totalTables": 15,
  "totalCapacity": 150,
  "totalAssigned": 95,
  "occupancyRate": 63.3,
  "tableStats": [
    {
      "id": 1,
      "name": "VIP-A1",
      "capacity": 10,
      "assigned": 8,
      "available": 2
    }
  ]
}
```

---

## 10. Admin - Kijelző & Valós Idejű

### GET /api/admin/display-stream

SSE (Server-Sent Events) stream valós idejű check-in frissítésekhez a nagykijelzős ültetési megjelenítőn.

**Auth:** NextAuth JWT (admin only)

**Content-Type:** `text/event-stream`

**Kapcsolat jellemzői:**
- 30 másodperces keepalive ping (SSE komment: `: ping`)
- Automatikus cleanup kliens lecsatlakozáskor
- Nginx buffering letiltva (`X-Accel-Buffering: no`)

**Események (SSE data):**
```json
{
  "type": "CHECKIN",
  "guestId": 5,
  "firstName": "János",
  "lastName": "Kovács",
  "tableId": 1,
  "tableName": "VIP-A1"
}
```

**Fejlécek:**
```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

---

### GET /api/admin/seating-display-data

Kezdeti asztal adatok vendégekkel és check-in statisztikákkal a nagykijelzős megjelenítőhöz.

**Auth:** NextAuth JWT (admin only)

**Válasz (200):**
```json
{
  "tables": [
    {
      "id": 1,
      "name": "VIP-A1",
      "guests": [
        {
          "id": 5,
          "firstName": "János",
          "lastName": "Kovács",
          "checkedIn": true
        },
        {
          "id": 6,
          "firstName": "Éva",
          "lastName": "Nagy",
          "checkedIn": false
        }
      ]
    }
  ],
  "checkinStats": {
    "checkedIn": 45,
    "total": 120
  }
}
```

---

## 11. Admin - Fizetések

### GET /api/admin/payments

Fizetési lista szűréssel és lapozással.

**Auth:** NextAuth JWT (admin)

**Query paraméterek:**

| Paraméter | Típus | Alapért. | Leírás |
|-----------|-------|----------|--------|
| `status` | string | - | Szűrés státusz alapján (pending, paid, failed, refunded) |
| `method` | string | - | Szűrés fizetési mód alapján (card, bank_transfer) |
| `search` | string | - | Keresés vendég név vagy email alapján |
| `date_from` | string | - | Dátum szűrő kezdete (ISO format) |
| `date_to` | string | - | Dátum szűrő vége (ISO format) |
| `limit` | number | 50 | Elemek száma |
| `offset` | number | 0 | Eltolás |

**Válasz (200):**
```json
{
  "payments": [
    {
      "id": 1,
      "payment_status": "paid",
      "payment_method": "card",
      "amount": 25000,
      "currency": "HUF",
      "paid_at": "2026-03-15T14:30:00Z",
      "registration": {
        "guest": {
          "id": 5,
          "first_name": "Anna",
          "last_name": "Kiss",
          "email": "anna@example.com"
        }
      }
    }
  ],
  "total": 45
}
```

---

### POST /api/admin/payments/{id}/refund

Fizetés visszatérítése.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "reason": "Vendég kérte a visszatérítést"
}
```

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| `reason` | string | ❌ | Visszatérítés oka |

> **Fontos:** Kártyás fizetéseknél a Stripe automatikus visszatérítés **NEM** implementált. A tényleges pénz-visszatérítést a Stripe Dashboard-on keresztül kell manuálisan elvégezni. Az endpoint csak az adatbázis státuszt frissíti `refunded`-re.

**Válasz (200):**
```json
{
  "success": true,
  "stripeRefunded": false,
  "message": "Payment marked as refunded. For card payments, process refund manually via Stripe Dashboard."
}
```

**Hibák:**
- `400` - Fizetés nem `paid` státuszú, vagy már visszatérítve
- `404` - Fizetés nem található

---

## 12. Admin - Jelentkezők

### GET /api/admin/applicants

Jelentkezők listázása.

**Auth:** NextAuth JWT (admin)

**Query paraméterek:**
| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| `status` | string | `pending_approval`, `approved`, `rejected`, `all` |

**Válasz (200):**
```json
{
  "applicants": [
    {
      "id": 10,
      "first_name": "Péter",
      "last_name": "Szabó",
      "email": "peter@example.com",
      "registration_status": "pending_approval",
      "application_message": "...",
      "created_at": "2026-03-20T10:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/applicants/{id}/approve

Jelentkező jóváhagyása + magic link generálás és email küldés.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "success": true,
  "guest": { ... },
  "magicLink": "..."
}
```

---

### POST /api/admin/applicants/{id}/reject

Jelentkező elutasítása indoklással.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "reason": "Nincs elég hely az eseményen."
}
```

**Válasz (200):**
```json
{ "success": true, "guest": { ... } }
```

---

## 13. Admin - Email Kezelés

### GET /api/admin/email-templates

Email sablonok listázása.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "templates": [
    {
      "slug": "magic_link",
      "subject": "Meghívó a CEO Gálára",
      "html_body": "...",
      "text_body": "...",
      "variables": ["guestName", "magicLinkUrl"]
    }
  ]
}
```

---

### GET /api/admin/email-templates/{slug}

Email sablon részletek.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "template": {
    "slug": "magic_link",
    "subject": "Meghívó a CEO Gálára",
    "html_body": "<html>...",
    "text_body": "...",
    "variables": ["guestName", "magicLinkUrl"]
  }
}
```

---

### PUT /api/admin/email-templates/{slug}

Email sablon frissítése (teljes felülírás).

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "subject": "Meghívó a CEO Gálára - Frissítve",
  "html_body": "<html>...",
  "text_body": "...",
  "variables": ["guestName", "magicLinkUrl"]
}
```

**Válasz (200):**
```json
{ "success": true, "template": { ... } }
```

---

### DELETE /api/admin/email-templates/{slug}

Email sablon törlése.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{ "success": true }
```

---

### POST /api/admin/email-templates/{slug}/preview

Email sablon előnézet mintaadatokkal.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "variables": {
    "guestName": "Teszt Vendég",
    "magicLinkUrl": "https://ceogala.hu/register?code=abc123"
  }
}
```

> Ha a `variables` nem tartalmaz értékeket, a rendszer automatikus mintaadatokat használ (pl. "John Smith", minta QR kód, stb.)

**Válasz (200):**
```json
{
  "subject": "Meghívó a CEO Gálára",
  "html": "<html>... renderelt HTML tartalom ...",
  "text": "Kedves Teszt Vendég, ..."
}
```

**Elérhető sablon slug-ok:**
`magic_link`, `ticket_delivery`, `partner_ticket_delivery`, `applicant_approval`, `applicant_rejection`, `payment_reminder`, `payment_confirmation`, `table_assignment`, `event_reminder`, `registration_feedback`

---

### GET /api/admin/email-logs

Email küldési napló.

**Auth:** NextAuth JWT (admin)

**Query paraméterek:**
| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| `type` | string | Email típus szűrő |
| `status` | string | Küldési státusz |
| `guest_id` | number | Vendég azonosító |
| `search` | string | Keresés |
| `limit` | number | Elemek száma (alapért: 50) |
| `offset` | number | Eltolás |

**Válasz (200):**
```json
{
  "logs": [
    {
      "id": 1,
      "guest_id": 5,
      "email_type": "magic_link",
      "recipient": "vendeg@example.com",
      "subject": "Meghívó",
      "status": "sent",
      "sent_at": "2026-03-20T10:00:00Z"
    }
  ],
  "total": 200
}
```

---

### DELETE /api/admin/email-logs/{id}

Email napló bejegyzés törlése.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{ "success": true }
```

---

## 14. Admin - Ütemezett Emailek

### GET /api/admin/scheduled-emails

Ütemezett emailek listázása szűréssel.

**Auth:** NextAuth JWT (admin)

**Query paraméterek:**
| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| `status` | string | `pending`, `sent`, `failed`, `cancelled` |

**Válasz (200):**
```json
{
  "emails": [
    {
      "id": 1,
      "guest_id": 5,
      "template_slug": "payment_reminder",
      "scheduled_for": "2026-03-25T09:00:00Z",
      "status": "pending",
      "schedule_type": "automatic"
    }
  ]
}
```

---

### POST /api/admin/scheduled-emails

Új ütemezett email létrehozása.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "guest_id": 5,
  "template_slug": "payment_reminder",
  "scheduled_for": "2026-03-25T09:00:00Z",
  "variables": { "guestName": "Kiss Anna" }
}
```

**Válasz (201):**
```json
{ "success": true, "email": { ... } }
```

---

### GET /api/admin/scheduled-emails/{id}

Ütemezett email részletek.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "email": {
    "id": 1,
    "guest_id": 5,
    "template_slug": "payment_reminder",
    "scheduled_for": "2026-03-25T09:00:00Z",
    "status": "pending"
  }
}
```

---

### DELETE /api/admin/scheduled-emails/{id}

Ütemezett email törlése/lemondása (soft: status → `cancelled`).

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{ "success": true }
```

---

### DELETE /api/admin/scheduled-emails

Tömeges ütemezett email törlés.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{ "success": true, "cancelled": 5 }
```

---

### POST /api/admin/scheduled-emails/bulk

Tömeges email küldés (kötegelt: 5-ös csoportokban, 1 mp szünettel).

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "template_slug": "event_reminder",
  "guest_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

**Válasz (200):**
```json
{
  "success": true,
  "sent": 10,
  "failed": 0,
  "errors": []
}
```

---

### POST /api/admin/scheduled-emails/trigger

Ütemező manuális indítása.

**Auth:** NextAuth JWT (admin only)

**Request Body:**
```json
{
  "action": "process"
}
```

| Érték | Leírás |
|-------|--------|
| `"process"` | Függőben lévő ütemezett emailek feldolgozása |
| `"all"` | Feldolgozás + automatikus ütemezők futtatása |

**Válasz (200):**
```json
{
  "success": true,
  "action": "all",
  "results": {
    "processed": { "sent": 3, "failed": 0 },
    "schedulers": { "checked": 5, "scheduled": 2 }
  }
}
```

---

## 15. Admin - Ütemező Konfiguráció

### GET /api/admin/scheduler-config

Ütemező konfigurációk listázása.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "configs": [
    {
      "id": 1,
      "config_key": "payment_reminder_3days",
      "name": "Fizetési emlékeztető (3 nap)",
      "description": "Automatikus emlékeztető 3 nappal fizetési határidő előtt",
      "enabled": true,
      "template_slug": "payment_reminder",
      "days_before": 3,
      "days_after": null,
      "interval_days": null,
      "send_time": "09:00",
      "target_status": "[\"registered\"]",
      "target_types": "[\"paying_single\",\"paying_paired\"]",
      "created_at": "2026-03-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/scheduler-config

Új ütemező konfiguráció létrehozása.

**Auth:** NextAuth JWT (admin only)

**Request Body:**
```json
{
  "config_key": "event_reminder_1day",
  "name": "Esemény emlékeztető (1 nap)",
  "description": "Emlékeztető 1 nappal az esemény előtt",
  "enabled": true,
  "template_slug": "event_reminder",
  "days_before": 1,
  "days_after": null,
  "interval_days": null,
  "send_time": "09:00",
  "target_status": ["approved", "registered"],
  "target_types": ["invited", "paying_single", "paying_paired"]
}
```

| Mező | Típus | Kötelező | Validáció | Leírás |
|------|-------|----------|-----------|--------|
| `config_key` | string | ✅ | 1-100 karakter, UNIQUE | Egyedi azonosító |
| `name` | string | ✅ | 1-255 karakter | Megjelenítendő név |
| `description` | string | ❌ | - | Leírás |
| `enabled` | boolean | ❌ | alapért: true | Aktív-e |
| `template_slug` | string | ✅ | 1-100 karakter | Email sablon slug |
| `days_before` | number | ❌ | 0-365, nullable | Napok az esemény előtt |
| `days_after` | number | ❌ | 0-365, nullable | Napok az esemény után |
| `interval_days` | number | ❌ | 1-365, nullable | Ismétlési intervallum |
| `send_time` | string | ❌ | `HH:MM` formátum, alapért: "09:00" | Küldési időpont |
| `target_status` | string[] | ❌ | - | Célzott regisztrációs státuszok |
| `target_types` | string[] | ❌ | - | Célzott vendég típusok |

**Válasz (200):**
```json
{ "success": true, "config": { ... } }
```

**Hibák:**
- `400` - Duplikált config_key

---

### GET /api/admin/scheduler-config/{id}

Ütemező konfiguráció részletek.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{ "config": { "id": 1, "config_key": "payment_reminder_3days", ... } }
```

---

### PATCH /api/admin/scheduler-config/{id}

Ütemező konfiguráció módosítása.

**Auth:** NextAuth JWT (admin only)

**Request Body:** Bármely mező a POST-ból (kivéve `config_key` - nem módosítható).

```json
{
  "enabled": false,
  "send_time": "10:00"
}
```

**Válasz (200):**
```json
{ "success": true, "config": { ... } }
```

---

### DELETE /api/admin/scheduler-config/{id}

Ütemező konfiguráció törlése.

**Auth:** NextAuth JWT (admin only)

**Válasz (200):**
```json
{ "success": true }
```

---

## 16. Admin - Felhasználók

### GET /api/admin/users

Admin/staff felhasználók listázása.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@ceogala.test",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin"
    }
  ]
}
```

---

### POST /api/admin/users

Új admin/staff felhasználó létrehozása.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "email": "staff2@ceogala.test",
  "first_name": "Staff",
  "last_name": "User",
  "password": "StrongPass123!",
  "role": "staff"
}
```

**Válasz (201):**
```json
{ "success": true, "user": { "id": 3, ... } }
```

---

### PATCH /api/admin/users/{id}

Felhasználó módosítása.

**Auth:** NextAuth JWT (admin)

**Request Body:**
```json
{
  "role": "admin",
  "password": "NewPassword123!"
}
```

**Válasz (200):**
```json
{ "success": true, "user": { ... } }
```

---

### DELETE /api/admin/users/{id}

Felhasználó törlése.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{ "success": true }
```

---

## 17. Admin - Dashboard & Statisztikák

### GET /api/admin/statistics

Átfogó dashboard statisztikák.

**Auth:** NextAuth JWT (admin)

**Válasz (200):**
```json
{
  "totalGuests": 150,
  "registrationStats": {
    "invited": 30,
    "registered": 50,
    "approved": 40,
    "declined": 10,
    "pending_approval": 5,
    "rejected": 3,
    "cancelled": 2,
    "checked_in": 10
  },
  "guestTypeStats": {
    "invited": 60,
    "paying_single": 40,
    "paying_paired": 45,
    "applicant": 5
  },
  "paymentStats": {
    "totalRevenue": 2500000,
    "paid": 80,
    "pending": 5,
    "failed": 2,
    "refunded": 1
  },
  "checkinStats": {
    "checkedIn": 10,
    "total": 120,
    "percentage": 8.3
  },
  "seatingStats": {
    "totalTables": 15,
    "totalCapacity": 150,
    "assigned": 95
  }
}
```

---

### GET /api/admin/checkin-stats

Check-in statisztikák.

**Auth:** NextAuth JWT (admin vagy staff)

**Válasz (200):**
```json
{
  "success": true,
  "checkedIn": 45,
  "total": 120,
  "percentage": 37.5,
  "recentCheckins": [ ... ]
}
```

---

### GET /api/admin/checkin-log

Check-in napló lapozással.

**Auth:** NextAuth JWT (admin vagy staff)

**Query paraméterek:**
| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| `page` | number | Oldalszám |
| `limit` | number | Elemek/oldal |
| `search` | string | Keresés vendég név alapján |

**Válasz (200):**
```json
{
  "checkins": [
    {
      "id": 1,
      "checked_in_at": "2026-03-27T19:15:00Z",
      "method": "qr",
      "is_override": false,
      "guest": {
        "first_name": "János",
        "last_name": "Kovács"
      },
      "staff": {
        "name": "Staff User"
      }
    }
  ],
  "total": 45,
  "page": 1
}
```

---

## 18. Admin - Audit Log

### GET /api/admin/audit-log

Audit napló lapozással (csak admin hozzáférés).

**Auth:** NextAuth JWT (admin only)

**Query paraméterek:**
| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| `page` | number | Oldalszám |
| `limit` | number | Elemek/oldal |
| `action` | string | Művelet szűrő |
| `entity_type` | string | Entitás típus szűrő |
| `user_id` | number | Felhasználó szűrő |

**Válasz (200):**
```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "action": "UPDATE",
      "entity_type": "guest",
      "entity_id": "5",
      "old_values": { "company": "Régi Kft." },
      "new_values": { "company": "Új Kft." },
      "ip_address": "192.168.1.1",
      "created_at": "2026-03-20T10:00:00Z"
    }
  ],
  "total": 500,
  "page": 1
}
```

---

## 19. Admin - Teszt Eredmények

### GET /api/admin/test-results

Manuális teszt eredmények listázása.

**Auth:** NextAuth JWT (admin vagy staff)

**Query paraméterek:**
| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| `version` | string | Verzió szűrő (pl. "4.1.0") |

**Válasz (200):**
```json
{
  "results": [
    {
      "id": 1,
      "version": "4.1.0",
      "feature_index": 0,
      "feature_name": "Vendég regisztráció",
      "status": "passed",
      "comment": "Minden rendben",
      "step_results": "{\"step1\":true,\"step2\":true}",
      "tested_at": "2026-03-22T10:00:00Z",
      "tester": {
        "id": 1,
        "first_name": "Admin",
        "last_name": "User",
        "email": "admin@ceogala.test",
        "name": "Admin User"
      }
    }
  ]
}
```

---

### POST /api/admin/test-results

Teszt eredmény létrehozása vagy frissítése (upsert: version + featureIndex alapján).

**Auth:** NextAuth JWT (admin vagy staff)

**Request Body:**
```json
{
  "version": "4.1.0",
  "featureIndex": 0,
  "featureName": "Vendég regisztráció",
  "status": "passed",
  "comment": "Minden rendben",
  "stepResults": {
    "step1": true,
    "step2": true,
    "step3": false
  }
}
```

| Mező | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| `version` | string | ✅ | Verzió szám |
| `featureIndex` | number | ✅ | Feature index |
| `featureName` | string | ✅ | Feature név |
| `status` | TestStatus | ❌ | `passed`, `failed`, `not_tested` |
| `comment` | string | ❌ | Megjegyzés |
| `stepResults` | object | ❌ | Lépésenkénti eredmények (JSON) |

**Válasz (200):**
```json
{ "success": true, "result": { ... } }
```

---

### GET /api/admin/test-results/export

Teszt eredmények exportálása CSV formátumban.

**Auth:** NextAuth JWT (admin vagy staff)

**Query paraméterek:**
| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| `version` | string | Verzió szűrő (opcionális) |

**Válasz (200):** `Content-Type: text/csv; charset=utf-8`

Fájlnév: `test-results-v{version}-{date}.csv` vagy `test-results-all-{date}.csv`

CSV fejlécek: Version, Feature Index, Feature Name, Status, Tester Name, Tester Email, Comment, Step Results, Tested At, Updated At

> BOM karakter (UTF-8) hozzáadva az Excel kompatibilitás érdekében magyar karaktereknél.

---

## 20. PWA Vendég Alkalmazás

### POST /api/pwa/auth

PWA bejelentkezés CEOG-XXXXXX kóddal.

**Auth:** Publikus

**Request Body:**
```json
{
  "code": "CEOG-A1B2C3"
}
```

**Válasz (200):** Session cookie beállítása (`pwa_session`, 7 nap lejárat, httpOnly, secure)
```json
{
  "success": true,
  "guest": {
    "id": 5,
    "first_name": "János",
    "last_name": "Kovács"
  }
}
```

---

### DELETE /api/pwa/auth

PWA kijelentkezés (session cookie törlése).

**Auth:** PWA session cookie

**Válasz (200):**
```json
{ "success": true }
```

---

### GET /api/pwa/auth/session

Aktuális PWA session ellenőrzése.

**Auth:** PWA session cookie

**Válasz (200) - Bejelentkezett:**
```json
{
  "authenticated": true,
  "guest": {
    "id": 5,
    "first_name": "János",
    "last_name": "Kovács",
    "email": "janos@example.com",
    "registration_status": "approved"
  }
}
```

**Válasz (200) - Nincs session:**
```json
{ "authenticated": false }
```

---

### GET /api/pwa/profile

Vendég profil adatok.

**Auth:** PWA session cookie

**Válasz (200):**
```json
{
  "guest": {
    "id": 5,
    "first_name": "János",
    "last_name": "Kovács",
    "email": "janos@example.com",
    "title": "Dr.",
    "phone": "+36301234567",
    "company": "ACME Kft.",
    "position": "Igazgató",
    "dietary_requirements": "vegetáriánus",
    "seating_preferences": "ablak mellé"
  }
}
```

---

### PATCH /api/pwa/profile

Vendég profil frissítése.

**Auth:** PWA session cookie

**Request Body:**
```json
{
  "phone": "+36309876543",
  "dietary_requirements": "gluténmentes"
}
```

**Válasz (200):**
```json
{ "success": true, "guest": { ... } }
```

---

### GET /api/pwa/ticket

QR jegy JWT token lekérdezése.

**Auth:** PWA session cookie

**Válasz (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "ticket_type": "vip_free",
  "guest_name": "Dr. Kovács János"
}
```

---

### POST /api/pwa/push

Firebase FCM push token regisztrálása.

**Auth:** PWA session cookie

**Request Body:**
```json
{
  "token": "fMcR9...firebase-token..."
}
```

**Válasz (200):**
```json
{ "success": true }
```

---

### DELETE /api/pwa/push

Push token eltávolítása.

**Auth:** PWA session cookie

**Válasz (200):**
```json
{ "success": true }
```

---

### GET /api/pwa/events

SSE stream valós idejű értesítésekhez a vendég PWA alkalmazásban.

**Auth:** PWA session cookie

**Content-Type:** `text/event-stream`

**Kapcsolat jellemzői:**
- 30 másodperces heartbeat (`HEARTBEAT` típusú esemény)
- Automatikus cleanup kliens lecsatlakozáskor
- Vendég-specifikus események (csak a bejelentkezett vendégnek szóló)

**Események:**

Kapcsolódás:
```json
{ "type": "CONNECTED", "guestId": 5 }
```

Heartbeat:
```json
{ "type": "HEARTBEAT", "timestamp": 1711569600000 }
```

Check-in esemény:
```json
{
  "type": "CHECKIN",
  "guestId": 5,
  "tableName": "VIP-A1",
  "tableId": 1
}
```

**Fejlécek:**
```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

---

## 21. Rendszer

### GET /api/health

Rendszer állapot ellenőrzés.

**Auth:** Publikus

**Válasz (200):**
```json
{
  "status": "healthy",
  "version": "4.1.0",
  "timestamp": "2026-03-22T10:00:00Z",
  "checks": {
    "database": {
      "status": "ok",
      "latency": 5
    }
  }
}
```

**Válasz (503) - Degradált állapot:**
```json
{
  "status": "degraded",
  "checks": {
    "database": {
      "status": "error",
      "error": "Connection refused"
    }
  }
}
```

---

## 22. Biztonsági Megjegyzések

### Ismert Biztonsági Problémák

**KRITIKUS:**

1. **IDOR a PWA API-knál**: A `/api/pwa/profile`, `/api/pwa/ticket` endpointok korábban csak `guest_id` query paramétert használtak. **Javítva:** PWA session cookie alapú azonosítás.

2. **Check-in override nem szerepkör-korlátozott az API-ban**: A `/api/checkin/submit` elfogadja az `is_override: true` értéket Staff szerepkörtől is. Csak a frontend rejti el a gombot. **Ajánlás:** API szintű `role === 'admin'` ellenőrzés.

**KÖZEPES:**

3. **PATCH body injection**: A `PATCH /api/admin/guests/{id}` a body-t közvetlenül átadja a Prisma update-nek mezőszűrés nélkül. Módosíthatóvá válnak a `magic_link_code`, `pwa_auth_code` stb. mezők.

4. **Hiányzó Zod validáció**: Több API endpoint nem alkalmazza a definiált Zod sémákat (`lib/validations/`).

### Email Szolgáltatás Jellemzők

- **Újrapróbálkozás:** 3 kísérlet exponenciális backoff-fal (1s, 2s, 4s)
- **Rate Limiting:** 5/típus/óra, 20 összesen/óra/vendég (kulcs: `email:{guestId}:{type}`)
- **Naplózás:** Minden email az `EmailLog` táblába kerül
- **Sablon rendszer:** DB sablonok (slug alapú) `{{variable}}` helyettesítéssel + hardcoded fallback-ek
- **CID csatolmányok:** Inline QR kód képek Content-ID-vel

### CSRF Védelem

- **Módszer:** Origin/Referer header validáció (NEM token-alapú)
- Nem biztonságos metódusok (POST, PATCH, DELETE) esetén ellenőrzi az elvárt host-ot
- **Kivételek:** Stripe webhook (aláírás-alapú), Next.js belső fetch-ek (x-nextjs-data header)

---

## Összefoglaló Endpoint Mátrix

### Admin Endpointok (62 endpoint, 40 route fájl)

| Kategória | Route fájl | Metódusok | Endpoint szám |
|-----------|-----------|-----------|---------------|
| Vendégkezelés | 5 fájl | GET, POST, PATCH, DELETE | 8 |
| Asztalok | 3 fájl | GET, POST, PATCH, DELETE | 7 |
| Asztal hozzárendelés | 3 fájl | GET, POST, PATCH, DELETE | 5 |
| Ültetés export/stats | 2 fájl | GET | 2 |
| Kijelző & Stream | 2 fájl | GET | 2 |
| Fizetések | 2 fájl | GET, POST | 2 |
| Jelentkezők | 3 fájl | GET, POST | 3 |
| Email sablonok | 3 fájl | GET, PUT, DELETE, POST | 5 |
| Email naplók | 2 fájl | GET, DELETE | 2 |
| Ütemezett emailek | 4 fájl | GET, POST, DELETE | 7 |
| Ütemező konfig | 2 fájl | GET, POST, PATCH, DELETE | 5 |
| Felhasználók | 2 fájl | GET, POST, PATCH, DELETE | 4 |
| Dashboard/Stats | 3 fájl | GET | 3 |
| Audit log | 1 fájl | GET | 1 |
| Teszt eredmények | 2 fájl | GET, POST | 3 |

### Publikus & Egyéb Endpointok (21 endpoint, 22 route fájl)

| Kategória | Route fájl | Metódusok | Endpoint szám |
|-----------|-----------|-----------|---------------|
| Regisztráció | 5 fájl | GET, POST | 5 |
| Jelentkezés | 1 fájl | POST | 1 |
| Email küldés | 1 fájl | POST | 1 |
| Magic link kérés | 1 fájl | POST | 1 |
| Fizetés (Stripe) | 3 fájl | POST | 3 |
| Jegy | 2 fájl | POST | 2 |
| Check-in | 2 fájl | POST | 2 |
| PWA | 6 fájl | GET, POST, PATCH, DELETE | 8 |
| Auth (NextAuth) | 1 fájl | GET, POST | 2 |
| Rendszer (health) | 1 fájl | GET | 1 |

**Összesen: 83 HTTP endpoint, 62 route fájl** (GET: 33, POST: 30, PATCH: 8, DELETE: 11, PUT: 1)
