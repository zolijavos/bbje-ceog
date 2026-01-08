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

    // Fetch all guests with relations
    const guests = await prisma.guest.findMany({
      orderBy: { name: 'asc' },
      include: {
        registration: {
          include: {
            payment: true,
          },
        },
        table_assignment: {
          include: {
            table: true,
          },
        },
      },
    });

    // CSV header
    const headers = [
      'ID',
      'Name',
      'Email',
      'Title',
      'Company',
      'Position',
      'Phone',
      'Guest Type',
      'Status',
      'VIP Reception',
      'Table',
      'Seat',
      'Ticket Type',
      'Payment Status',
      'Payment Method',
      'Dietary Requirements',
      'Seating Preferences',
      'Partner Name',
      'Partner Email',
      'Created At',
    ];

    // Generate CSV rows
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

      return [
        guest.id,
        guest.name,
        guest.email,
        guest.title || '',
        guest.company || '',
        guest.position || '',
        guest.phone || '',
        guestTypeLabels[guest.guest_type] || guest.guest_type,
        statusLabels[guest.registration_status] || guest.registration_status,
        guest.is_vip_reception ? 'Yes' : 'No',
        guest.table_assignment?.table?.name || '',
        guest.table_assignment?.seat_number || '',
        guest.registration?.ticket_type || '',
        guest.registration?.payment?.payment_status
          ? paymentStatusLabels[guest.registration.payment.payment_status]
          : (guest.guest_type === 'vip' ? 'Free' : ''),
        guest.registration?.payment?.payment_method || '',
        guest.dietary_requirements || '',
        guest.seating_preferences || '',
        guest.registration?.partner_name || '',
        guest.registration?.partner_email || '',
        guest.created_at.toISOString().split('T')[0],
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
