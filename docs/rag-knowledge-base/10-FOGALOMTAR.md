# CEO Gala - Fogalomtár

## A

### Admin
Adminisztrátor felhasználó, aki teljes hozzáféréssel rendelkezik a rendszer összes funkciójához.

### Admin Override
Admin jogosultsággal végrehajtott művelet, amely felülírja a normál szabályokat (pl. duplikált belépés engedélyezése).

### Approved
Jóváhagyott státusz - a vendég regisztrációja és fizetése rendben, beléphet az eseményre.

## B

### Billing Info
Számlázási adatok - név, cím, adószám a fizető vendégek számára.

### Bulk Action
Tömeges művelet - egyszerre több vendégre alkalmazott akció (pl. email küldés, jóváhagyás).

## C

### Cancelled
Lemondott státusz - a vendég a PWA-ban lemondta a részvételt az esemény előtt 7 nappal.

### Cancel URL
Lemondási link - a `/pwa/cancel` oldal URL-je, ahol a vendégek lemondhatják részvételüket.

### Check-in
Bejelentkezés/beléptetés az eseményre QR kód alapján.

### Check-in Log
Beléptetési napló - az összes belépés rögzítése időbélyeggel.

### CSV
Comma-Separated Values - táblázatos adatformátum importhoz és exporthoz.

## D

### Dashboard
Vezérlőpult - áttekintő oldal a legfontosabb adatokkal és statisztikákkal.

### Declined
Visszautasított - a vendég önként lemondta a részvételt.

### Dietary Requirements
Étkezési igények - vegetáriánus, vegán, allergiák, stb.

### Drag & Drop
Húzd és ejtsd - interaktív felület az ültetési rend kezeléséhez.

## E

### Email Log
Email napló - az összes elküldött email rögzítése.

### Email Template
Email sablon - előre elkészített email formátum változókkal.

### E-10 / E-7 Reminder
Automatikus esemény emlékeztető emailek 10 és 7 nappal az esemény előtt, lemondási linkkel.

## F

### Feature Flag
Funkció kapcsoló - beállítás, amivel bizonyos funkciók ideiglenesen ki/be kapcsolhatók (pl. PWA asztal kártya elrejtése).

## G

### GDPR
General Data Protection Regulation - európai adatvédelmi rendelet.

### Guest
Vendég - bárki, aki részt vesz az eseményen.

### Guest Type
Vendég típus - VIP, Fizető egyéni, vagy Fizető páros.

## I

### Invited
Meghívott státusz - a vendég meghívót kapott, de még nem regisztrált.

## J

### JWT
JSON Web Token - biztonságos token formátum a QR kódokhoz.

## M

### Magic Link
Egyedi, biztonságos link a regisztrációhoz. 24 óráig érvényes.

## N

### No-Show
Vendég, aki regisztrált és jóváhagyott volt, de nem jelent meg az eseményen (nem történt check-in). VIP vendégeknél díj számítható fel.

### No-Show Payment Request
Fizetési felszólítás email no-show vendégeknek az esemény után.

## O

### Offline
Internetkapcsolat nélküli működés. A PWA QR jegy offline is működik.

### Override
Lásd: Admin Override

## P

### Paid
Fizetett státusz - a vendég teljesítette a fizetést.

### Paired Ticket
Páros jegy - 2 személyre szóló jegy (fő vendég + partner).

### Partner
A páros jegy második vendége.

### Paying Guest
Fizető vendég - nem VIP, fizetnie kell a jegyért.

### Payment Method
Fizetési mód - kártyás (Stripe) vagy banki átutalás.

### Pending
Függőben - folyamatban lévő művelet, várakozik valamilyen eseményre.

### PWA
Progressive Web App - mobil-optimalizált webalkalmazás a vendégeknek.

### Push Notification
Push értesítés - azonnali értesítés a vendég telefonjára.

## Q

### QR Code
Quick Response kód - 2D vonalkód a beléptetéshez.

## R

### Rate Limit
Küldési korlát - max. email szám adott időszakon belül.

### Registered
Regisztrált státusz - a vendég kitöltötte a regisztrációs űrlapot.

### Registration
Regisztráció - a vendég adatainak rögzítése a részvételhez.

### Resend
Újraküldés - email vagy jegy ismételt kiküldése.

## S

### Seating
Ültetés - vendégek asztalokhoz rendelése.

### Seating Preference
Ültetési preferencia - a vendég kérése, kikkel szeretne ülni.

### Service Worker
Háttérfolyamat a PWA-ban, amely lehetővé teszi az offline működést.

### Single Ticket
Egyéni jegy - 1 személyre szóló jegy.

### Staff
Személyzet felhasználó - korlátozott hozzáférés, csak check-in szkennelés.

### Status
Státusz - a vendég aktuális állapota a rendszerben.

### Stripe
Online fizetési szolgáltató kártyás fizetésekhez.

## T

### Table
Asztal - a vendégek ülőhelye az eseményen.

### Table Assignment
Asztal hozzárendelés - vendég asztalhoz rendelése.

### Table Capacity
Asztal kapacitás - hány vendég fér el egy asztalnál.

### Ticket
Jegy - a vendég belépőjegye QR kóddal.

### Ticket Type
Jegy típus - VIP (ingyenes), Egyéni fizető, Páros fizető.

## V

### VIP
Very Important Person - kiemelt vendég, ingyenes jeggyel.

## W

### Webhook
Automatikus HTTP értesítés események között (pl. Stripe → rendszer).

### Whitelist
Engedélyezési lista - pl. email címek, amelyekről fogadunk leveleket.

---

## Státuszok összefoglalója

| Státusz | Magyar | Jelentés |
|---------|--------|----------|
| Invited | Meghívott | Magic link elküldve, vár regisztrációra |
| Registered | Regisztrált | Űrlap kitöltve, fizetésre vár (ha fizető) |
| Approved | Jóváhagyott | Minden rendben, QR jegy kiállítva |
| Declined | Visszautasított | Vendég visszautasította a magic linken |
| **Cancelled** | **Lemondott** | **Vendég a PWA-ban lemondta (7 napig)** |

## Fizetési státuszok

| Státusz | Magyar | Jelentés |
|---------|--------|----------|
| Pending | Függőben | Fizetés folyamatban / várakozik |
| Paid | Fizetve | Sikeres fizetés |
| Failed | Sikertelen | Fizetés nem sikerült |
| Refunded | Visszatérített | Összeg visszautalva |
