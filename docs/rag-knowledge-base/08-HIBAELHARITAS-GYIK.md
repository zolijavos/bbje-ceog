# CEO Gala - Hibaelhárítás és GYIK

## Bejelentkezési problémák

### "Nem tudok bejelentkezni az admin felületre"
**Lehetséges okok:**
1. Hibás email vagy jelszó
2. Caps Lock be van kapcsolva
3. Régi böngésző cache

**Megoldás:**
1. Ellenőrizd az email címet (kis/nagybetű számít)
2. Próbáld a "Forgot Password" opciót
3. Töröld a böngésző cache-t és cookie-kat
4. Próbáld másik böngészővel

### "Staff felhasználó nem fér hozzá az admin funkciókhoz"
**Ez normális!** Staff felhasználók csak a check-in szkennert használhatják. Admin funkciókhoz admin jogosultság kell.

### "A vendég nem tud bejelentkezni a PWA-ba"
**Ellenőrizd:**
1. Helyes kódot adott-e meg (CEOG-XXXXXX formátum)
2. A kód a jegyes emailben található
3. Regisztrált és jóváhagyott-e a vendég

## Magic link problémák

### "A vendég azt mondja, nem kapott emailt"
**Lépések:**
1. Ellenőrizd az email címet a rendszerben
2. Kérd meg, hogy nézze a spam mappát
3. Ellenőrizd az email naplót (Admin → Email Log)
4. Ha nem ment ki: küldj újat
5. Ha kiment de nem érkezett: próbálj másik email címet

### "A magic link lejárt"
**Megoldás:** Küldj új magic linket. A link 24 óráig érvényes.

### "A magic link 'Invalid' hibaüzenetet ad"
**Okok:**
- A link már fel lett használva
- A vendég törölve lett
- A link módosítva lett (ne másold részlegesen!)

**Megoldás:** Küldj új magic linket

## Fizetési problémák

### "A kártyás fizetés sikertelen"
**Általános okok:**
- Elégtelen fedezet
- Kártya limit túllépés
- 3D Secure hitelesítés sikertelen
- Bank elutasította

**Mit mondj a vendégnek:**
1. Próbálja másik kártyával
2. Ellenőrizze a kártya limitjét
3. Vegye fel a kapcsolatot a bankjával
4. Alternatíva: banki átutalás

### "A banki átutalás nem látszik"
**Ellenőrizd:**
1. Mikor utalt? (1-3 munkanap szükséges)
2. Helyes számlaszámra utalt?
3. A közleményben szerepel a név/azonosító?
4. Kérd az utalás igazolást a vendégtől

### "Visszatérítést kér a vendég"
**Stripe fizetés esetén:**
1. Lépj be a Stripe Dashboard-ra
2. Keresd meg a tranzakciót
3. "Refund" opció

**Banki átutalás esetén:**
1. Manuális visszautalás szükséges
2. Kérd a bankszámlaszámot
3. Dokumentáld a visszatérítést

## QR kód problémák

### "A QR kód nem olvasható a check-in-nél"
**Próbáld:**
1. Vendég növelje a képernyő fényerejét
2. Tisztítsa meg a telefon képernyőjét
3. Más szögből próbáld
4. Közelebb/távolabb tartsd

**Ha nem működik:** Használd a manuális keresést

### "A vendég QR kódja nem érvényes"
**Okok:**
- Lejárt a jegy (esemény után 48 óra)
- Régi screenshot (nem a jelenlegi kód)
- Törölt/módosított regisztráció

**Megoldás:**
1. Keress rá manuálisan a vendégre
2. Ellenőrizd a státuszát
3. Ha rendben van, engedélyezd a belépést manuálisan

### "A vendég elvesztette a QR kódot"
**Megoldás:**
1. A PWA-ban mindig elérhető: `/pwa/ticket`
2. Vagy küldd újra a jegyet: Guest → Resend Ticket

## Check-in problémák

### "Duplikált belépés figyelmeztetés"
**Mit jelent:** A vendég QR kódja már egyszer beolvasásra került.

**Mit tegyél:**
- **Staff:** Hívj egy admint
- **Admin:** Ha indokolt, használd az "Admin Override" gombot

### "Nem működik a kamera"
**Ellenőrizd:**
1. Böngésző kamera engedély
2. Nincs-e más app ami használja
3. Fizikai kamera működik-e

**Megoldás:**
- Engedélyezd a kamerát a böngésző beállításokban
- Indítsd újra a böngészőt
- Próbáld másik eszközzel

### "Nincs internet a helyszínen"
**A check-in NEM működik offline!**

