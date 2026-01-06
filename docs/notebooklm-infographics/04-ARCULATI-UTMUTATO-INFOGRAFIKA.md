# CEO Gala 2026 - Arculati Útmutató Infografikákhoz

## Dokumentum célja
Ez a dokumentum a CEO Gala arculati irányelveit tartalmazza, kifejezetten infografikák készítéséhez optimalizálva.

---

## Az Arculat Lényege

### Hangulat és érzés
A CEO Gala egy **exkluzív, prémium üzleti rendezvény** Magyarország legbefolyásosabb üzleti vezetői számára. Az arculatnak ezt a presztízst kell tükröznie:

| Jellemző | Igen | Nem |
|----------|------|-----|
| Elegancia | Klasszikus, időtlen | Trendi, divatos |
| Színvilág | Visszafogott, monokróm | Élénk, vibráló |
| Formák | Szögletes, geometrikus | Lekerekített, organikus |
| Tipográfia | Serif címek, tiszta szöveg | Játékos, kézírásos |
| Részletek | Minimális, célzott | Túlzsúfolt, kaotikus |

### Inspirációs kulcsszavak
```
ELEGANCIA • PRESZTÍZS • MINŐSÉG • EXKLUZIVITÁS
PROFESSZIONALIZMUS • KLASSZIKUS • PRÉMIUM • VIP
```

---

## Színpaletta

### Alap monokróm skála

| Szín | HEX | RGB | Használat |
|------|-----|-----|-----------|
| Tiszta fehér | #FFFFFF | 255, 255, 255 | Háttér, whitespace |
| Halvány szürke | #F5F5F5 | 245, 245, 245 | Másodlagos háttér |
| Közép szürke | #9CA3AF | 156, 163, 175 | Szegélyek, elválasztók |
| Sötét szürke | #4B5563 | 75, 85, 99 | Szövegtörzs |
| Charcoal | #1F2937 | 31, 41, 55 | Címsorok, fejlécek |
| Szurokfekete | #111827 | 17, 24, 39 | Erős kiemelés |

### Akcentus színek (MINIMÁLIS használat!)

| Szín | HEX | RGB | Mikor használd |
|------|-----|-----|----------------|
| **Teal** | #00A0A0 | 0, 160, 160 | Nyilak, linkek, CTA, kiemelés |
| Teal sötét | #008585 | 0, 133, 133 | Hover állapot |
| **Arany** | #C4A24D | 196, 162, 77 | VIP jelölés, díjak |
| Arany sötét | #B8923D | 184, 146, 61 | Hover állapot |

### Státusz színek

| Szín | HEX | Jelentés |
|------|-----|----------|
| Smaragd | #059669 | Siker, jóváhagyva |
| Borostyán | #D97706 | Várakozás, figyelem |
| Rubint | #DC2626 | Hiba, elutasítva |
| Zafír | #2563EB | Információ |

### Arány szabály
```
MONOKRÓM: 90%
TEAL AKCENTUS: 8%
ARANY (csak VIP): 2%
```

---

## Tipográfia

### Címsorok
- **Stílus**: Serif (Playfair Display jellegű)
- **Karakter**: Elegáns, klasszikus
- **Használat**: Fő címek, szekció címek

### Szövegtörzs
- **Stílus**: Sans-serif (Open Sans jellegű)
- **Karakter**: Olvasható, tiszta
- **Használat**: Leírások, magyarázatok, részletek

### Kiemelések
- **ALL CAPS**: VIP elemek, kategória nevek
- **Bold**: Kulcs információk
- **Teal szín**: Interaktív elemek jelölése

### Hierarchia
```
H1: 32-40px, Serif, Bold, Charcoal
H2: 24-28px, Serif, SemiBold, Charcoal
H3: 18-20px, Sans-serif, SemiBold, Sötétszürke
Body: 14-16px, Sans-serif, Regular, Sötétszürke
Caption: 12px, Sans-serif, Regular, Középszürke
```

---

## Formák és Geometria

### Alapszabályok

| Elem | Forma | Indoklás |
|------|-------|----------|
| Kártyák | Szögletes sarok | Formális, professzionális |
| Gombok | Szögletes sarok | Konzisztens design |
| Ikonok | Egyszerű, vékony vonalú | Elegáns, nem tolakodó |
| Nyilak | Egyenes, geometrikus | Tiszta irány |
| Avatárok | KÖR alakú | Egyetlen kivétel - humán elem |

### Border-radius
```css
/* MINDEN ELEM */
border-radius: 0;

/* EGYETLEN KIVÉTEL: Profilképek */
border-radius: 50%; /* Tökéletes kör */
```

### Ikonok
- **Stílus**: Vékony vonalú (line icons)
- **Súly**: Light (nem bold, nem filled)
- **Szín**: Alapból sötétszürke, kiemeléskor teal
- **Referencia**: Phosphor Icons vagy hasonló

---

## Elrendezési Elvek

### Whitespace
A fehér tér (üres terület) a design egyik legfontosabb eleme. Használj bőségesen!

| Elem | Minimális térköz |
|------|------------------|
| Szekcók között | 32-48px |
| Kártyák között | 16-24px |
| Szöveg sorok | 1.5-1.75 sortávolság |
| Padding | 16-24px |

