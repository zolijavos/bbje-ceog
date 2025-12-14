'use client';

/**
 * PairedGuestChip Component - Paired Guest Display
 * Renders a draggable card for paired guests (main + partner)
 * Takes 2 seats when assigned to a table
 */

import { forwardRef, memo } from 'react';
import type { DraggableGuest } from '../types';

interface PairedGuestChipProps {
  guest: DraggableGuest;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: React.CSSProperties;
  mainGuestLabel?: string;
  partnerLabel?: string;
}

export const PairedGuestChip = forwardRef<HTMLDivElement, PairedGuestChipProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ guest, isDragging, isOverlay, style, mainGuestLabel = 'Main guest', partnerLabel = 'Partner', ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        data-testid="paired-guest-chip"
        data-guest-id={guest.guestId}
        data-guest-type={guest.guestType}
        className={`
          flex items-center gap-2 p-2 bg-gray-50 border rounded-lg cursor-grab
          transition-all duration-150
          ${isDragging ? 'opacity-50 border-blue-400' : 'border-gray-200'}
          ${isOverlay ? 'shadow-xl scale-105 rotate-1' : 'hover:shadow-md hover:-translate-y-0.5'}
        `}
        {...props}
      >
        {/* Primary Guest */}
        <div className="flex-1 bg-white border-l-4 border-gray-700 rounded px-2 py-1.5 min-w-0">
          <p className="font-semibold text-xs text-gray-900 truncate">{guest.name}</p>
          <p className="text-xs text-gray-500">{mainGuestLabel}</p>
        </div>

        {/* Connector Icon */}
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
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
        <div className="flex-1 bg-white border-l-4 border-gray-400 rounded px-2 py-1.5 min-w-0">
          <p className="font-semibold text-xs text-gray-900 truncate">
            {guest.partner?.name || partnerLabel}
          </p>
          <p className="text-xs text-gray-500">{partnerLabel}</p>
        </div>

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
