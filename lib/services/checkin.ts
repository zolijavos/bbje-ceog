/**
 * Check-in Service
 *
 * Handles QR code validation and check-in recording for event entry.
 * Story 3.1, 3.2, 3.3
 */

import { prisma } from '@/lib/db/prisma';
import { validateTicket, TicketPayload, verifyTicketToken } from './qr-ticket';
import { TicketType } from '@prisma/client';
import { getErrorMessage } from '@/lib/utils/errors';
import { logError, logInfo } from '@/lib/utils/logger';
import { broadcastToGuest, CheckinEvent } from './event-broadcaster';
import { getFullName } from '@/lib/utils/name';

/**
 * Check-in validation response
 */
export interface CheckinValidationResponse {
  valid: boolean;
  error?: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'REGISTRATION_NOT_FOUND' | 'TOKEN_MISMATCH' | 'CANCELLED';
  guest?: {
    id: number;
    firstName: string;
    lastName: string;
    ticketType: TicketType;
    partnerFirstName: string | null;
    partnerLastName: string | null;
  };
  registration?: {
    id: number;
  };
  alreadyCheckedIn: boolean;
  previousCheckin?: {
    checkedInAt: string;
    staffFirstName: string | null;
    staffLastName: string | null;
  };
}

/**
 * Check-in submission response
 */
export interface CheckinSubmitResponse {
  success: boolean;
  checkinId?: number;
  error?: string;
}

/**
 * Validate a QR code token for check-in
 *
 * @param qrToken - JWT token from QR code
 * @returns Validation response with guest details and check-in status
 */
