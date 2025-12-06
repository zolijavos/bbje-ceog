/**
 * Seating Tooltip Screenshot Script
 * Run with: BASE_URL=http://localhost:3003 node scripts/seating-tooltip-screenshot.mjs
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

async function takeTooltipScreenshots() {
  console.log('Starting Seating Tooltip screenshot capture...');
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

    // Navigate to seating page
    console.log('Navigating to seating dashboard...');
    await page.goto(`${BASE_URL}/admin/seating`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Wait for seating dashboard to load
    await page.waitForSelector('[data-testid="seating-dashboard"]', { timeout: 10000 });
    console.log('[OK] Seating dashboard loaded\n');

    // Take screenshot of grid view
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'seating-tooltip-01-grid-view.png'),
      fullPage: true,
    });
    console.log('[OK] Grid view screenshot saved\n');

    // Switch to floorplan view
    console.log('Switching to floorplan view...');
    const floorplanButton = page.locator('[data-testid="view-floorplan-button"]');
    await floorplanButton.click();
    await page.waitForTimeout(1500);

    // Take screenshot of floorplan view
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'seating-tooltip-02-floorplan-view.png'),
      fullPage: true,
    });
    console.log('[OK] Floorplan view screenshot saved\n');

    // Find the canvas and hover over a table
    console.log('Hovering over table to show tooltip...');

    // The canvas is inside a div with specific class
    const canvas = page.locator('canvas').first();

    if (await canvas.count() > 0) {
      const canvasBounds = await canvas.boundingBox();
      if (canvasBounds) {
        // Move mouse to approximately where a table should be (center area)
        // Tables are positioned around (2,2), (6,2), etc. in meters
        // With PIXELS_PER_METER=50 and some offset, we target around (200, 200) in canvas coords
        const targetX = canvasBounds.x + canvasBounds.width / 3;
        const targetY = canvasBounds.y + canvasBounds.height / 3;

        await page.mouse.move(targetX, targetY);
        await page.waitForTimeout(500);

        // Take screenshot with tooltip visible
        await page.screenshot({
          path: join(SCREENSHOT_DIR, 'seating-tooltip-03-tooltip-visible.png'),
          fullPage: false,
        });
        console.log('[OK] Tooltip screenshot saved\n');

        // Try a few more positions to find a table
        const positions = [
          { x: canvasBounds.x + 150, y: canvasBounds.y + 150 },
          { x: canvasBounds.x + 350, y: canvasBounds.y + 150 },
          { x: canvasBounds.x + 150, y: canvasBounds.y + 350 },
          { x: canvasBounds.x + 550, y: canvasBounds.y + 350 },
        ];

        for (let i = 0; i < positions.length; i++) {
          await page.mouse.move(positions[i].x, positions[i].y);
          await page.waitForTimeout(300);
        }

        // Final screenshot
        await page.screenshot({
          path: join(SCREENSHOT_DIR, 'seating-tooltip-04-hover-test.png'),
          fullPage: false,
        });
        console.log('[OK] Hover test screenshot saved\n');
      }
    } else {
      console.log('[WARN] Canvas not found\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'seating-tooltip-error.png'),
      fullPage: true,
    });
  }

  await browser.close();
  console.log('\nScreenshots complete!');
  console.log(`Files saved to: ${SCREENSHOT_DIR}`);
}

takeTooltipScreenshots().catch(console.error);
