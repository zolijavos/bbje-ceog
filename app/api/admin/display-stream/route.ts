/**
 * Display Stream SSE Endpoint
 *
 * GET /api/admin/display-stream
 *
 * Server-Sent Events stream for real-time check-in updates
 * on the large-screen seating display. Admin-only.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { subscribeDisplay, DisplayCheckinEvent } from '@/lib/services/event-broadcaster';
import { logError, logInfo } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }
    if ((session.user as { role?: string }).role !== 'admin') {
      return new Response('Forbidden', { status: 403 });
    }

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Subscribe to display events
        const unsubscribe = subscribeDisplay((event: DisplayCheckinEvent) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          } catch (error) {
            logError('[DISPLAY-SSE] Error sending event:', error);
          }
        });

        // Keepalive ping every 30 seconds (SSE comment — does NOT trigger onmessage)
        const keepalive = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': ping\n\n'));
          } catch {
            clearInterval(keepalive);
          }
        }, 30000);

        // Cleanup on client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(keepalive);
          unsubscribe();
          try {
            controller.close();
          } catch {
            // Already closed
          }
          logInfo('[DISPLAY-SSE] Client disconnected');
        });

        logInfo('[DISPLAY-SSE] Client connected');
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    logError('[DISPLAY-SSE] Error setting up stream:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
