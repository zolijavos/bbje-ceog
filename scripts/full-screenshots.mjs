/**
 * Full Screenshot Script for CEO Gala - All Pages
 * Run with: BASE_URL=http://localhost:3000 node scripts/full-screenshots.mjs
 *
 * Captures all pages: Public, Registration, Admin, PWA, Apply
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, rm } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = join(__dirname, '../screenshots/full-site');

// Test data IDs from seed
const TEST_GUESTS = {
  VIP_INVITED: 60,
  VIP_REGISTERED: 61,
  VIP_APPROVED: 62,
  PAYING_PAID: 63,
  PAYING_PENDING: 64,
  PAYING_PAIRED: 65,
};

// Admin credentials
const ADMIN_EMAIL = 'admin@ceogala.test';
const ADMIN_PASSWORD = 'Admin123!';

// PWA test code
const PWA_TEST_CODE = 'CEOG-TEST01';

// ============================================
// PAGE DEFINITIONS
// ============================================

const publicPages = [
  { name: '01-homepage', path: '/', desc: 'Kezdőlap' },
  { name: '02-help', path: '/help', desc: 'Súgó oldal' },
  { name: '03-admin-login', path: '/admin/login', desc: 'Admin bejelentkezés' },
  { name: '04-checkin-scanner', path: '/checkin', mobile: true, desc: 'QR Check-in szkenner' },
];

const registrationPages = [
  { name: '10-register-landing', path: '/register', desc: 'Regisztráció - landing' },
  { name: '11-register-request-link', path: '/register/request-link', desc: 'Magic link kérés' },
  { name: '12-register-vip', path: `/register/vip?guest_id=${TEST_GUESTS.VIP_INVITED}`, desc: 'VIP regisztráció form' },
  { name: '13-register-paid', path: `/register/paid?guest_id=${TEST_GUESTS.PAYING_PENDING}`, desc: 'Fizetős regisztráció form' },
  { name: '14-register-success-vip', path: `/register/success?guest_id=${TEST_GUESTS.VIP_APPROVED}&type=vip`, desc: 'Sikeres VIP regisztráció' },
  { name: '15-register-success-paid', path: `/register/success?guest_id=${TEST_GUESTS.PAYING_PAID}&type=paid`, desc: 'Sikeres fizetős regisztráció' },
  { name: '16-register-declined', path: `/register/declined?guest_id=${TEST_GUESTS.VIP_INVITED}`, desc: 'Visszautasított meghívó' },
];

const paymentPages = [
  { name: '20-payment-success', path: '/payment/success', desc: 'Sikeres fizetés' },
  { name: '21-payment-cancel', path: '/payment/cancel', desc: 'Fizetés megszakítva' },
];

const statusPage = [
  { name: '25-status', path: `/status?guest_id=${TEST_GUESTS.VIP_APPROVED}`, desc: 'Regisztráció státusz' },
];

const applyPages = [
  { name: '30-apply-form', path: '/apply', desc: 'Jelentkezési form (Epic 7)', mobile: true },
];

const pwaPages = [
  { name: '40-pwa-login', path: '/pwa', desc: 'PWA bejelentkezés (Epic 6)', mobile: true },
  { name: '41-pwa-offline', path: '/pwa/offline', desc: 'PWA offline oldal', mobile: true },
];

// Admin pages (require auth)
const adminPages = [
  { name: '50-admin-dashboard', path: '/admin', desc: 'Admin Dashboard' },
  { name: '51-admin-guests', path: '/admin/guests', desc: 'Vendéglista' },
  { name: '52-admin-guests-import', path: '/admin/guests/import', desc: 'CSV import' },
  { name: '53-admin-applicants', path: '/admin/applicants', desc: 'Jelentkezők kezelése (Epic 7)' },
  { name: '54-admin-checkin-log', path: '/admin/checkin-log', desc: 'Check-in napló' },
  { name: '55-admin-tables', path: '/admin/tables', desc: 'Asztalok kezelése' },
  { name: '56-admin-seating', path: '/admin/seating', desc: 'Ültetési rend (drag-drop)' },
  { name: '57-admin-statistics', path: '/admin/statistics', desc: 'Statisztikák' },
  { name: '58-admin-email-templates', path: '/admin/email-templates', desc: 'Email sablonok' },
  { name: '59-admin-help', path: '/admin/help', desc: 'Admin súgó' },
];

// ============================================
// SCREENSHOT FUNCTIONS
// ============================================

async function capturePages(page, mobilePage, pages, category) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`${category}`);
  console.log(`${'='.repeat(50)}\n`);

  for (const pageInfo of pages) {
    const url = `${BASE_URL}${pageInfo.path}`;
    console.log(`${pageInfo.name}: ${pageInfo.desc}`);
    console.log(`   ${pageInfo.path}`);

    try {
      // Desktop screenshot
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(800);

      // Hide loading spinners
      try {
        await page.waitForSelector('text=Betöltés...', { state: 'hidden', timeout: 5000 });
      } catch (e) { /* no spinner */ }

      await page.screenshot({
        path: join(SCREENSHOT_DIR, `${pageInfo.name}-desktop.png`),
        fullPage: true,
      });
      console.log(`   [OK] Desktop (1920x1080)`);

      // Mobile screenshot if needed
      if (pageInfo.mobile) {
        await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        await mobilePage.waitForTimeout(800);
        await mobilePage.screenshot({
          path: join(SCREENSHOT_DIR, `${pageInfo.name}-mobile.png`),
          fullPage: true,
        });
        console.log(`   [OK] Mobile (390x844)`);
      }
    } catch (error) {
      console.log(`   [ERROR] ${error.message}`);
    }
    console.log('');
  }
}

