/**
 * Guest Status Page
 *
 * Shows registration, payment, and ticket status for guests
 * Access via magic link: /status?code={hash}&email={email}
 *
 * Story 2.6: Payment Status Dashboard for Guests
 */

import { validateMagicLink } from '@/lib/auth/magic-link';
import { getGuestStatus } from '@/lib/services/registration';
import { generateTicket } from '@/lib/services/qr-ticket';
import StatusContent from './StatusContent';
import StatusError from './StatusError';
import { logError } from '@/lib/utils/logger';

interface StatusPageProps {
  searchParams: Promise<{
    code?: string;
    email?: string;
  }>;
}

export default async function StatusPage({ searchParams }: StatusPageProps) {
  const params = await searchParams;
  const { code, email } = params;

  // Missing parameters
  if (!code || !email) {
    return (
      <StatusError
        errorType="invalid"
        message="Hiányzó paraméterek a linkben. Kérjük, használja a meghívóban kapott linket."
      />
    );
  }

  // Validate magic link
  const validationResult = await validateMagicLink(code, email);

  if (!validationResult.valid || !validationResult.guest) {
    return (
      <StatusError
        errorType={validationResult.errorType || 'invalid'}
        message={validationResult.error}
        email={email}
      />
    );
  }

  // Get guest status
  const statusResult = await getGuestStatus(validationResult.guest.id);

  if (!statusResult.success || !statusResult.guest) {
    return (
      <StatusError
        errorType="not_found"
        message={statusResult.error || 'Nem sikerült betölteni az adatokat'}
      />
    );
  }

  // Generate QR code if ticket is available
  let qrCodeDataUrl: string | null = null;
  if (statusResult.ticket?.available && statusResult.registration?.id) {
    try {
      const ticketResult = await generateTicket(statusResult.registration.id);
      qrCodeDataUrl = ticketResult.qrCodeDataUrl;
    } catch (error) {
      logError('Error generating QR code:', error);
    }
  }

  return (
    <StatusContent
      guest={statusResult.guest}
      registration={
        statusResult.registration
          ? {
              id: statusResult.registration.id,
              ticketType: statusResult.registration.ticketType,
              registeredAt: statusResult.registration.registeredAt.toISOString(),
              partnerName: statusResult.registration.partnerName,
            }
          : null
      }
      payment={
        statusResult.payment
          ? {
              status: statusResult.payment.status,
              method: statusResult.payment.method,
              paidAt: statusResult.payment.paidAt?.toISOString() || null,
            }
          : null
      }
      ticket={{
        available: statusResult.ticket?.available || false,
        qrCodeDataUrl,
      }}
      magicLinkCode={code}
      email={email}
    />
  );
}
