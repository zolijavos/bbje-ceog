import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Partner email uniqueness validation tests
 *
 * When registering a paid_paired ticket, the partner email must be unique:
 * 1. Cannot be the same as the main guest's email
 * 2. Cannot already exist in the Guest table
 * 3. Cannot already exist in Registration.partner_email (other registrations)
 */

// Mock validation function extracted from registration submit logic
interface ValidationResult {
  valid: boolean;
  error?: string;
  field?: string;
  status?: number;
}

interface MockGuestLookup {
  findByEmail: (email: string) => { id: number; email: string } | null;
}

interface MockRegistrationLookup {
  findByPartnerEmail: (email: string) => { id: number; partner_email: string } | null;
}

// This mirrors the validation logic in app/api/registration/submit/route.ts
const validatePartnerEmail = async (
  partnerEmail: string,
  mainGuestEmail: string,
  guestLookup: MockGuestLookup,
  registrationLookup: MockRegistrationLookup
): Promise<ValidationResult> => {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(partnerEmail)) {
    return {
      valid: false,
      error: 'Invalid partner email format',
      status: 400,
    };
  }

  // Check: Partner email cannot be the same as main guest's email
  if (partnerEmail.toLowerCase() === mainGuestEmail.toLowerCase()) {
    return {
      valid: false,
      error: 'A partner email címe nem egyezhet meg a saját email címeddel',
      field: 'partner_email',
      status: 400,
    };
  }

  // Check: Partner email must be unique in Guest table
  const existingGuest = guestLookup.findByEmail(partnerEmail.toLowerCase());
  if (existingGuest) {
    return {
      valid: false,
      error: 'Ez az email cím már regisztrálva van a rendszerben. Kérjük, adj meg másik email címet a partnered számára.',
      field: 'partner_email',
      status: 409,
    };
  }

  // Check: Partner email must be unique in Registration.partner_email
  const existingRegistration = registrationLookup.findByPartnerEmail(partnerEmail.toLowerCase());
  if (existingRegistration) {
    return {
      valid: false,
      error: 'Ez az email cím már használatban van egy másik regisztrációnál. Kérjük, adj meg másik email címet a partnered számára.',
      field: 'partner_email',
      status: 409,
    };
  }

  return { valid: true };
};

describe('Partner Email Validation', () => {
  let mockGuestLookup: MockGuestLookup;
  let mockRegistrationLookup: MockRegistrationLookup;

  beforeEach(() => {
    // Reset mocks before each test
    mockGuestLookup = {
      findByEmail: vi.fn(() => null),
    };
    mockRegistrationLookup = {
      findByPartnerEmail: vi.fn(() => null),
    };
  });

  describe('Email format validation', () => {
    it('rejects invalid email format', async () => {
      const result = await validatePartnerEmail(
        'invalid-email',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid partner email format');
      expect(result.status).toBe(400);
    });

    it('accepts valid email format', async () => {
      const result = await validatePartnerEmail(
        'valid@example.com',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );
      expect(result.valid).toBe(true);
    });

    it('rejects email without @ symbol', async () => {
      const result = await validatePartnerEmail(
        'invalidemail.com',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );
      expect(result.valid).toBe(false);
    });
  });

  describe('Same as main guest email', () => {
    it('rejects partner email that matches main guest email', async () => {
      const result = await validatePartnerEmail(
        'same@test.com',
        'same@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBe('A partner email címe nem egyezhet meg a saját email címeddel');
      expect(result.field).toBe('partner_email');
      expect(result.status).toBe(400);
    });

    it('rejects partner email that matches main guest email (case insensitive)', async () => {
      const result = await validatePartnerEmail(
        'SAME@TEST.COM',
        'same@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );
      expect(result.valid).toBe(false);
    });

    it('accepts partner email different from main guest email', async () => {
      const result = await validatePartnerEmail(
        'partner@test.com',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('Email already exists in Guest table', () => {
    it('rejects partner email that exists in Guest table', async () => {
      mockGuestLookup.findByEmail = vi.fn(() => ({
        id: 123,
        email: 'existing@test.com',
      }));

      const result = await validatePartnerEmail(
        'existing@test.com',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('már regisztrálva van');
      expect(result.field).toBe('partner_email');
      expect(result.status).toBe(409);
    });

    it('accepts partner email not in Guest table', async () => {
      mockGuestLookup.findByEmail = vi.fn(() => null);

      const result = await validatePartnerEmail(
        'new@test.com',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('Email already used as partner in another Registration', () => {
    it('rejects partner email that exists in Registration.partner_email', async () => {
      mockRegistrationLookup.findByPartnerEmail = vi.fn(() => ({
        id: 456,
        partner_email: 'used-partner@test.com',
      }));

      const result = await validatePartnerEmail(
        'used-partner@test.com',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('már használatban van egy másik regisztrációnál');
      expect(result.field).toBe('partner_email');
      expect(result.status).toBe(409);
    });

    it('accepts partner email not in any Registration', async () => {
      mockRegistrationLookup.findByPartnerEmail = vi.fn(() => null);

      const result = await validatePartnerEmail(
        'new-partner@test.com',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('Combined validation scenarios', () => {
    it('checks main guest email before Guest table lookup', async () => {
      // Partner email is same as main guest - should fail before Guest lookup
      const guestLookupSpy = vi.fn(() => null);
      mockGuestLookup.findByEmail = guestLookupSpy;

      const result = await validatePartnerEmail(
        'main@test.com',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('nem egyezhet meg');
      // Guest lookup should not be called since email format check passes but same-email check fails
      expect(guestLookupSpy).not.toHaveBeenCalled();
    });

    it('checks Guest table before Registration lookup', async () => {
      // Email exists in Guest table - should fail before Registration lookup
      mockGuestLookup.findByEmail = vi.fn(() => ({
        id: 1,
        email: 'existing@test.com',
      }));
      const registrationLookupSpy = vi.fn(() => null);
      mockRegistrationLookup.findByPartnerEmail = registrationLookupSpy;

      const result = await validatePartnerEmail(
        'existing@test.com',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('már regisztrálva van');
      // Registration lookup should not be called
      expect(registrationLookupSpy).not.toHaveBeenCalled();
    });

    it('validates all rules in correct order when all pass', async () => {
      mockGuestLookup.findByEmail = vi.fn(() => null);
      mockRegistrationLookup.findByPartnerEmail = vi.fn(() => null);

      const result = await validatePartnerEmail(
        'valid-new@test.com',
        'main@test.com',
        mockGuestLookup,
        mockRegistrationLookup
      );

      expect(result.valid).toBe(true);
      expect(mockGuestLookup.findByEmail).toHaveBeenCalledWith('valid-new@test.com');
      expect(mockRegistrationLookup.findByPartnerEmail).toHaveBeenCalledWith('valid-new@test.com');
    });
  });
});
