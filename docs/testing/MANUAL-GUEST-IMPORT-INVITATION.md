# Manuális Tesztelési Útmutató: Vendég Import és Meghívó Küldés

> **Cél:** Vendég hozzáadása → CSV import → Magic link generálás → Meghívó email küldés
>
> **Időtartam:** ~15-20 perc
>
> **Előfeltételek:** Admin hozzáférés, böngésző, email hozzáférés (teszt email cím)

---

## Teszt Adatok

### Manuális vendég hozzáadás

| Mező | Érték |
|------|-------|
| **Név** | Teszt Vendég Manual |
| **Email** | `test-manual-YYYYMMDD@ceogala.hu` |
| **Típus** | VIP |
| **Telefon** | +36 70 111 2222 |
| **Cégnév** | Manual Industries Kft. |
| **Pozíció** | Igazgató |

### CSV import teszt fájl

```csv
email,name,guest_type,phone,company,position
vip1-YYYYMMDD@ceogala.hu,VIP Egy,vip,+36701112233,VIP Corp,CEO
vip2-YYYYMMDD@ceogala.hu,VIP Kettő,vip,+36701112234,VIP Corp,CFO
paying1-YYYYMMDD@ceogala.hu,Fizető Egy,paying_single,+36701112235,Paying Ltd,Manager
paying2-YYYYMMDD@ceogala.hu,Fizető Páros,paying_paired,+36701112236,Pair Inc,Director
```

---

## 1. FÁZIS: Admin Bejelentkezés

### 1.1 Bejelentkezés

1. Nyisd meg: **https://ceogala.mflevents.space/admin**
2. Bejelentkezési adatok:
   - Email: `admin@ceogala.test`
   - Jelszó: `Admin123!`
3. Kattints: **Bejelentkezés**

**Várt eredmény:** Admin dashboard megjelenik

---

## 2. FÁZIS: Vendég Manuális Hozzáadása

### 2.1 Új Vendég Form Megnyitása

1. Menj: **Vendégek** menüpont (`/admin/guests`)
2. Kattints: **Új vendég** gomb (+ ikon)

### 2.2 Vendég Adatok Kitöltése

| Mező | Érték |
|------|-------|
| Név | Teszt Vendég Manual |
| Email | `test-manual-YYYYMMDD@ceogala.hu` |
| Típus | VIP |
| Telefon | +36 70 111 2222 |
| Cégnév | Manual Industries Kft. |
| Pozíció | Igazgató |

3. Kattints: **Mentés**

**Várt eredmény:**
- Sikeres mentés üzenet
- Új vendég megjelenik a listában
- Státusz: `invited` (Meghívott)
- Magic link: Nincs (még nem küldtünk)

### 2.3 Ellenőrzés (Adatbázis)

```sql
SELECT id, name, email, guest_type, registration_status,
       magic_link_hash, magic_link_expires_at
FROM Guest
WHERE email LIKE 'test-manual%'
ORDER BY id DESC LIMIT 1;
```

**Várt eredmény:**
- `registration_status`: invited
- `magic_link_hash`: NULL
- `magic_link_expires_at`: NULL

---

## 3. FÁZIS: CSV Fájl Importálás

### 3.1 CSV Fájl Előkészítése

Hozz létre egy `guests-test.csv` fájlt a következő tartalommal:

```csv
email,name,guest_type,phone,company,position
vip1-20251217@ceogala.hu,VIP Egy,vip,+36701112233,VIP Corp,CEO
vip2-20251217@ceogala.hu,VIP Kettő,vip,+36701112234,VIP Corp,CFO
paying1-20251217@ceogala.hu,Fizető Egy,paying_single,+36701112235,Paying Ltd,Manager
paying2-20251217@ceogala.hu,Fizető Páros,paying_paired,+36701112236,Pair Inc,Director
```

**Fontos:** Minden teszthez használj egyedi dátumot az emailekben!

### 3.2 Import Végrehajtása

1. Menj: **Vendégek** menüpont (`/admin/guests`)
2. Kattints: **Import CSV** gomb
3. Válaszd ki a `guests-test.csv` fájlt
4. Kattints: **Feltöltés**

**Várt eredmény:**
- Sikeres import üzenet: "4 vendég sikeresen importálva"
- Mind a 4 vendég megjelenik a listában

### 3.3 Alternatíva: API-n keresztül

```bash
curl -X POST https://ceogala.mflevents.space/api/admin/guests/import \
  -H "Cookie: next-auth.session-token={SESSION_TOKEN}" \
  -F "file=@guests-test.csv"
```

