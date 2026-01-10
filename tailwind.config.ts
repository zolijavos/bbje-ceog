import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    // Set all border-radius to 0 by default (square corners)
    borderRadius: {
      none: '0',
      sm: '0',
      DEFAULT: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '9999px', // Keep full for circles/pills if needed
    },
    extend: {
      fontFamily: {
        // BBJ Events 2026 fonts (Inter primary)
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // BBJ Events 2026 - Navy palette
        // See docs/ux-design-specification.md for full specification

        // Primary brand colors (navy)
        primary: {
          DEFAULT: '#000D38',
          light: '#0A1A4A',
          lighter: '#1A2D5C',
          subtle: '#2A4070',
          dark: '#000820',
        },

        // Status colors (muted, brand-appropriate)
        status: {
          success: '#059669',  // emerald-600
          warning: '#D97706',  // amber-600
          error: '#DC2626',    // red-600
          info: '#000D38',     // navy (brand color)
        },

        // Neutral gray palette (BBJ Events 2026)
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },

        // Legacy aliases (for backwards compatibility)
        gala: {
          gold: '#000D38',      // Replaced with navy
          'gold-light': '#0A1A4A',
          'gold-dark': '#000820',
          navy: '#000D38',
          'navy-light': '#0A1A4A',
          charcoal: '#000D38',
          cream: '#F9FAFB',
          'warm-gray': '#6B7280',
        },

        // Accent (blue scale for visibility in both light and dark modes)
        accent: {
          DEFAULT: '#3B82F6',   // blue-500
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',       // Light mode: visible on dark, dark mode: bright
          500: '#3B82F6',
          600: '#2563EB',       // Light mode: primary accent
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          light: '#60A5FA',     // Legacy alias (blue-400)
          dark: '#1D4ED8',      // Legacy alias (blue-700)
          teal: '#2563EB',      // Legacy alias
          'teal-dark': '#1D4ED8',
          'teal-light': '#60A5FA',
        },
      },
      boxShadow: {
        // Minimal, elegant shadows (no 3D effects per BBJ design)
        'sm': '0 1px 2px 0 rgba(0,0,0,0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'md': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        // Card and panel shadows
        'panel': '0 1px 3px rgba(0,0,0,0.1)',
        'panel-hover': '0 4px 6px rgba(0,0,0,0.1)',
        // Legacy 3D shadows (kept for compatibility, prefer flat design)
        'btn-3d': '0 4px 0 0 #262626, 0 6px 8px -2px rgba(0,0,0,0.25)',
        'btn-3d-hover': '0 2px 0 0 #262626, 0 4px 6px -2px rgba(0,0,0,0.2)',
        'btn-3d-active': '0 0px 0 0 #262626, 0 2px 4px -2px rgba(0,0,0,0.15)',
      },
      animation: {
        'btn-press': 'btn-press 0.1s ease-out forwards',
        'field-focus': 'field-focus 0.2s ease-out forwards',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'btn-press': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(2px)' },
        },
        'field-focus': {
          '0%': { boxShadow: '0 0 0 0 rgba(0, 13, 56, 0)' },
          '100%': { boxShadow: '0 0 0 3px rgba(0, 13, 56, 0.15)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
