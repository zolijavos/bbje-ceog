'use client';

/**
 * PairedGuestChip Component - Paired Guest Display
 * Renders a draggable card for paired guests (main + partner)
 * Takes 2 seats when assigned to a table
 * Includes registration status dot color coding
 */

import { forwardRef, memo } from 'react';
import { STATUS_DOT_COLORS } from '../types';
import type { DraggableGuest } from '../types';

interface PairedGuestChipProps {
  guest: DraggableGuest;
  isDragging?: boolean;
  isOverlay?: boolean;
  isHighlighted?: boolean;
  style?: React.CSSProperties;
  mainGuestLabel?: string;
  partnerLabel?: string;
}

export const PairedGuestChip = forwardRef<HTMLDivElement, PairedGuestChipProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ guest, isDragging, isOverlay, isHighlighted, style, mainGuestLabel = 'Main guest', partnerLabel = 'Partner', ...props }, ref) => {
    const statusDotClass = guest.registrationStatus
      ? STATUS_DOT_COLORS[guest.registrationStatus] || 'bg-gray-400'
      : 'bg-gray-400';

    return (
      <div
        ref={ref}
        style={style}
        data-testid="paired-guest-chip"
        data-guest-id={guest.guestId}
        data-guest-type={guest.guestType}
        className={`
          flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-700 border rounded-lg cursor-grab
          transition-all duration-150
          ${isDragging ? 'opacity-50 border-blue-400' : 'border-neutral-200 dark:border-neutral-500'}
          ${isOverlay ? 'shadow-xl scale-105 rotate-1' : 'hover:shadow-md hover:bg-white dark:hover:bg-neutral-600 hover:-translate-y-0.5'}
          ${isHighlighted ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-950/30' : ''}
        `}
        {...props}
      >
        {/* Status dot */}
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotClass}`} />

        {/* Primary Guest */}
        <div className="flex-1 bg-white dark:bg-neutral-700 border-l-4 border-gray-700 dark:border-neutral-400 rounded px-2 py-1.5 min-w-0">
          <p className="font-semibold text-xs text-gray-900 dark:text-neutral-100 truncate">{isHighlighted && '★ '}{guest.name}</p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">{mainGuestLabel}</p>
        </div>

        {/* Connector Icon */}
        <svg
          className="w-4 h-4 text-gray-400 dark:text-neutral-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>

        {/* Partner */}
        <div className="flex-1 bg-white dark:bg-neutral-700 border-l-4 border-gray-400 dark:border-neutral-500 rounded px-2 py-1.5 min-w-0">
          <p className="font-semibold text-xs text-gray-900 dark:text-neutral-100 truncate">
            {isHighlighted && '★ '}{guest.partner?.name || partnerLabel}
          </p>
          <p className="text-xs text-gray-500 dark:text-neutral-400">{partnerLabel}</p>
        </div>

        {/* VIP badge */}
        {guest.isVip && (
          <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 uppercase tracking-wider flex-shrink-0">
            VIP
          </span>
        )}

        {/* 2 Seats Badge */}
        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-xs rounded flex-shrink-0 font-medium">
          2
        </span>
      </div>
    );
  }
);

PairedGuestChip.displayName = 'PairedGuestChip';

// Memoize to prevent re-renders during drag operations on other guests
export default memo(PairedGuestChip);
