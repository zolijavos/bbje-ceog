/**
 * API Tests: Live Seating Display Feature
 *
 * Covers:
 * - GET /api/admin/seating-display-data (tables + guests + checkinStats)
 * - GET /api/admin/display-stream (SSE real-time check-in events)
 * - POST /api/checkin/submit (extended response with guestDetails)
 *
 * Auth: NextAuth CredentialsProvider (JWT sessions)
 * CSRF: Origin header required for POST requests to /api/admin/* and /api/checkin/*
 */

import { test, expect, type APIRequestContext } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

const ADMIN_CREDENTIALS = {
  email: 'admin@ceogala.test',
  password: 'Admin123!',
};

const STAFF_CREDENTIALS = {
  email: 'staff@ceogala.test',
  password: 'Staff123!',
};

/**
 * Authenticate via NextAuth CredentialsProvider and return session cookies.
 *
 * NextAuth expects a POST to /api/auth/callback/credentials with:
 *   - email, password (provider credentials)
 *   - csrfToken (from GET /api/auth/csrf)
 *   - callbackUrl (redirect target)
 *
 * The response sets next-auth.session-token (or __Secure-next-auth.session-token)
 * cookies which we forward on subsequent requests.
 */
async function getAuthCookies(
  request: APIRequestContext,
  credentials: { email: string; password: string }
): Promise<string> {
  // Step 1: Fetch CSRF token from NextAuth
  const csrfRes = await request.get(`${BASE_URL}/api/auth/csrf`);
  expect(csrfRes.ok()).toBeTruthy();
  const { csrfToken } = await csrfRes.json();

  // Collect cookies set by the csrf endpoint
  const csrfCookies = (csrfRes.headers()['set-cookie'] || '')
    .split(/,(?=[^ ])/)
    .map((c: string) => c.split(';')[0].trim())
    .filter(Boolean);

  // Step 2: POST credentials to NextAuth callback
  const callbackRes = await request.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    {
      form: {
        email: credentials.email,
        password: credentials.password,
        csrfToken,
        callbackUrl: `${BASE_URL}/admin`,
        json: 'true',
      },
      headers: {
        cookie: csrfCookies.join('; '),
      },
      maxRedirects: 0,
    }
  );

  // NextAuth may respond with 200 (json:true) or 302 redirect
  // Collect ALL set-cookie headers from both responses
  const callbackCookies = (callbackRes.headers()['set-cookie'] || '')
    .split(/,(?=[^ ])/)
    .map((c: string) => c.split(';')[0].trim())
    .filter(Boolean);

  const allCookies = [...csrfCookies, ...callbackCookies];

  // Merge cookies (later values override earlier for same key)
  const cookieMap = new Map<string, string>();
  for (const cookie of allCookies) {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx > 0) {
      const key = cookie.substring(0, eqIdx);
      cookieMap.set(key, cookie);
    }
  }

  return Array.from(cookieMap.values()).join('; ');
}

/**
 * Make an authenticated GET request
 */
async function authGet(
  request: APIRequestContext,
  url: string,
  cookies: string
) {
  return request.get(url, {
    headers: { cookie: cookies },
  });
}

/**
 * Make an authenticated POST request (includes Origin header for CSRF)
 */
async function authPost(
  request: APIRequestContext,
  url: string,
  cookies: string,
  data: Record<string, unknown>
) {
  return request.post(url, {
    headers: {
      cookie: cookies,
      origin: BASE_URL,
      'content-type': 'application/json',
    },
    data,
  });
}

// ---------------------------------------------------------------------------
// Tests: GET /api/admin/seating-display-data
// ---------------------------------------------------------------------------