export async function validateCheckinToken(qrToken: string): Promise<CheckinValidationResponse> {
  try {
    // First verify the JWT signature and expiry
    let payload: TicketPayload;
    try {
      payload = verifyTicketToken(qrToken);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TICKET_EXPIRED') {
          return { valid: false, error: 'EXPIRED_TOKEN', alreadyCheckedIn: false };
        }
        if (error.message === 'INVALID_TICKET') {
          return { valid: false, error: 'INVALID_TOKEN', alreadyCheckedIn: false };
        }
      }
      return { valid: false, error: 'INVALID_TOKEN', alreadyCheckedIn: false };
    }

    // Load registration with guest and check-in data
    const registration = await prisma.registration.findUnique({
      where: { id: payload.registration_id },
      select: {
        id: true,
        qr_code_hash: true,
        ticket_type: true,
        partner_first_name: true,
        partner_last_name: true,
        cancelled_at: true,
        guest: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        checkin: {
          include: {
            staff_user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!registration) {
      return { valid: false, error: 'REGISTRATION_NOT_FOUND', alreadyCheckedIn: false };
    }

    // Check if registration was cancelled
    if (registration.cancelled_at) {
      return { valid: false, error: 'CANCELLED', alreadyCheckedIn: false };
    }

    // Verify token matches stored token
    if (registration.qr_code_hash !== qrToken) {
      return { valid: false, error: 'TOKEN_MISMATCH', alreadyCheckedIn: false };
    }

    // Check if already checked in
    const alreadyCheckedIn = !!registration.checkin;

    return {
      valid: true,
      guest: {
        id: registration.guest!.id,
        firstName: registration.guest!.first_name,
        lastName: registration.guest!.last_name,
        ticketType: registration.ticket_type,
        partnerFirstName: registration.partner_first_name,
        partnerLastName: registration.partner_last_name,
      },
      registration: {
        id: registration.id,
      },
      alreadyCheckedIn,
      previousCheckin: alreadyCheckedIn && registration.checkin
        ? {
            checkedInAt: registration.checkin.checked_in_at.toISOString(),
            staffFirstName: registration.checkin.staff_user?.first_name || null,
            staffLastName: registration.checkin.staff_user?.last_name || null,
          }
        : undefined,
    };
  } catch (error) {
    logError('Check-in validation error:', error);
    return { valid: false, error: 'INVALID_TOKEN', alreadyCheckedIn: false };
  }
}

/**
 * Record a check-in event
 *
 * @param registrationId - Registration ID to check in
 * @param staffUserId - Optional staff user ID who performed the check-in
 * @param override - Whether this is an admin override for duplicate
 * @returns Check-in result
 */
export async function submitCheckin(
  registrationId: number,
  staffUserId?: number,
  override: boolean = false
): Promise<CheckinSubmitResponse> {
  try {
    // Load registration with check-in status
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        guest: true,
        checkin: true,
      },
      // Include cancelled_at for validation
    });

    // Note: cancelled_at is included via default select (not using select here)

    if (!registration) {
      return { success: false, error: 'REGISTRATION_NOT_FOUND' };
    }

    if (!registration.guest) {
      return { success: false, error: 'GUEST_NOT_FOUND' };
    }

    // Check if registration was cancelled
    if (registration.cancelled_at) {
      return { success: false, error: 'REGISTRATION_CANCELLED' };
    }

    // Check for existing check-in
    if (registration.checkin && !override) {
      return {
        success: false,
        error: 'ALREADY_CHECKED_IN',
      };
    }

    // If override, delete existing check-in first
    if (registration.checkin && override) {
      await prisma.checkin.delete({
        where: { id: registration.checkin.id },
      });
    }

    // Create check-in record and update guest status to checked_in
    const [checkin] = await prisma.$transaction([
      prisma.checkin.create({
        data: {
          registration_id: registrationId,
          guest_id: registration.guest.id,
          staff_user_id: staffUserId || null,
          is_override: override,
        },
      }),
      prisma.guest.update({
        where: { id: registration.guest.id },
        data: { registration_status: 'checked_in' },
      }),
    ]);

    // Fetch table assignment for the guest
    const tableAssignment = await prisma.tableAssignment.findUnique({
      where: { guest_id: registration.guest.id },
      include: {
        table: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    // Broadcast check-in event to guest's PWA
    const checkinEvent: CheckinEvent = {
      type: 'CHECKED_IN',
      guestId: registration.guest.id,
      guestName: getFullName(registration.guest.first_name, registration.guest.last_name),
      tableName: tableAssignment?.table.name || null,
      tableType: tableAssignment?.table.type || null,
      seatNumber: tableAssignment?.seat_number || null,
      checkedInAt: checkin.checked_in_at.toISOString(),
    };

    broadcastToGuest(registration.guest.id, checkinEvent);
    logInfo(`[CHECKIN] Broadcasted check-in event to guest ${registration.guest.id}`);

    return {
      success: true,
      checkinId: checkin.id,
    };
  } catch (error) {
    logError('Check-in submission error:', error);

    // Handle unique constraint violation (duplicate check-in)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: 'ALREADY_CHECKED_IN' };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Get check-in status for a registration
 *
 * @param registrationId - Registration ID
 * @returns Check-in record or null
 */
export async function getCheckinStatus(registrationId: number) {
  return prisma.checkin.findUnique({
    where: { registration_id: registrationId },
    include: {
      staff_user: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      guest: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get check-in log with filters
 *
 * @param params - Filter and pagination parameters
 * @returns Paginated check-in log
 */
export async function getCheckinLog(params: {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const { page = 1, limit = 50, search, dateFrom, dateTo } = params;

  const where: Parameters<typeof prisma.checkin.findMany>[0]['where'] = {};

  // Date range filter
  if (dateFrom || dateTo) {
    where.checked_in_at = {};
    if (dateFrom) {
      where.checked_in_at.gte = dateFrom;
    }
    if (dateTo) {
      where.checked_in_at.lte = dateTo;
    }
  }

  // Search filter (guest name or email)
  if (search) {
    where.guest = {
      OR: [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { email: { contains: search } },
      ],
    };
  }

  const [checkins, total] = await Promise.all([
    prisma.checkin.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { checked_in_at: 'desc' },
      include: {
        guest: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            guest_type: true,
          },
        },
        registration: {
          select: {
            ticket_type: true,
            partner_first_name: true,
            partner_last_name: true,
          },
        },
        staff_user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    }),
    prisma.checkin.count({ where }),
  ]);

  return {
    checkins,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get check-in statistics
 */
export async function getCheckinStats() {
  const [total, byTicketType, recentCheckins, totalRegistrations] = await Promise.all([
    prisma.checkin.count(),
    // Get check-ins grouped by ticket type via registration join
    prisma.registration.groupBy({
      by: ['ticket_type'],
      where: {
        checkin: { isNot: null },
      },
      _count: true,
    }),
    prisma.checkin.findMany({
      take: 10,
      orderBy: { checked_in_at: 'desc' },
      include: {
        guest: {
          select: { first_name: true, last_name: true },
        },
        registration: {
          select: { ticket_type: true },
        },
      },
    }),
    prisma.registration.count(),
  ]);

  // Convert ticket type stats to object
  const ticketTypeStats = {
    vip_free: 0,
    paid_single: 0,
    paid_paired: 0,
  };
  byTicketType.forEach((item) => {
    ticketTypeStats[item.ticket_type] = item._count;
  });

  return {
    totalCheckins: total,
    totalRegistrations,
    checkinRate: totalRegistrations > 0 ? (total / totalRegistrations) * 100 : 0,
    byTicketType: ticketTypeStats,
    recentCheckins: recentCheckins.map(c => ({
      guestName: getFullName(c.guest.first_name, c.guest.last_name),
      ticketType: c.registration?.ticket_type || 'unknown',
      checkedInAt: c.checked_in_at.toISOString(),
    })),
  };
}
