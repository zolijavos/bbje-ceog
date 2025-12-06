import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/services/email';
import { logInfo, logError } from '@/lib/utils/logger';

/**
 * POST /api/admin/applicants/[id]/reject
 *
 * Reject an applicant's application and optionally send them a notification email.
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const guestId = parseInt(id, 10);

    if (isNaN(guestId)) {
      return NextResponse.json({ error: 'Invalid applicant ID' }, { status: 400 });
    }

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

    // Send rejection email
    try {
      await sendEmail({
        to: applicant.email,
        subject: 'CEO Gala 2026 - Application Status Update',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4b5563;">Application Status Update</h1>
            <p>Dear ${applicant.name},</p>
            <p>Thank you for your interest in the <strong>CEO Gala 2026</strong>.</p>
            <p>After careful consideration, we regret to inform you that we are unable to accommodate your attendance request at this time due to limited capacity.</p>
            <p>We appreciate your understanding and hope to welcome you to future events.</p>
            <p>Best regards,<br>The CEO Gala Team</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">CEO Gala 2026 Registration System</p>
          </div>
        `,
        text: `Dear ${applicant.name},\n\nThank you for your interest in the CEO Gala 2026.\n\nAfter careful consideration, we regret to inform you that we are unable to accommodate your attendance request at this time due to limited capacity.\n\nWe appreciate your understanding and hope to welcome you to future events.\n\nBest regards,\nThe CEO Gala Team`,
      });

      // Log the email
      await prisma.emailLog.create({
        data: {
          guest_id: guestId,
          email_type: 'application_rejected',
          recipient: applicant.email,
          subject: 'CEO Gala 2026 - Application Status Update',
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
          subject: 'CEO Gala 2026 - Application Status Update',
          status: 'failed',
          error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
        },
      });
    }

    logInfo(`[REJECT] Application rejected: ${applicant.email} (ID: ${guestId})${reason ? ` - Reason: ${reason}` : ''}`);

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
