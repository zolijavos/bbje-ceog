/**
 * Extra Admin Screenshots - Missing pages from original script
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = join(__dirname, '../screenshots');

const ADMIN_EMAIL = 'admin@ceogala.test';
const ADMIN_PASSWORD = 'Admin123!';

const extraAdminPages = [
  { name: '25-admin-applicants', path: '/admin/applicants', desc: 'Jelentkezők kezelése (Epic 7)' },
  { name: '26-admin-statistics', path: '/admin/statistics', desc: 'Statisztikák' },
  { name: '27-admin-email-templates', path: '/admin/email-templates', desc: 'Email sablonok' },
  { name: '28-admin-help', path: '/admin/help', desc: 'Admin súgó' },
];

async function takeExtraAdminScreenshots() {
  console.log('Taking extra admin screenshots...\n');
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // Login
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
  await page.waitForSelector('input#email', { timeout: 5000 });
  await page.locator('input#email').fill(ADMIN_EMAIL);
  await page.locator('input#password').fill(ADMIN_PASSWORD);
  await page.waitForTimeout(100);

  await Promise.all([
    page.waitForURL(url => !url.toString().includes('/admin/login'), { timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
  console.log('   [OK] Logged in\n');

  // Capture pages
  for (const pageInfo of extraAdminPages) {
    const url = `${BASE_URL}${pageInfo.path}`;
    console.log(`${pageInfo.name}: ${pageInfo.desc}`);
    console.log(`   ${pageInfo.path}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      try {
        await page.waitForSelector('text=Betöltés...', { state: 'hidden', timeout: 10000 });
      } catch (e) { }
      await page.waitForTimeout(1000);
      await page.screenshot({
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
  console.log('Done!');
}

takeExtraAdminScreenshots().catch(console.error);
