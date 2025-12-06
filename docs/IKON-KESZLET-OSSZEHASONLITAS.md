# Ikon Készlet Összehasonlítás - CEO Gála Admin

## Követelmények
- Professzionális, elegáns megjelenés
- Visszafogott színek (nem élénk)
- Konzisztens stílus
- Jól olvasható kis méretben (16-24px)
- Illeszkedik a CEO Gála arculathoz (Navy #1A1F35, Gold #D4A84B)

---

## 1. Lucide Icons (Ajánlott)

**Weboldal:** https://lucide.dev

**Jellemzők:**
- Nyílt forráskódú (ISC license)
- 1400+ ikon
- Vékony vonalvastagság (stroke-based)
- Nagyon tiszta, modern dizájn
- React komponensként használható
- Testreszabható stroke-width és szín

**Telepítés:**
```bash
npm install lucide-react
```

**Használat:**
```tsx
import { Users, Mail, CreditCard, QrCode, Settings } from 'lucide-react';

<Users className="w-5 h-5 text-gala-navy" strokeWidth={1.5} />
```

**Előnyök:**
- Nagyon elegáns, minimalista
- Tökéletes admin dashboardokhoz
- Könnyű testreszabás
- Aktívan fejlesztett

**Hátrányok:**
- Csak outline stílus

**CEO Gála illeszkedés: ⭐⭐⭐⭐⭐**

---

## 2. Heroicons (Jelenlegi)

**Weboldal:** https://heroicons.com

**Jellemzők:**
- Tailwind Labs által fejlesztett
- 300+ ikon
- Outline és Solid változat
- MIT license

**Telepítés:**
```bash
npm install @heroicons/react
```

**Használat:**
```tsx
import { UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
// vagy solid verzió:
import { UserIcon } from '@heroicons/react/24/solid';

<UserIcon className="w-5 h-5 text-gala-navy" />
```

**Előnyök:**
- Tailwind-del natív integráció
- Jó minőség
- Outline és solid változat

**Hátrányok:**
- Kevesebb ikon választék
- Kicsit "standard" megjelenés

**CEO Gála illeszkedés: ⭐⭐⭐⭐**

---

## 3. Phosphor Icons

**Weboldal:** https://phosphoricons.com

**Jellemzők:**
- 7000+ ikon (!)
- 6 különböző súly: Thin, Light, Regular, Bold, Fill, Duotone
- MIT license
- Nagyon konzisztens

**Telepítés:**
```bash
npm install @phosphor-icons/react
```

**Használat:**
```tsx
import { User, Envelope, CreditCard } from '@phosphor-icons/react';

// Különböző súlyok:
<User weight="light" className="w-5 h-5 text-gala-navy" />
<User weight="regular" className="w-5 h-5 text-gala-navy" />
<User weight="duotone" className="w-5 h-5 text-gala-navy" />
```

**Előnyök:**
- Hatalmas választék
- Duotone stílus elegáns (enyhe árnyék effekt)
- Light/Thin verzió nagyon elegáns
- Nagyon konzisztens család

**Hátrányok:**
- Nagy bundle méret ha mindent importálsz

**CEO Gála illeszkedés: ⭐⭐⭐⭐⭐**

---

## 4. Tabler Icons

**Weboldal:** https://tabler-icons.io

**Jellemzők:**
- 4900+ ikon
- Outline és filled
- MIT license
- Kicsit vastagabb vonalak

**Telepítés:**
```bash
npm install @tabler/icons-react
```

**Használat:**
```tsx
import { IconUser, IconMail, IconCreditCard } from '@tabler/icons-react';

<IconUser size={20} stroke={1.5} className="text-gala-navy" />
```

**Előnyök:**
- Nagy választék
- Jól olvasható kis méretben
- Stroke testreszabható

**Hátrányok:**
- Kicsit kevésbé elegáns mint Lucide

**CEO Gála illeszkedés: ⭐⭐⭐⭐**

---

## 5. Feather Icons

**Weboldal:** https://feathericons.com

**Jellemzők:**
- 287 ikon
- Nagyon minimalista
- MIT license
- Lucide ennek a forkja

**Telepítés:**
```bash
npm install react-feather
```

**Használat:**
```tsx
import { User, Mail, CreditCard } from 'react-feather';

<User size={20} strokeWidth={1.5} className="text-gala-navy" />
```

**Előnyök:**
- Ultra minimalista
- Kis bundle méret

**Hátrányok:**
- Kevés ikon
- Nem aktívan fejlesztett (Lucide átvette)

**CEO Gála illeszkedés: ⭐⭐⭐⭐**

---

## Vizuális Összehasonlítás

### Felhasználó ikon különböző készletekben:

| Készlet | Outline | Solid/Fill | Különleges |
|---------|---------|------------|------------|
| Lucide | ○─○ vékony | - | - |
| Heroicons | ○─○ közepes | ●●● tömör | - |
| Phosphor | ○─○ választható | ●●● tömör | Duotone (árnyékos) |
| Tabler | ○─○ közepes | ●●● tömör | - |
| Feather | ○─○ vékony | - | - |

---

## Javasolt Ikonok a CEO Gála Adminhoz

| Funkció | Lucide | Phosphor | Heroicons |
|---------|--------|----------|-----------|
| Vendég | `User` | `User` | `UserIcon` |
| Vendégek | `Users` | `Users` | `UsersIcon` |
| Email | `Mail` | `Envelope` | `EnvelopeIcon` |
| Fizetés | `CreditCard` | `CreditCard` | `CreditCardIcon` |
| QR kód | `QrCode` | `QrCode` | `QrCodeIcon` |
| Check-in | `UserCheck` | `UserCheck` | `UserPlusIcon` |
| Beállítások | `Settings` | `Gear` | `CogIcon` |
| Szerkesztés | `Pencil` | `PencilSimple` | `PencilIcon` |
| Törlés | `Trash2` | `Trash` | `TrashIcon` |
| Asztal | `Table` | `Table` | - |
| Mentés | `Save` | `FloppyDisk` | - |
| Keresés | `Search` | `MagnifyingGlass` | `MagnifyingGlassIcon` |
| Szűrő | `Filter` | `Funnel` | `FunnelIcon` |
| Export | `Download` | `DownloadSimple` | `ArrowDownTrayIcon` |
| Import | `Upload` | `UploadSimple` | `ArrowUpTrayIcon` |

---

## Ajánlásom

### 🥇 **1. Phosphor Icons (Light vagy Regular weight)**

**Miért:**
- Hatalmas választék (7000+)
- A `light` weight nagyon elegáns, luxus érzetet kelt
- `duotone` verzió visszafogott árnyékkal egyedi és profi
- Tökéletesen illik a CEO Gála arculathoz

**Implementáció:**
```tsx
import { User, Envelope, CreditCard, QrCode } from '@phosphor-icons/react';

// Konzisztens stílus az egész appban:
const iconProps = {
  weight: 'light' as const,
  size: 20,
  className: 'text-gala-navy'
};

<User {...iconProps} />
<Envelope {...iconProps} />
```

### 🥈 **2. Lucide Icons**

**Miért:**
- Nagyon tiszta, modern
- Kisebb bundle méret
- Egyszerűbb API
- Ha kevesebb ikont használsz, ez a jobb választás

**Implementáció:**
```tsx
import { User, Mail, CreditCard, QrCode } from 'lucide-react';

<User className="w-5 h-5 text-gala-navy" strokeWidth={1.5} />
```

---

## Színhasználat Javaslat

```css
/* Alap ikonok - Navy */
.icon-default { color: #1A1F35; }

/* Interaktív/hover - Gold */
.icon-interactive:hover { color: #D4A84B; }

/* Siker - visszafogott zöld */
.icon-success { color: #059669; } /* emerald-600 */

/* Figyelmeztetés - visszafogott sárga */
.icon-warning { color: #D97706; } /* amber-600 */

/* Hiba - visszafogott piros */
.icon-error { color: #DC2626; } /* red-600 */

/* Inaktív - szürke */
.icon-disabled { color: #9CA3AF; } /* gray-400 */
```

---

## Bundle Méret Összehasonlítás

| Készlet | Teljes | Tree-shaking után (10 ikon) |
|---------|--------|----------------------------|
| Lucide | ~180KB | ~15KB |
| Heroicons | ~120KB | ~10KB |
| Phosphor | ~500KB | ~20KB |
| Tabler | ~400KB | ~18KB |
| Feather | ~50KB | ~8KB |

---

## Következő Lépések

1. Válaszd ki a preferált készletet
2. Telepítés: `npm install [csomag-név]`
3. Cseréld ki a jelenlegi inline SVG-ket a komponensekre
4. Állíts be konzisztens méretet és színeket

Kérdésed van? Szívesen segítek a migrációban!
