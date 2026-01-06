import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth, parseIdParam, type RouteContext } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/services/email';
import { renderTemplate } from '@/lib/services/email-templates';
import { logInfo, logError } from '@/lib/utils/logger';

/**
 * POST /api/admin/applicants/[id]/reject
 *
 * Reject an applicant's application and optionally send them a notification email.
 */

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;
    const guestId = idResult.id;

    // Parse request body for optional rejection reason
    let reason: string | null = null;
    try {
      const body = await request.json();
      reason = body.reason || null;
    } catch {
      // No body provided, that's fine
    }

    // Find the applicant
    const applicant = await prisma.guest.findUnique({
      where: { id: guestId },
    });

    if (!applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }

    if (applicant.guest_type !== 'applicant') {
      return NextResponse.json(
        { error: 'This guest is not an applicant' },
        { status: 400 }
      );
    }

    if (applicant.registration_status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'This application has already been processed' },
        { status: 400 }
      );
    }

    // Update the applicant status to rejected
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        registration_status: 'rejected',
        rejection_reason: reason,
      },
    });

    // Send rejection email using customizable template
    try {
      const rendered = await renderTemplate('applicant_rejection', {
        guestName: applicant.name,
        rejectionReason: reason || undefined,
      });

      await sendEmail({
        to: applicant.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });

      // Log the email
      await prisma.emailLog.create({
        data: {
          guest_id: guestId,
          email_type: 'application_rejected',
          recipient: applicant.email,
          subject: rendered.subject,
          status: 'sent',
        },
      });
    } catch (emailError) {
      logError('[REJECT] Failed to send rejection email:', emailError);
      // Don't fail the rejection if email fails, log the error
      await prisma.emailLog.create({
        data: {
          guest_id: guestId,
          email_type: 'application_rejected',
          recipient: applicant.email,
          subject: 'BBJ Events 2026 - Application Status',
          status: 'failed',
          error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
        },
      });
    }

    logInfo(`[REJECT] Application rejected: ${applicant.email} (ID: ${guestId})${reason ? ` - Reason: ${reason}` : ''}`);

    // Invalidate the applicants page cache to refresh the list
    revalidatePath('/admin/applicants');

    return NextResponse.json({
      success: true,
      message: 'Application rejected',
      guest: {
        id: updatedGuest.id,
        email: updatedGuest.email,
        name: updatedGuest.name,
        status: updatedGuest.registration_status,
      },
    });
  } catch (error) {
    logError('[REJECT] Error rejecting application:', error);
    return NextResponse.json(
      { error: 'Failed to reject application' },
      { status: 500 }
    );
  }
}
