/**
 * E2E Tests: Live Seating Display (/display/seating)
 *
 * Tests the full-screen seating plan display that shows guest names
 * at table positions with real-time check-in status updates via SSE.
 */

import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@ceogala.test';
const ADMIN_PASSWORD = 'Admin123!';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ----- Helpers -----

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password|jelsz/i).fill(ADMIN_PASSWORD);

  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/auth/callback/credentials')),
    page.getByRole('button', { name: /sign in|bejelentkez/i }).click(),
  ]);

  await page.waitForURL(/\/admin(\/|$)/, { timeout: 15000 });
}

function mockSeatingDisplayData(
  page: Page,
  tables: typeof TEST_TABLES,
  checkinStats: { checkedIn: number; total: number },
) {
  return page.route('**/api/admin/seating-display-data', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ tables, checkinStats }),
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

/**
 * addInitScript to intercept EventSource so we can inject SSE messages
 * into the captured instance from test code via page.evaluate().
 */
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

/**
 * Inject an SSE DISPLAY_CHECKED_IN event into the captured EventSource.
 */
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

// ----- Test Data -----

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

// ===== TESTS =====

test.describe('Live Seating Display - Page Load', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[P1] Display page loads with background image, tables, and guest names', async ({ page }) => {
    await mockSeatingDisplayData(page, TEST_TABLES, TEST_STATS);
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);

    // Background image
    const bgImage = page.locator('img[alt="Seating plan"]');
    await expect(bgImage).toBeVisible({ timeout: 10000 });
    await expect(bgImage).toHaveAttribute('src', '/images/ceo_gala_asztalterv_FINAL_ures_1.png');

    // Check-in counter
    await expect(page.getByText('2/5 CHECKED IN')).toBeVisible();

    // All guest names rendered (lastName firstName format from component)
    await expect(page.getByText('Kiss Anna')).toBeVisible();
    await expect(page.getByText('Nagy Bela')).toBeVisible();
    await expect(page.getByText('Toth Csaba')).toBeVisible();
    await expect(page.getByText('Szabo Diana')).toBeVisible();
    await expect(page.getByText('Kovacs Eva')).toBeVisible();
  });

  test('[P1] Checked-in guests are bold/black, non-checked-in guests are italic/grey', async ({ page }) => {
    await mockSeatingDisplayData(page, TEST_TABLES, TEST_STATS);
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('Kiss Anna')).toBeVisible({ timeout: 10000 });

    // Not checked in: italic, normal weight, grey
    const notCheckedIn = page.getByText('Kiss Anna');
    await expect(notCheckedIn).toHaveCSS('font-style', 'italic');
    await expect(notCheckedIn).toHaveCSS('font-weight', '400');
    await expect(notCheckedIn).toHaveCSS('color', 'rgb(115, 115, 115)');

    // Checked in: normal style, bold, black
    const checkedIn = page.getByText('Nagy Bela');
    await expect(checkedIn).toHaveCSS('font-style', 'normal');
    await expect(checkedIn).toHaveCSS('font-weight', '700');
    await expect(checkedIn).toHaveCSS('color', 'rgb(0, 0, 0)');
  });

  test('[P1] Display shows loading state then renders content', async ({ page }) => {
    // Delay the API response to observe loading state
    await page.route('**/api/admin/seating-display-data', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tables: TEST_TABLES, checkinStats: TEST_STATS }),
      });
    });
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);

    // Loading text appears first
    await expect(page.getByText('Loading...')).toBeVisible();

    // Then content replaces it
    await expect(page.getByText('Kiss Anna')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Loading...')).not.toBeVisible();
  });

  test('[P1] Display shows error state when API fails', async ({ page }) => {
    await page.route('**/api/admin/seating-display-data', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText(/Error:/i)).toBeVisible({ timeout: 10000 });
  });

  test('[P1] Display is full-screen with fixed positioning and counter', async ({ page }) => {
    await mockSeatingDisplayData(page, TEST_TABLES, TEST_STATS);
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('Kiss Anna')).toBeVisible({ timeout: 10000 });

    // Root container uses fixed inset-0
    const container = page.locator('.fixed.inset-0').first();
    await expect(container).toBeVisible();

    // Counter visible in top-right area
    const counter = page.getByText(/\d+\/\d+ CHECKED IN/);
    await expect(counter).toBeVisible();
  });
});

test.describe('Live Seating Display - Real-time SSE Updates', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await interceptEventSource(page);
  });

  test('[P1] SSE check-in event updates guest style from grey/italic to bold/black', async ({ page }) => {
    await mockSeatingDisplayData(page, TEST_TABLES, TEST_STATS);
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('Kiss Anna')).toBeVisible({ timeout: 10000 });

    // Verify initially not checked in
    await expect(page.getByText('Kiss Anna')).toHaveCSS('font-style', 'italic');
    await expect(page.getByText('Kiss Anna')).toHaveCSS('color', 'rgb(115, 115, 115)');

    // Inject SSE check-in event for guest 101
    await injectCheckinEvent(page, 101, 'Kiss Anna', 'Asztal 1');

    // Style transitions to bold/black (component has 0.8s transition)
    await expect(page.getByText('Kiss Anna')).toHaveCSS('font-weight', '700', { timeout: 5000 });
    await expect(page.getByText('Kiss Anna')).toHaveCSS('font-style', 'normal');
    await expect(page.getByText('Kiss Anna')).toHaveCSS('color', 'rgb(0, 0, 0)');

    // Counter increments: 2 -> 3 checked in
    await expect(page.getByText('3/5 CHECKED IN')).toBeVisible({ timeout: 5000 });
  });

  test('[P1] Multiple SSE check-in events update multiple guests and counter', async ({ page }) => {
    await mockSeatingDisplayData(page, TEST_TABLES, TEST_STATS);
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('Kiss Anna')).toBeVisible({ timeout: 10000 });

    // Both start as not checked in
    await expect(page.getByText('Kiss Anna')).toHaveCSS('font-style', 'italic');
    await expect(page.getByText('Toth Csaba')).toHaveCSS('font-style', 'italic');

    // Check in two guests
    await injectCheckinEvent(page, 101, 'Kiss Anna', 'Asztal 1');
    await injectCheckinEvent(page, 103, 'Toth Csaba', 'Asztal 5');

    // Both become bold
    await expect(page.getByText('Kiss Anna')).toHaveCSS('font-weight', '700', { timeout: 5000 });
    await expect(page.getByText('Toth Csaba')).toHaveCSS('font-weight', '700', { timeout: 5000 });

    // Counter: 2 + 2 = 4 checked in
    await expect(page.getByText('4/5 CHECKED IN')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Live Seating Display - Dashboard Integration', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[P2] Dashboard has "Live Seating Display" button that opens /display/seating in new window', async ({
    page,
    context,
  }) => {
    await page.goto(`${BASE_URL}/admin`);

    // Find the Live Seating Display card (role="button" in DashboardContent)
    const liveSeatingButton = page.getByRole('button').filter({ hasText: /Seating Display|Ülésrend/i });
    await expect(liveSeatingButton).toBeVisible({ timeout: 10000 });

    // Verify description text is present
    await expect(
      page.getByText(/real-time seating display|valós idejű ülésrend/i),
    ).toBeVisible();

    // Click opens new window
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      liveSeatingButton.click(),
    ]);

    await newPage.waitForURL(/\/display\/seating/, { timeout: 15000 });
    expect(newPage.url()).toContain('/display/seating');
    await newPage.close();
  });
});
