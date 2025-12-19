# Manuális Tesztelési Útmutató: Teljes Páros Regisztrációs Folyamat

> **Cél:** Páros vendég hozzáadása → Magic link → Regisztráció → Fizetés → QR jegy
>
> **Időtartam:** ~25-30 perc (teljes end-to-end flow)
>
> **Előfeltételek:** Admin hozzáférés, böngésző, teszt email cím (opcionális: Stripe test mode)

---

## Folyamat Áttekintés

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. ADMIN: Páros vendég hozzáadása (manuális vagy CSV)              │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  2. ADMIN: Magic link generálás és meghívó küldés                   │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  3. VENDÉG: Magic link megnyitása                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  4. VENDÉG: Regisztrációs form kitöltése (5 lépés)                  │
│     ├── Lépés 1: Jegy típus kiválasztás (Páros jegy)                │
│     ├── Lépés 2: Személyes adatok                                   │
│     ├── Lépés 3: Számlázási adatok                                  │
│     ├── Lépés 4: Partner adatok                                     │
│     └── Lépés 5: GDPR + Lemondási feltételek                        │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  5. FIZETÉS: Két alternatíva                                        │
│     ├── 5A: Bankkártya (Stripe Checkout)                            │
│     └── 5B: Banki átutalás (Admin jóváhagyás)                       │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  6. QR jegy generálás és email küldés                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Teszt Adatok

### Páros vendég

| Mező | Érték |
|------|-------|
| **Név** | Páros Teszt Vendég |
| **Email** | `paros-test-YYYYMMDD@ceogala.hu` |
| **Típus** | paying_paired |
| **Telefon** | +36 70 999 8888 |
| **Cégnév** | Páros Industries Kft. |
| **Pozíció** | Ügyvezető |
| **Étrend** | Vegetáriánus |
| **Ültetési preferencia** | Ablak mellett |

### Partner adatok

| Mező | Érték |
|------|-------|
| **Partner neve** | Páros Partner Anna |
| **Partner email** | `anna.partner-YYYYMMDD@ceogala.hu` |

### Számlázási adatok

| Mező | Érték |
|------|-------|
| **Számlázási név** | Páros Industries Kft. |
| **Adószám** | 12345678-2-42 |
| **Cím** | Andrássy út 100. |
| **Város** | Budapest |
| **Irányítószám** | 1062 |

### Stripe teszt kártya

| Típus | Kártyaszám | Lejárat | CVC |
|-------|------------|---------|-----|
| Sikeres | 4242 4242 4242 4242 | 12/28 | 123 |
| Elutasított | 4000 0000 0000 0002 | 12/28 | 123 |
| 3D Secure | 4000 0000 0000 3155 | 12/28 | 123 |

---

## 1. FÁZIS: Páros Vendég Hozzáadása

### 1.1 Admin Bejelentkezés

1. Nyisd meg: **https://ceogala.mflevents.space/admin**
2. Bejelentkezés:
   - Email: `admin@ceogala.test`
   - Jelszó: `Admin123!`

### 1.2 Opció A: Manuális Hozzáadás (UI)

1. Menj: **Vendégek** (`/admin/guests`)
2. Kattints: **Új vendég** gomb
3. Töltsd ki:

| Mező | Érték |
|------|-------|
| Név | Páros Teszt Vendég |
| Email | `paros-test-YYYYMMDD@ceogala.hu` |
| Típus | **Fizető páros** (`paying_paired`) |

4. Kattints: **Mentés**

### 1.2 Opció B: CSV Import

CSV fájl tartalma (`paired-guests.csv`):
```csv
email,name,guest_type,phone,company,position
paros-test-20251217@ceogala.hu,Páros Teszt Vendég,paying_paired,+36709998888,Páros Industries Kft.,Ügyvezető
```

1. Menj: **Vendégek** (`/admin/guests`)
2. Kattints: **Import CSV**
3. Válaszd ki a fájlt
4. Kattints: **Feltöltés**

### 1.3 Opció C: SQL (Ha UI nem működik)

```sql
INSERT INTO Guest (email, name, guest_type, registration_status, created_at, updated_at)
VALUES (
    'paros-test-20251217@ceogala.hu',
    'Páros Teszt Vendég',
    'paying_paired',
    'invited',
    NOW(),
    NOW()
);

-- Jegyezd fel az ID-t
SELECT LAST_INSERT_ID() AS guest_id;
```

