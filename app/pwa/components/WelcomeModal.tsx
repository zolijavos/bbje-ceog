'use client';

import { useEffect, useState } from 'react';
import { Sparkle, X } from '@phosphor-icons/react';
import Button3D from './ui/Button3D';
import { useHaptic } from '../hooks/useHaptic';

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
  const { patterns } = useHaptic();
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

  const handleClose = () => {
    patterns.light();
    onClose();
  };

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
      onClick={handleClose}
    >
      <div
        className={`max-w-sm w-full overflow-hidden transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        style={{
          background: 'var(--color-bg-card)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors z-10"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          aria-label="Close"
        >
          <X size={20} className="pwa-text-inverse" />
        </button>

        {/* Header with shimmer effect */}
        <div
          className="welcome-header p-8 text-center relative overflow-hidden"
          style={{ background: 'var(--color-bg-header)' }}
        >
          {/* Shimmer overlay */}
          <div className="welcome-shimmer" />

          {/* Decorative circles */}
          <div
            className="absolute top-0 left-0 w-24 h-24 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
          <div
            className="absolute bottom-0 right-0 w-20 h-20 rounded-full translate-x-1/2 translate-y-1/2"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
          <div
            className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full -translate-y-1/2"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />

          {/* Sparkle icon with glow */}
          <div className="relative inline-block mb-4">
            <div
              className="absolute inset-0 blur-xl opacity-50 animate-pulse"
              style={{ background: 'var(--color-accent)' }}
            />
            <Sparkle
              size={64}
              weight="fill"
              className="relative"
              style={{ color: 'var(--color-accent)' }}
            />
          </div>

          <h2
            id="welcome-modal-title"
            className="text-3xl font-display font-semibold pwa-text-inverse"
          >
            Welcome!
          </h2>
          <p className="pwa-text-inverse opacity-80 mt-2 text-lg">{firstName}</p>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {tableName ? (
            <>
              <p className="pwa-text-secondary mb-4">Your table:</p>

              {/* Table number card with subtle glow */}
              <div
                className="relative p-6 mb-4 overflow-hidden"
                style={{
                  background: 'var(--color-bg-header)',
                  boxShadow: '0 0 30px rgba(var(--color-accent-rgb), 0.2)',
                }}
              >
                {/* Shimmer on table card */}
                <div className="table-card-shimmer" />

                <div className="relative z-10">
                  <div className="text-5xl font-bold font-display pwa-text-inverse mb-2">
                    {tableName}
                  </div>
                  <div className="pwa-text-inverse opacity-70 text-sm flex items-center justify-center gap-2">
                    {tableType === 'vip' && (
                      <Sparkle size={16} weight="fill" style={{ color: 'var(--color-accent)' }} />
                    )}
                    {tableType === 'vip' ? 'VIP table' : 'Standard table'}
                    {seatNumber && ` • Seat ${seatNumber}`}
                  </div>
                </div>
              </div>

              <p className="text-sm pwa-text-tertiary">
                Please find your table and take a seat.
              </p>
            </>
          ) : (
            <>
              <p className="pwa-text-secondary mb-4">
                You have successfully checked in to the event!
              </p>
              <div
                className="px-4 py-4 mb-4 border"
                style={{
                  background: 'var(--color-warning-bg)',
                  borderColor: 'var(--color-warning)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--color-warning)' }}>
                  Table number not yet assigned. Please inquire at the reception.
                </p>
              </div>
            </>
          )}

          <Button3D onClick={handleClose} fullWidth className="mt-4">
            OK
          </Button3D>
        </div>
      </div>

      {/* Shimmer animation styles */}
      <style jsx>{`
        .welcome-header {
          position: relative;
        }

        .welcome-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          animation: shimmerSlide 3s ease-in-out infinite;
        }

        .table-card-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 100%
          );
          animation: shimmerSlide 2.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        @keyframes shimmerSlide {
          0% {
            left: -100%;
          }
          50%,
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}
