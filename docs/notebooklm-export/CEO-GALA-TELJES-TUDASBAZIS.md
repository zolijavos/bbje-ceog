# CEO Gala 2026 - Teljes Tudásbázis

> **NotebookLM Export** - Verzió: 2.9.1 (2026-01-11)
> Ez a dokumentum tartalmazza a CEO Gala rendszer teljes funkcionális tudásbázisát.

---

# 1. RENDSZER ÁTTEKINTÉS

## Mi ez a rendszer?

A CEO Gala Event Registration System egy komplett rendezvénykezelő platform, amely a következő funkciókat biztosítja:
- Vendégek regisztrációja és kezelése
- Online fizetés (Stripe) és banki átutalás kezelése
- QR kódos jegyrendszer
- Esemény napi check-in mobil szkennerrel
- Ültetési rend kezelése drag & drop felülettel
- Email kommunikáció a vendégekkel

## Felhasználói szerepkörök

### Admin (Adminisztrátor)
- Teljes hozzáférés minden funkcióhoz
- Vendégek hozzáadása, szerkesztése, törlése
- CSV import vendéglistából
- Fizetések jóváhagyása (banki átutalás esetén)
- Ültetési rend kezelése
- Email küldés
- Check-in override (duplikált belépés engedélyezése)

### Staff (Személyzet)
- Csak a check-in szkennerhez van hozzáférése
- QR kódok szkennelése az esemény napján
- NEM tud override-olni duplikált belépésnél
- NEM lát vendéglistát vagy admin funkciókat

## Vendég típusok

### VIP vendég
- Meghívott, ingyenes jegy
- Magic link emailben kapja a regisztrációs linket
- Regisztráció után azonnal megkapja a QR jegyet
- Nem kell fizetnie

### Fizető vendég (Egyéni)
- Meghívott vendég
- 1 fős jegy
- Fizethet kártyával (Stripe) vagy banki átutalással
- Fizetés után kapja meg a QR jegyet

### Fizető vendég (Páros)
- Meghívott vendég
- 2 fős jegy (fő vendég + partner)
- Partner adatait is meg kell adni regisztrációkor
- Mindketten külön QR jegyet kapnak
- Automatikusan ugyanahhoz az asztalhoz kerülnek

## Rendszer URL-ek

### Publikus oldalak
- `/` - Főoldal
- `/register?code=XXX&email=XXX` - Magic link regisztráció
- `/status?email=XXX` - Regisztrációs státusz ellenőrzés
- `/help` - Vendég súgó

### Admin felület
- `/admin` - Admin dashboard
- `/admin/guests` - Vendéglista
- `/admin/tables` - Asztalok kezelése
- `/admin/seating` - Ültetési rend (drag & drop)
- `/admin/payments` - Fizetések
- `/admin/email` - Email küldés
- `/admin/checkin-log` - Check-in napló
- `/admin/changelog` - Változásnapló (verziónkénti funkciók)
- `/admin/release-testing` - Manuális tesztelési lépések verziónként
- `/admin/help` - Admin súgó

### Check-in
- `/checkin` - QR szkenner (mobil optimalizált)

### Vendég PWA alkalmazás
- `/pwa` - Bejelentkezés
- `/pwa/dashboard` - Vendég főoldal
- `/pwa/ticket` - QR jegy
- `/pwa/profile` - Profil szerkesztés
- `/pwa/cancel` - Részvétel lemondása (7 nappal az esemény előtt)

---

# 2. VENDÉG KEZELÉS

## Vendéglista megtekintése

### Hol találom?
Admin → Guests (Vendégek) menüpont

### Szűrési lehetőségek
- **Kategória**: VIP, Fizető egyéni, Fizető páros
- **Státusz**: Meghívott, Regisztrált, Jóváhagyott, Visszautasított, Lemondott
- **Fizetési státusz**: Utalásra vár, Fizetve, Sikertelen, Visszatérítve
- **Asztal**: Adott asztalhoz rendelt vendégek
- **VIP fogadás**: Csak VIP / Nem VIP vendégek
- **Keresés**: Név, email, cég alapján

## Vendég státuszok

### Invited (Meghívott)
- Magic link elküldve
- Még nem regisztrált
- Várja a vendég reakcióját

