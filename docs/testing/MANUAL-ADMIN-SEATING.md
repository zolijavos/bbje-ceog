# Manuális Tesztelési Útmutató: Admin Ültetés Kezelés

> **Cél:** Asztal létrehozás → Vendég hozzárendelés → Ültetési rend megtekintés
>
> **Időtartam:** ~10 perc
>
> **Előfeltételek:** Admin hozzáférés, legalább 1 regisztrált vendég

---

## Teszt Adatok

| Mező | Érték |
|------|-------|
| **Asztal neve** | TESZT-ASZTAL-01 |
| **Kapacitás** | 8 fő |
| **Típus** | Standard |
| **Teszt vendég** | Ültetés Teszt Vendég |

---

## 1. FÁZIS: Előkészítés

### 1.1 Admin Bejelentkezés
1. Nyisd meg: **https://ceogala.mflevents.space/admin**
2. Bejelentkezési adatok:
   - Email: `admin@ceogala.test`
   - Jelszó: `Admin123!`

### 1.2 Teszt Vendég Létrehozása (ha nincs)

```sql
-- Teszt vendég létrehozása regisztrációval
INSERT INTO Guest (email, name, guest_type, registration_status, created_at, updated_at)
VALUES ('seating-test@ceogala.hu', 'Ültetés Teszt Vendég', 'vip', 'registered', NOW(), NOW());

-- Guest ID lekérdezése
SELECT id FROM Guest WHERE email = 'seating-test@ceogala.hu';

-- Regisztráció létrehozása
INSERT INTO Registration (guest_id, ticket_type, gdpr_consent, gdpr_consent_at, cancellation_accepted, cancellation_accepted_at, created_at, updated_at)
VALUES ({GUEST_ID}, 'vip_free', 1, NOW(), 1, NOW(), NOW(), NOW());
```

---

## 2. FÁZIS: Vendégek Áttekintése

### 2.1 Vendégek Oldal
1. Navigálj: **Vendégek** / **Guests** (`/admin/guests`)
2. Ellenőrizd a vendéglistát

### 2.2 Szűrés és Keresés
1. Használd a keresőt vendég név/email alapján
2. Szűrj típus szerint (VIP, Fizető, stb.)
3. Szűrj státusz szerint (Regisztrált, Meghívott, stb.)

### 2.3 Vendég Részletek
1. Kattints egy vendég sorára
2. Ellenőrizd a részletes adatokat

---

## 3. FÁZIS: Asztal Létrehozása

### 3.1 Asztalok Oldal
1. Navigálj: **Asztalok** / **Tables** (`/admin/tables`)
2. Megjelenik az asztalok listája

### 3.2 Új Asztal Hozzáadása
1. Kattints: **Új asztal** / **Add Table** gombra
2. Töltsd ki a modal űrlapot:

| Mező | Érték |
|------|-------|
| Név | TESZT-ASZTAL-01 |
| Kapacitás | 8 |
| Típus | Standard |

3. Kattints: **Mentés** / **Save**

**SQL alternatíva (ha a UI nem működik):**
```sql
INSERT INTO `Table` (name, capacity, type, status, created_at, updated_at)
VALUES ('TESZT-ASZTAL-01', 8, 'standard', 'available', NOW(), NOW());

-- Table ID lekérdezése
SELECT id, name, capacity, type, status FROM `Table` WHERE name = 'TESZT-ASZTAL-01';
```

### 3.3 Asztal Ellenőrzése
- Az új asztal megjelenik a listában
- Státusz: `available`
- Foglaltság: 0/8

---

## 4. FÁZIS: Vendég Hozzárendelése Asztalhoz

### 4.1 Ültetés Oldal
1. Navigálj: **Ültetés** / **Seating** (`/admin/seating`)
2. Megjelenik az ültetési felület

### 4.2 Drag & Drop Módszer
1. Bal oldali panelen láthatók a be nem ült vendégek
2. Húzd a vendéget az asztal fölé
3. Engedd el - hozzárendelés megtörténik

### 4.3 Alternatív: Közvetlen Hozzárendelés

**SQL parancs:**
```sql
-- Vendég és asztal ID-k lekérdezése
SELECT id FROM Guest WHERE email = 'seating-test@ceogala.hu';
SELECT id FROM `Table` WHERE name = 'TESZT-ASZTAL-01';

-- Hozzárendelés létrehozása
INSERT INTO TableAssignment (table_id, guest_id, seat_number, created_at, updated_at)
VALUES ({TABLE_ID}, {GUEST_ID}, 1, NOW(), NOW());
```