### 3.4 Ellenőrzés

```sql
SELECT id, name, email, guest_type, registration_status
FROM Guest
WHERE email LIKE '%20251217@ceogala.hu'
ORDER BY id DESC;
```

**Várt eredmény:** 4 új vendég, mind `invited` státusszal

---

## 4. FÁZIS: Magic Link Generálás és Email Küldés

### 4.1 Egyedi Meghívó Küldés (UI)

1. Menj: **Vendégek** oldal
2. Keresd meg: `test-manual-YYYYMMDD@ceogala.hu`
3. Kattints a vendég sorában: **Meghívó küldése** (boríték ikon)
4. Email előnézet modal megjelenik
5. Ellenőrizd a tartalmat
6. Kattints: **Küldés**

**Várt eredmény:**
- Sikeres küldés üzenet
- A vendég sorában: "Magic link elküldve" jelzés
- `hasMagicLink: true`

### 4.2 Tömeges Meghívó Küldés (UI)

1. Menj: **Vendégek** oldal
2. Jelöld ki a checkboxokkal a 4 importált vendéget
3. Kattints: **Kijelöltek meghívása** gomb
4. Megerősítő dialog megjelenik
5. Kattints: **Küldés**

**Várt eredmény:**
- Sikeres üzenet: "4 meghívó elküldve"
- Mind a 4 vendégnél magic link aktív

### 4.3 Alternatíva: API-n keresztül

```bash
# Kérd le a vendég ID-kat
curl -X GET "https://ceogala.mflevents.space/api/admin/guests?search=20251217" \
  -H "Cookie: next-auth.session-token={SESSION_TOKEN}"

# Küldj meghívót (cseréld ki az ID-kat)
curl -X POST https://ceogala.mflevents.space/api/email/send-magic-link \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token={SESSION_TOKEN}" \
  -d '{"guest_ids": [1001, 1002, 1003, 1004]}'
```

### 4.4 Magic Link Ellenőrzése (Adatbázis)

```sql
SELECT
    id,
    name,
    email,
    guest_type,
    magic_link_hash,
    magic_link_expires_at,
    CASE
        WHEN magic_link_expires_at > NOW() THEN 'AKTÍV'
        ELSE 'LEJÁRT'
    END AS link_status
FROM Guest
WHERE email LIKE '%20251217@ceogala.hu'
ORDER BY id DESC;
```

**Várt eredmény:**
- `magic_link_hash`: 64 karakteres hex string (SHA-256)
- `magic_link_expires_at`: 24 óra múlva
- `link_status`: AKTÍV

---

## 5. FÁZIS: Magic Link Tesztelése

### 5.1 Magic Link URL Összeállítása

A magic link URL formátuma:
```
https://ceogala.mflevents.space/register?code={magic_link_hash}&email={email}
```

**Példa:**
```
https://ceogala.mflevents.space/register?code=a1b2c3d4e5f6...&email=vip1-20251217@ceogala.hu
```

### 5.2 Link Lekérdezése (ha nem kaptad meg emailben)

```sql
SELECT
    CONCAT(
        'https://ceogala.mflevents.space/register?code=',
        magic_link_hash,
        '&email=',
        email
    ) AS magic_link_url
FROM Guest
WHERE email = 'vip1-20251217@ceogala.hu';
```

### 5.3 Link Megnyitása

1. Másold ki a magic link URL-t
2. Nyisd meg böngészőben (inkognitó mód ajánlott)

**Várt eredmény:**
- Regisztrációs oldal megjelenik
- Vendég neve és típusa megjelenik
- Folytatható a regisztráció

### 5.4 Lejárt Link Tesztelése (Opcionális)

```sql
-- Állítsd lejártra a linket
UPDATE Guest
SET magic_link_expires_at = DATE_SUB(NOW(), INTERVAL 1 HOUR)
WHERE email = 'vip2-20251217@ceogala.hu';
```

Nyisd meg a linket:

**Várt eredmény:**
- Hibaüzenet: "A meghívó link lejárt (24 óra után érvénytelen)"

---

## 6. FÁZIS: Email Napló Ellenőrzése

### 6.1 Admin Email Napló

1. Menj: **Email napló** menüpont (`/admin/email`)
2. Keresd: a teszt email címeket

**Várt eredmény:**
- Minden küldött email látható
- Státusz: `sent` (sikeres)
- Típus: `magic_link`

### 6.2 Adatbázis Ellenőrzés

