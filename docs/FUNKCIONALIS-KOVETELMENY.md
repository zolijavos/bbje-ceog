# CEO Gála Regisztrációs Rendszer - Funkcionális Követelmények

**Verzió:** 1.0
**Dátum:** 2025-11-27
**Projekt:** VIP Gála Esemény Regisztrációs és Asztalfoglalási Rendszer

---

## 1. Alapinformációk

### 1.1 Projekt Célja
VIP gála esemény teljes körű regisztrációs és check-in rendszere invitation-only alapon, asztalfoglalási és ülésrend menedzsment funkcióval.

### 1.2 Fő Felhasználók
- **Vendégek** - VIP és fizető vendégek
- **Adminisztrátorok** - Eseményszervezők, marketing csapat
- **Check-in Személyzet** - Bejáratnál QR kód szkennelést végzők

### 1.3 Rendszer Típusa
Web-alapú SaaS platform invitation-only esemény menedzsmentre.

---

## 2. Funkcionális Követelmények

### 2.1 Címlista & Meghívó Kezelés

#### FR-2.1.1 CSV Vendéglista Importálás
**Leírás:** Admin felhasználók CSV fájlból tölthetnek fel vendéglistát.

**Kötelező mezők:**
- Email cím (egyedi azonosító)
- Teljes név
- Vendég kategória (VIP, PAID_SINGLE, PAID_PAIRED, SPONSOR)

**Opcionális mezők:**
- Telefonszám
- Cég/szervezet
- Megjegyzés

**Validáció:**
- Email formátum ellenőrzés
- Duplikált email kezelése (hibaüzenet vagy felülírás)
- Maximum 10,000 sor/feltöltés

**Kimenet:**
- Sikeres importálás visszajelzés (X vendég importálva)
- Hibalista megjelenítése (sor, hiba típusa)

---

#### FR-2.1.2 Email Meghívó Küldése
**Leírás:** Automatikus vagy manuális meghívó email küldés egyedi magic linkkel.

**Magic Link tulajdonságai:**
- SHA-256 hash alapú (email + APP_SECRET + timestamp)
- 5 perces lejárati idő első kattintás után
- Egyszer használatos (első sikeres belépés után érvénytelen)
- Rate limiting: max 5 újraküldés/óra/email

**Email sablon tartalma:**
- Személyes megszólítás (Kedves [Név]!)
- Esemény dátum, helyszín
- Egyedi regisztrációs link (magic link)
- Kapcsolat információk

**Küldési opciók:**
- Azonnali küldés (kiválasztott vendégek)
- Tömeges küldés (teljes címlista)
- Ütemezett küldés (jövőbeli időpont)

---

### 2.2 Regisztráció Flow

#### FR-2.2.1 Magic Link Validáció
**Leírás:** Vendég a meghívó emailben kapott linkre kattintva automatikusan bejelentkezik.

**Validációs lépések:**
1. URL query string parse (`code` és `email` paraméterek)
2. Hash újraszámítás és összevetés
3. Lejárati idő ellenőrzés
4. Rate limiting ellenőrzés (max 5 próbálkozás/óra)

**Hibakezelés:**
- Érvénytelen/lejárt link → hibaoldal + "Új link kérése" gomb
- Túl sok próbálkozás → 1 órás blokkolás

---

#### FR-2.2.2 VIP Vendég Regisztráció (Ingyenes Flow)
**Leírás:** VIP kategóriájú vendégek egyszerűsített regisztrációja.

**Lépések:**
1. Magic link validáció → automatikus belépés
2. Üdvözlő oldal megjelenítése (név, kategória)
3. Részvétel megerősítése (Igen/Nem gombok)
4. Sikeres megerősítés → **QR jegy azonnali generálása és email küldés**

**Kötelező adatok:** Nincs (már megvannak a címlistából)

**Eredmény:**
- Vendég státusz: `invited` → `registered` → `ticket_issued`
- QR kódos e-jegy PDF melléklettel

---

#### FR-2.2.3 Fizető Vendég Regisztráció (Paid Flow)
**Leírás:** PAID_SINGLE és PAID_PAIRED kategóriájú vendégek fizetős regisztrációja.

