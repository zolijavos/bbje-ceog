# Manuális Tesztelési Útmutató: VIP Regisztráció + PWA

> **Cél:** VIP vendég létrehozása → Magic link → Regisztráció → PWA bejelentkezés → Jegy megtekintés
>
> **Időtartam:** ~8 perc
>
> **Előfeltételek:** Admin hozzáférés, böngésző

---

## Teszt Adatok

| Mező | Érték |
|------|-------|
| **Teszt vendég neve** | VIP Teszt Vendég |
| **Email** | `vip-test-YYYYMMDD@ceogala.hu` (egyedi dátum) |
| **Vendég típus** | VIP |
| **PWA kód** | `CEOG-XXXXXX` (6 karakter) |

---

## 1. FÁZIS: VIP Vendég Létrehozása (Admin)

### 1.1 Admin Bejelentkezés
1. Nyisd meg: **https://ceogala.mflevents.space/admin**
2. Bejelentkezési adatok:
   - Email: `admin@ceogala.test`
   - Jelszó: `Admin123!`
3. Kattints a **Bejelentkezés** gombra

### 1.2 Új VIP Vendég Hozzáadása
1. Menj a **Vendégek** menüpontra (`/admin/guests`)
2. Kattints az **Új vendég** gombra
3. Töltsd ki:
   - **Név:** VIP Teszt Vendég
   - **Email:** vip-test-YYYYMMDD@ceogala.hu
   - **Típus:** VIP (`vip`)
   - **Státusz:** Meghívott (`invited`)
4. Mentsd el

### 1.3 Magic Link Generálása (SQL)

Ha az admin felület nem generál automatikusan magic linket:

```bash
mysql -u ceog_user -pCeogGala2026Secure! ceog
```

```sql
-- Vendég ID lekérdezése
SELECT id, email, name, guest_type, registration_status
FROM Guest
WHERE email LIKE 'vip-test%'
ORDER BY id DESC LIMIT 1;

-- Magic link hash generálása (jegyezd fel a guest_id-t!)
UPDATE Guest
SET
  magic_link_hash = SHA2(CONCAT(email, 'your-app-secret', UNIX_TIMESTAMP()), 256),
  magic_link_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR),
  pwa_auth_code = CONCAT('CEOG-', UPPER(SUBSTRING(MD5(RAND()), 1, 6)))
WHERE id = {GUEST_ID};

-- PWA kód lekérdezése
SELECT id, email, magic_link_hash, pwa_auth_code FROM Guest WHERE id = {GUEST_ID};
```

---

## 2. FÁZIS: VIP Regisztráció (Vendég szemszögéből)

### 2.1 Magic Link Megnyitása
Nyisd meg böngészőben:
```
https://ceogala.mflevents.space/register?code={MAGIC_LINK_HASH}&email={EMAIL}
```

Példa:
```
https://ceogala.mflevents.space/register?code=abc123...&email=vip-test-20241217@ceogala.hu
```

### 2.2 VIP Regisztrációs Oldal
1. Ellenőrizd: **VIP Guest** badge megjelenik
2. A vendég neve és emailje előre ki van töltve

### 2.3 Beleegyezések Elfogadása
1. Pipáld be: **GDPR adatkezelési hozzájárulás**
2. Pipáld be: **Lemondási feltételek elfogadása**
3. Kattints: **Regisztráció** vagy **Confirm Attendance**

### 2.4 Sikeres Regisztráció
- Átirányítás: `/register/success`
- VIP vendégnél **azonnali jegy generálás** történik (nincs fizetés)
- QR kód generálódik

---

## 3. FÁZIS: PWA Bejelentkezés

### 3.1 PWA Főoldal Megnyitása
1. Nyisd meg: **https://ceogala.mflevents.space/pwa**
2. Megjelenik a CEO Gala 2026 welcome screen

### 3.2 Kód Megadása
1. Kattints: **Enter Code** vagy **Kód megadása**
2. Írd be a PWA kódot: `CEOG-XXXXXX` (amit az SQL-ből kaptál)
3. Kattints: **Belépés** / **Login**

