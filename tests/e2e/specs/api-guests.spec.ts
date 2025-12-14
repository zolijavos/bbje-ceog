/**
 * CEO Gala - Guest API E2E Tests
 *
 * Tests for Guest API endpoints:
 * - GET /api/admin/guests - List guests with filtering
 * - POST /api/admin/guests - Create new guest
 * - GET /api/admin/guests/:id - Get single guest
 * - PATCH /api/admin/guests/:id - Update guest
 * - DELETE /api/admin/guests/:id - Delete guest
 *
 * Priority: P1 - High (API business logic validation)
 */
import { test, expect } from '../fixtures';
import {
  createGuest,
  createVIPGuest,
  createPayingSingleGuest,
  createApplicantGuest,
} from '../factories';

// Helper type for API responses
interface GuestListResponse {
  success: boolean;
  guests: Array<{
    id: number;
    email: string;
    name: string;
    guest_type: string;
    registration_status: string;
  }>;
  // Pagination fields are at root level, not nested
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  stats?: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  } | null;
}

interface GuestResponse {
  success: boolean;
  guest: {
    id: number;
    email: string;
    name: string;
    guest_type: string;
    registration_status: string;
    dietary_requirements?: string;
  };
  message?: string;
}

interface ErrorResponse {
  success: boolean;
  error: string;
}

test.describe('Guest List API', () => {
  test('[P1] GET /api/admin/guests - should return paginated guest list', async ({ apiRequest }) => {
    const { status, body } = await apiRequest({
      method: 'GET',
      url: '/api/admin/guests',
    });

    expect(status).toBe(200);
    const response = body as GuestListResponse;
    expect(response.success).toBe(true);
    expect(response).toHaveProperty('guests');
    expect(response).toHaveProperty('page');
    expect(response).toHaveProperty('limit');
    expect(response).toHaveProperty('total');
    expect(Array.isArray(response.guests)).toBe(true);
  });

  test('[P1] GET /api/admin/guests - should filter by type (VIP)', async ({ apiRequest, seedGuest, cleanup }) => {
    // GIVEN: VIP guest exists
    await seedGuest(createVIPGuest({ email: 'api-vip-filter@test.ceog' }));

    // WHEN: Filtering by VIP type
    const { status, body } = await apiRequest({
      method: 'GET',
      url: '/api/admin/guests?type=vip',
    });

    // THEN: Returns only VIP guests
    expect(status).toBe(200);
    const response = body as GuestListResponse;
    expect(response.success).toBe(true);
    expect(response.guests.every(g => g.guest_type === 'vip')).toBe(true);

    await cleanup();
  });

  test('[P1] GET /api/admin/guests - should filter by status (invited)', async ({ apiRequest, seedGuest, cleanup }) => {
    // GIVEN: Invited guest exists
    await seedGuest(createGuest({
      email: 'api-status-filter@test.ceog',
      registration_status: 'invited',
    }));

    // WHEN: Filtering by invited status
    const { status, body } = await apiRequest({
      method: 'GET',
      url: '/api/admin/guests?status=invited',
    });

    // THEN: Returns only invited guests
    expect(status).toBe(200);
    const response = body as GuestListResponse;
    expect(response.success).toBe(true);
    expect(response.guests.every(g => g.registration_status === 'invited')).toBe(true);

    await cleanup();
  });

  test('[P1] GET /api/admin/guests - should search by email or name', async ({ apiRequest, seedGuest, cleanup }) => {
    // GIVEN: Guest with unique name
    const guest = await seedGuest(createGuest({
      email: 'api-search-unique@test.ceog',
      name: 'UniqueSearchName',
    }));

    // WHEN: Searching by name
    const { status, body } = await apiRequest({
      method: 'GET',
      url: '/api/admin/guests?search=UniqueSearchName',
    });

    // THEN: Returns matching guest
    expect(status).toBe(200);
    const response = body as GuestListResponse;
    expect(response.success).toBe(true);
    expect(response.guests.some(g => g.email === guest.email)).toBe(true);

    await cleanup();
  });

  test('[P2] GET /api/admin/guests - should paginate results', async ({ apiRequest }) => {
    // WHEN: Requesting page 1 with limit 5
    const { status, body } = await apiRequest({
      method: 'GET',
      url: '/api/admin/guests?page=1&limit=5',
    });

    // THEN: Returns pagination info
    expect(status).toBe(200);
    const response = body as GuestListResponse;
    expect(response.success).toBe(true);
    expect(response.page).toBe(1);
    expect(response.limit).toBe(5);
  });

  test('[P2] GET /api/admin/guests - should include stats when requested', async ({ apiRequest }) => {
    // WHEN: Requesting with includeStats
    const { status, body } = await apiRequest({
      method: 'GET',
      url: '/api/admin/guests?includeStats=true',
    });

    // THEN: Returns stats
    expect(status).toBe(200);
    const response = body as GuestListResponse;
    expect(response.success).toBe(true);
    expect(response.stats).toBeDefined();
    expect(response.stats).toHaveProperty('total');
  });
});

