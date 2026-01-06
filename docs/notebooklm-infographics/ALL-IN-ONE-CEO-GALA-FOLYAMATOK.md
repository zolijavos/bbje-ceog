# CEO Gala 2026 - Komplett Folyamat Dokumentáció

**Cél**: Egyetlen dokumentum infografika generáláshoz NotebookLM + Napkin AI használatával.

---

# I. RENDSZER ÁTTEKINTÉS

## Mi a CEO Gala Regisztrációs Rendszer?

Komplett rendezvénykezelő platform VIP üzleti eseményekhez:
- Vendégek meghívása és regisztrációja
- Online fizetés (Stripe) és banki átutalás
- QR kódos jegyrendszer
- Esemény napi check-in mobil szkennerrel
- Ültetési rend kezelése drag & drop felülettel
- Email kommunikáció automatizálása

## Felhasználói Szerepkörök

| Szerepkör | Leírás | Fő feladatok |
|-----------|--------|--------------|
| **Admin** | Teljes hozzáférés | Vendégkezelés, elbírálás, fizetés, ültetés, email |
| **Staff** | Korlátozott | Csak check-in szkenner |
| **VIP vendég** | Meghívott, ingyenes | Regisztráció, részvétel |
| **Fizető vendég** | Meghívott, fizetős | Regisztráció, fizetés, részvétel |
| **Jelentkező** | Önjelentkezés | Jelentkezés, elbírálás, regisztráció |

## Vendég Típusok Összehasonlítás

| Tulajdonság | VIP | Egyéni jegy | Páros jegy | Jelentkező |
|-------------|-----|-------------|------------|------------|
| Jegyár | INGYENES | 100.000 Ft | 180.000 Ft (2 fő) | 100.000 Ft |
| Meghívás | Admin | Admin | Admin | Önjelentkezés |
| Fizetés | Nincs | Kártya/Átutalás | Kártya/Átutalás | Kártya/Átutalás |
| QR jegy | Azonnal | Fizetés után | 2 db fizetés után | Jóváhagyás + Fizetés |
| Ültetés | VIP asztal | Standard | Együtt (páros) | Standard |

---

# II. VENDÉG FOLYAMATOK

## 1. VIP Vendég Útja

```
MEGHÍVÁS → MAGIC LINK → REGISZTRÁCIÓ → AZONNALI QR JEGY → ESEMÉNY
```

### Lépések részletesen:

1. **Admin hozzáadás**: Admin felveszi a VIP listára (email, név)
2. **Magic Link küldés**: Rendszer egyedi linket küld emailben
3. **Link megnyitás**: Vendég kattint → automatikus bejelentkezés
4. **Adatok kitöltése**: Név, telefon, cég, pozíció, étkezési igény (~3 perc)
5. **GDPR + lemondás elfogadása**: Jogi hozzájárulás
6. **QR jegy generálás**: AZONNAL megtörténik
7. **E-ticket email**: Vendég megkapja a jegyet
8. **PWA kód**: CEOG-XXXXXX belépési kód az alkalmazáshoz
9. **Esemény nap**: QR bemutatása → belépés

**Időzítés**: Magic link 24 óra érvényes, regisztráció ~3 perc, jegy azonnal.

---

## 2. Fizető Vendég Útja (Egyéni Jegy)

```
MEGHÍVÁS → MAGIC LINK → REGISZTRÁCIÓ → SZÁMLÁZÁS → FIZETÉS → QR JEGY
```

### Lépések 1-5: Azonos a VIP-pel

### Lépés 6: Jegy típus választás
- Egyéni jegy (1 fő): 100.000 Ft

### Lépés 7: Számlázási adatok
- Cégnév / Név
- Adószám (opcionális)
- Számlázási cím

### Lépés 8: Fizetési mód választás

