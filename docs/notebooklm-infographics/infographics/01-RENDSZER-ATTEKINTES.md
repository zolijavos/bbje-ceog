# CEO Gala 2026 - Rendszer Áttekintés

## Mi a CEO Gala Regisztrációs Rendszer?

Komplett rendezvénykezelő platform VIP üzleti eseményekhez.

### Fő funkciók

| Funkció | Leírás |
|---------|--------|
| Vendég regisztráció | Meghívás, magic link, adatok kitöltése |
| Online fizetés | Stripe kártyás + banki átutalás |
| QR jegyrendszer | Egyedi QR kód minden vendégnek |
| Mobil check-in | QR szkennelés esemény napján |
| Ültetési rend | Drag & drop asztal kezelés |
| Email automatizálás | Magic link, jegy, emlékeztetők |

---

## Felhasználói Szerepkörök

| Szerepkör | Leírás | Fő feladatok |
|-----------|--------|--------------|
| **Admin** | Teljes hozzáférés | Vendégkezelés, elbírálás, fizetés, ültetés, email |
| **Staff** | Korlátozott | Csak check-in szkenner |
| **VIP vendég** | Meghívott, ingyenes | Regisztráció, részvétel |
| **Fizető vendég** | Meghívott, fizetős | Regisztráció, fizetés, részvétel |
| **Jelentkező** | Önjelentkezés | Jelentkezés, elbírálás, regisztráció |

---

## Vendég Típusok Összehasonlítás

| Tulajdonság | VIP | Egyéni jegy | Páros jegy | Jelentkező |
|-------------|-----|-------------|------------|------------|
| **Jegyár** | INGYENES | 100.000 Ft | 180.000 Ft (2 fő) | 100.000 Ft |
| **Meghívás** | Admin | Admin | Admin | Önjelentkezés |
| **Fizetés** | Nincs | Kártya/Átutalás | Kártya/Átutalás | Kártya/Átutalás |
| **QR jegy** | Azonnal | Fizetés után | 2 db fizetés után | Jóváhagyás + Fizetés |
| **Ültetés** | VIP asztal | Standard | Együtt (páros) | Standard |

---

## Rendszer Komponensek

```
┌─────────────────────────────────────────────────────────┐
│                    CEO GALA RENDSZER                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   VENDÉG     │  │    ADMIN     │  │    STAFF     │  │
│  │  REGISZTRÁCIÓ│  │  DASHBOARD   │  │   CHECK-IN   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                 │                 │           │
│         ▼                 ▼                 ▼           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              KÖZPONTI ADATBÁZIS                   │  │
│  │  Vendégek | Regisztrációk | Fizetések | Asztalok │  │
│  └──────────────────────────────────────────────────┘  │
│         │                 │                 │           │
│         ▼                 ▼                 ▼           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    STRIPE    │  │    EMAIL     │  │   QR KÓDOK   │  │
│  │   FIZETÉS    │  │   KÜLDÉS     │  │  GENERÁLÁS   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Kulcs Számok

| Mutató | Érték |
|--------|-------|
| Vendég kapacitás | 500+ fő |
| Asztalok | 50+ |
| Check-in idő/vendég | ~10 másodperc |
| Magic link érvényesség | 24 óra |
