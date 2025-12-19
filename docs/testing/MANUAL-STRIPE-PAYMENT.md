# Manuális Tesztelési Útmutató: Stripe Fizetés

> **Cél:** Fizető vendég regisztráció → Stripe Checkout → Webhook → Jegy generálás
>
> **Időtartam:** ~15 perc
>
> **Előfeltételek:** Stripe test mód konfigurálva, SMTP beállítva

---

## Előkészületek

### Stripe Konfiguráció Ellenőrzése

```bash
# .env fájl ellenőrzése
grep "STRIPE" /var/www/ceog/.env
```

Várt értékek:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe CLI (Webhook Teszteléshez)

```bash
# Telepítés
sudo apt install stripe

# Bejelentkezés
stripe login

# Webhook forwarding indítása
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Teszt Kártyák

| Kártya szám | Eredmény |
|-------------|----------|
| `4242 4242 4242 4242` | Sikeres fizetés |
| `4000 0000 0000 0002` | Elutasított |
| `4000 0025 0000 3155` | 3D Secure szükséges |
| `4000 0000 0000 9995` | Insufficient funds |

**Minden kártyához:**
- Lejárat: Bármilyen jövőbeli dátum (pl. `12/34`)
- CVC: Bármilyen 3 számjegy (pl. `123`)
- ZIP: Bármilyen (pl. `12345`)

---

## Teszt Adatok

| Mező | Érték |
|------|-------|
| **Vendég neve** | Stripe Teszt Vendég |
| **Email** | `stripe-test-YYYYMMDD@ceogala.hu` |
| **Jegy típus** | paid_single (75.000 Ft) |
| **Számlázási név** | Teszt Cég Kft. |
| **Adószám** | 12345678-2-42 |

---

## 1. FÁZIS: Fizető Vendég Előkészítése

### 1.1 Admin: Vendég Létrehozása

```sql
-- Fizető vendég létrehozása
INSERT INTO Guest (email, name, guest_type, registration_status, created_at, updated_at)
VALUES ('stripe-test-YYYYMMDD@ceogala.hu', 'Stripe Teszt Vendég', 'paying_single', 'invited', NOW(), NOW());

-- Guest ID lekérdezése
SELECT id FROM Guest WHERE email LIKE 'stripe-test%' ORDER BY id DESC LIMIT 1;

-- Magic link generálása
UPDATE Guest
SET
  magic_link_hash = SHA2(CONCAT(email, 'your-app-secret', UNIX_TIMESTAMP()), 256),
  magic_link_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
WHERE email LIKE 'stripe-test%';

-- Magic link hash lekérdezése
SELECT id, email, magic_link_hash FROM Guest WHERE email LIKE 'stripe-test%';
```

---

## 2. FÁZIS: Regisztráció + Fizetés

### 2.1 Magic Link Megnyitása
```
https://ceogala.mflevents.space/register?code={MAGIC_LINK_HASH}&email=stripe-test-YYYYMMDD@ceogala.hu
```

### 2.2 Regisztrációs Lépések

**Lépés 1: Jegy típus kiválasztása**
- Válaszd: **Egyéni jegy** (75.000 Ft)
- Kattints: **Tovább**

**Lépés 2: Személyes adatok**
| Mező | Érték |
|------|-------|
| Telefonszám | +36 30 123 4567 |
| Cégnév | Teszt Cég Kft. |
| Pozíció | Tesztelő |

**Lépés 3: Számlázási adatok**
| Mező | Érték |
|------|-------|
| Számlázási név | Teszt Cég Kft. |
| Adószám | 12345678-2-42 |
| Cím | Teszt utca 1. |
| Város | Budapest |
| Irányítószám | 1111 |

**Lépés 4: Fizetési mód**
- Válaszd: **Bankkártya** (nem banki átutalás!)
- Kattints: **Fizetés**

### 2.3 Stripe Checkout

Átirányítás a Stripe Checkout oldalra:

1. **Email mező:** stripe-test-YYYYMMDD@ceogala.hu
2. **Kártya adatok:**
   - Szám: `4242 4242 4242 4242`
   - Lejárat: `12/34`
   - CVC: `123`
3. **Név a kártyán:** Stripe Teszt Vendég
4. Kattints: **Fizetés** / **Pay**

### 2.4 Sikeres Fizetés

- Átirányítás: `/payment/success?session_id=cs_test_...`
- Megjelenik: "Sikeres fizetés" üzenet
- QR jegy generálódik
- Email küldés történik (ha SMTP be van állítva)

---

## 3. FÁZIS: Webhook Ellenőrzés

### 3.1 Stripe CLI Output

Ha fut a `stripe listen`:
```
2025-12-17 10:30:00   --> checkout.session.completed [evt_...]
2025-12-17 10:30:00  <--  [200] POST http://localhost:3000/api/stripe/webhook
```

### 3.2 Webhook Log (Stripe Dashboard)

1. Stripe Dashboard → Developers → Webhooks
2. Válaszd ki az endpointot
3. Recent deliveries
4. Ellenőrizd a `checkout.session.completed` eventet

### 3.3 Webhook Payload Példa

```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_...",
      "payment_status": "paid",
      "amount_total": 7500000,
      "customer_email": "stripe-test-YYYYMMDD@ceogala.hu",
      "metadata": {
        "guest_id": "123",
        "registration_id": "456"
      }
    }
  }
}
```

---

## 4. FÁZIS: Adatbázis Ellenőrzés

### 4.1 Fizetés Rekord

```sql
SELECT
    p.id AS payment_id,
    g.name,
    g.email,
    r.ticket_type,
    p.amount,
    p.currency,
    p.payment_status,
    p.payment_method,
    p.stripe_session_id,
    p.paid_at
