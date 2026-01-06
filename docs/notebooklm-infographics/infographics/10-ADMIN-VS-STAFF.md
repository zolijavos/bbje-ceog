# CEO Gala 2026 - Admin vs Staff Jogosultságok

## Szerepkörök Áttekintése

| Szerepkör | Leírás | Belépés után |
|-----------|--------|--------------|
| **Admin** | Teljes hozzáférés | Admin Dashboard |
| **Staff** | Csak check-in | Automatikusan /checkin |

---

## Jogosultsági Mátrix

| Funkció | Admin | Staff |
|---------|:-----:|:-----:|
| **Vendégkezelés** | | |
| Vendéglista megtekintés | ✓ | ✗ |
| Vendég hozzáadás | ✓ | ✗ |
| Vendég szerkesztés | ✓ | ✗ |
| Vendég törlés | ✓ | ✗ |
| CSV import | ✓ | ✗ |
| **Jelentkezők** | | |
| Jelentkezők listája | ✓ | ✗ |
| Jóváhagyás (Approve) | ✓ | ✗ |
| Elutasítás (Reject) | ✓ | ✗ |
| **Fizetések** | | |
| Fizetések megtekintése | ✓ | ✗ |
| Átutalás jóváhagyás | ✓ | ✗ |
| **Ültetés** | | |
| Asztalok kezelése | ✓ | ✗ |
| Drag & drop ültetés | ✓ | ✗ |
| Ülésrend export | ✓ | ✗ |
| **Kommunikáció** | | |
| Email küldés | ✓ | ✗ |
| Email sablonok | ✓ | ✗ |
| **Check-in** | | |
| QR szkenner | ✓ | ✓ |
| Check-in log | ✓ | ✗ |
| Dupla belépés override | ✓ | ✗ |

---

## Admin Szerepkör

### Teljes Hozzáférés

```
┌─────────────────────────────────────────────┐
│              ADMIN DASHBOARD                 │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ Vendégek│  │ Asztalok│  │ Fizetés │     │
│  └─────────┘  └─────────┘  └─────────┘     │
│                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ Ültetés │  │  Email  │  │Check-in │     │
│  └─────────┘  └─────────┘  └─────────┘     │
│                                              │
│  ┌─────────┐  ┌─────────┐                   │
│  │Jelentk. │  │ Riportok│                   │
│  └─────────┘  └─────────┘                   │
│                                              │
└─────────────────────────────────────────────┘
```

### Admin Fő Feladatok

| Feladat | Mikor |
|---------|-------|
| Vendégek importálása | Előkészítés |
| Magic link küldés | Előkészítés |
| Jelentkezők elbírálása | Folyamatosan |
| Átutalások jóváhagyása | Folyamatosan |
| Ültetési rend | E-2 hét |
| Check-in override | Esemény nap |

---

## Staff Szerepkör

### Korlátozott Hozzáférés

```
┌─────────────────────────────────────────────┐
│              STAFF BELÉPÉS                   │
├─────────────────────────────────────────────┤
│                                              │
│         Automatikus átirányítás              │
│                    ↓                         │
│           ┌─────────────┐                   │
│           │  QR SCANNER │                   │
│           │   /checkin  │                   │
│           └─────────────┘                   │
│                                              │
│         Nincs admin menü elérés              │
│                                              │
└─────────────────────────────────────────────┘
```

### Staff Korlátozások

| Korlát | Részlet |
|--------|---------|
| Nincs admin menü | Nem látja a navigációt |
| Csak /checkin | Automatikus átirányítás |
| Nincs override | Dupla belépésnél Admin kell |
| Nincs vendéglista | Nem kereshet vendégeket |

### Staff Teendői Esemény Napján

| Teendő | Jogosult |
|--------|----------|
| QR szkennelés | IGEN |
| Zöld: Check In | IGEN |
| Sárga: Override | NEM - Admin hívás |
| Piros: Manuális keresés | KORLÁTOZOTT |

---

## Override Szabályok

### Mikor Kell Override?

| Helyzet | Színkód |
|---------|---------|
| Dupla szkennelés | SÁRGA |
| Vendég visszajött | SÁRGA |
| Technikai hiba | SÁRGA |

### Ki Végezhet Override-ot?

| Szerepkör | Override |
|-----------|----------|
| Admin | IGEN |
| Staff | NEM |

### Override Folyamat

```
Staff: Sárga kártya → NEM nyom Override-ot → Admin hívása
Admin: Sárga kártya → "Admin Override" gomb → Ok megadása → Belépés
```

---

## Összefoglaló

| | Admin | Staff |
|-|-------|-------|
| **Cél** | Teljes rendszer kezelés | Csak beléptetés |
| **Menük** | Összes | Nincs |
| **Check-in** | Teljes | Alapszintű |
| **Override** | Igen | Nem |
| **Bejelentkezés után** | Dashboard | /checkin |
