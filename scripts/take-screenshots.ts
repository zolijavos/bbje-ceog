/**
 * Screenshot Script for CEO Gala Pages
 *
 * Takes screenshots of all completed pages using Playwright
 */

import { chromium } from 'playwright';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

// Pages to capture
const pages = [
  // Public pages
  { name: '01-homepage', path: '/' },
  { name: '02-register-landing', path: '/register?code=test&email=test@example.com' },
  { name: '03-payment-status', path: '/status?guestId=1' },
  { name: '04-checkin-scanner', path: '/checkin' },

  // Admin pages
  { name: '10-admin-login', path: '/admin/login' },
  { name: '11-admin-dashboard', path: '/admin' },
  { name: '12-admin-guests', path: '/admin/guests' },
  { name: '13-admin-guests-import', path: '/admin/guests/import' },
  { name: '14-admin-checkin-log', path: '/admin/checkin-log' },
  { name: '15-admin-tables', path: '/admin/tables' },
  { name: '16-admin-seating', path: '/admin/seating' },
];

async function takeScreenshots() {
  console.log('Starting screenshot capture...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${SCREENSHOT_DIR}\n`);

  const browser = await chromium.launch();

  // Desktop viewport
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const desktopPage = await desktopContext.newPage();

  // Mobile viewport
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14
  });
  const mobilePage = await mobileContext.newPage();

  for (const pageInfo of pages) {
    const url = `${BASE_URL}${pageInfo.path}`;
    console.log(`Capturing: ${pageInfo.name}`);

    try {
      // Desktop screenshot
      await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      await desktopPage.waitForTimeout(500); // Wait for animations
      await desktopPage.screenshot({
        path: path.join(SCREENSHOT_DIR, `${pageInfo.name}-desktop.png`),
        fullPage: true,
      });
      console.log(`  ✓ Desktop saved`);

      // Mobile screenshot (only for relevant pages)
      if (pageInfo.name.includes('checkin') || pageInfo.name.includes('register') || pageInfo.name.includes('status')) {
        await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        await mobilePage.waitForTimeout(500);
        await mobilePage.screenshot({
          path: path.join(SCREENSHOT_DIR, `${pageInfo.name}-mobile.png`),
          fullPage: true,
        });
        console.log(`  ✓ Mobile saved`);
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  await browser.close();
  console.log('\nDone!');
}

takeScreenshots().catch(console.error);
