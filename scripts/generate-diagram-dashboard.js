#!/usr/bin/env node
/**
 * CEO Gala Diagram Dashboard Generator
 * Reads Excalidraw JSON files and generates a portable HTML with embedded SVGs
 * Branding: CEO Gala Design System
 * Features: Dark mode, Language switch (EN/HU), Notes with CSV export/import
 */

const fs = require('fs');
const path = require('path');

const DIAGRAMS_DIR = path.join(__dirname, '../docs/diagrams');
const OUTPUT_FILE = path.join(DIAGRAMS_DIR, 'diagram-dashboard.html');

// Diagram metadata with bilingual descriptions
const DIAGRAM_CONFIG = [
  // === FLOW DIAGRAMS ===
  {
    file: '01-guest-registration-flow.excalidraw',
    id: 'guest-registration',
    title: { en: 'Guest Registration Flow', hu: 'Vendég Regisztrációs Folyamat' },
    category: 'flow',
    description: {
      en: `This diagram illustrates the complete guest registration journey from the moment they receive their magic link invitation to the final ticket issuance. The flow differentiates between VIP guests (complimentary attendance) and paying guests, handling both single and paired ticket scenarios.`,
      hu: `Ez a diagram a teljes vendég regisztrációs folyamatot mutatja be a magic link meghívó fogadásától a jegy kiállításáig. A folyamat megkülönbözteti a VIP vendégeket (ingyenes részvétel) és a fizető vendégeket.`
    }
  },
  {
    file: '01-vip-registration-flow.excalidraw',
    id: 'vip-registration',
    title: { en: 'VIP Registration Flow', hu: 'VIP Regisztrációs Folyamat' },
    category: 'flow',
    description: {
      en: `Detailed VIP guest registration flow - from magic link click through instant ticket generation. VIP guests receive complimentary attendance and skip the payment process entirely.`,
      hu: `Részletes VIP vendég regisztrációs folyamat - magic link kattintástól az azonnali jegygenerálásig. A VIP vendégek ingyenes részvételt kapnak és kihagyják a fizetési folyamatot.`
    }
  },
  {
    file: '02-admin-dashboard-flow.excalidraw',
    id: 'admin-dashboard',
    title: { en: 'Admin Dashboard Flow', hu: 'Admin Dashboard Folyamat' },
    category: 'flow',
    description: {
      en: `Administrator workflow through the dashboard interface. Key capabilities include CSV import, guest management, payment approval, seating arrangements, and check-in statistics monitoring.`,
      hu: `Az adminisztrátor munkamenete a dashboard felületen. Fő funkciók: CSV importálás, vendégkezelés, fizetés jóváhagyás, ültetési rend és check-in statisztikák.`
    }
  },
  {
    file: '02-paid-registration-flow.excalidraw',
    id: 'paid-registration',
    title: { en: 'Paid Registration Flow', hu: 'Fizetős Regisztrációs Folyamat' },
    category: 'flow',
    description: {
      en: `Complete flow for paying guests including single and paired tickets. Supports Stripe card payment and bank transfer with manual approval. Single: 25,000 HUF, Paired: 45,000 HUF.`,
      hu: `Teljes folyamat fizető vendégeknek egyéni és páros jegyekkel. Támogatja a Stripe kártyás fizetést és banki átutalást manuális jóváhagyással. Egyéni: 25 000 Ft, Páros: 45 000 Ft.`
    }
  },
  {
    file: '03-checkin-staff-flow.excalidraw',
    id: 'checkin-staff',
    title: { en: 'Check-in Staff Flow', hu: 'Check-in Staff Folyamat' },
    category: 'flow',
    description: {
      en: `Mobile check-in application workflow for event staff. QR code scanning with color-coded results: green (valid), yellow (duplicate), red (invalid). Admin override capability included.`,
      hu: `Mobil check-in alkalmazás munkafolyamata a személyzet számára. QR kód beolvasás színkódolt eredményekkel: zöld (érvényes), sárga (duplikált), piros (érvénytelen).`
    }
  },
  {
    file: '03-pwa-app-flow.excalidraw',
    id: 'pwa-app',
    title: { en: 'PWA App Flow', hu: 'PWA Alkalmazás Folyamat' },
    category: 'flow',
    description: {
      en: `Progressive Web App navigation flow for guests. Features include QR ticket display, profile management, table information, and offline support.`,
      hu: `Progresszív webalkalmazás navigációs folyamat vendégeknek. Funkciók: QR jegy megjelenítés, profil kezelés, asztalinformáció, offline támogatás.`
    }
  },
  {
    file: '04-application-flow.excalidraw',
    id: 'application',
    title: { en: 'Application Flow', hu: 'Jelentkezési Folyamat' },
    category: 'flow',
    description: {
      en: `Public application flow for non-invited guests. Submit application, admin review, approve/reject decision, magic link generation for approved applicants.`,
      hu: `Nyilvános jelentkezési folyamat nem meghívott vendégeknek. Jelentkezés beküldés, admin áttekintés, jóváhagyás/elutasítás, magic link generálás.`
    }
  },
  {
    file: '04-state-machine.excalidraw',
    id: 'state-machine',
    title: { en: 'State Machine Diagram', hu: 'Állapotgép Diagram' },
    category: 'flow',
    description: {
      en: `Comprehensive view of all entity state transitions. Guest status, payment states, and table assignment transitions throughout the event lifecycle.`,
      hu: `Átfogó kép az összes entitás állapotátmenetéről. Vendég státusz, fizetési állapotok és asztal hozzárendelések az esemény életciklusa során.`
    }
  },
  {
    file: '05-payment-flow.excalidraw',
    id: 'payment-flow',
    title: { en: 'Payment Flow', hu: 'Fizetési Folyamat' },
    category: 'flow',
    description: {
      en: `Dual payment processing paths: Stripe Checkout for card payments, bank transfer with manual approval. Both paths converge at JWT QR code ticket generation.`,
      hu: `Kettős fizetési útvonal: Stripe Checkout kártyás fizetéshez, banki átutalás manuális jóváhagyással. Mindkét útvonal a JWT QR kód jegygenerálásnál találkozik.`
    }
  },
  {
    file: '06-system-architecture.excalidraw',
    id: 'system-architecture',
    title: { en: 'System Architecture', hu: 'Rendszer Architektúra' },
    category: 'flow',
    description: {
      en: `Technical architecture across four layers: Client (registration, admin, PWA), Application (Next.js 14+, Prisma), Data (MySQL/PostgreSQL), External (Stripe, SMTP, JWT).`,
      hu: `Technikai architektúra négy rétegben: Kliens (regisztráció, admin, PWA), Alkalmazás (Next.js 14+, Prisma), Adat (MySQL/PostgreSQL), Külső (Stripe, SMTP, JWT).`
    }
  },
  {
    file: '07-pwa-guest-app-flow.excalidraw',
    id: 'pwa-guest-app',
    title: { en: 'PWA Guest App Flow', hu: 'PWA Vendég App Folyamat' },
    category: 'flow',
    description: {
      en: `Detailed PWA guest application flow including authentication, dashboard, ticket display, profile editing, and table information screens.`,
      hu: `Részletes PWA vendég alkalmazás folyamat: hitelesítés, dashboard, jegy megjelenítés, profil szerkesztés és asztal információ képernyők.`
    }
  },
  {
    file: '08-applicant-flow.excalidraw',
    id: 'applicant',
    title: { en: 'Applicant Flow', hu: 'Jelentkező Folyamat' },
    category: 'flow',
    description: {
      en: `Applicant approval workflow for administrators. Review pending applications, approve with magic link generation, or reject with reason tracking.`,
      hu: `Jelentkező jóváhagyási munkafolyamat adminisztrátoroknak. Függő jelentkezések áttekintése, jóváhagyás magic link generálással, vagy elutasítás indoklással.`
    }
  },
  {
    file: '09-email-logs-admin-flow.excalidraw',
    id: 'email-logs',
    title: { en: 'Email Logs Admin Flow', hu: 'Email Napló Admin Folyamat' },
    category: 'flow',
    description: {
      en: `Email log management workflow. View email statistics, filter by status/type, view email content details, and manage email delivery logs.`,
      hu: `Email napló kezelési munkafolyamat. Email statisztikák megtekintése, szűrés státusz/típus szerint, email tartalom részletek és kézbesítési naplók kezelése.`
    }
  },
  {
    file: '10-user-management-flow.excalidraw',
    id: 'user-management',
    title: { en: 'User Management Flow', hu: 'Felhasználó Kezelés Folyamat' },
    category: 'flow',
    description: {
      en: `Admin and staff user management. Create, edit, delete users with role-based access (admin/staff). Password management with bcrypt hashing.`,
      hu: `Admin és staff felhasználó kezelés. Felhasználók létrehozása, szerkesztése, törlése szerepkör alapú hozzáféréssel (admin/staff). Jelszó kezelés bcrypt hash-eléssel.`
    }
  },
  {
    file: '11-payment-refund-flow.excalidraw',
    id: 'payment-refund',
    title: { en: 'Payment Refund Flow', hu: 'Visszatérítési Folyamat' },
    category: 'flow',
    description: {
      en: `Payment refund workflow for both Stripe and bank transfer payments. Search payment, verify status, process refund via Stripe API or manual bank transfer marking.`,
      hu: `Visszatérítési munkafolyamat Stripe és banki átutalás fizetésekhez. Fizetés keresés, státusz ellenőrzés, visszatérítés Stripe API-n vagy manuális banki jelöléssel.`
    }
  },
  // === WIREFRAMES ===
  {
    file: 'wireframes-guest-registration.excalidraw',
    id: 'wf-guest-registration',
    title: { en: 'Guest Registration UI', hu: 'Vendég Regisztráció UI' },
    category: 'wireframe',
    description: {
      en: `UI wireframes for guest registration screens including magic link landing, VIP confirmation, paid registration form, and billing details.`,
      hu: `UI wireframe-ek vendég regisztrációs képernyőkhöz: magic link landing, VIP megerősítés, fizetős regisztráció form és számlázási adatok.`
    }
  },
  {
    file: 'wireframes-pwa-guest-app.excalidraw',
    id: 'wf-pwa-guest-app',
    title: { en: 'PWA Guest App UI', hu: 'PWA Vendég App UI' },
    category: 'wireframe',
    description: {
      en: `PWA guest application wireframes: login screen, dashboard, QR ticket display, profile view/edit, and table information screens.`,
      hu: `PWA vendég alkalmazás wireframe-ek: bejelentkezés, dashboard, QR jegy megjelenítés, profil nézet/szerkesztés és asztal információ.`
    }
  },
  {
    file: 'wireframes-admin-applicant.excalidraw',
    id: 'wf-admin-applicant',
    title: { en: 'Admin Applicant UI', hu: 'Admin Jelentkező UI' },
    category: 'wireframe',
    description: {
      en: `Admin interface wireframes for applicant management: pending list, applicant details, approve/reject modals, and rejection reason input.`,
      hu: `Admin felület wireframe-ek jelentkező kezeléshez: függő lista, jelentkező részletek, jóváhagyás/elutasítás modálok és elutasítási indok.`
    }
  },
  {
    file: 'wireframes-admin-core.excalidraw',
    id: 'wf-admin-core',
    title: { en: 'Admin Core UI', hu: 'Admin Core UI' },
    category: 'wireframe',
    description: {
      en: `Core admin UI elements: login page, navigation sidebar, dashboard overview, and common UI patterns used throughout the admin interface.`,
      hu: `Core admin UI elemek: bejelentkezési oldal, navigációs oldalsáv, dashboard áttekintés és közös UI minták az admin felületen.`
    }
  },
  {
    file: 'wireframes-admin-guest-management.excalidraw',
    id: 'wf-admin-guest-mgmt',
    title: { en: 'Admin Guest Management UI', hu: 'Admin Vendégkezelés UI' },
    category: 'wireframe',
    description: {
      en: `Guest management wireframes: guest list with filters, guest details modal, CSV import dialog, and bulk action interfaces.`,
      hu: `Vendégkezelés wireframe-ek: vendéglista szűrőkkel, vendég részletek modál, CSV import dialógus és tömeges műveletek.`
    }
  },
  {
    file: 'wireframes-admin-event-operations.excalidraw',
    id: 'wf-admin-event-ops',
    title: { en: 'Admin Event Operations UI', hu: 'Admin Esemény Műveletek UI' },
    category: 'wireframe',
    description: {
      en: `Event operations wireframes: check-in dashboard, QR scanner interface, check-in log viewer, and real-time statistics display.`,
      hu: `Esemény műveletek wireframe-ek: check-in dashboard, QR szkenner felület, check-in napló nézet és valós idejű statisztikák.`
    }
  },
  {
    file: 'wireframes-admin-reports.excalidraw',
    id: 'wf-admin-reports',
    title: { en: 'Admin Reports UI', hu: 'Admin Riportok UI' },
    category: 'wireframe',
    description: {
      en: `Reporting wireframes: statistics dashboard, payment reports, check-in analytics, and export functionality interfaces.`,
      hu: `Riport wireframe-ek: statisztika dashboard, fizetési riportok, check-in analitika és export funkció felületek.`
    }
  },
  {
    file: 'wireframes-admin-seating-floorplan.excalidraw',
    id: 'wf-admin-seating',
    title: { en: 'Admin Seating Floorplan UI', hu: 'Admin Ülésrend Szerkesztő UI' },
    category: 'wireframe',
    description: {
      en: `Seating management wireframes: drag-and-drop floor plan editor, table configuration, guest assignment panel, and seating export options.`,
      hu: `Ültetési rend wireframe-ek: drag-and-drop alaprajz szerkesztő, asztal konfiguráció, vendég hozzárendelés panel és export opciók.`
    }
  },
  {
    file: 'seating-drag-drop-wireframe.excalidraw',
    id: 'wf-seating-dragdrop',
    title: { en: 'Seating Drag & Drop Detail', hu: 'Ültetés Drag & Drop Részletek' },
    category: 'wireframe',
    description: {
      en: `Detailed drag-and-drop seating interface wireframe. Shows interaction states, table cards, unassigned guest panel, and assignment feedback.`,
      hu: `Részletes drag-and-drop ültetési felület wireframe. Interakció állapotok, asztal kártyák, hozzárendeletlen vendég panel és visszajelzések.`
    }
  }
];

