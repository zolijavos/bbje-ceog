import { chromium } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:3003';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

// Login first
await page.goto(`${baseUrl}/admin/login`);
await page.waitForLoadState('networkidle');

// Fill login form with correct credentials
await page.fill('input[name="email"]', 'admin@ceogala.test');
await page.fill('input[name="password"]', 'Admin123!');
await page.click('button[type="submit"]');

// Wait for redirect
await page.waitForTimeout(3000);

// Go to seating page
await page.goto(`${baseUrl}/admin/seating`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// Take screenshot for grid view (showing tables with cards)
await page.screenshot({
  path: './screenshots/seating-dashboard-dnd.png',
  fullPage: true
});

console.log('Screenshot saved to screenshots/seating-dashboard-dnd.png');

await browser.close();
