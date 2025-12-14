import { test } from '@playwright/test';

test('screenshot pwa dashboard', async ({ page }) => {
  // Login to PWA with a test code
  await page.goto('/pwa', { waitUntil: 'networkidle' });

  // Click ENTER CODE button first
  await page.click('text=ENTER CODE');
  await page.waitForTimeout(500);

  // Enter PWA code
  await page.fill('input[type="text"]', 'CEOG-MA7LRY');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Take screenshot of dashboard
  await page.screenshot({ path: '/tmp/pwa-dashboard-screenshot.png', fullPage: true });
});
