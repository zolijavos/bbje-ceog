'use client';

/**
 * Consent Checkboxes Component
 *
 * Required consent checkboxes for registration:
 * - GDPR data processing consent
 * - Attendance commitment / Cancellation policy acceptance
 */

interface ConsentCheckboxesProps {
  gdprConsent: boolean;
  cancellationAccepted: boolean;
  onGdprChange: (checked: boolean) => void;
  onCancellationChange: (checked: boolean) => void;
  errors?: {
    gdpr_consent?: string;
    cancellation_accepted?: string;
  };
}

export default function ConsentCheckboxes({
  gdprConsent,
  cancellationAccepted,
  onGdprChange,
  onCancellationChange,
  errors,
}: ConsentCheckboxesProps) {
  return (
    <div className="space-y-4">
      {/* GDPR Consent */}
      <div className={`p-4 border rounded-lg ${errors?.gdpr_consent ? 'border-red-500/50 bg-red-900/20' : 'border-white/20'}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={gdprConsent}
            onChange={(e) => onGdprChange(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-white/30 text-[#d1aa67] focus:ring-[#d1aa67] bg-transparent"
            data-testid="gdpr-checkbox"
          />
          <div>
            <span className="text-sm font-medium text-white">
              GDPR Data Processing Consent <span className="text-red-400">*</span>
            </span>
            <p className="text-sm text-white/80 mt-1">
              I consent to the processing of my personal data for CEO Gala 2026 event management.{' '}
              <a
                href="https://bbj.hu/about/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d1aa67] underline hover:text-[#e5c078]"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </label>
        {errors?.gdpr_consent && (
          <p className="text-red-400 text-sm mt-2 ml-8">{errors.gdpr_consent}</p>
        )}
      </div>

      {/* Attendance Commitment / Cancellation Policy */}
      <div className={`p-4 border rounded-lg ${errors?.cancellation_accepted ? 'border-red-500/50 bg-red-900/20' : 'border-white/20'}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={cancellationAccepted}
            onChange={(e) => onCancellationChange(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-white/30 text-[#d1aa67] focus:ring-[#d1aa67] bg-transparent"
            data-testid="cancellation-checkbox"
          />
          <div>
            <span className="text-sm font-medium text-white">
              Attendance Commitment <span className="text-red-400">*</span>
            </span>
            <p className="text-sm text-white/80 mt-1">
              We remind you that any cancellations or changes to your registration must be made at least ten business days before the gala. Cancellations should be sent to{' '}
              <a
                href="mailto:event@bbj.hu?subject=Inquiry%20regarding%20CEO%20Gala%202026"
                className="text-[#d1aa67] underline hover:text-[#e5c078]"
                onClick={(e) => e.stopPropagation()}
              >
                event@bbj.hu
              </a>.
            </p>
            <p className="text-sm text-white/80 mt-2">
              Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of{' '}
              <span className="font-semibold text-white">HUF 99,000 + VAT</span> per person.
            </p>
          </div>
        </label>
        {errors?.cancellation_accepted && (
          <p className="text-red-400 text-sm mt-2 ml-8">{errors.cancellation_accepted}</p>
        )}
      </div>
    </div>
  );
}