**Lépések:**
1. Magic link validáció → automatikus belépés
2. Jegytípus kiválasztása (ha PAID_PAIRED)
   - Egyéni jegy
   - Páros jegy (+1 partner adatai)
3. Számlázási adatok megadása:
   - Teljes név (számlázási)
   - Cégnév (opcionális)
   - Adószám (opcionális)
   - Számlázási cím (ország, város, utca, irányítószám)
4. Partner adatok (csak páros jegy esetén):
   - Partner neve
   - Partner email címe
5. Fizetési mód kiválasztása:
   - **Online bankkártya** (Stripe) → azonnali
   - **Banki átutalás** → manuális admin jóváhagyás
6. Stripe checkout → fizetés
7. Sikeres fizetés → **QR jegy generálás és email küldés**

**Validáció:**
- Email formátum (partner email)
- Kötelező mezők kitöltése
- Stripe minimum összeg (500 HUF)

**Eredmény:**
- Vendég státusz: `invited` → `registered` → `awaiting_payment` → `paid` → `ticket_issued`

---

### 2.3 Online Fizetés

#### FR-2.3.1 Stripe Checkout Integráció
**Leírás:** Bankkártyás fizetés Stripe Checkout oldalon keresztül.

**Támogatott fizetési módok:**
- Visa, Mastercard, American Express
- Apple Pay, Google Pay (opcionális)

**Folyamat:**
1. Regisztrációs form kitöltése → `POST /api/stripe/create-checkout`
2. Stripe Checkout Session létrehozása (server-side)
3. Átirányítás Stripe hosted checkout oldalra
4. Sikeres fizetés → redirect `success_url`
5. Webhook fogadása (`checkout.session.completed`)
6. Vendég státusz frissítése: `paid`
7. QR jegy generálása és email küldés

**Webhook validáció:**
- Stripe signature ellenőrzés (webhook secret)
- Idempotency key használata (duplikált webhook kezelés)

**Hibakezelés:**
- Sikertelen fizetés → redirect `cancel_url` + hibaüzenet
- Timeout (30 perc) → session lejár, újraindítható

---

#### FR-2.3.2 Manuális Fizetés Jóváhagyás
**Leírás:** Banki átutalással fizető vendégek adminisztrátori jóváhagyása.

**Folyamat:**
1. Vendég regisztráció → "Banki átutalás" opció
2. Státusz: `awaiting_payment`
3. Email küldése átutalási adatokkal:
   - Bankszámlaszám
   - Összeg (HUF)
   - Közlemény (regisztráció ID)
4. Admin dashboard → manuális jóváhagyás gomb
5. Státusz frissítése: `paid`
6. QR jegy generálása és email küldés

**Admin funkciók:**
- Szűrés: `awaiting_payment` státuszú vendégek
- Tömeges jóváhagyás (checkbox + bulk action)
- Megjegyzés hozzáadása (pl. átutalás azonosítója)

---

### 2.4 Jegykiadás & QR Rendszer

#### FR-2.4.1 QR Kód Generálás
**Leírás:** Egyedi, biztonságos QR kód generálása minden regisztrált vendég számára.

**QR kód tartalma:**
- JWT token (HMAC-SHA256 aláírással)
- Payload adatok:
  ```json
  {
    "registration_id": 123,
    "guest_id": 456,
    "ticket_type": "VIP",
    "iat": 1732723200,
    "exp": 1732896000
  }
  ```

**Biztonsági követelmények:**
- APP_QR_SECRET: minimum 64 karakter (környezeti változó)
- Token lejárat: 48 óra (esemény napja előtti nap éjféltől)
- Aláírás ellenőrzés check-in során

**Formátum:**
- PNG kép (300x300 px)
- Base64 encoded data URL (email beágyazáshoz)

---

#### FR-2.4.2 E-jegy Email Küldése
**Leírás:** PDF jegy küldése emailben a sikeres regisztráció/fizetés után.

**Email sablon:**
- Tárgy: "CEO Gála 2025 - Jegyinformációk"
- Személyes üdvözlés
- Esemény részletek (dátum, helyszín, időpont)
- QR kód beágyazva (inline image)
- PDF melléklet (jegy)
- Utazási/parkolási információk

**PDF jegy tartalma:**
- Vendég neve, kategória
- QR kód
- Asztalszám (ha már hozzárendelve)
- Esemény logó, dísz

