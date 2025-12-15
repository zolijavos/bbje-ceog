'use client';

import { useState, useEffect } from 'react';
import { X, Warning, PaperPlaneTilt, SpinnerGap, ArrowCounterClockwise } from '@phosphor-icons/react';

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

// Default email template (matches the actual email template)
const DEFAULT_SUBJECT = 'CEO Gala - Registration Invitation';

const DEFAULT_BODY = `Dear {guestName},

We are pleased to inform you that you have received an invitation to the CEO Gala event.

Event details:
- Event: CEO Gala 2026
- Location: Budapest
- You will find more details during registration.

Click the link below to start your registration:
{magicLinkUrl}

This link is valid for 24 hours.

If you have any questions, please contact us.

Best regards,
CEO Gala Organizing Committee`;

export default function EmailPreviewModal({
  isOpen,
  recipients,
  onClose,
  onSend,
  isSending,
}: EmailPreviewModalProps) {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [showAllRecipients, setShowAllRecipients] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject(DEFAULT_SUBJECT);
      setBody(DEFAULT_BODY);
      setShowAllRecipients(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayedRecipients = showAllRecipients ? recipients : recipients.slice(0, 5);
  const hasMoreRecipients = recipients.length > 5;

  // Preview with first recipient's name
  const previewName = recipients[0]?.name || 'Guest';
  const previewBody = body
    .replace(/{guestName}/g, previewName)
    .replace(/{magicLinkUrl}/g, 'https://ceogala.hu/register?code=xxx&email=xxx');

  const handleSend = () => {
    onSend(subject, body);
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
        <div className="relative bg-white w-full max-w-4xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-neutral-800">
            <h2 className="text-xl font-display font-semibold text-white">
              Email előnézet és szerkesztés
            </h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white"
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

            {/* Subject */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-neutral-800 mb-2">
                Tárgy
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-800/20"
                disabled={isSending}
              />
            </div>

            {/* Body Editor and Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  Email szöveg (szerkeszthető)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Használható változók: <code className="bg-gray-100 px-1">{'{guestName}'}</code>, <code className="bg-gray-100 px-1">{'{magicLinkUrl}'}</code>
                </p>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-800/20 font-mono text-sm"
                  disabled={isSending}
                />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  Előnézet ({previewName} példájával)
                </label>
                <div className="bg-gray-50 border border-gray-200 p-4 h-[340px] overflow-y-auto">
                  <div className="text-sm font-medium text-neutral-800 mb-2">
                    Tárgy: {subject}
                  </div>
                  <hr className="my-2" />
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {previewBody}
                  </pre>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Warning size={20} weight="duotone" className="text-amber-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    <strong>Megjegyzés:</strong> A magic link URL automatikusan generálódik minden vendéghez egyedileg.
                    A link 24 óráig érvényes. A küldés után a rendszer logolja az email küldést.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                setSubject(DEFAULT_SUBJECT);
                setBody(DEFAULT_BODY);
              }}
              className="btn btn-ghost inline-flex items-center gap-2"
              disabled={isSending}
            >
              <ArrowCounterClockwise size={18} weight="duotone" />
              Alapértelmezés visszaállítása
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn btn-ghost"
                disabled={isSending}
              >
                Mégse
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !subject.trim() || !body.trim()}
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
    </div>
  );
}
