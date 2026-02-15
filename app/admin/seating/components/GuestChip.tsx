'use client';

/**
 * GuestChip Component - Single Guest Display
 * Renders a draggable guest card for single guests
 */

import { forwardRef, memo } from 'react';
import { GUEST_TYPE_LABELS } from '@/lib/constants';
import type { DraggableGuest } from '../types';

interface GuestChipProps {
  guest: DraggableGuest;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: React.CSSProperties;
}

export const GuestChip = forwardRef<HTMLDivElement, GuestChipProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ guest, isDragging, isOverlay, style, ...props }, ref) => {
    const guestTypeColors: Record<string, string> = {
      vip: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      paying_single: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      paying_paired: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    };

    return (
      <div
        ref={ref}
        style={style}
        data-testid="guest-chip"
        data-guest-id={guest.guestId}
        data-guest-type={guest.guestType}
        className={`
          bg-white border rounded-lg px-3 py-2 cursor-grab
          transition-all duration-150
          ${isDragging ? 'opacity-50 border-blue-400' : 'border-gray-200'}
          ${isOverlay ? 'shadow-xl scale-105 rotate-2' : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'}
        `}
        {...props}
      >
        <p className="font-medium text-sm text-gray-900 truncate">{guest.name}</p>
        <p className="text-xs text-gray-500 truncate">{guest.email}</p>
        <span className={`
          inline-block mt-1 text-xs px-2 py-0.5 rounded
          ${guestTypeColors[guest.guestType] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}
        `}>
          {GUEST_TYPE_LABELS[guest.guestType] || guest.guestType}
        </span>
      </div>
    );
  }
);

GuestChip.displayName = 'GuestChip';

// Memoize to prevent re-renders during drag operations on other guests
export default memo(GuestChip);
