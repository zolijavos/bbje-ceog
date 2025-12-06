# CEO Gala 2026 - Rendszer Diagramok

A mellékelt dokumentáció a CEO Gala 2026 esemény regisztrációs rendszerének teljes technikai felépítését mutatja be. A platform lehetővé teszi a VIP és fizető vendégek online regisztrációját magic link alapú hitelesítéssel, Stripe kártyás és banki átutalásos fizetési opciókkal, automatikus QR kódos jegy generálással, valamint mobil check-in alkalmazással az esemény napján. Az adminisztrátorok számára átfogó dashboard biztosítja a vendéglisták kezelését, ültetési rend konfigurálását és valós idejű statisztikákat.

---

## Diagramok

- **01 - Vendég Regisztráció:** Teljes regisztrációs út a magic link meghívótól a QR jegy kézbesítéséig, VIP és fizető vendég útvonalakkal

- **02 - Admin Dashboard:** Vendégkezelés, CSV import, banki átutalások jóváhagyása, ültetési rend és check-in statisztikák

- **03 - Check-in Folyamat:** Mobil QR szkennelés színkódolt eredménykártyákkal (zöld/sárga/piros) és duplikáció kezeléssel

- **04 - Állapotgép:** Vendég, fizetés, jegy, asztal és check-in státuszok összes lehetséges átmenete, **beleértve az applicant státuszokat (Epic 7)**

- **05 - Fizetési Folyamat:** Stripe Checkout integráció webhook-kal és manuális banki átutalás jóváhagyási folyamat

- **06 - Rendszer Architektúra:** Négyrétegű architektúra: kliens, alkalmazás, adat és külső szolgáltatások (Stripe, SMTP, JWT) **+ PWA Guest App és Firebase FCM (Epic 6)**

- **07 - PWA Guest App Flow (Epic 6):** Mobil PWA alkalmazás vendégek számára - kód alapú authentikáció (CEOG-XXXXXX), offline QR jegy megjelenítés, Service Worker cache, Firebase push értesítések

- **08 - Applicant Flow (Epic 7):** Nem meghívott vendégek jelentkezési folyamata - /apply nyilvános oldal, admin jóváhagyási workflow, 72 órás magic link lejárat

---

## Dokumentum funkciók

- Interaktív HTML nézegető (egyetlen hordozható fájl)
- EN/HU nyelv váltás
- Sötét mód támogatás
- Megjegyzés szekció CSV exporttal
