/**
 * Admin Guest List Export API
 *
 * GET /api/admin/guests/export - Export full guest list as CSV
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    // Fetch all guests with all relations
    const guests = await prisma.guest.findMany({
      orderBy: { name: 'asc' },
      include: {
        registration: {
          include: {
            payment: true,
            billing_info: true,
          },
        },
        table_assignment: {
          include: {
            table: true,
          },
        },
        checkin: true,
        partner_of: true, // If this guest has a partner registered to them
        paired_with: true, // If this guest is a partner of another guest
      },
    });

    // CSV header - comprehensive export with all fields
    const headers = [
      // Basic info
      'ID',
      'Name',
      'Email',
      'Title',
      'Company',
      'Position',
      'Phone',
      // Type and status
      'Guest Type',
      'Status',
      'VIP Reception',
      'Applied At',
      'Rejection Reason',
      // Partner info
      'Paired Guest Name',
      'Paired Guest Email',
      'Partner Name (Registration)',
      'Partner Email (Registration)',
      // Registration
      'Registered At',
      'Ticket Type',
      'GDPR Consent',
      'Cancellation Accepted',
      // Payment
      'Payment Status',
      'Payment Method',
      'Amount',
      'Currency',
      'Paid At',
      // Billing
      'Billing Name',
      'Billing Company',
      'Tax Number',
      'Billing Address',
      'Billing City',
      'Billing Postal Code',
      'Billing Country',
      // Seating
      'Table',
      'Seat',
      // Preferences
      'Dietary Requirements',
      'Seating Preferences',
      // Check-in
      'Checked In',
      'Check-in Time',
      'Check-in Method',
      // Metadata
      'Created At',
      'Updated At',
    ];

    // Generate CSV rows with all fields
    const rows = guests.map(guest => {
      const guestTypeLabels: Record<string, string> = {
        vip: 'Invited',
        paying_single: 'Paying (Single)',
        paying_paired: 'Paying (Paired)',
        applicant: 'Applicant',
      };

      const statusLabels: Record<string, string> = {
        pending: 'Pending',
        invited: 'Invited',
        registered: 'Registered',
        approved: 'Approved',
        declined: 'Declined',
        pending_approval: 'Pending Approval',
        rejected: 'Rejected',
      };

      const paymentStatusLabels: Record<string, string> = {
        pending: 'Pending',
        paid: 'Paid',
        failed: 'Failed',
        refunded: 'Refunded',
      };

      // Get paired guest info (if this is main guest, get partner; if partner, get main)
      const pairedGuest = guest.partner_of || guest.paired_with;

      // Build billing address
      const billing = guest.registration?.billing_info;
      const billingAddress = billing
        ? `${billing.address_line1}${billing.address_line2 ? ', ' + billing.address_line2 : ''}`
        : '';

      return [
        // Basic info
        guest.id,
        guest.name,
        guest.email,
        guest.title || '',
        guest.company || '',
        guest.position || '',
        guest.phone || '',
        // Type and status
        guestTypeLabels[guest.guest_type] || guest.guest_type,
        statusLabels[guest.registration_status] || guest.registration_status,
        guest.is_vip_reception ? 'Yes' : 'No',
        guest.applied_at ? guest.applied_at.toISOString().split('T')[0] : '',
        guest.rejection_reason || '',
        // Paired guest info (from Guest relation)
        pairedGuest?.name || '',
        pairedGuest?.email || '',
        // Partner info (from Registration legacy fields)
        guest.registration?.partner_name || '',
        guest.registration?.partner_email || '',
        // Registration
        guest.registration?.registered_at?.toISOString().split('T')[0] || '',
        guest.registration?.ticket_type || '',
        guest.registration?.gdpr_consent ? 'Yes' : 'No',
        guest.registration?.cancellation_accepted ? 'Yes' : 'No',
        // Payment
        guest.registration?.payment?.payment_status
          ? paymentStatusLabels[guest.registration.payment.payment_status]
          : (guest.guest_type === 'vip' ? 'Free' : ''),
        guest.registration?.payment?.payment_method || '',
        guest.registration?.payment?.amount?.toString() || '',
        guest.registration?.payment?.currency || '',
        guest.registration?.payment?.paid_at?.toISOString().split('T')[0] || '',
        // Billing
        billing?.billing_name || '',
        billing?.company_name || '',
        billing?.tax_number || '',
        billingAddress,
        billing?.city || '',
        billing?.postal_code || '',
        billing?.country || '',
        // Seating
        guest.table_assignment?.table?.name || '',
        guest.table_assignment?.seat_number || '',
        // Preferences
        guest.dietary_requirements || '',
        guest.seating_preferences || '',
        // Check-in
        guest.checkin ? 'Yes' : 'No',
        guest.checkin?.checked_in_at?.toISOString().replace('T', ' ').substring(0, 19) || '',
        guest.checkin?.method || '',
        // Metadata
        guest.created_at.toISOString().split('T')[0],
        guest.updated_at.toISOString().split('T')[0],
      ];
    });

    // Escape CSV values
    const escapeCSV = (value: string | number | null | undefined): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV string
    const csvContent = [
      headers.map(h => escapeCSV(h)).join(','),
      ...rows.map(row => row.map(cell => escapeCSV(cell)).join(',')),
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const bom = '\ufeff';
    const csvWithBom = bom + csvContent;

    // Return as CSV file
    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vendeglista-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Guest export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
