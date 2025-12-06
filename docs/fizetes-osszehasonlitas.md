# Fizetési Megoldások Összehasonlítása

> CEO Gala Event Registration System - Fizetési gateway elemzés
> Készült: 2024. december

---

## Tartalomjegyzék

1. [Stripe](#-stripe)
2. [Barion](#-barion-magyar)
3. [OTP SimplePay](#-otp-simplepay)
4. [K&H VPOS](#-kh-vpos-direkt-banki)
5. [Összehasonlító táblázat](#-összehasonlító-táblázat)
6. [Javaslat a projekthez](#-javaslat-a-ceo-gala-projekthez)
7. [Források](#források)

---

## 🔵 Stripe

### Előnyök

| Előny | Részletek |
|-------|-----------|
| **Gyors integráció** | Kiváló API, SDK minden nyelvhez, részletes dokumentáció |
| **Nincs belépési díj** | Azonnal használható, nincs havi díj |
| **Globális** | 135+ pénznem, 45+ ország |
| **Modern UX** | Stripe Checkout - kész, szép fizetési oldal |
| **Webhook-ok** | Megbízható eseménykezelés |
| **Stripe Radar** | Beépített csalásmegelőzés |

### Hátrányok

| Hátrány | Részletek |
|---------|-----------|
| **Magas díj** | 2.9% + €0.30/tranzakció (EU kártyák: 1.5% + €0.25) |
| **Extra díjak** | Devizaváltás +1%, határon túli +1.5% |
| **Pénzkivét késés** | 7-14 nap a bankszámlára |
| **Nincs magyar ügyfélszolgálat** | Angol support |
| **HUF átváltás** | EUR-ban számol, HUF konverzió költséges |

### Díjak részletesen

```
EU kártya:        1.5% + €0.25 (~1.5% + 100 Ft)
Nem-EU kártya:    2.9% + €0.25
Devizaváltás:     +1%
Határon túli:     +1.5%
Visszatérítés:    €15/eset
```

---

## 🟢 Barion (Magyar)

### Előnyök

| Előny | Részletek |
|-------|-----------|
| **Legolcsóbb** | 1% kereskedői díj (100M Ft-ig akár 0%!) |
| **Nincs belépési díj** | Nincs havi díj sem |
| **Azonnali pénz** | Barion tárcába azonnal érkezik |
| **Magyar cég** | Magyar ügyfélszolgálat |
| **Apple Pay/Google Pay** | Natív támogatás |
| **Barion Pixel** | Marketing/analytics integráció |

### Hátrányok

| Hátrány | Részletek |
|---------|-----------|
| **Marketing opt-out drága** | 2% ha nem engedélyezed a marketing adathasználatot |
| **Wallet kiutalás** | Bankszámlára utalás 0.1% (min 50 Ft) |
| **Kevésbé ismert API** | Stripe-nál gyengébb dokumentáció |

### Díjak

```
Bankkártya:       ~1.3-1.8% (bankközi + 1% kereskedői)
100M Ft-ig:       0% kereskedői díj (promóció)
Marketing nélkül: 2%
Kiutalás HUF:     0.1% (min 50 Ft)
```

---

## 🟠 OTP SimplePay

### Előnyök

| Előny | Részletek |
|-------|-----------|
| **Legnagyobb lefedettség** | 14,000+ webshop, 1.7M felhasználó |
| **OTP megbízhatóság** | Magyarország legnagyobb bankja |
| **Simple app** | Mobil fizetés egyszerűen |
| **Heti kiutalás** | Rendszeres pénzáramlás |

### Hátrányok

| Hátrány | Részletek |
|---------|-----------|
| **Egyedi árazás** | Nincs publikus árlista |
| **Csatlakozási díj** | ~49,000 Ft + ÁFA |
| **Lassabb integráció** | Szerződéskötés szükséges |
| **API kevésbé modern** | Stripe-hoz képest elavultabb |

### Díjak (becsült)

```
Csatlakozás:      ~49,000 Ft + ÁFA (egyszeri)
Tranzakció:       1.5-2.5% (egyedi tárgyalás)
Havi díj:         Változó
```

---

## 🔴 K&H VPOS (Direkt banki)

### Előnyök

| Előny | Részletek |
|-------|-----------|
| **Alacsony díj** | Akár <1% nagy forgalomnál |
| **Közvetlen bank** | Nincs közvetítő |
| **3D Secure** | PSD2 megfelelő |
| **Akció** | 6 hónap 0 Ft admin díj |

### Hátrányok

| Hátrány | Részletek |
|---------|-----------|
| **Hosszú onboarding** | Hetek a szerződéskötés |
| **Bonyolult integráció** | Régebbi API, kevés dokumentáció |
| **K&H számla előny** | Más banknál nehezebb |
| **Support** | Banki bürokrácia |

### Díjak

```
Csatlakozás:      Egyedi (akció: 6 hó 0 Ft admin)
Tranzakció:       0.8-1.5% (forgalomfüggő)
Bankközi díj:     ~0.2-0.3% (EU szabályozott)
```

---

## 📊 Összehasonlító Táblázat

| Szempont | Stripe | Barion | SimplePay | K&H VPOS |
|----------|--------|--------|-----------|----------|
| **Tranzakciós díj** | 1.5-2.9% | 1-2% | 1.5-2.5% | 0.8-1.5% |
| **Belépési díj** | 0 | 0 | ~50k Ft | Egyedi |
| **Havi díj** | 0 | 0 | Változó | Változó |
| **Integráció idő** | 1-2 nap | 1-3 nap | 1-2 hét | 2-4 hét |
| **API minőség** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Magyar support** | ❌ | ✅ | ✅ | ✅ |
| **Apple/Google Pay** | ✅ | ✅ | ✅ | ✅ |
| **Kiutalás** | 7-14 nap | Azonnali | Heti | 1-2 nap |

---

## 🎯 Javaslat a CEO Gala Projekthez

### Rövid távra (MVP - 1 hónap)

**→ Stripe** - Leggyorsabb integráció, kiváló API, azonnal működik

**Indoklás:**
- Nincs idő banki szerződésekre
- Kiváló Next.js/React integráció
- Stripe Checkout azonnal használható
- Webhook-ok megbízhatóak

### Hosszú távra (produkció)

**→ Barion** - Legolcsóbb magyar megoldás, jó UX

**Indoklás:**
- Alacsonyabb tranzakciós díj
- Magyar ügyfélszolgálat
- Azonnali pénzérkezés
- Magyar vásárlók ismerik

### Hibrid megoldás (optimális)

```
1. Stripe     → Nemzetközi kártyák, gyors MVP
2. Barion     → Magyar vásárlók, alacsonyabb díj
3. Átutalás   → Manuális jóváhagyás (már implementálva)
```

---

## 💰 Költségbecslés

### Szcenárió: 500 fizető vendég, 30,000 Ft/jegy

| Megoldás | Díj/tranzakció | 500 vendég összdíj |
|----------|----------------|-------------------|
| Stripe (1.5%) | ~450 Ft | ~225,000 Ft |
| Barion (1%) | ~300 Ft | ~150,000 Ft |
| K&H VPOS (1%) | ~300 Ft | ~150,000 Ft |

**Potenciális megtakarítás Barion/K&H-val:** ~75,000 Ft

### Szcenárió: 200 fizető vendég, 50,000 Ft/jegy (páros)

| Megoldás | Díj/tranzakció | 200 vendég összdíj |
|----------|----------------|-------------------|
| Stripe (1.5%) | ~750 Ft | ~150,000 Ft |
| Barion (1%) | ~500 Ft | ~100,000 Ft |

**Potenciális megtakarítás:** ~50,000 Ft

---

## 🔧 Technikai Integráció Összehasonlítás

### Stripe (Next.js)

```typescript
// Egyszerű Stripe Checkout integráció
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'huf',
      product_data: { name: 'CEO Gala Jegy' },
      unit_amount: 3000000, // 30,000 Ft in fillér
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${baseUrl}/payment/success`,
  cancel_url: `${baseUrl}/payment/cancel`,
});
```

### Barion

```typescript
// Barion fizetés indítás
const response = await fetch('https://api.barion.com/v2/Payment/Start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    POSKey: process.env.BARION_POS_KEY,
    PaymentType: 'Immediate',
    Currency: 'HUF',
    Transactions: [{
      POSTransactionId: 'CEOG-123',
      Payee: 'ceogala@example.com',
      Total: 30000,
      Items: [{ Name: 'CEO Gala Jegy', Quantity: 1, Unit: 'db', UnitPrice: 30000 }]
    }],
    RedirectUrl: `${baseUrl}/payment/callback`,
    CallbackUrl: `${baseUrl}/api/barion/webhook`,
  }),
});
```

---

## Döntési Mátrix

| Kritérium | Súly | Stripe | Barion | SimplePay | K&H |
|-----------|------|--------|--------|-----------|-----|
| Integráció gyorsasága | 30% | 10 | 8 | 5 | 3 |
| Költség | 25% | 6 | 9 | 7 | 9 |
| API minőség | 20% | 10 | 7 | 5 | 4 |
| Magyar support | 15% | 3 | 10 | 10 | 8 |
| Megbízhatóság | 10% | 10 | 8 | 9 | 9 |
| **Összpontszám** | 100% | **7.85** | **8.25** | **6.70** | **6.05** |

**Győztes hosszú távra: Barion**
**Győztes MVP-re: Stripe**

---

## Források

- [Stripe Hungary Pricing](https://stripe.com/en-hu/pricing/local-payment-methods)
- [Stripe Payments in Hungary Guide](https://stripe.com/en-it/resources/more/payments-in-hungary)
- [Barion Árak és Feltételek](https://www.barion.com/en/prices-and-conditions/)
- [Barion Személyes Árazás](https://www.barion.com/en/personal/pricing/)
- [K&H API Portal](https://www.kh.hu/web/kh-api/home)
- [K&H VPOS](https://www.khpos.hu/virtualis-pos-terminal)
- [K&H Bankkártya Elfogadás](https://www.kh.hu/vallalkozas/napi-penzugyek/bankkartya-elfogadas/szolgaltatas)
- [SimplePay vs Barion összehasonlítás](https://tudastar.szamlazz.hu/en/gyik/online-payment-solutions)
- [Hungarian Payment Methods - NORBr](https://norbr.com/library/payworldtour/payment-methods-in-hungary/)
- [Fizetési szolgáltatók összehasonlítása](https://bankkartyas-fizetes.hu/szolgaltatok)
