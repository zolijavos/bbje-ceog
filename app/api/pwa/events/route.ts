/**
 * PWA Events SSE Endpoint
 *
 * GET /api/pwa/events
 *
 * Server-Sent Events stream for real-time notifications to PWA.
 * Sends check-in events with table assignment info.
 *
 * Security considerations:
 * - Requires valid PWA session (JWT in cookie)
 * - One connection per authenticated guest
 *
 * TODO: Rate Limiting
 * Consider adding rate limiting for production:
 * - Max 5 connections per guest (prevents tab spam)
 * - Use upstash/ratelimit or similar for serverless
 * - Example: @upstash/ratelimit with sliding window
 *
 * Current risk: Without rate limiting, a malicious user could
 * open many SSE connections. Mitigated by:
 * - Requiring valid session (can't spam unauthenticated)
 * - Browser naturally limits concurrent connections per domain (~6)
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyPWASession } from '@/lib/services/pwa-auth';
import { subscribeGuest, BroadcastEvent } from '@/lib/services/event-broadcaster';
import { logError } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify PWA session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('pwa_session')?.value;

    if (!sessionToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    const session = verifyPWASession(sessionToken);
    if (!session) {
      return new Response('Invalid session', { status: 401 });
    }

    const guestId = session.guestId;

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        const connectMessage = `data: ${JSON.stringify({ type: 'CONNECTED', guestId })}\n\n`;
        controller.enqueue(encoder.encode(connectMessage));

        // Send heartbeat every 30 seconds to keep connection alive
        const heartbeatInterval = setInterval(() => {
          try {
            const heartbeat = `data: ${JSON.stringify({ type: 'HEARTBEAT', timestamp: Date.now() })}\n\n`;
            controller.enqueue(encoder.encode(heartbeat));
          } catch {
            clearInterval(heartbeatInterval);
          }
        }, 30000);

        // Subscribe to events for this guest
        const unsubscribe = subscribeGuest(guestId, (event: BroadcastEvent) => {
          try {
            const message = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (error) {
            logError('[SSE] Error sending event:', error);
          }
        });

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          unsubscribe();
          try {
            controller.close();
          } catch {
            // Already closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    logError('[SSE] Error setting up stream:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
