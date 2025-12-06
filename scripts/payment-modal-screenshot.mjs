/**
 * Payment Approval Modal Screenshot Script
 * Run with: BASE_URL=http://localhost:3003 node scripts/payment-modal-screenshot.mjs
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const SCREENSHOT_DIR = join(__dirname, '../screenshots');

const ADMIN_EMAIL = 'admin@ceogala.test';
const ADMIN_PASSWORD = 'Admin123!';

async function takePaymentModalScreenshots() {
  console.log('Starting Payment Approval Modal screenshot capture...');
  console.log(`Base URL: ${BASE_URL}\n`);

  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Login
    console.log('Logging in as admin...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await page.fill('input#email', ADMIN_EMAIL);
    await page.fill('input#password', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.toString().includes('/admin/login'), { timeout: 15000 });
    console.log('[OK] Logged in\n');

    // Navigate to guest list
    console.log('Navigating to guest list...');
    await page.goto(`${BASE_URL}/admin/guests`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('[OK] Guest list loaded\n');

    // Take screenshot of guest list before modal
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'payment-modal-01-guest-list.png'),
      fullPage: true,
    });
    console.log('[OK] Guest list screenshot saved\n');

    // Find and click the payment approval button (by data-testid pattern or title)
    console.log('Looking for payment approval button...');

    // First look for buttons with title="Fizetés jóváhagyása"
    const approvalButton = page.locator('button[title="Fizetés jóváhagyása"]').first();
    const approvalButtonCount = await approvalButton.count();
    console.log(`Found ${approvalButtonCount} approval buttons by title`);

    // Also check by data-testid pattern
    const testIdButton = page.locator('[data-testid^="approve-payment-"]').first();
    const testIdCount = await testIdButton.count();
    console.log(`Found ${testIdCount} approval buttons by data-testid`);

    const buttonToClick = approvalButtonCount > 0 ? approvalButton : testIdButton;

    if (approvalButtonCount > 0 || testIdCount > 0) {
      console.log('[OK] Found approval button, scrolling into view and clicking...');
      await buttonToClick.scrollIntoViewIfNeeded();
      await buttonToClick.click();
      await page.waitForTimeout(1000);

      // Take screenshot of the modal
      await page.screenshot({
        path: join(SCREENSHOT_DIR, 'payment-modal-02-modal-open.png'),
        fullPage: false,
      });
      console.log('[OK] Modal screenshot saved\n');

      // Close modal by clicking cancel
      const cancelButton = page.locator('button:has-text("Mégse")');
      if (await cancelButton.count() > 0) {
        await cancelButton.click();
        console.log('[OK] Modal closed\n');
      }
    } else {
      console.log('[WARN] No payment approval button found - no guests with pending payment status');
      console.log('       Make sure there are paying guests with paymentStatus "pending"\n');

      // Debug: List what guests exist
      const rows = await page.locator('tbody tr').count();
      console.log(`       Total guest rows: ${rows}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'payment-modal-error.png'),
      fullPage: true,
    });
  }

  await browser.close();
  console.log('\nScreenshots complete!');
  console.log(`Files saved to: ${SCREENSHOT_DIR}`);
}

takePaymentModalScreenshots().catch(console.error);
