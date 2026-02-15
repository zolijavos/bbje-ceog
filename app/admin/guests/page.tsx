import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import GuestList from './GuestList';
import { ClipboardText, UploadSimple } from '@phosphor-icons/react/dist/ssr';
import PageHeader from '../components/PageHeader';
import { getFullName } from '@/lib/utils/name';

export default async function GuestsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch guests with email log count, table assignment, payment status, Epic 5 fields, and partner relations
  const guests = await prisma.guest.findMany({
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      title: true,
      phone: true,
      company: true,
      position: true,
      guest_type: true,
      registration_status: true,
      magic_link_hash: true,
      magic_link_expires_at: true,
      dietary_requirements: true,
      seating_preferences: true,
      created_at: true,
      updated_at: true,
      is_vip_reception: true,
      paired_with_id: true,
      // Partner relation: if this guest is a main guest, get their partner
      partner_of: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          title: true,
          dietary_requirements: true,
          seating_preferences: true,
        },
      },
      // Paired with: if this guest is a partner, get their main guest
      paired_with: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      _count: {
        select: {
          email_logs: {
            where: {
              email_type: 'magic_link',
              status: 'sent',
            },
          },
        },
      },
      // Last magic link sent time
      email_logs: {
        where: {
          email_type: 'magic_link',
          status: 'sent',
        },
        orderBy: {
          sent_at: 'desc',
        },
        take: 1,
        select: {
          sent_at: true,
        },
      },
      table_assignment: {
        select: {
          seat_number: true,
          table: {
            select: {
              name: true,
            },
          },
        },
      },
      registration: {
        select: {
          id: true,
          ticket_type: true,
          partner_first_name: true,
          partner_last_name: true,
          partner_email: true,
          cancelled_at: true,
          cancellation_reason: true,
          payment: {
            select: {
              payment_status: true,
              payment_method: true,
            },
          },
          billing_info: {
            select: {
              billing_first_name: true,
              billing_last_name: true,
              company_name: true,
              tax_number: true,
              address_line1: true,
              address_line2: true,
              city: true,
              postal_code: true,
              country: true,
            },
          },
        },
      },
      checkin: {
        select: {
          id: true,
          checked_in_at: true,
        },
      },
    },
    orderBy: {
      updated_at: 'desc',
    },
  });

  // Helper to determine magic link category based on last sent time
  const getMagicLinkCategory = (lastSentAt: Date | null): 'ready' | 'warning' | 'recent' | 'never' => {
    if (!lastSentAt) return 'never';
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (lastSentAt < fortyEightHoursAgo) return 'ready';
    if (lastSentAt < twentyFourHoursAgo) return 'warning';
    return 'recent';
  };

  // Transform for client component
  const guestData = guests.map(g => {
    const lastMagicLinkAt = g.email_logs.length > 0 ? g.email_logs[0].sent_at : null;
    const magicLinkCount = g._count.email_logs;
    const magicLinkCategory = getMagicLinkCategory(lastMagicLinkAt);

    return {
    id: g.id,
    firstName: g.first_name,
    lastName: g.last_name,
    name: getFullName(g.first_name, g.last_name),
    email: g.email,
    title: g.title,
    phone: g.phone,
    company: g.company,
    position: g.position,
    guestType: g.guest_type,
    status: g.registration_status,
    hasMagicLink: !!g.magic_link_hash,
    magicLinkExpired: g.magic_link_expires_at
      ? new Date() > g.magic_link_expires_at
      : true,
    emailsSent: g._count.email_logs,
    createdAt: g.created_at.toISOString(),
    updatedAt: g.updated_at.toISOString(),
    dietaryRequirements: g.dietary_requirements,
    seatingPreferences: g.seating_preferences,
    tableAssignment: g.table_assignment
      ? {
          tableName: g.table_assignment.table.name,
          seatNumber: g.table_assignment.seat_number,
        }
      : null,
    paymentStatus: g.registration?.payment?.payment_status || null,
    paymentMethod: g.registration?.payment?.payment_method || null,
    hasRegistration: !!g.registration,
    // Legacy partner data from registration (for backwards compatibility)
    partnerFirstName: g.registration?.partner_first_name || null,
    partnerLastName: g.registration?.partner_last_name || null,
    partnerName: g.registration ? getFullName(g.registration.partner_first_name, g.registration.partner_last_name) : null,
    partnerEmail: g.registration?.partner_email || null,
    billingInfo: g.registration?.billing_info ? {
      ...g.registration.billing_info,
      billingName: getFullName(g.registration.billing_info.billing_first_name, g.registration.billing_info.billing_last_name),
    } : null,
    // New partner guest relation
    isPartner: !!g.paired_with_id,
    pairedWithId: g.paired_with_id,
    pairedWith: g.paired_with
      ? {
          id: g.paired_with.id,
          firstName: g.paired_with.first_name,
          lastName: g.paired_with.last_name,
          name: getFullName(g.paired_with.first_name, g.paired_with.last_name),
          email: g.paired_with.email,
        }
      : null,
    // Partner of this guest (if this is the main guest)
    partnerGuest: g.partner_of
      ? {
          id: g.partner_of.id,
          firstName: g.partner_of.first_name,
          lastName: g.partner_of.last_name,
          name: getFullName(g.partner_of.first_name, g.partner_of.last_name),
          email: g.partner_of.email,
          title: g.partner_of.title,
          dietaryRequirements: g.partner_of.dietary_requirements,
          seatingPreferences: g.partner_of.seating_preferences,
        }
      : null,
    // VIP Reception flag
    isVipReception: g.is_vip_reception ?? false,
    // Attendance tracking
    cancelledAt: g.registration?.cancelled_at?.toISOString() || null,
    cancellationReason: g.registration?.cancellation_reason || null,
    hasCheckedIn: !!g.checkin,
    checkedInAt: g.checkin?.checked_in_at?.toISOString() || null,
    // Magic link tracking for bulk email feature
    lastMagicLinkAt: lastMagicLinkAt?.toISOString() || null,
    magicLinkCount,
    magicLinkCategory,
  };
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader
        title="Guest List"
        description="Manage guests and send invitations"
        currentPath="/admin/guests"
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500" data-testid="guest-count">
            {guestData.length} guests
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/checkin-log"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ClipboardText size={18} weight="duotone" className="mr-2" />
              Check-in Log
            </Link>
            <Link
              href="/admin/guests/import"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <UploadSimple size={18} weight="duotone" className="mr-2" />
              CSV Import
            </Link>
          </div>
        </div>

        <GuestList guests={guestData} />
      </main>
    </div>
  );
}
