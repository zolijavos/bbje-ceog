/**
 * Screenshot Script for CEO Gala Pages
 * Run with: BASE_URL=http://localhost:3001 node scripts/screenshots.mjs
 *
 * Prerequisites: npx prisma db seed (to create test data)
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = join(__dirname, '../screenshots');

// Test data IDs from seed (update if re-seeded)
const TEST_GUESTS = {
  VIP_INVITED: 60,      // Dr. Kovács János - invited VIP
  VIP_REGISTERED: 61,   // Nagy Éva - registered VIP
  VIP_APPROVED: 62,     // Szabó Péter - approved VIP with ticket
  PAYING_PAID: 63,      // Kiss Anna - paid single ticket
  PAYING_PENDING: 64,   // Tóth Gábor - pending payment (registered)
  PAYING_PAIRED: 65,    // Molnár László - paired ticket
};

// Admin credentials
const ADMIN_EMAIL = 'admin@ceogala.test';
const ADMIN_PASSWORD = 'Admin123!';

// All pages to capture
const pages = [
  // ============================================
  // PUBLIC PAGES (no auth required)
  // ============================================
  { name: '01-admin-login', path: '/admin/login', desc: 'Admin bejelentkezés' },
  { name: '02-checkin-scanner', path: '/checkin', mobile: true, desc: 'QR Check-in szkenner' },

  // ============================================
  // REGISTRATION PAGES (with valid guest_id)
  // ============================================
  { name: '03-register-landing', path: '/register', desc: 'Regisztráció - érvénytelen link' },
  { name: '04-register-request-link', path: '/register/request-link', desc: 'Magic link kérés form' },
  { name: '05-register-vip', path: `/register/vip?guest_id=${TEST_GUESTS.VIP_INVITED}`, desc: 'VIP regisztráció (invited)' },
  { name: '06-register-paid', path: `/register/paid?guest_id=${TEST_GUESTS.PAYING_PENDING}`, desc: 'Fizetős regisztráció (pending)' },
  { name: '07-register-success-vip', path: `/register/success?guest_id=${TEST_GUESTS.VIP_APPROVED}&type=vip`, desc: 'Sikeres VIP regisztráció' },
  { name: '08-register-success-paid', path: `/register/success?guest_id=${TEST_GUESTS.PAYING_PAID}&type=paid`, desc: 'Sikeres fizetős regisztráció' },

  // ============================================
  // PAYMENT PAGES
  // ============================================
  { name: '09-payment-success', path: '/payment/success', desc: 'Sikeres fizetés' },
  { name: '10-payment-cancel', path: '/payment/cancel', desc: 'Fizetés megszakítva' },

  // ============================================
  // STATUS PAGE
  // ============================================
  { name: '11-status', path: `/status?guest_id=${TEST_GUESTS.VIP_APPROVED}`, desc: 'Regisztráció státusz' },
];

// Admin pages (require authentication)
const adminPages = [
  { name: '19-admin-dashboard', path: '/admin', desc: 'Admin Dashboard' },
  { name: '20-admin-guests', path: '/admin/guests', desc: 'Vendéglista' },
  { name: '21-admin-guests-import', path: '/admin/guests/import', desc: 'CSV import' },
  { name: '22-admin-checkin-log', path: '/admin/checkin-log', desc: 'Check-in napló' },
  { name: '23-admin-tables', path: '/admin/tables', desc: 'Asztalok kezelése' },
  { name: '24-admin-seating', path: '/admin/seating', desc: 'Ültetési rend' },
];

async function takeScreenshots() {
  console.log('Starting screenshot capture...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${SCREENSHOT_DIR}\n`);

  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();

  // Desktop context
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const desktopPage = await desktopContext.newPage();

  // Mobile context
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mobilePage = await mobileContext.newPage();

  // ============================================
  // CAPTURE PUBLIC PAGES
  // ============================================
  console.log('--- PUBLIC PAGES ---\n');

  for (const pageInfo of pages) {
    const url = `${BASE_URL}${pageInfo.path}`;
    console.log(`${pageInfo.name}: ${pageInfo.desc}`);
    console.log(`   ${pageInfo.path}`);

    try {
      await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await desktopPage.waitForTimeout(500);
      await desktopPage.screenshot({
        path: join(SCREENSHOT_DIR, `${pageInfo.name}-desktop.png`),
        fullPage: true,
      });
      console.log(`   [OK] Desktop`);

      if (pageInfo.mobile) {
        await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await mobilePage.waitForTimeout(500);
        await mobilePage.screenshot({
          path: join(SCREENSHOT_DIR, `${pageInfo.name}-mobile.png`),
          fullPage: true,
        });
        console.log(`   [OK] Mobile`);
      }
    } catch (error) {
      console.log(`   [ERROR] ${error.message}`);
    }
    console.log('');
  }

  // ============================================
  // CAPTURE ADMIN PAGES (with authentication)
  // ============================================
  console.log('\n--- ADMIN PAGES (with auth) ---\n');

  // Create authenticated context
  const authContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const authPage = await authContext.newPage();

  // Login first
  console.log('Logging in as admin...');
  try {
    await authPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    // Wait for form to be ready
    await authPage.waitForSelector('input#email', { timeout: 5000 });

    // Clear and fill email field (use type for React compatibility)
    const emailInput = authPage.locator('input#email');
    await emailInput.click();
    await emailInput.fill(ADMIN_EMAIL);

    // Clear and fill password field
    const passwordInput = authPage.locator('input#password');
    await passwordInput.click();
    await passwordInput.fill(ADMIN_PASSWORD);

    // Small delay for React state to update
    await authPage.waitForTimeout(100);

    // Click submit and wait for navigation
    await Promise.all([
      authPage.waitForURL(url => !url.toString().includes('/admin/login'), { timeout: 15000 }),
      authPage.click('button[type="submit"]'),
    ]);

    console.log('   [OK] Logged in successfully\n');
  } catch (error) {
    // Check if we're already logged in despite the error
    const currentUrl = authPage.url();
    if (currentUrl.includes('/admin') && !currentUrl.includes('/admin/login')) {
      console.log('   [OK] Logged in (redirected to admin)\n');
    } else {
      console.log(`   [WARN] Login issue: ${error.message}`);
      console.log('   Attempting to continue...\n');
    }
  }

  // Capture admin pages
  for (const pageInfo of adminPages) {
    const url = `${BASE_URL}${pageInfo.path}`;
    console.log(`${pageInfo.name}: ${pageInfo.desc}`);
    console.log(`   ${pageInfo.path}`);

    try {
      await authPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

      // Wait for content to load (no more "Betöltés..." spinners)
      try {
        await authPage.waitForSelector('text=Betöltés...', { state: 'hidden', timeout: 10000 });
      } catch (e) {
        // If no loading spinner found, that's fine
      }

      await authPage.waitForTimeout(1000); // Extra time for data to render
      await authPage.screenshot({
        path: join(SCREENSHOT_DIR, `${pageInfo.name}-desktop.png`),
        fullPage: true,
      });
      console.log(`   [OK] Desktop`);
    } catch (error) {
      console.log(`   [ERROR] ${error.message}`);
    }
    console.log('');
  }

  await browser.close();
  console.log('\nScreenshots complete!');
  console.log(`Files saved to: ${SCREENSHOT_DIR}`);
}

takeScreenshots().catch(console.error);
