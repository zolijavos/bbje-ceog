/**
 * CEO Gala - Test Data Factories
 *
 * Factory functions with sensible defaults and explicit overrides.
 * All test data uses @test.ceog domain for easy cleanup.
 */
import { GuestType, RegistrationStatus, TicketType, PaymentMethod, TableStatus, UserRole } from '@prisma/client';
import crypto from 'crypto';

// Unique ID generator for parallel-safe test data
const uniqueId = () => crypto.randomBytes(4).toString('hex');
const timestamp = () => Date.now();

// ============================================
// GUEST FACTORIES
// ============================================

type GuestFactoryInput = {
  email?: string;
  name?: string;
  guest_type?: GuestType;
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

export function createGuest(overrides: GuestFactoryInput = {}) {
  const id = uniqueId();
  return {
    email: overrides.email ?? `guest-${id}@test.ceog`,
    name: overrides.name ?? `Test Guest ${id}`,
    guest_type: overrides.guest_type ?? 'vip' as GuestType,
    registration_status: overrides.registration_status ?? 'invited' as RegistrationStatus,
    title: overrides.title,
    phone: overrides.phone ?? `+36201234${id.slice(0, 4)}`,
    company: overrides.company ?? `Test Company ${id}`,
    position: overrides.position ?? 'Test Position',
    dietary_requirements: overrides.dietary_requirements,
    seating_preferences: overrides.seating_preferences,
    magic_link_hash: overrides.magic_link_hash,
    magic_link_expires_at: overrides.magic_link_expires_at,
    pwa_auth_code: overrides.pwa_auth_code,
  };
}

export function createVIPGuest(overrides: GuestFactoryInput = {}) {
  return createGuest({
    guest_type: 'vip',
    title: 'Dr.',
    ...overrides,
  });
}

export function createPayingSingleGuest(overrides: GuestFactoryInput = {}) {
  return createGuest({
    guest_type: 'paying_single',
    ...overrides,
  });
}

export function createPayingPairedGuest(overrides: GuestFactoryInput = {}) {
  return createGuest({
    guest_type: 'paying_paired',
    ...overrides,
  });
}

export function createApplicantGuest(overrides: GuestFactoryInput = {}) {
  const id = uniqueId();
  return createGuest({
    guest_type: 'applicant',
    registration_status: 'pending_approval',
    email: `applicant-${id}@test.ceog`,
    name: `Applicant ${id}`,
    ...overrides,
  });
}

export function createGuestWithMagicLink(overrides: GuestFactoryInput = {}) {
  const id = uniqueId();
  const hash = crypto.createHash('sha256').update(`${id}-${timestamp()}`).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  return createGuest({
    magic_link_hash: hash,
    magic_link_expires_at: expiresAt,
    ...overrides,
  });
}

export function createGuestWithPWACode(overrides: GuestFactoryInput = {}) {
  const id = uniqueId();
  const code = `CEOG-${id.toUpperCase().slice(0, 6)}`;

  return createGuest({
    pwa_auth_code: code,
    registration_status: 'registered',
    ...overrides,
  });
}

// ============================================
// TABLE FACTORIES
// ============================================

type TableFactoryInput = {
  name?: string;
  capacity?: number;
  type?: string;
  pos_x?: number;
  pos_y?: number;
  status?: TableStatus;
};

export function createTable(overrides: TableFactoryInput = {}) {
  const id = uniqueId();
  return {
    name: overrides.name ?? `TEST-Table-${id}`,
    capacity: overrides.capacity ?? 8,
    type: overrides.type ?? 'standard',
    pos_x: overrides.pos_x ?? Math.random() * 500,
    pos_y: overrides.pos_y ?? Math.random() * 500,
    status: overrides.status ?? 'available' as TableStatus,
  };
}

export function createVIPTable(overrides: TableFactoryInput = {}) {
  return createTable({
    type: 'vip',
    capacity: 10,
    ...overrides,
  });
}

export function createReservedTable(overrides: TableFactoryInput = {}) {
  return createTable({
    status: 'reserved',
    ...overrides,
  });
}

// ============================================
// REGISTRATION FACTORIES
// ============================================

type RegistrationFactoryInput = {
  guest_id: number;
  ticket_type?: TicketType;
  payment_method?: PaymentMethod;
  partner_name?: string;
  partner_email?: string;
  gdpr_consent?: boolean;
  cancellation_accepted?: boolean;
  qr_code_hash?: string;
};

export function createRegistration(overrides: RegistrationFactoryInput) {
  return {
    guest_id: overrides.guest_id,
    ticket_type: overrides.ticket_type ?? 'vip_free' as TicketType,
    payment_method: overrides.payment_method,
    partner_name: overrides.partner_name,
    partner_email: overrides.partner_email,
    gdpr_consent: overrides.gdpr_consent ?? true,
    cancellation_accepted: overrides.cancellation_accepted ?? true,
    qr_code_hash: overrides.qr_code_hash,
  };
}

export function createVIPRegistration(guestId: number, overrides: Partial<RegistrationFactoryInput> = {}) {
  return createRegistration({
    guest_id: guestId,
    ticket_type: 'vip_free',
    ...overrides,
  });
}

export function createPaidSingleRegistration(guestId: number, overrides: Partial<RegistrationFactoryInput> = {}) {
  return createRegistration({
    guest_id: guestId,
    ticket_type: 'paid_single',
    payment_method: 'card',
    ...overrides,
  });
}

export function createPaidPairedRegistration(guestId: number, overrides: Partial<RegistrationFactoryInput> = {}) {
  const id = uniqueId();
  return createRegistration({
    guest_id: guestId,
    ticket_type: 'paid_paired',
    payment_method: 'card',
    partner_name: `Partner ${id}`,
    partner_email: `partner-${id}@test.ceog`,
    ...overrides,
  });
}

// ============================================
// BILLING INFO FACTORIES
// ============================================

type BillingInfoFactoryInput = {
  registration_id: number;
  billing_name?: string;
  company_name?: string;
  tax_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
};

export function createBillingInfo(overrides: BillingInfoFactoryInput) {
  const id = uniqueId();
  return {
    registration_id: overrides.registration_id,
    billing_name: overrides.billing_name ?? `Billing Name ${id}`,
    company_name: overrides.company_name ?? `Test Company Kft.`,
    tax_number: overrides.tax_number ?? `12345678-1-${id.slice(0, 2)}`,
    address_line1: overrides.address_line1 ?? `Test Street ${id}`,
    address_line2: overrides.address_line2,
    city: overrides.city ?? 'Budapest',
    postal_code: overrides.postal_code ?? '1111',
    country: overrides.country ?? 'HU',
  };
}

// ============================================
// CSV DATA FACTORIES
// ============================================

export function createGuestCSVRow(overrides: Partial<GuestFactoryInput> = {}) {
  const guest = createGuest(overrides);
  return `${guest.email},${guest.name},${guest.guest_type}`;
}

export function createGuestCSV(count: number, guestType: GuestType = 'vip') {
  const header = 'email,name,guest_type';
  const rows = Array.from({ length: count }, () =>
    createGuestCSVRow({ guest_type: guestType })
  );
  return [header, ...rows].join('\n');
}

export function createSeatingCSV(assignments: Array<{ tableName: string; guestEmail: string; seatNumber?: number }>) {
  const header = 'table_name,guest_email,seat_number';
  const rows = assignments.map(a =>
    `${a.tableName},${a.guestEmail},${a.seatNumber ?? ''}`
  );
  return [header, ...rows].join('\n');
}

// ============================================
// MAGIC LINK HELPERS
// ============================================

export function generateMagicLinkHash(email: string, secret: string = 'test-secret'): string {
  const timestamp = Date.now().toString();
  return crypto.createHash('sha256').update(`${email}${secret}${timestamp}`).digest('hex');
}

export function generateValidMagicLinkUrl(email: string, hash: string, baseUrl: string = ''): string {
  return `${baseUrl}/register?email=${encodeURIComponent(email)}&code=${hash}`;
}

// ============================================
// QR CODE / JWT HELPERS
// ============================================

export function generateTestJWTPayload(registrationId: number, guestId: number, ticketType: TicketType) {
  return {
    registration_id: registrationId,
    guest_id: guestId,
    ticket_type: ticketType,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 48 * 60 * 60, // 48 hours
  };
}
