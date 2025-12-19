# Manuális Tesztelési Útmutató: Staff Check-in

> **Cél:** Staff bejelentkezés → Check-in statisztikák → QR validálás → Duplikált check-in kezelés
>
> **Időtartam:** ~10 perc
>
> **Előfeltételek:** Staff hozzáférés, regisztrált vendég QR kóddal

---

## Teszt Adatok

| Mező | Érték |
|------|-------|
| **Staff email** | staff@ceogala.test |
| **Staff jelszó** | Staff123! |
| **Teszt vendég** | Check-in Teszt Vendég |
| **Teszt email** | checkin-test@ceogala.hu |

---

## 1. FÁZIS: Előkészítés

### 1.1 Teszt Vendég Létrehozása QR Kóddal

```bash
mysql -u ceog_user -pCeogGala2026Secure! ceog
```

```sql
-- Vendég létrehozása
INSERT INTO Guest (email, name, guest_type, registration_status, created_at, updated_at)
VALUES ('checkin-test@ceogala.hu', 'Check-in Teszt Vendég', 'vip', 'registered', NOW(), NOW());

-- Guest ID lekérdezése
SELECT id FROM Guest WHERE email = 'checkin-test@ceogala.hu';

-- Regisztráció létrehozása QR kóddal
INSERT INTO Registration (
    guest_id,
    ticket_type,
    qr_code_hash,
    gdpr_consent,
    gdpr_consent_at,
    cancellation_accepted,
    cancellation_accepted_at,
    created_at,
    updated_at
)
VALUES (
    {GUEST_ID},
    'vip_free',
    'TEST-QR-TOKEN-123456789',
    1, NOW(),
    1, NOW(),
    NOW(), NOW()
);

-- Registration ID lekérdezése
SELECT id, guest_id, qr_code_hash FROM Registration WHERE guest_id = {GUEST_ID};
```

### 1.2 JWT QR Token Generálása (Éles Formátum)

```javascript
// Node.js-ben
const jwt = require('jsonwebtoken');
const QR_SECRET = 'your-qr-secret-min-64-chars';

const token = jwt.sign({
    registration_id: {REGISTRATION_ID},
    guest_id: {GUEST_ID},
    ticket_type: 'vip_free'
}, QR_SECRET, { expiresIn: '48h' });

console.log(token);
```

---

## 2. FÁZIS: Staff Bejelentkezés

### 2.1 Admin Login Oldal
1. Nyisd meg: **https://ceogala.mflevents.space/admin**
2. Bejelentkezési adatok:
   - Email: `staff@ceogala.test`
   - Jelszó: `Staff123!`
3. Kattints: **Bejelentkezés**

### 2.2 Dashboard Ellenőrzése
- Megjelenik: "Vezérlőpult" / "Dashboard"
- Staff szerepkör korlátozások érvényesek
- Nem minden menüpont elérhető

---

## 3. FÁZIS: Check-in Statisztikák

### 3.1 Statisztikák Oldal
1. Navigálj: **Statistics** (`/admin/statistics`)
2. Látható adatok:
   - Összes vendég
   - Regisztrált vendégek
   - Check-in megtörtént
   - Még várakozik

### 3.2 Várt Statisztikák Mezők

| Mező | Leírás |
|------|--------|
| Total Guests | Összes vendég a rendszerben |
| Registered | Sikeres regisztrációk |
| Checked In | Beléptetett vendégek |
| Pending | Várakozó belépők |
| VIP | VIP vendégek száma |
| Paid | Fizető vendégek |

---

## 4. FÁZIS: Check-in Napló

### 4.1 Check-in Napló Oldal
1. Navigálj: **Check-in Log** (`/admin/checkin-log`)
2. Megjelenik a belépések listája

### 4.2 Napló Oszlopok

| Oszlop | Leírás |
|--------|--------|
| Időpont | Check-in időpontja |
| Vendég | Név és email |
| Jegy típus | VIP, Fizető, stb. |
| Módszer | qr_scan, manual |
| Staff | Ki léptette be |
| Override | Admin felülírás volt-e |

### 4.3 Szűrés
1. Dátum szerint
2. Módszer szerint (QR / Manual)
3. Keresés név/email alapján

---

## 5. FÁZIS: QR Kód Validálás

### 5.1 Validálás API Tesztelése

```bash
# QR token validálása
curl -X POST https://ceogala.mflevents.space/api/checkin/validate \
  -H "Content-Type: application/json" \
  -d '{"qrToken": "TEST-QR-TOKEN-123456789"}'
```

**Várt válasz (sikeres):**
```json
{
  "valid": true,
  "guest": {
    "id": 123,
    "name": "Check-in Teszt Vendég",
    "email": "checkin-test@ceogala.hu",
    "guest_type": "vip"
  },
  "registration": {
    "id": 456,
    "ticket_type": "vip_free"
  },
  "alreadyCheckedIn": false
}
```

### 5.2 Check-in Végrehajtása

```bash
# Check-in submit
curl -X POST https://ceogala.mflevents.space/api/checkin/submit \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "TEST-QR-TOKEN-123456789",
    "registration_id": {REGISTRATION_ID}
  }'
```

