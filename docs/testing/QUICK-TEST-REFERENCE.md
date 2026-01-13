# CEO Gala - Gyors Teszt Referencia Kártya

> **Nyomtasd ki ezt az oldalt** - egyoldalas összefoglaló teszteléshez

---

## Hozzáférések

| Felület | URL | Felhasználó | Jelszó |
|---------|-----|-------------|--------|
| **Admin** | https://ceogala.mflevents.space/admin | `admin@ceogala.test` | `Admin123!` |
| **Staff** | https://ceogala.mflevents.space/checkin | `staff@ceogala.test` | `Staff123!` |
| **PWA** | https://ceogala.mflevents.space/pwa | PWA kód: `CEOG-XXXXXX` | - |
| **Jelentkezés** | https://ceogala.mflevents.space/apply | - | - |

---

## Teszt email minta

```
teszt-[tipus]-[datum]@ceogala.hu
```

**Példák:**
- `teszt-vip-20251217@ceogala.hu`
- `teszt-fizeto-20251217@ceogala.hu`
- `teszt-paros-20251217@ceogala.hu`

---

## Jegy típusok és árak

| Típus | Ár | Fizetés |
|-------|-----|---------|
| VIP | Ingyenes | Nem kell |
| Egyéni | 100.000 Ft | Kártya/Átutalás |
| Páros | 150.000 Ft | Kártya/Átutalás |

---

## 10 Teszteset - Gyors checklist

| # | Teszt | Ellenőrizd | OK? |
|---|-------|------------|-----|
| **1** | VIP regisztráció | Magic link → GDPR → QR generálás | [ ] |
| **2** | Fizető egyéni | Jegy választás → Számlázás → Fizetés | [ ] |
| **3** | Páros jegy | Partner adatok → Mindkét vendég létrejön | [ ] |
| **4** | Jelentkező | Űrlap → Admin jóváhagyás → Email | [ ] |
| **5** | Átutalás jóváhagyás | Admin jóváhagy → QR generálódik | [ ] |
| **6** | PWA belépés | Kód megadás → Dashboard látható | [ ] |
| **7** | QR jegy | Jegy oldal → QR beolvasható | [ ] |
| **8** | Check-in | Zöld = OK / Sárga = már belépett / Piros = hiba | [ ] |
| **9** | Ültetés | Asztal létrehozás → Vendég hozzárendelés | [ ] |
| **10** | Email | Sablon → Küldés → Napló | [ ] |

---

## Check-in színkódok

| Szín | Jelentés | Művelet |
|------|----------|---------|
| **ZÖLD** | Érvényes jegy | Kattints: **Beléptetés** |
| **SÁRGA** | Már belépett | Admin override szükséges |
| **PIROS** | Érvénytelen | Hiba - nem léptethető be |

---

## Gyakori hibák és megoldások

| Hiba | Ok | Megoldás |
|------|-----|----------|
| "Link lejárt" | 24 óra eltelt | Új meghívó küldés |
| "Hibás PWA kód" | Elgépelés | Ellenőrizd a kódot |
| 403 Forbidden | Nincs bejelentkezve | Jelentkezz be újra |
| QR nem jelenik meg | Nincs fizetés | Fizetés jóváhagyás |
| "Már belépett" | Dupla scan | Admin override |

---

## Kötelező mezők

**Regisztráció:**
- [ ] Név
- [ ] Email
- [ ] GDPR beleegyezés
- [ ] Lemondási feltételek

**Számlázás (fizető):**
- [ ] Számlázási név
- [ ] Adószám
- [ ] Cím, Város, Irányítószám

**Páros jegy:**
- [ ] Partner neve
- [ ] Partner email

---

## Hibajegy - mit írj bele?

1. **Mi a hiba?** (1 mondat)
2. **Hol?** (URL vagy menüpont)
3. **Lépések** (hogyan reprodukálható)
4. **Screenshot** (ha van)
5. **Prioritás:** Kritikus / Magas / Közepes / Alacsony

---

## Elfogadási kritérium

✅ **SIKERES** ha:
- Mind a 6 kritikus teszt (1-3, 6-8) átmegy
- Legalább 3/4 fontos teszt (4-5, 9-10) átmegy

❌ **SIKERTELEN** ha:
- Bármelyik kritikus teszt hibás

---

## Online Tesztelési Eszközök

| Eszköz | URL | Leírás |
|--------|-----|--------|
| **Release Tesztelés** | /admin/release-testing | Manuális teszt lépések verziónként |
| **Testing Hub** | /testing-hub.html | Diagramok, tesztesetek, videók |
| **Diagram Dashboard** | /admin/diagrams | 28 interaktív rendszer diagram |

---

*Részletes útmutató: [FUNCTIONAL-TEST-GUIDE.md](./FUNCTIONAL-TEST-GUIDE.md)*