**Vészhelyzet terv:**
1. Exportálj PDF listát előre
2. Használd a papír alapú listát
3. Rögzítsd utólag a belépéseket

## Ültetési problémák

### "Nincs elég hely az asztalon"
**Megoldás:**
1. Növeld az asztal kapacitását
2. Vagy helyezz át vendégeket másik asztalhoz
3. Vagy hozz létre új asztalt

### "A páros jegyes vendégek külön asztalhoz kerültek"
**Ez nem fordulhat elő automatikusan!** Ha mégis:
1. Ellenőrizd, hogy párosítva vannak-e
2. Manuálisan tedd őket egy asztalhoz

### "A vendég ültetési preferenciája nem teljesíthető"
**Kezelés:**
1. Próbáld a lehető legjobban figyelembe venni
2. Ha nem lehet: értesítsd a vendéget
3. Dokumentáld a döntést

## Email problémák

### "Az email spam-be kerül"
**Megelőzés:**
- Kérd meg a vendégeket, hogy white-list-eljék a küldő címet
- Ne küldj túl sok emailt egyszerre
- Kerüld a spam trigger szavakat

### "Rate limit hibaüzenet"
**Mit jelent:** Túl sok emailt próbáltál küldeni rövid idő alatt.

**Megoldás:** Várj 1 órát, majd próbáld újra.

### "Az email sablon nem jelenik meg helyesen"
**Ellenőrizd:**
- A változók helyesen vannak-e beírva
- HTML formázás rendben van-e
- Teszteld különböző email kliensekben

## Rendszer problémák

### "Lassú az admin felület"
**Lehetséges okok:**
1. Internetkapcsolat probléma
2. Böngésző túlterhelés

**Megoldás:**
1. Frissítsd az oldalt
2. Töröld a böngésző cache-t
3. Próbáld másik böngészővel

### "Az oldal nem tölt be"
**Próbáld:**
1. Frissítsd az oldalt (Ctrl+F5)
2. Ellenőrizd az internet kapcsolatot
3. Próbáld másik böngészővel
4. Ellenőrizd a szerver státuszt

### "Adatok nem mentődnek"
**Lehetséges okok:**
1. Kapcsolat megszakadt mentés közben
2. Validációs hiba (piros mezők)

**Megoldás:**
1. Ellenőrizd az internet kapcsolatot
2. Javítsd a hibás mezőket
3. Próbáld újra

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
**No-show = regisztrált vendég, aki nem jelent meg és nem mondta le**

1. Azonosítás: Regisztrált státuszú + nincs check-in
2. VIP vendégeknél: díj számítható fel (jegyár-egyenértékű)
3. Automatikus email küldhető fizetési felszólítással

### "Hol látom a no-show statisztikákat?"
Admin Dashboard-on látható:
- Lemondottak száma
- Potenciális no-show-k (regisztrált de nem check-in)
- Lemondási okok megoszlása

### "Lemondott vendég mégis be akar lépni"
1. A QR kód piros kártyát fog adni
2. NE engedd be automatikusan
3. Értesítsd az admint
4. Admin döntése alapján: manuális regisztráció újra vagy elutasítás

## Gyakran Ismételt Kérdések

### "Hány vendég fér a rendszerbe?"
Technikailag nincs korlát. A rendszer 10,000+ vendéget is kezelni tud.

### "Hány admin/staff felhasználó lehet?"
Nincs korlát. Annyi felhasználót hozhatsz létre, amennyire szükség van.

### "Működik mobilon az admin felület?"
Igen, de asztali gépről/laptopról kényelmesebb. A check-in szkenner mobilra optimalizált.

### "Mi történik, ha elmegy az internet az eseményen?"
A check-in csak online működik. Készíts PDF exportot előre vészhelyzetre.

### "Lehet módosítani az esemény dátumát?"
A dátum a konfigurációban állítható. A QR kódok érvényessége automatikusan igazodik.

### "Törölhető egy vendég összes adata?"
Igen, GDPR kérésre törölhető minden adat. Ez végleges és visszafordíthatatlan.

### "Exportálhatók az adatok?"
Igen, minden lista exportálható CSV és/vagy PDF formátumban.

### "Van automatikus mentés?"
Igen, minden módosítás azonnal mentődik az adatbázisba.

### "Látszik, ki módosított utoljára?"
Az audit log tartalmazza a módosításokat és a felhasználót.

### "Lehet több eseményt kezelni?"
Jelenleg egy eseményhez van optimalizálva. Több esemény kezelése fejlesztési javaslat.