**Küldési időzítés:**
- VIP: azonnal regisztráció megerősítése után
- Fizető: azonnal sikeres fizetés után

---

### 2.5 Check-in Rendszer

#### FR-2.5.1 Mobil QR Szkennelő Alkalmazás
**Leírás:** Web-alapú mobil applikáció check-in személyzet számára.

**Funkciók:**
1. **QR kód szkennelés:**
   - Kamera hozzáférés kérése (getUserMedia API)
   - Html5-qrcode library használata
   - Real-time dekódolás

2. **Színes visszajelzés kártyák:**
   - **ZÖLD kártya** (érvényes jegy):
     - Vendég neve, kategória
     - "Check In" gomb (belépés engedélyezése)
   - **SÁRGA kártya** (duplikált check-in):
     - "Már bejelentkezett!" figyelmeztetés
     - Eredeti check-in időpontja, admin neve
     - "Admin Override" gomb (csak admin jogosultsággal)
   - **PIROS kártya** (érvénytelen jegy):
     - "Érvénytelen vagy lejárt QR kód" hibaüzenet
     - "Scan Again" gomb

3. **Check-in rögzítés:**
   - POST request `/api/checkin/submit`
   - Adatok: `registration_id`, `guest_id`, `staff_user_id`
   - Belépési időpont (UTC timestamp)

**API Endpointok:**
- `POST /api/checkin/validate` - QR kód JWT validálás
- `POST /api/checkin/submit` - Check-in rögzítés

---

#### FR-2.5.2 Check-in Napló & Duplikáció Kezelés
**Leírás:** Vendég check-in események naplózása és duplikált belépés kezelése.

**Adatbázis tábla:** `checkins`
```sql
CREATE TABLE checkins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL UNIQUE,  -- Duplikáció védelem
    guest_id INT NOT NULL,
    staff_user_id INT NOT NULL,
    checked_in_at DATETIME NOT NULL,
    is_override BOOLEAN DEFAULT FALSE,    -- Admin override flag
    device_info VARCHAR(500) NULL,        -- Browser/device info
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
);
```

**Duplikáció detektálás:**
- UNIQUE constraint `registration_id` oszlopon
- Service layer query: `SELECT * FROM checkins WHERE registration_id = ?`
- Ha létezik → sárga kártya megjelenítése

**Admin override:**
- Admin jogosultságú user bejelölheti "Override" checkbox-ot
- Előző check-in rekord soft delete (vagy `is_override = TRUE` flag)
- Új check-in rekord létrehozása

---

### 2.6 Asztalfoglalás & Ülésrend Menedzsment

#### FR-2.6.1 Asztal CRUD Műveletek
**Leírás:** Adminisztrátorok asztalokat hozhatnak létre, szerkeszthetnek és törölhetnek.

**Asztal adatmező:**
- **Név/Szám:** (pl. "Asztal 1", "VIP-01")
- **Kapacitás:** 4-12 fő (dropdown)
- **Típus:** VIP, Standard, Szponzor (színkódolás miatt)
- **Pozíció:** X, Y koordináták (drag-and-drop térképen)
- **Státusz:** Aktív, Inaktív (elrejtve a térképről)

**CRUD Műveletek:**
- **Create:** Admin dashboard → "Új asztal" gomb → form
- **Read:** Asztallista megjelenítése táblázatban + vizuális térképen
- **Update:** Inline szerkesztés vagy modal form
- **Delete:** Soft delete (státusz: Inaktív) vagy hard delete (cascade vendég-hozzárendelések törlése)

**Validáció:**
- Név egyedi (ütköző asztalszám esetén hibaüzenet)
- Kapacitás >= foglalt vendégek száma

---

#### FR-2.6.2 Vendég-Asztal Hozzárendelés
**Leírás:** Regisztrált vendégek manuális vagy automatikus hozzárendelése asztalokhoz.

**Manuális hozzárendelés:**
1. Admin dashboard → Vendéglista
2. Vendég kiválasztása → "Asztal hozzárendelése" dropdown
3. Elérhető asztalok listája (szabad helyek száma megjelenítve)
4. Mentés → `table_assignments` tábla beszúrás

**Tömeges hozzárendelés:**
- CSV import: `guest_email,table_name`
- Validáció: vendég létezik, asztal létezik, kapacitás ellenőrzés

