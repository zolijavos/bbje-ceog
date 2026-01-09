---
stepsCompleted: []
inputDocuments:
  - docs/research-technical-2025-11-27.md
  - docs/research-atdd-testing-2025-11-27.md
workflowType: 'ux-design'
lastStep: 0
project_name: 'BBJ Events 2026'
user_name: 'Javo!'
date: '2026-01-09'
designDirection:
  primaryColor: '#000D38'
  textColor: '#ffffff'
  accentColors: ['#1b2e4a', '#2a3f5f', '#3a5070']
  neutralColors: ['#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6']
  typography: 'Inter'
  iconStyle: 'monochrome'
  targetAudience: ['VIP guests', 'paying guests']
  pages: ['registration', 'PWA dashboard', 'PWA profile', 'PWA ticket', 'PWA table']
---

# UX Design Specification: BBJ Events 2026

**Author:** Javo!
**Date:** 2026-01-09

---

## Design Brief

### Client Reference
A kliens által megadott referencia kép alapján:
- **Esemény:** BBJ Events 2026
- **Dátum:** Friday, March 27, 2026
- **Helyszín:** Grand Ballroom, Corinthia Hotel Budapest
- **Stílus:** Elegáns, exkluzív, VIP meghívás-alapú

### Design Irányelvek (Kliens Kérés)

| Elem | Specifikáció |
|------|--------------|
| **Alapszín** | Sötét navy kék `#000D38` (RGB: 0, 13, 56) |
| **Szöveg** | Fehér `#ffffff` |
| **Másodlagos színek** | Navy árnyalatok + szürke árnyalatok |
| **Ikonok** | Monokróm (nincs színes ikon!) |
| **Tipográfia** | Inter (sans-serif) |
| **Hangulat** | Exkluzív, professzionális, VIP |

---

## Színpaletta

### Primary & Brand Colors

| Név | HEX | RGB | Használat |
|-----|-----|-----|-----------|
| **Primary** | `#000D38` | rgb(0, 13, 56) | Fő brand szín, dark mode háttér |
| **Primary Light** | `#0A1A4A` | rgb(10, 26, 74) | Hover állapot (dark mode) |
| **Primary Lighter** | `#1A2D5C` | rgb(26, 45, 92) | Active/pressed állapot |
| **Primary Subtle** | `#2A4070` | rgb(42, 64, 112) | Borders, dividers (dark mode) |

### Neutral Colors (Szürke skála)

| Név | HEX | Használat - Dark Mode | Használat - Light Mode |
|-----|-----|----------------------|------------------------|
| **Gray 900** | `#111827` | - | Szöveg (elsődleges) |
| **Gray 700** | `#374151` | - | Szöveg (másodlagos) |
| **Gray 500** | `#6B7280` | Disabled szöveg | Disabled szöveg |
| **Gray 400** | `#9CA3AF` | Másodlagos szöveg | Placeholder |
| **Gray 200** | `#E5E7EB` | Borders | Borders, dividers |
| **Gray 100** | `#F3F4F6` | - | Háttér (kártyák) |
| **Gray 50** | `#F9FAFB` | - | Háttér (oldal) |
| **White** | `#FFFFFF` | Szöveg (elsődleges) | Háttér (tiszta) |

### Status Colors (Tompított, brandhez illő)

| Státusz | Dark Mode | Light Mode | Használat |
|---------|-----------|------------|-----------|
| **Success** | `#059669` | `#10B981` | Sikeres művelet, check-in OK |
| **Success BG** | `#064E3B` | `#D1FAE5` | Háttér (alert) |
| **Error** | `#DC2626` | `#EF4444` | Hiba, sikertelen fizetés |
| **Error BG** | `#7F1D1D` | `#FEE2E2` | Háttér (alert) |
| **Warning** | `#D97706` | `#F59E0B` | Figyelmeztetés, lejáró link |
| **Warning BG** | `#78350F` | `#FEF3C7` | Háttér (alert) |

### Témák Összefoglalása

#### Dark Mode (Alapértelmezett)
```
Háttér:        #000D38 (primary)
Kártya háttér: #0A1A4A (primary-light)
Szöveg:        #FFFFFF (white)
Másodlagos:    #9CA3AF (gray-400)
Border:        #2A4070 (primary-subtle)
Hover:         #1A2D5C (primary-lighter)
```