### Registered (Regisztrált)
- Kitöltötte a regisztrációs űrlapot
- Fizető vendégnél: fizetésre vár

### Approved (Jóváhagyott)
- Regisztráció és fizetés rendben
- QR jegy kiállítva
- Beléphet az eseményre

### Declined (Visszautasított)
- Vendég visszamondta a részvételt
- Magic linken a "Nem tudok részt venni" opciót választotta

### Cancelled (Lemondott)
- Vendég lemondta a részvételt a PWA-ban (`/pwa/cancel`)
- Narancssárga badge a vendéglistában
- Lemondási ok és megjegyzés rögzítve
- QR jegy érvénytelen (check-in-nél piros kártya)
- Az esemény előtt 7 napig mondható le online

## No-Show Statisztikák

### Mit jelent a No-Show?
A vendég regisztrált és jóváhagyott, de nem jelent meg az eseményen (nem történt check-in).

### Admin Dashboard statisztikák
- **Lemondottak száma**: Hány vendég mondta le a PWA-ban
- **Potenciális no-show**: Regisztrált de nem jelent meg
- **Friss lemondások**: Utolsó 7 nap lemondásai
- **Lemondási okok megoszlása**: Időpont ütközés / Betegség / Egyéb

### No-Show kezelés
1. Esemény után azonosíthatók a no-show vendégek
2. Automatikus email küldhető fizetési felszólítással
3. VIP vendégeknél no-show díj számítható fel

---

# 3. FIZETÉS ÉS REGISZTRÁCIÓ

## Regisztrációs folyamatok

### VIP regisztráció (ingyenes)
1. Admin hozzáadja a VIP vendéget
2. Magic link kiküldése emailben
3. Vendég kattint a linkre
4. Kitölti a regisztrációs adatokat
5. **GDPR hozzájárulás és részvételi kötelezettségvállalás elfogadása**
6. **Azonnal megkapja a QR jegyet emailben**
7. Státusz: Jóváhagyott

## Consent és GDPR

### GDPR Hozzájárulás
A regisztrációs űrlapon kötelező elfogadni az adatkezelési hozzájárulást.

**Kezelt adatok:**
- Név, email cím
- Telefonszám, cég, beosztás
- Étkezési igények/allergiák

**Adatkezelési célok:**
- Esemény regisztráció és szervezés
- Kommunikáció a vendéggel
- Étkezési igények továbbítása catering-nek

**Megőrzési idő:** 12 hónap az esemény után

### Részvételi Kötelezettségvállalás (VIP vendégek)
**Fontos szabályok:**
- Részvétel lemondható az esemény előtt **7 napig** a PWA-ban
- 7 napon belüli lemondás: személyes kapcsolatfelvétel szükséges
- **No-show esetén** (nem jelenik meg értesítés nélkül): jegyár-egyenértékű díj számítható fel

## Fizetési módok

### Kártyás fizetés (Stripe)
- Azonnali feldolgozás
- Visa, Mastercard, American Express
- 3D Secure támogatás
- Automatikus visszaigazolás
- QR jegy azonnal kiállításra kerül

### Banki átutalás
- Vendég megkapja a bankszámla adatokat
- Vendég utal a megadott összegre
- Admin manuálisan jóváhagyja a beérkezést
- Jóváhagyás után QR jegy kiállítás

## Jegyárak

| Jegy típus | Ár | Tartalom |
|------------|---:|----------|
| VIP jegy | Ingyenes | 1 fő részvétel, vacsora, italok |
| Egyéni jegy | 100,000 HUF | 1 fő részvétel, vacsora, italok |
| Páros jegy | 180,000 HUF | 2 fő részvétel, vacsora, italok |

---

# 4. CHECK-IN RENDSZER

## QR kód szkennelés

### Hogyan működik?
1. Nyisd meg a `/checkin` oldalt
2. Engedélyezd a kamera hozzáférést
3. Tartsd a QR kódot a kamera elé
4. A rendszer automatikusan beolvassa

## Visszajelzések (színkódok)

### ZÖLD - Érvényes belépés
**Mit jelent:** A vendég beléphet.

**Megjelenő információk:**
- Vendég neve
- Jegy típusa (VIP/Egyéni/Páros)
- Asztal száma (ha van)

