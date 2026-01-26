/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Disable ETags for simpler caching control
  generateEtags: false,

  // Disable powered-by header for security
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking (SAMEORIGIN allows same-domain iframes for testing)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // XSS Protection (legacy browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // HTTPS enforcement (1 year)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Content Security Policy - Stripe compatible
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: only same origin
              "default-src 'self'",
              // Scripts: self + Stripe + inline (for Next.js)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              // Styles: self + inline (for Tailwind/styled-jsx)
              "style-src 'self' 'unsafe-inline'",
              // Images: self + data URLs (for QR codes) + HTTPS
              "img-src 'self' data: https:",
              // Fonts: self + data URLs
              "font-src 'self' data:",
              // API connections: self + Stripe API
              "connect-src 'self' https://api.stripe.com",
              // Frames: Stripe checkout iframe + same-origin iframes
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              // Form submissions
              "form-action 'self'",
              // Base URI restriction
              "base-uri 'self'",
            ].join('; '),
          },
          // Permissions Policy - allow camera for QR scanner
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(), payment=(self)',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