test.describe('Guest Create API', () => {
  test('[P1] POST /api/admin/guests - should create new VIP guest', async ({ apiRequest, cleanup }) => {
    // GIVEN: Valid VIP guest data
    const guestData = createVIPGuest({ email: 'api-create-vip@test.ceog' });

    // WHEN: Creating guest via API
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/api/admin/guests',
      data: {
        email: guestData.email,
        name: guestData.name,
        guest_type: guestData.guest_type,
      },
    });

    // THEN: Returns 201 with created guest
    expect(status).toBe(201);
    const response = body as GuestResponse;
    expect(response.success).toBe(true);
    expect(response.guest.email).toBe(guestData.email);

    await cleanup();
  });

  test('[P1] POST /api/admin/guests - should create applicant guest', async ({ apiRequest, cleanup }) => {
    // GIVEN: Valid applicant guest data
    const guestData = createApplicantGuest({ email: 'api-create-applicant@test.ceog' });

    // WHEN: Creating applicant via API
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/api/admin/guests',
      data: {
        email: guestData.email,
        name: guestData.name,
        guest_type: 'applicant',
      },
    });

    // THEN: Returns 201 with created applicant
    expect(status).toBe(201);
    const response = body as GuestResponse;
    expect(response.success).toBe(true);
    expect(response.guest.guest_type).toBe('applicant');

    await cleanup();
  });

  test('[P1] POST /api/admin/guests - should reject invalid email', async ({ apiRequest }) => {
    // GIVEN: Invalid email format
    const invalidData = {
      email: 'not-an-email',
      name: 'Test Guest',
      guest_type: 'vip',
    };

    // WHEN: Creating guest with invalid email
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/api/admin/guests',
      data: invalidData,
    });

    // THEN: Returns 400 with validation error
    expect(status).toBe(400);
    const response = body as ErrorResponse;
    expect(response.success).toBe(false);
  });

  test('[P1] POST /api/admin/guests - should reject duplicate email', async ({ apiRequest, seedGuest, cleanup }) => {
    // GIVEN: Existing guest
    const existingGuest = await seedGuest(createGuest({ email: 'api-duplicate@test.ceog' }));

    // WHEN: Creating guest with same email
    const { status, body } = await apiRequest({
      method: 'POST',
      url: '/api/admin/guests',
      data: {
        email: existingGuest.email,
        name: 'Another Guest',
        guest_type: 'vip',
      },
    });

    // THEN: Returns 409 conflict
    expect(status).toBe(409);
    const response = body as ErrorResponse;
    expect(response.success).toBe(false);

    await cleanup();
  });

  test('[P2] POST /api/admin/guests - should require name field', async ({ apiRequest }) => {
    // GIVEN: Missing name
    const invalidData = {
      email: 'missing-name@test.ceog',
      guest_type: 'vip',
    };

    // WHEN: Creating guest without name
    const { status } = await apiRequest({
      method: 'POST',
      url: '/api/admin/guests',
      data: invalidData,
    });

    // THEN: Returns 400
    expect(status).toBe(400);
  });
});

