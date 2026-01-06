# CEO Gala 2026 - VIP Vendég Útja

## Folyamat Összefoglaló

**Típus**: VIP vendég (meghívott, ingyenes jegy)
**Időtartam**: ~3 perc regisztráció
**Eredmény**: Azonnali QR jegy

---

## Folyamat Vizuálisan

```
MEGHÍVÁS → MAGIC LINK → REGISZTRÁCIÓ → AZONNALI QR JEGY → ESEMÉNY
    │           │             │                │              │
    ▼           ▼             ▼                ▼              ▼
  Admin     24 órán       Adatok          Automatikus      Belépés
  hozzáad   belül katt.   kitöltése       generálás        QR-rel
```

---

## Lépések Részletesen

| # | Lépés | Ki végzi | Idő | Eredmény |
|---|-------|----------|-----|----------|
| 1 | Admin hozzáadás | Admin | 1 perc | Vendég a rendszerben |
| 2 | Magic Link küldés | Rendszer | Azonnal | Email elküldve |
| 3 | Link megnyitás | Vendég | - | Automatikus bejelentkezés |
| 4 | Adatok kitöltése | Vendég | 2-3 perc | Profil létrehozva |
| 5 | GDPR elfogadás | Vendég | 10 mp | Jogi hozzájárulás |
| 6 | QR jegy generálás | Rendszer | Azonnal | Jegy kész |
| 7 | E-ticket email | Rendszer | <1 perc | Vendég megkapja |
| 8 | PWA kód | Rendszer | Azonnal | CEOG-XXXXXX |
| 9 | Esemény belépés | Vendég | 10 mp | Check-in sikeres |

---

## Kitöltendő Adatok

| Mező | Kötelező | Példa |
|------|----------|-------|
| Teljes név | IGEN | Kovács János |
| Email | IGEN | kovacs@company.hu |
| Telefonszám | IGEN | +36 30 123 4567 |
| Cég | NEM | ABC Holding Zrt. |
| Pozíció | NEM | Vezérigazgató |
| Étkezési igény | NEM | Vegetáriánus |
| Ültetési preferencia | NEM | XY mellett szeretnék ülni |

---

## Időzítések

| Elem | Érvényesség |
|------|-------------|
| Magic link | 24 óra |
| Regisztráció | ~3 perc |
| QR jegy | Azonnal elkészül |
| QR jegy lejárat | Esemény + 48 óra |

---

## VIP Előnyök

| Előny | Leírás |
|-------|--------|
| **Ingyenes** | Nincs fizetési lépés |
| **Gyors** | Azonnali jegy regisztráció után |
| **VIP ültetés** | Kiemelt asztalok a színpad közelében |
| **Prémium** | Exkluzív VIP bánásmód |

---

## Hibalehetőségek és Megoldások

| Probléma | Megoldás |
|----------|----------|
| Magic link lejárt | Admin küld új linket |
| Email nem érkezett | Spam mappa ellenőrzése |
| Hibás adatok | Admin javítja a rendszerben |
