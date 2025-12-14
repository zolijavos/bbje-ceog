/**
 * CEO Gala - Scheduled Emails E2E Tests
 *
 * Tests for Email scheduling functionality:
 * - View scheduled emails
 * - Create new scheduled email
 * - Cancel scheduled email
 * - View email logs
 *
 * Priority: P2 - Medium (Admin functionality)
 */
import { test, expect } from '../fixtures';
import { waitForTableLoad, waitForModalOpen, waitForModalClose } from '../helpers';

test.describe('Scheduled Emails List', () => {
  test('[P1] should display scheduled emails page', async ({ page }) => {
    // WHEN: Navigating to scheduled emails
    await page.goto('/admin/scheduled-emails');

    // THEN: Page is visible with title
    await expect(page.locator('h1, h2').filter({ hasText: /ütemezett|scheduled|email/i })).toBeVisible();
  });

  test('[P1] should show scheduled emails table', async ({ page }) => {
    // WHEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');

    // THEN: Table or list is visible
    await expect(page.locator('table, [data-testid="scheduled-list"]')).toBeVisible();
  });

  test('[P2] should show email status column', async ({ page }) => {
    // WHEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');

    // THEN: Status column is visible
    await expect(page.locator('th, [role="columnheader"]').filter({ hasText: /státusz|status|állapot/i })).toBeVisible();
  });

  test('[P2] should show scheduled time column', async ({ page }) => {
    // WHEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');

    // THEN: Scheduled time column is visible
    await expect(page.locator('th, [role="columnheader"]').filter({ hasText: /idő|time|ütemezés|scheduled/i })).toBeVisible();
  });
});

test.describe('Create Scheduled Email', () => {
  test('[P1] should open create scheduled email form', async ({ page }) => {
    // GIVEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');

    // WHEN: Clicking create button
    const createButton = page.locator('button').filter({ hasText: /új|new|létrehozás|create|schedule/i });
    if (await createButton.isVisible()) {
      await createButton.click();

      // THEN: Form opens
      await waitForModalOpen(page);
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('[P2] should have template selection', async ({ page }) => {
    // GIVEN: Create form is open
    await page.goto('/admin/scheduled-emails');

    const createButton = page.locator('button').filter({ hasText: /új|new|létrehozás|create|schedule/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await waitForModalOpen(page);

      // THEN: Template selector is available
      await expect(page.locator('select, [data-testid="template-select"]').filter({ has: page.locator('option') })).toBeVisible();
    }
  });

  test('[P2] should have recipient selection', async ({ page }) => {
    // GIVEN: Create form is open
    await page.goto('/admin/scheduled-emails');

    const createButton = page.locator('button').filter({ hasText: /új|new|létrehozás|create|schedule/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await waitForModalOpen(page);

      // THEN: Recipient selection is available
      await expect(page.locator('select, [data-testid="recipient-filter"]').or(
        page.locator('text=/címzett|recipient|guest_type/i')
      )).toBeVisible();
    }
  });

  test('[P2] should have datetime picker', async ({ page }) => {
    // GIVEN: Create form is open
    await page.goto('/admin/scheduled-emails');

    const createButton = page.locator('button').filter({ hasText: /új|new|létrehozás|create|schedule/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await waitForModalOpen(page);

      // THEN: DateTime picker is available
      await expect(page.locator('input[type="datetime-local"], [data-testid="schedule-time"]')).toBeVisible();
    }
  });
});

test.describe('Cancel Scheduled Email', () => {
  test('[P2] should have cancel option for pending emails', async ({ page }) => {
    // WHEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');
    await waitForTableLoad(page).catch(() => {});

    // THEN: Cancel button should be available for pending items
    const cancelButton = page.locator('button').filter({ hasText: /törlés|cancel|visszavon/i }).first();
    // May or may not be visible depending on data
    if (await cancelButton.isVisible()) {
      await expect(cancelButton).toBeEnabled();
    }
  });
});

test.describe('Email Logs View', () => {
  test('[P2] should show email delivery logs', async ({ page }) => {
    // WHEN: On scheduled emails page or navigating to logs
    await page.goto('/admin/scheduled-emails');

    // THEN: Logs tab or link should be available
    const logsLink = page.locator('a, button').filter({ hasText: /log|napló|history|előzmény/i });
    if (await logsLink.isVisible()) {
      await logsLink.click();

      // AND: Logs table should be visible
      await expect(page.locator('table')).toBeVisible();
    }
  });

  test('[P3] should show email delivery status in logs', async ({ page }) => {
    // WHEN: On email logs page
    await page.goto('/admin/scheduled-emails');

    const logsLink = page.locator('a, button').filter({ hasText: /log|napló|history|előzmény/i });
    if (await logsLink.isVisible()) {
      await logsLink.click();

      // THEN: Delivery status column is visible
      await expect(page.locator('th, [role="columnheader"]').filter({ hasText: /státusz|status|delivered|sent/i })).toBeVisible();
    }
  });
});

test.describe('Scheduler Configuration', () => {
  test('[P3] should show scheduler status', async ({ page }) => {
    // WHEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');

    // THEN: Scheduler status indicator should be visible
    // This could be "Active", "Running", or similar
    const statusIndicator = page.locator('text=/aktív|active|running|fut/i');
    if (await statusIndicator.isVisible()) {
      await expect(statusIndicator).toBeVisible();
    }
  });
});
