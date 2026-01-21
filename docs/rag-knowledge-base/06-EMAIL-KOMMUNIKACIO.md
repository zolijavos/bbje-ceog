# CEO Gala - Email Kommunikáció

## Email típusok

### Magic Link Email
- **Cél**: Regisztrációs link küldése
- **Mikor**: Új vendég hozzáadásakor, vagy kérésre újraküldés
- **Érvényesség**: 24 óra
- **Tartalom**: Személyes link a regisztrációhoz

### Jegy Email (Ticket Delivery)
- **Cél**: QR jegy kézbesítése
- **Mikor**: Sikeres regisztráció és fizetés után
- **Tartalom**: QR kód, esemény részletek, PWA link

### Fizetési visszaigazolás
- **Cél**: Sikeres fizetés megerősítése
- **Mikor**: Stripe fizetés vagy banki átutalás jóváhagyása után
- **Tartalom**: Összeg, fizetési mód, következő lépések

### E-10 Emlékeztető (10 nappal az esemény előtt)
- **Cél**: Emlékeztető az eseményről, részvétel megerősítés kérés
- **Mikor**: Automatikusan 10 nappal az esemény előtt
- **Tartalom**: Esemény részletek, lemondási link, megerősítés kérés
- **Fontos**: Tartalmazza a `/pwa/cancel` linket

### E-7 Emlékeztető (7 nappal az esemény előtt)
- **Cél**: Utolsó emlékeztető, utolsó esély lemondásra
- **Mikor**: Automatikusan 7 nappal az esemény előtt
- **Tartalom**: Esemény infó, **utolsó nap a lemondásra**
- **Fontos**: Lemondási határidő figyelmeztetés

### No-Show Fizetési Felszólítás
- **Cél**: Díj bekérése no-show vendégtől
- **Mikor**: Esemény után (manuálisan vagy automatikusan)
- **Tartalom**: Számla adatok, fizetési határidő, indoklás
- **Címzettek**: VIP vendégek, akik nem jelentek meg

## Email küldés (Admin)

### Hol találom?
Admin → Email menüpont

### Egyéni email küldés
1. Guests → Keress rá a vendégre
2. Kattints az email ikonra
3. Válaszd az email típust:
   - Send Magic Link
   - Resend Ticket
   - Custom Email
4. Küldés

### Tömeges email küldés
1. Admin → Email
2. Válaszd ki a címzetteket:
   - Összes vendég
   - Kategória szerint (VIP, Fizető, stb.)
   - Státusz szerint (Regisztrált, Meghívott, stb.)
   - Egyéni kiválasztás
3. Válaszd az email típust
4. Ellenőrizd az előnézetet
5. Küldés

### Ütemezett küldés
1. Válaszd az "Schedule" opciót
2. Állítsd be a dátumot és időt
3. A rendszer automatikusan elküldi

## Automatikus Email Ütemező

### Előre beállított ütemezések
- **E-10**: 10 nappal az esemény előtt (emlékeztető lemondási linkkel)
- **E-7**: 7 nappal az esemény előtt (utolsó lemondási lehetőség)
- **No-Show**: Esemény után (fizetési felszólítás)

### Bulk ütemezés
1. Admin → Email → Scheduled
2. "Schedule Bulk" gomb
3. Válassz email típust (E-10, E-7, stb.)
4. Válassz célcsoportot (VIP, Fizető, Összes)
5. A rendszer kiszámolja a küldési dátumot az esemény dátuma alapján

### Ütemezett emailek kezelése
- Függőben lévő emailek láthatók az Email → Scheduled listában
- Törölhető/módosítható a küldés előtt
- Státusz: Pending → Sent / Failed

## Email sablonok

### Beépített sablonok
- Magic Link (HU/EN) - Elegáns meghívó design Georgia serif betűtípussal
- Ticket Delivery (HU/EN)
- Payment Confirmation (HU/EN)
- **E-10 Event Reminder** (HU/EN) - Lemondási linkkel
- **E-7 Event Reminder** (HU/EN) - Utolsó lemondási lehetőség
- **No-Show Payment Request** (HU/EN) - Fizetési felszólítás

