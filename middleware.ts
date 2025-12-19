import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware for authentication and CSRF protection
 *
 * - Protects /admin routes (except /admin/login)
 * - Validates CSRF for mutating API requests
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF Protection for API routes (mutating methods only)
  // Skip CSRF for NextAuth routes - it handles its own CSRF protection
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (!safeMethods.includes(request.method)) {
      const isValidCsrf = validateCsrf(request);
      if (!isValidCsrf) {
        return NextResponse.json(
          { error: 'CSRF validation failed' },
          { status: 403 }
        );
      }
    }
  }

  // Auth protection for admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control for staff users
    const userRole = token.role as string;
    if (userRole === 'staff') {
      // Staff can only access these admin routes
      const staffAllowedPaths = [
        '/admin',           // Dashboard (will show limited view)
        '/admin/checkin-log',
        '/admin/help',
      ];

      // Check if current path is allowed for staff
      const isAllowed = staffAllowedPaths.some(allowed => {
        if (allowed === '/admin') {
          return pathname === '/admin';
        }
        return pathname.startsWith(allowed);
      });

      if (!isAllowed) {
        // Redirect staff to check-in scanner (their main tool)
        return NextResponse.redirect(new URL('/checkin', request.url));
      }
    }
  }

  // Auth protection for check-in route (staff and admin both can access)
  if (pathname.startsWith('/checkin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/**
 * Validate CSRF by checking Origin/Referer headers
 *
 * Security notes:
 * - Stripe webhooks are exempt (they come from Stripe's servers without browser headers)
 * - PWA API calls require valid origin or CSRF token
 * - Server-side fetches (internal Next.js) are allowed through
 */
function validateCsrf(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const { pathname } = request.nextUrl;

  // Stripe webhooks are exempt - they use signature verification instead
  if (pathname === '/api/stripe/webhook') {
    return true;
  }

  // For server-side requests (no origin/referer), check for internal markers
  // X-Next-Internal is set by Next.js for server component fetches
  if (!origin && !referer) {
    // Allow internal Next.js fetches
    const isNextInternal = request.headers.get('x-nextjs-data') !== null;
    if (isNextInternal) {
      return true;
    }
    // For API routes that need browser interaction, require origin
    // This blocks direct curl/Postman requests to sensitive endpoints
    if (pathname.startsWith('/api/admin/') ||
        pathname.startsWith('/api/registration/') ||
        pathname.startsWith('/api/checkin/')) {
      return false;
    }
    // Allow other server-side calls
    return true;
  }

  // Use X-Forwarded-Host if behind reverse proxy (Nginx), otherwise use nextUrl.host
  // SECURITY: Nginx MUST set X-Forwarded-Host to prevent spoofing attacks.
  // The proxy_set_header X-Forwarded-Host $host; directive overwrites any client-sent header.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const expectedHost = forwardedHost || request.headers.get('host') || request.nextUrl.host;

  // Check origin header
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host === expectedHost) {
        return true;
      }
    } catch {
      return false;
    }
  }

  // Fall back to referer check
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host === expectedHost) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/((?!login).*)',
    '/checkin/:path*',
    '/api/:path*',
  ],
};
