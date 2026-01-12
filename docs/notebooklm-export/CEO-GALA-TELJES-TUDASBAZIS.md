# CEO Gala 2026 - Teljes Tudásbázis

> **NotebookLM Export** - Verzió: 3.0.0 (2026-01-12)
> Részletes tudásbázis az összes folyamattal és művelettel.

---

# TARTALOMJEGYZÉK

1. Rendszer Áttekintés
2. Részletes Folyamatok
   - VIP Regisztráció
   - Fizető Egyéni Regisztráció
   - Fizető Páros Regisztráció
   - Kártyás Fizetés (Stripe)
   - Banki Átutalás
   - Check-in Beléptetés
   - Részvétel Lemondása
   - No-Show Kezelés
   - Magic Link Újraküldés
   - Email Ütemezés
   - Ültetési Rend Kezelése
   - Vendég Hozzáadása
   - CSV Import
3. Admin Műveletek
4. PWA Vendég Alkalmazás
5. Hibaelhárítás
6. Fogalomtár

---

# 1. RENDSZER ÁTTEKINTÉS

## Mi ez a rendszer?

A **CEO Gala Event Registration System** egy komplett rendezvénykezelő platform VIP eseményekhez. A rendszer kezeli a vendégek meghívását, regisztrációját, fizetését, jegykiadást, ültetést és az esemény napi beléptetést.

## Felhasználói szerepkörök

### Admin (Adminisztrátor)
**Ki ez?** Az esemény szervezője, aki teljes hozzáféréssel rendelkezik.

**Mit tehet?**
- Vendégek hozzáadása, szerkesztése, törlése
- CSV-ből vendéglista import
- Magic link küldése vendégeknek
- Banki átutalások jóváhagyása
- Ültetési rend kezelése drag & drop felületen
- Email küldés vendégeknek (egyedi és tömeges)
- Check-in override (duplikált belépés engedélyezése)
- Statisztikák és exportok megtekintése

**Bejelentkezés:** `/admin/login` - email + jelszó

### Staff (Személyzet)
**Ki ez?** Az esemény napján dolgozó személyzet (hostess, biztonsági).

**Mit tehet?**
- QR kódok szkennelése a check-in ponton
- Vendég adatok megtekintése szkennelés után
- **NEM** tud admin override-ot használni
- **NEM** lát vendéglistát vagy más admin funkciót

**Bejelentkezés:** `/admin/login` - email + jelszó → automatikusan `/checkin`-re irányít

### Vendég
**Ki ez?** A meghívott vagy regisztrált résztvevő.

**Mit tehet?**
- Magic linken keresztül regisztrálni
- Fizetni (ha fizető vendég)
- PWA-ban QR jegyet megtekinteni
- Profil adatokat módosítani
- Részvételt lemondani (7 napig az esemény előtt)

**Bejelentkezés PWA-ba:** `/pwa` - 6 karakteres kód (CEOG-XXXXXX)

## Vendég típusok részletesen

### VIP vendég
- **Jegy ára:** Ingyenes
- **Fizetés:** Nem szükséges
- **Magic link után:** Azonnal megkapja a QR jegyet
- **Kötelezettség:** GDPR + Részvételi kötelezettségvállalás (no-show díj!)
- **Lemondás:** 7 napig online, utána személyesen

### Fizető vendég - Egyéni jegy
- **Jegy ára:** 100,000 HUF
- **Tartalom:** 1 fő részvétel + vacsora + italok
- **Fizetés:** Kártyával (Stripe) VAGY banki átutalással
- **Magic link után:** Fizetés szükséges a QR jegyhez
- **Kötelezettség:** GDPR hozzájárulás

### Fizető vendég - Páros jegy
- **Jegy ára:** 180,000 HUF (2 fő, 20,000 HUF megtakarítás)
- **Tartalom:** 2 fő részvétel + vacsora + italok
- **Fizetés:** Kártyával (Stripe) VAGY banki átutalással
- **Partner:** Regisztrációkor meg kell adni a partner adatait
- **QR jegy:** Mindkét fő külön QR jegyet kap
- **Ültetés:** Automatikusan egy asztalhoz kerülnek

---

# 2. RÉSZLETES FOLYAMATOK

---

## 2.1 VIP REGISZTRÁCIÓS FOLYAMAT

### Ki kezdeményezi?
Admin felhasználó

### Előfeltételek
- Admin be van jelentkezve
- Van a vendég email címe és neve

### A folyamat lépésről lépésre

#### 1. lépés: Vendég hozzáadása
1. Admin megnyitja: `/admin/guests`
2. Kattint az **"Add Guest"** (Vendég hozzáadása) gombra
3. Kitölti az űrlapot:
   - **Email** (kötelező, egyedi - nem lehet már létező)
   - **Név** (kötelező)
   - **Típus**: VIP kiválasztása
   - **Cég** (opcionális)
   - **Pozíció** (opcionális)
   - **Telefon** (opcionális)
4. Kattint a **"Save"** (Mentés) gombra

**Mi történik a háttérben:**
- Létrejön a Guest rekord az adatbázisban
- guest_type = "vip"
- Generálódik egy egyedi magic link hash
- Státusz: **Invited** (Meghívott)

#### 2. lépés: Magic link küldése
1. Admin a vendéglistában megkeresi a vendéget
2. Kattint a **"Send Magic Link"** gombra
3. Megerősíti a küldést

**Mi történik a háttérben:**
- Rendszer generál egy egyedi linket: `/register?code=HASH&email=EMAIL`
- Email kiküldése a vendégnek (Magic Link sablon)
- EmailLog rekord létrejön (email_type: "magic_link", status: "sent")
- A link 24 óráig érvényes

#### 3. lépés: Vendég kattint a magic linkre
1. Vendég megkapja az emailt
2. Kattint a "Regisztráció" gombra az emailben
3. Böngésző megnyitja: `/register?code=XXX&email=XXX`

