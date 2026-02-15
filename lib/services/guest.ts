/**
 * Guest Service
 *
 * Handles guest list operations including filtering, pagination, and CRUD.
 */

import { prisma } from '@/lib/db/prisma';
import { GuestType, RegistrationStatus, Prisma } from '@prisma/client';

/**
 * Valid sort columns for guest list
 */
export type GuestSortBy = 'name' | 'status' | 'type' | 'payment' | 'created_at' | 'updated_at' | 'last_magic_link';

/**
 * Magic link filter categories
 */
export type MagicLinkFilter = 'all' | 'ready' | 'recent' | 'never' | 'sendable';

/**
 * Magic link time category
 */
export type MagicLinkCategory = 'ready' | 'warning' | 'recent' | 'never';

/**
 * Guest list query parameters
 */
export interface GuestListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: GuestType | 'all';
  status?: RegistrationStatus | 'all';
  // Array filters for bulk operations
  guestTypes?: GuestType[];
  registrationStatuses?: RegistrationStatus[];
  isVipReception?: boolean;
  hasTicket?: boolean;
  hasTable?: boolean;
  // Special filter: guests who are approved but not checked in
  notCheckedIn?: boolean;
  // Sorting
  sortBy?: GuestSortBy;
  sortOrder?: 'asc' | 'desc';
  // Magic link filter for bulk email
  magicLinkFilter?: MagicLinkFilter;
}

/**
 * Guest with relations for list display
 */
export interface GuestListItem {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  title?: string | null;
  guest_type: GuestType;
  registration_status: RegistrationStatus;
  is_vip_reception: boolean;
  created_at: Date;
  updated_at: Date;
  table_assignment: {
    table: {
      name: string;
    };
    seat_number: number | null;
  } | null;
  registration: {
    id: number;
    ticket_type: string;
  } | null;
  // Magic link email tracking
  lastMagicLinkAt: Date | null;
  magicLinkCount: number;
  magicLinkCategory: MagicLinkCategory;
}

/**
 * Guest list response
 */
