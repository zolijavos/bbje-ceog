# Manuális Tesztelési Útmutató: Teljes Fizetési Folyamat

> **Cél:** Páros jegy regisztráció → Banki átutalás → Admin jóváhagyás → QR jegy generálás
>
> **Időtartam:** ~10 perc
>
> **Előfeltételek:** Admin hozzáférés, böngésző

---

## Teszt Adatok

| Mező | Érték |
|------|-------|
| **Teszt vendég neve** | Demo VIP Vendég |
| **Email** | `test-paros-YYYYMMDD@ceogala.hu` (használj egyedi dátumot) |
| **Telefonszám** | +36 70 555 1234 |
| **Cégnév** | VIP Industries Kft. |
| **Pozíció** | Vezérigazgató |
| **Étrend** | Gluténmentes |
| **Számlázási név** | VIP Industries Kft. |
| **Adószám** | 12345678-2-42 |
| **Cím** | Váci út 99, A épület |
| **Város** | Budapest |
| **Irányítószám** | 1138 |
| **Partner neve** | VIP Partner Anna |
| **Partner email** | anna.partner@vipindustries.hu |

---

## 1. FÁZIS: Teszt Vendég Létrehozása

### 1.1 Admin Bejelentkezés
1. Nyisd meg: **https://ceogala.mflevents.space/admin**
2. Bejelentkezési adatok:
   - Email: `admin@ceogala.test`
   - Jelszó: `Admin123!`
3. Kattints a **Bejelentkezés** gombra

### 1.2 Új Vendég Hozzáadása
1. Menj a **Vendégek** menüpontra
2. Kattints az **Új vendég** gombra
3. Töltsd ki:
   - **Név:** Demo VIP Vendég
   - **Email:** test-paros-YYYYMMDD@ceogala.hu *(egyedi email!)*
   - **Típus:** Fizető páros (`paying_paired`)
   - **Státusz:** Meghívott (`invited`)
4. Mentsd el

### 1.3 Vendég ID Feljegyzése
- A mentés után jegyezd fel a **Vendég ID**-t (pl. 1260)
- Erre szükség lesz a regisztrációs linkhez

---

## 2. FÁZIS: Vendég Regisztráció (5 lépés)

### 2.1 Regisztrációs Link Megnyitása
Nyisd meg böngészőben:
```
https://ceogala.mflevents.space/register/paid?guest_id={VENDEG_ID}
```
Példa: `https://ceogala.mflevents.space/register/paid?guest_id=1260`

### 2.2 Lépés 1: Jegy Típus Kiválasztása
1. Válaszd ki: **Páros jegy** (150.000 Ft)
2. Kattints: **Tovább**