**Mi történik a háttérben:**
- Rendszer ellenőrzi a hash-t és email-t
- Ha érvényes: regisztrációs űrlap megjelenik
- Ha lejárt/hibás: hibaüzenet, új link kérése szükséges

#### 4. lépés: Regisztrációs űrlap kitöltése
1. Vendég látja az előre kitöltött adatait (név, email)
2. Opcionálisan kitölti:
   - Telefonszám
   - Cég
   - Pozíció
   - Étkezési igények / allergiák
   - Ültetési preferenciák (kivel szeretne egy asztalhoz)
3. **Kötelezően elfogadja:**
   - ☑️ GDPR adatkezelési hozzájárulás
   - ☑️ Részvételi kötelezettségvállalás (no-show díj elfogadása)
4. Kattint a **"Regisztráció megerősítése"** gombra

**Részvételi kötelezettségvállalás szövege:**
> "Tudomásul veszem, hogy a részvételt az esemény előtt 7 napig mondhatom le online.
> Amennyiben nem mondok le és nem jelenik meg (no-show), a szervezők jogosultak
> a jegyár-egyenértékű díjat (100,000 HUF) felszámítani."

#### 5. lépés: Azonnali jegykiadás
**Mi történik a háttérben:**
1. Registration rekord létrejön:
   - status = "approved"
   - ticket_type = "vip_free"
   - gdpr_consent = true
   - cancellation_policy_accepted = true
2. QR kód generálás:
   - JWT token létrehozása (guest_id, registration_id, ticket_type, exp)
   - qr_code_hash mentése
3. PWA auth kód generálása: CEOG-XXXXXX formátum
4. Email küldése a vendégnek:
   - QR kód képként csatolva (CID inline)
   - PWA bejelentkezési kód
   - Esemény részletek
5. EmailLog rekord (email_type: "ticket_delivery")

#### 6. lépés: Vendég megkapja a jegyet
1. Vendég emailben megkapja:
   - QR kódot (képként)
   - PWA bejelentkezési kódot (CEOG-XXXXXX)
   - Esemény dátum, helyszín
2. Vendég bejelentkezhet a PWA-ba: `/pwa`

### Végeredmény
- Vendég státusza: **Approved** (Jóváhagyott)
- Van érvényes QR jegye
- Tud bejelentkezni a PWA-ba
- Beléphet az eseményre

### Lehetséges hibák

| Hiba | Ok | Megoldás |
|------|----|----|
| "Email already exists" | Ez az email már létezik | Keress rá a meglévő vendégre |
| "Magic link expired" | 24 óra eltelt | Küldj új magic linket |
| "Invalid magic link" | Link módosítva/hibás | Küldj új magic linket |
| "Email not sent" | SMTP hiba | Ellenőrizd az email naplót, próbáld újra |

---

## 2.2 FIZETŐ EGYÉNI REGISZTRÁCIÓS FOLYAMAT

### Ki kezdeményezi?
Admin felhasználó (vendég hozzáadása) + Vendég (regisztráció és fizetés)

### A folyamat lépésről lépésre

#### 1-3. lépés: Azonos a VIP folyamattal
- Vendég hozzáadása (guest_type = "paying_single")
- Magic link küldése
- Vendég kattint a linkre

#### 4. lépés: Regisztrációs űrlap kitöltése
1. Vendég kitölti az alap adatokat
2. **Számlázási adatok megadása (kötelező):**
   - Számlázási név
   - Cég neve (ha céges számla)
   - Adószám (ha céges számla)
   - Számlázási cím (irányítószám, város, utca, házszám)
3. GDPR hozzájárulás elfogadása
4. Kattint a "Tovább a fizetéshez" gombra

**Mi történik a háttérben:**
- Registration rekord létrejön:
  - status = "registered"
  - ticket_type = "paid_single"
- BillingInfo rekord létrejön a számlázási adatokkal
- Vendég átirányítva a fizetési mód választáshoz

#### 5. lépés: Fizetési mód választása
Vendég választ:
- **"Bankkártyás fizetés"** → Stripe folyamat (lásd 2.4)
- **"Banki átutalás"** → Átutalás folyamat (lásd 2.5)

### Sikeres fizetés után
- Státusz: **Approved**
- QR jegy email kiküldése
- PWA hozzáférés

---

## 2.3 FIZETŐ PÁROS REGISZTRÁCIÓS FOLYAMAT

### Különbség az egyéni jegyhez képest

#### 4. lépés kiegészítése: Partner adatok
A regisztrációs űrlapon EXTRA mezők:
1. **Partner neve** (kötelező)
2. **Partner email címe** (kötelező)
3. **Partner telefonszáma** (opcionális)

#### Sikeres fizetés után extra lépések
**Mi történik a háttérben:**
1. Fő vendég QR jegye kiállítva
2. **Partner vendég automatikusan létrejön:**
   - Új Guest rekord (partner adatokkal)
   - guest_type = "paying_paired"
   - Saját Registration rekord (status = "approved")
   - Saját QR kód generálva
   - Saját PWA auth kód generálva
3. **Mindketten külön emailt kapnak** a saját QR kódjukkal
4. **Automatikus ültetés:** Mindketten ugyanahhoz az asztalhoz kerülnek (ha van asztal hozzárendelve)

### Végeredmény
- 2 vendég a rendszerben
- 2 külön QR jegy
- 2 külön PWA hozzáférés
- Automatikusan egy asztalhoz ültethetők

---

## 2.4 KÁRTYÁS FIZETÉSI FOLYAMAT (STRIPE)

### Ki kezdeményezi?
Vendég a regisztráció után

### Előfeltételek
- Vendég kitöltötte a regisztrációs űrlapot
- Vendég kiválasztotta a "Bankkártyás fizetés" opciót

