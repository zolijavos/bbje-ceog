'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface RemovePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mainGuestId: number;
  partnerName: string;
  partnerCheckedIn?: boolean;
}

export default function RemovePartnerModal({
  isOpen,
  onClose,
  onSuccess,
  mainGuestId,
  partnerName,
  partnerCheckedIn = false,
}: RemovePartnerModalProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleRemove() {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/guests/${mainGuestId}/partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove' }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.code === 'PARTNER_CHECKED_IN') {
          setError(t('removePartnerCheckinBlocked'));
        } else {
          setError(data.error || 'Failed to remove partner');
        }
        return;
      }

      onSuccess();
    } catch {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('removePartnerTitle')}
        </h2>

        {partnerCheckedIn ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              {t('removePartnerCheckinBlocked')}
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {(t('removePartnerWarning') as string).replace('{name}', partnerName)}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {t('cancel')}
          </button>
          {!partnerCheckedIn && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? '...' : t('removePartnerConfirm')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
