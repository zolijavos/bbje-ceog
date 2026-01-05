import type { Metadata } from 'next';
import { Playfair_Display, Open_Sans } from 'next/font/google';
import './globals.css';
import { validateEnv } from '@/lib/utils/env';
import Footer from './components/Footer';
import MobileFooter from './components/MobileFooter';
import GlobalProviders from './components/GlobalProviders';

// Validate environment variables at startup
validateEnv();

// CEO Gala fonts
const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-opensans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'CEO Gala 2026 - Event Platform',
  description: 'CEO Gala 2026 event registration and check-in system',
  manifest: '/manifest.json',
  themeColor: '#1e293b',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CEO Gála',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/myforgelabs-logo.png',
    shortcut: '/myforgelabs-logo.png',
    apple: '/myforgelabs-logo.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" className={`${playfair.variable} ${openSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var resolved = theme;
                  if (theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(resolved);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans pb-10">
        <GlobalProviders>
          {children}
          <MobileFooter />
          <Footer />
        </GlobalProviders>
      </body>
    </html>
  );
}