### A folyamat lépésről lépésre

#### 1. lépés: Stripe Checkout indítása
1. Vendég kattint a "Fizetés bankkártyával" gombra
2. Rendszer létrehoz egy Stripe Checkout Session-t

**Mi történik a háttérben:**
- API hívás: `POST /api/stripe/create-checkout`
- Stripe Session létrehozása:
  - Összeg: 100,000 HUF (egyéni) vagy 180,000 HUF (páros)
  - Pénznem: HUF
  - Success URL: `/payment/success?session_id=XXX`
  - Cancel URL: `/payment/cancel`
- Payment rekord létrejön:
  - stripe_session_id = session.id
  - status = "pending"
  - amount = jegyár

#### 2. lépés: Stripe fizetési oldal
1. Vendég átirányítva a Stripe hosztolt fizetési oldalára
2. Vendég megadja a kártyaadatokat:
   - Kártyaszám
   - Lejárat
   - CVC
   - Kártyatulajdonos neve
3. 3D Secure hitelesítés (ha a bank megköveteli)
4. Vendég kattint a "Fizetés" gombra

#### 3. lépés: Sikeres fizetés
1. Stripe feldolgozza a fizetést
2. Vendég átirányítva: `/payment/success`
3. Sikeres fizetés oldal megjelenik

**Mi történik a háttérben (Webhook):**
1. Stripe webhook hívás: `POST /api/stripe/webhook`
2. Webhook signature ellenőrzés (STRIPE_WEBHOOK_SECRET)
3. Event típus: `checkout.session.completed`
4. Payment rekord frissítése:
   - status = "paid"
   - paid_at = now()
5. Registration rekord frissítése:
   - status = "approved"
6. QR kód generálás
7. Jegy email kiküldése
8. (Páros jegynél: partner létrehozása + jegy)

#### 4. lépés: Jegy kézbesítés
- Email a vendégnek QR kóddal
- PWA auth kód megadva
- Státusz: **Approved**

### Sikertelen fizetés esetén

| Eset | Mi történik |
|------|-------------|
| Kártya elutasítva | Stripe hibaüzenet, vendég próbálhat másik kártyával |
| 3D Secure sikertelen | Vissza a fizetési oldalra, próbálhat újra |
| Vendég megszakítja | Átirányítás `/payment/cancel`-ra, státusz marad "registered" |
| Webhook hiba | Admin értesítés, manuális ellenőrzés szükséges |

### Összegek

| Jegy típus | Összeg | Stripe díj (~2%) | Nettó bevétel |
|------------|--------|------------------|---------------|
| Egyéni | 100,000 HUF | ~2,000 HUF | ~98,000 HUF |
| Páros | 180,000 HUF | ~3,600 HUF | ~176,400 HUF |

---

## 2.5 BANKI ÁTUTALÁS FOLYAMAT

### Ki kezdeményezi?
Vendég választja a fizetési módot + Admin hagyja jóvá

### A folyamat lépésről lépésre

#### 1. lépés: Átutalás választása
1. Vendég a regisztráció után kiválasztja: "Banki átutalás"
2. Megjelenik az átutalási információ:
   - **Kedvezményezett:** CEO Gala Kft.
   - **Bankszámlaszám:** 12345678-12345678-12345678
   - **Összeg:** 100,000 HUF vagy 180,000 HUF
   - **Közlemény:** CEOG-2026-[GUEST_ID] (fontos az azonosításhoz!)
   - **Határidő:** 5 munkanap

**Mi történik a háttérben:**
- Payment rekord létrejön:
  - status = "pending"
  - payment_method = "bank_transfer"
- Registration status = "registered"
- Email küldése a vendégnek az átutalási adatokkal

#### 2. lépés: Vendég utal
1. Vendég banki felületén elindítja az utalást
2. Megadja az összeget és közleményt
3. Bank feldolgozza (1-3 munkanap)

**Fontos:** A közlemény pontos megadása kritikus az azonosításhoz!

#### 3. lépés: Admin ellenőrzi a bankszámlát
1. Admin ellenőrzi a cég bankszámláját
2. Beérkezett utalásnál ellenőrzi:
   - Összeg stimmel?
   - Közlemény alapján beazonosítható a vendég?

#### 4. lépés: Admin jóváhagyja a fizetést
1. Admin megnyitja: `/admin/payments`
2. Megkeresi a "Pending" státuszú fizetéseket
3. Vendég sorában kattint: **"Approve Payment"** (Fizetés jóváhagyása)
4. Megerősíti a műveletet

**Mi történik a háttérben:**
1. Payment rekord frissítése:
   - status = "paid"
   - paid_at = now()
2. Registration rekord frissítése:
   - status = "approved"
3. QR kód generálás
4. Jegy email kiküldése
5. (Páros jegynél: partner létrehozása + jegy)

#### 5. lépés: Vendég megkapja a jegyet
- Email a QR kóddal
- PWA hozzáférés
- Státusz: **Approved**

### Admin felületen látható információk

| Mező | Jelentés |
|------|----------|
| Vendég neve | Ki utalt |
| Összeg | Mennyit kellene kapni |
| Státusz | Pending = várakozik |
| Regisztráció dátuma | Mikor regisztrált |
| Közlemény | Azonosító (ha email-ből kinyerhető) |

### Gyakori problémák

| Probléma | Megoldás |
|----------|----------|
| Hibás összeg érkezett | Vedd fel a kapcsolatot a vendéggel, kérd a különbözetet |
| Nincs közlemény | Email alapján azonosítsd a vendéget |
| Késik az utalás | Küldj emlékeztető emailt a vendégnek |
| Vendég kétszer utalt | Visszatérítés szükséges (Stripe Dashboard-on) |

---

