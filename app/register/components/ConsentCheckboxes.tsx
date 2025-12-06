'use client';

/**
 * Consent Checkboxes Component
 *
 * Required consent checkboxes for registration:
 * - GDPR data processing consent
 * - Cancellation policy acceptance
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
      <div className={`p-4 border rounded-lg ${errors?.gdpr_consent ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={gdprConsent}
            onChange={(e) => onGdprChange(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            data-testid="gdpr-checkbox"
          />
          <div>
            <span className="text-sm font-medium text-slate-700">
              GDPR Data Processing Consent *
            </span>
            <p className="text-xs text-slate-500 mt-1">
              I accept that the organizer will process my personal data for the purpose
              of organizing the event. The data processing notice is available{' '}
              <a
                href="/privacy"
                target="_blank"
                className="text-amber-600 underline hover:text-amber-700"
                onClick={(e) => e.stopPropagation()}
              >
                here
              </a>.
            </p>
          </div>
        </label>
        {errors?.gdpr_consent && (
          <p className="text-red-600 text-sm mt-2 ml-8">{errors.gdpr_consent}</p>
        )}
      </div>

      {/* Cancellation Policy */}
      <div className={`p-4 border rounded-lg ${errors?.cancellation_accepted ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={cancellationAccepted}
            onChange={(e) => onCancellationChange(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            data-testid="cancellation-checkbox"
          />
          <div>
            <span className="text-sm font-medium text-slate-700">
              Cancellation Policy Acceptance *
            </span>
            <p className="text-xs text-slate-500 mt-1">
              I acknowledge that registration cancellation is possible no later than 7 days
              before the event. Cancellation policy details are available{' '}
              <a
                href="/terms"
                target="_blank"
                className="text-amber-600 underline hover:text-amber-700"
                onClick={(e) => e.stopPropagation()}
              >
                here
              </a>.
            </p>
          </div>
        </label>
        {errors?.cancellation_accepted && (
          <p className="text-red-600 text-sm mt-2 ml-8">{errors.cancellation_accepted}</p>
        )}
      </div>
    </div>
  );
}