**Páros jegyek kezelése:**
- Partner automatikus hozzárendelése ugyanahhoz az asztalhoz
- 2 szék lefoglalása egy páros jegy esetén

**Adatbázis tábla:** `table_assignments`
```sql
CREATE TABLE table_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_id INT NOT NULL,
    guest_id INT NOT NULL,
    seat_number INT NULL,  -- Opcionális (asztalon belüli hely)
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);
```

---

#### FR-2.6.3 Vizuális Ülésrend Térkép (Drag-and-Drop)
**Leírás:** 2D interaktív térképes nézet asztalok elrendezésének szerkesztéséhez.

**Technológia:** Fabric.js vagy Konva.js (Canvas alapú)

**Funkciók:**

1. **Asztal objektumok megjelenítése:**
   - Kör vagy téglalap alakú ikonok
   - Színkódolás típus szerint:
     - VIP: arany (#FFD700)
     - Standard: kék (#3B82F6)
     - Szponzor: ezüst (#C0C0C0)
     - Üres: szürke (#9CA3AF)
   - Label: asztal neve, foglalt helyek / kapacitás

2. **Drag-and-Drop:**
   - Asztalt fogd-és-vidd mozgatás
   - Koordináták mentése drag vége után: `UPDATE tables SET pos_x = ?, pos_y = ?`
   - Ütközés detektálás (opcionális): figyelmeztetés átfedő asztalokra

3. **Tooltip hover esemény:**
   - Asztal neve
   - Kapacitás
   - Vendégek listája (nevek megjelenítése)
   - Típus

4. **Zoom & Pan:**
   - Görgő zoom (nagyobb termek esetén)
   - Drag-to-pan (térkép mozgatása)

5. **Export/Import layout:**
   - JSON formátumban pozíciók mentése
   - Layout újratöltése korábbi eseményekhez

**Canvas render példa:**
```javascript
// Fabric.js
const canvas = new fabric.Canvas('seating-map');
const table = new fabric.Circle({
  left: 100,
  top: 100,
  radius: 30,
  fill: '#FFD700',
  label: 'VIP-01'
});
canvas.add(table);

// Drag event
canvas.on('object:modified', (e) => {
  const obj = e.target;
  saveTablePosition(obj.tableId, obj.left, obj.top);
});
```

---

#### FR-2.6.4 CSV Ülésrend Export/Import
**Leírás:** Ülésrend tömeges szerkesztése Excel/Google Sheets-ben.

**Export formátum:** (CSV UTF-8)
```csv
table_name,guest_name,guest_email,seat_number
VIP-01,John Doe,john@example.com,1
VIP-01,Jane Smith,jane@example.com,2
Standard-05,Bob Johnson,bob@example.com,
```

**Import validáció:**
- Asztal létezik ellenőrzés
- Vendég email létezik ellenőrzés
- Kapacitás túllépés ellenőrzés
- Duplikált hozzárendelés (egy vendég csak 1 asztalnál)

**Hibakezelés:**
- Hibalista megjelenítése (sor, hiba típusa)
- Részleges import engedélyezése (valid sorok importálása)

---

### 2.7 Admin Dashboard & Riportok

#### FR-2.7.1 Vendéglista Megtekintése & Szűrés
**Leírás:** Regisztrált vendégek listája táblázatos nézetben.

**Megjelenített oszlopok:**
- Név
- Email
- Kategória (VIP, PAID_SINGLE, stb.)
- Regisztrációs státusz (invited, registered, paid, ticket_issued, checked_in)
- Asztalszám (ha hozzárendelve)
- Fizetési státusz (pending, completed, failed)

**Szűrők:**
- Kategória szerint (multi-select)
- Státusz szerint (dropdown)
- Asztal szerint (dropdown)
- Kereső mező (név, email)

**Sorba rendezés:**
- Név ABC sorrendben
- Regisztráció időpontja (legújabb/legrégebbi)

**Bulk műveletek:**
- Checkbox multi-select
- "Email küldése" (egyedi sablon kiválasztása)
- "Exportálás CSV-be"
- "Fizetés jóváhagyása" (csak awaiting_payment státuszúakra)

---

#### FR-2.7.2 Check-in Napló Megtekintése
**Leírás:** Real-time check-in események naplója.

**Megjelenített oszlopok:**
- Vendég neve
- Check-in időpontja (YYYY-MM-DD HH:MM:SS)
- Check-in admin neve (ki szkennelte be)
- Override flag (igen/nem ikon)

**Szűrők:**
- Időintervallum (dátum picker)
- Admin felhasználó szerint
- Override események (csak admin override-ok)

**Export:**
- CSV export (teljes napló)
- Excel export (formázott)

---

#### FR-2.7.3 CSV Export Funkciók
**Leírás:** Adatok exportálása adminisztrátorok számára.

**Exportálható adatok:**

1. **Vendéglista export:**
   - Minden vendég adatok (név, email, kategória, státusz, asztal)
   - Formátum: CSV UTF-8

2. **Check-in napló export:**
   - Check-in események (vendég, időpont, admin)
   - Formátum: CSV UTF-8

3. **Ülésrend export:**
   - Asztal-vendég hozzárendelések
   - Formátum: CSV UTF-8 (lásd FR-2.6.4)

**Generálás:**
- "Export CSV" gomb → server-side fájl generálás
- `Content-Disposition: attachment; filename="vendegek_2025-11-27.csv"`

---

## 3. Technológiai Stack

### 3.1 Backend

| Komponens | Technológia | Verzió |
|-----------|-------------|--------|
| Programozási nyelv | **PHP** | 8.3+ |
| Web framework | **Slim Framework** | 4.x |
| Adatbázis | **MySQL** (production) | 8.0+ |
| Tesztadatbázis | **SQLite** (`:memory:`) | 3.x |
| Adatbázis kapcsolat | **PDO** | Built-in |
| Email küldés | **PHPMailer** | 7.x |
| Dependency Injection | **PHP-DI** | 7.x |
| Logging | **Monolog** | 3.x |

### 3.2 Fizetés & Külső Szolgáltatások

| Komponens | Technológia |
|-----------|-------------|
| Online fizetés | **Stripe PHP SDK** |
| Email küldés (SMTP) | **Brevo** (vagy bármilyen SMTP) |

### 3.3 QR & Biztonság

| Komponens | Technológia |
|-----------|-------------|
| QR kód generálás | **chillerlan/php-qrcode** |
| JWT token | **firebase/php-jwt** |
| Jelszó hash | **bcrypt** (PHP `password_hash()`) |
| Magic link hash | **SHA-256** |

### 3.4 Frontend

| Komponens | Technológia |
|-----------|-------------|
| JavaScript | **Vanilla JS** (ES6+) |
| CSS Framework | **Tailwind CSS** |
| QR szkennelés | **Html5-qrcode** |
| Canvas rajzolás | **Fabric.js** vagy **Konva.js** |

### 3.5 Hosting & Infrastruktúra

| Komponens | Követelmény |
|-----------|-------------|
| Web szerver | **Apache 2.4+** vagy **Nginx** |
| OS | **Linux** (Ubuntu 22.04 LTS ajánlott) |
| PHP modul | **mod_php** vagy **PHP-FPM** |
| SSL/TLS | **HTTPS kötelező** (Let's Encrypt) |
| Memória | Min. 2GB RAM |
| Tárhely | Min. 20GB SSD |

---

## 4. Adatbázis Struktúra

### 4.1 Főbb Táblák (MySQL)

#### `guests` - Vendéglista
```sql
CREATE TABLE guests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    segment VARCHAR(50) NOT NULL,  -- VIP, PAID_SINGLE, PAID_PAIRED, SPONSOR
    status VARCHAR(50) DEFAULT 'invited',  -- invited, registered, paid, ticket_issued, checked_in
    magic_link_hash VARCHAR(64),
    magic_link_expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `registrations` - Regisztrációk
```sql
CREATE TABLE registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    guest_id INT NOT NULL,
    ticket_type VARCHAR(50),  -- VIP, PAID_SINGLE, PAID_PAIRED
    billing_name VARCHAR(255),
    billing_address TEXT,
    qr_code_hash VARCHAR(255),  -- JWT token hash
    partner_name VARCHAR(255) NULL,  -- Páros jegy esetén
    partner_email VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);
```

#### `payments` - Fizetések (Stripe)
```sql
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL,
    stripe_session_id VARCHAR(255),
    amount INT NOT NULL,  -- Forint (500 = 500 HUF)
    currency VARCHAR(3) DEFAULT 'HUF',
    status VARCHAR(50),  -- pending, completed, failed
    paid_at DATETIME NULL,
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
);
```

#### `checkins` - Check-in Napló
```sql
CREATE TABLE checkins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL UNIQUE,
    guest_id INT NOT NULL,
    staff_user_id INT NOT NULL,
    checked_in_at DATETIME NOT NULL,
    is_override BOOLEAN DEFAULT FALSE,
    device_info VARCHAR(500) NULL,
    FOREIGN KEY (registration_id) REFERENCES registrations(id),
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);
```

#### `tables` - Asztalok
```sql
CREATE TABLE tables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    capacity INT NOT NULL,  -- 4-12 fő
    type VARCHAR(50),  -- VIP, Standard, Sponsor
    pos_x INT DEFAULT 0,  -- Canvas X koordináta
    pos_y INT DEFAULT 0,  -- Canvas Y koordináta
    status VARCHAR(50) DEFAULT 'active'  -- active, inactive
);
```

#### `table_assignments` - Asztal-Vendég Hozzárendelések
```sql
CREATE TABLE table_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_id INT NOT NULL,
    guest_id INT NOT NULL,
    seat_number INT NULL,
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    UNIQUE KEY (guest_id)  -- Egy vendég csak 1 asztalnál
);
```

#### `users` - Admin Felhasználók
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,  -- bcrypt
    role VARCHAR(50) DEFAULT 'staff',  -- admin, staff
    name VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `email_logs` - Email Napló
```sql
CREATE TABLE email_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    guest_id INT NULL,
    email_type VARCHAR(100),  -- invitation, ticket, reminder
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),  -- sent, failed
    error_message TEXT NULL,
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);
```

---

## 5. Biztonsági Követelmények

### 5.1 Autentikáció & Authorizáció

#### Magic Link Biztonság
- **Hash algoritmus:** SHA-256
- **Secret:** `APP_SECRET` környezeti változó (min. 64 karakter)
- **Lejárati idő:** 5 perc első kattintás után
- **Rate limiting:** Max 5 újraküldés / óra / email

#### Admin Login
- **Jelszó hash:** bcrypt (`PASSWORD_BCRYPT`, cost=12)
- **Session:** PHP session cookie (HttpOnly, Secure, SameSite=Strict)
- **2FA:** Opcionális (Google Authenticator integráció)

#### JWT Token (QR jegy)
- **Algoritmus:** HMAC-SHA256 (HS256)
- **Secret:** `APP_QR_SECRET` környezeti változó (min. 64 karakter)
- **Lejárat:** 48 óra (esemény napja előtti nap éjféltől)
- **Aláírás ellenőrzés:** Check-in során kötelező

---

### 5.2 Adatbiztonság

#### SQL Injection Védelem
- **Kötelező:** PDO prepared statements 100%-ban
- **Tiltott:** String konkatenáció query-kben

```php
// ✅ BIZTONSÁGOS
$stmt = $pdo->prepare("SELECT * FROM guests WHERE email = :email");
$stmt->execute(['email' => $email]);

