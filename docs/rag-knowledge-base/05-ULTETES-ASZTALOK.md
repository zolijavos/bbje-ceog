# CEO Gala - Ültetés és Asztalok Kezelése

## Asztalok áttekintése

### Asztal típusok
- **VIP asztal**: Kiemelt vendégeknek, általában a színpadhoz közelebb
- **Standard asztal**: Normál vendégeknek

### Asztal kapacitás
- Alapértelmezett: 10 fő/asztal
- Módosítható egyedileg

## Asztalok kezelése

### Hol találom?
Admin → Tables (Asztalok) menüpont

### Új asztal létrehozása
1. Kattints az "Add Table" gombra
2. Add meg:
   - **Név** (pl. "VIP 1" vagy "Asztal 5")
   - **Típus** (VIP/Standard)
   - **Kapacitás** (fő)
3. Mentés

### Asztal szerkesztése
1. Keresd meg az asztalt a listában
2. Kattints a ceruza ikonra
3. Módosítsd az adatokat
4. Mentés

### Asztal törlése
1. Kattints a kuka ikonra
2. Erősítsd meg
3. **Figyelem:** A hozzárendelt vendégek asztal nélkül maradnak!

## Ültetési rend (Seating)

### Hol találom?
Admin → Seating (Ültetés) menüpont

### Felület részei
- **Bal oldal**: Asztalok vizuális nézete (drag & drop terület)
- **Jobb oldal**: Még be nem ültetett vendégek listája

### Drag & Drop működés
1. Fogd meg a vendéget a jobb oldali listából
2. Húzd az asztalra a bal oldalon
3. Engedd el
4. A rendszer automatikusan menti

### Vendég áthelyezése másik asztalhoz
1. Fogd meg a vendéget az asztalon
2. Húzd a másik asztalra
3. Engedd el

### Vendég eltávolítása asztalról
1. Kattints a vendégre az asztalon
2. Kattints az "X" vagy "Remove" gombra
3. A vendég visszakerül a "be nem ültetett" listába

## Asztal kapacitás kezelése

### Kapacitás jelzések
- **Zöld**: Van még hely
- **Sárga**: 80% felett (közel tele)
- **Piros**: 100% (tele)

### Túlzsúfoltság kezelése
- A rendszer figyelmeztet, ha túl sok vendéget próbálsz ültetni
- Döntsd el: növeled a kapacitást vagy áthelyezel vendégeket

## Páros jegyek ültetése

### Automatikus kezelés
- Páros jegyes vendégek mindig együtt maradnak
- Ha az egyiket áthelyezed, a partner is vele megy

### Manuális szétválasztás
Nem ajánlott, de ha szükséges:
1. Szerkeszd az egyik vendéget
2. Távolítsd el a párosítást
3. Külön-külön ültetheted őket

## Ültetési preferenciák figyelése

### Hol látom?
- Vendég kártyán tooltip-ben
- Vendég részletei oldalon

### Mit adhatott meg a vendég?
- Konkrét személyek akikkel szeretne ülni
- Cégek képviselői akikkel szeretne találkozni
- Speciális kérések

### Hogyan vegyem figyelembe?
1. Olvasd el a preferenciákat
2. Keress rá a megnevezett személyekre
3. Próbáld őket egy asztalhoz ültetni

## VIP vendégek kezelése

### Ajánlott gyakorlat
1. VIP vendégeket VIP asztalokhoz ültess
2. Ügyelj a rangsor szerinti ültetésre
3. Kerüld a konkurens cégek egy asztalhoz ültetését

### VIP asztal jellemzői
- Színpad közelében
- Kiemelt hely a teremben
- Általában kisebb kapacitás (exkluzívabb)

## CSV import ültetéshez

### Tömeges asztal hozzárendelés
1. Készíts CSV fájlt:
   - `email` - vendég email
   - `table_name` - asztal neve
2. Admin → Seating → Import CSV
3. Töltsd fel a fájlt
4. Ellenőrizd az előnézetet
5. Erősítsd meg

### Mikor használd?
- Előre megtervezett ülésrend esetén
- Nagyszámú vendég gyors beültetéséhez
- Korábbi évek ülésrendjének átvételéhez

## Export funkciók

### Ültetési rend export
Admin → Seating → Export

**Formátumok:**
- **CSV**: Táblázatkezelőhöz (Excel)
- **PDF**: Nyomtatáshoz

**Tartalom:**
- Asztal neve
- Vendégek listája asztalonként
- Étkezési igények
- Megjegyzések

### Catering export
Speciális export az étkezési igényekkel:
- Asztal szerinti bontás
- Vendég neve + étkezési igény
- Összesítő (hány vegetáriánus, stb.)

## Terem elrendezés

### Pozíciók beállítása
Az asztalok pozícióját a vizuális nézetben tudod állítani:
1. Fogd meg az asztalt
2. Mozgasd a kívánt helyre
3. A pozíció automatikusan mentődik

### Tervezési tippek
- Hagyd ki a bejáratot és kijáratokat
- Jelöld a színpad helyét
- Gondolj a kiszolgálási útvonalakra

## Gyakori kérdések

### "Hogyan ültetek egy egész céget egy asztalhoz?"
1. Szűrj a vendéglistában cég szerint
2. Jelöld ki őket
3. Bulk action → Assign to table
4. Válaszd ki az asztalt

### "Mi van ha nem fér mindenki?"
1. Ellenőrizd a kapacitásokat
2. Adj hozzá új asztalt ha szükséges
3. Vagy növeld meg egy meglévő asztal kapacitását

### "Hogyan tudom kinyomtatni az ülésrendet?"
1. Seating → Export → PDF
2. Nyomtasd ki
3. Opcionálisan: készíts asztalkártyákat a nevekkel

### "A vendég kérte, hogy ne üljön valaki mellé"
1. Jegyzd fel a vendég megjegyzésébe
2. Ügyelj rá az ültetésnél
3. Más asztalhoz ültsd a "kerülendő" személyt

## Esemény napi teendők

### Ülésrend véglegesítése
- Zárd le a változtatásokat 24 órával az esemény előtt
- Nyomtasd ki a végleges listát
- Készíts asztalkártyákat

### Helyszíni változások
Ha mégis változtatni kell:
1. Admin felületen bármikor módosíthatsz
2. A vendég PWA-ja automatikusan frissül
3. Értesítsd a személyzetet

### Megjelenés nyomon követése
A check-in adatokból láthatod:
- Ki érkezett meg
- Melyik asztalnál van hely
- Átültetési lehetőségek
