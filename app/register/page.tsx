/**
 * Registration Landing Page
 * Validates magic link and displays welcome or error page
 *
 * Story 1.5: Magic Link Validation & Registration Landing
 */

import { validateMagicLink, type MagicLinkErrorType } from '@/lib/auth/magic-link';
import RegisterWelcome from './RegisterWelcome';
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

  // Validation successful - show welcome page
  return (
    <RegisterWelcome
      guest={{
        id: result.guest.id,
        name: result.guest.name,
        title: result.guest.title,
        email: result.guest.email,
        guestType: result.guest.guestType,
        status: result.guest.status,
      }}
      code={code}
    />
  );
}
