'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTheme, Theme, ResolvedTheme } from '../hooks/useTheme';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const themeState = useTheme();

  // Apply default theme on mount if no stored preference
  useEffect(() => {
    if (themeState.mounted && !localStorage.getItem('pwa-theme')) {
      // Don't call setTheme to avoid overwriting, just use default behavior
    }
  }, [themeState.mounted]);

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

// Script to prevent theme flash (add to head)
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('pwa-theme');
        var resolved = theme;

        if (!theme || theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        document.documentElement.setAttribute('data-theme', resolved);
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
