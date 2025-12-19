# CEO Gala - Jelentkezők Kezelése

## Jelentkezési folyamat

### Ki jelentkezhet?
- Bárki, aki nem kapott meghívót
- Publikus űrlapon keresztül: `/apply`

### Mit kell megadni?
**Kötelező mezők:**
- Név
- Email cím
- Cég
- Pozíció

**Opcionális:**
- Telefon
- Motiváció (miért szeretne részt venni)
- Ültetési preferencia

### Mi történik jelentkezés után?
1. Rendszer rögzíti a jelentkezést
2. Admin értesítést kap (email/dashboard)
3. Jelentkező visszaigazoló emailt kap
4. Státusz: "Jóváhagyásra vár"

## Jelentkezők kezelése (Admin)

### Hol találom?
Admin → Applicants (Jelentkezők) menüpont

### Jelentkező lista
- Név, email, cég
- Jelentkezés dátuma
- Státusz
- Műveletek (Approve/Reject)

### Szűrési lehetőségek
- Státusz: Pending, Approved, Rejected
- Dátum
- Keresés: név, email, cég

## Jelentkezés jóváhagyása

### Mikor hagyj jóvá?
- Releváns pozíció (CEO, igazgató, vezető)
- Ismert cég
- Megfelelő motiváció
- Van még hely az eseményen

### Jóváhagyás lépései
1. Applicants → Keress rá a jelentkezőre
2. Tekintsd át az adatait
3. Kattints az "Approve" gombra
4. Válaszd ki a jegy típusát:
   - Paying Single (Fizető egyéni)
   - Paying Paired (Fizető páros)
   - VIP (ritkán, indokolt esetben)
5. Erősítsd meg

### Mi történik jóváhagyás után?
1. Jelentkező magic linket kap emailben
2. A linken regisztrálhat
3. Fizető jegynél fizetnie kell
4. Sikeres fizetés után QR jegyet kap

## Jelentkezés elutasítása

### Mikor utasíts el?
- Nem releváns pozíció
- Kapacitás hiány
- Hiányos vagy gyanús adatok
- Korábbi problémás viselkedés

### Elutasítás lépései
1. Applicants → Keress rá a jelentkezőre
2. Kattints a "Reject" gombra
3. **Add meg az elutasítás okát** (kötelező)
4. Erősítsd meg

### Elutasítási okok példái
- "Sajnos az esemény kapacitása betelt."
- "A jelentkezés nem felel meg a célközönség kritériumainak."
- "Hiányos adatok miatt nem tudjuk feldolgozni."

### Mi történik elutasítás után?
1. Jelentkező emailt kap az elutasításról
2. Az email tartalmazza az okot
3. Státusz: "Elutasított"
4. Nem tud újra jelentkezni (ugyanazzal az email címmel)

## Tömeges feldolgozás

### Több jelentkező jóváhagyása
1. Jelöld ki a checkbox-okkal
2. Bulk Actions → Approve Selected
3. Válaszd ki a jegy típusát
4. Erősítsd meg

### Több jelentkező elutasítása
1. Jelöld ki a checkbox-okkal
2. Bulk Actions → Reject Selected
3. Add meg az okot (mindenkire ugyanaz)
4. Erősítsd meg

## Jelentkezési statisztikák

### Dashboard-on látható
- Összes jelentkező
- Feldolgozásra vár
- Jóváhagyott
- Elutasított
- Konverziós arány

### Export
Applicants → Export
- CSV formátum
- Tartalmazza az összes adatot

## Speciális esetek

### Újra jelentkezés
Ha egy elutasított személy újra próbál jelentkezni:
- A rendszer jelzi, hogy korábban már jelentkezett
- Az admin dönthet az új jelentkezésről
- Javasolt: konzisztens döntés

### VIP-ként jóváhagyás
Kivételes esetben jelentkező VIP jegyet kaphat:
1. Approve → VIP típus kiválasztása
2. A jelentkező ingyenes regisztrációs linket kap
3. Dokumentáld az okot

### Kapacitás kezelés
Ha betelt az esemény:
1. Ne hagyj jóvá több jelentkezést
2. Vagy: hozz létre várólistát
3. Kommunikáld a státuszt a jelentkezőknek

## Kommunikáció jelentkezőkkel

### Automatikus emailek
- Jelentkezés beérkezése → visszaigazolás
- Jóváhagyás → magic link
- Elutasítás → indoklás

### Manuális kommunikáció
Ha kérdés merül fel:
1. Guests → Keresd meg a jelentkezőt
2. Email küldés egyénileg
3. Jegyzeteld fel a kommunikációt

## Best Practices

### Gyors feldolgozás
- Dolgozd fel a jelentkezéseket 24-48 órán belül
- A várakozás rossz benyomást kelt

### Konzisztens döntések
- Állíts fel kritériumokat előre
- Dokumentáld a döntési elveket
- Légy következetes

### Udvarias elutasítás
- Mindig adj okot
- Légy diplomatikus
- Hagyd nyitva az ajtót jövőre

### Kapacitás tervezés
- Tarts fenn helyet a jelentkezőknek
- Állíts határidőt a jelentkezésre
- Kommunikáld a kapacitás korlátokat

## Gyakori kérdések

### "Hányan jelentkezhetnek?"
Nincs technikai korlát, de:
- Az esemény kapacitása véges
- Állíts be jelentkezési határidőt
- Zárd le a jelentkezést ha betelt

### "Látja a jelentkező a többi jelentkezőt?"
Nem. A jelentkezők csak a saját státuszukat látják.

### "Módosíthatja a jelentkező az adatait?"
Beküldés után nem. Ha módosítani szeretne:
1. Vegye fel a kapcsolatot
2. Admin módosítja az adatokat

### "Mit tegyek duplikált jelentkezésnél?"
1. Ellenőrizd, hogy tényleg ugyanaz a személy-e
2. Ha igen: hagyd jóvá az egyiket, utasítsd el a másikat
3. Értesítsd a jelentkezőt

### "Visszavonható a jóváhagyás?"
Igen, de körültekintően:
1. Guests → Keresd meg a vendéget
2. Módosítsd a státuszt
3. Értesítsd a vendéget személyesen
