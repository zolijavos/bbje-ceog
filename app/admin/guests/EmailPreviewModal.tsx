'use client';

import { useState, useEffect } from 'react';
import { X, Warning, PaperPlaneTilt, SpinnerGap } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface EmailRecipient {
  id: number;
  name: string;
  email: string;
}

interface EmailPreviewModalProps {
  isOpen: boolean;
  recipients: EmailRecipient[];
  onClose: () => void;
  onSend: (templateSlug: string) => void;
  isSending: boolean;
}

// Templates compatible with magic link flow (have magicLinkUrl variable)
const INVITATION_TEMPLATES = [
  { slug: 'magic_link', labelKey: 'templateMagicLink' },
  { slug: 'invitation_reminder', labelKey: 'templateInvitationReminder' },
  { slug: 'invitation_reminder_v2', labelKey: 'templateInvitationReminderV2' },
  { slug: 'sponsor_invitation', labelKey: 'templateSponsorInvitation' },
  { slug: 'invitation_cbre', labelKey: 'templateInvitationCbre' },
  { slug: 'applicant_approval', labelKey: 'templateApplicantApproval' },
  { slug: 'reminder_1month', labelKey: 'templateReminder1month' },
  { slug: 'invite_reminder_v3', labelKey: 'templateInviteReminderV3' },
  { slug: 'vip_invitation', labelKey: 'templateVipInvitation' },
  { slug: 'reminder_2wks', labelKey: 'templateReminder2wks' },
  { slug: 'final_reminder_general', labelKey: 'templateFinalReminderGeneral' },
  { slug: 'final_reminder_vip', labelKey: 'templateFinalReminderVip' },
  { slug: 'gala_thank_you', labelKey: 'templateGalaThankYou' },
] as const;

export default function EmailPreviewModal({
  isOpen,
  recipients,
  onClose,
  onSend,
  isSending,
}: EmailPreviewModalProps) {
  const { t } = useLanguage();
  const [showAllRecipients, setShowAllRecipients] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('magic_link');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowAllRecipients(false);
      setSelectedTemplate('magic_link');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayedRecipients = showAllRecipients ? recipients : recipients.slice(0, 5);
  const hasMoreRecipients = recipients.length > 5;

  const handleSend = () => {
    onSend(selectedTemplate);
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
            {/* Template Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-800 mb-2">
                {t('selectTemplate')}
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-accent-teal focus:border-accent-teal"
                disabled={isSending}
              >
                {INVITATION_TEMPLATES.map(({ slug, labelKey }) => (
                  <option key={slug} value={slug}>
                    {t(labelKey)}
                  </option>
                ))}
              </select>
            </div>

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
          <div className="flex items-center justify-end px-6 py-4 pb-20 sm:pb-4 border-t border-gray-200 bg-gray-50 gap-3">
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