test.describe('Guest Get Single API', () => {
  test('[P1] GET /api/admin/guests/:id - should return guest by ID', async ({ apiRequest, seedGuest, cleanup }) => {
    // GIVEN: Existing guest
    const guest = await seedGuest(createGuest({ email: 'api-get-single@test.ceog' }));

    // WHEN: Fetching by ID
    const { status, body } = await apiRequest({
      method: 'GET',
      url: `/api/admin/guests/${guest.id}`,
    });

    // THEN: Returns guest data
    expect(status).toBe(200);
    const response = body as GuestResponse;
    expect(response.success).toBe(true);
    expect(response.guest.email).toBe(guest.email);

    await cleanup();
  });

  test('[P1] GET /api/admin/guests/:id - should return 404 for non-existent ID', async ({ apiRequest }) => {
    // WHEN: Fetching non-existent guest
    const { status } = await apiRequest({
      method: 'GET',
      url: '/api/admin/guests/999999',
    });

    // THEN: Returns 404
    expect(status).toBe(404);
  });
});

test.describe('Guest Update API', () => {
  test('[P1] PATCH /api/admin/guests/:id - should update guest name', async ({ apiRequest, seedGuest, cleanup }) => {
    // GIVEN: Existing guest
    const guest = await seedGuest(createGuest({ email: 'api-update@test.ceog', name: 'Original Name' }));

    // WHEN: Updating name
    const { status, body } = await apiRequest({
      method: 'PATCH',
      url: `/api/admin/guests/${guest.id}`,
      data: { name: 'Updated Name' },
    });

    // THEN: Returns updated guest
    expect(status).toBe(200);
    const response = body as GuestResponse;
    expect(response.success).toBe(true);
    expect(response.guest.name).toBe('Updated Name');

    await cleanup();
  });

  test('[P1] PATCH /api/admin/guests/:id - should update registration_status to pending_approval', async ({ apiRequest, seedGuest, cleanup }) => {
    // GIVEN: Existing guest
    const guest = await seedGuest(createGuest({ email: 'api-status-update@test.ceog' }));

    // WHEN: Updating status to pending_approval
    const { status, body } = await apiRequest({
      method: 'PATCH',
      url: `/api/admin/guests/${guest.id}`,
      data: { registration_status: 'pending_approval' },
    });

    // THEN: Returns updated guest with new status
    expect(status).toBe(200);
    const response = body as GuestResponse;
    expect(response.success).toBe(true);
    expect(response.guest.registration_status).toBe('pending_approval');

    await cleanup();
  });

  test('[P1] PATCH /api/admin/guests/:id - should update dietary_requirements', async ({ apiRequest, seedGuest, cleanup }) => {
    // GIVEN: Existing guest
    const guest = await seedGuest(createGuest({ email: 'api-dietary-update@test.ceog' }));

    // WHEN: Updating dietary requirements
    const { status, body } = await apiRequest({
      method: 'PATCH',
      url: `/api/admin/guests/${guest.id}`,
      data: { dietary_requirements: 'Vegetarian, Gluten-free' },
    });

    // THEN: Returns updated guest
    expect(status).toBe(200);
    const response = body as GuestResponse;
    expect(response.success).toBe(true);
    expect(response.guest.dietary_requirements).toBe('Vegetarian, Gluten-free');

    await cleanup();
  });

  test('[P2] PATCH /api/admin/guests/:id - should return 404 for non-existent ID', async ({ apiRequest }) => {
    // WHEN: Updating non-existent guest
    const { status } = await apiRequest({
      method: 'PATCH',
      url: '/api/admin/guests/999999',
      data: { name: 'New Name' },
    });

    // THEN: Returns 404
    expect(status).toBe(404);
  });
});

test.describe('Guest Delete API', () => {
  test('[P1] DELETE /api/admin/guests/:id - should delete guest', async ({ apiRequest, seedGuest }) => {
    // GIVEN: Existing guest
    const guest = await seedGuest(createGuest({ email: 'api-delete@test.ceog' }));

    // WHEN: Deleting guest
    const { status } = await apiRequest({
      method: 'DELETE',
      url: `/api/admin/guests/${guest.id}`,
    });

    // THEN: Returns 200
    expect(status).toBe(200);

    // AND: Guest no longer exists
    const { status: getStatus } = await apiRequest({
      method: 'GET',
      url: `/api/admin/guests/${guest.id}`,
    });
    expect(getStatus).toBe(404);
  });

  test('[P2] DELETE /api/admin/guests/:id - should return 404 for non-existent ID', async ({ apiRequest }) => {
    // WHEN: Deleting non-existent guest
    const { status } = await apiRequest({
      method: 'DELETE',
      url: '/api/admin/guests/999999',
    });

    // THEN: Returns 404
    expect(status).toBe(404);
  });
});
