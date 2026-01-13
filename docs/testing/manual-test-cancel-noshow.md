# Manuális Tesztelési Útmutató: Lemondás és Meg nem jelenés Funkció

Ez a dokumentum lépésről lépésre bemutatja a Részvételi Kötelezettségvállalás (Lemondás és Meg nem jelenés) funkció manuális tesztelését.

## Előfeltételek

- Hozzáférés a CEO Gala alkalmazáshoz (https://ceogala.hu vagy localhost:3000)
- Admin belépési adatok: `admin@ceogala.test` / `Admin123!`
- Teszt vendég PWA auth kóddal (adminon keresztül létrehozva vagy meglévő)

---

## 1. rész: Vendég Lemondási Folyamat (PWA)

### Teszt 1.1: Lemondás Oldal Elérése a Dashboardról

**Lépések:**
1. Nyisd meg a PWA bejelentkezési oldalt: `/pwa`
2. Kattints a "Kód megadása" gombra
3. Add meg az érvényes vendég PWA kódot (formátum: `CEOG-XXXXXX`)
4. Kattints a "Belépés" gombra
5. A dashboardon görgess le a "Cancel Attendance" linkig (piros szöveg X ikonnal)
6. Kattints a "Cancel Attendance" linkre

**Elvárt Eredmény:**
- Lemondás oldal betöltődik: `/pwa/cancel`
- Figyelmeztető üzenet jelenik meg: "Are you sure you want to cancel?"
- Sárga figyelmeztető doboz magyarázza a meg nem jelenés szabályzatot
- Szövegmező az opcionális lemondási oknak
- Két gomb: "Keep Registration" (szürke) és "Confirm Cancellation" (piros)

---

### Teszt 1.2: Regisztráció Sikeres Lemondása

**Lépések:**
1. Végezd el az 1.1 tesztet a lemondás oldal eléréséhez
2. (Opcionális) Adj meg lemondási okot a szövegmezőben (pl. "Üzleti út ütközés")
3. Figyeld meg a karakterszámlálót (X/500-at kell mutatnia)
4. Kattints a "Confirm Cancellation" gombra

**Elvárt Eredmény:**
- Töltési animáció jelenik meg a gombon
- Sikeres képernyő jelenik meg: "Attendance Cancelled"
- Zöld pipa ikon megjelenik
- Üzenet megerősíti a lemondást
- "Return to Dashboard" gomb megjelenik
- Vendég státusz az adatbázisban 'declined'-ra módosul
- `cancelled_at` időbélyeg rögzítve
- `cancellation_reason` mentve (ha meg lett adva)

---

### Teszt 1.3: Regisztráció Megtartása (Lemondás Visszavonása)

**Lépések:**
1. Navigálj a `/pwa/cancel` oldalra érvényes vendég munkamenettel
2. Kattints a "Keep Registration" gombra

**Elvárt Eredmény:**
- Visszairányít a `/pwa/dashboard` oldalra
- Nem történik változás a regisztrációban
- A vendég továbbra is részt vehet az eseményen

---

### Teszt 1.4: Már Lemondott Állapot

**Lépések:**
1. Használj olyan vendég fiókot, aki már lemondott
2. Navigálj a `/pwa/cancel` oldalra

**Elvárt Eredmény:**
- Az oldal "Already Cancelled" üzenetet mutat
- Megjeleníti a lemondás időpontját
- Mutatja a lemondás okát (ha meg volt adva)
- Csak egy gomb elérhető: "Return to Dashboard"
- Nem lehet újra lemondani

---

### Teszt 1.5: Határidő Lejárt Állapot

**Lépések:**
1. Állítsd a rendszer dátumát az esemény előtti 7 napon belülre (vagy módosítsd az EVENT_CONFIG-ot)
2. Navigálj a `/pwa/cancel` oldalra érvényes vendéggel

**Elvárt Eredmény:**
- Az oldal "Cancellation Deadline Passed" üzenetet mutat
- Elmagyarázza, hogy a lemondás már nem elérhető
- Mutatja az elmulasztott határidő dátumát
- Figyelmeztetés a lehetséges meg nem jelenési díjról
- Csak "Return to Dashboard" gomb elérhető

---

### Teszt 1.6: Esemény Már Lezajlott Állapot

**Lépések:**
1. Állítsd a rendszer dátumát az esemény dátuma utánra
2. Navigálj a `/pwa/cancel` oldalra érvényes vendéggel

**Elvárt Eredmény:**
- Az oldal "Event Has Passed" üzenetet mutat
- Az esemény dátuma után nem lehet lemondani
- Csak "Return to Dashboard" gomb elérhető

---

### Teszt 1.7: Gyakoriság Korlátozás

**Lépések:**
1. Navigálj a `/pwa/cancel` oldalra
2. Kattints 3-szor gyorsan a "Confirm Cancellation" gombra (lemondás és újraregisztrálás szükség esetén)
3. Próbálj meg 4. alkalommal lemondani ugyanazon az órán belül

**Elvárt Eredmény:**
- 3 próbálkozás után: "Too many cancellation attempts. Please try again later."
- HTTP 429 válasz
- 1 órát kell várni az újrapróbálkozásig

---

## 2. rész: Admin Nézet - Lemondott Vendégek

### Teszt 2.1: Lemondott Vendégek Szűrő

**Lépések:**
1. Jelentkezz be az admin dashboardra: `/admin`
2. Navigálj a Vendéglista oldalra: `/admin/guests`
3. Keresd meg a "Státusz" szűrő legördülő menüt
4. Válaszd ki a "Lemondott" opciót

**Elvárt Eredmény:**
- A vendéglista csak a lemondott vendégeket mutatja
- Minden lemondott vendégnél látható:
  - Név és email
  - "Declined" státusz badge
  - Lemondás időbélyege (ha látható a felületen)
- A szűrő kombinálható más szűrőkkel (típus, keresés)

---

### Teszt 2.2: Meg nem Jelent Vendégek Szűrő

**Lépések:**
1. Jelentkezz be az admin dashboardra
2. Navigálj a Vendéglista oldalra: `/admin/guests`
3. Válaszd ki a "Meg nem jelent" opciót a Státusz szűrőből

**Elvárt Eredmény:**
- Azokat a vendégeket mutatja, akik:
  - Regisztráltak (van regisztrációs rekordjuk)
  - NEM mondtak le
  - NEM jelentkeztek be (check-in)
- Ezek potenciális meg nem jelenők (az esemény után válnak tényleges meg nem jelenőkké)
- Hasznos az esemény előtti tervezéshez és az esemény utáni nyomon követéshez

---

### Teszt 2.3: Vendég Részletek - Lemondott Vendég

**Lépések:**
1. Szűrj "Lemondott" státuszra
2. Kattints egy lemondott vendégre a részletek megtekintéséhez

**Elvárt Eredmény:**
- Vendég részletek mutatják a lemondott státuszt
- Lemondás dátuma/időpontja látható
- Lemondás oka megjelenik (ha meg volt adva)
- Nem lehet magic linket küldeni lemondott vendégnek (gomb letiltva vagy nem jelenik meg)

---

## 3. rész: Check-in - Lemondott Regisztráció Blokkolása

### Teszt 3.1: Szkenner Elutasítja a Lemondott QR Kódot

**Lépések:**
1. Hozz létre egy vendéget és végezd el a regisztrációt a QR kód megszerzéséhez
2. Mondd le a regisztrációt a PWA-n keresztül
3. Navigálj a check-in szkennerhez: `/checkin`
4. Jelentkezz be adminként/személyzetként
5. Szkenneld be a lemondott vendég QR kódját (vagy használd közvetlenül az API-t)

**Elvárt Eredmény:**
- PIROS kártya jelenik meg (érvénytelen)
- Hibaüzenet: "Registration Cancelled"
- Nem lehet folytatni a check-int
- "Scan Again" gomb a következő kód kipróbálásához

---

### Teszt 3.2: API Validáció Lemondott Hibát Ad Vissza

**Lépések:**
1. Használj böngésző fejlesztői eszközöket vagy Postmant
2. Hívd meg a `POST /api/checkin/validate` endpointot:
   ```json
   {
     "qrToken": "<lemondott_vendeg_qr_token>"
   }
   ```

**Elvárt Eredmény:**
- Válasz: `{ "valid": false, "error": "CANCELLED", "alreadyCheckedIn": false }`
- Nem lehet check-int beküldeni lemondott regisztrációhoz

---

## 4. rész: Regisztrációs Űrlap - Hozzájárulási Jelölőnégyzetek

### Teszt 4.1: VIP Regisztráció Hozzájárulás

**Lépések:**
1. Érd el a VIP regisztrációs oldalt érvényes magic linkkel
2. Tekintsd át a hozzájárulási jelölőnégyzeteket

**Elvárt Eredmény:**
- GDPR hozzájárulási jelölőnégyzet teljes adatvédelmi szabályzat szöveggel
- Lemondási szabályzat jelölőnégyzet meg nem jelenési díj figyelmeztetéssel VIP vendégeknek
- Mindkét jelölőnégyzet kötelező a folytatáshoz
- A szöveg csak angolul van

---

### Teszt 4.2: Fizető Vendég Regisztráció Hozzájárulás

**Lépések:**
1. Érd el a fizetős regisztrációs oldalt érvényes magic linkkel
2. Tekintsd át a hozzájárulási jelölőnégyzeteket

**Elvárt Eredmény:**
- GDPR hozzájárulási jelölőnégyzet (ugyanaz mint VIP-nél)
- Lemondási szabályzat jelölőnégyzet meg nem jelenési díj figyelmeztetés NÉLKÜL (fizető vendégek már fizettek)
- Mindkét jelölőnégyzet kötelező a folytatáshoz

---

## 5. rész: Szélsőséges Esetek és Hibakezelés

### Teszt 5.1: Hitelesítetlen Lemondás Hozzáférés

**Lépések:**
1. Töröld a böngésző cookie-kat/munkamenetet
2. Navigálj közvetlenül a `/pwa/cancel` oldalra

**Elvárt Eredmény:**
- Átirányít a `/pwa` bejelentkezési oldalra
- Nem lehet elérni a lemondás oldalt hitelesítés nélkül

---

### Teszt 5.2: Érvénytelen Munkamenet

**Lépések:**
1. Jelentkezz be a PWA-ba
2. Manuálisan töröld vagy módosítsd a `pwa_session` cookie-t
3. Próbálj meg lemondani

**Elvárt Eredmény:**
- API 401 Unauthorized választ ad
- Felhasználó átirányítva a bejelentkezésre

---

### Teszt 5.3: Vendég Regisztráció Nélkül

**Lépések:**
1. Jelentkezz be olyan vendéggel, akinek nincs regisztrációs rekordja
2. Navigálj a `/pwa/cancel` oldalra

**Elvárt Eredmény:**
- Megfelelő hibaüzenet jelenik meg
- Nem lehet lemondani nem létező regisztrációt

---

### Teszt 5.4: Egyidejű Lemondási Kísérletek

**Lépések:**
1. Nyiss meg két böngésző fület ugyanazzal a vendég munkamenettel
2. Mindkettőben navigálj a `/pwa/cancel` oldalra
3. Kattints mindkettőben egyszerre a "Confirm Cancellation" gombra

**Elvárt Eredmény:**
- Az első kérés sikeres
- A második kérés "Registration is already cancelled" hibát kap
- Az adatbázis konzisztens marad (csak egy lemondás rögzítve)

---

## 6. rész: Adatbázis Ellenőrzés

### Teszt 6.1: Lemondási Adatok Ellenőrzése

**SQL Lekérdezés:**
```sql
SELECT
  g.name,
  g.email,
  g.registration_status,
  r.cancelled_at,
  r.cancellation_reason
FROM Guest g
JOIN Registration r ON r.guest_id = g.id
WHERE r.cancelled_at IS NOT NULL
ORDER BY r.cancelled_at DESC;
```

**Elvárt Eredmény:**
- Minden lemondott vendégnek van `cancelled_at` időbélyege
- Vendég `registration_status` = 'declined'
- `cancellation_reason` tartalmazza a felhasználói inputot (vagy NULL ha nem volt megadva)

---

### Teszt 6.2: Meg nem Jelenés Jelöltek Ellenőrzése

**SQL Lekérdezés:**
```sql
SELECT
  g.name,
  g.email,
  r.ticket_type
FROM Guest g
JOIN Registration r ON r.guest_id = g.id
LEFT JOIN Checkin c ON c.guest_id = g.id
WHERE r.cancelled_at IS NULL
  AND c.id IS NULL
ORDER BY g.name;
```

**Elvárt Eredmény:**
- Listázza azokat a vendégeket, akik:
  - Rendelkeznek regisztrációval
  - NEM mondtak le
  - NEM jelentkeztek be
- Ezek a potenciális meg nem jelenők

---

## Teszt Adat Beállítás

### Teszt Vendég Létrehozása Lemondás Teszteléshez

```sql
-- Teszt vendég létrehozása
INSERT INTO Guest (email, name, guest_type, registration_status, pwa_auth_code, created_at, updated_at)
VALUES ('cancel-test@test.ceog', 'Lemondás Teszt Felhasználó', 'vip', 'registered', 'CEOG-CANCEL', NOW(), NOW());

-- Regisztráció létrehozása
INSERT INTO Registration (guest_id, ticket_type, gdpr_consent, cancellation_accepted, created_at, updated_at)
SELECT id, 'vip_free', TRUE, TRUE, NOW(), NOW()
FROM Guest WHERE email = 'cancel-test@test.ceog';
```

### Lemondott Vendég Visszaállítása Újrateszteléshez

```sql
UPDATE Registration r
JOIN Guest g ON r.guest_id = g.id
SET r.cancelled_at = NULL, r.cancellation_reason = NULL
WHERE g.email = 'cancel-test@test.ceog';

UPDATE Guest
SET registration_status = 'registered'
WHERE email = 'cancel-test@test.ceog';
```

---

## Ellenőrző Lista Összefoglaló

| Teszt | Leírás | Státusz |
|-------|--------|---------|
| 1.1 | Lemondás oldal elérése dashboardról | ☐ |
| 1.2 | Regisztráció sikeres lemondása | ☐ |
| 1.3 | Regisztráció megtartása (visszalépés) | ☐ |
| 1.4 | Már lemondott állapot | ☐ |
| 1.5 | Határidő lejárt állapot | ☐ |
| 1.6 | Esemény lezajlott állapot | ☐ |
| 1.7 | Gyakoriság korlátozás működik | ☐ |
| 2.1 | Admin - lemondott szűrő | ☐ |
| 2.2 | Admin - meg nem jelent szűrő | ☐ |
| 2.3 | Admin - lemondott vendég részletek | ☐ |
| 3.1 | Check-in elutasítja lemondott QR-t | ☐ |
| 3.2 | API CANCELLED hibát ad vissza | ☐ |
| 4.1 | VIP hozzájárulás meg nem jelenés figyelmeztetéssel | ☐ |
| 4.2 | Fizető vendég hozzájárulás (figyelmeztetés nélkül) | ☐ |
| 5.1 | Hitelesítetlen hozzáférés blokkolva | ☐ |
| 5.2 | Érvénytelen munkamenet kezelve | ☐ |
| 5.3 | Vendég regisztráció nélkül | ☐ |
| 5.4 | Egyidejű lemondás kezelve | ☐ |

---

## Kapcsolódó Fájlok

- PWA Lemondás Oldal: `app/pwa/cancel/page.tsx`
- Lemondás API: `app/api/registration/cancel/route.ts`
- Lemondás Státusz API: `app/api/registration/cancel-status/route.ts`
- Check-in Szolgáltatás: `lib/services/checkin.ts`
- Hozzájárulási Jelölőnégyzetek: `app/register/components/ConsentCheckboxes.tsx`
- Admin Vendéglista: `app/admin/guests/GuestList.tsx`
- Gyakoriság Korlátozás: `lib/services/rate-limit.ts`

---

## Képernyőképek Referencia

Az automatizált tesztekből származó képernyőképek elérhetőek:
`test-results/cancel-noshow-demo/`

- `journey-cancel-01-pwa-login.png` - PWA bejelentkezési képernyő
- `journey-cancel-02-dashboard.png` - Dashboard lemondás linkkel
- `journey-cancel-03-cancel-page.png` - Lemondás megerősítő oldal
- `journey-cancel-04-reason-entered.png` - Ok szövegmező kitöltve
- `journey-cancel-05-success.png` - Lemondás sikeres
- `journey-admin-01-guest-list.png` - Admin vendéglista
- `journey-admin-02-cancelled-filter.png` - Lemondott szűrő aktív
- `journey-admin-03-noshow-filter.png` - Meg nem jelent szűrő aktív

---

*Utolsó frissítés: 2026-01-11*
*Funkció: Részvételi Kötelezettségvállalás (Meg nem jelenés) MVP*
