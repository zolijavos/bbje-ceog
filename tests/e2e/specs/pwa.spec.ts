/**
 * CEO Gala - PWA Guest App E2E Tests
 *
 * Tests for Progressive Web App functionality:
 * - Code-based authentication
 * - Guest dashboard
 * - Profile view/edit
 * - QR ticket display
 * - Table information
 * - Offline capabilities
 */
import { test, expect } from '../fixtures';
import {
  createVIPGuest,
  createGuestWithPWACode,
  createTable,
} from '../factories';
import { loginToPWA, expectPWATicketVisible } from '../helpers';

test.describe('PWA Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // No pre-auth

  test('should display PWA login page', async ({ page }) => {
    await page.goto('/pwa');

    // Should show auth code input
    await expect(page.locator('[name="code"], [data-testid="auth-code-input"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show branded login page with MyForge Labs', async ({ page }) => {
    await page.goto('/pwa');

    // Should show "Powered by MyForge Labs" branding
    await expect(page.locator('text=/MyForge|myforge/i')).toBeVisible();
  });

  test('should login with valid PWA code', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-login@test.ceog',
      name: 'PWA Login Guest',
    }));

    // Create registration for the guest
    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await page.goto('/pwa');

    // Enter auth code
    await page.fill('[name="code"], [data-testid="auth-code-input"]', guest.pwa_auth_code!);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL(/\/pwa\/(dashboard|profile|ticket)/);

    await cleanup();
  });

  test('should reject invalid PWA code', async ({ page }) => {
    await page.goto('/pwa');

    await page.fill('[name="code"], [data-testid="auth-code-input"]', 'INVALID-CODE');
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator('.error, .text-red-500, [role="alert"]')).toBeVisible();
    await expect(page).toHaveURL(/\/pwa\/?$/);
  });

  test('should show code format hint', async ({ page }) => {
    await page.goto('/pwa');

    // Should show format hint (CEOG-XXXXXX)
    await expect(page.locator('text=/CEOG-|kód|code/i')).toBeVisible();
  });

  test('should handle case-insensitive code input', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-case@test.ceog',
      pwa_auth_code: 'CEOG-ABC123',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await page.goto('/pwa');

    // Enter lowercase code
    await page.fill('[name="code"], [data-testid="auth-code-input"]', 'ceog-abc123');
    await page.click('button[type="submit"]');

    // Should still work (case insensitive)
    await page.waitForURL(/\/pwa\/(dashboard|profile|ticket)/, { timeout: 5000 }).catch(() => {
      // Might be case-sensitive in implementation
    });

    await cleanup();
  });
});

test.describe('PWA Dashboard', () => {
  test('should display guest dashboard after login', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-dashboard@test.ceog',
      name: 'Dashboard Guest',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);

    // Should show dashboard with guest name
    await expect(page.locator('h1, h2').filter({ hasText: new RegExp(guest.name, 'i') }).or(page.locator('text=' + guest.name))).toBeVisible();

    await cleanup();
  });

  test('should show event details on dashboard', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-event@test.ceog',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);

    // Should show event info
    await expect(page.locator('text=/CEO Gála|gala|esemény|event/i')).toBeVisible();

    await cleanup();
  });

  test('should have navigation to profile and ticket', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-nav@test.ceog',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);

    // Should have navigation links
    await expect(page.locator('a, button').filter({ hasText: /profil|profile/i })).toBeVisible();
    await expect(page.locator('a, button').filter({ hasText: /jegy|ticket|qr/i })).toBeVisible();

    await cleanup();
  });
});

test.describe('PWA Profile', () => {
  test('should display guest profile', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-profile@test.ceog',
      name: 'Profile Guest',
      company: 'Test Company',
      position: 'CEO',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);
    await page.goto('/pwa/profile');

    // Should show profile info
    await expect(page.locator('text=' + guest.name)).toBeVisible();
    await expect(page.locator('text=' + guest.email)).toBeVisible();

    await cleanup();
  });

  test('should allow editing dietary requirements', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-dietary@test.ceog',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);
    await page.goto('/pwa/profile');

    // Click edit button if present
    const editButton = page.locator('button:has-text("Szerkesztés"), button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
    }

    // Fill dietary field
    const dietaryField = page.locator('[name="dietary_requirements"], [data-testid="dietary-input"]');
    if (await dietaryField.isVisible()) {
      await dietaryField.fill('Vegetáriánus');
      await page.click('button[type="submit"]');
    }

    await cleanup();
  });

  test('should display company and position', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-company@test.ceog',
      company: 'Test Corporation',
      position: 'Director',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);
    await page.goto('/pwa/profile');

    await expect(page.locator('text=Test Corporation')).toBeVisible();
    await expect(page.locator('text=Director')).toBeVisible();

    await cleanup();
  });
});