## 2.6 CHECK-IN BELÉPTETÉSI FOLYAMAT

### Ki végzi?
Staff vagy Admin felhasználó az esemény napján

### Előfeltételek
- Staff/Admin be van jelentkezve
- Mobil eszköz kamerával
- Internet kapcsolat
- Vendégnek van érvényes QR jegye

### A folyamat lépésről lépésre

#### 1. lépés: Szkenner megnyitása
1. Staff/Admin megnyitja: `/checkin`
2. Böngésző kéri a kamera engedélyt
3. Staff engedélyezi a kamera hozzáférést
4. Megjelenik a kamera nézet a szkenner kerettel

#### 2. lépés: QR kód beolvasása
1. Vendég mutatja a QR kódot (telefonon vagy kinyomtatva)
2. Staff a kamerát a QR kódra irányítja
3. Rendszer automatikusan beolvassa a kódot

**Mi történik a háttérben:**
- QR kód dekódolása → JWT token
- API hívás: `POST /api/checkin/validate`
- JWT token ellenőrzése:
  - Érvényes aláírás? (QR_SECRET)
  - Nem járt le? (exp claim)
  - Létezik a regisztráció?
  - Mi a státusz?
  - Van-e már check-in?

#### 3. lépés: Visszajelzés megjelenítése

##### ZÖLD KÁRTYA - Érvényes belépés
**Megjelenő információk:**
- ✅ Nagy zöld pipa ikon
- Vendég neve (nagybetűs)
- Jegy típusa: VIP / Egyéni / Páros
- Asztal száma (ha van hozzárendelve)
- "Check In" gomb

**Staff teendője:**
1. Ellenőrzi, hogy a név stimmel-e (személyi okmány)
2. Kattint a **"Check In"** gombra

**Mi történik a háttérben:**
- API hívás: `POST /api/checkin/submit`
- Checkin rekord létrejön:
  - registration_id
  - guest_id
  - staff_user_id (ki léptette be)
  - checked_in_at = now()
  - method = "qr_scan"
  - is_override = false

**Sikeres check-in után:**
- "Sikeres beléptetés!" üzenet
- Visszaáll a szkenner mód
- Következő vendég jöhet

##### SÁRGA KÁRTYA - Már belépett (duplikált)
**Megjelenő információk:**
- ⚠️ Sárga figyelmeztető ikon
- "Ez a vendég már belépett!"
- Vendég neve
- Első belépés időpontja (pl. "14:32")
- Ki léptette be (staff neve)

**Staff teendője:**
- NEM engedheti be újra
- Hívjon egy Admint

**Admin teendője (ha indokolt):**
1. Kattint az **"Admin Override"** gombra
2. Megadja az override okát (pl. "Vendég kiment dohányozni")
3. Megerősíti

**Mi történik override esetén:**
- Új Checkin rekord létrejön:
  - is_override = true
  - override_reason = megadott ok

##### PIROS KÁRTYA - Érvénytelen
**Megjelenő információk:**
- ❌ Piros X ikon
- "Érvénytelen QR kód!"
- Hiba oka (ha azonosítható):
  - "Lejárt jegy"
  - "Ismeretlen QR kód"
  - "Törölt regisztráció"
  - "Lemondott regisztráció"

**Staff teendője:**
1. NEM engedheti be
2. Kérdezze meg a vendég nevét
3. Keresse meg manuálisan: `/admin/guests` (csak Admin)
4. Értesítse az Admint

##### NARANCSSÁRGA KÁRTYA - Lemondott vendég
**Megjelenő információk:**
- 🟠 Narancssárga ikon
- "Lemondott regisztráció!"
- Vendég neve
- Lemondás dátuma
- Lemondás oka

**Staff teendője:**
1. **NEM engedheti be automatikusan**
2. Értesítse az Admint
3. Admin dönt: újra regisztrálja vagy elutasítja

### Check-in statisztikák (Admin Dashboard)

| Mutató | Jelentés |
|--------|----------|
| Belépett | Hány vendég lépett már be |
| Várakozik | Regisztrált de még nem lépett be |
| Belépési arány | Belépett / Összes regisztrált (%) |
| Utolsó belépés | Mikor volt az utolsó check-in |

---

## 2.7 RÉSZVÉTEL LEMONDÁSI FOLYAMAT

### Ki kezdeményezi?
Vendég a PWA-ban

### Előfeltételek
- Vendégnek van jóváhagyott regisztrációja
- Legalább 7 nap van az eseményig
- Vendég be van jelentkezve a PWA-ba

### A folyamat lépésről lépésre

#### 1. lépés: Vendég megnyitja a lemondás oldalt
1. Vendég bejelentkezik a PWA-ba: `/pwa`
2. Beírja a kódját: CEOG-XXXXXX
3. Dashboard-on kattint: "Részvétel lemondása"
4. VAGY közvetlenül megnyitja: `/pwa/cancel`

#### 2. lépés: Lemondási jogosultság ellenőrzése

**Mi történik a háttérben:**
- API hívás: `GET /api/registration/cancel-status`
- Ellenőrzések:
  - Van érvényes regisztráció?
  - Státusz = "approved"?
  - Esemény dátuma - mai dátum >= 7 nap?

**Ha LEHET lemondani (7+ nap van):**
- Megjelenik a lemondási űrlap

**Ha NEM lehet lemondani (7 napon belül):**
- Hibaüzenet: "Online lemondás már nem lehetséges"
- Információ: "Kérjük, vegye fel velünk a kapcsolatot személyesen"
- Email cím / telefonszám megjelenítése

#### 3. lépés: Lemondási űrlap kitöltése
1. Vendég kiválasztja a lemondás okát:
   - ⏰ Időpont ütközés
   - 🤒 Betegség
   - ❓ Egyéb ok
