# CEO Gala 2026 - Fizetéskezelés

## Fizetési Módok Áttekintése

| Fizetési mód | Idő | Admin munka | Népszerűség |
|--------------|-----|-------------|-------------|
| **Kártyás (Stripe)** | ~2 perc | Nincs | ~70% |
| **Banki átutalás** | 1-3 munkanap | Manuális | ~30% |

---

## Kártyás Fizetés (Stripe)

### Folyamat

```
Vendég "Fizetek" → Stripe oldal → Kártya adatok → 3D Secure → Sikeres → QR jegy
```

### Lépések Részletesen

| # | Lépés | Ki végzi | Idő |
|---|-------|----------|-----|
| 1 | "Fizetek" gomb | Vendég | 1 mp |
| 2 | Stripe átirányítás | Rendszer | Azonnal |
| 3 | Kártya adatok megadása | Vendég | 1 perc |
| 4 | 3D Secure megerősítés | Vendég (Bank) | 30 mp |
| 5 | Fizetés feldolgozás | Stripe | 2 mp |
| 6 | Webhook visszajelzés | Stripe → Rendszer | <1 mp |
| 7 | QR jegy generálás | Rendszer | Azonnal |
| 8 | Email küldés | Rendszer | <1 perc |

### Admin Teendő
```
NINCS - 100% automatikus folyamat
```

### Elfogadott Kártyák

| Kártya | Támogatott |
|--------|------------|
| Visa | IGEN |
| Mastercard | IGEN |
| American Express | IGEN |

---

## Banki Átutalás

### Folyamat

```
Vendég választ → Bankszámla adatok → Vendég utal → Admin ellenőriz → Jóváhagyás → QR jegy
```

### Lépések Részletesen

| # | Lépés | Ki végzi | Idő |
|---|-------|----------|-----|
| 1 | Átutalás választás | Vendég | 1 mp |
| 2 | Bankszámla adatok megjelenítése | Rendszer | Azonnal |
| 3 | Adatok lemásolása | Vendég | 1 perc |
| 4 | Utalás végrehajtása | Vendég (Bank) | Változó |
| 5 | Összeg beérkezése | Bank | 1-3 munkanap |
| 6 | Admin ellenőrzés | Admin | 5 perc |
| 7 | Jóváhagyás | Admin | 1 kattintás |
| 8 | QR jegy generálás | Rendszer | Azonnal |

### Admin Teendők

| # | Lépés | Hol | Mit nézz |
|---|-------|-----|----------|
| 1 | Payments megnyitás | Admin → Payments | - |
| 2 | Pending szűrő | Szűrő gomb | Várakozók |
| 3 | Bankszámla ellenőrzés | Netbank | Beérkezett? |
| 4 | Összeg ellenőrzés | Összehasonlítás | Egyezik? |
| 5 | Közlemény ellenőrzés | Netbank | Név/email? |
| 6 | "Approve Payment" | Gomb | Jóváhagyás |

### Ellenőrzési Checklist

| Elem | Mit nézz | Jó példa |
|------|----------|----------|
| Összeg | Egyezik a jegyárral? | 100.000 Ft |
| Közlemény | Tartalmaz azonosítót? | "Kovács János" |
| Dátum | Regisztráció utáni? | Igen |
| Feladó | Azonosítható? | Banki kivonat |

---

## Jegyárak

| Jegy típus | Ár | Személyek |
|------------|-----|-----------|
| VIP | INGYENES | 1 fő |
| Egyéni | 100.000 Ft | 1 fő |
| Páros | 180.000 Ft | 2 fő |

---

## Fizetési Státuszok

| Státusz | Jelentés | Szín |
|---------|----------|------|
| **Pending** | Várakozik (átutalás) | Narancs |
| **Paid** | Sikeres fizetés | Zöld |
| **Failed** | Sikertelen kártyás | Piros |

---

## Összehasonlítás

| Szempont | Kártyás | Átutalás |
|----------|---------|----------|
| Sebesség | Azonnal | 1-3 nap |
| Admin munka | 0% | Manuális |
| Biztonság | 3D Secure | Banki |
| Automatizáltság | 100% | Részleges |
| Hibalehetőség | Alacsony | Közepes |
| Vendég preferencia | Gyors, kényelmes | Céges fizetés |
