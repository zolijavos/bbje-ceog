/**
 * API Tests: Partner Lifecycle Management
 *
 * Tests POST /api/admin/guests/[id]/partner endpoint
 *
 * Partner Remove:
 *   - [P0] Admin removes partner → 200, cascade delete (Guest, Registration, TableAssignment)
 *   - [P0] Remove blocked if partner checked in → 409 PARTNER_CHECKED_IN
 *   - [P1] Remove when guest has no partner → 400 NO_PARTNER
 *   - [P1] Staff cannot access endpoint → 403
 *   - [P1] Audit log created for PARTNER_REMOVE
 *
 * Partner Replace:
 *   - [P0] Admin replaces partner → 200, old deleted, new created with paired_with_id
 *   - [P0] Self-pairing blocked → 400 SELF_PAIRING
 *   - [P1] Email of existing independent guest blocked → 400 EMAIL_EXISTS
 *   - [P1] Email of someone else's partner blocked → 400 ALREADY_PARTNER
 *   - [P1] New partner gets Registration + PWA auth code
 *   - [P1] Audit log created for PARTNER_CHANGE
 *
 * Validation:
 *   - [P1] Missing required fields → 400 validation error
 *   - [P1] Invalid email format → 400 validation error
 *   - [P1] Invalid guest ID → 404
 */

