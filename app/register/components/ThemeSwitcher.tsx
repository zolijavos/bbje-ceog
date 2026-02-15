'use client';

/**
 * Theme Switcher Component for Registration Pages
 *
 * Allows switching between Dark, Dark Blue, and Light themes.
 * Persists selection to localStorage.
 */

import { useState, useEffect } from 'react';

type Theme = 'dark' | 'dark-blue' | 'light';

interface ThemeSwitcherProps {
  onThemeChange?: (theme: Theme) => void;
  className?: string;
}

export default function ThemeSwitcher({ onThemeChange, className = '' }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('registration-theme') as Theme;
    if (savedTheme && ['dark', 'dark-blue', 'light'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('registration-theme', newTheme);
    onThemeChange?.(newTheme);
    // Reload page to apply theme changes
    window.location.reload();
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  const themes: { value: Theme; label: string; color: string }[] = [
    { value: 'dark', label: 'Dark', color: 'bg-[#0c0d0e]' },
    { value: 'dark-blue', label: 'Blue', color: 'bg-[#120c3a]' },
    { value: 'light', label: 'Light', color: 'bg-[#f5f0e8]' },
  ];

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => handleThemeChange(t.value)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${t.color} ${
            theme === t.value
              ? 'border-[#d1aa67] scale-110'
              : 'border-white/20 hover:border-white/40'
          }`}
          title={t.label}
          aria-label={`Switch to ${t.label} theme`}
        />
      ))}
    </div>
  );
}

// Export a mini version for use in cards
export function ThemeSwitcherMini({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('registration-theme') as Theme;
    if (savedTheme && ['dark', 'dark-blue', 'light'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  const cycleTheme = () => {
    const themes: Theme[] = ['dark', 'dark-blue', 'light'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    localStorage.setItem('registration-theme', nextTheme);
    window.location.reload();
  };

  if (!mounted) return null;

  const themeColors = {
    dark: 'bg-[#0c0d0e]',
    'dark-blue': 'bg-[#120c3a]',
    light: 'bg-[#f5f0e8]',
  };

  return (
    <button
      onClick={cycleTheme}
      className={`w-6 h-6 rounded-full border border-[#d1aa67]/50 ${themeColors[theme]} hover:border-[#d1aa67] transition-all ${className}`}
      title="Click to change theme"
      aria-label="Cycle theme"
    />
  );
}
