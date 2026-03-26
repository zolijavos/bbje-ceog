/**
 * E2E Tests: Live Seating Display — Zoom, Pan, Fullscreen, Auto-zoom
 *
 * Tests the interactive controls added to the display:
 *   - Fullscreen toggle button + F key
 *   - Zoom +/- buttons
 *   - Ctrl+scroll zoom
 *   - Click-to-zoom on tables (mouse + touch tap)
 *   - Auto-zoom on check-in (toggle, behavior)
 *   - Controls auto-hide on mouse idle
 *   - Auth error UI
 */

import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@ceogala.test';
const ADMIN_PASSWORD = 'Admin123!';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ----- Helpers -----

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);

  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/auth/callback/credentials')),
    page.getByRole('button', { name: /login|sign in|bejelentkez/i }).click(),
  ]);

  await page.waitForURL(/\/admin(\/|$)/, { timeout: 15000 });
}

const TEST_TABLES = [
  {
    id: 1,
    name: 'Asztal 1',
    guests: [
      { id: 101, firstName: 'Anna', lastName: 'Kiss', checkedIn: false },
      { id: 102, firstName: 'Bela', lastName: 'Nagy', checkedIn: true },
    ],
  },
  {
    id: 2,
    name: 'Asztal 5',
    guests: [
      { id: 103, firstName: 'Csaba', lastName: 'Toth', checkedIn: false },
    ],
  },
  {
    id: 3,
    name: 'Asztal 10',
    guests: [
      { id: 104, firstName: 'Diana', lastName: 'Szabo', checkedIn: true },
      { id: 105, firstName: 'Eva', lastName: 'Kovacs', checkedIn: false },
    ],
  },
];

const TEST_STATS = { checkedIn: 2, total: 5 };

function mockSeatingDisplayData(page: Page) {
  return page.route('**/api/admin/seating-display-data', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ tables: TEST_TABLES, checkinStats: TEST_STATS }),
    });
  });
}

function mockDisplayStreamEmpty(page: Page) {
  return page.route('**/api/admin/display-stream', (route) => {
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      body: ': keep-alive\n\n',
    });
  });
}

function interceptEventSource(page: Page) {
  return page.addInitScript(() => {
    (window as any).__capturedES = null;
    const OrigES = window.EventSource;
    (window as any).EventSource = function (url: string, init?: EventSourceInit) {
      const instance = new OrigES(url, init);
      (window as any).__capturedES = instance;
      return instance;
    } as unknown as typeof EventSource;
    (window as any).EventSource.CONNECTING = OrigES.CONNECTING;
    (window as any).EventSource.OPEN = OrigES.OPEN;
    (window as any).EventSource.CLOSED = OrigES.CLOSED;
  });
}

function injectCheckinEvent(page: Page, guestId: number, guestName: string, tableName: string) {
  return page.evaluate(
    ({ guestId, guestName, tableName }) => {
      const sseData = {
        type: 'DISPLAY_CHECKED_IN',
        guestId,
        guestName,
        tableName,
        tableType: 'standard',
        seatNumber: 1,
        checkedInAt: new Date().toISOString(),
        dietaryRequirements: null,
        title: null,
        guestType: 'invited',
      };
      const es = (window as any).__capturedES;
      if (es && es.onmessage) {
        es.onmessage(new MessageEvent('message', { data: JSON.stringify(sseData) }));
      }
    },
    { guestId, guestName, tableName },
  );
}

async function loadDisplay(page: Page): Promise<void> {
  await mockSeatingDisplayData(page);
  await mockDisplayStreamEmpty(page);
  await page.goto(`${BASE_URL}/display/seating`);
  await expect(page.getByText('Kiss Anna')).toBeVisible({ timeout: 10000 });
}

// Trigger mouse move to show controls
async function showControls(page: Page): Promise<void> {
  await page.mouse.move(100, 100);
  await page.mouse.move(200, 200);
}

// ===== TESTS =====