// UI translations
const UI_TEXTS = {
  en: {
    pageTitle: 'CEO Gala 2026',
    pageSubtitle: 'System Architecture Documentation',
    sidebarTitle: 'Diagrams',
    overview: 'Overview',
    notes: 'Notes',
    notesPlaceholder: 'Add your notes about this diagram...',
    notesHint: 'Notes are saved automatically in your browser',
    btnDark: 'Dark',
    btnLight: 'Light',
    btnExport: 'Export CSV',
    btnImport: 'Import CSV',
    btnPrint: 'Print',
    footerText: 'Event Registration System',
    footerGenerated: 'Generated',
    importSuccess: 'Notes imported successfully!',
    importError: 'Import error'
  },
  hu: {
    pageTitle: 'CEO Gala 2026',
    pageSubtitle: 'Rendszer Architektúra Dokumentáció',
    sidebarTitle: 'Diagramok',
    overview: 'Áttekintés',
    notes: 'Megjegyzések',
    notesPlaceholder: 'Írja ide a megjegyzéseit erről a diagramról...',
    notesHint: 'A megjegyzések automatikusan mentődnek a böngészőben',
    btnDark: 'Sötét',
    btnLight: 'Világos',
    btnExport: 'CSV Export',
    btnImport: 'CSV Import',
    btnPrint: 'Nyomtatás',
    footerText: 'Esemény Regisztrációs Rendszer',
    footerGenerated: 'Generálva',
    importSuccess: 'Megjegyzések sikeresen importálva!',
    importError: 'Importálási hiba'
  }
};

