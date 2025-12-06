/**
 * Mobile Check-in Page
 *
 * Full-screen QR scanner interface for event entry check-in
 * Story 3.2: Mobile QR Scanner Interface
 */

import CheckinScanner from './CheckinScanner';

export const metadata = {
  title: 'Check-in - CEO Gala 2026',
  description: 'QR code scanning for event entry',
};

export default function CheckinPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <CheckinScanner />
    </div>
  );
}
