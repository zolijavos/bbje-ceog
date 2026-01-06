# CEO Gala 2026 - Vendég Folyamatok

## Dokumentum célja
Ez a dokumentum a CEO Gala regisztrációs rendszer vendég-oldali folyamatait mutatja be strukturált formában, optimalizálva NotebookLM és Napkin AI infografika generáláshoz.

---

## 1. VIP Vendég Útja (Ingyenes Jegy)

### Folyamat lépései

```
MEGHÍVÁS → REGISZTRÁCIÓ → JEGY → ESEMÉNY
```

| Lépés | Leírás | Ki csinálja | Eredmény |
|-------|--------|-------------|----------|
| 1. Meghívás | Admin felveszi a VIP listára | Admin | Email cím rögzítve |
| 2. Magic Link | Egyedi belépési link küldése emailben | Rendszer | Vendég kap linket |
| 3. Link kattintás | Vendég megnyitja a linket | Vendég | Bejelentkezés automatikus |
| 4. Adatok kitöltése | Név, telefonszám, cég, pozíció, étkezési igények | Vendég | Profil létrehozva |
| 5. GDPR elfogadás | Adatkezelési hozzájárulás | Vendég | Jogi megfelelés |
| 6. Lemondási feltételek | 48 órás lemondási szabály elfogadása | Vendég | Feltételek elfogadva |
| 7. QR jegy generálás | Egyedi QR kód létrehozása | Rendszer | Azonnal |
| 8. Jegy email | E-ticket küldése emailben | Rendszer | Vendég megkapja |
| 9. PWA belépés | Mobilos belépési kód: CEOG-XXXXXX | Rendszer | Offline jegy elérhető |
| 10. Esemény nap | QR kód bemutatása a bejáratnál | Vendég | Belépés |

### Időtartam
- Magic link érvényesség: 24 óra
- Regisztráció ideje: ~3 perc
- QR jegy: azonnal a regisztráció után

### Kulcs jellemzők
- **Ingyenes**: Nincs fizetési lépés
- **Gyors**: Minimális adminisztráció
- **Prémium**: VIP státusz és ültetés

---

## 2. Fizető Vendég Útja (Egyéni Jegy)

### Folyamat lépései

```
MEGHÍVÁS → REGISZTRÁCIÓ → SZÁMLÁZÁS → FIZETÉS → JEGY → ESEMÉNY
```

| Lépés | Leírás | Ki csinálja | Eredmény |
|-------|--------|-------------|----------|
| 1. Meghívás | Admin felveszi a vendég listára | Admin | Email rögzítve |
| 2. Magic Link | Egyedi link küldése | Rendszer | Vendég kap linket |
| 3. Link kattintás | Vendég megnyitja a linket | Vendég | Bejelentkezés |
| 4. Jegy típus választás | Egyéni (1 fő) kiválasztása | Vendég | Ár: 100.000 Ft |
| 5. Profil adatok | Név, telefonszám, cég, pozíció | Vendég | Profil létrehozva |
| 6. Számlázási adatok | Cégnév, adószám, cím | Vendég | Számla előkészítve |
| 7. Fizetési mód | Kártya VAGY banki átutalás | Vendég | Mód kiválasztva |

#### 7a. Kártyás fizetés útvonal
| Lépés | Leírás | Ki csinálja | Eredmény |
|-------|--------|-------------|----------|
| 8a. Stripe átirányítás | Biztonságos fizetési oldal | Rendszer | Átirányítás |
| 9a. Kártya megadása | Visa/Mastercard/Amex | Vendég | Fizetés |
| 10a. 3D Secure | Banki megerősítés | Vendég | Biztonság |
| 11a. Sikeres fizetés | Visszairányítás | Rendszer | Azonnal jóváhagyva |
| 12a. QR jegy | Azonnali generálás | Rendszer | Email küldés |

#### 7b. Banki átutalás útvonal
| Lépés | Leírás | Ki csinálja | Eredmény |
|-------|--------|-------------|----------|
| 8b. Bankszámla adatok | Számlaszám megjelenítése | Rendszer | Vendég lemásolja |
| 9b. Átutalás | Összeg utalása közleménnyel | Vendég | 1-3 munkanap |
| 10b. Beérkezés | Admin ellenőrzi a bankszámlát | Admin | Manuális |
| 11b. Jóváhagyás | Admin megerősíti a fizetést | Admin | Státusz: Fizetve |
| 12b. QR jegy | Jóváhagyás után generálás | Rendszer | Email küldés |

### Jegyár
- **Egyéni jegy**: 100.000 Ft
- **Tartalmaz**: Gála vacsora, italok, program

---

## 3. Fizető Vendég Útja (Páros Jegy)

### Folyamat lépései

```
MEGHÍVÁS → REGISZTRÁCIÓ → PARTNER ADATOK → SZÁMLÁZÁS → FIZETÉS → 2 JEGY → ESEMÉNY
```

| Lépés | Leírás | Ki csinálja | Eredmény |
|-------|--------|-------------|----------|
| 1-6. | Azonos az egyéni jegy folyamatával | - | - |
| 7. Partner adatok | Partner neve és email címe | Vendég | Partner rögzítve |
| 8. Partner profil | Automatikus létrehozás | Rendszer | Kétfős regisztráció |
| 9-12. | Fizetés (kártya vagy átutalás) | - | - |
| 13. Két QR jegy | Mindkét fél kap jegyet | Rendszer | 2 email |
| 14. Közös asztal | Automatikus páros ültetés | Rendszer | Egy asztalhoz |

