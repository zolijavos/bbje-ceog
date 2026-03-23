/**
 * Partner Lifecycle Service
 *
 * Handles partner removal and replacement for invited guests.
 * Uses cascade operations within Prisma transactions.
 */

import { prisma } from '@/lib/db/prisma';
import { createAuditLog } from '@/lib/services/audit';
import { assignGuestToTable } from '@/lib/services/seating';
import { generateUniquePWAAuthCode } from '@/lib/services/registration';
import { generateAndSendTicket } from '@/lib/services/email';
import { getFullName } from '@/lib/utils/name';
import { logInfo, logError } from '@/lib/utils/logger';

export interface PartnerData {
  first_name: string;
  last_name: string;
  email: string;
  title?: string;
  phone?: string;
  company?: string;
  position?: string;
  dietary_requirements?: string;
}

export interface PartnerActionResult {
  success: boolean;
  removedPartner?: { id: number; name: string; email: string };
  newPartner?: { id: number; name: string; email: string };
  tableAssignment?: { tableName: string };
  error?: string;
  code?: string;
}

/**
 * Validate that a partner action can be performed on the given guest.
 * Returns the main guest + partner data, or throws with a specific error code.
 */
export async function validatePartnerAction(mainGuestId: number) {
  const mainGuest = await prisma.guest.findUnique({
    where: { id: mainGuestId },
    include: {
      partner_of: {
        include: {
          checkin: true,
          table_assignment: true,
          registration: true,
        },
      },
      registration: true,
    },
  });

  if (!mainGuest) {
    throw Object.assign(new Error('Guest not found'), { code: 'GUEST_NOT_FOUND' });
  }

  const partner = mainGuest.partner_of;
  if (!partner) {
    throw Object.assign(new Error('Guest has no partner'), { code: 'NO_PARTNER' });
  }

  if (partner.checkin) {
    throw Object.assign(new Error('Partner already checked in'), { code: 'PARTNER_CHECKED_IN' });
  }

  return { mainGuest, partner };
}

/**
 * Remove partner with cascade deletion.
 *
 * Deletion order (critical):
 * 1. Partner TableAssignment (if exists)
 * 2. Partner Checkin check → BLOCK if exists
 * 3. Partner Registration
 * 4. Partner EmailLog records
 * 5. Main guest Registration.partner_* fields → null
 * 6. Partner Guest record
 * 7. Update table status
 */
export async function removePartner(mainGuestId: number): Promise<PartnerActionResult> {
  const { mainGuest, partner } = await validatePartnerAction(mainGuestId);

  const partnerName = getFullName(partner.first_name, partner.last_name);
  const partnerEmail = partner.email;
  const partnerId = partner.id;
  const tableId = partner.table_assignment?.table_id;

  await prisma.$transaction(async (tx) => {
    // 1. Remove partner's table assignment
    if (partner.table_assignment) {
      await tx.tableAssignment.delete({
        where: { id: partner.table_assignment.id },
      });
    }

    // 2. Remove partner's registration
    if (partner.registration) {
      await tx.registration.delete({
        where: { id: partner.registration.id },
      });
    }

    // 3. Remove partner's email logs
    await tx.emailLog.deleteMany({
      where: { guest_id: partnerId },
    });

    // 4. Null out main guest's Registration.partner_* fields
    if (mainGuest.registration) {
      await tx.registration.update({
        where: { id: mainGuest.registration.id },
        data: {
          partner_first_name: null,
          partner_last_name: null,
          partner_email: null,
          partner_title: null,
        },
      });
    }

    // 5. Delete partner Guest record
    await tx.guest.delete({
      where: { id: partnerId },
    });
  });

  // Update table status if partner was assigned
  if (tableId) {
    try {
      const table = await prisma.table.findUnique({
        where: { id: tableId },
        include: { _count: { select: { assignments: true } } },
      });
      if (table && table.status !== 'reserved') {
        const newStatus = table._count.assignments >= table.capacity ? 'full' : 'available';
        await prisma.table.update({
          where: { id: tableId },
          data: { status: newStatus as 'available' | 'full' },
        });
      }
    } catch {
      // Non-critical — table status update failure should not break the operation
    }
  }

  // Audit log (non-throwing)
  await createAuditLog({
    action: 'PARTNER_REMOVE',
    entityType: 'guest',
    entityId: mainGuestId,
    entityName: getFullName(mainGuest.first_name, mainGuest.last_name),
    oldValues: {
      partner_id: partnerId,
      partner_name: partnerName,
      partner_email: partnerEmail,
    },
  });

  logInfo(`[PARTNER] Removed partner ${partnerName} (${partnerEmail}) from guest #${mainGuestId}`);

  return {
    success: true,
    removedPartner: { id: partnerId, name: partnerName, email: partnerEmail },
  };
}

/**
 * Replace partner: remove old partner + create new one.
 *
 * Steps:
 * 1. removePartner() for old partner
 * 2. Create new Guest record (with PWA auth code)
 * 3. Create new Registration
 * 4. Update main guest Registration.partner_* fields
 * 5. Auto-assign to main guest's table (if capacity)
 * 6. Generate and send QR ticket (async)
 */
