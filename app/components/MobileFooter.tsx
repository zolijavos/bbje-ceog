'use client';

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
        py-1.5 text-center
        bg-white/60 dark:bg-neutral-900/60
        backdrop-blur-md
        border-t border-white/20 dark:border-neutral-700/30
        ${className}
      `}
      style={{ bottom: bottomOffset, zIndex }}
    >
      <span className="text-[10px] text-neutral-500/80 dark:text-neutral-400/80">
        Built By{' '}
        <a
          href="https://www.myforgelabs.com/#kapcsolat"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-600/80 dark:text-neutral-300/80 hover:text-neutral-800 dark:hover:text-white transition-colors underline"
        >
          MyForge Labs
        </a>
      </span>
    </div>
  );
}
