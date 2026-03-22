'use client';

/**
 * GuestChip Component - Single Guest Display
 * Renders a draggable guest card for single guests
 * Includes registration status dot color coding
 */

import { forwardRef, memo } from 'react';
import { GUEST_TYPE_LABELS } from '@/lib/constants';
import type { DraggableGuest } from '../types';

interface GuestChipProps {
  guest: DraggableGuest;
  isDragging?: boolean;
  isOverlay?: boolean;
  isHighlighted?: boolean;
  style?: React.CSSProperties;
}

// Registration status → dot color mapping
const STATUS_DOT_COLORS: Record<string, string> = {
  invited: 'bg-yellow-400',
  registered: 'bg-blue-400',
  approved: 'bg-emerald-400',
  checked_in: 'bg-emerald-600 ring-2 ring-emerald-300',
  declined: 'bg-red-400',
  cancelled: 'bg-red-400',
  pending_approval: 'bg-amber-500',
  rejected: 'bg-red-400',
};

export const GuestChip = forwardRef<HTMLDivElement, GuestChipProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ guest, isDragging, isOverlay, isHighlighted, style, ...props }, ref) => {
    const guestTypeColors: Record<string, string> = {
      vip: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      paying_single: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      paying_paired: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    };

    const statusDotClass = guest.registrationStatus
      ? STATUS_DOT_COLORS[guest.registrationStatus] || 'bg-gray-400'
      : 'bg-gray-400';

    return (
      <div
        ref={ref}
        style={style}
        data-testid="guest-chip"
        data-guest-id={guest.guestId}
        data-guest-type={guest.guestType}
        className={`
          bg-neutral-50 dark:bg-neutral-700 border rounded-lg px-3 py-2 cursor-grab
          transition-all duration-150
          ${isDragging ? 'opacity-50 border-blue-400' : 'border-neutral-200 dark:border-neutral-500'}
          ${isOverlay ? 'shadow-xl scale-105 rotate-2' : 'shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-neutral-600 hover:-translate-y-0.5'}
          ${isHighlighted ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-950/30' : ''}
        `}
        {...props}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotClass}`} />
          <p className="font-medium text-sm text-gray-900 dark:text-neutral-100 truncate">
            {isHighlighted && '★ '}{guest.name}
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-neutral-400 truncate ml-4">{guest.email}</p>
        <div className="flex items-center gap-1.5 mt-1 ml-4">
          <span className={`
            inline-block text-xs px-2 py-0.5 rounded
            ${guestTypeColors[guest.guestType] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}
          `}>
            {GUEST_TYPE_LABELS[guest.guestType] || guest.guestType}
          </span>
          {(guest.guestType === 'invited' || guest.guestType === 'vip') && (
            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 uppercase tracking-wider">
              VIP
            </span>
          )}
        </div>
      </div>
    );
  }
);

GuestChip.displayName = 'GuestChip';

// Memoize to prevent re-renders during drag operations on other guests
export default memo(GuestChip);
