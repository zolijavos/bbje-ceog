/**
 * CEO Gala - Cancellation & No-Show Journey Tests
 *
 * Video-recorded end-to-end tests demonstrating:
 * - Guest cancellation flow in PWA
 * - Admin viewing cancelled and no-show guests
 * - Check-in blocking for cancelled registrations
 */
import { test, expect } from '../fixtures';
import {
  createGuestWithPWACode,
  createVIPGuest,
} from '../factories';
import { loginToPWA } from '../helpers';
import jwt from 'jsonwebtoken';

// Helper to generate test QR code JWT token
function generateTestQRToken(payload: {
  registration_id: number;
  guest_id: number;
  ticket_type: string;
}): string {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 48 * 60 * 60,
    },
    process.env.QR_SECRET || 'test-qr-secret-for-testing-only-64-characters-minimum-length'
  );
}

test.describe('Guest Cancellation Journey', () => {
  test('complete guest cancellation flow', async ({ page, seedGuest, db, cleanup }) => {
    // Step 1: Create a registered guest
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'journey-cancel@test.ceog',
      name: 'Journey Cancel Guest',
      company: 'Test Corp',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    // Take screenshot of PWA login
    await page.goto('/pwa');
    await page.screenshot({ path: 'test-results/journey-cancel-01-pwa-login.png', fullPage: true });

    // Step 2: Login to PWA
    await loginToPWA(page, guest.pwa_auth_code!);
    await page.goto('/pwa/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/journey-cancel-02-dashboard.png', fullPage: true });

    // Step 3: Navigate to cancel page
    await page.click('a[href="/pwa/cancel"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/journey-cancel-03-cancel-page.png', fullPage: true });

    // Step 4: Enter cancellation reason
    await page.fill('textarea', 'I have a business trip conflict and cannot attend the event.');
    await page.screenshot({ path: 'test-results/journey-cancel-04-reason-entered.png', fullPage: true });

    // Step 5: Confirm cancellation
    await page.click('button:has-text("Confirm Cancellation")');
    await expect(page.getByText('Attendance Cancelled')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/journey-cancel-05-success.png', fullPage: true });

    // Step 6: Verify database update
    const updatedReg = await db.registration.findFirst({
      where: { guest_id: guest.id },
    });
    expect(updatedReg?.cancelled_at).not.toBeNull();
    expect(updatedReg?.cancellation_reason).toContain('business trip');

    await cleanup();
  });

  test('guest sees already cancelled state', async ({ page, seedGuest, db, cleanup }) => {
    // Create already cancelled guest
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'journey-already-cancel@test.ceog',
      name: 'Already Cancelled Guest',
    }));

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        cancelled_at: yesterday,
        cancellation_reason: 'Personal reasons',
      },
    });

    // Login and navigate to cancel page
    await page.goto('/pwa');
    const enterCodeBtn = page.locator('button:has-text("Enter Code")');
    if (await enterCodeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await enterCodeBtn.click();
    }
    await page.fill('[name="code"]', guest.pwa_auth_code!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/pwa\//, { timeout: 10000 });

    await page.goto('/pwa/cancel');
    await page.waitForLoadState('networkidle');

    // Should show already cancelled state
    await expect(page.getByText('Already Cancelled')).toBeVisible();
    await page.screenshot({ path: 'test-results/journey-cancel-already-cancelled.png', fullPage: true });

    await cleanup();
  });
});

test.describe('Admin Cancelled/No-Show View Journey', () => {
  test('admin views cancelled and no-show guests', async ({ page, seedGuest, db, cleanup }) => {
    // Create multiple guests with different statuses
    const cancelledGuest = await seedGuest(createVIPGuest({
      email: 'admin-view-cancelled@test.ceog',
      name: 'Cancelled VIP Guest',
      registration_status: 'declined',
    }));

    const noShowGuest = await seedGuest(createVIPGuest({
      email: 'admin-view-noshow@test.ceog',
      name: 'No-Show VIP Guest',
      registration_status: 'registered',
    }));

    const activeGuest = await seedGuest(createVIPGuest({
      email: 'admin-view-active@test.ceog',
      name: 'Active VIP Guest',
      registration_status: 'registered',
    }));

    // Create registrations
    await db.registration.create({
      data: {
        guest_id: cancelledGuest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        cancelled_at: new Date(),
        cancellation_reason: 'Travel conflict',
      },
    });

    await db.registration.create({
      data: {
        guest_id: noShowGuest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        // No cancelled_at - this is a potential no-show
      },
    });

    await db.registration.create({
      data: {
        guest_id: activeGuest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    // Create check-in for active guest (so they're not a no-show)
    const activeReg = await db.registration.findFirst({
      where: { guest_id: activeGuest.id },
    });
    if (activeReg) {
      await db.checkin.create({
        data: {
          registration_id: activeReg.id,
          guest_id: activeGuest.id,
          method: 'qr',
        },
      });
    }

    // Step 1: Navigate to admin guest list (already authenticated via storageState)
    await page.goto('/admin/guests');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/journey-admin-01-guest-list.png', fullPage: true });

    // Step 2: Filter by cancelled
    const statusFilter = page.locator('#status-filter');
    await statusFilter.selectOption('cancelled');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/journey-admin-02-cancelled-filter.png', fullPage: true });

    // Verify cancelled guest is shown
    await expect(page.getByText('Cancelled VIP Guest')).toBeVisible({ timeout: 5000 });

    // Step 3: Filter by no-show
    await statusFilter.selectOption('no-show');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/journey-admin-03-noshow-filter.png', fullPage: true });

    // Verify no-show guest is shown (registered but not checked in)
    await expect(page.getByText('No-Show VIP Guest')).toBeVisible({ timeout: 5000 });

    await cleanup();
  });
});

test.describe('Check-in Blocking for Cancelled Journey', () => {
  test('check-in scanner rejects cancelled registration', async ({ page, seedGuest, db, cleanup }) => {
    // Create cancelled guest with QR code
    const guest = await seedGuest(createVIPGuest({
      email: 'checkin-cancelled@test.ceog',
      name: 'Cancelled Checkin Guest',
      registration_status: 'declined',
    }));

    const registration = await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        cancelled_at: new Date(),
        cancellation_reason: 'Cancelled by guest',
      },
    });

    // Generate QR token
    const qrToken = generateTestQRToken({
      registration_id: registration.id,
      guest_id: guest.id,
      ticket_type: 'vip_free',
    });

    await db.registration.update({
      where: { id: registration.id },
      data: { qr_code_hash: qrToken },
    });

    // Navigate to admin first to ensure we're authenticated
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Navigate to check-in page
    await page.goto('/checkin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/journey-checkin-01-scanner.png', fullPage: true });

    // Call validation API directly (simulating QR scan)
    const result = await page.evaluate(async (token) => {
      const response = await fetch('/api/checkin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token }),
      });
      return response.json();
    }, qrToken);

    // Verify rejection - should be CANCELLED (not UNAUTHORIZED since we're authenticated)
    expect(result.valid).toBe(false);
    expect(result.error).toBe('CANCELLED');

    // Take screenshot showing the concept (API rejected, would show red card)
    await page.screenshot({ path: 'test-results/journey-checkin-02-cancelled-rejected.png', fullPage: true });

    await cleanup();
  });
});
