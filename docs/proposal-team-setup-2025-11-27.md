# Projekt Ajánlat: CEO Gala Registration v2 – Gyorsított Fejlesztés

**Dátum:** 2025. november 27.
**Tárgy:** Fejlesztési javaslat és árajánlat (Dual-Track Team felállás)

---

## 1. Vezetői Összefoglaló

A CEO Gala Registration v2 projekt kritikus határidejére (1 hónap) és komplexitására (Stripe fizetés, Ültetési rend, QR beléptetés) való tekintettel egy **2 fős dedikált szakértői csapat** felállítását javasoljuk.

Ez a "Dual-Track" (párhuzamos fejlesztési) modell lehetővé teszi, hogy a backend üzleti logika és a komplex frontend felületek (pl. Seating Chart) egyszerre készüljenek, kompromisszumok nélkül.

## 2. Javasolt Csapat Felállás

A projektet két senior szintű fejlesztő valósítja meg párhuzamos munkavégzéssel:

### **A. Senior Fullstack Lead (Backend & Architecture fókusz)**
*   **Felelősség:** Rendszerarchitektúra, Adatbázis, API, Biztonság.
*   **Kiemelt feladat:** Stripe fizetési rendszer (számlázás, webhookok), ATDD tesztelés, QR validáció logika.
*   **Technológia:** Next.js API, Prisma, Stripe SDK, Playwright.

### **B. Senior Frontend Specialist (UI/UX fókusz)**
*   **Felelősség:** Pixel-perfect UI, Animációk, Responsive design.
*   **Kiemelt feladat:** Drag-and-drop Ültetési Rend (Seating Chart) szerkesztő, Interaktív Check-in felület.
*   **Technológia:** React, Tailwind CSS, Framer Motion, dnd-kit.

---

## 3. Ütemterv (4 Hét)

A párhuzamos munkavégzésnek köszönhetően a fejlesztési idő 8 hétről **4 hétre csökken**.

| Hét | Fullstack Lead (Backend/Logic) | Frontend Specialist (UI/UX) |
| :--- | :--- | :--- |
| **1. Hét** | **Alapozás:** DB séma, Auth (Magic Link), CI/CD setup. | **Design System:** Komponens könyvtár, Landing page, Regisztrációs formok UI. |
| **2. Hét** | **Fizetés:** Stripe integráció, Webhook kezelés, Számlázás logika. | **Seating Core:** Térkép szerkesztő alapjai, Drag-n-drop logika, Vizuális elemek. |
| **3. Hét** | **Logika:** Check-in API, Admin funkciók, ATDD tesztek írása. | **Seating & Flow:** Térkép véglegesítése, Fizetési folyamat UI, Admin Dashboard UI. |
| **4. Hét** | **Integráció:** API és UI összekötése, Biztonsági audit. | **Polish:** Animációk, Mobil optimalizálás, E2E tesztek futtatása. |

---

## 4. Költségbecslés

Az árajánlat a jelenlegi piaci senior szabadúszó díjakon alapul, 160 munkaóra/fő ráfordítással számolva.

| Tétel | Szerepkör | Időráfordítás | Becsült Díj (Nettó) |
| :--- | :--- | :--- | :--- |
| **1.** | **Senior Fullstack Lead** | 160 óra (1 hó) | 2.500.000 Ft |
| **2.** | **Senior Frontend Dev** | 160 óra (1 hó) | 1.900.000 Ft |
| **Összesen** | | **320 munkaóra** | **4.400.000 Ft + ÁFA** |

*(Megjegyzés: Ez az összeg tartalmazza a teljes forráskód átadását, a dokumentációt és a beüzemelést.)*

## 5. Miért ezt válassza?

1.  **Biztonságos Határidő:** Egyetlen fejlesztővel az 1 hónap kockázatos (betegség, elakadás). Két fővel a határidő kényelmesen tartható.
2.  **Minőségi Seating Chart:** A térképes ültetési rend önmagában egy bonyolult modul. A frontend specialista dedikáltan ezzel foglalkozhat, így nem egy "fapados" megoldás készül.
3.  **Atombiztos Fizetés:** A Fullstack fejlesztő 100%-ban a fizetési logika biztonságára és tesztelésére fókuszálhat, nem vonja el a figyelmét a CSS.
4.  **Skálázhatóság:** A kód eleve modulárisan épül fel (különválasztott UI és logika), ami a jövőbeni fejlesztést olcsóbbá teszi.