2. Opcionálisan megjegyzést ír
3. Kattint a "Lemondás megerősítése" gombra
4. Megerősítő dialógus: "Biztosan lemondja a részvételt?"
5. Kattint: "Igen, lemondom"

#### 4. lépés: Lemondás feldolgozása

**Mi történik a háttérben:**
- API hívás: `POST /api/registration/cancel`
- Registration rekord frissítése:
  - status = "cancelled"
  - cancellation_reason = választott ok
  - cancellation_comment = megjegyzés (ha van)
  - cancelled_at = now()
- QR kód érvénytelenítése
- Email küldése a vendégnek (visszaigazolás)
- Admin értesítése (opcionális)

#### 5. lépés: Visszaigazolás
1. Vendég látja: "Részvétel sikeresen lemondva"
2. Email érkezik a lemondás visszaigazolásáról
3. PWA-ban már nem látja a QR jegyet
4. Check-in esetén: PIROS kártya fog megjelenni

### Lemondás adminisztrátori oldalról

**Admin is lemondhatja a vendég részvételét:**
1. `/admin/guests` → vendég keresése
2. Vendég szerkesztése
3. Státusz módosítása: "Cancelled"
4. Ok megadása
5. Mentés

### Páros jegy lemondása

**Ha a fő vendég lemondja:**
- Csak a saját részvétele mondódik le
- Partner külön dönthet (ha van saját PWA hozzáférése)
- Admin értesítést kap mindkét esetről

**Admin dönthet:**
- Mindkét jegyet lemondja
- Csak az egyiket tartja meg
- Visszatérítés kezelése

---

## 2.8 NO-SHOW KEZELÉSI FOLYAMAT

### Mi az a No-Show?
Olyan vendég, aki:
- Regisztrált és jóváhagyott státuszú volt
- NEM mondta le a részvételt
- NEM jelent meg az eseményen (nincs check-in rekord)

### Mikor azonosítható?
Az esemény napjának végén vagy másnap

### A folyamat lépésről lépésre

#### 1. lépés: No-show vendégek azonosítása
1. Admin megnyitja: `/admin/statistics`
2. Statisztikák között látja:
   - "Potenciális No-Show" szám
   - Lista exportálható

**No-show kritériumok:**
- registration.status = "approved"
- NEM létezik hozzá Checkin rekord
- Esemény dátuma < mai dátum

#### 2. lépés: No-show lista exportálása
1. Admin exportálja a no-show listát (CSV)
2. Lista tartalmazza:
   - Vendég neve, email
   - Jegy típusa
   - Regisztráció dátuma

#### 3. lépés: No-show email küldése (VIP vendégeknek)

**Csak VIP vendégeknél alkalmazható** (ők fogadták el a részvételi kötelezettségvállalást)

1. Admin megnyitja: `/admin/email`
2. Kiválasztja: "No-Show Payment Request" sablont
3. Kiválasztja a címzetteket (no-show VIP lista)
4. Előnézet ellenőrzése
5. Küldés

**Email tartalma:**
- Esemény neve, dátuma
- Tájékoztatás a meg nem jelenésről
- Fizetési felszólítás (100,000 HUF)
- Bankszámla adatok
- Fizetési határidő
- Kapcsolatfelvételi lehetőség

#### 4. lépés: Fizetés nyomon követése
- Admin manuálisan követi a beérkező utalásokat
- Fizető no-show vendégek jelölése a rendszerben

### No-show statisztikák

| Mutató | Számítás |
|--------|----------|
| No-show arány | No-show / Összes regisztrált × 100% |
| No-show VIP | Hány VIP nem jelent meg |
| Potenciális bevétel | No-show VIP × 100,000 HUF |

### Megelőzés

**E-10 emlékeztető (10 nappal előtte):**
- Emlékezteti a vendéget az eseményről
- Tartalmazza a lemondási linket
- Kéri a részvétel megerősítését

**E-7 emlékeztető (7 nappal előtte):**
- Utolsó figyelmeztetés
- "Holnap lejár az online lemondás lehetősége!"
- Lemondási link

---

## 2.9 MAGIC LINK ÚJRAKÜLDÉSI FOLYAMAT

### Mikor szükséges?
- Vendég nem kapta meg az emailt
- Magic link lejárt (24 óra)
- Vendég elvesztette az emailt

### A folyamat lépésről lépésre

#### 1. lépés: Admin megkeresi a vendéget
1. Admin megnyitja: `/admin/guests`
2. Keresés név vagy email alapján
3. Megtalálja a vendéget

#### 2. lépés: Új magic link generálása és küldése
1. Admin kattint a vendég sorában: **"Resend Magic Link"**
2. Megerősíti a küldést

**Mi történik a háttérben:**
- Régi magic link hash érvénytelenítése
- Új hash generálása
- Új email küldése
- EmailLog rekord létrejön
- Új link 24 óráig érvényes

#### 3. lépés: Vendég értesítése
- Új email érkezik a vendégnek
- A régi link már nem működik

### Rate Limiting

**Korlátok:**
- Max 5 magic link email / óra / vendég
- Max 20 összes email / óra / vendég

**Ha túllépi:**
- "Rate limit exceeded" hibaüzenet
- Várni kell 1 órát

---

## 2.10 EMAIL ÜTEMEZÉSI FOLYAMAT

### Automatikus emlékeztetők beállítása

#### E-10 Emlékeztető (10 nappal az esemény előtt)

**Cél:** Emlékeztetni a vendégeket, lehetőséget adni a lemondásra

**Tartalom:**
- Esemény részletek (dátum, helyszín)
- Lemondási link (/pwa/cancel)
- "Ha nem tud részt venni, kérjük jelezze időben!"

