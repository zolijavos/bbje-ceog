# QVIK Fizetési Megoldás - Vezetői Összefoglaló

**Készült:** 2025. december 17.
**Projekt:** CEO Gála Regisztrációs Rendszer
**Célközönség:** Vezetőség, Projekt Menedzsment

---

## Mi az a QVIK?

A QVIK a Magyar Nemzeti Bank (MNB) által fejlesztett **ingyenes, azonnali fizetési megoldás**, amely 2024 szeptembere óta érhető el minden hazai mobilbank alkalmazásban.

A vendég a saját mobilbank appjában hagyja jóvá a fizetést - **nem kell kártyaadatokat megadnia**.

---

## Előnyök

| Előny | Részletek |
|-------|-----------|
| **Alacsonyabb költség** | QVIK díja jelentősen alacsonyabb a kártyás fizetésnél (Stripe: ~1.4% + fix díj) |
| **Gyorsabb fizetés** | 2-3 kattintás, nincs kártyaadat-kitöltés |
| **Nagyobb biztonság** | Nincs kártyaadat átadás, biometrikus/PIN jóváhagyás a bankban |
| **Magyar preferencia** | Hazai fejlesztés, MNB támogatás, növekvő ismertség |
| **Azonnali jóváírás** | A pénz azonnal megérkezik (vs. kártyás T+1-2 nap) |

---

## Hátrányok

| Hátrány | Hatás |
|---------|-------|
| **Csak magyar bankszámlával** | Külföldi vendégek (nemzetközi CEO-k) nem tudják használni |
| **Új rendszer** | Még nem mindenki ismeri, edukáció szükséges |
| **Stripe mellett kell működnie** | Párhuzamos rendszer fenntartása (külföldi vendégeknek) |

---

## Üzleti javaslat

### Ajánlott megközelítés: **QVIK mint opcionális fizetési mód**

```
Fizetési mód választó:
├── Bankkártya (Stripe) → Külföldi és magyar vendégek
├── QVIK (azonnali átutalás) → Magyar vendégek  ← ÚJ
└── Banki átutalás (manuális) → Céges fizetések
```

**A Stripe megmarad** a külföldi vendégek és a kártyával fizetni preferálók számára.

---

## Bevezetési folyamat

| Lépés | Felelős | Időigény |
|-------|---------|----------|
| 1. SimplePay kereskedői szerződés | Pénzügy | 3-5 munkanap |
| 2. QVIK aktiválás SimplePay-nél | Pénzügy | 1-2 munkanap |
| 3. Technikai integráció | Fejlesztés | 1-2 hét |
| 4. Tesztelés | QA | 3-5 munkanap |
| **Összesen** | | **~3-4 hét** |

---

## Költségbecslés

| Tétel | Becsült költség |
|-------|-----------------|
| SimplePay szerződés | Nincs belépési díj |
| QVIK tranzakciós díj | ~0.2-0.5% (vs. Stripe ~1.4%) |
| Fejlesztési költség | Belső erőforrás / ~40-80 óra |

**Megtérülés:** 100+ magyar vendég esetén a tranzakciós díj megtakarítás fedezi a fejlesztési költséget.

---

## Kockázatok

| Kockázat | Valószínűség | Kezelés |
|----------|--------------|---------|
| Vendégek nem ismerik a QVIK-et | Közepes | Rövid magyarázó szöveg a fizetési oldalon |
| SimplePay szerződés elhúzódik | Alacsony | Időben elindítani az adminisztrációt |
| Technikai probléma | Alacsony | Stripe mint backup megmarad |

---

## Döntési mátrix

| Szempont | QVIK bevezetés | Csak Stripe marad |
|----------|----------------|-------------------|
| Költség csökkenés | ✅ Igen | ❌ Nem |
| Magyar vendég élmény | ✅ Jobb | ⚠️ Megfelelő |
| Külföldi vendég élmény | ⚠️ Változatlan | ⚠️ Változatlan |
| Fejlesztési ráfordítás | ⚠️ Szükséges | ✅ Nincs |
| Innovatív megjelenés | ✅ Igen | ❌ Nem |

---

## Javaslat

**Ajánlás:** QVIK bevezetése **opcionális fizetési módként** a Stripe mellett.

**Indoklás:**
1. Költséghatékonyabb a magyar vendégek számára
2. Gyorsabb, kényelmesebb fizetési élmény
3. MNB-támogatott, megbízható rendszer
4. Alacsony kockázat (Stripe backup megmarad)

---

## Következő lépések

Ha a vezetőség jóváhagyja:

1. **Hét 1:** SimplePay kapcsolatfelvétel és szerződés
2. **Hét 2-3:** Technikai integráció
3. **Hét 4:** Tesztelés és élesítés

**Döntés szükséges:** Induljon-e a SimplePay szerződési folyamat?

---

*Készítette: MyForge Labs*
*Kapcsolat: qvik@mnb.hu | SimplePay: simplepay.hu*
