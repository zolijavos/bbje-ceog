# CEO Gala 2026 - Check-in Színkódok

## Áttekintés

A check-in rendszer három színkóddal jelzi a QR szkennelés eredményét.

---

## Színkódok Összefoglaló

| SZÍN | JELENTÉS | TEENDŐ |
|------|----------|--------|
| **ZÖLD** | Érvényes jegy | Check In gomb → Belépés |
| **SÁRGA** | Már belépett | Admin Override szükséges |
| **PIROS** | Érvénytelen | Manuális keresés |

---

## ZÖLD KÁRTYA - Érvényes Jegy

### Mit jelent?
A vendég beléphet, minden rendben.

### Megjelenő információk:
| Adat | Példa |
|------|-------|
| Vendég neve | Kovács János |
| Jegy típusa | VIP / Egyéni / Páros |
| Asztalszám | Asztal 5 |

### Teendő:
```
"Check In" gomb megnyomása → Belépés rögzítve → Vendég bemehet
```

---

## SÁRGA KÁRTYA - Már Belépett

### Mit jelent?
Ez a QR kód már egyszer be lett olvasva.

### Megjelenő információk:
| Adat | Példa |
|------|-------|
| Vendég neve | Kovács János |
| Első belépés időpontja | 18:45 |
| Beléptető neve | Nagy Péter (Staff) |

### Teendő Staff-nak:
```
NEM engedheti be → Admin hívása szükséges
```

### Teendő Admin-nak:
```
"Admin Override" gomb → Ok megadása → Belépés engedélyezése
```

### Override okok:
| Ok | Mikor használd |
|----|----------------|
| Téves szkennelés | Vendég véletlenül újra szkennelt |
| Technikai hiba | Első check-in nem rögzült |
| Visszajött | Vendég kiment és visszajön |

---

## PIROS KÁRTYA - Érvénytelen

### Mit jelent?
A QR kód nem érvényes, a vendég NEM léphet be.

### Lehetséges okok:
| Ok | Magyarázat |
|----|------------|
| Lejárt QR kód | 48 órán túl az esemény után |
| Hamis kód | Módosított vagy hamisított |
| Törölt regisztráció | Vendég lemondta |
| Nem létező vendég | Nincs ilyen a rendszerben |

### Teendő:
```
Manuális keresés vendég nevére → Admin segítség kérése
```

---

## Ki Mit Tehet?

| Művelet | Staff | Admin |
|---------|-------|-------|
| Zöld: Check In | IGEN | IGEN |
| Sárga: Override | NEM | IGEN |
| Piros: Manuális keresés | IGEN | IGEN |
| Piros: Új jegy kiállítás | NEM | IGEN |

---

## Check-in Folyamat

```
1. Vendég mutatja QR kódot
          │
          ▼
2. Staff szkenneli
          │
          ▼
3. Színkód megjelenik
          │
    ┌─────┼─────┐
    │     │     │
    ▼     ▼     ▼
  ZÖLD  SÁRGA  PIROS
    │     │     │
    ▼     ▼     ▼
 Belépés Admin  Manuális
  OK    Override keresés
```

---

## Tippek Staff-nak

| Tipp | Részlet |
|------|---------|
| Fényerő | Kérd meg a vendéget, növelje a telefon fényerejét |
| Tisztaság | Tiszta képernyő = jobb olvasás |
| Távolság | Ne legyen túl közel vagy távol |
| Szög | Egyenesen tartsd a szkennert |
| Backup | Ha nem megy: manuális keresés |
