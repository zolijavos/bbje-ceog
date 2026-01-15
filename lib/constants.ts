/**
 * Application Constants
 *
 * Centralized constants for guest types, statuses, labels, and UI display.
 */

import { GuestType, RegistrationStatus, PaymentStatus } from '@prisma/client';

// ========================================
// GUEST TYPE LABELS
// ========================================

export const GUEST_TYPE_LABELS: Record<GuestType, string> = {
  vip: 'VIP (Free)',
  invited: 'Invited (Free)',
  paying_single: 'Paying (Single)',
  paying_paired: 'Paying (Paired)',
  applicant: 'Applicant',
} as const;

// ========================================
// REGISTRATION STATUS INFO
// ========================================

export interface StatusInfo {
  label: string;
  color: string;
}

export const REGISTRATION_STATUS_INFO: Record<RegistrationStatus, StatusInfo> = {
  pending: {
    label: 'Pending',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  },
  invited: {
    label: 'Invited',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  },
  registered: {
    label: 'Registered',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  },
  declined: {
    label: 'Declined',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  },
  pending_approval: {
    label: 'Pending Review',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  },
} as const;

// ========================================
// PAYMENT STATUS INFO
// ========================================

export const PAYMENT_STATUS_INFO: Record<PaymentStatus, StatusInfo> = {
  pending: {
    label: 'Awaiting Transfer',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  },
} as const;

// Invited guest special payment status (for display purposes)
export const VIP_PAYMENT_STATUS_INFO: StatusInfo = {
  label: 'Invited (Free)',
  color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
} as const;

// ========================================
// TABLE TYPE COLORS
// ========================================

export const TABLE_TYPE_COLORS: Record<string, string> = {
  vip: 'bg-purple-500',
  standard: 'bg-blue-500',
  reserved: 'bg-yellow-500',
} as const;

// ========================================
// TICKET TYPE LABELS
// ========================================

export const TICKET_TYPE_LABELS: Record<string, string> = {
  vip_free: 'Invited Ticket (Free)',
  paid_single: 'Single Ticket',
  paid_paired: 'Paired Ticket',
} as const;

// ========================================
// CHECK-IN METHOD LABELS
// ========================================

export const CHECKIN_METHOD_LABELS: Record<string, string> = {
  qr: 'QR Code',
  manual: 'Manual',
} as const;

// ========================================
// EMAIL TYPE LABELS
// ========================================

export const EMAIL_TYPE_LABELS: Record<string, string> = {
  magic_link: 'Invitation Link',
  ticket_delivery: 'E-ticket',
  payment_confirmation: 'Payment Confirmation',
} as const;

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get guest type label
 */
export function getGuestTypeLabel(type: GuestType): string {
  return GUEST_TYPE_LABELS[type] || type;
}

/**
 * Get registration status info
 */
export function getRegistrationStatusInfo(status: RegistrationStatus): StatusInfo {
  return REGISTRATION_STATUS_INFO[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
}

/**
 * Get payment status info (with special VIP handling)
 */
export function getPaymentStatusInfo(
  paymentStatus: PaymentStatus | null,
  guestType: GuestType
): StatusInfo {
  // VIP and invited guests don't need payment
  if (guestType === 'vip' || guestType === 'invited') {
    return VIP_PAYMENT_STATUS_INFO;
  }

  if (!paymentStatus) {
    return {
      label: 'None',
      color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    };
  }

  return PAYMENT_STATUS_INFO[paymentStatus] || {
    label: paymentStatus,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };
}

/**
 * Get table type color
 */
export function getTableTypeColor(type: string): string {
  return TABLE_TYPE_COLORS[type] || 'bg-gray-500';
}