### Sablon változók
A sablonokban használható változók:
- `{{guestName}}` - Vendég teljes neve címzéssel (pl. "Dr. John Doe")
- `{{email}}` - Vendég email címe
- `{{event_date}}` - Esemény dátuma
- `{{event_location}}` - Helyszín
- `{{magic_link}}` - Regisztrációs link
- `{{qr_code}}` - QR kód (képként)
- `{{table_name}}` - Asztal neve
- `{{ticket_type}}` - Jegy típusa
- `{{cancel_url}}` - Lemondási link (PWA cancel oldal)
- `{{cancel_deadline}}` - Lemondási határidő dátuma

## Email napló

### Hol találom?
Admin → Email → Email Log

### Mit látok?
- Összes elküldött email
- Címzett
- Típus
- Küldés időpontja
- Státusz (Sent/Failed/Pending)

### Szűrési lehetőségek
- Dátum szerint
- Típus szerint
- Státusz szerint
- Vendég szerint

## Hibaelhárítás

### "A vendég nem kapta meg az emailt"

**Ellenőrizd:**
1. Helyes email cím van-e megadva
2. Spam/Levélszemét mappa
3. Email napló - elküldtük-e?

**Megoldások:**
1. Küldj újra magic linket
2. Kérd meg, hogy whitelist-elje a küldő címet
3. Próbálj másik email címre küldeni

### "Az email spam-be került"
**Megelőzés:**
- Használj ismert küldő domaint
- Kerüld a spam trigger szavakat
- Ne küldj túl sok emailt egyszerre

**Utólagos teendő:**
- Kérd meg a vendéget, hogy jelölje "nem spam"-nak
- Add hozzá a címjegyzékhez

### "A QR kód nem jelenik meg az emailben"
**Okok:**
- Email kliens blokkolja a képeket
- Túl nagy az email mérete

**Megoldás:**
- Kérd meg a vendéget, hogy engedélyezze a képeket
- A PWA-ban mindig elérhető a QR kód

## Rate Limiting (Küldési korlátok)

### Miért van?
- Spam megelőzés
- Szerver védelem
- Email szolgáltató szabályok

### Limitek
- **Típusonként**: Max 5 email/típus/óra/vendég
- **Összesen**: Max 20 email/óra/vendég

### Mit jelent ez?
- Nem küldhetsz 5-nél több magic linket egy vendégnek 1 órán belül
- Ha eléred a limitet, várnod kell

## Best Practices

### Magic link küldés
- Küldés után várj legalább 5 percet mielőtt újraküldöd
- Ha nem működik, ellenőrizd az email címet
- Maximum 3 próbálkozás, utána személyes kapcsolatfelvétel

### Tömeges küldés
- Ne küldj 100-nál több emailt egyszerre
- Ütemezd különböző időpontokra
- Ellenőrizd az eredményeket a naplóban

### Esemény előtti emlékeztetők
Ajánlott ütemezés:
- **E-10** (10 nap előtt): Emlékeztető lemondási linkkel
- **E-7** (7 nap előtt): Utolsó lemondási lehetőség figyelmeztetés
- 1 nap előtt: Részletes infó (helyszín, parkolás)
- Esemény napján reggel: QR kód emlékeztető

### Esemény utáni emailek
- **No-Show felszólítás**: Esemény után 1-3 nappal
- Célcsoport: Regisztrált de nem jelent meg vendégek

## Email tartalom tippek

### Hatékony tárgy sorok
- "CEO Gala 2026 - Regisztrációs link"
- "Az Ön belépőjegye a CEO Gala rendezvényre"
- "Emlékeztető: CEO Gala holnap!"

### Fontos elemek
- Világos CTA (Call to Action) gomb
- Esemény dátuma és helyszíne
- Kapcsolattartó elérhetőség
- Leiratkozási lehetőség (GDPR)

## GDPR megfelelőség

### Beleegyezés
- Vendégek regisztrációkor elfogadják az adatkezelést
- Email küldés csak jóváhagyott vendégeknek

### Leiratkozás
- Minden emailben legyen leiratkozási link
- Leiratkozott vendégnek ne küldj több emailt

### Adatmegőrzés
- Email napló megőrzése az esemény után
- Személyes adatok törlése kérésre
