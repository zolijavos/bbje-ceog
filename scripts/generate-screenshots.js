/**
 * Screenshot Generator for Manual Testing Guide
 *
 * Generates screenshots for all sections of the testing guide.
 * Run with: node scripts/generate-screenshots.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots');

// Test credentials
const ADMIN_EMAIL = 'admin@ceogala.test';
const ADMIN_PASSWORD = 'Admin123!';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateScreenshots() {
  console.log('Starting screenshot generation...');
  ensureDir(SCREENSHOTS_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // 1. Admin Login Page
    console.log('1. Admin Login Page...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-login.png'),
      fullPage: false
    });

    // 2. Login and go to Guest List (admin dashboard redirects to guests)
    console.log('2. Logging in...');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await sleep(3000);

    // Wait for redirect and page load
    await page.waitForLoadState('networkidle');
    await sleep(2000);

    // 3. Guest List
    console.log('3. Guest List...');
    await page.goto(`${BASE_URL}/admin/guests`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'guest-list.png'),
      fullPage: false
    });

    // Copy as admin-dashboard too
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-dashboard.png'),
      fullPage: false
    });

    // 4. Seating page
    console.log('4. Seating Management...');
    await page.goto(`${BASE_URL}/admin/seating`, { waitUntil: 'networkidle' });
    await sleep(3000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'seating-map.png'),
      fullPage: false
    });

    // 5. Check-in page (public page, not admin)
    console.log('5. Check-in Page...');
    await page.goto(`${BASE_URL}/checkin`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'checkin-scanner.png'),
      fullPage: false
    });

    // 6. Check-in Log
    console.log('6. Check-in Log...');
    await page.goto(`${BASE_URL}/admin/checkin-log`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'checkin-log.png'),
      fullPage: false
    });

    // 7. Applicants page
    console.log('7. Applicants...');
    await page.goto(`${BASE_URL}/admin/applicants`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'applicants.png'),
      fullPage: false
    });

    // 8. Tables page
    console.log('8. Tables...');
    await page.goto(`${BASE_URL}/admin/tables`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'tables.png'),
      fullPage: false
    });

    // Close admin session
    await context.close();

    // New context for PWA (mobile viewport)
    const pwaContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const pwaPage = await pwaContext.newPage();

    // 9. PWA Login
    console.log('9. PWA Login...');
    await pwaPage.goto(`${BASE_URL}/pwa`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await pwaPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'pwa-login.png'),
      fullPage: false
    });

    // 10. Public Apply page
    console.log('10. Apply Page...');
    await pwaPage.goto(`${BASE_URL}/apply`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await pwaPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'apply-form.png'),
      fullPage: false
    });

    // 11. Registration page (without valid code - shows error/request link)
    console.log('11. Registration Page...');
    await pwaPage.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await pwaPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'register-page.png'),
      fullPage: false
    });

    // 12. Request Link page
    console.log('12. Request Link Page...');
    await pwaPage.goto(`${BASE_URL}/register/request-link`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await pwaPage.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'request-link.png'),
      fullPage: false
    });

    await pwaContext.close();

    console.log('Screenshots generated successfully!');
    console.log(`Location: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('Error generating screenshots:', error);
  } finally {
    await browser.close();
  }
}

generateScreenshots();