### Jegyár
- **Páros jegy**: 180.000 Ft (2 főre)
- **Megtakarítás**: 20.000 Ft (vs. 2x egyéni)

### Különlegesség
- Partner automatikusan megkapja a saját belépési kódját
- Mindketten ugyanahhoz az asztalhoz kerülnek
- Partner is szerkesztheti a saját profilját

---

## 4. Jelentkező Útja (Nem Meghívott)

### Folyamat lépései

```
JELENTKEZÉS → ELBÍRÁLÁS → MEGHÍVÁS → REGISZTRÁCIÓ → FIZETÉS → JEGY
```

| Lépés | Leírás | Ki csinálja | Eredmény |
|-------|--------|-------------|----------|
| 1. Űrlap megnyitás | ceogala.hu/apply oldal | Jelentkező | Nyitott űrlap |
| 2. Adatok megadása | Név, email, cég, pozíció, motiváció | Jelentkező | Jelentkezés beküldve |
| 3. Admin értesítés | Új jelentkezésről értesítés | Rendszer | Admin tudja |
| 4. Elbírálás | Jelentkezés áttekintése | Admin | Döntés előkészítés |

#### 4a. Jóváhagyás útvonal
| Lépés | Leírás | Ki csinálja | Eredmény |
|-------|--------|-------------|----------|
| 5a. Jóváhagyás | "Approve" gomb | Admin | Státusz: Jóváhagyva |
| 6a. Magic Link | Regisztrációs link küldése | Rendszer | Email küldés |
| 7a+ | Folytatás a fizető vendég útján | - | Normál regisztráció |

#### 4b. Elutasítás útvonal
| Lépés | Leírás | Ki csinálja | Eredmény |
|-------|--------|-------------|----------|
| 5b. Elutasítás | "Reject" gomb + indoklás | Admin | Státusz: Elutasítva |
| 6b. Értesítés | Elutasító email az okkal | Rendszer | Jelentkező tudja |

### Elbírálási szempontok
- Céges háttér relevanciája
- Pozíció szintje (CEO, ügyvezető, tulajdonos)
- Korábbi részvétel
- Kapacitás korlátok

---

## 5. Esemény Napi Belépés

### Check-in Folyamat

```
MEGÉRKEZÉS → QR KÓD → SZKENNELÉS → BELÉPÉS
```

| Lépés | Leírás | Idő | Eredmény |
|-------|--------|-----|----------|
| 1. Érkezés | Vendég a bejárathoz érkezik | - | Sorban állás |
| 2. QR előkészítés | Telefon QR kód megjelenítése | 5 mp | Kód látható |
| 3. Szkennelés | Staff beolvassa a kódot | 2 mp | Ellenőrzés |
| 4. Zöld jelzés | Érvényes jegy visszajelzés | Azonnal | Név megjelenítése |
| 5. Asztal info | Asztalszám közlése | - | Vendég tudja hova menjen |
| 6. Belépés | Vendég bemegy a terembe | - | Check-in rögzítve |

### Színkódos visszajelzések

| Szín | Jelentés | Teendő |
|------|----------|--------|
| ZÖLD | Érvényes jegy | "Check In" gomb → Belépés |
| SÁRGA | Már belépett | Staff: Admin hívása / Admin: Override lehetőség |
| PIROS | Érvénytelen | Manuális keresés vagy Admin segítség |

### Dupla belépés kezelése
1. Sárga kártya jelenik meg
2. Eredeti belépés ideje látható
3. Eredeti beléptető staff neve
4. Csak Admin adhat Override-ot
5. Override ok megadása kötelező

---

## 6. PWA Alkalmazás Használata

### Belépés és funkciók

```
KÓD MEGADÁS → DASHBOARD → JEGY → PROFIL
```

| Funkció | Leírás | Online/Offline |
|---------|--------|----------------|
| Belépés | CEOG-XXXXXX kód megadása | Online |
| Dashboard | Esemény infó, visszaszámláló | Online |
| QR Jegy | Belépőjegy megjelenítése | OFFLINE IS |
| Profil | Adatok megtekintése/szerkesztése | Online |
| Asztal | Asztalszám és társak | Online |
| Galéria | Esemény fotók | Online |

### Offline működés
- QR jegy betöltés után offline is elérhető
- Service Worker automatikus gyorsítótárazás
- Újracsatlakozáskor szinkronizálás

---

## Összefoglaló Statisztikák

### Vendég típusok aránya (tipikus esemény)
- VIP vendégek: ~30%
- Fizető egyéni: ~40%
- Fizető páros: ~20%
- Jelentkezők: ~10%

### Fizetési módok aránya
- Kártyás (Stripe): ~70%
- Banki átutalás: ~30%

### Időzítések
- Magic link érvényesség: 24 óra
- Regisztrációs űrlap: 3-5 perc
- Kártyás fizetés: ~2 perc
- Banki átutalás feldolgozás: 1-3 munkanap
- Check-in egy vendég: ~10 másodperc
