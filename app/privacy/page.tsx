/**
 * Privacy Policy Page
 */

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-neutral-800 mb-2">
            Privacy Policy
          </h1>
          <p className="text-neutral-500 font-sans">
            CEO Gala 2026 - Budapest Business Journal
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral max-w-none font-sans">
          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            1. Data Controller
          </h2>
          <p className="text-neutral-600 mb-4">
            Budapest Business Journal (BBJ) is the data controller for the personal data collected
            through the CEO Gala 2026 registration system.
          </p>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            2. Data We Collect
          </h2>
          <p className="text-neutral-600 mb-4">
            We collect the following personal data for event registration:
          </p>
          <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
            <li>Name and email address</li>
            <li>Phone number</li>
            <li>Company name and position</li>
            <li>Dietary requirements and food allergies</li>
            <li>Seating preferences</li>
            <li>Partner/guest information (if applicable)</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            3. Purpose of Processing
          </h2>
          <p className="text-neutral-600 mb-4">
            Your personal data is processed for the following purposes:
          </p>
          <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
            <li>Event registration and ticket issuance</li>
            <li>Communication regarding the event</li>
            <li>Catering and seating arrangements</li>
            <li>Event check-in management</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            4. Legal Basis
          </h2>
          <p className="text-neutral-600 mb-4">
            We process your personal data based on your consent provided during registration.
            You have the right to withdraw your consent at any time.
          </p>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            5. Data Retention
          </h2>
          <p className="text-neutral-600 mb-4">
            Your personal data will be retained for the duration necessary to fulfill the
            purposes outlined above, and for a reasonable period thereafter for record-keeping
            and legal compliance purposes.
          </p>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            6. Your Rights
          </h2>
          <p className="text-neutral-600 mb-4">
            Under GDPR, you have the following rights:
          </p>
          <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
            <li>Right to access your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            7. Contact
          </h2>
          <p className="text-neutral-600 mb-4">
            For any questions regarding this privacy policy or to exercise your rights,
            please contact us at: <a href="mailto:events@bbj.hu" className="text-accent-teal hover:underline">events@bbj.hu</a>
          </p>

          <p className="text-neutral-500 text-sm mt-8">
            Last updated: January 2026
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <Link
            href="/"
            className="text-accent-teal hover:text-accent-teal-dark font-sans"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
