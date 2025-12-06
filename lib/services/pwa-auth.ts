/**
 * PWA Authentication Service
 *
 * Handles PWA session verification for SSE and other endpoints.
 */

import jwt from 'jsonwebtoken';
import { logError } from '@/lib/utils/logger';

const PWA_SESSION_SECRET = process.env.APP_SECRET;

export interface PWASession {
  guestId: number;
  registrationId: number;
  email: string;
}

/**
 * Verify and decode a PWA session token
 * @param sessionToken - JWT session token from pwa_session cookie
 * @returns Decoded session or null if invalid
 */
export function verifyPWASession(sessionToken: string): PWASession | null {
  if (!PWA_SESSION_SECRET) {
    logError('[PWA-AUTH] APP_SECRET not configured');
    return null;
  }

  try {
    const decoded = jwt.verify(sessionToken, PWA_SESSION_SECRET) as {
      guestId: number;
      registrationId: number;
      email: string;
      iat: number;
      exp: number;
    };

    return {
      guestId: decoded.guestId,
      registrationId: decoded.registrationId,
      email: decoded.email,
    };
  } catch {
    // Token is invalid or expired
    return null;
  }
}
