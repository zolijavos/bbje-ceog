'use client';

import { Sun, Moon } from '@phosphor-icons/react';
import { useThemeContext } from '../../providers/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme, mounted } = useThemeContext();

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`theme-toggle opacity-0 ${className}`}>
        <span className="theme-toggle-icon text-gray-400">
          <Sun size={14} weight="bold" />
        </span>
        <div className="theme-toggle-track">
          <div className="theme-toggle-knob" />
        </div>
        <span className="theme-toggle-icon text-gray-400">
          <Moon size={14} weight="bold" />
        </span>
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span
        className={`theme-toggle-icon transition-opacity ${
          isDark ? 'opacity-50' : 'opacity-100'
        }`}
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <Sun size={14} weight="bold" />
      </span>

      <div className="theme-toggle-track">
        <div className="theme-toggle-knob" />
      </div>

      <span
        className={`theme-toggle-icon transition-opacity ${
          isDark ? 'opacity-100' : 'opacity-50'
        }`}
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <Moon size={14} weight="bold" />
      </span>

      {showLabel && (
        <span className="ml-2 text-xs pwa-text-secondary">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