export async function replacePartner(
  mainGuestId: number,
  newPartnerData: PartnerData
): Promise<PartnerActionResult> {
  // Validate new partner email constraints
  const mainGuest = await prisma.guest.findUnique({
    where: { id: mainGuestId },
    include: {
      table_assignment: {
        include: { table: { select: { id: true, name: true } } },
      },
    },
  });

  if (!mainGuest) {
    throw Object.assign(new Error('Guest not found'), { code: 'GUEST_NOT_FOUND' });
  }

  // Self-pairing check
  if (newPartnerData.email.toLowerCase() === mainGuest.email.toLowerCase()) {
    throw Object.assign(new Error('Cannot pair with self'), { code: 'SELF_PAIRING' });
  }

  // Check if email is already another guest's partner
  const existingGuest = await prisma.guest.findUnique({
    where: { email: newPartnerData.email.toLowerCase() },
    include: { paired_with: true },
  });

  if (existingGuest) {
    if (existingGuest.paired_with_id) {
      // Already a partner of someone else
      const mainOfExisting = await prisma.guest.findUnique({
        where: { id: existingGuest.paired_with_id },
      });
      const mainName = mainOfExisting
        ? getFullName(mainOfExisting.first_name, mainOfExisting.last_name)
        : 'unknown';
      throw Object.assign(new Error(`Already partner of ${mainName}`), { code: 'ALREADY_PARTNER', partnerOf: mainName });
    }
    // Guest exists but is not a partner — they're an independent guest, block
    throw Object.assign(new Error('Email already registered as independent guest'), { code: 'EMAIL_EXISTS' });
  }

  // Step 1: Remove old partner
  const removeResult = await removePartner(mainGuestId);

  // Step 2-4: Create new partner in transaction
  // Generate unique PWA auth code before transaction (with retry loop)
  const pwaAuthCode = await generateUniquePWAAuthCode();

  const newPartner = await prisma.$transaction(async (tx) => {
    // Create new partner Guest
    const partner = await tx.guest.create({
      data: {
        email: newPartnerData.email.toLowerCase().trim(),
        first_name: newPartnerData.first_name.trim(),
        last_name: newPartnerData.last_name.trim(),
        guest_type: mainGuest.guest_type,
        registration_status: 'registered',
        paired_with_id: mainGuestId,
        pwa_auth_code: pwaAuthCode,
        title: newPartnerData.title || null,
        phone: newPartnerData.phone || null,
        company: newPartnerData.company || null,
        position: newPartnerData.position || null,
        dietary_requirements: newPartnerData.dietary_requirements || null,
      },
    });

    // Create Registration for new partner
    await tx.registration.create({
      data: {
        guest_id: partner.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        partner_first_name: null,
        partner_last_name: null,
        partner_email: null,
      },
    });

    // Update main guest's Registration partner fields
    const mainReg = await tx.registration.findUnique({
      where: { guest_id: mainGuestId },
    });

    if (mainReg) {
      await tx.registration.update({
        where: { id: mainReg.id },
        data: {
          partner_first_name: newPartnerData.first_name.trim(),
          partner_last_name: newPartnerData.last_name.trim(),
          partner_email: newPartnerData.email.toLowerCase().trim(),
          partner_title: newPartnerData.title || null,
        },
      });
    }

    return partner;
  });

  const newPartnerName = getFullName(newPartner.first_name, newPartner.last_name);
  let tableAssignment: { tableName: string } | undefined;

  // Step 5: Auto-assign to main guest's table (if exists and has capacity)
  if (mainGuest.table_assignment) {
    try {
      await assignGuestToTable(newPartner.id, mainGuest.table_assignment.table.id);
      tableAssignment = { tableName: mainGuest.table_assignment.table.name };
    } catch (err) {
      // Non-blocking — table might be full
      logInfo(`[PARTNER] Could not auto-assign new partner to table: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  // Step 6: Generate and send QR ticket (async, non-blocking)
  const partnerReg = await prisma.registration.findUnique({
    where: { guest_id: newPartner.id },
  });

  if (partnerReg) {
    generateAndSendTicket(partnerReg.id).catch((err) => {
      logError('[PARTNER] Failed to send ticket to new partner:', err);
    });
  }

  // Audit log
  await createAuditLog({
    action: 'PARTNER_CHANGE',
    entityType: 'guest',
    entityId: mainGuestId,
    entityName: getFullName(mainGuest.first_name, mainGuest.last_name),
    oldValues: removeResult.removedPartner
      ? {
          partner_id: removeResult.removedPartner.id,
          partner_name: removeResult.removedPartner.name,
          partner_email: removeResult.removedPartner.email,
        }
      : undefined,
    newValues: {
      partner_id: newPartner.id,
      partner_name: newPartnerName,
      partner_email: newPartner.email,
    },
  });

  logInfo(`[PARTNER] Replaced partner for guest #${mainGuestId}: new partner ${newPartnerName} (${newPartner.email})`);

  return {
    success: true,
    removedPartner: removeResult.removedPartner,
    newPartner: { id: newPartner.id, name: newPartnerName, email: newPartner.email },
    tableAssignment,
  };
}
