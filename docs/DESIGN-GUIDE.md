# CEO Gala 2026 - Design Guide

**Forrás:** [BBJ CEO Gala hivatalos oldal](https://bbj.hu/events/ceogala/awards/)
**Frissítve:** 2025-12-04

---

## Alapelvek

A CEO Gala arculata **elegáns, visszafogott és professzionális**. A design a minimalizmust és a prémium megjelenést helyezi előtérbe.

### Fő jellemzők:
- **Monochrome paletta** - fekete, fehér, szürke árnyalatok
- **Teal akcentus** - elsődleges kiemelésekhez (linkek, vezetéknevek, évszám)
- **Arany akcentus** - másodlagos, díjas kiemelésekhez (ritkán!)
- **Sok whitespace** - levegős, letisztult elrendezés
- **Serif tipográfia** - elegáns, klasszikus címsorok
- **Szögletes formák** - nincs border-radius
- **Grayscale fotók** - fekete-fehér képek körökben

---

## Színpaletta

### Alap színek (Monochrome)

| Szín | Hex | Tailwind | Használat |
|------|-----|----------|-----------|
| **Fehér** | `#FFFFFF` | `white` | Oldal háttér |
| **Világosszürke** | `#F5F5F5` | `neutral-100` | Kártya háttér, szekció elválasztó |
| **Középszürke** | `#9CA3AF` | `neutral-400` | Másodlagos szöveg, placeholder |
| **Sötétszürke** | `#4B5563` | `neutral-600` | Body szöveg |
| **Charcoal** | `#1F2937` | `neutral-800` | Címsorok, header háttér |
| **Fekete** | `#111827` | `neutral-900` | Erős kiemelés |

### Akcentus színek

| Szín | Hex | Tailwind | Használat |
|------|-----|----------|-----------|
| **Teal** | `#00A0A0` | `accent-teal` | Elsődleges: linkek, vezetéknevek, évszám, CTA |
| **Teal hover** | `#008585` | `accent-teal-dark` | Hover állapot |
| **Arany** | `#C4A24D` | `accent-gold` | Másodlagos: díjak, speciális kiemelések |
| **Arany hover** | `#B8923D` | `accent-gold-dark` | Hover állapot |

> **FONTOS:** Az akcentus színek használata MINIMÁLIS!
> - **Teal**: linkek, vezetéknevek (ALL CAPS), évszám badge, elsődleges gomb
> - **Arany**: díj kiemelések, speciális badge-ek (nagyon ritkán!)

### Státusz színek (visszafogott)

| Státusz | Hex | Tailwind | Használat |
|---------|-----|----------|-----------|
| **Siker** | `#059669` | `emerald-600` | Sikeres művelet, jóváhagyva |
| **Figyelmeztetés** | `#D97706` | `amber-600` | Függőben, figyelmeztetés |
| **Hiba** | `#DC2626` | `red-600` | Hiba, elutasítva |
| **Info** | `#2563EB` | `blue-600` | Információ, új elem |

> **Megjegyzés:** A státusz színek NEM élénkek, hanem a Tailwind 600-as árnyalatai (tompított).

---

## Tipográfia

### Betűtípusok

| Típus | Font | Fallback | Használat |
|-------|------|----------|-----------|
| **Display/Címsor** | Playfair Display | Georgia, serif | H1, H2, kiemelések |
| **Body** | Open Sans | system-ui, sans-serif | Szövegtörzs, form mezők |
| **Monospace** | JetBrains Mono | monospace | Kód, QR kód |

### Címsor hierarchia

```
H1: Playfair Display, 36px, font-semibold, neutral-800
H2: Playfair Display, 28px, font-semibold, neutral-800
H3: Open Sans, 20px, font-semibold, neutral-700
H4: Open Sans, 16px, font-semibold, neutral-700
```

### Szövegtörzs

```
Body: Open Sans, 16px, font-normal, neutral-600
Small: Open Sans, 14px, font-normal, neutral-500
Caption: Open Sans, 12px, font-normal, neutral-400
```

---

## Komponensek

### Gombok

#### Elsődleges gomb (CTA)
```css
background: #00A0A0 (teal)
color: #FFFFFF
border: none
padding: 12px 24px
font: Open Sans, 14px, font-semibold, uppercase, letter-spacing: 0.05em
hover: background #008585
```

#### Másodlagos gomb
```css
background: transparent
color: #1F2937 (charcoal)
border: 1px solid #1F2937
padding: 12px 24px
font: Open Sans, 14px, font-semibold, uppercase
hover: background #1F2937, color #FFFFFF
```

#### Ghost gomb
```css
background: transparent
color: #4B5563 (sötétszürke)
border: none
padding: 12px 24px
hover: background #F5F5F5
```

### Kártyák

```css
background: #FFFFFF
border: 1px solid #E5E7EB (neutral-200)
border-radius: 0 (szögletes!)
box-shadow: 0 1px 3px rgba(0,0,0,0.1)
padding: 24px
```

### Input mezők

```css
background: #FFFFFF
border: 1px solid #D1D5DB (neutral-300)
border-radius: 0
padding: 12px 16px
font: Open Sans, 16px
focus: border-color #1F2937, box-shadow 0 0 0 1px #1F2937
```

---

## Ikonok

### Ikon készlet
**Phosphor Icons** - `weight="light"`

### Telepítés
```bash
npm install @phosphor-icons/react
```

### Használat
```tsx
import { User, Envelope, Check } from '@phosphor-icons/react';

<User weight="light" size={20} className="text-neutral-600" />
```

### Ikon színek
- **Alapértelmezett:** `neutral-600` (#525252)
- **Hover:** `neutral-800` (#262626)
- **Akcentus:** `accent-teal` (#00A0A0) - ritkán!
- **Siker:** `status-success` (#059669)
- **Hiba:** `status-error` (#DC2626)

---

## Elrendezés

### Térköz rendszer
- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px
- **2xl:** 48px

### Max szélesség
- **Content:** 1280px (max-w-7xl)
- **Narrow:** 768px (max-w-3xl)
- **Form:** 480px (max-w-md)

### Grid
- **Admin dashboard:** 12 oszlopos grid
- **Kártyák:** 3 oszlop desktop, 1 oszlop mobile

---

## Speciális elemek

### Header (Admin)
```css
background: #1F2937 (charcoal)
color: #FFFFFF
height: 64px
nav-links: uppercase, letter-spacing, font-medium
```

### Badge (évszám, státusz)
```css
/* Teal badge (elsődleges) */
background: #00A0A0
color: #FFFFFF
padding: 4px 12px
font: 12px, font-bold

/* Szürke badge */
background: #E5E5E5
color: #525252
```

### Profil kártya (Shortlist stílus)
A BBJ screenshoton látható profil kártya minta:
```css
/* Kép */
width: 200px
height: 200px
border-radius: 50% (kör!)
filter: grayscale(100%)
border: none

/* Név */
.first-name: Playfair Display, 24px, neutral-800
.last-name: Playfair Display, 24px, accent-teal, uppercase

/* Beosztás */
font: Open Sans, 14px, neutral-500
text-align: center
```

### Halftone minta (dekoratív háttér)
A BBJ oldalon látható pontozott minta CSS-ben:
```css
.halftone-pattern {
  background-image: radial-gradient(#D4D4D4 1px, transparent 1px);
  background-size: 8px 8px;
  opacity: 0.5;
}
```

---

## Tailwind Konfiguráció

A `tailwind.config.ts` már frissítve van az alábbi palettával:

```typescript
colors: {
  // Akcentus színek (minimális használat!)
  accent: {
    teal: '#00A0A0',        // Elsődleges: linkek, nevek, CTA
    'teal-dark': '#008585',
    'teal-light': '#33B3B3',
    gold: '#C4A24D',        // Másodlagos: díjak (ritkán!)
    'gold-dark': '#B8923D',
    'gold-light': '#D4B86A',
  },

  // Státusz (visszafogott)
  status: {
    success: '#059669',  // emerald-600
    warning: '#D97706',  // amber-600
    error: '#DC2626',    // red-600
    info: '#2563EB',     // blue-600
  },

  // Monochrome alap
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
}
```

---

## DO / DON'T

### DO
- Használj sok whitespace-t
- Tarts monochrome palettát (fekete/fehér/szürke)
- Teal CSAK linkekhez, nevekhez, CTA-hoz
- Arany CSAK díjakhoz, speciális kiemelésekhez (nagyon ritkán!)
- Phosphor Icons `weight="light"`
- Szögletes sarkok mindenhol (kivéve profilképek: kör)
- Grayscale fotók profilokhoz
- Vezetéknevek ALL CAPS + teal színnel

### DON'T
- NE használj élénk, vibráns színeket
- NE használj lekerekített sarkokat UI elemekhez
- NE használj túl sok akcentus színt (max 1-2 elem/oldal)
- NE használj színes hátteret kártyákhoz
- NE használj Phosphor Icons `weight="bold"` vagy `weight="fill"`
- NE használj színes profilképeket (mindig grayscale!)

---

## Referencia

- **BBJ CEO Gala:** https://bbj.hu/events/ceogala/awards/
- **Phosphor Icons:** https://phosphoricons.com
- **Playfair Display:** https://fonts.google.com/specimen/Playfair+Display
- **Open Sans:** https://fonts.google.com/specimen/Open+Sans
