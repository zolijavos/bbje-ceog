# CEO Gala 2026 - Ültetési Rend Kezelés

## Áttekintés

Az ültetési rend kezelése drag & drop felületen történik.

---

## Asztal Típusok

| Típus | Jellemző | Elhelyezés |
|-------|----------|------------|
| **VIP asztal** | Kiemelt vendégek | Színpad közelében |
| **Standard asztal** | Normál vendégek | Terem többi része |

---

## Asztal Létrehozás

### Lépések

```
Admin → Tables → Add Table → Adatok → Mentés
```

### Asztal Tulajdonságok

| Tulajdonság | Opciók | Alapértelmezett |
|-------------|--------|-----------------|
| Név | Szabadon | "Asztal 1" |
| Típus | VIP / Standard | Standard |
| Kapacitás | 4-12 fő | 10 fő |
| Pozíció | X, Y koordináta | Drag & drop |

---

## Drag & Drop Ültetés

### Felület Felépítés

```
┌─────────────────────────────────────────────────────────┐
│                    SEATING OLDAL                         │
├─────────────────────────────┬───────────────────────────┤
│                             │                           │
│     ASZTALOK VIZUÁLIS       │    BE NEM ÜLTETETT       │
│         NÉZETE              │       VENDÉGEK           │
│                             │                           │
│    ┌─────┐    ┌─────┐      │    □ Kovács János        │
│    │VIP 1│    │VIP 2│      │    □ Nagy Mária          │
│    └─────┘    └─────┘      │    □ Kiss Péter          │
│                             │    □ Szabó Anna          │
│    ┌─────┐    ┌─────┐      │    □ Tóth László         │
│    │  3  │    │  4  │      │         ...              │
│    └─────┘    └─────┘      │                           │
│                             │                           │
└─────────────────────────────┴───────────────────────────┘
```

### Műveletek

| Művelet | Hogyan | Eredmény |
|---------|--------|----------|
| **Beültetés** | Vendég húzása asztalra | Hely foglalva |
| **Áthelyezés** | Asztalról másik asztalra | Új hely |
| **Eltávolítás** | X gomb az asztalon | Vissza a listára |

---

## Kapacitás Jelzések

| Szín | Jelentés | Teendő |
|------|----------|--------|
| **Zöld** | Van hely | Ültethető |
| **Sárga** | 80%+ betöltve | Figyelj a kapacitásra |
| **Piros** | Tele (100%) | Válassz másik asztalt |

---

## Páros Jegyek Kezelése

### Automatikus Szabályok

| Szabály | Működés |
|---------|---------|
| Együtt mozognak | Ha egyiket mozgatod, a másik is megy |
| Egy asztalhoz | Mindig ugyanarra az asztalra kerülnek |
| Közös törlés | Ha egyiket törlöd, mindkettő kikerül |

### Szétválasztás (nem ajánlott)

```
Vendég szerkesztése → Párosítás törlése → Külön ültethetők
```

---

## CSV Import Ültetéshez

### Tömeges Asztal Hozzárendelés

```
Excel táblázat → CSV mentés → Admin feltöltés → Alkalmazás
```

### CSV Formátum

| email | table_name |
|-------|------------|
| ceo@company.hu | VIP 1 |
| partner@company.hu | VIP 1 |
| guest@other.hu | Asztal 5 |

---

## Ültetési Preferenciák

### Vendég Megadhat

| Preferencia | Példa |
|-------------|-------|
| Konkrét személy | "XY mellett szeretnék ülni" |
| Cég képviselő | "ABC Kft. képviselőivel" |
| Speciális kérés | "Színpadhoz közel" |

### Admin Figyelembe Veszi

```
1. Olvasd el a preferenciákat (tooltip)
2. Keress rá a megnevezett személyre
3. Ültess őket egy asztalhoz
```

---

## VIP Ültetési Irányelvek

| Irányelv | Részlet |
|----------|---------|
| VIP → VIP asztal | Kiemelt vendégek VIP asztalhoz |
| Rangsor | Figyelj a pozíciókra |
| Konkurensek | Kerüld egy asztalhoz |
| Színpad közelség | VIP asztalok elöl |

---

## Exportálás

### Ültetési Rend Export

| Formátum | Használat |
|----------|-----------|
| CSV | Excel feldolgozás |
| PDF | Nyomtatás |

### Export Tartalom

| Adat | Benne van |
|------|-----------|
| Asztal neve | IGEN |
| Vendégek neve | IGEN |
| Étkezési igény | IGEN |
| Megjegyzések | IGEN |
