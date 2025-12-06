import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const SCREENSHOTS_DIR = './tests/screenshots/design-review';

// All public-facing pages to capture
const pages = [
  // Public pages
  { name: '01-homepage', url: '/', description: 'Landing page' },
  { name: '02-help', url: '/help', description: 'Help page' },

  // Registration flow
  { name: '10-register-landing', url: '/register', description: 'Register landing (no params)' },
  { name: '11-register-request-link', url: '/register/request-link', description: 'Request magic link' },

  // Payment pages
  { name: '20-payment-success', url: '/payment/success', description: 'Payment success' },
  { name: '21-payment-cancel', url: '/payment/cancel', description: 'Payment cancelled' },

  // Check-in
  { name: '30-checkin', url: '/checkin', description: 'Check-in scanner' },

  // Application
  { name: '40-apply', url: '/apply', description: 'Public application form' },

  // PWA pages
  { name: '50-pwa-login', url: '/pwa', description: 'PWA login page' },
  { name: '51-pwa-offline', url: '/pwa/offline', description: 'PWA offline page' },

  // Admin login
  { name: '60-admin-login', url: '/admin/login', description: 'Admin login page' },
];

// Admin pages (require auth)
const adminPages = [
  { name: '70-admin-dashboard', url: '/admin', description: 'Admin dashboard' },
  { name: '71-admin-guests', url: '/admin/guests', description: 'Guest management' },
  { name: '72-admin-applicants', url: '/admin/applicants', description: 'Applicant review' },
  { name: '73-admin-seating', url: '/admin/seating', description: 'Seating management' },
  { name: '74-admin-statistics', url: '/admin/statistics', description: 'Statistics' },
  { name: '75-admin-help', url: '/admin/help', description: 'Admin help' },
];

async function captureScreenshots() {
  // Create directory
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  const results = [];

  console.log('📸 Capturing public pages...\n');

  // Capture public pages
  for (const pageInfo of pages) {
    try {
      console.log(`  → ${pageInfo.name}: ${pageInfo.url}`);
      await page.goto(`${BASE_URL}${pageInfo.url}`, {
        waitUntil: 'networkidle',
        timeout: 15000
      });
      await page.waitForTimeout(500); // Wait for animations

      const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageInfo.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      results.push({ ...pageInfo, status: '✓', path: screenshotPath });
    } catch (error) {
      console.log(`    ⚠ Error: ${error.message}`);
      results.push({ ...pageInfo, status: '✗', error: error.message });
    }
  }

  console.log('\n🔐 Logging in to admin...');

  // Login to admin
  try {
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Wait for React hydration

    // Fill login form
    await page.locator('input#email').fill('admin@ceogala.test');
    await page.locator('input#password').fill('Admin123!');

    // Submit and wait for navigation (NextAuth uses window.location.href after signIn)
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log(`  Current URL after login: ${currentUrl}`);

    // Check if we're logged in by looking at URL
    const isLoggedIn = currentUrl.includes('/admin') && !currentUrl.includes('/login');

    if (isLoggedIn) {
      console.log('  ✓ Logged in successfully\n');
    } else {
      // Try direct cookie approach - NextAuth stores session in cookies
      console.log('  ⚠ Login may have failed, checking for error message...');
      const errorText = await page.locator('[role="alert"]').textContent().catch(() => null);
      if (errorText) {
        console.log(`  Error: ${errorText}`);
      }
      console.log('  Continuing to try admin pages anyway...\n');
    }

    console.log('📸 Capturing admin pages...\n');

    // Capture admin pages - use 'load' instead of 'networkidle' due to polling
    for (const pageInfo of adminPages) {
      try {
        console.log(`  → ${pageInfo.name}: ${pageInfo.url}`);
        await page.goto(`${BASE_URL}${pageInfo.url}`, {
          waitUntil: 'load',
          timeout: 30000
        });
        // Wait for content to render
        await page.waitForTimeout(2000);

        const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageInfo.name}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });

        results.push({ ...pageInfo, status: '✓', path: screenshotPath });
      } catch (error) {
        console.log(`    ⚠ Error: ${error.message}`);
        results.push({ ...pageInfo, status: '✗', error: error.message });
      }
    }
  } catch (error) {
    console.log(`  ✗ Login failed: ${error.message}`);
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SCREENSHOT CAPTURE SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.status === '✓');
  const failed = results.filter(r => r.status === '✗');

  console.log(`\n✓ Successful: ${successful.length}`);
  console.log(`✗ Failed: ${failed.length}`);
  console.log(`\nScreenshots saved to: ${SCREENSHOTS_DIR}/`);

  if (successful.length > 0) {
    console.log('\nCaptured pages:');
    successful.forEach(r => console.log(`  • ${r.name} - ${r.description}`));
  }

  if (failed.length > 0) {
    console.log('\nFailed pages:');
    failed.forEach(r => console.log(`  • ${r.name}: ${r.error}`));
  }

  // Create index HTML for easy viewing
  const indexHtml = `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>CEO Gála - Design Review Screenshots</title>
  <style>
    body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #262626; border-bottom: 3px solid #00A0A0; padding-bottom: 10px; }
    h2 { color: #00A0A0; margin-top: 40px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
    .card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .card img { width: 100%; height: auto; border-bottom: 1px solid #e5e5e5; }
    .card-info { padding: 15px; }
    .card-info h3 { margin: 0 0 5px; color: #262626; font-size: 14px; }
    .card-info p { margin: 0; color: #737373; font-size: 12px; }
    .card-info code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
  </style>
</head>
<body>
  <h1>🎨 CEO Gála - Design Review</h1>
  <p>Screenshots captured on ${new Date().toLocaleString('hu-HU')}</p>

  <h2>Public Pages</h2>
  <div class="grid">
    ${successful.filter(r => parseInt(r.name) < 60).map(r => `
    <div class="card">
      <a href="${r.name}.png" target="_blank"><img src="${r.name}.png" alt="${r.description}"></a>
      <div class="card-info">
        <h3>${r.description}</h3>
        <p><code>${r.url}</code></p>
      </div>
    </div>
    `).join('')}
  </div>

  <h2>Admin Pages</h2>
  <div class="grid">
    ${successful.filter(r => parseInt(r.name) >= 60).map(r => `
    <div class="card">
      <a href="${r.name}.png" target="_blank"><img src="${r.name}.png" alt="${r.description}"></a>
      <div class="card-info">
        <h3>${r.description}</h3>
        <p><code>${r.url}</code></p>
      </div>
    </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'index.html'), indexHtml);
  console.log(`\n📄 Created index.html for easy viewing`);
  console.log(`   Open: ${SCREENSHOTS_DIR}/index.html`);
}

captureScreenshots().catch(console.error);
