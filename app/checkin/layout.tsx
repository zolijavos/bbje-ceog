/**
 * Check-in Scanner Layout
 *
 * Uses staff-specific manifest for PWA installation
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Scanner - CEO Gala 2026',
  description: 'QR code scanner for event check-in',
  manifest: '/manifest-staff.json',
  themeColor: '#111827',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Staff Scanner',
  },
};

export default function CheckinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
