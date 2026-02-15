/**
 * Terms and Conditions Page
 */

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-neutral-800 mb-2">
            Terms and Conditions
          </h1>
          <p className="text-neutral-500 font-sans">
            CEO Gala 2026 - Budapest Business Journal
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral max-w-none font-sans">
          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            1. Event Details
          </h2>
          <p className="text-neutral-600 mb-4">
            The CEO Gala 2026 will be held on Friday, March 27, 2026, at 7:00 PM
            at the Grand Ballroom of the Corinthia Hotel Budapest.
          </p>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            2. Registration
          </h2>
          <p className="text-neutral-600 mb-4">
            Registration is required to attend the event. By registering, you agree to
            these terms and conditions and our privacy policy.
          </p>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            3. Dress Code
          </h2>
          <p className="text-neutral-600 mb-4">
            The event has a formal dress code:
          </p>
          <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
            <li>Men: Black tie</li>
            <li>Women: Ball gown or cocktail dress</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            4. Cancellation Policy
          </h2>
          <p className="text-neutral-600 mb-4">
            <strong className="text-neutral-800">Important:</strong> Failure to provide due
            cancellation notice may result in a no-show fee of <strong>HUF 99,000</strong> per person.
          </p>
          <p className="text-neutral-600 mb-4">
            To cancel your registration, please contact us at least 72 hours before the event.
          </p>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            5. Ticket Types and Pricing
          </h2>
          <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
            <li><strong>VIP Guests:</strong> Complimentary (by invitation only)</li>
            <li><strong>Single Ticket:</strong> HUF 100,000</li>
            <li><strong>Paired Ticket:</strong> HUF 180,000 (for 2 persons)</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            6. Payment Terms
          </h2>
          <p className="text-neutral-600 mb-4">
            Payment can be made via:
          </p>
          <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-1">
            <li>Credit/Debit card (via Stripe)</li>
            <li>Bank transfer (manual approval required)</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            7. QR Tickets
          </h2>
          <p className="text-neutral-600 mb-4">
            Upon successful registration (and payment for paying guests), you will receive
            a QR code ticket via email. This QR code must be presented at the check-in desk
            for entry to the event.
          </p>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            8. Liability
          </h2>
          <p className="text-neutral-600 mb-4">
            Budapest Business Journal is not responsible for any personal belongings lost
            or damaged during the event. Attendees are advised to take care of their valuables.
          </p>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            9. Photography and Media
          </h2>
          <p className="text-neutral-600 mb-4">
            By attending the event, you consent to being photographed or filmed.
            These images may be used for promotional purposes by Budapest Business Journal.
          </p>

          <h2 className="font-display text-xl font-semibold text-neutral-800 mt-6 mb-4">
            10. Contact Information
          </h2>
          <p className="text-neutral-600 mb-4">
            For any questions regarding these terms or the event, please contact:
            <br />
            Email: <a href="mailto:events@bbj.hu" className="text-accent-teal hover:underline">events@bbj.hu</a>
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