/**
 * Convert Excalidraw JSON to SVG string
 */
function excalidrawToSvg(excalidrawData) {
  const elements = excalidrawData.elements || [];
  if (elements.length === 0) return '<svg></svg>';

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  elements.forEach(el => {
    if (el.isDeleted) return;
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + (el.width || 0));
    maxY = Math.max(maxY, el.y + (el.height || 0));
    if (el.points) {
      el.points.forEach(p => {
        minX = Math.min(minX, el.x + p[0]);
        minY = Math.min(minY, el.y + p[1]);
        maxX = Math.max(maxX, el.x + p[0]);
        maxY = Math.max(maxY, el.y + p[1]);
      });
    }
  });

  const padding = 40;
  minX -= padding;
  minY -= padding;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  let svgContent = '';
  const sortedElements = [...elements].filter(el => !el.isDeleted);

  sortedElements.forEach(el => {
    const x = el.x - minX;
    const y = el.y - minY;
    const stroke = el.strokeColor || '#000000';
    const fill = el.backgroundColor === 'transparent' ? 'none' : (el.backgroundColor || 'none');
    const opacity = el.opacity !== undefined ? el.opacity / 100 : 1;
    const strokeWidth = el.strokeWidth || 2;

    switch (el.type) {
      case 'rectangle':
        svgContent += `<rect x="${x}" y="${y}" width="${el.width}" height="${el.height}" stroke="${stroke}" fill="${fill}" opacity="${opacity}" stroke-width="${strokeWidth}"/>`;
        break;
      case 'ellipse':
        svgContent += `<ellipse cx="${x + el.width / 2}" cy="${y + el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}" stroke="${stroke}" fill="${fill}" opacity="${opacity}" stroke-width="${strokeWidth}"/>`;
        break;
      case 'diamond':
        const dx = x + el.width / 2;
        svgContent += `<polygon points="${dx},${y} ${x + el.width},${y + el.height / 2} ${dx},${y + el.height} ${x},${y + el.height / 2}" stroke="${stroke}" fill="${fill}" opacity="${opacity}" stroke-width="${strokeWidth}"/>`;
        break;
      case 'text':
        const fontSize = el.fontSize || 16;
        const lines = (el.text || '').split('\n');
        const textAnchor = el.textAlign === 'center' ? 'middle' : (el.textAlign === 'right' ? 'end' : 'start');
        const textX = el.textAlign === 'center' ? x + (el.width || 0) / 2 : x;
        lines.forEach((line, i) => {
          svgContent += `<text x="${textX}" y="${y + fontSize + i * fontSize * 1.2}" font-size="${fontSize}" fill="${el.strokeColor || '#000'}" opacity="${opacity}" font-family="'Open Sans', system-ui, sans-serif" text-anchor="${textAnchor}">${escapeHtml(line)}</text>`;
        });
        break;
      case 'arrow':
      case 'line':
        if (el.points && el.points.length >= 2) {
          let pathD = `M ${x + el.points[0][0]} ${y + el.points[0][1]}`;
          for (let i = 1; i < el.points.length; i++) {
            pathD += ` L ${x + el.points[i][0]} ${y + el.points[i][1]}`;
          }
          const markerId = el.type === 'arrow' ? `url(#ah-${stroke.replace('#', '')})` : '';
          svgContent += `<path d="${pathD}" stroke="${stroke}" fill="none" opacity="${opacity}" stroke-width="${strokeWidth}" ${el.type === 'arrow' ? `marker-end="${markerId}"` : ''}/>`;
        }
        break;
    }
  });

  const arrowColors = [...new Set(elements.filter(el => el.type === 'arrow' && !el.isDeleted).map(el => el.strokeColor || '#000000'))];
  const markers = arrowColors.map(c => `<marker id="ah-${c.replace('#', '')}" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="${c}"/></marker>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(width)} ${Math.ceil(height)}" width="100%" style="max-width:${Math.ceil(width)}px"><defs>${markers}</defs><rect x="0" y="0" width="${width}" height="${height}" fill="#FAF8F5"/>${svgContent}</svg>`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Generate the complete HTML dashboard
 */
function generateHtml(diagrams) {
  const sidebarItems = diagrams.map((d, i) => `
          <button @click="activeTab = '${d.id}'; scrollToTop()" :class="activeTab === '${d.id}' ? 'sidebar-btn-active' : 'sidebar-btn'" class="sidebar-btn-base">
            <span class="sidebar-num">${String(i + 1).padStart(2, '0')}</span>
            <span x-text="lang === 'hu' ? '${d.title.hu}' : '${d.title.en}'"></span>
          </button>`).join('\n');

  const diagramSections = diagrams.map((d, i) => `
        <section x-show="activeTab === '${d.id}'" x-transition class="diagram-section" id="${d.id}">
          <div class="section-header">
            <span class="section-num">${String(i + 1).padStart(2, '0')}</span>
            <h2 x-text="lang === 'hu' ? '${d.title.hu}' : '${d.title.en}'"></h2>
          </div>
          <div class="description-box">
            <h3 x-text="t.overview"></h3>
            <p x-text="lang === 'hu' ? '${d.description.hu.replace(/'/g, "\\'")}' : '${d.description.en.replace(/'/g, "\\'")}'"></p>
          </div>
          <div class="diagram-area">${d.svg}</div>
          <div class="notes-section">
            <label x-text="t.notes"></label>
            <textarea x-model="notes['${d.id}']" @input="saveNotes()" rows="3" :placeholder="t.notesPlaceholder"></textarea>
            <span class="notes-hint" x-text="t.notesHint"></span>
          </div>
        </section>`).join('\n');

  const titlesJson = diagrams.map(d => `'${d.id}':lang==='hu'?'${d.title.hu}':'${d.title.en}'`).join(',');

  return `<!DOCTYPE html>
<html lang="en" x-data="appData()" :class="{ 'dark': darkMode }">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala 2026 - System Diagrams</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <style>
    :root { --gold:#D4A84B; --gold-light:#E5C87A; --gold-dark:#B8923D; --navy:#1A1F35; --navy-light:#2D3555; --charcoal:#2C2C2C; --cream:#FAF8F5; --warm-gray:#5C6370; }
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Open Sans',system-ui,sans-serif; background:var(--cream); color:var(--charcoal); line-height:1.6; }
    .dark body { background:var(--navy); color:#e5e5e5; }
    header { background:var(--navy); color:white; padding:1.25rem 2rem; border-bottom:3px solid var(--gold); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; }
    .header-title { font-family:'Playfair Display',Georgia,serif; font-size:1.5rem; font-weight:600; }
    .header-sub { font-size:0.75rem; color:var(--gold-light); text-transform:uppercase; letter-spacing:0.08em; margin-top:0.25rem; }
    .header-actions { display:flex; gap:0.5rem; flex-wrap:wrap; }
    .btn { padding:0.5rem 1rem; font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; border:none; cursor:pointer; transition:all 0.2s; font-family:'Open Sans',sans-serif; }
    .btn-gold { background:var(--gold); color:white; }
    .btn-gold:hover { background:var(--gold-dark); }
    .btn-ghost { background:transparent; color:white; border:1px solid rgba(255,255,255,0.3); }
    .btn-ghost:hover { background:rgba(255,255,255,0.1); }
    .btn-lang { background:var(--gold-dark); color:white; font-weight:700; min-width:42px; }
    input[type="file"] { display:none; }
    .container { max-width:1400px; margin:0 auto; padding:1.5rem; display:grid; grid-template-columns:260px 1fr; gap:1.5rem; }
    @media (max-width:900px) { .container { grid-template-columns:1fr; } .sidebar { display:none; } }
    .sidebar { position:sticky; top:1.5rem; height:fit-content; }
    .sidebar-panel { background:white; border:1px solid rgba(92,99,112,0.15); }
    .dark .sidebar-panel { background:var(--navy-light); border-color:rgba(255,255,255,0.1); }
    .sidebar-header { padding:1rem 1.25rem; border-bottom:1px solid rgba(92,99,112,0.1); font-family:'Playfair Display',Georgia,serif; font-size:0.85rem; font-weight:600; color:var(--navy); text-transform:uppercase; letter-spacing:0.06em; }
    .dark .sidebar-header { color:white; border-color:rgba(255,255,255,0.1); }
    .sidebar-nav { display:flex; flex-direction:column; gap:0.5rem; padding:0.75rem; }
    .sidebar-btn-base { display:flex; align-items:center; gap:0.75rem; padding:0.75rem 1rem; font-size:0.8rem; font-weight:500; text-align:left; border:none; cursor:pointer; transition:all 0.15s; font-family:'Open Sans',sans-serif; }
    .sidebar-btn { background:white; color:var(--navy); border:1px solid rgba(92,99,112,0.15); }
    .sidebar-btn:hover { background:var(--cream); border-color:var(--gold); }
    .sidebar-btn-active { background:var(--gold); color:white; border:1px solid var(--gold); }
    .dark .sidebar-btn { background:var(--navy); color:#ccc; border-color:rgba(255,255,255,0.1); }
    .dark .sidebar-btn:hover { background:var(--navy-light); }
    .sidebar-num { font-family:'Playfair Display',Georgia,serif; font-weight:600; opacity:0.5; }
    .sidebar-btn-active .sidebar-num { opacity:1; }
    .diagram-section { background:white; border:1px solid rgba(92,99,112,0.1); }
    .dark .diagram-section { background:var(--navy-light); border-color:rgba(255,255,255,0.1); }
    .section-header { display:flex; align-items:center; gap:1rem; padding:1.25rem 1.5rem; border-bottom:1px solid rgba(92,99,112,0.1); border-left:3px solid var(--gold); }
    .dark .section-header { border-bottom-color:rgba(255,255,255,0.1); }
    .section-num { font-family:'Playfair Display',Georgia,serif; font-size:1.25rem; font-weight:600; color:var(--gold); }
    .section-header h2 { font-family:'Playfair Display',Georgia,serif; font-size:1.25rem; font-weight:600; color:var(--navy); }
    .dark .section-header h2 { color:white; }
    .description-box { padding:1.25rem 1.5rem; background:linear-gradient(to right,rgba(212,168,75,0.08),rgba(212,168,75,0.02)); border-bottom:1px solid rgba(92,99,112,0.1); }
    .dark .description-box { background:linear-gradient(to right,rgba(212,168,75,0.12),rgba(212,168,75,0.04)); }
    .description-box h3 { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--gold-dark); margin-bottom:0.5rem; }
    .description-box p { font-size:0.85rem; color:var(--warm-gray); line-height:1.7; }
    .dark .description-box p { color:#b0b0b0; }
    .diagram-area { padding:1.5rem; background:var(--cream); overflow:auto; }
    .dark .diagram-area { background:rgba(0,0,0,0.15); }
    .diagram-area svg { display:block; margin:0 auto; max-width:100%; height:auto; }
    .dark .diagram-area svg { filter:invert(0.85) hue-rotate(180deg); }
    .notes-section { padding:1.25rem 1.5rem; border-top:1px solid rgba(92,99,112,0.1); }
    .dark .notes-section { border-color:rgba(255,255,255,0.1); }
    .notes-section label { display:block; font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--warm-gray); margin-bottom:0.5rem; }
    .notes-section textarea { width:100%; padding:0.75rem; font-size:0.85rem; font-family:'Open Sans',sans-serif; border:1px solid rgba(92,99,112,0.2); background:white; color:var(--charcoal); resize:vertical; transition:border-color 0.2s; }
    .notes-section textarea:focus { outline:none; border-color:var(--gold); }
    .dark .notes-section textarea { background:var(--navy); color:#e5e5e5; border-color:rgba(255,255,255,0.15); }
    .notes-hint { display:block; font-size:0.65rem; color:var(--warm-gray); margin-top:0.35rem; }
    footer { background:var(--navy); color:rgba(255,255,255,0.5); padding:1rem 2rem; text-align:center; font-size:0.65rem; margin-top:2rem; }
    footer span { color:var(--gold); font-family:'Playfair Display',Georgia,serif; }
    ::-webkit-scrollbar { width:6px; height:6px; }
    ::-webkit-scrollbar-track { background:var(--cream); }
    ::-webkit-scrollbar-thumb { background:var(--warm-gray); }
    .dark ::-webkit-scrollbar-track { background:var(--navy); }
    @media print { .no-print { display:none !important; } .container { display:block; } .sidebar { display:none; } }
  </style>
</head>
<body>
  <header class="no-print">
    <div>
      <div class="header-title" x-text="t.pageTitle"></div>
      <div class="header-sub" x-text="t.pageSubtitle"></div>
    </div>
    <div class="header-actions">
      <button @click="toggleLang()" class="btn btn-lang" x-text="lang.toUpperCase()"></button>
      <button @click="darkMode = !darkMode" class="btn btn-ghost" x-text="darkMode ? t.btnLight : t.btnDark"></button>
      <button @click="exportNotes()" class="btn btn-ghost" x-text="t.btnExport"></button>
      <button @click="$refs.fileInput.click()" class="btn btn-ghost" x-text="t.btnImport"></button>
      <input type="file" x-ref="fileInput" @change="importNotes($event)" accept=".csv">
      <button onclick="window.print()" class="btn btn-gold" x-text="t.btnPrint"></button>
    </div>
  </header>

  <div class="container">
    <aside class="sidebar no-print">
      <div class="sidebar-panel">
        <div class="sidebar-header" x-text="t.sidebarTitle"></div>
        <nav class="sidebar-nav">
${sidebarItems}
        </nav>
      </div>
    </aside>
    <main>
${diagramSections}
    </main>
  </div>

  <footer class="no-print">
    <span>CEO Gala 2026</span> &nbsp;|&nbsp; <span x-text="t.footerText"></span> &nbsp;|&nbsp; <span x-text="t.footerGenerated"></span>: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
  </footer>

  <script>
    const texts = ${JSON.stringify(UI_TEXTS)};
    function appData() {
      return {
        darkMode: false,
        lang: 'en',
        activeTab: '${diagrams[0]?.id || 'guest-registration'}',
        notes: JSON.parse(localStorage.getItem('ceogala-diagram-notes') || '{}'),
        get t() { return texts[this.lang]; },
        init() {
          const dm = localStorage.getItem('ceogala-darkMode');
          if (dm) this.darkMode = dm === 'true';
          const lg = localStorage.getItem('ceogala-lang');
          if (lg) this.lang = lg;
          this.$watch('darkMode', v => localStorage.setItem('ceogala-darkMode', v));
          this.$watch('lang', v => localStorage.setItem('ceogala-lang', v));
        },
        toggleLang() { this.lang = this.lang === 'en' ? 'hu' : 'en'; },
        saveNotes() { localStorage.setItem('ceogala-diagram-notes', JSON.stringify(this.notes)); },
        scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); },
        exportNotes() {
          const rows = [['Diagram ID', 'Title', 'Notes']];
          const titles = {${diagrams.map(d => `'${d.id}':this.lang==='hu'?'${d.title.hu}':'${d.title.en}'`).join(',')}};
          Object.entries(this.notes).forEach(([id, note]) => {
            if (note && note.trim()) rows.push([id, titles[id] || id, note.replace(/"/g, '""')]);
          });
          const csv = rows.map(r => r.map(c => \`"\${c}"\`).join(',')).join('\\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'ceogala-diagram-notes.csv';
          link.click();
        },
        importNotes(event) {
          const file = event.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const lines = e.target.result.split('\\n');
              for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                const match = line.match(/^"([^"]+)","[^"]*","(.*)"$/);
                if (match) this.notes[match[1]] = match[2].replace(/""/g, '"');
              }
              this.saveNotes();
              alert(this.t.importSuccess);
            } catch (err) { alert(this.t.importError + ': ' + err.message); }
          };
          reader.readAsText(file);
          event.target.value = '';
        }
      };
    }
  </script>
</body>
</html>`;
}

// Main
function main() {
  console.log('CEO Gala Diagram Dashboard Generator');
  console.log('='.repeat(45));

  const diagrams = [];
  for (const config of DIAGRAM_CONFIG) {
    const filePath = path.join(DIAGRAMS_DIR, config.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  [SKIP] ${config.file}`);
      continue;
    }
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      diagrams.push({ ...config, svg: excalidrawToSvg(data) });
      console.log(`  [OK] ${config.title.en}`);
    } catch (err) {
      console.error(`  [ERR] ${config.file}: ${err.message}`);
    }
  }

  if (diagrams.length === 0) {
    console.error('No diagrams processed!');
    process.exit(1);
  }

  fs.writeFileSync(OUTPUT_FILE, generateHtml(diagrams), 'utf-8');
  console.log('='.repeat(45));
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log(`Diagrams: ${diagrams.length}`);
  console.log(`Languages: EN / HU`);
}

main();
