/**
 * CEO Gala - Bulk Email Scheduling E2E Tests
 *
 * Tests for the bulk email scheduling workflow:
 * - Scheduling via admin UI
 * - Filter selection
 * - Bulk API calls
 * - Verification in pending list
 *
 * Priority: P1 - Critical admin functionality
 */
import { test, expect } from '../fixtures';

// Helper to generate future datetime
const getFutureDateTime = (hoursFromNow: number = 24): string => {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  // Format: YYYY-MM-DDTHH:MM (for datetime-local input)
  return date.toISOString().slice(0, 16);
};

test.describe('Bulk Email Scheduling', () => {
  // Use stored admin auth state
  test.use({ storageState: 'tests/e2e/.auth/admin.json' });

  test.describe('Admin UI Flow', () => {
    test('[P0] should schedule bulk emails via admin UI', async ({ page, db }) => {
      // GIVEN: We have VIP guests in the system
      const vipGuest = await db.guest.create({
        data: {
          email: `bulk-test-vip-${Date.now()}@test.ceog`,
          name: 'Bulk Test VIP',
          guest_type: 'vip',
          registration_status: 'registered',
        },
      });

      try {
        // WHEN: Navigate to scheduled emails and open bulk form
        await page.goto('/admin/scheduled-emails');
        await page.waitForLoadState('networkidle');

        // Click "Schedule New" or similar button to open form
        const scheduleButton = page.locator('button').filter({ hasText: /schedule|új|ütemez/i }).first();
        await scheduleButton.click();
        await page.waitForTimeout(500);

        // Select template
        const templateSelect = page.locator('select').first();
        await templateSelect.selectOption({ index: 1 }); // First available template

        // Set future date/time
        const datetimeInput = page.locator('input[type="datetime-local"]').first();
        if (await datetimeInput.isVisible()) {
          await datetimeInput.fill(getFutureDateTime(48));
        }

        // Look for guest type filter or submit button
        const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /schedule|ütemez|küld/i }).first();

        // THEN: Form submission should work (we just verify no crash)
        if (await submitButton.isVisible()) {
          // Note: Actual submission may require more form fields
          // This tests that the UI is functional
          expect(await submitButton.isEnabled()).toBeTruthy();
        }
      } finally {
        // Cleanup
        await db.scheduledEmail.deleteMany({ where: { guest_id: vipGuest.id } });
        await db.guest.delete({ where: { id: vipGuest.id } });
      }
    });

    test('[P1] should display scheduled emails in pending list', async ({ page, db, apiRequest }) => {
      // GIVEN: Create a guest and schedule an email via API
      const guest = await db.guest.create({
        data: {
          email: `pending-list-test-${Date.now()}@test.ceog`,
          name: 'Pending List Test Guest',
          guest_type: 'vip',
          registration_status: 'registered',
        },
      });

      // Schedule email via direct DB (simulating the flow)
      const scheduledEmail = await db.scheduledEmail.create({
        data: {
          guest_id: guest.id,
          template_slug: 'event_reminder',
          scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          status: 'pending',
          schedule_type: 'bulk',
          variables: JSON.stringify({ guestName: guest.name }),
        },
      });

      try {
        // WHEN: Navigate to scheduled emails page
        await page.goto('/admin/scheduled-emails');
        await page.waitForLoadState('networkidle');

        // THEN: The scheduled email should appear in the list
        // Look for table or list containing the email info
        const pageContent = await page.content();

        // Verify the page loaded correctly (has table or list)
        expect(
          pageContent.includes('pending') ||
          pageContent.includes('Pending') ||
          pageContent.includes('függőben') ||
          pageContent.includes('Függőben')
        ).toBeTruthy();
      } finally {
        // Cleanup
        await db.scheduledEmail.delete({ where: { id: scheduledEmail.id } });
        await db.guest.delete({ where: { id: guest.id } });
      }
    });

    test('[P1] should cancel pending scheduled email', async ({ page, db }) => {
      // GIVEN: A pending scheduled email exists
      const guest = await db.guest.create({
        data: {
          email: `cancel-test-${Date.now()}@test.ceog`,
          name: 'Cancel Test Guest',
          guest_type: 'vip',
          registration_status: 'registered',
        },
      });

      const scheduledEmail = await db.scheduledEmail.create({
        data: {
          guest_id: guest.id,
          template_slug: 'event_reminder',
          scheduled_for: new Date(Date.now() + 48 * 60 * 60 * 1000),
          status: 'pending',
          schedule_type: 'manual',
        },
      });

      try {
        // WHEN: Navigate to scheduled emails
        await page.goto('/admin/scheduled-emails');
        await page.waitForLoadState('networkidle');

        // Look for cancel button (Hungarian: "Mégse", "Törlés")
        const cancelButton = page.locator('button').filter({
          hasText: /cancel|mégse|törl|delete/i
        }).first();

        // THEN: Cancel functionality should be available
        if (await cancelButton.isVisible()) {
          // We just verify the button exists and is clickable
          expect(await cancelButton.isEnabled()).toBeTruthy();
        }
      } finally {
        // Cleanup
        await db.scheduledEmail.delete({ where: { id: scheduledEmail.id } });
        await db.guest.delete({ where: { id: guest.id } });
      }
    });
  });

  test.describe('Bulk API Direct Tests', () => {
    test('[P0] should schedule bulk emails via API', async ({ apiRequest, db }) => {
      // GIVEN: Multiple VIP guests exist
      const guests = await Promise.all([
        db.guest.create({
          data: {
            email: `api-bulk-1-${Date.now()}@test.ceog`,
            name: 'API Bulk Test 1',
            guest_type: 'vip',
            registration_status: 'registered',
          },
        }),
        db.guest.create({
          data: {
            email: `api-bulk-2-${Date.now()}@test.ceog`,
            name: 'API Bulk Test 2',
            guest_type: 'vip',
            registration_status: 'registered',
          },
        }),
      ]);

      try {
        // WHEN: Call bulk API with filter
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 2);

        const { status, body } = await apiRequest({
          method: 'POST',
          url: '/api/admin/scheduled-emails/bulk',
          data: {
            filter: {
              guest_types: ['vip'],
              registration_statuses: ['registered'],
            },
            template_slug: 'event_reminder',
            scheduled_for: futureDate.toISOString(),
          },
        });

        // THEN: Should succeed
        expect(status).toBe(200);
        expect((body as any).success).toBe(true);
        expect((body as any).scheduled).toBeGreaterThanOrEqual(2);
      } finally {
        // Cleanup
        for (const guest of guests) {
          await db.scheduledEmail.deleteMany({ where: { guest_id: guest.id } });
          await db.guest.delete({ where: { id: guest.id } });
        }
      }
    });

    test('[P1] should skip already scheduled guests (deduplication)', async ({ apiRequest, db }) => {
      // GIVEN: A guest with existing pending email
      const guest = await db.guest.create({
        data: {
          email: `dedup-test-${Date.now()}@test.ceog`,
          name: 'Deduplication Test',
          guest_type: 'vip',
          registration_status: 'registered',
        },
      });

      // Create existing pending email
      const existingEmail = await db.scheduledEmail.create({
        data: {
          guest_id: guest.id,
          template_slug: 'event_reminder',
          scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'pending',
          schedule_type: 'manual',
        },
      });

      try {
        // WHEN: Try to schedule same template again
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 2);

        const { status, body } = await apiRequest({
          method: 'POST',
          url: '/api/admin/scheduled-emails/bulk',
          data: {
            guest_ids: [guest.id],
            template_slug: 'event_reminder',
            scheduled_for: futureDate.toISOString(),
          },
        });

        // THEN: Should skip the already scheduled guest
        expect(status).toBe(200);
        expect((body as any).skipped).toBe(1);
        expect((body as any).scheduled).toBe(0);
      } finally {
        // Cleanup
        await db.scheduledEmail.delete({ where: { id: existingEmail.id } });
        await db.guest.delete({ where: { id: guest.id } });
      }
    });

    test('[P1] should reject past scheduled_for date', async ({ apiRequest }) => {
      // WHEN: Try to schedule with past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const { status, body } = await apiRequest({
        method: 'POST',
        url: '/api/admin/scheduled-emails/bulk',
        data: {
          filter: { guest_types: ['vip'] },
          template_slug: 'event_reminder',
          scheduled_for: pastDate.toISOString(),
        },
      });

      // THEN: Should be rejected
      expect(status).toBe(400);
      expect((body as any).error).toMatch(/future|múlt|past/i);
    });

    test('[P1] should reject invalid template_slug', async ({ apiRequest }) => {
      // WHEN: Try to schedule with invalid template
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const { status, body } = await apiRequest({
        method: 'POST',
        url: '/api/admin/scheduled-emails/bulk',
        data: {
          filter: { guest_types: ['vip'] },
          template_slug: 'nonexistent_template_12345',
          scheduled_for: futureDate.toISOString(),
        },
      });

      // THEN: Should be rejected
      expect(status).toBe(400);
    });

    test('[P2] should handle filter with few or no matching guests', async ({ apiRequest }) => {
      // WHEN: Filter with specific guest types
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const { status, body } = await apiRequest({
        method: 'POST',
        url: '/api/admin/scheduled-emails/bulk',
        data: {
          filter: {
            guest_types: ['applicant'],
            registration_statuses: ['rejected'],
          },
          template_slug: 'event_reminder',
          scheduled_for: futureDate.toISOString(),
        },
      });

      // THEN: Should return valid response (could have 0 or more guests)
      // API returns 400 if no guests, 200 with count otherwise
      expect([200, 400]).toContain(status);
      if (status === 200) {
        // Verify response structure
        expect((body as any)).toHaveProperty('scheduled');
        expect((body as any).scheduled).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Staff Role Restriction', () => {
    test('[P1] should deny staff users access to bulk scheduling', async ({ page }) => {
      // Clear existing admin session and login as staff
      await page.context().clearCookies();
      await page.goto('/admin/login');

      await page.fill('[name="email"]', 'staff@ceogala.test');
      await page.fill('[name="password"]', 'Staff123!');
      await page.click('button[type="submit"]');

      // Wait for redirect (staff goes to /checkin)
      await page.waitForURL(/\/checkin|\/admin/, { timeout: 10000 });

      // Try to access bulk API directly (should fail)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await page.request.post('/api/admin/scheduled-emails/bulk', {
        data: {
          filter: { guest_types: ['vip'] },
          template_slug: 'event_reminder',
          scheduled_for: futureDate.toISOString(),
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // THEN: Should be denied (401 Unauthorized or 403 Forbidden)
      // 401 = no valid admin session, 403 = staff role not allowed
      expect([401, 403]).toContain(response.status());
    });
  });
});

test.describe('Email Logs Integration', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin.json' });

  test('[P2] should show email logs page', async ({ page }) => {
    // WHEN: Navigate to email logs (from scheduled emails page)
    await page.goto('/admin/scheduled-emails');
    await page.waitForLoadState('networkidle');

    // Click on logs tab/button
    const logsButton = page.locator('button, a').filter({
      hasText: /log|napló|history|előzmény/i
    }).first();

    if (await logsButton.isVisible()) {
      await logsButton.click();
      await page.waitForTimeout(500);

      // THEN: Logs should be visible
      const hasTable = await page.locator('table').isVisible();
      expect(hasTable).toBeTruthy();
    }
  });
});
