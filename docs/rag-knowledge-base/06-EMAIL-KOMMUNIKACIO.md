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

### Jelentkezés visszaigazolás
- **Cél**: Jelentkezés beérkezésének megerősítése
- **Mikor**: Jelentkezési űrlap beküldése után
- **Tartalom**: Köszönet, várható feldolgozási idő

### Jelentkezés elbírálás
- **Cél**: Döntés közlése a jelentkezővel
- **Mikor**: Admin jóváhagyás vagy elutasítás után
- **Tartalom**:
  - Jóváhagyás: Magic link a regisztrációhoz
  - Elutasítás: Indoklás

### Fizetési visszaigazolás
- **Cél**: Sikeres fizetés megerősítése
- **Mikor**: Stripe fizetés vagy banki átutalás jóváhagyása után
- **Tartalom**: Összeg, fizetési mód, következő lépések

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

## Email sablonok

### Beépített sablonok
- Magic Link (HU/EN)
- Ticket Delivery (HU/EN)
- Payment Confirmation (HU/EN)
- Application Received (HU/EN)
- Application Approved/Rejected (HU/EN)

### Sablon változók
A sablonokban használható változók:
- `{{name}}` - Vendég neve
- `{{email}}` - Vendég email címe
- `{{event_date}}` - Esemény dátuma
- `{{event_location}}` - Helyszín
- `{{magic_link}}` - Regisztrációs link
- `{{qr_code}}` - QR kód (képként)
- `{{table_name}}` - Asztal neve
- `{{ticket_type}}` - Jegy típusa

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
- 1 hét előtt: Általános emlékeztető
- 1 nap előtt: Részletes infó (helyszín, parkolás)
- Esemény napján reggel: QR kód emlékeztető

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
