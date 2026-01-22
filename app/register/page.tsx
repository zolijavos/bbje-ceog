/**
 * Registration Landing Page
 * Validates magic link and redirects to appropriate registration form
 *
 * Story 1.5: Magic Link Validation & Registration Landing
 */

import { redirect } from 'next/navigation';
import { validateMagicLink, type MagicLinkErrorType } from '@/lib/auth/magic-link';
import RegisterError from './RegisterError';

interface RegisterPageProps {
  searchParams: Promise<{
    code?: string;
    email?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const { code, email } = params;

  // Missing parameters
  if (!code || !email) {
    return (
      <RegisterError
        errorType="invalid"
        email={email}
        message="Hiányzó paraméterek a linkben"
      />
    );
  }

  // Validate the magic link
  const result = await validateMagicLink(code, email);

  // Handle validation failure
  if (!result.valid || !result.guest) {
    return (
      <RegisterError
        errorType={result.errorType as MagicLinkErrorType}
        email={email}
        message={result.error}
      />
    );
  }

  // Validation successful - redirect directly to appropriate registration form
  const guestType = result.guest.guestType;
  const guestId = result.guest.id;

  if (guestType === 'vip' || guestType === 'invited') {
    redirect(`/register/vip?guest_id=${guestId}`);
  } else {
    redirect(`/register/paid?guest_id=${guestId}`);
  }
}
