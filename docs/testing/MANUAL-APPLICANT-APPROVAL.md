# Manuális Tesztelési Útmutató: Jelentkező Jóváhagyás

> **Cél:** Nyilvános jelentkezés → Admin jóváhagyás → Magic link generálás
>
> **Időtartam:** ~10 perc
>
> **Előfeltételek:** Admin hozzáférés, böngésző

---

## Teszt Adatok

| Mező | Érték |
|------|-------|
| **Jelentkező neve** | Jelentkező Teszt Vendég |
| **Email** | `applicant-test-YYYYMMDD@ceogala.hu` |
| **Cégnév** | Teszt Vállalkozás Kft. |
| **Pozíció** | Marketing Igazgató |
| **Telefonszám** | +36 30 123 4567 |

---

## 1. FÁZIS: Nyilvános Jelentkezés

### 1.1 Jelentkezési Oldal Megnyitása
1. Nyisd meg: **https://ceogala.mflevents.space/apply**
2. Megjelenik a CEO Gala 2026 jelentkezési űrlap

### 1.2 Személyes Adatok Kitöltése
| Mező | Érték |
|------|-------|
| Név | Jelentkező Teszt Vendég |
| Email | applicant-test-YYYYMMDD@ceogala.hu |
| Telefonszám | +36 30 123 4567 |

### 1.3 Céges Adatok Kitöltése
| Mező | Érték |
|------|-------|
| Cégnév | Teszt Vállalkozás Kft. |
| Pozíció | Marketing Igazgató |

### 1.4 GDPR Elfogadása
1. Pipáld be az adatkezelési hozzájárulást
2. Kattints: **Jelentkezés** / **Apply**

### 1.5 Sikeres Beküldés
- Megjelenik: "Köszönjük a jelentkezést" vagy hasonló üzenet
- A jelentkező `pending_approval` státusszal kerül be

---

## 2. FÁZIS: Admin Jóváhagyás

### 2.1 Admin Bejelentkezés
1. Nyisd meg: **https://ceogala.mflevents.space/admin**
2. Bejelentkezési adatok:
   - Email: `admin@ceogala.test`
   - Jelszó: `Admin123!`

### 2.2 Jelentkezők Oldal
1. Navigálj: **Jelentkezők** / **Applicants** menüpontra
2. URL: `/admin/applicants`
3. Megjelenik a függőben lévő jelentkezők listája

### 2.3 Jelentkező Megkeresése
1. Használd a keresőt: `applicant-test-YYYYMMDD`
2. Vagy görgess a listában

### 2.4 Jelentkező Adatainak Ellenőrzése
A táblázatban látható:
- Név
- Email
- Cégnév
- Pozíció
- Jelentkezés dátuma

### 2.5 Jóváhagyás
1. Kattints a **Jóváhagyás** / **Approve** gombra
2. Erősítsd meg a műveletet (ha van megerősítő dialog)

**Alternatív módszer (SQL):**
```sql
-- Jelentkező jóváhagyása és magic link generálása
UPDATE Guest
SET
  registration_status = 'invited',
  guest_type = 'paying_single',
  magic_link_hash = SHA2(CONCAT(email, 'your-app-secret', UNIX_TIMESTAMP()), 256),
  magic_link_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
WHERE email = 'applicant-test-YYYYMMDD@ceogala.hu';
```

### 2.6 Eredmény Ellenőrzése
- A jelentkező eltűnik a "Függőben" listából
- Magic link generálódik
- Email küldés történik (ha be van állítva)

---

## 3. FÁZIS: Ellenőrzés

### 3.1 Vendégek Oldalon
1. Navigálj: **Vendégek** / **Guests** (`/admin/guests`)
2. Keresd meg a jóváhagyott jelentkezőt
3. Ellenőrizd:
   - Státusz: `invited`
   - Típus: `paying_single`

### 3.2 Adatbázis Ellenőrzés

```sql
SELECT
    id,
    name,
    email,
    guest_type,
    registration_status,
    company,
    position,
    magic_link_hash IS NOT NULL AS has_magic_link,
    magic_link_expires_at
FROM Guest
WHERE email LIKE 'applicant-test%'
ORDER BY id DESC
LIMIT 1;
```

### 3.3 Várt Eredmény

| Mező | Jóváhagyás előtt | Jóváhagyás után |
|------|------------------|-----------------|
| guest_type | applicant | paying_single |
| registration_status | pending_approval | invited |
| has_magic_link | 0 | 1 |

---

## 4. FÁZIS: Elutasítás Tesztelése (Opcionális)

### 4.1 Új Jelentkező Létrehozása
Ismételd meg az 1. FÁZIS lépéseit új email címmel.

### 4.2 Elutasítás
1. Navigálj: `/admin/applicants`
2. Kattints: **Elutasítás** / **Reject** gombra
3. Add meg az elutasítás okát (ha kéri)

**SQL alternatíva:**
```sql
UPDATE Guest
SET
  registration_status = 'rejected',
  rejection_reason = 'Teszt elutasítás'
WHERE email = 'applicant-test-reject@ceogala.hu';
```

### 4.3 Elutasítás Eredménye
- Státusz: `rejected`
- Magic link NEM generálódik
- Elutasító email küldés (ha be van állítva)

---

## 5. FÁZIS: Takarítás

```sql
-- Teszt jelentkezők törlése
DELETE FROM Guest WHERE email LIKE 'applicant-test%';
```

---

## Hibaelhárítás

### Probléma: Jelentkező nem jelenik meg a listában
- **Ok:** Hibás guest_type vagy registration_status
- **Megoldás:**
```sql
SELECT * FROM Guest WHERE email LIKE 'applicant%';
-- Ellenőrizd a guest_type = 'applicant' és registration_status = 'pending_approval'
```

### Probléma: Jóváhagyás gomb nem működik (403 hiba)
- **Ok:** CSRF védelem vagy session lejárt
- **Megoldás:** Frissítsd az oldalt és próbáld újra, vagy használd az SQL alternatívát

### Probléma: Magic link nem generálódik
- **Ok:** APP_SECRET nincs beállítva
- **Megoldás:** Használd az SQL parancsot manuális generáláshoz

---

## Automatizált Teszt

```bash
cd /var/www/ceog
BASE_URL=http://localhost:3000 npx playwright test --project=video-journey 02-applicant-approval.journey.spec.ts
```

**Videó:** `public/test-videos/02-applicant-approval-journey.webm`

---

## Kapcsolódó Dokumentumok

- [E2E Teszt Státusz](./E2E-TEST-STATUS.md)
- [VIP Regisztráció Teszt](./MANUAL-VIP-REGISTRATION.md)
- [Journey Teszt Fájl](../../tests/e2e/specs/02-applicant-approval.journey.spec.ts)

---

*Utolsó frissítés: 2025-12-17*
*Készítette: Paige (Tech Writer) + Murat (TEA)*