### 3.3 Dashboard Ellenőrzése
- Megjelenik a vendég neve
- Látható az esemény információ
- VIP státusz megjelenik

---

## 4. FÁZIS: PWA Funkciók Tesztelése

### 4.1 Jegy (Ticket) Megtekintése
1. Navigálj: **Jegy** / **Ticket** menüpontra
2. URL: `/pwa/ticket`
3. Ellenőrizd:
   - QR kód megjelenik (canvas vagy SVG)
   - Vendég neve látható
   - Jegy típusa: VIP

### 4.2 Profil Megtekintése
1. Navigálj: **Profil** / **Profile** menüpontra
2. URL: `/pwa/profile`
3. Ellenőrizd:
   - Név helyes
   - Email helyes
   - VIP státusz megjelenik

### 4.3 Asztal Információ (ha van hozzárendelés)
1. Navigálj: **Asztal** / **Table** menüpontra
2. URL: `/pwa/table`
3. Ellenőrizd az asztal számot (ha van)

---

## 5. FÁZIS: Adatbázis Ellenőrzés

### 5.1 Teljes Állapot Lekérdezése

```sql
SELECT
    g.id AS guest_id,
    g.name,
    g.email,
    g.guest_type,
    g.registration_status,
    g.pwa_auth_code,
    r.id AS registration_id,
    r.ticket_type,
    r.qr_code_hash,
    r.gdpr_consent,
    r.cancellation_accepted
FROM Guest g
LEFT JOIN Registration r ON g.id = r.guest_id
WHERE g.email LIKE 'vip-test%'
ORDER BY g.id DESC
LIMIT 1;
```

### 5.2 Várt Eredmény

| Mező | Várt Érték |
|------|-----------|
| guest_type | vip |
| registration_status | registered |
| ticket_type | vip_free |
| qr_code_hash | JWT token (hosszú string) |
| gdpr_consent | 1 |
| cancellation_accepted | 1 |

---

## 6. FÁZIS: Takarítás (Opcionális)

```sql
-- Regisztráció törlése
DELETE FROM Registration WHERE guest_id IN (
    SELECT id FROM Guest WHERE email LIKE 'vip-test%'
);

-- Vendég törlése
DELETE FROM Guest WHERE email LIKE 'vip-test%';
```

---

## Hibaelhárítás

### Probléma: Magic link "Invalid or expired"
- **Ok:** Lejárt a 24 órás érvényesség
- **Megoldás:** Generálj új magic link hash-t az SQL paranccsal

### Probléma: PWA kód nem működik
- **Ok:** Hibás kód vagy nem létezik
- **Megoldás:** Ellenőrizd a `pwa_auth_code` mezőt a Guest táblában

### Probléma: QR kód nem jelenik meg
- **Ok:** Nincs regisztráció vagy qr_code_hash üres
- **Megoldás:** Ellenőrizd a Registration tábla qr_code_hash mezőjét

### Probléma: "VIP Guest" badge nem jelenik meg
- **Ok:** A guest_type nem 'vip'
- **Megoldás:** UPDATE Guest SET guest_type = 'vip' WHERE id = {ID};

---

## Automatizált Teszt

```bash
cd /var/www/ceog
BASE_URL=http://localhost:3000 npx playwright test --project=video-journey 01-vip-registration.journey.spec.ts
```

**Videó:** `public/test-videos/01-vip-registration-journey.webm`

---

## Kapcsolódó Dokumentumok

- [E2E Teszt Státusz](./E2E-TEST-STATUS.md)
- [Fizetési Folyamat Teszt](./MANUAL-PAYMENT-FLOW-TEST.md)
- [Journey Teszt Fájl](../../tests/e2e/specs/01-vip-registration.journey.spec.ts)

---

*Utolsó frissítés: 2025-12-17*
*Készítette: Paige (Tech Writer) + Murat (TEA)*
