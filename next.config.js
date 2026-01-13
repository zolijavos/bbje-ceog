/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Disable ETags for simpler caching control
  generateEtags: false,

  // Disable powered-by header for security
  poweredByHeader: false,

  // Let Nginx handle all cache headers
  // This prevents conflicting headers between Next.js and Nginx
};

module.exports = nextConfig;
