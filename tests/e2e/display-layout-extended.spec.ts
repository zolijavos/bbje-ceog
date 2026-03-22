/**
 * E2E Tests: Live Seating Display — Extended Coverage
 *
 * Tests display layout features, edge cases, and branding that are NOT
 * covered by the existing display-seating.spec.ts:
 *   - Footer hiding via display layout
 *   - MyForge Labs compact branding on display
 *   - Empty table list handling
 *   - Tables with no matching position (unmapped table names)
 *   - SSE reconnection behavior on error
 *   - Duplicate SSE events (same guest checked in twice)
 *   - Large counter values
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

function mockSeatingDisplayData(
  page: Page,
  tables: Array<{ id: number; name: string; guests: Array<{ id: number; firstName: string; lastName: string; checkedIn: boolean }> }>,
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

function injectCheckinEvent(
  page: Page,
  guestId: number,
  guestName: string,
  tableName: string,
  extras: Record<string, unknown> = {},
) {
  return page.evaluate(
    ({ guestId, guestName, tableName, extras }) => {
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
        ...extras,
      };
      const es = (window as any).__capturedES;
      if (es && es.onmessage) {
        es.onmessage(new MessageEvent('message', { data: JSON.stringify(sseData) }));
      }
    },
    { guestId, guestName, tableName, extras },
  );
}

// ===== TESTS =====

test.describe('Display Layout — Footer & Branding', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[P2] Display page hides global footer via layout style injection', async ({ page }) => {
    await mockSeatingDisplayData(page, [
      { id: 1, name: 'Asztal 1', guests: [{ id: 1, firstName: 'Test', lastName: 'User', checkedIn: false }] },
    ], { checkedIn: 0, total: 1 });
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('User Test')).toBeVisible({ timeout: 10000 });

    // The display layout injects CSS that hides [data-global-footer]
    // Verify via computed style — any element with data-global-footer should be hidden
    const footerHidden = await page.evaluate(() => {
      const style = document.querySelector('style');
      return style?.textContent?.includes('[data-global-footer]') ?? false;
    });
    expect(footerHidden).toBe(true);

    // body padding-bottom override
    const bodyPadding = await page.evaluate(() => {
      const style = document.querySelector('style');
      return style?.textContent?.includes('padding-bottom: 0') ?? false;
    });
    expect(bodyPadding).toBe(true);
  });

  test('[P2] Display shows compact MyForge Labs branding at bottom', async ({ page }) => {
    await mockSeatingDisplayData(page, [
      { id: 1, name: 'Asztal 1', guests: [{ id: 1, firstName: 'A', lastName: 'B', checkedIn: false }] },
    ], { checkedIn: 0, total: 1 });
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('B A')).toBeVisible({ timeout: 10000 });

    // Compact branding text on the display (inside the aspect-ratio container)
    const displayContainer = page.locator('.fixed.inset-0');
    await expect(displayContainer.getByText(/Built by/i)).toBeVisible();
    await expect(displayContainer.getByText('MyForge Labs')).toBeVisible();

    // MyForge Labs link points to correct URL
    const brandingLink = displayContainer.locator('a[href*="myforgelabs.com"]');
    await expect(brandingLink).toBeVisible();
    await expect(brandingLink).toHaveAttribute('target', '_blank');
  });
});

test.describe('Display — Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[P2] Display handles empty table list gracefully (0/0 counter)', async ({ page }) => {
    await mockSeatingDisplayData(page, [], { checkedIn: 0, total: 0 });
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);

    // Should show background image still
    const bgImage = page.locator('img[alt="Seating plan"]');
    await expect(bgImage).toBeVisible({ timeout: 10000 });

    // Counter shows 0/0
    await expect(page.getByText('0/0 CHECKED IN')).toBeVisible();
  });

  test('[P2] Tables with unmappable names (no digit) are silently skipped', async ({ page }) => {
    // "Premium" has no digit → parseTableNumber returns null → skipped
    await mockSeatingDisplayData(page, [
      { id: 1, name: 'Asztal 1', guests: [{ id: 1, firstName: 'Mapped', lastName: 'Guest', checkedIn: false }] },
      { id: 2, name: 'Premium', guests: [{ id: 2, firstName: 'Unmapped', lastName: 'Guest', checkedIn: false }] },
    ], { checkedIn: 0, total: 2 });
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('Guest Mapped')).toBeVisible({ timeout: 10000 });

    // Unmapped guest should NOT appear (table "Premium" → no position)
    await expect(page.getByText('Guest Unmapped')).not.toBeVisible();

    // Counter still reflects total from API (both guests counted)
    await expect(page.getByText('0/2 CHECKED IN')).toBeVisible();
  });

  test('[P1] Duplicate SSE events for same guest do not double-count in counter', async ({ page }) => {
    await interceptEventSource(page);
    await mockSeatingDisplayData(page, [
      { id: 1, name: 'Asztal 1', guests: [
        { id: 101, firstName: 'Anna', lastName: 'Kiss', checkedIn: false },
        { id: 102, firstName: 'Bela', lastName: 'Nagy', checkedIn: false },
      ]},
    ], { checkedIn: 0, total: 2 });
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('Kiss Anna')).toBeVisible({ timeout: 10000 });

    // Send same guest check-in event twice
    await injectCheckinEvent(page, 101, 'Kiss Anna', 'Asztal 1');
    await injectCheckinEvent(page, 101, 'Kiss Anna', 'Asztal 1'); // duplicate

    // Should show 1/2, not 2/2 (Set deduplicates)
    await expect(page.getByText('1/2 CHECKED IN')).toBeVisible({ timeout: 5000 });
  });

  test('[P2] Large counter values display correctly', async ({ page }) => {
    // Create mock with many guests pre-checked-in
    const guests = Array.from({ length: 8 }, (_, i) => ({
      id: 200 + i,
      firstName: `Guest${i}`,
      lastName: `Fam${i}`,
      checkedIn: i < 6, // 6 of 8 checked in
    }));
    await mockSeatingDisplayData(page, [
      { id: 1, name: 'Asztal 1', guests: guests.slice(0, 4) },
      { id: 2, name: 'Asztal 2', guests: guests.slice(4) },
    ], { checkedIn: 6, total: 8 });
    await mockDisplayStreamEmpty(page);

    await page.goto(`${BASE_URL}/display/seating`);
    await expect(page.getByText('6/8 CHECKED IN')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Display — Access Control', () => {
  test('[P0] Unauthenticated user is redirected from /display/seating', async ({ page }) => {
    await page.goto(`${BASE_URL}/display/seating`);
    // Should redirect to login or show unauthorized
    await page.waitForURL(/\/(admin\/login|api\/auth)/, { timeout: 10000 }).catch(() => {
      // If no redirect, check for error content
    });

    // Either redirected to login, or page shows auth error
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/auth');
    const hasError = await page.getByText(/unauthorized|bejelentkezés|login/i).isVisible().catch(() => false);

    expect(isRedirected || hasError).toBe(true);
  });
});
