# CEO Gala 2026 - Fizető Vendég Útja (Egyéni Jegy)

## Folyamat Összefoglaló

**Típus**: Fizető vendég (egyéni jegy, 1 fő)
**Jegyár**: 100.000 Ft
**Időtartam**: 5-10 perc (kártyás) vagy 1-3 nap (átutalás)

---

## Folyamat Vizuálisan

```
MEGHÍVÁS → MAGIC LINK → REGISZTRÁCIÓ → SZÁMLÁZÁS → FIZETÉS → QR JEGY
    │           │             │             │           │         │
    ▼           ▼             ▼             ▼           ▼         ▼
  Admin      Email        Adatok      Cég/Adószám   Stripe    Jegy
  hozzáad    24 óra       kitöltés    megadása      VAGY      email
                                                   Átutalás
```

---

## Lépések 1-6: Regisztráció

| # | Lépés | Ki végzi | Eredmény |
|---|-------|----------|----------|
| 1 | Admin hozzáadás | Admin | Vendég a listán |
| 2 | Magic Link küldés | Rendszer | Email elküldve |
| 3 | Link megnyitás | Vendég | Bejelentkezés |
| 4 | Jegy típus: Egyéni | Vendég | 100.000 Ft |
| 5 | Profil adatok | Vendég | Név, telefon, cég |
| 6 | GDPR elfogadás | Vendég | Hozzájárulás |

---

## Lépés 7: Számlázási Adatok

| Mező | Kötelező | Példa |
|------|----------|-------|
| Számlázási név | IGEN | ABC Kft. |
| Adószám | NEM | 12345678-2-42 |
| Irányítószám | IGEN | 1051 |
| Város | IGEN | Budapest |
| Utca, házszám | IGEN | Váci utca 1. |
| Ország | IGEN | Magyarország |

---

## Lépés 8: Fizetési Mód Választás

### 8A. KÁRTYÁS FIZETÉS (Stripe)

```
Stripe oldal → Kártya adatok → 3D Secure → Sikeres → AZONNAL QR JEGY
```

| Tulajdonság | Érték |
|-------------|-------|
| Idő | ~2 perc |
| Feldolgozás | Automatikus |
| QR jegy | Azonnal |
| Elfogadott kártyák | Visa, Mastercard, Amex |

### 8B. BANKI ÁTUTALÁS

```
Bankszámla adatok → Vendég utal → Admin ellenőriz → Jóváhagyás → QR JEGY
```

| Tulajdonság | Érték |
|-------------|-------|
| Idő | 1-3 munkanap |
| Feldolgozás | Manuális (Admin) |
| QR jegy | Jóváhagyás után |
| Közlemény | Név vagy email |

---

## Fizetési Útvonalak Összehasonlítása

| Szempont | Kártyás | Átutalás |
|----------|---------|----------|
| **Sebesség** | Azonnal | 1-3 munkanap |
| **Admin munka** | Nincs | Manuális jóváhagyás |
| **Biztonság** | 3D Secure | Banki |
| **Automatizáltság** | 100% | Manuális |
| **Népszerűség** | ~70% | ~30% |

---

## Jegy Tartalom

| Elem | Érték |
|------|-------|
| Jegyár | 100.000 Ft |
| Személyek | 1 fő |
| Vacsora | Benne |
| Italok | Benne |
| Program | Teljes gála |