// ❌ VESZÉLYES (TILTOTT!)
$query = "SELECT * FROM guests WHERE email = '$email'";
```

#### XSS Védelem
- **Output escaping:** `htmlspecialchars()` minden felhasználói input megjelenítésekor
- **Content Security Policy (CSP):** Header beállítás

#### CSRF Védelem
- **CSRF token:** Minden form POST kéréshez
- **SameSite cookie:** `SameSite=Strict` (session cookie)

#### HTTPS Kötelező
- **SSL/TLS:** Kötelező production környezetben
- **HSTS Header:** `Strict-Transport-Security: max-age=31536000`

---

### 5.3 Stripe Webhook Biztonság
- **Signature ellenőrzés:** `Stripe\Webhook::constructEvent()` használata
- **Webhook secret:** `STRIPE_WEBHOOK_SECRET` környezeti változó
- **Idempotency:** Duplikált webhook kezelés (session ID alapján)

---

## 6. Nem-Funkcionális Követelmények

### 6.1 Teljesítmény

| Metrika | Cél |
|---------|-----|
| Oldalbetöltés | < 2 másodperc (LCP) |
| Adatbázis query | < 100 ms (átlag) |
| API válaszidő | < 500 ms (95 percentile) |
| Email küldés | Aszinkron (háttér job) |

### 6.2 Skálázhatóság

| Követelmény | Érték |
|-------------|-------|
| Egyidejű felhasználók | 500+ (check-in során) |
| Vendéglista méret | Max 10,000 vendég |
| Email küldési sebesség | 1000 email/óra (SMTP limit) |

### 6.3 Használhatóság

- **Mobil-first design:** Tailwind CSS responsive breakpoints
- **Böngésző támogatás:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Touch targets:** Min. 44x44 px (WCAG 2.1 AA)
- **Színkontraszt:** Min. 4.5:1 (WCAG 2.1 AA)

### 6.4 Rendelkezésre Állás

- **Uptime:** 99.5% (production környezet)
- **Backup:** Napi automatikus MySQL dump
- **Recovery Time Objective (RTO):** < 4 óra

---

## 7. Rendszer Architektúra

### 7.1 Backend Architektúra

**Pattern:** Repository + Service + Controller (háromrétegű)

```
Controllers (HTTP kérés kezelés)
    ↓
