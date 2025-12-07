'use client';

import { useState, useEffect } from 'react';
import { Globe } from '@phosphor-icons/react';

export default function LanguageToggle() {
  const [language, setLanguage] = useState<'en' | 'hu'>('hu');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('admin-language') as 'en' | 'hu';
    if (stored && (stored === 'en' || stored === 'hu')) {
      setLanguage(stored);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'hu' ? 'en' : 'hu';
    setLanguage(newLang);
    localStorage.setItem('admin-language', newLang);
    window.location.reload(); // Reload to apply translations
  };

  if (!mounted) {
    return <div className="p-2 w-16 h-9" />;
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
      title={language === 'hu' ? 'Switch to English' : 'Váltás magyarra'}
    >
      <Globe size={18} weight="duotone" />
      <span className="uppercase">{language}</span>
    </button>
  );
}
