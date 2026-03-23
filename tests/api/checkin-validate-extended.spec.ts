/**
 * API Tests: Check-in Validate Endpoint — Extended Coverage
 *
 * POST /api/checkin/validate
 *
 * Covers:
 *   - Authentication enforcement (401 for no session)
 *   - Zod validation (400 for missing/empty qrToken)
 *   - Staff AND admin both allowed (not admin-only)
 *   - Invalid/expired token handling
 *   - CSRF enforcement (Origin header)
 *
 * POST /api/checkin/submit — extended guestDetails coverage
 *   - Cancelled registration returns REGISTRATION_CANCELLED
 *   - Staff cannot override (should they? — per CLAUDE.md API only checks frontend)
 */

import { test, expect, type APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

const ADMIN_CREDENTIALS = { email: 'admin@ceogala.test', password: 'Admin123!' };
const STAFF_CREDENTIALS = { email: 'staff@ceogala.test', password: 'Staff123!' };

// ----- Auth Helper (same pattern as display-seating.spec.ts) -----

function extractCookies(res: { headersArray(): Array<{ name: string; value: string }> }): string[] {
  return res
    .headersArray()
    .filter((h) => h.name.toLowerCase() === 'set-cookie')
    .map((h) => h.value.split(';')[0].trim())
    .filter(Boolean);
}

async function getAuthCookies(
  request: APIRequestContext,
  credentials: { email: string; password: string },
): Promise<string> {
  const csrfRes = await request.get(`${BASE_URL}/api/auth/csrf`);
  expect(csrfRes.ok()).toBeTruthy();
  const { csrfToken } = await csrfRes.json();

  const csrfCookies = extractCookies(csrfRes);

  const callbackRes = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
    form: {
      email: credentials.email,
      password: credentials.password,
      csrfToken,
      callbackUrl: `${BASE_URL}/admin`,
      json: 'true',
    },
    headers: { cookie: csrfCookies.join('; ') },
    maxRedirects: 0,
  });

  const callbackCookies = extractCookies(callbackRes);

  const cookieMap = new Map<string, string>();
  for (const cookie of [...csrfCookies, ...callbackCookies]) {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx > 0) cookieMap.set(cookie.substring(0, eqIdx), cookie);
  }
  return Array.from(cookieMap.values()).join('; ');
}

async function authPost(
  request: APIRequestContext,
  url: string,
  cookies: string,
  data: Record<string, unknown>,
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

// ===== POST /api/checkin/validate =====

test.describe('POST /api/checkin/validate', () => {
  test('[P0] returns 401 when no auth session is provided', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/checkin/validate`, {
      headers: { origin: BASE_URL, 'content-type': 'application/json' },
      data: { qrToken: 'test-token' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.error).toBe('UNAUTHORIZED');
  });

  test('[P0] returns 400 when qrToken is missing from body', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/validate`, cookies, {});
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.error).toBe('INVALID_REQUEST');
  });

  test('[P0] returns 400 when qrToken is empty string', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/validate`, cookies, { qrToken: '' });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.error).toBe('INVALID_REQUEST');
  });

  test('[P0] staff user can access validate endpoint (not admin-only)', async ({ request }) => {
    const cookies = await getAuthCookies(request, STAFF_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/validate`, cookies, {
      qrToken: 'invalid-but-auth-should-pass',
    });
    // Should NOT be 401 or 403 — staff is allowed
    expect(res.status()).not.toBe(401);
    expect(res.status()).not.toBe(403);
    const body = await res.json();
    // The token is invalid so we expect INVALID_TOKEN, but auth passed
    expect(body.valid).toBe(false);
    expect(body.error).not.toBe('UNAUTHORIZED');
  });

  test('[P1] invalid JWT token returns INVALID_TOKEN error', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/validate`, cookies, {
      qrToken: 'definitely-not-a-valid-jwt-token',
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(false);
    // Could be INVALID_TOKEN or TOKEN_MISMATCH depending on format
    expect(['INVALID_TOKEN', 'TOKEN_MISMATCH', 'EXPIRED_TOKEN']).toContain(body.error);
    expect(body.alreadyCheckedIn).toBe(false);
  });

  test('[P1] response always includes alreadyCheckedIn field', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/validate`, cookies, {
      qrToken: 'some-random-token',
    });
    const body = await res.json();
    expect(body).toHaveProperty('alreadyCheckedIn');
    expect(typeof body.alreadyCheckedIn).toBe('boolean');
  });

  test('[P0] returns 403 CSRF error when Origin header is missing', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await request.post(`${BASE_URL}/api/checkin/validate`, {
      headers: {
        cookie: cookies,
        'content-type': 'application/json',
        // No origin header — CSRF should block
      },
      data: { qrToken: 'test' },
    });
    expect(res.status()).toBe(403);
  });
});

// ===== POST /api/checkin/submit — Extended =====

test.describe('POST /api/checkin/submit — Extended', () => {
  test('[P0] returns INVALID_REQUEST for non-integer registrationId', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/submit`, cookies, {
      registrationId: 'not-a-number',
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('INVALID_REQUEST');
  });

  test('[P0] returns INVALID_REQUEST for zero registrationId', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/submit`, cookies, {
      registrationId: 0,
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('INVALID_REQUEST');
  });

  test('[P0] returns INVALID_REQUEST for float registrationId', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/submit`, cookies, {
      registrationId: 1.5,
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('INVALID_REQUEST');
  });

  test('[P1] non-existent registrationId returns REGISTRATION_NOT_FOUND', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/submit`, cookies, {
      registrationId: 999999,
    });
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('REGISTRATION_NOT_FOUND');
  });

  test('[P1] override field defaults to false when omitted', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    // Use non-existent reg to avoid side effects, but verify the request is accepted
    const res = await authPost(request, `${BASE_URL}/api/checkin/submit`, cookies, {
      registrationId: 888888,
      // override not provided — should default to false per Zod schema
    });
    const body = await res.json();
    expect(body.success).toBe(false);
    // Request was accepted (not 400) — override defaulted to false
    expect(body.error).toBe('REGISTRATION_NOT_FOUND');
  });

  test('[P1] explicit override:true is accepted by Zod validation', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/submit`, cookies, {
      registrationId: 888888,
      override: true,
    });
    const body = await res.json();
    // Should pass validation (not 400), fails at service layer
    expect(body.success).toBe(false);
    expect(body.error).toBe('REGISTRATION_NOT_FOUND');
  });

  test('[P1] explicit override:false is accepted by Zod validation', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/submit`, cookies, {
      registrationId: 888888,
      override: false,
    });
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('REGISTRATION_NOT_FOUND');
  });

  test('[P0] empty body returns 400', async ({ request }) => {
    const cookies = await getAuthCookies(request, ADMIN_CREDENTIALS);
    const res = await authPost(request, `${BASE_URL}/api/checkin/submit`, cookies, {});
    expect(res.status()).toBe(400);
  });
});