### Grid rendszer
- **Oszlopok**: 12 oszlopos grid
- **Igazítás**: Minden elem gridhez igazodik
- **Margók**: Konzisztens bal és jobb margó

### Vizuális hierarchia
```
1. CÍM (legnagyobb, serif)
2. SZEKCIÓ CÍMEK (közepes, serif)
3. KÁRTYÁK (dobozok csoportosításhoz)
4. TARTALOM (legkisebb, sans-serif)
5. LÁBJEGYZET (caption méret)
```

---

## Infografika Típusok Stílusa

### 1. Folyamatábra (Process Flow)
```
STÍLUS:
- Horizontális vagy vertikális elrendezés
- Teal nyilak a lépések között
- Szürke háttérű lépés dobozok
- Számozott lépések (1, 2, 3...)
- Ikonok minden lépésnél
- Fehér háttér
```

### 2. Összehasonlító táblázat (Comparison)
```
STÍLUS:
- Oszlopos elrendezés
- Fejléc: charcoal háttér, fehér szöveg
- Sorok: alternatív fehér/halvány szürke
- Pipák: teal szín
- X-ek: halvány szürke vagy piros
- VIP oszlop: arany keret
```

### 3. Döntési fa (Decision Tree)
```
STÍLUS:
- Fentről lefelé folyam
- Elágazási pontok: rombusz alakú
- Igen/Nem ágak: zöld/piros nyilak
- Végpontok: lekerekített téglalap
- Kérdések: charcoal dobozban
```

### 4. Timeline (Idővonal)
```
STÍLUS:
- Vertikális vonal középen: teal
- Időpontok: bal oldalon, serif
- Események: jobb oldalon, kártya stílusban
- Pont markerek: teal körök
- Aktuális pont: nagyobb, arany
```

### 5. Dashboard (Mutatók)
```
STÍLUS:
- Kártyás elrendezés
- Nagy számok: charcoal, bold
- Címkék: szürke, kis méret
- Diagramok: teal és szürke árnyalatok
- Háttér: lehet sötét (charcoal) is
```

### 6. Mátrix (Grid)
```
STÍLUS:
- Táblázat formátum
- Fejléc sor és oszlop: charcoal
- Adatcellák: fehér/halvány szürke
- Kiemelések: teal háttér
- Szegélyek: vékony, szürke
```

---

## VIP Elemek Kezelése

### Arany kiemelés szabályok
Az arany (#C4A24D) szín **exkluzív** a VIP elemeknek.

**HASZNÁLD:**
- VIP vendég badge
- VIP asztal jelölés
- Arany keret VIP kártyáknál
- "VIP" felirat

**NE HASZNÁLD:**
- Általános kiemeléshez
- Nyilakhoz
- Gombokhoz
- Szöveghez

### VIP vs Standard vizuális különbség

| Elem | Standard | VIP |
|------|----------|-----|
| Keret szín | Szürke | Arany |
| Badge | Teal | Arany |
| Ikon | Szürke | Arany |
| Betűstílus | Normal | ALL CAPS + Bold |

---

## Praktikus Tippek

### DO - Csináld
1. Használj sok fehér teret
2. Tartsd egyszerűnek a színhasználatot
3. Igazíts mindent gridhez
4. Használj konzisztens térközöket
5. Tedd világossá a vizuális hierarchiát
6. Tedd szögletessé az elemeket

### DON'T - Kerüld
1. Ne használj 3-nál több színt
2. Ne lekerekíts sarkokat (kivéve avatar)
3. Ne zsúfold tele a teret
4. Ne használj árnyékokat sokat
5. Ne keverd a serif és sans-serif-et egy mondaton belül
6. Ne tedd az aranyat általános kiemelésnek

### Ellenőrzőlista minden infografikához
```
□ Monokróm alap (90%+)
□ Teal csak kiemeléshez
□ Arany csak VIP-hez
□ Szögletes sarkok
□ Elegendő whitespace
□ Tiszta hierarchia
□ Konzisztens térközök
□ Olvasható betűméret
□ Egyszerű ikonok
```

---

## Technikai Specifikációk

### Export formátumok
| Formátum | Használat |
|----------|-----------|
| PNG | Prezentációk, dokumentumok |
| SVG | Web, skálázható grafika |
| PDF | Nyomtatás |

### Méretek
| Felület | Ajánlott méret |
|---------|----------------|
| Prezentáció | 1920x1080px |
| Dokumentum | 1200x800px |
| Social media | 1200x630px |
| Nyomtatás | 300 DPI |

### Betűméret minimum
- Prezentáció: 18px
- Dokumentum: 12px
- Apróbetű: 10px

---

## Összefoglaló

A CEO Gala infografikák sikerének kulcsa:

```
ELEGANCIA + MINIMALIZMUS + KONZISZTENCIA = PRÉMIUM MEGJELENÉS
```

**Színek**: Főleg fekete-fehér-szürke, teal akcentus, arany csak VIP-nek
**Formák**: Szögletes, geometrikus, tiszta vonalak
**Tipográfia**: Serif címek, sans-serif szöveg
**Elrendezés**: Bőséges whitespace, grid-alapú igazítás
**Hangulat**: Professzionális, elegáns, exkluzív
