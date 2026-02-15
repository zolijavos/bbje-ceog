/**
 * Privacy Policy Page
 *
 * Redirects to BBJ's official privacy policy page.
 */

import { redirect } from 'next/navigation';

export default function PrivacyPage() {
  redirect('https://bbj.hu/about/privacy/');
}