FROM Payment p
JOIN Registration r ON p.registration_id = r.id
JOIN Guest g ON r.guest_id = g.id
WHERE g.email LIKE 'stripe-test%';
```

### 4.2 Várt Eredmény

| Mező | Érték |
|------|-------|
| payment_status | paid |
| payment_method | card |
| amount | 75000 |
| currency | HUF |
| stripe_session_id | cs_test_... |
| paid_at | {mai dátum} |

### 4.3 Regisztráció + QR

```sql
SELECT
    r.id,
    r.ticket_type,
    r.qr_code_hash IS NOT NULL AS has_qr,
    g.registration_status
FROM Registration r
JOIN Guest g ON r.guest_id = g.id
WHERE g.email LIKE 'stripe-test%';
```

| Mező | Érték |
|------|-------|
| ticket_type | paid_single |
| has_qr | 1 |
| registration_status | registered |

---

## 5. FÁZIS: Hibás Fizetés Tesztelése

### 5.1 Elutasított Kártya

1. Ismételd meg a regisztrációt új email címmel
2. Stripe Checkout-nál használd: `4000 0000 0000 0002`
3. Várt eredmény: "Kártya elutasítva" hiba

### 5.2 Cancel Flow

1. Stripe Checkout oldalon kattints: **Vissza** / **Back**
2. Átirányítás: `/payment/cancel`
3. Fizetés NEM történik meg
4. Vendég státusz marad: awaiting_payment

---

## 6. FÁZIS: Stripe Dashboard Ellenőrzés

### 6.1 Payments

1. Stripe Dashboard → Payments
2. Keresd meg a teszt fizetést
3. Ellenőrizd:
   - Amount: 75,000 HUF
   - Status: Succeeded
   - Customer: stripe-test-...@ceogala.hu

### 6.2 Customers

1. Stripe Dashboard → Customers
2. A teszt email megjelenik mint customer

### 6.3 Events

1. Stripe Dashboard → Developers → Events
2. `checkout.session.completed` event
3. Payload ellenőrzés

---

## 7. FÁZIS: Takarítás

### 7.1 Adatbázis

```sql
-- Fizetés törlése
DELETE FROM Payment WHERE registration_id IN (
    SELECT id FROM Registration WHERE guest_id IN (
        SELECT id FROM Guest WHERE email LIKE 'stripe-test%'
    )
);

-- Számlázási info törlése
DELETE FROM BillingInfo WHERE registration_id IN (
    SELECT id FROM Registration WHERE guest_id IN (
        SELECT id FROM Guest WHERE email LIKE 'stripe-test%'
    )
);

-- Regisztráció törlése
DELETE FROM Registration WHERE guest_id IN (
    SELECT id FROM Guest WHERE email LIKE 'stripe-test%'
);

-- Vendég törlése
DELETE FROM Guest WHERE email LIKE 'stripe-test%';
```

### 7.2 Stripe Dashboard

- A test mode fizetések automatikusan törölhetők
- Vagy: Dashboard → Payments → Refund (visszatérítés)

---

## Hibaelhárítás

### Probléma: Webhook 400/500 hiba
- **Ok:** Hibás webhook secret vagy payload parse error
- **Megoldás:** Ellenőrizd a STRIPE_WEBHOOK_SECRET-et a `.env`-ben

### Probléma: "No such checkout session"
- **Ok:** Session lejárt vagy hibás ID
- **Megoldás:** Új regisztrációt kell indítani

### Probléma: QR kód nem generálódik fizetés után
- **Ok:** Webhook nem fut le sikeresen
- **Megoldás:** Ellenőrizd a webhook logokat, vagy futtasd manuálisan:
```sql
UPDATE Registration
SET qr_code_hash = 'MANUAL-QR-...'
WHERE id = {REGISTRATION_ID};

UPDATE Guest
SET registration_status = 'registered'
WHERE id = {GUEST_ID};
```

### Probléma: Email nem érkezik meg
- **Ok:** SMTP konfiguráció hibás
- **Megoldás:** Ellenőrizd az EmailLog táblát hibákért

---

## Automatizált Teszt

```bash
cd /var/www/ceog
BASE_URL=http://localhost:3000 npx playwright test stripe-payment.spec.ts
```

**Demo videók:**
- `public/test-videos/full-payment-flow-demo-*.webm`
- `public/test-videos/paired-payment-demo-*.webm`

---

## Kapcsolódó Dokumentumok

- [Banki Átutalás Teszt](./MANUAL-PAYMENT-FLOW-TEST.md)
- [E2E Teszt Státusz](./E2E-TEST-STATUS.md)
- [Stripe Webhook Handler](../../app/api/stripe/webhook/route.ts)

---

*Utolsó frissítés: 2025-12-17*
*Készítette: Paige (Tech Writer) + Murat (TEA)*
