'use client';

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'pwa-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return;

  // Add transition class for smooth theme change
  document.documentElement.setAttribute('data-theme-transition', 'true');
  document.documentElement.setAttribute('data-theme', theme);

  // Also add/remove dark class for Tailwind
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);

  // Remove transition class after animation completes
  setTimeout(() => {
    document.documentElement.removeAttribute('data-theme-transition');
  }, 300);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  // Resolve theme and apply it
  useEffect(() => {
    if (!mounted) return;

    const resolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    // Haptic feedback on theme change
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    mounted,
  };
}

// Hook for SSR-safe theme initialization
export function useThemeInit() {
  useEffect(() => {
    // Check for stored theme and apply immediately to prevent flash
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    let theme: ResolvedTheme;

    if (stored === 'dark') {
      theme = 'dark';
    } else if (stored === 'light') {
      theme = 'light';
    } else {
      theme = getSystemTheme();
    }

    document.documentElement.setAttribute('data-theme', theme);
    // Also add class for Tailwind
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, []);
}
