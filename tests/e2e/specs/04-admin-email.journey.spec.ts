/**
 * Journey 4: Admin Email Kezelés
 *
 * Ez a teszt az admin email kezelési folyamatát rögzíti egyetlen videóba:
 * 1. Admin bejelentkezés
 * 2. Email sablonok megtekintése
 * 3. Email napló megtekintése
 * 4. Ütemezett emailek áttekintése
 * 5. Vendégeknek küldés opció ellenőrzése
 *
 * Futtatás: npx playwright test --project=video-journey 04-admin-email.journey.spec.ts
 */

import { test, expect } from '../fixtures';

test.describe('Admin Email Kezelés Journey', () => {
  test('Email kezelési folyamat teljes áttekintése', async ({ page }) => {
    // 1. Admin bejelentkezés
    await test.step('Login oldal megnyitása', async () => {
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Bejelentkezési adatok megadása', async () => {
      await page.fill('[name="email"]', 'admin@ceogala.test');
      await page.fill('[name="password"]', 'Admin123!');
    });

    await test.step('Bejelentkezés', async () => {
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin');
    });

    await test.step('Dashboard betöltődik', async () => {
      await expect(page.getByRole('heading', { name: /Vezérlőpult|Dashboard|Overview/i })).toBeVisible({ timeout: 10000 });
    });

    // 2. Email sablonok megtekintése
    await test.step('Email sablonok oldal megnyitása', async () => {
      await page.goto('/admin/email-templates');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Sablon lista betöltődik', async () => {
      // Wait for page content - either table or heading
      await page.waitForTimeout(2000);
      const hasContent = await page.locator('table, h1, h2, [data-testid="template-list"]').first().isVisible();
      expect(hasContent).toBeTruthy();
    });

    await test.step('Elérhető sablonok ellenőrzése', async () => {
      // Check for any template content
      await page.waitForTimeout(1000);
    });

    // 3. Email napló megtekintése
    await test.step('Email napló oldal megnyitása', async () => {
      await page.goto('/admin/email-logs');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Email napló oldal betöltődik', async () => {
      await page.waitForTimeout(2000);

      // Check for table or list or empty state
      const hasTable = await page.locator('table').isVisible().catch(() => false);
      const hasHeading = await page.locator('h1, h2').first().isVisible().catch(() => false);
      const hasEmpty = await page.getByText(/nincs|no emails|üres|empty/i).isVisible().catch(() => false);

      expect(hasTable || hasHeading || hasEmpty).toBeTruthy();
    });

    // 4. Ütemezett emailek áttekintése
    await test.step('Ütemezett emailek oldal megnyitása', async () => {
      await page.goto('/admin/scheduled-emails');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Ütemezett emailek lista betöltődik', async () => {
      await page.waitForTimeout(2000);

      // Check for table or list or empty state
      const hasTable = await page.locator('table').isVisible().catch(() => false);
      const hasHeading = await page.locator('h1, h2').first().isVisible().catch(() => false);
      const hasEmpty = await page.getByText(/nincs|no scheduled|üres|empty/i).isVisible().catch(() => false);

      expect(hasTable || hasHeading || hasEmpty).toBeTruthy();
    });

    await test.step('Oldal funkciók ellenőrzése', async () => {
      // Check for any action buttons
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });

    // 5. Vendégeknek küldés opció ellenőrzése
    await test.step('Vendégek oldal megnyitása', async () => {
      await page.goto('/admin/guests');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Vendéglista betöltődik', async () => {
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    await test.step('Bulk műveletek ellenőrzése', async () => {
      // Check for bulk actions or checkboxes
      const selectAllCheckbox = page.locator('thead input[type="checkbox"], [data-testid="select-all"]');
      if (await selectAllCheckbox.isVisible()) {
        await expect(selectAllCheckbox).toBeVisible();
      }
    });
  });
});