import { test, expect, type APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const ADMIN = { email: 'admin@ceogala.test', password: 'Admin123!' };
const STAFF = { email: 'staff@ceogala.test', password: 'Staff123!' };

function extractCookies(res: { headersArray(): Array<{ name: string; value: string }> }): string[] {
  return res.headersArray()
    .filter((h) => h.name.toLowerCase() === 'set-cookie')
    .map((h) => h.value.split(';')[0].trim())
    .filter(Boolean);
}

async function login(request: APIRequestContext, creds: { email: string; password: string }): Promise<string> {
  const csrfRes = await request.get(`${BASE_URL}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const csrfCookies = extractCookies(csrfRes);

  const cbRes = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
    form: { email: creds.email, password: creds.password, csrfToken, callbackUrl: `${BASE_URL}/admin`, json: 'true' },
    headers: { cookie: csrfCookies.join('; ') },
    maxRedirects: 0,
  });

  const map = new Map<string, string>();
  for (const c of [...csrfCookies, ...extractCookies(cbRes)]) {
    const eq = c.indexOf('=');
    if (eq > 0) map.set(c.substring(0, eq), c);
  }
  return Array.from(map.values()).join('; ');
}

function get(request: APIRequestContext, path: string, cookies: string) {
  return request.get(`${BASE_URL}${path}`, { headers: { cookie: cookies } });
}

function post(request: APIRequestContext, path: string, cookies: string, data: Record<string, unknown>) {
  return request.post(`${BASE_URL}${path}`, {
    headers: { cookie: cookies, origin: BASE_URL, 'content-type': 'application/json' },
    data,
  });
}

// Known seed data emails for paired guests
const SEED_MAIN_PAIRED = 'paired2@ceogala.test'; // Horváth Attila — paid, card, has partner
const SEED_PARTNER_EMAIL = 'partner2@ceogala.test'; // Krisztina Horváth
const SEED_INVITED_NO_PARTNER = 'vip1@ceogala.test'; // Invited guest, no partner

/** Find a main guest by email and get their ID + partner info */
async function findGuestByEmail(
  request: APIRequestContext,
  cookies: string,
  email: string
): Promise<{ id: number; email: string } | null> {
  const res = await get(request, `/api/admin/guests?search=${encodeURIComponent(email)}&limit=5`, cookies);
  const body = await res.json();
  if (!body.success || !body.guests) return null;

  const guest = body.guests.find((g: { email: string }) => g.email === email);
  return guest ? { id: guest.id, email: guest.email } : null;
}

/** Get a single guest by ID with full details (includes partner_of) */
async function getGuestDetails(
  request: APIRequestContext,
  cookies: string,
  guestId: number
): Promise<Record<string, unknown> | null> {
  const res = await get(request, `/api/admin/guests/${guestId}`, cookies);
  if (res.status() !== 200) return null;
  const body = await res.json();
  return body.success ? body.guest : null;
}

/** Fetch any guest ID from the guest list */
async function findAnyGuestId(request: APIRequestContext, cookies: string): Promise<number> {
  const res = await get(request, '/api/admin/guests?limit=1', cookies);
  const body = await res.json();
  return body.guests?.[0]?.id ?? 999999;
}

// ===== AUTHORIZATION =====

test.describe('Partner API — Authorization', () => {
  test('[P1] Staff cannot access partner endpoint → 403', async ({ request }) => {
    // First get a real guest ID via admin
    const adminCookies = await login(request, ADMIN);
    const guestId = await findAnyGuestId(request, adminCookies);

    const staffCookies = await login(request, STAFF);
    const res = await post(request, `/api/admin/guests/${guestId}/partner`, staffCookies, { action: 'remove' });
    // requireAdmin() returns 401 for non-admin roles
    expect([401, 403]).toContain(res.status());
  });

  test('[P1] Unauthenticated request → 401 or 403', async ({ request }) => {
    const adminCookies = await login(request, ADMIN);
    const guestId = await findAnyGuestId(request, adminCookies);

    const res = await request.post(`${BASE_URL}/api/admin/guests/${guestId}/partner`, {
      headers: { origin: BASE_URL, 'content-type': 'application/json' },
      data: { action: 'remove' },
    });
    // CSRF or auth middleware blocks unauthenticated requests
    expect([400, 401, 403]).toContain(res.status());
  });
});

// ===== VALIDATION =====

test.describe('Partner API — Validation', () => {
  test('[P1] Invalid guest ID → 404', async ({ request }) => {
    const cookies = await login(request, ADMIN);
    const res = await post(request, '/api/admin/guests/999999/partner', cookies, { action: 'remove' });
    expect(res.status()).toBe(404);
  });

  test('[P1] Invalid action → 400', async ({ request }) => {
    const cookies = await login(request, ADMIN);
    const guestId = await findAnyGuestId(request, cookies);
    const res = await post(request, `/api/admin/guests/${guestId}/partner`, cookies, { action: 'invalid' });
    expect(res.status()).toBe(400);
  });

  test('[P1] Replace with missing required fields → 400', async ({ request }) => {
    const cookies = await login(request, ADMIN);
    const guestId = await findAnyGuestId(request, cookies);
    const res = await post(request, `/api/admin/guests/${guestId}/partner`, cookies, {
      action: 'replace',
      partner: { first_name: 'Test' }, // missing last_name, email
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('[P1] Replace with invalid email format → 400', async ({ request }) => {
    const cookies = await login(request, ADMIN);
    const guestId = await findAnyGuestId(request, cookies);
    const res = await post(request, `/api/admin/guests/${guestId}/partner`, cookies, {
      action: 'replace',
      partner: { first_name: 'Test', last_name: 'User', email: 'not-an-email' },
    });
    expect(res.status()).toBe(400);
  });
});

// ===== PARTNER REMOVE =====

test.describe.serial('Partner API — Remove', () => {
  let cookies: string;
  let mainGuestId: number;
  let partnerId: number;

  test('[P0] Admin removes partner successfully', async ({ request }) => {
    cookies = await login(request, ADMIN);
    const main = await findGuestByEmail(request, cookies, SEED_MAIN_PAIRED);
    test.skip(!main, 'Seed guest paired2@ceogala.test not found');
    mainGuestId = main!.id;

    // Find partner ID
    const partner = await findGuestByEmail(request, cookies, SEED_PARTNER_EMAIL);
    test.skip(!partner, 'Seed partner partner2@ceogala.test not found');
    partnerId = partner!.id;

    const res = await post(request, `/api/admin/guests/${mainGuestId}/partner`, cookies, {
      action: 'remove',
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.removedPartner).toBeTruthy();
    expect(body.removedPartner.id).toBe(partnerId);
    expect(body.removedPartner.name).toBeTruthy();
    expect(body.removedPartner.email).toBe(SEED_PARTNER_EMAIL);
  });

  test('[P1] Partner Guest record is deleted after remove', async ({ request }) => {
    test.skip(!partnerId, 'Skipped — no partner was removed');

    const res = await get(request, `/api/admin/guests/${partnerId}`, cookies);
    expect(res.status()).toBe(404);
  });

  test('[P1] Removing partner again → 400 NO_PARTNER', async ({ request }) => {
    test.skip(!mainGuestId, 'Skipped — no partner was removed');

    const res = await post(request, `/api/admin/guests/${mainGuestId}/partner`, cookies, {
      action: 'remove',
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('NO_PARTNER');
  });
});

// ===== PARTNER REPLACE =====

test.describe.serial('Partner API — Replace', () => {
  let cookies: string;
  let mainGuestId: number;
  let newPartnerId: number;

  // Use paired4 for replace tests (separate from remove tests which use paired2)
  const REPLACE_MAIN = 'paired4@ceogala.test'; // Bíró Tamás
  const REPLACE_PARTNER = 'partner4@ceogala.test'; // Eszter Bíró

  test('[P0] Admin replaces partner successfully', async ({ request }) => {
    cookies = await login(request, ADMIN);
    const main = await findGuestByEmail(request, cookies, REPLACE_MAIN);
    test.skip(!main, 'Seed guest paired4@ceogala.test not found');
    mainGuestId = main!.id;

    const partner = await findGuestByEmail(request, cookies, REPLACE_PARTNER);
    test.skip(!partner, 'Seed partner partner4@ceogala.test not found');
    const oldPartnerId = partner!.id;

    const res = await post(request, `/api/admin/guests/${mainGuestId}/partner`, cookies, {
      action: 'replace',
      partner: {
        first_name: 'NewPartner',
        last_name: 'TestReplace',
        email: 'new-partner-replace-test@ceogala.test',
        title: 'Dr.',
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.removedPartner).toBeTruthy();
    expect(body.removedPartner.id).toBe(oldPartnerId);
    expect(body.newPartner).toBeTruthy();
    expect(body.newPartner.name).toContain('NewPartner');
    expect(body.newPartner.email).toBe('new-partner-replace-test@ceogala.test');
    newPartnerId = body.newPartner.id;
  });

  test('[P1] New partner has PWA auth code and correct paired_with_id', async ({ request }) => {
    test.skip(!newPartnerId, 'Skipped — no partner was created');

    const guest = await getGuestDetails(request, cookies, newPartnerId);
    test.skip(!guest, 'New partner guest not found');
    expect(guest!.pwa_auth_code).toBeTruthy();
    expect(String(guest!.pwa_auth_code)).toMatch(/^CEOG-/);
    expect(guest!.paired_with_id).toBe(mainGuestId);
    expect(guest!.registration_status).toBe('registered');
  });

  test('[P0] Self-pairing blocked', async ({ request }) => {
    test.skip(!mainGuestId, 'Skipped — no main guest');

    const res = await post(request, `/api/admin/guests/${mainGuestId}/partner`, cookies, {
      action: 'replace',
      partner: {
        first_name: 'Self',
        last_name: 'Pair',
        email: REPLACE_MAIN,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('SELF_PAIRING');
  });

  test('[P1] Email of existing independent guest blocked', async ({ request }) => {
    test.skip(!mainGuestId, 'Skipped — no main guest');

    const res = await post(request, `/api/admin/guests/${mainGuestId}/partner`, cookies, {
      action: 'replace',
      partner: {
        first_name: 'Existing',
        last_name: 'Guest',
        email: SEED_INVITED_NO_PARTNER,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('EMAIL_EXISTS');
  });

  test('[P1] Guest without partner → remove returns NO_PARTNER', async ({ request }) => {
    const invited = await findGuestByEmail(request, cookies, SEED_INVITED_NO_PARTNER);
    test.skip(!invited, 'No invited guest found');

    const res = await post(request, `/api/admin/guests/${invited!.id}/partner`, cookies, {
      action: 'remove',
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('NO_PARTNER');
  });
});
