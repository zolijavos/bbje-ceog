'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Envelope, PaperPlaneTilt, QrCode, GearSix, Info, Calendar, MapTrifold, Sun, Moon } from '@phosphor-icons/react';

export default function HomePage() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check saved preference or system preference
    const saved = localStorage.getItem('landing-theme');
    if (saved) {
      setIsDark(saved === 'dark');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
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
    <div className="min-h-screen landing-bg flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
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

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-bold landing-text-heading tracking-tight mb-3 drop-shadow-sm">
            BBJ Events
          </h1>
          <p className="text-accent-teal dark:text-teal-400 text-lg font-medium tracking-widest uppercase mb-4">
            2026
          </p>
          <div className="flex items-center justify-center gap-4 landing-text-tertiary text-sm">
            <span className="flex items-center gap-2">
              <Calendar weight="duotone" size={16} className="text-accent-teal dark:text-teal-400" />
              March 27, 2026
            </span>
            <span className="landing-text-tertiary">|</span>
            <span className="flex items-center gap-2">
              <MapTrifold weight="duotone" size={16} className="text-accent-teal dark:text-teal-400" />
              Budapest
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="landing-card rounded-2xl shadow-2xl p-6 space-y-4 border backdrop-blur-sm">
          {/* Invited Guest - Primary Action */}
          <Link href="/register/request-link" className="group block">
            <div className="landing-btn rounded-xl p-4 border hover:border-accent-teal/50 dark:hover:border-teal-400/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl landing-icon-teal flex items-center justify-center flex-shrink-0
                              group-hover:scale-105 transition-transform shadow-inner">
                  <Envelope weight="duotone" size={26} className="text-accent-teal dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="font-semibold landing-text-primary group-hover:text-accent-teal dark:group-hover:text-teal-400 transition-colors text-lg">
                    Invited Guest
                  </h2>
                  <p className="landing-text-secondary text-sm">
                    Request your registration link
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Apply to Attend */}
          <Link href="/apply" className="group block">
            <div className="landing-btn rounded-xl p-4 border hover:border-amber-500/50 dark:hover:border-amber-400/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl landing-icon-amber flex items-center justify-center flex-shrink-0
                              group-hover:scale-105 transition-transform shadow-inner">
                  <PaperPlaneTilt weight="duotone" size={26} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="font-semibold landing-text-primary group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-lg">
                    Apply to Attend
                  </h2>
                  <p className="landing-text-secondary text-sm">
                    Submit your attendance request
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Divider */}
          <div className="border-t landing-divider my-3"></div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/pwa" className="group block">
              <div className="landing-btn rounded-xl p-4 border text-center hover:border-accent-teal/40 dark:hover:border-teal-400/40">
                <QrCode weight="duotone" size={28} className="landing-text-tertiary group-hover:text-accent-teal dark:group-hover:text-teal-400 transition-colors mx-auto mb-2" />
                <span className="text-sm font-medium landing-text-secondary group-hover:text-accent-teal dark:group-hover:text-teal-400 transition-colors">
                  Gala App
                </span>
              </div>
            </Link>

            <Link href="/admin/login" className="group block">
              <div className="landing-btn rounded-xl p-4 border text-center hover:border-slate-400/50 dark:hover:border-zinc-500/50">
                <GearSix weight="duotone" size={28} className="landing-text-tertiary group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors mx-auto mb-2" />
                <span className="text-sm font-medium landing-text-secondary group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors">
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-sm landing-footer hover:text-accent-teal dark:hover:text-teal-400 transition-colors"
          >
            <Info weight="duotone" size={18} />
            Need Help?
          </Link>
        </div>

        {/* Subtle branding */}
        <p className="text-center landing-footer text-xs mt-6">
          © 2026 BBJ Events • Executive Excellence
        </p>
      </div>
    </div>
  );
}