test.describe('Display — Controls Auto-hide', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[P1] Controls appear on mouse move and hide after 3 seconds', async ({ page }) => {
    await loadDisplay(page);

    // Controls should be hidden initially (opacity 0)
    const controlPanel = page.locator('.fixed.bottom-6.right-6');
    await expect(controlPanel).toHaveCSS('opacity', '0');

    // Move mouse to show controls
    await showControls(page);
    await expect(controlPanel).toHaveCSS('opacity', '1', { timeout: 1000 });

    // Wait for auto-hide (3s + transition buffer)
    await page.waitForTimeout(3500);
    await expect(controlPanel).toHaveCSS('opacity', '0');
  });

  test('[P2] Controls contain zoom +/- buttons and fullscreen button', async ({ page }) => {
    await loadDisplay(page);
    await showControls(page);

    await expect(page.getByTitle('Zoom in (+)')).toBeVisible();
    await expect(page.getByTitle('Zoom out (-)')).toBeVisible();
    await expect(page.getByTitle(/Fullscreen/)).toBeVisible();
  });

  test('[P2] Auto-zoom toggle button visible in controls', async ({ page }) => {
    await loadDisplay(page);
    await showControls(page);

    await expect(page.getByTitle(/Auto-zoom on check-in/)).toBeVisible();
  });
});