### 4.4 Hozzárendelés Ellenőrzése
- Asztal foglaltság frissül: 1/8
- Vendég neve megjelenik az asztalnál
- Bal oldali panelről eltűnik a vendég

---

## 5. FÁZIS: Ültetési Rend Megtekintése

### 5.1 Ültetési Térkép
1. Az `/admin/seating` oldalon
2. Láthatók az asztalok vizuálisan
3. Minden asztalnál a hozzárendelt vendégek

### 5.2 Asztal Részletek
1. Kattints egy asztalra
2. Megjelenik az ülésrend részletesen
3. Láthatók az ülőhelyek számozása

### 5.3 Export funkciók

**CSV Export (Grid nézet):**
1. Kattints: **Export** gombra
2. CSV fájl letöltődik az ültetési renddel

**PNG/PDF Export (Floor Plan nézet):**
1. Válts **Floor Plan** nézetre
2. Kattints a **letöltés ikonra** (dropdown menü)
3. Válaszd ki a formátumot:
   - **Download as PNG** - Kép prezentációkhoz
   - **Download as PDF** - Nyomtatásra kész dokumentum
4. A fájl automatikusan letöltődik

**Várt eredmény:**
- PNG: `floor-plan-ballroom-YYYY-MM-DD.png`
- PDF: `floor-plan-ballroom-YYYY-MM-DD.pdf` (fejléccel, jelmagyarázattal)

---

## 6. FÁZIS: Adatbázis Ellenőrzés

### 6.1 Asztal Adatok

```sql
SELECT
    t.id,
    t.name,
    t.capacity,
    t.type,
    t.status,
    COUNT(ta.id) AS assigned_guests
FROM `Table` t
LEFT JOIN TableAssignment ta ON t.id = ta.table_id
WHERE t.name = 'TESZT-ASZTAL-01'
GROUP BY t.id;
```

### 6.2 Hozzárendelések

```sql
SELECT
    ta.id AS assignment_id,
    t.name AS table_name,
    g.name AS guest_name,
    g.email,
    ta.seat_number
FROM TableAssignment ta
JOIN `Table` t ON ta.table_id = t.id
JOIN Guest g ON ta.guest_id = g.id
WHERE t.name = 'TESZT-ASZTAL-01';
```

### 6.3 Várt Eredmény

| Mező | Érték |
|------|-------|
| table_name | TESZT-ASZTAL-01 |
| guest_name | Ültetés Teszt Vendég |
| seat_number | 1 |
| assigned_guests | 1 |

---

## 7. FÁZIS: Takarítás

```sql
-- Hozzárendelés törlése
DELETE FROM TableAssignment WHERE table_id IN (
    SELECT id FROM `Table` WHERE name LIKE 'TESZT-ASZTAL%'
);

-- Asztal törlése
DELETE FROM `Table` WHERE name LIKE 'TESZT-ASZTAL%';

-- Teszt vendég törlése (opcionális)
DELETE FROM Registration WHERE guest_id IN (
    SELECT id FROM Guest WHERE email = 'seating-test@ceogala.hu'
);
DELETE FROM Guest WHERE email = 'seating-test@ceogala.hu';
```

---

## Hibaelhárítás

### Probléma: Asztal form nem küldi el az adatokat
- **Ok:** React controlled input probléma
- **Megoldás:** Használd az SQL alternatívát az asztal létrehozásához

### Probléma: Drag & drop nem működik
- **Ok:** JavaScript hiba vagy böngésző kompatibilitás
- **Megoldás:** Használd az SQL hozzárendelést, vagy próbáld Chrome böngészővel

### Probléma: Vendég nem jelenik meg a bal panelen
- **Ok:** Nincs regisztráció vagy már hozzá van rendelve
- **Megoldás:** Ellenőrizd a Registration táblát és a TableAssignment-et

### Probléma: Kapacitás túllépés
- **Ok:** Az asztal megtelt
- **Megoldás:** Növeld a kapacitást vagy használj másik asztalt

---

## Automatizált Teszt

```bash
cd /var/www/ceog
BASE_URL=http://localhost:3000 npx playwright test --project=video-journey 03-admin-seating.journey.spec.ts
```

**Videó:** `public/test-videos/03-admin-seating-journey.webm`

---

## Kapcsolódó Dokumentumok

- [E2E Teszt Státusz](./E2E-TEST-STATUS.md)
- [Journey Teszt Fájl](../../tests/e2e/specs/03-admin-seating.journey.spec.ts)

---

*Utolsó frissítés: 2026-01-10*
*Készítette: Paige (Tech Writer) + Murat (TEA)*
