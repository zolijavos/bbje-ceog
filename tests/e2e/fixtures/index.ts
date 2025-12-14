/**
 * CEO Gala - Merged Test Fixtures
 *
 * Composable fixtures using mergeTests pattern from @seontechnologies/playwright-utils
 * Each fixture provides one isolated concern (auth, API, database, etc.)
 */
import { test as base, expect, mergeTests } from '@playwright/test';
import { PrismaClient, GuestType, RegistrationStatus, TicketType, PaymentMethod, TableStatus, UserRole } from '@prisma/client';

// Types for fixtures
type GuestData = {
  email: string;
  name: string;
  guest_type: GuestType;
  registration_status?: RegistrationStatus;
  title?: string;
  phone?: string;
  company?: string;
  position?: string;
  dietary_requirements?: string;
  seating_preferences?: string;
  magic_link_hash?: string;
  magic_link_expires_at?: Date;
  pwa_auth_code?: string;
};

type TableData = {
  name: string;
  capacity: number;
  type?: string;
  pos_x?: number;
  pos_y?: number;
  status?: TableStatus;
};

type RegistrationData = {
  guest_id: number;
  ticket_type: TicketType;
  payment_method?: PaymentMethod;
  partner_name?: string;
  partner_email?: string;
  gdpr_consent?: boolean;
  cancellation_accepted?: boolean;
};

// Database fixture - direct Prisma access for seeding and cleanup
const dbFixture = base.extend<{
  db: PrismaClient;
  seedGuest: (data: GuestData) => Promise<{ id: number } & GuestData>;
  seedTable: (data: TableData) => Promise<{ id: number } & TableData>;
  seedRegistration: (data: RegistrationData) => Promise<{ id: number } & RegistrationData>;
  cleanup: () => Promise<void>;
}>({
  db: async ({}, use) => {
    const prisma = new PrismaClient();
    await use(prisma);
    await prisma.$disconnect();
  },

  seedGuest: async ({ db }, use) => {
    const createdIds: number[] = [];

    const seedGuest = async (data: GuestData) => {
      const guest = await db.guest.create({
        data: {
          email: data.email,
          name: data.name,
          guest_type: data.guest_type,
          registration_status: data.registration_status || 'invited',
          title: data.title,
          phone: data.phone,
          company: data.company,
          position: data.position,
          dietary_requirements: data.dietary_requirements,
          seating_preferences: data.seating_preferences,
          magic_link_hash: data.magic_link_hash,
          magic_link_expires_at: data.magic_link_expires_at,
          pwa_auth_code: data.pwa_auth_code,
        },
      });
      createdIds.push(guest.id);
      return guest;
    };

    await use(seedGuest);

    // Cleanup created guests
    for (const id of createdIds) {
      try {
        await db.guest.delete({ where: { id } });
      } catch {
        // Guest might already be deleted via cascade
      }
    }
  },

  seedTable: async ({ db }, use) => {
    const createdIds: number[] = [];

    const seedTable = async (data: TableData) => {
      const table = await db.table.create({
        data: {
          name: data.name,
          capacity: data.capacity,
          type: data.type || 'standard',
          pos_x: data.pos_x,
          pos_y: data.pos_y,
          status: data.status || 'available',
        },
      });
      createdIds.push(table.id);
      return table;
    };

    await use(seedTable);

    // Cleanup created tables
    for (const id of createdIds) {
      try {
        await db.table.delete({ where: { id } });
      } catch {
        // Table might already be deleted
      }
    }
  },

  seedRegistration: async ({ db }, use) => {
    const createdIds: number[] = [];

    const seedRegistration = async (data: RegistrationData) => {
      const registration = await db.registration.create({
        data: {
          guest_id: data.guest_id,
          ticket_type: data.ticket_type,
          payment_method: data.payment_method,
          partner_name: data.partner_name,
          partner_email: data.partner_email,
          gdpr_consent: data.gdpr_consent ?? true,
          gdpr_consent_at: data.gdpr_consent ? new Date() : undefined,
          cancellation_accepted: data.cancellation_accepted ?? true,
          cancellation_accepted_at: data.cancellation_accepted ? new Date() : undefined,
        },
      });
      createdIds.push(registration.id);
      return registration;
    };

    await use(seedRegistration);

    // Cleanup created registrations
    for (const id of createdIds) {
      try {
        await db.registration.delete({ where: { id } });
      } catch {
        // Registration might already be deleted
      }
    }
  },

  cleanup: async ({ db }, use) => {
    const cleanup = async () => {
      // Clean test data in correct order (foreign key constraints)
      await db.checkin.deleteMany({ where: { guest: { email: { contains: '@test.ceog' } } } });
      await db.tableAssignment.deleteMany({ where: { guest: { email: { contains: '@test.ceog' } } } });
      await db.billingInfo.deleteMany({ where: { registration: { guest: { email: { contains: '@test.ceog' } } } } });
      await db.payment.deleteMany({ where: { registration: { guest: { email: { contains: '@test.ceog' } } } } });
      await db.registration.deleteMany({ where: { guest: { email: { contains: '@test.ceog' } } } });
      await db.emailLog.deleteMany({ where: { guest: { email: { contains: '@test.ceog' } } } });
      await db.guest.deleteMany({ where: { email: { contains: '@test.ceog' } } });
      await db.table.deleteMany({ where: { name: { startsWith: 'TEST-' } } });
    };

    await use(cleanup);
  },
});

// API fixture - for making API requests with automatic JSON handling
// Initializes page context first to ensure cookies are available
const apiFixture = base.extend<{
  apiRequest: (options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
  }) => Promise<{ status: number; body: unknown }>;
}>({
  apiRequest: async ({ page, baseURL }, use) => {
    // Navigate to admin page first to initialize context with cookies
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const apiRequest = async (options: {
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      url: string;
      data?: unknown;
      headers?: Record<string, string>;
    }) => {
      // Construct full URL if not absolute
      const fullUrl = options.url.startsWith('http')
        ? options.url
        : `${baseURL}${options.url}`;

      // Use page.request to inherit cookies from the page context
      // Include Origin header for CSRF protection on mutating requests
      const response = await page.request.fetch(fullUrl, {
        method: options.method,
        data: options.data,
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseURL || 'http://localhost:3000',
          ...options.headers,
        },
      });

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }

      return { status: response.status(), body };
    };

    await use(apiRequest);
  },
});

// Admin auth fixture - authenticates as admin user
const adminAuthFixture = base.extend<{
  loginAsAdmin: () => Promise<void>;
  loginAsStaff: () => Promise<void>;
}>({
  loginAsAdmin: async ({ page }, use) => {
    const loginAsAdmin = async () => {
      await page.goto('/admin/login');
      await page.fill('[name="email"]', 'admin@ceogala.test');
      await page.fill('[name="password"]', 'Admin123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin');
    };

    await use(loginAsAdmin);
  },

  loginAsStaff: async ({ page }, use) => {
    const loginAsStaff = async () => {
      await page.goto('/admin/login');
      await page.fill('[name="email"]', 'staff@ceogala.test');
      await page.fill('[name="password"]', 'Staff123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin');
    };

    await use(loginAsStaff);
  },
});

// Merge all fixtures
export const test = mergeTests(dbFixture, apiFixture, adminAuthFixture);
export { expect };

// Re-export types
export type { GuestData, TableData, RegistrationData };
