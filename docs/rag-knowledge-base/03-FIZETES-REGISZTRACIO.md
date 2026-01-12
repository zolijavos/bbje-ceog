# CEO Gala - Fizetés és Regisztráció

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

**Érintetti jogok:**
- Hozzáférés, helyesbítés, törlés kérése
- Adatkezelés elleni tiltakozás

### Részvételi Kötelezettségvállalás (VIP vendégek)
**Fontos szabályok:**
- Részvétel lemondható az esemény előtt **7 napig** a PWA-ban
- 7 napon belüli lemondás: személyes kapcsolatfelvétel szükséges
- **No-show esetén** (nem jelenik meg értesítés nélkül): jegyár-egyenértékű díj számítható fel

**Miért van ez?**
- Helyfoglalás és catering előre tervezése
- Más vendégek beengedése lemondás esetén

### Fizető regisztráció (egyéni jegy)
1. Admin hozzáadja a vendéget
2. Magic link kiküldése
3. Vendég kattint a linkre
4. Kitölti az adatokat
5. Megadja a számlázási adatokat
6. Választ fizetési módot:
   - **Kártyás fizetés**: Átirányítás Stripe-ra → sikeres fizetés → QR jegy
   - **Banki átutalás**: Admin jóváhagyásra vár → jóváhagyás után QR jegy
7. Státusz: Jóváhagyott (fizetés után)

### Fizető regisztráció (páros jegy)
1. Ugyanaz mint az egyéni, DE:
2. Partner adatokat is meg kell adni (név, email)
3. Fizetés után MINDKETTEN kapnak QR jegyet
4. Partner automatikusan létrejön a rendszerben

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

## Fizetések kezelése (Admin)

### Hol találom?
Admin → Payments (Fizetések) menüpont

### Mit látok?
- Összes fizetés listája
- Szűrés státusz szerint (Pending/Paid/Failed)
- Vendég neve, összeg, dátum
- Fizetési mód

### Banki átutalás jóváhagyása
1. Payments → Pending (Függőben lévő) szűrő
2. Keresd meg a vendéget
3. Ellenőrizd, hogy beérkezett-e az utalás a bankszámlán
4. Kattints az "Approve Payment" (Fizetés jóváhagyása) gombra
5. Vendég automatikusan megkapja a QR jegyet

### Fizetés visszautasítása
Ha téves vagy problémás fizetés:
1. Kattints a "Reject" gombra
2. Add meg az okot
3. Vendég értesítést kap

## Jegyárak

### VIP jegy
- Ár: Ingyenes
- Tartalmaz: 1 fő részvétel, vacsora, italok

### Egyéni jegy
- Ár: 100,000 HUF
- Tartalmaz: 1 fő részvétel, vacsora, italok

### Páros jegy
- Ár: 180,000 HUF (2 fő)
- Tartalmaz: 2 fő részvétel, vacsora, italok
- Megtakarítás: 20,000 HUF a két egyéni jegyhez képest

## Számlázás

### Számlázási adatok
Fizető vendégek megadják:
- Név / Cégnév
- Adószám (opcionális)
- Cím (irányítószám, város, utca, házszám)
- Ország

### Számla kiállítás
- Stripe fizetésnél: automatikus Stripe számla
- Banki átutalásnál: manuális számla kiállítás szükséges

## QR jegy kiállítás

### Mikor kerül kiállításra?
- VIP: Regisztráció után azonnal
- Fizető (kártya): Sikeres Stripe fizetés után azonnal
- Fizető (átutalás): Admin jóváhagyás után

### Mi történik kiállításkor?
1. Egyedi QR kód generálás (JWT token)
2. Email küldés a vendégnek a jeggyel
3. PWA-ban is megjelenik a jegy
4. Státusz: Jóváhagyott

### QR kód tartalma
- Vendég azonosító
- Regisztráció azonosító
- Jegy típus
- Lejárati idő (esemény után 48 óra)

## Gyakori problémák

### "A vendég nem kapta meg a magic linket"
1. Ellenőrizd a spam/levélszemét mappát
2. Ellenőrizd, hogy jó email cím van-e megadva
3. Küldj új magic linket

### "A fizetés sikertelen volt"
1. Kártya esetén: próbálja újra, vagy másik kártyával
2. Ellenőrizze a kártya limitjét
3. Kapcsolatfelvétel a bankkal

### "Banki átutalás nem érkezett meg"
1. Ellenőrizd a közleményt (tartalmazza-e a nevet/email)
2. Várd meg 1-3 munkanapot
3. Kérd a vendégtől az utalás igazolást

### "Rossz számlázási adatokat adott meg"
Jelenleg admin tudja módosítani:
1. Guests → Vendég keresése
2. Billing Info szerkesztése
3. Új számla kiállítása szükséges lehet

## Visszatérítés

### Mikor lehetséges?
- Esemény előtt minimum 7 nappal
- Indokolt esetben (betegség, stb.)
- Admin döntés alapján

### Hogyan?
1. Stripe fizetés: Stripe Dashboard-on keresztül
2. Banki átutalás: Manuális visszautalás
3. Vendég státuszának módosítása (Cancelled)

## Statisztikák

### Fizetési összesítő
Admin Dashboard-on látható:
- Összes bevétel
- Kifizetett jegyek száma
- Függőben lévő fizetések
- Sikertelen fizetések

### Export
Payments → Export gomb
- CSV formátum
- Tartalmazza: vendég, összeg, dátum, státusz, mód