#### 8a. KÁRTYÁS FIZETÉS (Stripe)
```
Stripe átirányítás → Kártya megadása → 3D Secure → Sikeres → AZONNAL QR jegy
```
- Idő: ~2 perc
- Automatikus folyamat
- Visa, Mastercard, Amex

#### 8b. BANKI ÁTUTALÁS
```
Bankszámla adatok → Vendég utal → Admin ellenőriz → Jóváhagyás → QR jegy
```
- Idő: 1-3 munkanap
- Manuális jóváhagyás szükséges
- Admin látja a "Pending" státuszt

---

## 3. Fizető Vendég Útja (Páros Jegy)

```
MEGHÍVÁS → REGISZTRÁCIÓ → PARTNER ADATOK → FIZETÉS → 2 DB QR JEGY
```

### Különbségek az egyéni jegytől:

- **Jegyár**: 180.000 Ft (2 főre) - 20.000 Ft megtakarítás
- **Partner adatok**: Név és email megadása kötelező
- **Két jegy**: Mindkét fél külön QR kódot kap
- **Közös ültetés**: Automatikusan egy asztalhoz kerülnek
- **Partner regisztráció**: Partner is kap PWA belépési kódot

---

## 4. Jelentkező Útja

```
JELENTKEZÉS → ELBÍRÁLÁS → [JÓVÁHAGYÁS → MAGIC LINK] VAGY [ELUTASÍTÁS]
```

### Jelentkezési űrlap (ceogala.hu/apply):
- Név
- Email
- Cég
- Pozíció
- Motiváció / Indoklás

### Admin elbírálás:
- Értesítés érkezik új jelentkezésről
- Admin → Applicants menüpont
- Áttekintés, döntés

### JÓVÁHAGYÁS ág:
```
Approve gomb → Magic Link küldés → Normál regisztráció (fizető vendég útja)
```

### ELUTASÍTÁS ág:
```
Reject gomb → Indoklás megadása → Elutasító email küldése
```

### Elbírálási szempontok:
| Pozitív | Negatív |
|---------|---------|
| CEO, Ügyvezető, Tulajdonos | Junior pozíció |
| Nagyvállalat, ismert márka | Nem releváns iparág |
| Korábbi részvétel | Kapacitás túllépés |

---

## 5. Esemény Napi Belépés

```
ÉRKEZÉS → QR ELŐKÉSZÍTÉS → SZKENNELÉS → VISSZAJELZÉS → BELÉPÉS
```

### Check-in folyamat:
1. Vendég érkezik a bejárathoz
2. Telefon QR kód megjelenítése (PWA-ból vagy emailből)
3. Staff szkenneli a kódot
4. Színkódos visszajelzés
5. Belépés vagy kezelés

### Színkódok:

| SZÍN | JELENTÉS | TEENDŐ |
|------|----------|--------|
| **ZÖLD** | Érvényes jegy | "Check In" gomb → Belépés |
| **SÁRGA** | Már belépett | Admin Override kell |
| **PIROS** | Érvénytelen | Manuális keresés |

### Zöld kártya tartalma:
- Vendég neve
- Jegy típusa (VIP/Egyéni/Páros)
- Asztalszám

### Sárga kártya tartalma:
- Vendég neve
- Első belépés időpontja
- Eredeti beléptető neve
- "Admin Override" gomb (csak Admin!)

### Piros kártya okai:
- Lejárt QR kód
- Hamis/módosított kód
- Törölt regisztráció
- Nem létező vendég

---

# III. SZERVEZŐI FOLYAMATOK

## 1. Esemény Előkészítés Timeline

