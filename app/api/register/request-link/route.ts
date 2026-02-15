/**
 * Request Magic Link API
 *
 * POST /api/register/request-link
 *
 * Sends a new magic link email to a guest.
 * Used when a guest's link has expired or they need a new one.
 *
 * Security layers:
 * - reCAPTCHA v3 verification (bot protection)
 * - IP-based rate limiting (10 requests/hour per IP)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendMagicLinkEmail } from '@/lib/services/email';
import { logError, logWarn } from '@/lib/utils/logger';
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/rate-limit';

interface RequestLinkBody {
  email: string;
  reason?: 'expired' | 'resend';
  recaptchaToken?: string;
}

/**
 * Verify reCAPTCHA v3 token with Google
 */
async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Skip verification if no secret key configured (dev environment)
  if (!secretKey) {
    logWarn('[RECAPTCHA]', 'No secret key configured, skipping verification');
    return { success: true, score: 1.0 };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    // reCAPTCHA v3 returns a score (0.0 - 1.0), we accept 0.5 or higher (Google recommended minimum)
    if (data.success && data.score >= 0.5) {
      return { success: true, score: data.score };
    }

    logWarn('[RECAPTCHA]', `Verification failed: score=${data.score}, errors=${data['error-codes']}`);
    return { success: false, score: data.score };
  } catch (error) {
    logError('[RECAPTCHA]', error);
    // SECURITY: Fail closed on network errors - require stricter IP rate limiting instead
    // This prevents attackers from bypassing reCAPTCHA by blocking Google's API
    logWarn('[RECAPTCHA]', 'Network error during verification - failing closed for security');
    return { success: false, score: 0 };
  }
}

/**
 * Validate IP address format (IPv4 or IPv6)
 */
function isValidIP(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified - covers most cases)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  if (ipv4Pattern.test(ip)) {
    // Validate IPv4 octets are 0-255
    const octets = ip.split('.').map(Number);
    return octets.every(octet => octet >= 0 && octet <= 255);
  }

  return ipv6Pattern.test(ip);
}

/**
 * Get client IP address from request headers
 * SECURITY: Only trust proxy headers from nginx (configured in nginx.conf)
 * Validates IP format to prevent header injection attacks
 */
function getClientIP(request: NextRequest): string {
  // x-real-ip is more reliable when nginx is configured correctly
  // It should contain only the original client IP
  const realIP = request.headers.get('x-real-ip');
  if (realIP && isValidIP(realIP.trim())) {
    return realIP.trim();
  }

  // Fallback to x-forwarded-for (take the rightmost non-private IP if multiple)
  // Note: nginx should be configured to set this correctly
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (client IP when nginx is properly configured)
    const firstIP = forwardedFor.split(',')[0].trim();
    if (isValidIP(firstIP)) {
      return firstIP;
    }
    logWarn('[REQUEST-LINK]', `Invalid IP format in x-forwarded-for: ${firstIP}`);
  }

  // Fallback - should not happen behind nginx
  logWarn('[REQUEST-LINK]', 'Could not determine client IP from headers');
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestLinkBody = await request.json();
    const { email, reason, recaptchaToken } = body;

    // === SECURITY LAYER 1: reCAPTCHA verification ===
    const isProduction = process.env.NODE_ENV === 'production';
    const recaptchaConfigured = !!process.env.RECAPTCHA_SECRET_KEY;

    // In production with reCAPTCHA configured, token is required
    if (isProduction && recaptchaConfigured && !recaptchaToken) {
      logWarn('[REQUEST-LINK]', 'Missing reCAPTCHA token in production');
      return NextResponse.json(
        { success: false, error: 'Security verification required. Please try again.' },
        { status: 403 }
      );
    }

    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.success) {
        return NextResponse.json(
          { success: false, error: 'Security verification failed. Please try again.' },
          { status: 403 }
        );
      }
    }

    // === SECURITY LAYER 2: IP-based rate limiting ===
    const clientIP = getClientIP(request);
    const ipRateLimitKey = `magic-link-ip:${clientIP}`;
    const ipRateLimit = await checkRateLimit(ipRateLimitKey, RATE_LIMITS.MAGIC_LINK_IP);

    if (!ipRateLimit.allowed) {
      logWarn('[REQUEST-LINK]', `IP rate limit exceeded for ${clientIP}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests from your network. Please try again later.',
          retryAfter: Math.ceil((ipRateLimit.resetAt.getTime() - Date.now()) / 1000 / 60),
        },
        { status: 429 }
      );
    }

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email cím megadása kötelező' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Érvénytelen email formátum' },
        { status: 400 }
      );
    }

    // Find guest by email with magic link expiry info for server-side verification
    const guest = await prisma.guest.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        magic_link_expires_at: true,
      },
    });

    if (!guest) {
      // Don't reveal whether email exists (security)
      // But return success with a generic message
      return NextResponse.json({
        success: true,
        message: 'If the email address is on our guest list, you will receive your invitation link shortly.',
      });
    }

    // Send magic link (rate limiting removed per business requirement)
    const result = await sendMagicLinkEmail(guest.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Email sending error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ha az email cím szerepel a vendéglistán, hamarosan megérkezik az új meghívó.',
    });
  } catch (error) {
    logError('[REQUEST-LINK]', error);

    return NextResponse.json(
      { success: false, error: 'Server error occurred' },
      { status: 500 }
    );
  }
}