**Ütemezés:**
1. Admin megnyitja: `/admin/scheduled-emails`
2. Kattint: "Schedule Bulk"
3. Kiválasztja: "E-10 Reminder"
4. Célcsoport: Minden jóváhagyott vendég
5. Rendszer kiszámolja a küldési dátumot: esemény - 10 nap
6. Megerősítés

**Mi történik:**
- ScheduledEmail rekordok létrejönnek minden vendéghez
- scheduled_at = esemény dátuma - 10 nap
- Rendszer a megadott napon automatikusan kiküldi

#### E-7 Emlékeztető (7 nappal az esemény előtt)

**Cél:** Utolsó figyelmeztetés, lemondási határidő

**Tartalom:**
- "Még ma éjfélig mondhatja le online!"
- Lemondási link
- Részvételi kötelezettség emlékeztető

**Ütemezés:** Ugyanaz mint E-10, de esemény - 7 nap

### Manuális tömeges email küldés

1. Admin megnyitja: `/admin/email`
2. Kiválasztja a sablont
3. Kiválasztja a célcsoportot:
   - Összes vendég
   - Csak VIP
   - Csak fizető
   - Egyéni lista
4. Előnézet ellenőrzése
5. Küldés indítása

**Batch feldolgozás:**
- Emailek 10-es csomagokban mennek
- 1 másodperc várakozás csomagok között
- Hiba esetén újrapróbálkozás (max 3x)

---

## 2.11 ÜLTETÉSI REND KEZELÉSI FOLYAMAT

### Asztalok létrehozása

#### 1. lépés: Asztal hozzáadása
1. Admin megnyitja: `/admin/tables`
2. Kattint: "Add Table"
3. Kitölti:
   - **Név**: pl. "VIP 1", "Asztal 5"
   - **Típus**: VIP vagy Standard
   - **Kapacitás**: Hány fő fér az asztalhoz (alapértelmezett: 10)
4. Mentés

### Vendégek ültetése (Drag & Drop)

#### 1. lépés: Ültetési nézet megnyitása
1. Admin megnyitja: `/admin/seating`
2. Két nézet választható:
   - **Grid nézet**: Kártyás megjelenítés
   - **Floor Plan nézet**: Vizuális térkép

#### 2. lépés: Vendég asztalhoz rendelése
1. Jobb oldalon: "Ültetetlen vendégek" lista
2. Admin megfogja a vendég nevét (drag)
3. Áthúzza a kívánt asztalra (drop)
4. Elengedés

**Mi történik a háttérben:**
- TableAssignment rekord létrejön
- guest_id → table_id kapcsolat
- seat_number automatikus (következő szabad)
- Azonnali mentés

#### 3. lépés: Vendég áthelyezése
1. Vendég neve az asztalon
2. Megfogás és másik asztalra húzás
3. Régi assignment törlődik, új létrejön

#### 4. lépés: Vendég eltávolítása asztalról
1. Vendég neve az asztalon
2. Kattintás az "X" gombra
3. Vendég visszakerül az "Ültetetlen" listába

### Páros jegyek ültetése
- Ha az egyiket áthelyezed, a partner is automatikusan követi
- Mindig egy asztalhoz kerülnek

### Kapacitás ellenőrzés

| Színkód | Jelentés |
|---------|----------|
| Zöld | Van szabad hely |
| Sárga | 80% felett (közel tele) |
| Piros | 100% (tele) |

**Túlzsúfoltság:** Rendszer figyelmeztet, de engedi a túllépést (admin override)

### Floor Plan Export

**PNG export (prezentációhoz):**
1. Floor Plan nézet
2. Letöltés ikon → PNG
3. Magas felbontású kép letöltődik

**PDF export (nyomtatáshoz):**
1. Floor Plan nézet
2. Letöltés ikon → PDF
3. PDF fejléccel, jelmagyarázattal letöltődik

---

## 2.12 VENDÉG HOZZÁADÁSI FOLYAMAT (MANUÁLIS)

### A folyamat lépésről lépésre

#### 1. lépés: Űrlap megnyitása
1. Admin megnyitja: `/admin/guests`
2. Kattint: "Add Guest"

#### 2. lépés: Adatok megadása
**Kötelező mezők:**
- **Email**: Egyedi, érvényes email cím
- **Név**: Vendég teljes neve

**Opcionális mezők:**
- **Típus**: VIP / Fizető egyéni / Fizető páros
- **Cég**: Munkahely neve
- **Pozíció**: Beosztás
- **Telefon**: Kapcsolattartáshoz

#### 3. lépés: Mentés
1. Kattint: "Save"
2. Vendég létrejön a rendszerben
3. Státusz: **Invited**
4. Magic link még NINCS elküldve!

#### 4. lépés: Magic link küldése (külön lépés)
1. Vendég sorában: "Send Magic Link"
2. Email kimegy

### Validációk

| Mező | Ellenőrzés |
|------|------------|
| Email | Formátum + egyediség |
| Név | Minimum 2 karakter |
| Telefon | Opcionális, formátum ellenőrzés |

---

## 2.13 CSV IMPORT FOLYAMAT

### Mikor hasznos?
- Sok vendég egyszerre történő hozzáadása
- Meglévő vendéglista átvétele
- Korábbi évek adatainak importálása

### A folyamat lépésről lépésre

#### 1. lépés: CSV sablon letöltése
1. Admin megnyitja: `/admin/guests`
2. Kattint: "Import CSV"
3. Letölti a sablon CSV fájlt

**CSV oszlopok:**
```
email,name,guest_type,company,position,phone
vendeg@example.com,Kiss János,vip,ABC Kft.,CEO,+36201234567
fizeto@example.com,Nagy Éva,paying_single,XYZ Zrt.,CFO,
```

**guest_type értékek:**
- `vip` - VIP vendég
- `paying_single` - Fizető egyéni
- `paying_paired` - Fizető páros