### 1.4 Ellenőrzés

```sql
SELECT id, name, email, guest_type, registration_status
FROM Guest
WHERE email LIKE 'paros-test%'
ORDER BY id DESC LIMIT 1;
```

**Várt eredmény:**
- `guest_type`: paying_paired
- `registration_status`: invited

---

## 2. FÁZIS: Magic Link és Meghívó Küldés

### 2.1 Magic Link Küldés (UI)

1. Menj: **Vendégek** oldal
2. Keresd meg: `paros-test-YYYYMMDD@ceogala.hu`
3. Kattints: **Meghívó küldése** (boríték ikon)
4. Ellenőrizd az előnézetet
5. Kattints: **Küldés**

### 2.2 Alternatíva: API

```bash
# Kérd le a guest_id-t
curl -s "https://ceogala.mflevents.space/api/admin/guests?search=paros-test" \
  -H "Cookie: next-auth.session-token={TOKEN}" | jq '.guests[0].id'

# Küldj meghívót
curl -X POST https://ceogala.mflevents.space/api/email/send-magic-link \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token={TOKEN}" \
  -d '{"guest_ids": [{GUEST_ID}]}'
```

### 2.3 Magic Link Lekérdezése (Ha nincs email)

```sql
SELECT
    id,
    name,
    email,
    magic_link_hash,
    magic_link_expires_at,
    CONCAT(
        'https://ceogala.mflevents.space/register?code=',
        magic_link_hash,
        '&email=',
        email
    ) AS magic_link_url
FROM Guest
WHERE email LIKE 'paros-test%';
```

---

## 3. FÁZIS: Regisztráció - Magic Link Megnyitása

### 3.1 Link Megnyitása

1. Másold ki a magic link URL-t (emailből vagy SQL-ből)
2. Nyisd meg **inkognitó böngészőben**

**Várt eredmény:**
- Átirányítás: `/register/paid?guest_id={ID}`
- Regisztrációs form megjelenik
- Vendég neve látható: "Kedves Páros Teszt Vendég!"

---

## 4. FÁZIS: Regisztrációs Form Kitöltése (5 lépés)

### 4.1 Lépés 1: Jegy Típus Kiválasztása

1. Válaszd ki: **Páros jegy** (Paired Ticket)
2. Kattints: **Tovább**

**Megjegyzés:** Ez a lépés csak `paying_paired` típusú vendégeknél jelenik meg.

### 4.2 Lépés 2: Személyes Adatok

Töltsd ki az alábbi mezőket:

| Mező | Érték | Kötelező |
|------|-------|----------|
| Megszólítás | Dr. | Nem |
| Telefonszám | +36 70 999 8888 | **Igen** |
| Cégnév | Páros Industries Kft. | **Igen** |
| Pozíció | Ügyvezető | **Igen** |
| Étrendi igény | Vegetáriánus | Nem |
| Ültetési preferencia | Ablak mellett | Nem |

Kattints: **Tovább**

### 4.3 Lépés 3: Számlázási Adatok

Töltsd ki:

| Mező | Érték | Kötelező |
|------|-------|----------|
| Számlázási név | Páros Industries Kft. | **Igen** |
| Cégnév (számlán) | Páros Industries Kft. | Nem |
| Adószám | 12345678-2-42 | Nem (de validált) |
| Cím | Andrássy út 100. | **Igen** |
| Város | Budapest | **Igen** |
| Irányítószám | 1062 | **Igen** (4 számjegy) |
| Ország | HU | Alapértelmezett |

Kattints: **Tovább**

**Validációs szabályok:**
- Adószám formátum: `12345678-1-42` (8 számjegy - 1 számjegy - 2 számjegy)
- Irányítószám: pontosan 4 számjegy

### 4.4 Lépés 4: Partner Adatok

Töltsd ki:

| Mező | Érték | Kötelező |
|------|-------|----------|
| Partner neve | Páros Partner Anna | **Igen** (min 2 karakter) |
| Partner email | anna.partner-20251217@ceogala.hu | **Igen** (valid email) |

Kattints: **Tovább**

**Fontos:** Partner adatok csak páros jegy esetén jelennek meg!

### 4.5 Lépés 5: Beleegyezések