**Teendő:** Kattints a "Check In" gombra a belépés rögzítéséhez.

### SÁRGA - Már belépett
**Mit jelent:** Ez a QR kód már egyszer be lett olvasva.

**Teendő:**
- **Staff:** Hívj egy admint az override-hoz
- **Admin:** Használhatod az "Admin Override" gombot

### PIROS - Érvénytelen
**Mit jelent:** A QR kód nem érvényes.

**Lehetséges okok:**
- Lejárt QR kód
- Hamis/módosított kód
- Törölt regisztráció
- Nem létező vendég
- **Lemondott regisztráció** (vendég a PWA-ban lemondta)

**Teendő:**
- Ellenőrizd a vendég adatait manuálisan
- Keress rá a nevére a rendszerben
- **Lemondott vendég esetén:** NE engedd be - értesítsd az admint

### NARANCSSÁRGA - Lemondott vendég
**Mit jelent:** A vendég korábban lemondta a részvételt a PWA-ban.

**Teendő:**
- **NE engedd be automatikusan**
- Értesítsd az admint
- Ha a vendég mégis részt akar venni: admin döntés szükséges

---

# 5. ÜLTETÉS ÉS ASZTALOK KEZELÉSE

## Asztalok áttekintése

### Asztal típusok
- **VIP asztal**: Kiemelt vendégeknek, általában a színpadhoz közelebb
- **Standard asztal**: Normál vendégeknek

### Asztal kapacitás
- Alapértelmezett: 10 fő/asztal
- Módosítható egyedileg

## Ültetési rend (Seating)

### Nézetek
1. **Grid nézet**: Kártyás megjelenítés, asztalonként
2. **Floor Plan nézet**: 2D térkép kerek asztalokkal

### Drag & Drop működés
1. Fogd meg a vendéget a jobb oldali listából
2. Húzd az asztalra a bal oldalon
3. Engedd el
4. A rendszer automatikusan menti

## Export funkciók

**Floor Plan nézetben (vizuális):**
1. Válts **Floor Plan nézetre**
2. Kattints a **letöltés ikonra** (dropdown menü)
3. Válassz formátumot:
   - **PNG**: Magas minőségű kép prezentációkhoz
   - **PDF**: Nyomtatásra kész dokumentum fejléccel

---

# 6. EMAIL KOMMUNIKÁCIÓ

## Email típusok

### Magic Link Email
- **Cél**: Regisztrációs link küldése
- **Érvényesség**: 24 óra
- **Design**: Elegáns meghívó Georgia serif betűtípussal

### Jegy Email (Ticket Delivery)
- **Cél**: QR jegy kézbesítése
- **Mikor**: Sikeres regisztráció és fizetés után

### E-10 Emlékeztető (10 nappal az esemény előtt)
- **Cél**: Emlékeztető az eseményről, részvétel megerősítés kérés
- **Mikor**: Automatikusan 10 nappal az esemény előtt
- **Tartalom**: Esemény részletek, lemondási link, megerősítés kérés

### E-7 Emlékeztető (7 nappal az esemény előtt)
- **Cél**: Utolsó emlékeztető, utolsó esély lemondásra
- **Mikor**: Automatikusan 7 nappal az esemény előtt
- **Fontos**: Lemondási határidő figyelmeztetés

### No-Show Fizetési Felszólítás
- **Cél**: Díj bekérése no-show vendégtől
- **Mikor**: Esemény után (manuálisan vagy automatikusan)
- **Címzettek**: VIP vendégek, akik nem jelentek meg

## Automatikus Email Ütemező

### Előre beállított ütemezések
- **E-10**: 10 nappal az esemény előtt (emlékeztető lemondási linkkel)
- **E-7**: 7 nappal az esemény előtt (utolsó lemondási lehetőség)
- **No-Show**: Esemény után (fizetési felszólítás)

## Sablon változók
- `{{name}}` - Vendég neve
- `{{email}}` - Vendég email címe
- `{{event_date}}` - Esemény dátuma
- `{{event_location}}` - Helyszín
- `{{magic_link}}` - Regisztrációs link
- `{{qr_code}}` - QR kód (képként)
- `{{table_name}}` - Asztal neve
- `{{ticket_type}}` - Jegy típusa
- `{{cancel_url}}` - Lemondási link (PWA cancel oldal)
- `{{cancel_deadline}}` - Lemondási határidő dátuma