async function loginAdmin(page) {
  console.log('\nLogging in as admin...');
  try {
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await page.waitForSelector('input#email', { timeout: 5000 });

    await page.locator('input#email').fill(ADMIN_EMAIL);
    await page.locator('input#password').fill(ADMIN_PASSWORD);
    await page.waitForTimeout(100);

    await Promise.all([
      page.waitForURL(url => !url.toString().includes('/admin/login'), { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);

    console.log('   [OK] Logged in successfully');
    return true;
  } catch (error) {
    const currentUrl = page.url();
    if (currentUrl.includes('/admin') && !currentUrl.includes('/admin/login')) {
      console.log('   [OK] Already logged in');
      return true;
    }
    console.log(`   [ERROR] Login failed: ${error.message}`);
    return false;
  }
}

async function capturePWAAuthenticated(page, mobilePage) {
  console.log(`\n${'='.repeat(50)}`);
  console.log('PWA AUTHENTICATED PAGES');
  console.log(`${'='.repeat(50)}\n`);

  // First we need to find a guest with PWA auth code
  // For now, try to capture what we can
  const pwaAuthPages = [
    { name: '42-pwa-dashboard', path: '/pwa/dashboard', desc: 'PWA Dashboard', mobile: true },
    { name: '43-pwa-profile', path: '/pwa/profile', desc: 'PWA Profil', mobile: true },
    { name: '44-pwa-ticket', path: '/pwa/ticket', desc: 'PWA QR Jegy', mobile: true },
  ];

  for (const pageInfo of pwaAuthPages) {
    const url = `${BASE_URL}${pageInfo.path}`;
    console.log(`${pageInfo.name}: ${pageInfo.desc}`);
    console.log(`   ${pageInfo.path}`);

    try {
      await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await mobilePage.waitForTimeout(800);
      await mobilePage.screenshot({
        path: join(SCREENSHOT_DIR, `${pageInfo.name}-mobile.png`),
        fullPage: true,
      });
      console.log(`   [OK] Mobile`);
    } catch (error) {
      console.log(`   [SKIP] Requires auth: ${error.message}`);
    }
    console.log('');
  }
}

// ============================================
// MAIN
// ============================================

async function takeAllScreenshots() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     CEO GALA - FULL SITE SCREENSHOT CAPTURE         ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Output:   ${SCREENSHOT_DIR}\n`);

  // Clean and create output directory
  try {
    await rm(SCREENSHOT_DIR, { recursive: true, force: true });
  } catch (e) { /* doesn't exist */ }
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();

  // Desktop context (1920x1080)
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const desktopPage = await desktopContext.newPage();

  // Mobile context (iPhone 14 Pro)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  // 1. Public pages
  await capturePages(desktopPage, mobilePage, publicPages, 'PUBLIC PAGES');

  // 2. Registration pages
  await capturePages(desktopPage, mobilePage, registrationPages, 'REGISTRATION PAGES');

  // 3. Payment pages
  await capturePages(desktopPage, mobilePage, paymentPages, 'PAYMENT PAGES');

  // 4. Status page
  await capturePages(desktopPage, mobilePage, statusPage, 'STATUS PAGE');

  // 5. Apply pages (Epic 7)
  await capturePages(desktopPage, mobilePage, applyPages, 'APPLICANT PAGES (Epic 7)');

  // 6. PWA pages (Epic 6)
  await capturePages(desktopPage, mobilePage, pwaPages, 'PWA PAGES (Epic 6)');

  // 7. PWA authenticated pages
  await capturePWAAuthenticated(desktopPage, mobilePage);

  // 8. Admin pages (requires login)
  const authContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const authPage = await authContext.newPage();

  const loggedIn = await loginAdmin(authPage);
  if (loggedIn) {
    // Create mobile auth context
    const mobileAuthContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    const mobileAuthPage = await mobileAuthContext.newPage();

    // Copy cookies for mobile auth
    const cookies = await authContext.cookies();
    await mobileAuthContext.addCookies(cookies);

    await capturePages(authPage, mobileAuthPage, adminPages, 'ADMIN PAGES (Authenticated)');
    await mobileAuthContext.close();
  }

  await browser.close();

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║                  SCREENSHOTS COMPLETE                ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\nFiles saved to: ${SCREENSHOT_DIR}`);

  // List files
  const { readdir } = await import('fs/promises');
  const files = await readdir(SCREENSHOT_DIR);
  console.log(`\nTotal: ${files.length} screenshots\n`);
}

takeAllScreenshots().catch(console.error);