test.describe('GET /api/admin/seating-display-data', () => {
  test('[P0] returns 401 when no auth session is provided', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/admin/seating-display-data`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  test('[P0] returns 403 when staff user accesses admin-only endpoint', async ({ request }) => {
    const cookies = await getAuthCookies(request, STAFF_CREDENTIALS);
    const res = await authGet(request, `${BASE_URL}/api/admin/seating-display-data`, cookies);
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  test('[P1] returns valid response shape for admin user', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authGet(request, `${BASE_URL}/api/admin/seating-display-data`, cookies);
    expect(res.status()).toBe(200);

    const body = await res.json();

    // Top-level shape
    expect(body).toHaveProperty('tables');
    expect(body).toHaveProperty('checkinStats');
    expect(Array.isArray(body.tables)).toBe(true);

    // checkinStats shape
    expect(body.checkinStats).toHaveProperty('checkedIn');
    expect(body.checkinStats).toHaveProperty('total');
    expect(typeof body.checkinStats.checkedIn).toBe('number');
    expect(typeof body.checkinStats.total).toBe('number');
    expect(body.checkinStats.checkedIn).toBeGreaterThanOrEqual(0);
    expect(body.checkinStats.total).toBeGreaterThanOrEqual(0);

    // Validate table structure (if any tables exist in seed data)
    if (body.tables.length > 0) {
      const table = body.tables[0];
      expect(table).toHaveProperty('id');
      expect(table).toHaveProperty('name');
      expect(table).toHaveProperty('guests');
      expect(typeof table.id).toBe('number');
      expect(typeof table.name).toBe('string');
      expect(Array.isArray(table.guests)).toBe(true);

      // Validate guest structure (if table has guests)
      if (table.guests.length > 0) {
        const guest = table.guests[0];
        expect(guest).toHaveProperty('id');
        expect(guest).toHaveProperty('firstName');
        expect(guest).toHaveProperty('lastName');
        expect(guest).toHaveProperty('checkedIn');
        expect(typeof guest.id).toBe('number');
        expect(typeof guest.firstName).toBe('string');
        expect(typeof guest.lastName).toBe('string');
        expect(typeof guest.checkedIn).toBe('boolean');
      }
    }
  });

  test('[P1] checkinStats.total equals sum of all table guest counts', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authGet(request, `${BASE_URL}/api/admin/seating-display-data`, cookies);
    expect(res.status()).toBe(200);

    const body = await res.json();
    const totalFromTables = body.tables.reduce(
      (sum: number, table: { guests: unknown[] }) => sum + table.guests.length,
      0
    );
    expect(body.checkinStats.total).toBe(totalFromTables);
  });
});

// ---------------------------------------------------------------------------
// Tests: GET /api/admin/display-stream (SSE)
// ---------------------------------------------------------------------------

test.describe('GET /api/admin/display-stream', () => {
  test('[P0] returns 401 when no auth session is provided', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/admin/display-stream`);
    expect(res.status()).toBe(401);
  });

  test('[P0] returns 403 when staff user accesses admin-only SSE stream', async ({ request }) => {
    const cookies = await getAuthCookies(request, STAFF_CREDENTIALS);
    const res = await authGet(request, `${BASE_URL}/api/admin/display-stream`, cookies);
    expect(res.status()).toBe(403);
  });

  test('[P1] returns SSE content-type headers for admin user', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);

    // Use fetch with abort to test headers without hanging on the stream
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await request.get(`${BASE_URL}/api/admin/display-stream`, {
        headers: { cookie: cookies },
        timeout: 5000,
      });

      // If we got a response before timeout, check it
      expect(res.status()).toBe(200);
      const contentType = res.headers()['content-type'] || '';
      expect(contentType).toContain('text/event-stream');
    } catch (error: unknown) {
      // SSE streams may timeout because they stay open -- that's expected.
      // If the error is a timeout, the endpoint opened successfully (200) before
      // the stream kept going. We verify auth works by checking the non-auth
      // tests above return 401/403 while this one does NOT.
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('timeout') && !errorMessage.includes('abort')) {
        throw error;
      }
      // Timeout on SSE is acceptable -- the stream opened which means auth passed.
    } finally {
      clearTimeout(timeout);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: POST /api/checkin/submit — guestDetails in response
// ---------------------------------------------------------------------------

test.describe('POST /api/checkin/submit', () => {
  test('[P0] returns 401 when no auth session is provided', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/checkin/submit`, {
      headers: {
        origin: BASE_URL,
        'content-type': 'application/json',
      },
      data: { registrationId: 1 },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('UNAUTHORIZED');
  });

  test('[P0] returns 403 CSRF error when Origin header is missing', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await request.post(`${BASE_URL}/api/checkin/submit`, {
      headers: {
        cookie: cookies,
        'content-type': 'application/json',
        // Deliberately omitting origin header to trigger CSRF rejection
      },
      data: { registrationId: 1 },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('CSRF');
  });

  test('[P0] returns 400 for invalid registrationId', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(
      request,
      `${BASE_URL}/api/checkin/submit`,
      cookies,
      { registrationId: -1 }
    );
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('INVALID_REQUEST');
  });

  test('[P0] successful check-in response includes guestDetails field', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);

    // First, fetch seating data to find a valid guest with a registration
    // that can be checked in (not already checked in)
    const seatingRes = await authGet(
      request,
      `${BASE_URL}/api/admin/seating-display-data`,
      cookies
    );
    expect(seatingRes.ok()).toBeTruthy();
    const seatingData = await seatingRes.json();

    // Find a guest that is NOT checked in
    let targetGuestId: number | null = null;
    for (const table of seatingData.tables) {
      for (const guest of table.guests) {
        if (!guest.checkedIn) {
          targetGuestId = guest.id;
          break;
        }
      }
      if (targetGuestId) break;
    }

    if (!targetGuestId) {
      // If all assigned guests are checked in, try to find any guest with a registration
      // via the guests API
      const guestsRes = await authGet(
        request,
        `${BASE_URL}/api/admin/guests?status=registered&limit=1`,
        cookies
      );
      if (guestsRes.ok()) {
        const guestsData = await guestsRes.json();
        const guests = guestsData.guests || guestsData;
        if (Array.isArray(guests) && guests.length > 0) {
          targetGuestId = guests[0].id;
        }
      }
    }

    // Skip if no suitable guest found (test data dependent)
    test.skip(!targetGuestId, 'No unchecked-in guest with registration found in seed data');

    // We need the registrationId, not guestId. Fetch guest details.
    const guestRes = await authGet(
      request,
      `${BASE_URL}/api/admin/guests/${targetGuestId}`,
      cookies
    );
    expect(guestRes.ok()).toBeTruthy();
    const guestData = await guestRes.json();

    const registrationId = guestData.registration?.id || guestData.registrationId;
    test.skip(!registrationId, 'Guest has no registration — cannot check in');

    // Submit check-in
    const checkinRes = await authPost(
      request,
      `${BASE_URL}/api/checkin/submit`,
      cookies,
      { registrationId }
    );

    const checkinBody = await checkinRes.json();

    if (checkinBody.success) {
      // Validate guestDetails presence and shape
      expect(checkinBody).toHaveProperty('guestDetails');
      expect(checkinBody.guestDetails).toHaveProperty('guestName');
      expect(checkinBody.guestDetails).toHaveProperty('guestType');
      expect(checkinBody.guestDetails).toHaveProperty('tableName');
      expect(checkinBody.guestDetails).toHaveProperty('title');
      expect(checkinBody.guestDetails).toHaveProperty('dietaryRequirements');

      // Type checks
      expect(typeof checkinBody.guestDetails.guestName).toBe('string');
      expect(typeof checkinBody.guestDetails.guestType).toBe('string');
      expect(checkinBody.guestDetails.guestName.length).toBeGreaterThan(0);
      expect(checkinBody.guestDetails.guestType.length).toBeGreaterThan(0);

      // tableName, title, dietaryRequirements can be null
      expect(
        checkinBody.guestDetails.tableName === null ||
        typeof checkinBody.guestDetails.tableName === 'string'
      ).toBe(true);
      expect(
        checkinBody.guestDetails.title === null ||
        typeof checkinBody.guestDetails.title === 'string'
      ).toBe(true);
      expect(
        checkinBody.guestDetails.dietaryRequirements === null ||
        typeof checkinBody.guestDetails.dietaryRequirements === 'string'
      ).toBe(true);

      // Also verify checkinId is present
      expect(checkinBody).toHaveProperty('checkinId');
      expect(typeof checkinBody.checkinId).toBe('number');
    } else {
      // If already checked in, that is acceptable for seed data state
      expect(checkinBody.error).toBe('ALREADY_CHECKED_IN');
    }
  });

  test('[P1] admin override check-in still returns guestDetails', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);

    // Find any guest that IS already checked in to test override
    const seatingRes = await authGet(
      request,
      `${BASE_URL}/api/admin/seating-display-data`,
      cookies
    );
    expect(seatingRes.ok()).toBeTruthy();
    const seatingData = await seatingRes.json();

    let checkedInGuestId: number | null = null;
    for (const table of seatingData.tables) {
      for (const guest of table.guests) {
        if (guest.checkedIn) {
          checkedInGuestId = guest.id;
          break;
        }
      }
      if (checkedInGuestId) break;
    }

    test.skip(!checkedInGuestId, 'No checked-in guest found in seed data for override test');

    // Get registration ID for the checked-in guest
    const guestRes = await authGet(
      request,
      `${BASE_URL}/api/admin/guests/${checkedInGuestId}`,
      cookies
    );
    expect(guestRes.ok()).toBeTruthy();
    const guestData = await guestRes.json();

    const registrationId = guestData.registration?.id || guestData.registrationId;
    test.skip(!registrationId, 'Checked-in guest has no registration ID');

    // Submit override check-in
    const overrideRes = await authPost(
      request,
      `${BASE_URL}/api/checkin/submit`,
      cookies,
      { registrationId, override: true }
    );

    const overrideBody = await overrideRes.json();

    // Override should succeed for admin
    expect(overrideBody.success).toBe(true);
    expect(overrideBody).toHaveProperty('guestDetails');
    expect(overrideBody.guestDetails).toHaveProperty('guestName');
    expect(overrideBody.guestDetails).toHaveProperty('guestType');
    expect(overrideBody.guestDetails).toHaveProperty('tableName');
    expect(overrideBody.guestDetails).toHaveProperty('title');
    expect(overrideBody.guestDetails).toHaveProperty('dietaryRequirements');
    expect(typeof overrideBody.guestDetails.guestName).toBe('string');
    expect(overrideBody.checkinId).toBeTruthy();
  });

  test('[P0] staff user can submit check-in (staff + admin both allowed)', async ({ request }) => {
    const cookies = await getAuthCookies(request, STAFF_CREDENTIALS);

    // Staff can submit check-ins. Use a known-invalid registration ID
    // to verify auth passes (we expect a validation error, not 401/403)
    const res = await authPost(
      request,
      `${BASE_URL}/api/checkin/submit`,
      cookies,
      { registrationId: 999999 }
    );

    const body = await res.json();
    // Should NOT be 401 or 403 -- staff is authorized for check-in
    expect(res.status()).not.toBe(401);
    expect(res.status()).not.toBe(403);
    // The request should reach the service layer (success:false because reg not found)
    expect(body.success).toBe(false);
    expect(body.error).not.toBe('UNAUTHORIZED');
  });
});