Services (üzleti logika)
    ↓
Repositories (adatbázis CRUD)
    ↓
PDO (MySQL kapcsolat)
```

**Példa:**
```php
// Controller
class GuestRegistrationController {
    public function register(Request $request, Response $response) {
        $result = $this->registrationService->createRegistration($data);
        return $response->withJson($result);
    }
}

// Service
class RegistrationService {
    public function createRegistration(array $data) {
        // Validáció
        // Üzleti logika
        $registrationId = $this->registrationRepository->create($data);
        return $registrationId;
    }
}

// Repository
class RegistrationRepository extends BaseRepository {
    public function create(array $data) {
        $stmt = $this->pdo->prepare("INSERT INTO registrations ...");
        $stmt->execute($data);
        return $this->pdo->lastInsertId();
    }
}
```

---

### 7.2 Könyvtárstruktúra

```
/
├── public/                 # Web root
│   ├── index.php          # Front controller (Slim bootstrap)
│   ├── admin/             # Admin dashboard
│   ├── checkin/           # Check-in mobil app
│   └── assets/            # CSS, JS, képek
├── src/                   # PHP alkalmazás (PSR-4: App\)
│   ├── Controllers/       # HTTP kérés kezelők
│   ├── Services/          # Üzleti logika
│   ├── Repositories/      # Adatbázis CRUD
│   ├── Models/            # Domain modellek
│   ├── Middleware/        # PSR-15 middleware-ek
│   ├── Exceptions/        # Custom kivételek
│   └── Helpers/           # Utility funkciók
├── config/                # Konfiguráció
│   ├── routes.php         # Slim route-ok
│   └── container.php      # DI container
├── database/              # Adatbázis
│   ├── schema.sql         # MySQL séma
│   └── migrations/        # Migráció fájlok
├── templates/             # Email sablonok
├── tests/                 # PHPUnit tesztek
│   ├── Unit/
│   ├── Integration/
│   └── e2e/               # Playwright E2E
├── logs/                  # Logfájlok (gitignored)
├── vendor/                # Composer dependencies
├── .env                   # Környezeti változók (gitignored)
└── composer.json          # PHP dependencies
```

---

## 8. API Endpointok Összefoglalása

### 8.1 Vendég Regisztráció

| Endpoint | Metódus | Leírás |
|----------|---------|--------|
| `/register` | GET | Magic link validáció + regisztrációs form megjelenítése |
| `/api/registration/submit` | POST | Regisztrációs adatok mentése |
| `/api/registration/partner` | POST | Páros jegy partner adatok mentése |

### 8.2 Fizetés

| Endpoint | Metódus | Leírás |
|----------|---------|--------|
| `/api/stripe/create-checkout` | POST | Stripe Checkout Session létrehozása |
| `/api/stripe/webhook` | POST | Stripe webhook fogadása |
| `/payment/success` | GET | Sikeres fizetés redirect oldal |
| `/payment/cancel` | GET | Megszakított fizetés redirect oldal |

### 8.3 Check-in

| Endpoint | Metódus | Leírás |
|----------|---------|--------|
| `/api/checkin/validate` | POST | QR kód JWT validálása |
| `/api/checkin/submit` | POST | Check-in rögzítése |

### 8.4 Admin API

| Endpoint | Metódus | Leírás |
|----------|---------|--------|
| `/api/admin/guests` | GET | Vendéglista lekérdezés (szűrés, paginálás) |
| `/api/admin/guests/import` | POST | CSV vendéglista importálás |
| `/api/admin/guests/{id}/approve-payment` | PATCH | Manuális fizetés jóváhagyás |
| `/api/admin/tables` | GET/POST | Asztal lista / Új asztal létrehozás |
| `/api/admin/tables/{id}` | PATCH/DELETE | Asztal szerkesztés / törlés |
| `/api/admin/table-assignments` | POST | Vendég-asztal hozzárendelés |
| `/api/admin/seating-export` | GET | Ülésrend CSV export |
| `/api/admin/checkin-log` | GET | Check-in napló lekérdezés |

---

## 9. Fejlesztési Fázisok (Javasolt)

### Fázis 1: Core Regisztráció (MVP)
- [ ] Címlista import (CSV)
- [ ] Magic link email küldés
- [ ] VIP regisztráció flow
- [ ] Fizető regisztráció flow (Stripe nélkül)
- [ ] Admin dashboard (vendéglista megtekintés)

### Fázis 2: Fizetés & Jegy
- [ ] Stripe Checkout integráció
- [ ] QR kód generálás (JWT)
- [ ] E-jegy PDF generálás
- [ ] Email automatizálás

### Fázis 3: Check-in
- [ ] Mobil QR szkennelő app
- [ ] Check-in API (validate + submit)
- [ ] Check-in napló

### Fázis 4: Asztalfoglalás
- [ ] Asztal CRUD
- [ ] Vendég-asztal hozzárendelés
- [ ] Vizuális ülésrend térkép (Fabric.js)
- [ ] CSV export/import

### Fázis 5: Admin Dashboard Kiegészítések
- [ ] Riportok (check-in statisztikák)
- [ ] Email napló megtekintés
- [ ] Bulk műveletek (tömeges email, jóváhagyás)

---

## 10. Kockázatok & Mitigáció

| Kockázat | Valószínűség | Hatás | Mitigáció |
|----------|--------------|-------|-----------|
| Stripe webhook timeout | Közepes | Magas | Idempotency key, webhook retry logic |
| Email spam filter | Magas | Közepes | SPF/DKIM/DMARC konfiguráció, Brevo használata |
| QR kód duplikáció | Alacsony | Magas | JWT aláírás, unique constraint check-in táblán |
| Konkurens check-in | Magas | Közepes | MySQL InnoDB row-level locking, UNIQUE constraint |
| GDPR compliance | Közepes | Magas | Data retention policy, encryption at rest |

---

## 11. Függelék

### 11.1 Környezeti Változók (.env példa)

```bash
# Alkalmazás
APP_ENV=production
APP_SECRET=min_64_char_random_string_for_magic_link_hashing
APP_URL=https://ceogala.hu

# Adatbázis (MySQL)
DB_HOST=localhost
DB_NAME=ceog
DB_USER=ceog_web
DB_PASS=strong_password_64_chars

# Email (Brevo SMTP)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=brevo_api_key
SMTP_FROM=noreply@ceogala.hu

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT QR Kód
APP_QR_SECRET=min_64_char_random_string_for_jwt_signing
QR_EXPIRY_HOURS=48

# Magic Link
MAGIC_LINK_EXPIRY_SECONDS=300
RATE_LIMIT_MAX_ATTEMPTS=5
```

---

### 11.2 Referenciák

- **Slim Framework:** https://www.slimframework.com/
- **Stripe PHP SDK:** https://github.com/stripe/stripe-php
- **PHPMailer:** https://github.com/PHPMailer/PHPMailer
- **Firebase JWT:** https://github.com/firebase/php-jwt
- **Html5-qrcode:** https://github.com/mebjas/html5-qrcode
- **Fabric.js:** http://fabricjs.com/
- **Tailwind CSS:** https://tailwindcss.com/

---

**Dokumentum vége**
