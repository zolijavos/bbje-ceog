import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { generateMagicLinkHash } from '@/lib/auth/magic-link';
import { sendEmail } from '@/lib/services/email';
import { logInfo, logError } from '@/lib/utils/logger';

/**
 * POST /api/admin/applicants/[id]/approve
 *
 * Approve an applicant and send them a magic link to complete registration.
 * Changes guest_type from 'applicant' to 'paying_single' and status to 'invited'.
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

    // Generate magic link for the approved applicant
    const { hash, expiresAt } = generateMagicLinkHash(applicant.email);

    // Update the applicant to become a paying guest
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        guest_type: 'paying_single', // Approved applicants become paying guests
        registration_status: 'invited',
        magic_link_hash: hash,
        magic_link_expires_at: expiresAt,
      },
    });

    // Send approval email with magic link
    try {
      const magicLinkUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register?code=${hash}&email=${encodeURIComponent(applicant.email)}`;

      await sendEmail({
        to: applicant.email,
        subject: 'Your CEO Gala 2026 Application Has Been Approved!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #d97706;">Great News!</h1>
            <p>Dear ${applicant.name},</p>
            <p>We are pleased to inform you that your application to attend the <strong>CEO Gala 2026</strong> has been approved!</p>
            <p>Please complete your registration by clicking the link below:</p>
            <p style="margin: 30px 0;">
              <a href="${magicLinkUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Complete Registration
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 72 hours. If you did not apply for this event, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">CEO Gala 2026 Registration System</p>
          </div>
        `,
        text: `Dear ${applicant.name},\n\nYour application to attend the CEO Gala 2026 has been approved!\n\nPlease complete your registration at: ${magicLinkUrl}\n\nThis link will expire in 72 hours.`,
      });

      // Log the email
      await prisma.emailLog.create({
        data: {
          guest_id: guestId,
          email_type: 'application_approved',
          recipient: applicant.email,
          subject: 'Your CEO Gala 2026 Application Has Been Approved!',
          status: 'sent',
        },
      });
    } catch (emailError) {
      logError('[APPROVE] Failed to send approval email:', emailError);
      // Don't fail the approval if email fails, log the error
      await prisma.emailLog.create({
        data: {
          guest_id: guestId,
          email_type: 'application_approved',
          recipient: applicant.email,
          subject: 'Your CEO Gala 2026 Application Has Been Approved!',
          status: 'failed',
          error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
        },
      });
    }

    logInfo(`[APPROVE] Application approved: ${applicant.email} (ID: ${guestId})`);

    return NextResponse.json({
      success: true,
      message: 'Application approved successfully',
      guest: {
        id: updatedGuest.id,
        email: updatedGuest.email,
        name: updatedGuest.name,
        status: updatedGuest.registration_status,
      },
    });
  } catch (error) {
    logError('[APPROVE] Error approving application:', error);
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    );
  }
}