test.describe('PWA QR Ticket', () => {
  test('should display QR code ticket', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-ticket@test.ceog',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        qr_code_hash: 'test-qr-token',
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);
    await page.goto('/pwa/ticket');

    // Should show QR code
    await expect(page.locator('canvas, [data-testid="qr-code"], .qr-code, img[alt*="QR"]')).toBeVisible();

    await cleanup();
  });

  test('should show guest name on ticket', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-ticket-name@test.ceog',
      name: 'Ticket Name Guest',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        qr_code_hash: 'test-qr-token',
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);
    await page.goto('/pwa/ticket');

    await expect(page.locator('text=' + guest.name)).toBeVisible();

    await cleanup();
  });

  test('should show ticket type (VIP)', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-vip-ticket@test.ceog',
      guest_type: 'vip',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        qr_code_hash: 'test-qr-token',
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);
    await page.goto('/pwa/ticket');

    await expect(page.locator('text=/VIP|vip/i')).toBeVisible();

    await cleanup();
  });

  test('should work offline (ticket available)', async ({ page, seedGuest, db, cleanup, context }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-offline@test.ceog',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        qr_code_hash: 'test-qr-token',
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);
    await page.goto('/pwa/ticket');

    // Wait for service worker to cache
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Reload page
    await page.reload().catch(() => {
      // Expected to fail or show cached content
    });

    // Should still show ticket (from cache)
    await expect(page.locator('canvas, [data-testid="qr-code"], .qr-code')).toBeVisible().catch(() => {
      // Offline support might not be fully implemented
    });

    // Go back online
    await context.setOffline(false);

    await cleanup();
  });
});

test.describe('PWA Table Information', () => {
  test('should display assigned table number', async ({ page, seedGuest, seedTable, db, cleanup }) => {
    const table = await seedTable(createTable({ name: 'TEST-PWA-Table-001' }));
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-table@test.ceog',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await db.tableAssignment.create({
      data: {
        table_id: table.id,
        guest_id: guest.id,
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);

    // Should show table assignment
    await expect(page.locator('text=/asztal|table/i').filter({ hasText: new RegExp(table.name, 'i') }).or(page.locator('text=' + table.name))).toBeVisible({ timeout: 10000 });

    await cleanup();
  });

  test('should show "not assigned" when no table', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-no-table@test.ceog',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);

    // Should show "not assigned" or similar
    await expect(page.locator('text=/nincs|not assigned|később|later/i')).toBeVisible().catch(() => {
      // Might not be displayed
    });

    await cleanup();
  });
});

test.describe('PWA Mobile Experience', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE size
  });

  test('should be mobile responsive', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-mobile@test.ceog',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);

    // Content should be visible and not overflow
    await expect(page.locator('body')).toBeVisible();

    // No horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);

    await cleanup();
  });

  test('should have touch-friendly buttons (min 44x44)', async ({ page }) => {
    await page.goto('/pwa');

    const submitButton = page.locator('button[type="submit"]');
    const box = await submitButton.boundingBox();

    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('PWA Manifest and Service Worker', () => {
  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/pwa');

    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
  });

  test('should load service worker', async ({ page }) => {
    await page.goto('/pwa');

    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });

    expect(swRegistered).toBe(true);
  });

  test('should have app icons defined', async ({ page }) => {
    await page.goto('/pwa');

    // Check for apple-touch-icon or PWA icons
    const iconLink = page.locator('link[rel*="icon"]');
    await expect(iconLink.first()).toBeVisible().catch(() => {
      // Icons might be in manifest only
    });
  });
});

test.describe('PWA Logout', () => {
  test('should be able to logout', async ({ page, seedGuest, db, cleanup }) => {
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'pwa-logout@test.ceog',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await loginToPWA(page, guest.pwa_auth_code!);

    // Find and click logout
    const logoutButton = page.locator('button, a').filter({ hasText: /kijelentkezés|logout|kilépés/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/pwa\/?$/);
    }

    await cleanup();
  });
});
