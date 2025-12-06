import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
        // CEO Gala fonts
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-opensans)', 'Open Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        // CEO Gala - Monochrome palette (based on BBJ CEO Gala official branding)
        // See docs/DESIGN-GUIDE.md for full specification

        // Accent colors - USE SPARINGLY! See docs/DESIGN-GUIDE.md
        // Teal: primary accent (links, surnames, year badge, CTA)
        // Gold: secondary accent (awards, special highlights - rarely!)
        accent: {
          teal: '#00A0A0',
          'teal-dark': '#008585',
          'teal-light': '#33B3B3',
          gold: '#C4A24D',
          'gold-dark': '#B8923D',
          'gold-light': '#D4B86A',
        },

        // Status colors (muted, not vibrant)
        status: {
          success: '#059669',  // emerald-600
          warning: '#D97706',  // amber-600
          error: '#DC2626',    // red-600
          info: '#2563EB',     // blue-600
        },

        // Neutral gray palette (Tailwind default extended)
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },

        // Legacy aliases (for backwards compatibility during migration)
        // TODO: Migrate all usages to neutral/accent palette, then remove
        gala: {
          gold: '#C4A24D',
          'gold-light': '#D4B86A',
          'gold-dark': '#B8923D',
          navy: '#1F2937',       // Maps to neutral-800
          'navy-light': '#374151',
          charcoal: '#171717',   // Maps to neutral-900
          cream: '#FAFAFA',      // Maps to neutral-50
          'warm-gray': '#6B7280',
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
          '0%': { boxShadow: '0 0 0 0 rgba(0, 160, 160, 0)' },
          '100%': { boxShadow: '0 0 0 3px rgba(0, 160, 160, 0.15)' },
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
