'use client';

import { useState, useEffect } from 'react';
import { X, Warning, PaperPlaneTilt, SpinnerGap } from '@phosphor-icons/react';

interface EmailRecipient {
  id: number;
  name: string;
  email: string;
}

interface EmailPreviewModalProps {
  isOpen: boolean;
  recipients: EmailRecipient[];
  onClose: () => void;
  onSend: (customSubject: string, customBody: string) => void;
  isSending: boolean;
}

// Default email template - matches the actual CEO Gala 2026 invitation
const DEFAULT_SUBJECT = 'Invitation to the CEO Gala 2026';

const DEFAULT_BODY = `Dear {guestName},

The Budapest Business Journal is delighted to invite you to the official

CEO Gala 2026

hosted at Corinthia Hotel Budapest on Friday, March 27, 2026.

As has now become a tradition of several years, two awards will be presented during the evening: the Expat CEO Award and the CEO Community Award.

Date: Friday, March 27, 2026, 7 p.m.
Location: The Grand Ballroom of the Corinthia Hotel Budapest
Dress Code: Black tie for men, ball gown or cocktail dress for women

If you wish to reserve your place at the gala now, click the REGISTRATION button in the email.

Registration link:
{magicLinkUrl}

Please note that any failure to provide due cancellation notice may result in a no-show fee of HUF 99,000 per person.

Best regards,
Tamas Botka, Publisher, BBJ
Balazs Roman, CEO, BBJ`;

export default function EmailPreviewModal({
  isOpen,
  recipients,
  onClose,
  onSend,
  isSending,
}: EmailPreviewModalProps) {
  const [showAllRecipients, setShowAllRecipients] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowAllRecipients(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayedRecipients = showAllRecipients ? recipients : recipients.slice(0, 5);
  const hasMoreRecipients = recipients.length > 5;

  // Preview with first recipient's name
  const previewName = recipients[0]?.name || 'Guest';
  const previewBody = DEFAULT_BODY
    .replace(/{guestName}/g, previewName)
    .replace(/{magicLinkUrl}/g, 'https://ceogala.hu/register?code=xxx&email=xxx');

  const handleSend = () => {
    onSend(DEFAULT_SUBJECT, DEFAULT_BODY);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-neutral-800">
            <h2 className="text-xl font-display font-semibold text-white">
              Email előnézet
            </h2>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white"
              disabled={isSending}
            >
              <X size={24} weight="duotone" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Recipients Section */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-800 mb-2">
                Címzettek ({recipients.length} fő)
              </label>
              <div className="bg-gray-50 border border-gray-200 p-3">
                <div className="flex flex-wrap gap-2">
                  {displayedRecipients.map((recipient) => (
                    <span
                      key={recipient.id}
                      className="inline-flex items-center px-2 py-1 bg-white border border-gray-300 text-sm"
                      title={recipient.email}
                    >
                      <span className="font-medium text-neutral-800">{recipient.name}</span>
                      <span className="ml-1 text-gray-500 text-xs">({recipient.email})</span>
                    </span>
                  ))}
                </div>
                {hasMoreRecipients && (
                  <button
                    onClick={() => setShowAllRecipients(!showAllRecipients)}
                    className="mt-2 text-sm text-accent-teal hover:text-accent-teal-dark"
                  >
                    {showAllRecipients
                      ? 'Kevesebb mutatása'
                      : `+ ${recipients.length - 5} további címzett`}
                  </button>
                )}
              </div>
            </div>

            {/* Email Preview */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-neutral-800 mb-2">
                Email előnézet ({previewName} példájával)
              </label>
              <div className="bg-gray-50 border border-gray-200 p-4">
                <div className="text-sm font-medium text-neutral-800 mb-2">
                  <span className="text-gray-500">Tárgy:</span> {DEFAULT_SUBJECT}
                </div>
                <hr className="my-3" />
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {previewBody}
                </pre>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Warning size={20} weight="duotone" className="text-amber-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    <strong>Megjegyzés:</strong> A tényleges email a teljes HTML sablont használja
                    CEO Gala 2026 fejléc képpel és formázással. A magic link URL automatikusan
                    generálódik minden vendéghez egyedileg.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 gap-3">
            <button
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSending}
            >
              Mégse
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <SpinnerGap size={20} weight="duotone" className="animate-spin" />
                  Küldés folyamatban...
                </>
              ) : (
                <>
                  <PaperPlaneTilt size={20} weight="duotone" />
                  Küldés ({recipients.length} fő)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