test.describe('Display — Zoom +/- Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[P1] Zoom in button increases zoom, zoom indicator appears', async ({ page }) => {
    await loadDisplay(page);
    await showControls(page);

    // Click zoom in
    await page.getByTitle('Zoom in (+)').click();
    await showControls(page);

    // Zoom indicator should appear with percentage > 100%
    const zoomIndicator = page.locator('.fixed.top-6.right-6');
    await expect(zoomIndicator).toBeVisible({ timeout: 2000 });
    const text = await zoomIndicator.textContent();
    expect(text).toMatch(/1[3-9]\d%|[2-4]\d\d%/); // 130%+

    // 1:1 reset button should appear
    await expect(page.getByTitle('Reset zoom (Escape)')).toBeVisible();
  });

  test('[P1] Zoom out at 1x does not go below minimum', async ({ page }) => {
    await loadDisplay(page);
    await showControls(page);

    // Click zoom out at 1x — should stay at 1x, no zoom indicator
    await page.getByTitle('Zoom out (-)').click();
    await showControls(page);

    const zoomIndicator = page.locator('.fixed.top-6.right-6');
    await expect(zoomIndicator).not.toBeVisible({ timeout: 1000 });
  });

  test('[P1] 1:1 reset button returns to normal view', async ({ page }) => {
    await loadDisplay(page);
    await showControls(page);

    // Zoom in first
    await page.getByTitle('Zoom in (+)').click();
    await showControls(page);

    // Click 1:1 reset
    await page.getByTitle('Reset zoom (Escape)').click();
    await showControls(page);

    // Zoom indicator should disappear
    await page.waitForTimeout(500);
    const zoomIndicator = page.locator('.fixed.top-6.right-6');
    await expect(zoomIndicator).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe('Display — Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[P2] + key zooms in, - key zooms out, Escape resets', async ({ page }) => {
    await loadDisplay(page);

    // Press + to zoom in
    await page.keyboard.press('+');
    await showControls(page);

    const zoomIndicator = page.locator('.fixed.top-6.right-6');
    await expect(zoomIndicator).toBeVisible({ timeout: 2000 });

    // Press Escape to reset
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await showControls(page);
    await expect(zoomIndicator).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe('Display — Click-to-zoom Tables', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[P1] Clicking near a table name zooms to that table', async ({ page }) => {
    await loadDisplay(page);

    // Get the position of "Kiss Anna" text (Asztal 1)
    const guestText = page.getByText('Kiss Anna');
    const box = await guestText.boundingBox();
    expect(box).not.toBeNull();

    // Click on the guest name area
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await showControls(page);

    // Should zoom in — zoom indicator visible
    const zoomIndicator = page.locator('.fixed.top-6.right-6');
    await expect(zoomIndicator).toBeVisible({ timeout: 2000 });
    const text = await zoomIndicator.textContent();
    expect(text).toContain('250%'); // TABLE_ZOOM = 2.5
  });

  test('[P1] Clicking same table again resets zoom', async ({ page }) => {
    await loadDisplay(page);

    const guestText = page.getByText('Kiss Anna');
    const box = await guestText.boundingBox();
    expect(box).not.toBeNull();

    // Click to zoom in
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(500);

    // Click same area again to reset
    // Need to get new bounding box since view has changed
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(500);
    await showControls(page);

    // Zoom indicator should disappear
    const zoomIndicator = page.locator('.fixed.top-6.right-6');
    await expect(zoomIndicator).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe('Display — Auto-zoom on Check-in', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await interceptEventSource(page);
  });

  test('[P1] Check-in event triggers auto-zoom to table, returns after 3s', async ({ page }) => {
    await mockSeatingDisplayData(page);
    await mockDisplayStreamEmpty(page);
    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('Kiss Anna')).toBeVisible({ timeout: 10000 });

    // Inject check-in event
    await injectCheckinEvent(page, 101, 'Kiss Anna', 'Asztal 1');
    await showControls(page);

    // Should auto-zoom — zoom indicator appears
    const zoomIndicator = page.locator('.fixed.top-6.right-6');
    await expect(zoomIndicator).toBeVisible({ timeout: 2000 });

    // Wait for auto-return (3s + transition)
    await page.waitForTimeout(3800);
    await showControls(page);

    // Should be back to 1:1
    await expect(zoomIndicator).not.toBeVisible({ timeout: 2000 });
  });

  test('[P2] Auto-zoom toggle disables auto-zoom behavior', async ({ page }) => {
    await mockSeatingDisplayData(page);
    await mockDisplayStreamEmpty(page);
    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('Kiss Anna')).toBeVisible({ timeout: 10000 });
    await showControls(page);

    // Disable auto-zoom
    await page.getByTitle(/Auto-zoom on check-in: ON/).click();
    await showControls(page);

    // Verify it's now OFF
    await expect(page.getByTitle(/Auto-zoom on check-in: OFF/)).toBeVisible();

    // Inject check-in event
    await injectCheckinEvent(page, 101, 'Kiss Anna', 'Asztal 1');
    await page.waitForTimeout(500);
    await showControls(page);

    // Should NOT zoom — no zoom indicator
    const zoomIndicator = page.locator('.fixed.top-6.right-6');
    await expect(zoomIndicator).not.toBeVisible({ timeout: 1000 });
  });

  test('[P2] Auto-zoom does not interrupt manual zoom', async ({ page }) => {
    await mockSeatingDisplayData(page);
    await mockDisplayStreamEmpty(page);
    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('Kiss Anna')).toBeVisible({ timeout: 10000 });
    await showControls(page);

    // Manually zoom in first
    await page.getByTitle('Zoom in (+)').click();
    await page.waitForTimeout(300);
    await showControls(page);

    // Get current zoom level
    const zoomIndicator = page.locator('.fixed.top-6.right-6');
    const zoomBefore = await zoomIndicator.textContent();

    // Inject check-in event — should NOT change zoom (already zoomed)
    await injectCheckinEvent(page, 101, 'Kiss Anna', 'Asztal 1');
    await page.waitForTimeout(500);
    await showControls(page);

    // Zoom should be same as before
    const zoomAfter = await zoomIndicator.textContent();
    expect(zoomAfter).toBe(zoomBefore);
  });
});

test.describe('Display — Auth Error', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[P2] Shows session expired message on 401 response', async ({ page }) => {
    await page.route('**/api/admin/seating-display-data', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' }),
      });
    });
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);

    await expect(page.getByText(/Session expired/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/log in/i)).toBeVisible();
  });
});
