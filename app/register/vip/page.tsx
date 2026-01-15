/**
 * VIP Guest Registration Page
 *
 * Server component that:
 * 1. Gets guest_id from URL params (passed from welcome page)
 * 2. Validates guest is VIP type
 * 3. Checks if already registered
 * 4. Renders appropriate view
 */

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import VIPConfirmation from './VIPConfirmation';
import AlreadyRegistered from './AlreadyRegistered';

interface VIPPageProps {
  searchParams: Promise<{
    guest_id?: string;
  }>;
}

export default async function VIPPage({ searchParams }: VIPPageProps) {
  const params = await searchParams;
  const guestIdParam = params.guest_id;

  // Validate guest_id parameter
  if (!guestIdParam) {
    redirect('/register?error=missing_params');
  }

  const guestId = parseInt(guestIdParam, 10);
  if (isNaN(guestId)) {
    redirect('/register?error=invalid_params');
  }

  // Get guest from database
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { registration: true },
  });

  // Guest not found
  if (!guest) {
    redirect('/register?error=not_found');
  }

  // Not a VIP/Invited guest - redirect to appropriate page
  // Both 'vip' and 'invited' are free ticket guests that use this flow
  if (guest.guest_type !== 'vip' && guest.guest_type !== 'invited') {
    // Redirect to paid registration if paying guest
    if (guest.guest_type === 'paying_single' || guest.guest_type === 'paying_paired') {
      redirect(`/register/paid?guest_id=${guestId}`);
    }
    redirect('/register?error=invalid_guest_type');
  }

  // Already registered
  if (guest.registration || guest.registration_status === 'registered') {
    return <AlreadyRegistered guest={guest} />;
  }

  // Already declined
  if (guest.registration_status === 'declined') {
    return <AlreadyRegistered guest={guest} declined />;
  }

  // Render VIP confirmation form
  return <VIPConfirmation guest={guest} />;
}
