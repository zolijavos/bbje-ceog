import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth, parseIdParam, type RouteContext } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { generateMagicLinkHash } from '@/lib/auth/magic-link';
import { sendEmail } from '@/lib/services/email';
import { renderTemplate } from '@/lib/services/email-templates';
import { logInfo, logError } from '@/lib/utils/logger';
import { getFullName } from '@/lib/utils/name';

/**
 * POST /api/admin/applicants/[id]/approve
 *
 * Approve an applicant and send them a magic link to complete registration.
 * Changes guest_type from 'applicant' to 'paying_single' and status to 'invited'.
 */

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;
    const guestId = idResult.id;

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

    // Send approval email with magic link using customizable template
    try {
      const magicLinkUrl = `${process.env.APP_URL || 'https://ceogala.mflevents.space'}/register?code=${hash}&email=${encodeURIComponent(applicant.email)}`;

      const rendered = await renderTemplate('applicant_approval', {
        guestName: getFullName(applicant.first_name, applicant.last_name),
        magicLinkUrl,
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
          email_type: 'application_approved',
          recipient: applicant.email,
          subject: rendered.subject,
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
          subject: 'CEO Gála 2026 - Application Approved',
          status: 'failed',
          error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
        },
      });
    }

    logInfo(`[APPROVE] Application approved: ${applicant.email} (ID: ${guestId})`);

    // Invalidate the applicants page cache to refresh the list
    revalidatePath('/admin/applicants');
    // Also invalidate guests page since the approved applicant appears there
    revalidatePath('/admin/guests');

    return NextResponse.json({
      success: true,
      message: 'Application approved successfully',
      guest: {
        id: updatedGuest.id,
        email: updatedGuest.email,
        name: getFullName(updatedGuest.first_name, updatedGuest.last_name),
        first_name: updatedGuest.first_name,
        last_name: updatedGuest.last_name,
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
