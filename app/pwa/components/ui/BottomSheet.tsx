'use client';

import { useEffect, useState, useCallback } from 'react';
import { X } from '@phosphor-icons/react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  showHandle = true,
  showCloseButton = true,
}: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close with animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`bottom-sheet-backdrop ${isAnimating ? 'open' : ''}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`bottom-sheet ${isAnimating ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      >
        {/* Handle */}
        {showHandle && <div className="bottom-sheet-handle" />}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 pb-4">
            {title && (
              <h2
                id="bottom-sheet-title"
                className="text-lg font-semibold pwa-text-primary"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 pwa-text-tertiary hover:pwa-text-primary transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-4">{children}</div>
      </div>
    </>
  );
}

// Pre-built bottom sheet for calendar options
interface CalendarOption {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface CalendarBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  options: CalendarOption[];
}

export function CalendarBottomSheet({
  isOpen,
  onClose,
  options,
}: CalendarBottomSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add to Calendar">
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              option.onClick();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 card-static hover:pwa-bg-elevated transition-colors"
          >
            <span className="text-xl">{option.icon}</span>
            <span className="pwa-text-primary font-medium">{option.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full mt-4 py-3 pwa-text-secondary text-sm hover:pwa-text-primary transition-colors"
      >
        Cancel
      </button>
    </BottomSheet>
  );
}