| Időpont | Fázis | Fő feladatok |
|---------|-------|--------------|
| E-8 hét | Tervezés | Helyszín, dátum, kapacitás |
| E-7 hét | Vendéglista | VIP lista összeállítása |
| E-6 hét | Rendszer konfig | Asztalok, jegyárak beállítása |
| E-6 hét | VIP meghívás | Magic link küldés VIP-eknek |
| E-5 hét | Fizető meghívás | Magic link küldés fizetőknek |
| E-4 hét | Nyilvános | /apply oldal aktiválása |
| E-4 → E-1 hét | Regisztráció | Vendégek regisztrálnak |
| Folyamatos | Fizetés | Átutalások jóváhagyása |
| E-2 hét | Ültetés | Asztal hozzárendelések |
| E-1 hét | Véglegesítés | Listák, catering export |
| E-nap | Esemény | Check-in, beléptetés |
| E+1 hét | Utókövetés | Riportok, feedback |

---

## 2. Vendégkezelés

### CSV Import workflow:
```
Excel lista → CSV mentés (UTF-8) → Feltöltés → Validálás → Import → Magic link küldés
```

### CSV oszlopok:
| Oszlop | Kötelező | Példa |
|--------|----------|-------|
| email | IGEN | ceo@company.hu |
| name | IGEN | Kovács János |
| guest_type | IGEN | vip / paying_single / paying_paired |
| company | NEM | ABC Kft. |
| position | NEM | Ügyvezető |

### Manuális hozzáadás:
Admin → Guests → Add Guest → Adatok → Mentés → Magic Link

---

## 3. Fizetéskezelés

### Kártyás fizetés (automatikus):
```
Stripe → Webhook → Státusz → QR → Email
```
**Admin teendő**: NINCS - teljes mértékben automatikus

### Banki átutalás (manuális):
```
Vendég utal → Bank beérkezés → Admin ellenőrzés → Approve → QR → Email
```
**Admin teendő**:
1. Payments → Pending szűrő
2. Összeg és közlemény ellenőrzése
3. "Approve Payment" gomb
4. Vendég automatikusan megkapja a jegyet

---

## 4. Ültetési Rend

### Asztal létrehozás:
Admin → Tables → Add Table
- Név (pl. "VIP 1")
- Típus (VIP / Standard)
- Kapacitás (alapértelmezett: 10 fő)

### Drag & Drop ültetés:
Admin → Seating
- Bal oldal: Asztalok vizuális nézete
- Jobb oldal: Be nem ültetett vendégek
- Húzd a vendéget az asztalra → Automatikus mentés

### Kapacitás jelzések:
| Szín | Jelentés |
|------|----------|
| Zöld | Van hely |
| Sárga | 80%+ tele |
| Piros | Tele |

### Páros jegyek:
- Automatikusan együtt mozognak
- Mindig egy asztalhoz kerülnek

---

## 5. Esemény Nap

### Check-in előkészítés (E-1 nap):
- Staff fiókok ellenőrzése
- Szkenner teszt
- WiFi ellenőrzés helyszínen
- Vendéglista PDF export (backup)
- Tartalék eszközök

### Check-in pontok:
| Pont | Eszközök | Személyzet |
|------|----------|------------|
| Fő bejárat | 2-3 szkenner | 2-3 Staff |
| VIP bejárat | 1 szkenner | 1 Admin |
| Tartalék | 1 szkenner | Készenléti |

### Valós idejű monitoring:
Admin Dashboard mutatja:
- Belépettek száma
- Várt vendégek
- Check-in arány (%)
- Override-ok
- Utolsó belépések

---

# IV. ADMIN vs STAFF JOGOSULTSÁGOK

| Funkció | Admin | Staff |
|---------|-------|-------|
| Vendéglista kezelés | IGEN | NEM |
| CSV import | IGEN | NEM |
| Jelentkezők elbírálása | IGEN | NEM |
| Fizetés jóváhagyás | IGEN | NEM |
| Ültetési rend | IGEN | NEM |
| Email küldés | IGEN | NEM |
| Check-in szkenner | IGEN | IGEN |
| Check-in napló | IGEN | NEM |
| Dupla belépés override | IGEN | NEM |

**Staff bejelentkezés**: Automatikusan /checkin oldalra irányít