**Várt válasz:**
```json
{
  "success": true,
  "message": "Check-in successful",
  "checkin": {
    "id": 789,
    "checked_in_at": "2025-12-17T10:30:00Z"
  }
}
```

### 5.3 Check-in UI-n Keresztül (ha van)
1. Navigálj: `/checkin` vagy `/admin/checkin`
2. Scanneld be a QR kódot (kamera)
3. Vagy írd be manuálisan a kódot
4. Zöld kártya = sikeres
5. Piros kártya = érvénytelen

---

## 6. FÁZIS: Duplikált Check-in Kezelés

### 6.1 Második Validálás

```bash
# Ugyanaz a token másodszor
curl -X POST https://ceogala.mflevents.space/api/checkin/validate \
  -H "Content-Type: application/json" \
  -d '{"qrToken": "TEST-QR-TOKEN-123456789"}'
```

**Várt válasz:**
```json
{
  "valid": true,
  "guest": {...},
  "alreadyCheckedIn": true,
  "checkedInAt": "2025-12-17T10:30:00Z",
  "checkedInBy": "staff@ceogala.test"
}
```

### 6.2 Duplikált Check-in Submit

```bash
curl -X POST https://ceogala.mflevents.space/api/checkin/submit \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "TEST-QR-TOKEN-123456789",
    "registration_id": {REGISTRATION_ID}
  }'
```

**Várt válasz (409 Conflict):**
```json
{
  "error": "Already checked in",
  "checkedInAt": "2025-12-17T10:30:00Z"
}
```

### 6.3 Admin Override (ha szükséges)

```bash
# Force check-in (csak admin)
curl -X POST https://ceogala.mflevents.space/api/checkin/submit \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "TEST-QR-TOKEN-123456789",
    "registration_id": {REGISTRATION_ID},
    "override": true
  }'
```

---

## 7. FÁZIS: Adatbázis Ellenőrzés

### 7.1 Check-in Rekord

```sql
SELECT
    c.id,
    g.name,
    g.email,
    r.ticket_type,
    c.method,
    c.is_override,
    u.email AS staff_email,
    c.created_at AS checked_in_at
FROM Checkin c
JOIN Guest g ON c.guest_id = g.id
JOIN Registration r ON c.registration_id = r.id
LEFT JOIN User u ON c.staff_user_id = u.id
WHERE g.email = 'checkin-test@ceogala.hu';
```

### 7.2 Várt Eredmény

| Mező | Érték |
|------|-------|
| method | qr_scan |
| is_override | 0 |
| staff_email | staff@ceogala.test |

### 7.3 Check-in Statisztika

```sql
SELECT
    COUNT(*) AS total_checkins,
    SUM(CASE WHEN c.is_override = 1 THEN 1 ELSE 0 END) AS overrides,
    COUNT(DISTINCT c.guest_id) AS unique_guests
FROM Checkin c
WHERE DATE(c.created_at) = CURDATE();
```

---

## 8. FÁZIS: Takarítás

```sql
-- Check-in törlése
DELETE FROM Checkin WHERE guest_id IN (
    SELECT id FROM Guest WHERE email = 'checkin-test@ceogala.hu'
);

-- Regisztráció törlése
DELETE FROM Registration WHERE guest_id IN (
    SELECT id FROM Guest WHERE email = 'checkin-test@ceogala.hu'
);

-- Vendég törlése
DELETE FROM Guest WHERE email = 'checkin-test@ceogala.hu';
```

---

## Hibaelhárítás

### Probléma: "Invalid QR code"
- **Ok:** Token lejárt vagy hibás formátum
- **Megoldás:** Generálj új JWT tokent, vagy ellenőrizd a QR_SECRET-et

### Probléma: 403 Forbidden az API hívásnál
- **Ok:** CSRF védelem vagy hiányzó session
- **Megoldás:** Böngészőből hívd az API-t (ahol van session), vagy add hozzá az Origin headert

### Probléma: Staff nem látja a check-in menüt
- **Ok:** Szerepkör korlátozás
- **Megoldás:** Ellenőrizd a User tábla `role` mezőjét

### Probléma: Duplikált check-in engedélyezett
- **Ok:** UNIQUE constraint hiányzik
- **Megoldás:**
```sql
ALTER TABLE Checkin ADD UNIQUE INDEX unique_registration (registration_id);
```

---

## Automatizált Teszt

```bash
cd /var/www/ceog
BASE_URL=http://localhost:3000 npx playwright test --project=video-journey 05-staff-checkin.journey.spec.ts
```

**Videó:** `public/test-videos/05-staff-checkin-journey.webm`

---

## Kapcsolódó Dokumentumok

- [E2E Teszt Státusz](./E2E-TEST-STATUS.md)
- [Check-in API](../../app/api/checkin/)
- [Journey Teszt Fájl](../../tests/e2e/specs/05-staff-checkin.journey.spec.ts)

---

*Utolsó frissítés: 2025-12-17*
*Készítette: Paige (Tech Writer) + Murat (TEA)*