export interface GuestListResponse {
  guests: GuestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get paginated and filtered guest list
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated guest list with total count
 */
export async function getGuestList(
  params: GuestListParams = {}
): Promise<GuestListResponse> {
  const {
    page = 1,
    limit = 25,
    search = '',
    type = 'all',
    status = 'all',
    guestTypes,
    registrationStatuses,
    isVipReception,
    hasTicket,
    hasTable,
    notCheckedIn,
    sortBy = 'created_at',
    sortOrder = 'desc',
    magicLinkFilter,
  } = params;

  // Time boundaries for magic link categories
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Build where clause
  const where: Prisma.GuestWhereInput = {};

  // Search filter (first_name, last_name, or email)
  if (search) {
    where.OR = [
      { first_name: { contains: search } },
      { last_name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  // Special filter: not checked in (approved status but no checkin record)
  if (notCheckedIn) {
    where.registration_status = 'approved';
    where.checkin = null;
  } else {
    // Array guest type filter (takes precedence)
    if (guestTypes && guestTypes.length > 0) {
      where.guest_type = { in: guestTypes };
    } else if (type !== 'all') {
      where.guest_type = type;
    }

    // Array registration status filter (takes precedence)
    if (registrationStatuses && registrationStatuses.length > 0) {
      where.registration_status = { in: registrationStatuses };
    } else if (status !== 'all') {
      where.registration_status = status;
    }
  }

  // VIP reception filter
  if (isVipReception !== undefined) {
    where.is_vip_reception = isVipReception;
  }

  // Has ticket filter (registration exists with ticket)
  if (hasTicket === true) {
    where.registration = { isNot: null };
  } else if (hasTicket === false) {
    where.registration = null;
  }

  // Has table filter (table assignment exists)
  if (hasTable === true) {
    where.table_assignment = { isNot: null };
  } else if (hasTable === false) {
    where.table_assignment = null;
  }

  // Magic link filter (for bulk email feature)
  if (magicLinkFilter && magicLinkFilter !== 'all') {
    switch (magicLinkFilter) {
      case 'ready':
        // 48+ hours since last magic link
        where.OR = [
          { magic_link_expires_at: null },
          { magic_link_expires_at: { lt: fortyEightHoursAgo } },
        ];
        break;
      case 'recent':
        // Within last 48 hours
        where.magic_link_expires_at = { gte: fortyEightHoursAgo };
        break;
      case 'never':
        // Never sent
        where.magic_link_expires_at = null;
        break;
      case 'sendable':
        // Ready to send: either 48h+ ago OR never sent
        where.OR = [
          { magic_link_expires_at: null },
          { magic_link_expires_at: { lt: fortyEightHoursAgo } },
        ];
        break;
    }
  }

  // Build orderBy clause based on sortBy parameter
  let orderBy: Prisma.GuestOrderByWithRelationInput | Prisma.GuestOrderByWithRelationInput[] = { created_at: 'desc' };

  switch (sortBy) {
    case 'name':
      orderBy = [
        { first_name: sortOrder },
        { last_name: sortOrder },
      ];
      break;
    case 'status':
      orderBy = { registration_status: sortOrder };
      break;
    case 'type':
      orderBy = { guest_type: sortOrder };
      break;
    case 'created_at':
      orderBy = { created_at: sortOrder };
      break;
    case 'updated_at':
      orderBy = { updated_at: sortOrder };
      break;
    case 'last_magic_link':
      orderBy = { magic_link_expires_at: sortOrder };
      break;
    // 'payment' sorting handled after fetch (computed field)
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [guests, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        table_assignment: {
          include: {
            table: {
              select: { name: true },
            },
          },
        },
        registration: {
          select: {
            id: true,
            ticket_type: true,
            payment: true,
          },
        },
        // Include magic link email count
        email_logs: {
          where: {
            email_type: 'magic_link',
            status: 'sent',
          },
          select: {
            sent_at: true,
          },
          orderBy: {
            sent_at: 'desc',
          },
        },
      },
    }),
    prisma.guest.count({ where }),
  ]);

  // Helper to determine magic link category
  const getMagicLinkCategory = (lastSentAt: Date | null): MagicLinkCategory => {
    if (!lastSentAt) return 'never';
    if (lastSentAt < fortyEightHoursAgo) return 'ready';
    if (lastSentAt < twentyFourHoursAgo) return 'warning';
    return 'recent';
  };

  // Transform guests to add magic link data
  const guestsWithMagicLink: GuestListItem[] = guests.map((guest) => {
    const lastMagicLinkAt = guest.email_logs.length > 0 ? guest.email_logs[0].sent_at : null;
    const magicLinkCount = guest.email_logs.length;
    const magicLinkCategory = getMagicLinkCategory(lastMagicLinkAt);

    // Remove email_logs from the response (we've extracted what we need)
    const { email_logs, ...guestWithoutLogs } = guest;

    return {
      ...guestWithoutLogs,
      lastMagicLinkAt,
      magicLinkCount,
      magicLinkCategory,
    } as GuestListItem;
  });

  return {
    guests: guestsWithMagicLink,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single guest by ID
 *
 * @param id - Guest ID
 * @returns Guest with relations or null
 */
export async function getGuestById(id: number) {
  return prisma.guest.findUnique({
    where: { id },
    include: {
      registration: true,
      table_assignment: {
        include: {
          table: true,
        },
      },
      email_logs: {
        orderBy: { sent_at: 'desc' },
        take: 10,
      },
    },
  });
}

/**
 * Guest statistics for dashboard
 */
export interface GuestStats {
  total: number;
  byType: {
    vip: number;
    paying_single: number;
    paying_paired: number;
  };
  byStatus: {
    invited: number;
    registered: number;
    approved: number;
    declined: number;
  };
}

/**
 * Create guest input
 */
export interface CreateGuestInput {
  email: string;
  first_name: string;
  last_name: string;
  guest_type: GuestType;
  title?: string | null;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  dietary_requirements?: string | null;
  seating_preferences?: string | null;
}

/**
 * Update guest input
 */
export interface UpdateGuestInput {
  first_name?: string;
  last_name?: string;
  title?: string | null;
  company?: string | null;
  position?: string | null;
  guest_type?: GuestType;
  registration_status?: RegistrationStatus;
  dietary_requirements?: string | null;
  seating_preferences?: string | null;
  is_vip_reception?: boolean;
}

/**
 * Create a new guest
 *
 * @param data - Guest data
 * @returns Created guest
 */
export async function createGuest(data: CreateGuestInput) {
  // Check if email already exists
  const existingGuest = await prisma.guest.findUnique({
    where: { email: data.email },
  });

  if (existingGuest) {
    throw new Error('EMAIL_EXISTS');
  }

  return prisma.guest.create({
    data: {
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      guest_type: data.guest_type,
      registration_status: 'pending',
      title: data.title || null,
      phone: data.phone || null,
      company: data.company || null,
      position: data.position || null,
      dietary_requirements: data.dietary_requirements || null,
      seating_preferences: data.seating_preferences || null,
    },
  });
}

/**
 * Update an existing guest
 *
 * @param id - Guest ID
 * @param data - Updated guest data
 * @returns Updated guest
 */
export async function updateGuest(id: number, data: UpdateGuestInput) {
  // Check if guest exists
  const existingGuest = await prisma.guest.findUnique({
    where: { id },
  });

  if (!existingGuest) {
    throw new Error('GUEST_NOT_FOUND');
  }

  return prisma.guest.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
}

/**
 * Delete a guest and all related records
 *
 * @param id - Guest ID
 * @returns Deleted guest
 */
export async function deleteGuest(id: number) {
  // Check if guest exists
  const existingGuest = await prisma.guest.findUnique({
    where: { id },
  });

  if (!existingGuest) {
    throw new Error('GUEST_NOT_FOUND');
  }

  // Delete in transaction - cascade manually for safety
  return prisma.$transaction(async (tx) => {
    // Delete related records in order (due to foreign key constraints)
    await tx.emailLog.deleteMany({ where: { guest_id: id } });
    await tx.checkin.deleteMany({ where: { guest_id: id } });
    await tx.tableAssignment.deleteMany({ where: { guest_id: id } });

    // Delete registration if exists
    await tx.registration.deleteMany({ where: { guest_id: id } });

    // Finally delete the guest
    return tx.guest.delete({ where: { id } });
  });
}

/**
 * Get guest statistics
 *
 * @returns Guest count statistics
 */
export async function getGuestStats(): Promise<GuestStats> {
  const [total, byType, byStatus] = await Promise.all([
    prisma.guest.count(),
    prisma.guest.groupBy({
      by: ['guest_type'],
      _count: true,
    }),
    prisma.guest.groupBy({
      by: ['registration_status'],
      _count: true,
    }),
  ]);

  // Convert to stats object
  const typeStats = {
    vip: 0,
    paying_single: 0,
    paying_paired: 0,
  };
  byType.forEach((item) => {
    typeStats[item.guest_type] = item._count;
  });

  const statusStats = {
    invited: 0,
    registered: 0,
    approved: 0,
    declined: 0,
  };
  byStatus.forEach((item) => {
    statusStats[item.registration_status] = item._count;
  });

  return {
    total,
    byType: typeStats,
    byStatus: statusStats,
  };
}