#### 2. lépés: CSV kitöltése
1. Megnyitás Excel-ben vagy Google Sheets-ben
2. Vendégek adatainak kitöltése
3. Mentés CSV formátumban (UTF-8 kódolás!)

#### 3. lépés: Feltöltés
1. "Import CSV" dialógus
2. Fájl kiválasztása
3. Feltöltés

#### 4. lépés: Előnézet és ellenőrzés
1. Rendszer megjeleníti az előnézetet
2. Hibák piros színnel jelölve:
   - Duplikált email
   - Hiányzó kötelező mező
   - Érvénytelen formátum
3. Összesítő:
   - X új vendég lesz hozzáadva
   - Y hiba javítandó

#### 5. lépés: Import végrehajtása
1. Hibák javítása (ha van)
2. "Import" gomb
3. Vendégek létrejönnek

**Mi történik a háttérben:**
- Guest rekordok létrejönnek
- Státusz: "invited" (magic link még nincs küldve)
- Hibás sorok átlépve, naplózva

#### 6. lépés: Magic linkek küldése
1. Tömeges kijelölés: "Select all new"
2. "Send Magic Link" bulk action
3. Emailek kiküldése batch-ekben

---

# 3. ADMIN MŰVELETEK

## Admin Dashboard (`/admin`)

### Főoldal statisztikák
- **Összesen**: Összes vendég száma
- **Regisztrált**: Regisztrációt befejezők
- **Jóváhagyott**: Érvényes jeggyel rendelkezők
- **Lemondott**: PWA-ban lemondottak
- **Check-in**: Belépettek az eseményen
- **No-show**: Regisztrált de nem jelent meg

### Gyors műveletek
- Vendég hozzáadása
- CSV import
- Email küldés
- Seating megnyitása

## Vendéglista (`/admin/guests`)

### Szűrési lehetőségek
- **Kategória**: VIP / Fizető egyéni / Fizető páros / Összes
- **Státusz**: Invited / Registered / Approved / Declined / Cancelled
- **Fizetési státusz**: Pending / Paid / Failed
- **Asztal**: Konkrét asztal vagy "Ültetetlen"
- **Keresés**: Név, email, cég szabad szöveges keresés

### Vendég műveletek
| Művelet | Leírás |
|---------|--------|
| Edit | Adatok szerkesztése |
| Send Magic Link | (Újra)küldés |
| Resend Ticket | Jegy újraküldése |
| View | Részletek megtekintése |
| Delete | Vendég törlése (óvatosan!) |

### Bulk műveletek
- Send Magic Link to Selected
- Assign to Table
- Export Selected

## Fizetések (`/admin/payments`)

### Szűrők
- **Státusz**: Pending / Paid / Failed / Refunded
- **Módszer**: Card / Bank Transfer

### Műveletek
- **Approve Payment**: Banki átutalás jóváhagyása
- **View Details**: Stripe tranzakció részletei
- **Refund**: Visszatérítés (Stripe-on keresztül)

## Check-in napló (`/admin/checkin-log`)

### Megjelenített adatok
- Vendég neve
- Belépés időpontja
- Ki léptette be (staff neve)
- Override volt-e

### Szűrők
- Dátum
- Staff felhasználó
- Override / Normál

---

# 4. PWA VENDÉG ALKALMAZÁS

## Bejelentkezés (`/pwa`)

### Folyamat
1. Vendég megnyitja a `/pwa` URL-t
2. Beírja a 6 karakteres kódot: CEOG-XXXXXX
3. Kód ellenőrzése
4. Sikeres: Dashboard megjelenik
5. Sikertelen: "Hibás kód" üzenet

### Hol találja a kódot?
- Jegyes emailben
- QR kód email alján

## Dashboard (`/pwa/dashboard`)

### Megjelenített elemek
- "Üdvözöljük, [Vendég neve]!"
- Esemény dátuma és countdown
- QR jegy gyors elérés gomb
- Asztal információ (ha van)
- Menü linkek

## QR Jegy (`/pwa/ticket`)

### Funkciók
- Teljes képernyős QR kód
- Fényerő növelő gomb
- Működik offline is (ha korábban megnyitotta)

### Offline működés
- Service Worker cache-eli a jegyet
- Internet nélkül is megjeleníthető
- "Offline mód" jelzés

## Profil (`/pwa/profile`)

### Megtekinthető (nem szerkeszthető)
- Név
- Email

### Szerkeszthető mezők
- Telefonszám
- Cég
- Pozíció
- Étkezési igények / allergiák
- Ültetési preferenciák

### Mentés
- "Mentés" gomb
- Azonnali visszajelzés

## Lemondás (`/pwa/cancel`)

### Mikor elérhető?
- Esemény előtt legalább 7 nappal

### Folyamat
1. Lemondási ok választása
2. Opcionális megjegyzés
3. "Lemondás megerősítése"
4. Visszaigazolás

### 7 napon belül
- "Online lemondás már nem lehetséges"
- Kapcsolatfelvételi információk

---

# 5. HIBAELHÁRÍTÁS

## "A vendég nem kapta meg az emailt"

### Ellenőrzési lépések
1. **Email cím helyes?** Admin → Guests → vendég email ellenőrzése
2. **Spam mappa?** Kérd meg a vendéget, hogy nézze meg
3. **Email napló?** Admin → Email Log → keresés vendég emailjére
4. **Email státusz?**
   - sent = sikeresen elküldve
   - failed = SMTP hiba
   - bounced = email cím nem létezik

### Megoldások
| Probléma | Megoldás |
|----------|----------|
| Email nincs a naplóban | Küldj új magic linket |
| Status: failed | Ellenőrizd az SMTP beállításokat |
| Status: bounced | Kérd a helyes email címet |
| Spam-ben van | Kérd a whitelist-elést |

## "A magic link nem működik"

