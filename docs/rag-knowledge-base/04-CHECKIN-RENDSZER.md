# CEO Gala - Check-in Rendszer

## Áttekintés

A check-in rendszer lehetővé teszi a vendégek gyors és biztonságos beengedését az eseményre QR kód alapján.

## Check-in szkenner elérése

### URL
`/checkin` vagy a mobil menüből "QR Scanner"

### Ki használhatja?
- Admin felhasználók
- Staff felhasználók

### Ajánlott eszköz
- Okostelefon hátsó kamerával
- Jó fényviszonyok
- Stabil internet

## QR kód szkennelés

### Hogyan működik?
1. Nyisd meg a `/checkin` oldalt
2. Engedélyezd a kamera hozzáférést
3. Tartsd a QR kódot a kamera elé
4. A rendszer automatikusan beolvassa

### Szkennelés tippek
- Tartsd stabil kézzel a telefont
- A QR kód legyen jól megvilágítva
- Ne legyen túl közel vagy túl távol
- Tiszta képernyő a vendég telefonján

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

**Megjelenő információk:**
- Vendég neve
- Első belépés időpontja
- Ki engedte be (staff neve)

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

**Teendő:**
- Ellenőrizd a vendég adatait manuálisan
- Keress rá a nevére a rendszerben
- Szükség esetén admin segítség

## Admin Override

### Mi ez?
Lehetőség duplikált belépés engedélyezésére speciális esetekben.

### Mikor használd?
- Vendég tévedésből újra szkennelt
- Technikai hiba volt az első beléptetnésnél
- Vendég kiment és vissza szeretne jönni

### Hogyan?
1. Sárga kártya megjelenésekor
2. Kattints az "Admin Override" gombra
3. Add meg az override okát
4. Vendég beléptetése

**Fontos:** Csak admin felhasználó használhatja!

## Manuális keresés

### Mikor használd?
- QR kód nem olvasható
- Vendég nem hozta a telefonját
- Technikai probléma

### Hogyan?
1. Check-in oldalon kattints a "Manual Search" gombra
2. Írd be a vendég nevét vagy emailjét
3. Válaszd ki a vendéget a találatokból
4. Ellenőrizd a személyazonosságot
5. Kattints a "Check In" gombra

## Check-in napló

### Hol találom?
Admin → Check-in Log

### Mit látok?
- Összes belépés listája
- Időrendben (legújabb elől)
- Vendég neve, időpont, beléptető neve
- Override jelölés (ha volt)

### Szűrési lehetőségek
- Dátum/időszak
- Beléptető személy
- Override-ok szűrése

### Export
- CSV formátumban letölthető
- Tartalmazza az összes belépési adatot

## Gyakori problémák

### "A kamera nem működik"
1. Ellenőrizd a böngésző engedélyeket
2. Engedélyezd a kamera hozzáférést
3. Próbáld másik böngészővel (Chrome ajánlott)
4. Ellenőrizd, hogy nincs-e más app ami használja a kamerát

### "A QR kód nem olvasható"
1. Kérd meg a vendéget, hogy növelje a fényerőt
2. Tisztítsa meg a képernyőt
3. Próbáld más szögből
4. Használd a manuális keresést

### "Nincs internet"
1. A check-in NEM működik offline
2. Kapcsolódj WiFi-hez vagy mobilnetre
3. Várj amíg helyreáll a kapcsolat

### "Érvénytelen QR kód hibaüzenet"
1. Ellenőrizd, hogy a vendég a saját QR kódját mutatja-e
2. Lehet, hogy screenshot egy régi kódról
3. Keress rá manuálisan a vendégre

## Best Practices

### Esemény előtt
1. Teszteld a szkennert előre
2. Győződj meg róla, hogy van tartalék eszköz
3. Ellenőrizd az internet kapcsolatot a helyszínen
4. Briefeld a staff-ot a folyamatról

### Esemény közben
1. Tartsd kéznél egy admin elérhetőségét override-hoz
2. Ha sorban állás van, nyiss több check-in pontot
3. Legyen kéznél a manuális lista (PDF export) vészhelyzetre

### Esemény után
1. Ellenőrizd a check-in naplót
2. Exportáld az adatokat
3. Nézd át az override-okat

## Statisztikák

### Dashboard-on látható
- Bejelentkezett vendégek száma
- Még várt vendégek száma
- Check-in arány (%)
- Utolsó belépések

### Valós idejű frissülés
Az admin dashboard mutatja:
- Élő check-in számláló
- Belépések idővonala
- Kategóriánkénti bontás (VIP/Fizető)