1. ✅ Pipáld be: **GDPR adatkezelési hozzájárulás**
2. ✅ Pipáld be: **Lemondási feltételek elfogadása**
3. Kattints: **Regisztráció befejezése** (Complete Registration)

**Várt eredmény:**
- Átirányítás: `/register/success?guest_id={ID}&type=paid`
- Sikeres regisztráció oldal megjelenik
- "Pay with Card" gomb látható

---

## 5. FÁZIS: Fizetés

### 5A. Opció: Bankkártya (Stripe)

#### 5A.1 Stripe Checkout Indítása

1. A sikeres regisztráció oldalon kattints: **Pay with Card**
2. Átirányítás Stripe Checkout oldalra

#### 5A.2 Teszt Kártya Adatok

| Mező | Érték |
|------|-------|
| Kártyaszám | 4242 4242 4242 4242 |
| Lejárat | 12/28 |
| CVC | 123 |
| Név | Páros Teszt Vendég |

3. Kattints: **Pay** / **Fizetés**

#### 5A.3 Sikeres Fizetés

**Várt eredmény:**
- Átirányítás: `/payment/success`
- Fizetés státusz: `paid`
- QR jegy email automatikusan kiküldve

#### 5A.4 Stripe Webhook Ellenőrzés (Fejlesztői)

```bash
# Ha lokálisan tesztelsz, indítsd el a Stripe CLI-t
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Webhook események figyelése
stripe events list --limit 5
```

---

### 5B. Opció: Banki Átutalás

#### 5B.1 Fizetés Létrehozása (SQL)

Ha a vendég banki átutalást választ (vagy tesztelni szeretnéd):

```sql
-- Kérd le a registration ID-t
SELECT r.id AS registration_id, g.name, g.email
FROM Registration r
JOIN Guest g ON r.guest_id = g.id
WHERE g.email LIKE 'paros-test%';

-- Hozz létre pending fizetést
INSERT INTO Payment (
    registration_id,
    amount,
    currency,
    payment_status,
    payment_method,
    created_at,
    updated_at
) VALUES (
    {REGISTRATION_ID},
    180000,  -- Páros jegy ára
    'HUF',
    'pending',
    'bank_transfer',
    NOW(),
    NOW()
);
```

#### 5B.2 Admin Jóváhagyás (UI)

1. Menj: **Fizetések** (`/admin/payments`)
2. Keresd meg a vendéget
3. Kattints: **Jóváhagyás** gomb
4. Erősítsd meg

#### 5B.3 Admin Jóváhagyás (SQL)

```sql
-- Fizetés jóváhagyása
UPDATE Payment
SET payment_status = 'paid',
    paid_at = NOW(),
    updated_at = NOW()
WHERE registration_id = {REGISTRATION_ID};

-- Vendég státusz frissítése
UPDATE Guest
SET registration_status = 'registered',
    updated_at = NOW()
WHERE id = {GUEST_ID};

-- QR kód generálása
UPDATE Registration
SET qr_code_hash = CONCAT('QR-', UNIX_TIMESTAMP(), '-', guest_id),
    updated_at = NOW()
WHERE id = {REGISTRATION_ID};
```

---

## 6. FÁZIS: QR Jegy Ellenőrzés

### 6.1 Adatbázis Ellenőrzés

```sql
SELECT
    g.id AS guest_id,
    g.name,
    g.email,
    g.guest_type,
    g.registration_status,
    r.id AS registration_id,
    r.ticket_type,
    r.partner_name,
    r.partner_email,
    r.qr_code_hash,
    p.payment_status,
    p.amount,
    p.payment_method,
    p.paid_at,
    b.billing_name,
    b.tax_number,
    b.city
FROM Guest g
LEFT JOIN Registration r ON g.id = r.guest_id
LEFT JOIN Payment p ON r.id = p.registration_id
LEFT JOIN BillingInfo b ON r.id = b.registration_id
WHERE g.email LIKE 'paros-test%';
```

### 6.2 Várt Végeredmény

| Mező | Várt Érték |
|------|-----------|
| guest_type | paying_paired |
| registration_status | registered |
| ticket_type | paid_paired |
| partner_name | Páros Partner Anna |
| partner_email | anna.partner-...@ceogala.hu |
| qr_code_hash | QR-{timestamp}-{guest_id} vagy JWT |
| payment_status | paid |
| amount | 180000 |
| billing_name | Páros Industries Kft. |