### Lehetséges okok
1. **Link lejárt** (24 óra) → Küldj újat
2. **Link már felhasználva** → Vendég már regisztrált
3. **Link hibásan másolva** → Küldj újat

### Ellenőrzés
1. Admin → Guests → vendég keresése
2. Státusz ellenőrzése:
   - Invited = még nem regisztrált
   - Registered/Approved = már felhasználta

## "A fizetés nem sikerült"

### Kártyás fizetés
| Hiba | Ok | Megoldás |
|------|----|----|
| Card declined | Elégtelen fedezet / Limit | Másik kártya |
| 3D Secure failed | Hitelesítés sikertelen | Próbálja újra |
| Network error | Kapcsolati hiba | Próbálja újra |

### Banki átutalás
| Probléma | Megoldás |
|----------|----------|
| Nem látszik | Várjon 1-3 munkanapot |
| Hibás összeg | Kérje a különbözetet |
| Nincs közlemény | Azonosítás email alapján |

## "A QR kód nem működik a check-in-nél"

### Ellenőrzés
1. **Fényerő**: Telefon fényereje maximum
2. **Tisztaság**: Képernyő tisztítása
3. **Távolság**: 10-20 cm távolság
4. **Szög**: Egyenesen tartani

### Ha nem olvasható
1. Manuális keresés: Admin → Guests → név alapján
2. Vendég azonosítása okmánnyal
3. Manuális check-in

## "Duplikált belépés figyelmeztetés"

### Mit jelent?
A vendég QR kódja már egyszer beolvasásra került.

### Kezelés
- **Staff**: NEM léptethet be, hívjon admint
- **Admin**: Override gomb (ok megadása kötelező)

### Tipikus okai
- Vendég kiment és visszajött
- Téves szkennelés
- Technikai hiba első check-in-nél

## "Rate limit exceeded"

### Mit jelent?
Túl sok email küldési kísérlet rövid időn belül.

### Korlátok
- 5 email / típus / óra / vendég
- 20 email / óra / vendég összesen

### Megoldás
Várjon 1 órát, majd próbálja újra.

---

# 6. FOGALOMTÁR

## Alapfogalmak

| Fogalom | Angol | Jelentés |
|---------|-------|----------|
| Admin | Admin | Adminisztrátor, teljes hozzáférés |
| Staff | Staff | Személyzet, csak check-in |
| Vendég | Guest | Esemény résztvevője |
| VIP | VIP | Kiemelt vendég, ingyenes jegy |
| Egyéni jegy | Single Ticket | 1 személyre szóló fizetős jegy |
| Páros jegy | Paired Ticket | 2 személyre szóló fizetős jegy |
| Partner | Partner | Páros jegy második vendége |

## Technikai fogalmak

| Fogalom | Jelentés |
|---------|----------|
| Magic Link | Egyedi regisztrációs link, 24 óráig érvényes |
| QR kód | Beléptető vonalkód a jegyen |
| JWT | JSON Web Token - biztonságos token a QR-ben |
| Check-in | Beléptetés az eseményre |
| Override | Admin felülírás szabályok alól |
| PWA | Progressive Web App - vendég mobilalkalmazás |
| Webhook | Automatikus értesítés rendszerek között |

## Státuszok

| Státusz | Magyar | Jelentés |
|---------|--------|----------|
| Invited | Meghívott | Magic link elküldve, vár regisztrációra |
| Registered | Regisztrált | Űrlap kitöltve, fizetésre vár |
| Approved | Jóváhagyott | QR jegy kiállítva, beléphet |
| Declined | Visszautasított | Vendég NEM jön (magic linken mondta) |
| Cancelled | Lemondott | Vendég lemondta a PWA-ban |
| Checked-in | Belépett | Sikeresen beléptetve az eseményen |
| No-show | Nem jelent meg | Regisztrált de nem jött el |

## Fizetési státuszok

| Státusz | Magyar | Jelentés |
|---------|--------|----------|
| Pending | Függőben | Fizetés folyamatban |
| Paid | Fizetve | Sikeres fizetés |
| Failed | Sikertelen | Fizetés meghiúsult |
| Refunded | Visszatérített | Pénz visszautalva |

## Email típusok

| Típus | Mikor küldődik |
|-------|----------------|
| Magic Link | Vendég hozzáadásakor |
| Ticket | Sikeres regisztráció/fizetés után |
| Payment Confirmation | Fizetés jóváhagyása után |
| E-10 Reminder | 10 nappal az esemény előtt |
| E-7 Reminder | 7 nappal az esemény előtt |
| Cancellation Confirmation | Lemondás után |
| No-show Payment Request | Esemény után (VIP-nek) |

---

# FÜGGELÉK: GYORS REFERENCIA

## Legfontosabb URL-ek

| Funkció | URL |
|---------|-----|
| Admin bejelentkezés | `/admin/login` |
| Admin dashboard | `/admin` |
| Vendéglista | `/admin/guests` |
| Ültetési rend | `/admin/seating` |
| Check-in szkenner | `/checkin` |
| PWA bejelentkezés | `/pwa` |
| PWA jegy | `/pwa/ticket` |
| PWA lemondás | `/pwa/cancel` |

## Jegyárak összefoglaló

| Típus | Ár | Tartalmazza |
|-------|---:|-------------|
| VIP | 0 Ft | 1 fő + vacsora + ital |
| Egyéni | 100,000 Ft | 1 fő + vacsora + ital |
| Páros | 180,000 Ft | 2 fő + vacsora + ital |

## Határidők

| Esemény | Határidő |
|---------|----------|
| Magic link lejárat | 24 óra |
| Online lemondás | Esemény - 7 nap |
| QR jegy lejárat | Esemény + 48 óra |
| Banki átutalás | 5 munkanap |

---

*Dokumentum verzió: 3.0.0 | Generálva: 2026-01-12*
