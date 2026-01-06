/**
 * Paid Guest Registration Page
 *
 * Server component that:
 * 1. Gets guest_id from URL params
 * 2. Validates guest is paying type (paying_single or paying_paired)
 * 3. Checks if already registered
 * 4. Renders appropriate view
 */

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import PaidRegistrationForm from './PaidRegistrationForm';
import AlreadyRegistered from '../vip/AlreadyRegistered';

interface PaidPageProps {
  searchParams: Promise<{
    guest_id?: string;
  }>;
}

export default async function PaidPage({ searchParams }: PaidPageProps) {
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

  // Not a paying guest - redirect to appropriate page
  if (guest.guest_type !== 'paying_single' && guest.guest_type !== 'paying_paired') {
    // Redirect to VIP registration if VIP guest
    if (guest.guest_type === 'vip') {
      redirect(`/register/vip?guest_id=${guestId}`);
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

  // Determine if paired tickets are allowed
  const canSelectPaired = guest.guest_type === 'paying_paired';

  // Render paid registration form with all profile fields pre-filled
  return (
    <PaidRegistrationForm
      guest={{
        id: guest.id,
        name: guest.name,
        email: guest.email,
        guest_type: guest.guest_type,
        title: guest.title,
        phone: guest.phone,
        company: guest.company,
        position: guest.position,
        dietary_requirements: guest.dietary_requirements,
        seating_preferences: guest.seating_preferences,
      }}
      canSelectPaired={canSelectPaired}
    />
  );
}