![Step 1](https://ceogala.mflevents.space/test-screenshots/01-before-registration-submit.png)

### 2.3 Lépés 2: Személyes Adatok
Töltsd ki az alábbi mezőket:

| Mező | Érték |
|------|-------|
| Telefonszám | +36 70 555 1234 |
| Cégnév | VIP Industries Kft. |
| Pozíció | Vezérigazgató |
| Étrendi igény | Gluténmentes |

Kattints: **Tovább**

### 2.4 Lépés 3: Számlázási Adatok
Töltsd ki:

| Mező | Érték |
|------|-------|
| Számlázási név | VIP Industries Kft. |
| Adószám | 12345678-2-42 |
| Cím | Váci út 99, A épület |
| Város | Budapest |
| Irányítószám | 1138 |

Kattints: **Tovább**

### 2.5 Lépés 4: Partner Adatok
Töltsd ki:

| Mező | Érték |
|------|-------|
| Partner neve | VIP Partner Anna |
| Partner email | anna.partner@vipindustries.hu |

Kattints: **Tovább**

### 2.6 Lépés 5: Beleegyezések
1. Pipáld be: **GDPR adatkezelési hozzájárulás**
2. Pipáld be: **Lemondási feltételek elfogadása**
3. Kattints: **Regisztráció Elküldése**

### 2.7 Sikeres Regisztráció
- Átirányítás: `/register/success?guest_id={ID}&type=paid`
- Megjelenik a sikeres regisztráció üzenet

![Step 2](https://ceogala.mflevents.space/test-screenshots/02-registration-complete.png)

---

## 3. FÁZIS: Banki Átutalás Létrehozása (Admin)

> **Megjegyzés:** Stripe nélküli teszteléshez manuálisan kell létrehozni a fizetést.

### 3.1 MySQL Konzol Megnyitása
```bash
mysql -u ceog_user -p ceog
# Jelszó: CeogGala2026Secure!
```

### 3.2 Regisztráció ID Lekérdezése
```sql
SELECT r.id, r.guest_id, r.ticket_type, g.name, g.email
FROM Registration r
JOIN Guest g ON r.guest_id = g.id
WHERE g.email LIKE 'test-paros%'
ORDER BY r.id DESC
LIMIT 1;
```

Jegyezd fel a **Registration ID**-t (pl. 150)

### 3.3 Fizetés Létrehozása
```sql
INSERT INTO Payment (registration_id, amount, currency, payment_status, payment_method, created_at, updated_at)
VALUES ({REGISTRATION_ID}, 150000, 'HUF', 'pending', 'bank_transfer', NOW(), NOW());
```

Példa:
```sql
INSERT INTO Payment (registration_id, amount, currency, payment_status, payment_method, created_at, updated_at)
VALUES (150, 150000, 'HUF', 'pending', 'bank_transfer', NOW(), NOW());
```

### 3.4 Ellenőrzés
```sql
SELECT * FROM Payment WHERE registration_id = {REGISTRATION_ID};
```

Várt eredmény:
- `payment_status`: pending
- `amount`: 150000
- `payment_method`: bank_transfer

---

## 4. FÁZIS: Admin Fizetés Jóváhagyás

### 4.1 Fizetések Oldal Megnyitása
1. Admin felület: **https://ceogala.mflevents.space/admin**
2. Menj: **Fizetések** menüpont
3. URL: `https://ceogala.mflevents.space/admin/payments`

![Step 5](https://ceogala.mflevents.space/test-screenshots/05-payments-page.png)

### 4.2 Teszt Vendég Megkeresése
1. Keresd meg a táblázatban: `test-paros-YYYYMMDD@ceogala.hu`
2. Ellenőrizd az adatokat:
   - Összeg: 150.000 Ft
   - Státusz: Függőben (pending)
   - Módszer: Banki átutalás

![Step 6](https://ceogala.mflevents.space/test-screenshots/06-payment-row-found.png)

### 4.3 Fizetés Jóváhagyása
**A) Ha van Jóváhagyás gomb:**
1. Kattints a **Jóváhagyás** gombra a vendég sorában
2. Erősítsd meg a műveletet

**B) Ha nincs gomb (manuális jóváhagyás):**
```sql
-- Fizetés jóváhagyása
UPDATE Payment
SET payment_status = 'paid', paid_at = NOW(), updated_at = NOW()
WHERE registration_id = {REGISTRATION_ID};

-- Vendég státusz frissítése
UPDATE Guest
SET registration_status = 'registered', updated_at = NOW()
WHERE id = {GUEST_ID};

-- QR kód generálása
UPDATE Registration
SET qr_code_hash = CONCAT('QR-', UNIX_TIMESTAMP(), '-', guest_id), updated_at = NOW()
WHERE id = {REGISTRATION_ID};
```

### 4.4 Oldal Frissítése
1. Frissítsd az oldalt (F5)
2. Ellenőrizd: Fizetés státusz = **Fizetve** (paid)

![Step 7](https://ceogala.mflevents.space/test-screenshots/07-after-db-approval.png)

---

## 5. FÁZIS: Ellenőrzés

### 5.1 Vendég Adatok Ellenőrzése
1. Menj: **Vendégek** oldal (`/admin/guests`)
2. Keresd meg a teszt vendéget
3. Ellenőrizd:
   - Státusz: **registered**
   - Van QR kód hash

![Step 8](https://ceogala.mflevents.space/test-screenshots/08-guests-page.png)

### 5.2 Adatbázis Ellenőrzés
```sql
-- Teljes állapot lekérdezése
SELECT
    g.id AS guest_id,
    g.name,
    g.email,
    g.registration_status,
    r.id AS registration_id,
    r.ticket_type,
    r.partner_name,
    r.qr_code_hash,
    p.payment_status,
    p.amount,
    p.paid_at
FROM Guest g
LEFT JOIN Registration r ON g.id = r.guest_id
LEFT JOIN Payment p ON r.id = p.registration_id
WHERE g.email LIKE 'test-paros%'
ORDER BY g.id DESC
LIMIT 1;
```

### 5.3 Várt Végeredmény

| Mező | Várt Érték |
|------|-----------|
| registration_status | registered |
| ticket_type | paid_paired |
| partner_name | VIP Partner Anna |
| qr_code_hash | QR-{timestamp}-{guest_id} |
| payment_status | paid |
| amount | 150000 |
| paid_at | {mai dátum} |

---

## 6. FÁZIS: Takarítás (Opcionális)

### 6.1 Teszt Adatok Törlése
```sql
-- Fizetés törlése
DELETE FROM Payment WHERE registration_id IN (
    SELECT id FROM Registration WHERE guest_id IN (
        SELECT id FROM Guest WHERE email LIKE 'test-paros%'
    )
);

-- Számlázási adatok törlése
DELETE FROM BillingInfo WHERE registration_id IN (
    SELECT id FROM Registration WHERE guest_id IN (
        SELECT id FROM Guest WHERE email LIKE 'test-paros%'
    )
);

-- Regisztráció törlése
DELETE FROM Registration WHERE guest_id IN (
    SELECT id FROM Guest WHERE email LIKE 'test-paros%'
);

-- Vendég törlése
DELETE FROM Guest WHERE email LIKE 'test-paros%';
```

---

## Hibaelhárítás

### Probléma: "Guest not found" hiba
- **Ok:** Hibás guest_id a URL-ben
- **Megoldás:** Ellenőrizd a vendég ID-t az admin felületen

### Probléma: Regisztráció nem menti
- **Ok:** Hiányzó kötelező mezők
- **Megoldás:** Töltsd ki az összes mezőt (GDPR + lemondási feltételek)

### Probléma: Fizetés jóváhagyás 403 hiba
- **Ok:** Nincs admin session
- **Megoldás:** Jelentkezz be újra az admin felületre, vagy használd az SQL parancsokat

### Probléma: QR kód nem generálódik
- **Ok:** Manuális jóváhagyásnál nem frissült a Registration tábla
- **Megoldás:** Futtasd az UPDATE parancsot a qr_code_hash-re

---

## Automatizált Teszt Futtatása

Ha inkább automatizáltan szeretnéd tesztelni:

```bash
cd /var/www/ceog
BASE_URL=https://ceogala.mflevents.space npx playwright test full-payment-flow-demo --project=chromium
```

A videó itt található: `/var/www/ceog/test-results/`

---

## Kapcsolódó Fájlok

- **Automatizált teszt:** [tests/e2e/specs/full-payment-flow-demo.spec.ts](../../tests/e2e/specs/full-payment-flow-demo.spec.ts)
- **Demo videó:** [public/test-videos/full-payment-flow-demo-20251215-134928.webm](https://ceogala.mflevents.space/test-videos/full-payment-flow-demo-20251215-134928.webm)
- **Screenshotok:** [public/test-screenshots/](https://ceogala.mflevents.space/test-screenshots/)

---

## Kapcsolódó Manuális Útmutatók

- [Vendég Import + Meghívó](./MANUAL-GUEST-IMPORT-INVITATION.md)
- [VIP Regisztráció + PWA](./MANUAL-VIP-REGISTRATION.md)
- [Páros Regisztráció (E2E)](./MANUAL-PAIRED-REGISTRATION-FLOW.md)
- [Jelentkező Jóváhagyás](./MANUAL-APPLICANT-APPROVAL.md)
- [Admin Ültetés](./MANUAL-ADMIN-SEATING.md)
- [Admin Email](./MANUAL-ADMIN-EMAIL.md)
- [Staff Check-in](./MANUAL-STAFF-CHECKIN.md)
- [Stripe Fizetés](./MANUAL-STRIPE-PAYMENT.md)

---

*Utolsó frissítés: 2025-12-17*
*Készítette: Paige (Tech Writer) + Murat (TEA)*