### 6.3 Email Napló Ellenőrzés

```sql
SELECT
    el.email_type,
    el.status,
    el.created_at
FROM EmailLog el
JOIN Guest g ON el.guest_id = g.id
WHERE g.email LIKE 'paros-test%'
ORDER BY el.created_at DESC;
```

**Várt emailek:**
1. `magic_link` - Meghívó
2. `ticket` - QR jegy (fizetés után)

---

## 7. FÁZIS: Takarítás

```sql
-- Payment törlése
DELETE FROM Payment WHERE registration_id IN (
    SELECT id FROM Registration WHERE guest_id IN (
        SELECT id FROM Guest WHERE email LIKE 'paros-test%'
    )
);

-- BillingInfo törlése
DELETE FROM BillingInfo WHERE registration_id IN (
    SELECT id FROM Registration WHERE guest_id IN (
        SELECT id FROM Guest WHERE email LIKE 'paros-test%'
    )
);

-- Registration törlése
DELETE FROM Registration WHERE guest_id IN (
    SELECT id FROM Guest WHERE email LIKE 'paros-test%'
);

-- EmailLog törlése
DELETE FROM EmailLog WHERE guest_id IN (
    SELECT id FROM Guest WHERE email LIKE 'paros-test%'
);

-- Guest törlése
DELETE FROM Guest WHERE email LIKE 'paros-test%';
```

---

## Hibaelhárítás

### Probléma: "Jegy típus választó nem jelenik meg"

**Ok:** A vendég `paying_single` típusként lett létrehozva, nem `paying_paired`.

**Megoldás:**
```sql
UPDATE Guest SET guest_type = 'paying_paired' WHERE email = 'vendeg@email.hu';
```

### Probléma: "Partner adatok lépés kimarad"

**Ok:** Single ticket lett kiválasztva az 1. lépésben.

**Megoldás:** Menj vissza és válaszd a "Paired Ticket" opciót.

### Probléma: "Adószám validációs hiba"

**Ok:** Helytelen formátum.

**Megoldás:** Használd a formátumot: `12345678-1-42`

### Probléma: "Stripe fizetés sikertelen"

**Ok:** Teszt kártya helyett éles kártyaszám, vagy hibás Stripe konfiguráció.

**Megoldás:**
- Használd a teszt kártyát: `4242 4242 4242 4242`
- Ellenőrizd a `.env` Stripe kulcsokat (test mode)

### Probléma: "QR jegy email nem érkezik"

**Ok:** SMTP konfiguráció hiba vagy sikertelen payment webhook.

**Megoldás:**
```bash
# Ellenőrizd az SMTP-t
grep SMTP /var/www/ceog/.env

# Ellenőrizd a webhook logokat
pm2 logs ceog --lines 50 | grep -i stripe
```

---

## Automatizált Tesztek

```bash
# Páros fizetési demo
BASE_URL=https://ceogala.mflevents.space npx playwright test paired-payment-demo

# Teljes fizetési flow
BASE_URL=https://ceogala.mflevents.space npx playwright test full-payment-flow-demo

# Stripe tesztek
BASE_URL=https://ceogala.mflevents.space npx playwright test stripe-payment
```

---

## Jegyárak Referencia

| Jegy típus | Ár | Kód |
|------------|-----|-----|
| VIP | Ingyenes | `vip_free` |
| Egyéni fizető | 100,000 Ft | `paid_single` |
| Páros fizető | 180,000 Ft | `paid_paired` |

---

## Kapcsolódó Dokumentáció

- [Vendég Import + Meghívó](./MANUAL-GUEST-IMPORT-INVITATION.md) - Részletes CSV import
- [Stripe Fizetés](./MANUAL-STRIPE-PAYMENT.md) - Stripe konfiguráció részletek
- [Banki Átutalás](./MANUAL-PAYMENT-FLOW-TEST.md) - Bank transfer jóváhagyás
- [Admin Email](./MANUAL-ADMIN-EMAIL.md) - Email napló és sablonok
- [E2E Teszt Státusz](./E2E-TEST-STATUS.md) - Automatizált tesztek

---

*Utolsó frissítés: 2025-12-17*
*Készítette: Paige (Tech Writer) + Murat (TEA)*