#### Light Mode
```
Háttér:        #F9FAFB (gray-50)
Kártya háttér: #FFFFFF (white)
Szöveg:        #111827 (gray-900)
Másodlagos:    #6B7280 (gray-500)
Border:        #E5E7EB (gray-200)
Hover:         #F3F4F6 (gray-100)
Accent:        #000D38 (primary)
```

### Interaktív Elemek

#### Gombok - Dark Mode
| Típus | Alap | Hover | Active | Disabled |
|-------|------|-------|--------|----------|
| **Primary** | `#FFFFFF` bg, `#000D38` text | `#E5E7EB` bg | `#D1D5DB` bg | `#6B7280` bg, `#9CA3AF` text |
| **Secondary** | `transparent` bg, `#FFFFFF` border | `#0A1A4A` bg | `#1A2D5C` bg | `#374151` border |
| **Ghost** | `transparent` | `#0A1A4A` bg | `#1A2D5C` bg | `#6B7280` text |

#### Gombok - Light Mode
| Típus | Alap | Hover | Active | Disabled |
|-------|------|-------|--------|----------|
| **Primary** | `#000D38` bg, `#FFFFFF` text | `#0A1A4A` bg | `#1A2D5C` bg | `#9CA3AF` bg, `#6B7280` text |
| **Secondary** | `transparent` bg, `#000D38` border | `#F3F4F6` bg | `#E5E7EB` bg | `#E5E7EB` border |
| **Ghost** | `transparent` | `#F3F4F6` bg | `#E5E7EB` bg | `#9CA3AF` text |

---

## Tipográfia

### Font Family

| Használat | Font | Weight | Méret |
|-----------|------|--------|-------|
| **Headings (H1)** | Inter | 600 (SemiBold) | 32px |
| **Headings (H2)** | Inter | 600 (SemiBold) | 24px |
| **Headings (H3)** | Inter | 500 (Medium) | 20px |
| **Body** | Inter | 400 (Regular) | 16px |
| **Small** | Inter | 400 (Regular) | 14px |
| **Caption** | Inter | 400 (Regular) | 12px |
| **Button** | Inter | 500 (Medium) | 18px |
| **Input** | Inter | 400 (Regular) | 16px |

### Line Height

| Típus | Line Height |
|-------|-------------|
| Headings | 1.2 |
| Body | 1.5 |
| Button/Input | 1.25 |

### Letter Spacing

| Típus | Letter Spacing |
|-------|----------------|
| Headings | -0.02em |
| Body | 0 |
| ALL CAPS | 0.05em |

---

## Wireframe-ek

### Elkészült Wireframe-ek

| Fájl | Mód | Képernyők |
|------|-----|-----------|
| `bbj-events-2026-wireframes.excalidraw` | Dark Mode | 6 |
| `bbj-events-2026-wireframes-light.excalidraw` | Light Mode | 6 |

**Teljes útvonalak:**
- `/var/www/ceog/docs/excalidraw-diagrams/bbj-events-2026-wireframes.excalidraw`
- `/var/www/ceog/docs/excalidraw-diagrams/bbj-events-2026-wireframes-light.excalidraw`

### Képernyők

| # | Képernyő | Leírás | Fő Elemek |
|---|----------|--------|-----------|
| 1 | PWA Login | Kód alapú belépés | Logo, kód input (CEOG-XXXXXX), Belépés gomb |
| 2 | PWA Dashboard | Főképernyő | Üdvözlés, QR jegy kártya, Asztal kártya, Profil kártya |
| 3 | PWA Ticket | QR jegy megjelenítés | Nagy QR kód, Vendég név, Esemény adatok |
| 4 | PWA Table | Asztal információ | Asztal szám badge, Szék szám, Típus |
| 5 | VIP Registration | Részvétel megerősítés | Form mezők, GDPR checkbox, Igen/Nem gombok |
| 6 | Payment Success | Sikeres fizetés | Siker ikon, QR jegy kártya, PWA mentés gomb |

### Megnyitás

- **Excalidraw.com** → File → Open → fájl kiválasztása
- **VS Code** → Excalidraw extension telepítése → fájl megnyitása

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->