## Rate Limiting (Küldési korlátok)
- **Típusonként**: Max 5 email/típus/óra/vendég
- **Összesen**: Max 20 email/óra/vendég

---

# 7. HIBAELHÁRÍTÁS ÉS GYIK

## Lemondás és No-Show

### "A vendég le szeretné mondani a részvételt"
**7 napnál korábban:**
1. Irányítsd a vendéget a PWA-ba (`/pwa/cancel`)
2. Ott kiválaszthatja a lemondás okát
3. A státusz automatikusan "Lemondott"-ra változik

**7 napon belül:**
- Online lemondás már nem lehetséges
- Személyes kapcsolatfelvétel szükséges
- Admin manuálisan módosíthatja a státuszt

### "Mi történik no-show esetén?"
1. Azonosítás: Regisztrált státuszú + nincs check-in
2. VIP vendégeknél: díj számítható fel
3. Automatikus email küldhető fizetési felszólítással

### "Lemondott vendég mégis be akar lépni"
1. A QR kód piros kártyát fog adni
2. NE engedd be automatikusan
3. Értesítsd az admint
4. Admin döntése alapján: manuális regisztráció újra vagy elutasítás

## Magic link problémák

### "A vendég nem kapta meg az emailt"
1. Ellenőrizd az email címet a rendszerben
2. Kérd meg, hogy nézze a spam mappát
3. Ellenőrizd az email naplót
4. Ha nem ment ki: küldj újat

### "A magic link lejárt"
Küldj új magic linket. A link 24 óráig érvényes.

## Check-in problémák

### "Duplikált belépés figyelmeztetés"
- **Staff:** Hívj egy admint
- **Admin:** Ha indokolt, használd az "Admin Override" gombot

### "Érvénytelen QR kód hibaüzenet"
1. Ellenőrizd, hogy a vendég a saját QR kódját mutatja-e
2. Keress rá manuálisan a vendégre
3. Lemondott vendég esetén: admin döntés

---

# 8. VENDÉG PWA ALKALMAZÁS

## Bejelentkezés

### Bejelentkezési kód
- Formátum: `CEOG-XXXXXX` (6 karakter)
- A vendég emailben kapja a jeggyel együtt
- Egyedi minden vendéghez

## PWA funkciók

### Dashboard (Főoldal)
- Üdvözlő üzenet a vendég nevével
- QR jegy gyors elérés
- Asztal információ (ha van)
- Esemény countdown

### QR Jegy (`/pwa/ticket`)
- Teljes képernyős QR kód
- Működik offline is
- Fényerő optimalizálás gomb

### Profil (`/pwa/profile`)
**Szerkeszthető:**
- Telefonszám
- Cég
- Pozíció
- Étkezési igények / allergiák
- Ültetési preferencia

### Lemondás (`/pwa/cancel`)
- Részvétel lemondása az esemény előtt 7 napig
- Lemondási ok választás (időpont ütközés, betegség, egyéb)
- Opcionális megjegyzés mező
- Megerősítés után a státusz "Lemondott"-ra változik

## Offline működés
- QR jegy megjelenítése (ha korábban betöltötte)
- Alapvető profil információk megtekintése

