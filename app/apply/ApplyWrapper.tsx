'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Sun, Moon } from '@phosphor-icons/react';

interface ApplyWrapperProps {
  children: ReactNode;
}

export default function ApplyWrapper({ children }: ApplyWrapperProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('landing-theme');
    if (saved) {
      setIsDark(saved === 'dark');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('landing-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="min-h-screen landing-bg py-8 px-4 transition-colors duration-300">
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full landing-btn border transition-all duration-200 hover:scale-105"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun weight="duotone" size={20} className="text-amber-400" />
          ) : (
            <Moon weight="duotone" size={20} className="text-slate-600" />
          )}
        </button>
      </div>

      {children}
    </div>
  );
}
