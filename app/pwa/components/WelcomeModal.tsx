'use client';

import { useEffect, useState } from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestName: string;
  tableName: string | null;
  tableType: string | null;
  seatNumber: number | null;
}

const ANIMATION_DELAY_MS = 50;

export default function WelcomeModal({
  isOpen,
  onClose,
  guestName,
  tableName,
  tableType,
  seatNumber,
}: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (isOpen) {
      // Small delay for animation
      timeoutId = setTimeout(() => setIsVisible(true), ANIMATION_DELAY_MS);
    } else {
      setIsVisible(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const firstName = guestName.split(' ')[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60' : 'bg-black/0'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with confetti effect */}
        <div className="bg-gradient-to-r from-accent-teal to-accent-teal/80 p-6 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />

          <div className="text-5xl mb-3">🎉</div>
          <h2 id="welcome-modal-title" className="text-2xl font-display font-semibold text-white">
            Üdvözöljük!
          </h2>
          <p className="text-white/90 mt-1">{firstName}</p>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {tableName ? (
            <>
              <p className="text-neutral-600 mb-4">Az Ön asztala:</p>
              <div className="bg-neutral-800 text-white rounded-xl p-6 mb-4">
                <div className="text-4xl font-bold font-display mb-2">
                  {tableName}
                </div>
                <div className="text-neutral-300 text-sm">
                  {tableType === 'vip' ? '✨ VIP asztal' : 'Standard asztal'}
                  {seatNumber && ` • ${seatNumber}. szék`}
                </div>
              </div>
              <p className="text-sm text-neutral-500">
                Kérjük, keresse meg az asztalát és foglaljon helyet.
              </p>
            </>
          ) : (
            <>
              <p className="text-neutral-600 mb-4">
                Sikeresen bejelentkezett az eseményre!
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-amber-800 text-sm">
                  ⚠️ Az asztalszám még nincs kiosztva. Kérjük, érdeklődjön a
                  recepciónál.
                </p>
              </div>
            </>
          )}

          <button
            onClick={onClose}
            className="btn btn-primary w-full mt-4"
          >
            Rendben
          </button>
        </div>
      </div>
    </div>
  );
}