## Színek és téma
A PWA a BBJ Events 2026 arculatát követi:
- Navy alapú színpaletta (#000D38 elsődleges)
- Monokróm ikon rendszer (navy/fehér)
- Inter betűtípus elegáns hierarchiával
- Sötét és világos mód támogatás

---

# 9. FOGALOMTÁR

## Legfontosabb fogalmak

| Fogalom | Jelentés |
|---------|----------|
| **Admin** | Adminisztrátor, teljes hozzáférés |
| **Staff** | Személyzet, csak check-in |
| **VIP** | Kiemelt vendég, ingyenes jegy |
| **Magic Link** | Egyedi regisztrációs link, 24 óráig érvényes |
| **Check-in** | Beléptetés QR kóddal |
| **Cancelled** | Lemondott státusz (PWA-ban lemondta) |
| **No-Show** | Regisztrált de nem jelent meg |
| **E-10 / E-7** | Emlékeztető emailek 10/7 nappal az esemény előtt |
| **Override** | Admin felülírás (pl. duplikált belépés) |
| **PWA** | Progressive Web App a vendégeknek |
| **Rate Limit** | Email küldési korlát |

## Státuszok összefoglalója

| Státusz | Magyar | Jelentés |
|---------|--------|----------|
| Invited | Meghívott | Magic link elküldve, vár regisztrációra |
| Registered | Regisztrált | Űrlap kitöltve, fizetésre vár (ha fizető) |
| Approved | Jóváhagyott | Minden rendben, QR jegy kiállítva |
| Declined | Visszautasított | Vendég visszautasította a magic linken |
| **Cancelled** | **Lemondott** | **Vendég a PWA-ban lemondta (7 napig)** |

## Fizetési státuszok

| Státusz | Magyar | Jelentés |
|---------|--------|----------|
| Pending | Függőben | Fizetés folyamatban / várakozik |
| Paid | Fizetve | Sikeres fizetés |
| Failed | Sikertelen | Fizetés nem sikerült |
| Refunded | Visszatérített | Összeg visszautalva |

---

# 10. API VÉGPONTOK

## Guest Registration
- `GET /register?code={hash}&email={email}` - Magic link validálás
- `POST /api/registration/submit` - Regisztráció beküldése
- `POST /api/registration/partner` - Partner adatok (páros jegy)
- `GET /api/registration/cancel-status` - Lemondási jogosultság ellenőrzés
- `POST /api/registration/cancel` - Részvétel lemondása

## Payment Processing
- `POST /api/stripe/create-checkout` - Stripe Checkout Session
- `POST /api/stripe/webhook` - Stripe webhook (fizetés visszaigazolás)

## Check-in System
- `POST /api/checkin/validate` - QR kód JWT token validálás
- `POST /api/checkin/submit` - Check-in rögzítése

## Admin Dashboard
- `GET /api/admin/guests` - Vendéglista (szűrés, lapozás)
- `POST /api/admin/guests/import` - CSV import
- `PATCH /api/admin/guests/{id}/approve-payment` - Banki átutalás jóváhagyás
- `GET|POST /api/admin/tables` - Asztalok CRUD
- `POST /api/admin/table-assignments` - Ültetés
- `GET /api/admin/seating-export` - Ültetési rend CSV export

## Email Management
- `GET /api/admin/scheduled-emails` - Ütemezett emailek
- `POST /api/admin/scheduled-emails/bulk` - Tömeges email küldés
- `DELETE /api/admin/scheduled-emails/{id}` - Ütemezett email törlése

---

# 11. ADATBÁZIS MODELLEK

## Fő táblák

### Guest (Vendég)
- email (UNIQUE)
- name, title, phone
- company, position
- guest_type (vip, paying_single, paying_paired)
- dietary_requirements, seating_preferences
- pwa_auth_code, push_token
- is_vip_reception (VIP fogadás flag)

### Registration (Regisztráció)
- guest_id (FK UNIQUE)
- ticket_type (vip_free, paid_single, paid_paired)
- payment_method (card, bank_transfer)
- status (invited, registered, approved, declined, cancelled)
- qr_code_hash
- cancellation_reason, cancellation_comment, cancelled_at
- gdpr_consent, cancellation_policy_accepted

### Payment (Fizetés)
- registration_id (FK UNIQUE)
- stripe_session_id
- amount, currency
- status (pending, paid, failed, refunded)
- paid_at

### Checkin (Beléptetés)
- registration_id (UNIQUE)
- guest_id (UNIQUE)
- staff_user_id (FK)
- method, is_override

### Table (Asztal)
- name (UNIQUE)
- capacity, type
- pos_x, pos_y
- status (available, full, reserved)

### TableAssignment (Ültetés)
- table_id (FK)
- guest_id (FK UNIQUE)
- seat_number

### EmailLog (Email napló)
- guest_id (FK)
- email_type, status
- error_message

---

*Dokumentum generálva: 2026-01-11 | Verzió: 2.9.1 (applicant funkció eltávolítva)*
