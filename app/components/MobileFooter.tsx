'use client';

import Image from 'next/image';

/**
 * Mobile Footer Component
 *
 * Semi-transparent footer with blur effect for mobile views.
 * Positioned above any bottom navigation (MobileTabBar, etc.)
 */

interface MobileFooterProps {
  /** Bottom offset to account for navigation bars (default: 0) */
  bottomOffset?: string;
  /** Z-index level (default: 30, use 50 for above TabBar) */
  zIndex?: number;
  /** Additional className */
  className?: string;
}

export default function MobileFooter({ bottomOffset = '0', zIndex = 30, className = '' }: MobileFooterProps) {
  return (
    <div
      className={`
        fixed left-0 right-0 md:hidden
        py-1.5
        flex items-center justify-center
        bg-white/40 dark:bg-neutral-900/40
        backdrop-blur-sm
        border-t border-neutral-200/30 dark:border-neutral-700/20
        ${className}
      `}
      style={{ bottom: bottomOffset, zIndex }}
    >
      <div className="flex items-center justify-center gap-2">
        <Image
          src="/myforgelabs-logo.png"
          alt="MyForge Labs"
          width={21}
          height={21}
          className="opacity-80"
        />
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Built By{' '}
          <a
            href="https://www.myforgelabs.com/#kapcsolat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors underline"
          >
            MyForge Labs
          </a>
        </span>
      </div>
    </div>
  );
}