---

# V. ARCULATI IRÁNYELVEK INFOGRAFIKÁKHOZ

## Színpaletta

### Monokróm alap (90%):
| Szín | HEX | Használat |
|------|-----|-----------|
| Fehér | #FFFFFF | Háttér |
| Halvány szürke | #F5F5F5 | Másodlagos háttér |
| Sötétszürke | #4B5563 | Szövegtörzs |
| Charcoal | #1F2937 | Címsorok |

### Akcentus (10%):
| Szín | HEX | Használat |
|------|-----|-----------|
| **Teal** | #00A0A0 | Nyilak, linkek, kiemelés |
| **Arany** | #C4A24D | CSAK VIP elemekhez! |

### Státusz:
| Szín | HEX | Jelentés |
|------|-----|----------|
| Zöld | #059669 | Siker |
| Narancs | #D97706 | Várakozás |
| Piros | #DC2626 | Hiba |

## Stílus szabályok

| Elem | Szabály |
|------|---------|
| Formák | Szögletes (nincs border-radius!) |
| Címek | Serif betűtípus (elegáns) |
| Szöveg | Sans-serif (olvasható) |
| Ikonok | Vékony vonalú, egyszerű |
| Whitespace | Bőséges |
| VIP kiemelés | Arany szín, ALL CAPS |

## DO / DON'T

**DO**:
- Monokróm paletta
- Sok fehér tér
- Szögletes sarkok
- Elegáns, minimál design

**DON'T**:
- Élénk színek
- Lekerekített sarkok
- Túlzsúfolt elrendezés
- Arany általános kiemeléshez

---

# VI. NAPKIN AI PROMPT MINTÁK

## Folyamatábra prompt:
```
Készíts horizontális folyamatábrát a VIP vendég útjáról.
Lépések: Meghívás → Magic Link → Regisztráció → QR Jegy → Esemény
Stílus: Monokróm, teal (#00A0A0) nyilak, szögletes formák, elegáns.
```

## Összehasonlító tábla prompt:
```
Készíts 4 oszlopos összehasonlító infografikát a vendég típusokról.
Oszlopok: VIP, Egyéni jegy, Páros jegy, Jelentkező.
Sorok: Jegyár, Fizetés, QR jegy időzítése, Ültetés.
Stílus: Charcoal fejléc, fehér sorok, arany keret a VIP oszlopnál.
```

## Check-in színkódok prompt:
```
Készíts 3 oszlopos infografikát a check-in visszajelzésekről.
1. ZÖLD: Érvényes jegy → Check In gomb
2. SÁRGA: Már belépett → Admin Override
3. PIROS: Érvénytelen → Manuális keresés
Stílus: Színkódolt fejlécek, egyszerű ikonok, fehér háttér.
```

## Timeline prompt:
```
Készíts vertikális timeline-t az esemény előkészítésről.
8 hét: Tervezés → 7 hét: Vendéglista → 6 hét: VIP meghívás → ...
Stílus: Teal középső vonal, időpontok bal oldalon serif betűvel.
```

---

# VII. STATISZTIKÁK (Tipikus Esemény)

## Vendég összetétel:
- VIP vendégek: ~30%
- Fizető egyéni: ~40%
- Fizető páros: ~20%
- Jelentkezők: ~10%

## Fizetési módok:
- Kártyás (Stripe): ~70%
- Banki átutalás: ~30%

## Időzítések:
- Magic link érvényesség: 24 óra
- Regisztráció: 3-5 perc
- Kártyás fizetés: ~2 perc
- Banki átutalás: 1-3 munkanap
- Check-in vendégenként: ~10 másodperc

## Check-in arány:
- Tipikus megjelenés: 92-96%
- No-show: 4-8%
- Override arány: <2%

---

**Dokumentum vége**

*Verzió: 1.0 | Dátum: 2025-12-20 | Szerző: MyForge Labs*