```sql
SELECT
    el.id,
    g.name,
    g.email,
    el.email_type,
    el.status,
    el.created_at
FROM EmailLog el
JOIN Guest g ON el.guest_id = g.id
WHERE g.email LIKE '%20251217@ceogala.hu'
ORDER BY el.created_at DESC;
```

---

## 7. FÁZIS: Takarítás

### 7.1 Teszt Vendégek Törlése

```sql
-- Email napló törlése
DELETE FROM EmailLog WHERE guest_id IN (
    SELECT id FROM Guest WHERE email LIKE '%20251217@ceogala.hu'
);

-- Vendégek törlése
DELETE FROM Guest WHERE email LIKE '%20251217@ceogala.hu';

-- Manuális teszt vendég törlése
DELETE FROM Guest WHERE email LIKE 'test-manual%';
```

---

## Hibaelhárítás

### Probléma: CSV import sikertelen

**Lehetséges okok:**
- Hibás CSV formátum (pontosvessző helyett vessző kell)
- Hiányzó kötelező mezők (email, name, guest_type)
- Érvénytelen guest_type (csak: vip, paying_single, paying_paired)

**Megoldás:**
- Ellenőrizd a CSV fejlécet: `email,name,guest_type`
- Használj UTF-8 kódolást

### Probléma: Email küldés sikertelen

**Lehetséges okok:**
- SMTP konfiguráció hiba
- Rate limit (max 5 email/típus/óra, 20 összesen/óra/vendég)

**Megoldás:**
```bash
# Ellenőrizd az SMTP beállításokat
grep SMTP /var/www/ceog/.env
```

### Probléma: Magic link érvénytelen

**Lehetséges okok:**
- Link lejárt (24 óra)
- Email cím nem egyezik
- Hash hibás/módosult

**Megoldás:**
```sql
-- Ellenőrizd a lejáratot
SELECT magic_link_expires_at, NOW(),
       TIMESTAMPDIFF(HOUR, NOW(), magic_link_expires_at) AS hours_remaining
FROM Guest WHERE email = 'vendeg@email.hu';
```

### Probléma: Duplikált email hiba

**Ok:** Az email cím már létezik az adatbázisban

**Megoldás:**
```sql
-- Keresd meg a meglévő vendéget
SELECT * FROM Guest WHERE email = 'duplikalt@email.hu';

-- Vagy töröld és importáld újra
DELETE FROM Guest WHERE email = 'duplikalt@email.hu';
```

---

## Automatizált Teszt Futtatása

```bash
# E2E teszt a vendég importhoz
BASE_URL=https://ceogala.mflevents.space npx playwright test tests/e2e/specs/applicant.spec.ts

# Guest management tesztek
BASE_URL=https://ceogala.mflevents.space npx playwright test --grep "guest"
```

---

## CSV Formátum Referencia

### Kötelező mezők

| Mező | Típus | Leírás |
|------|-------|--------|
| `email` | string | Egyedi email cím |
| `name` | string | Vendég teljes neve (min 2 karakter) |
| `guest_type` | enum | `vip`, `paying_single`, vagy `paying_paired` |

### Opcionális mezők

| Mező | Típus | Leírás |
|------|-------|--------|
| `phone` | string | Telefonszám |
| `company` | string | Cégnév |
| `position` | string | Beosztás |

### Alternatív oszlopnevek (támogatott)

| Standard | Alternatívák |
|----------|--------------|
| `email` | `e-mail` |
| `guest_type` | `guest type`, `type` |
| `phone` | `telephone`, `tel` |
| `company` | `organization`, `cég` |
| `position` | `beosztás`, `title` |

---

## Magic Link Technikai Részletek

### Hash generálás

```
SHA-256(email + APP_SECRET + timestamp)
```

- **Algoritmus:** SHA-256
- **Eredmény:** 64 karakteres hexadecimális string
- **Lejárat:** 24 óra a generálástól

### URL struktúra

```
/register?code={64_char_hash}&email={urlencoded_email}
```

### Biztonsági jellemzők

- Időzítés-biztos összehasonlítás (`crypto.timingSafeEqual`)
- Egyszeri használat (sikeres regisztráció után törlődik)
- Rate limiting (5 email/típus/óra)

---

## Kapcsolódó Dokumentáció

- [VIP Regisztráció](./MANUAL-VIP-REGISTRATION.md) - Magic link megnyitása után
- [Admin Email](./MANUAL-ADMIN-EMAIL.md) - Email sablonok kezelése
- [E2E Teszt Státusz](./E2E-TEST-STATUS.md) - Automatizált tesztek

---

*Utolsó frissítés: 2025-12-17*
*Készítette: Paige (Tech Writer) + Murat (TEA)*
