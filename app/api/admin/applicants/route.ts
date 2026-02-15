/**
 * Admin Applicants API
 *
 * GET /api/admin/applicants
 *
 * List all applicants (guests with guest_type = 'applicant').
 * Supports optional status filter via query parameter.
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';
import { getFullName } from '@/lib/utils/name';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // 'pending_approval', 'rejected', or null for all

    // Build where clause
    const whereClause: Record<string, unknown> = {
      guest_type: 'applicant',
    };

    if (statusFilter && ['pending_approval', 'rejected'].includes(statusFilter)) {
      whereClause.registration_status = statusFilter;
    }

    // Fetch applicants
    const applicants = await prisma.guest.findMany({
      where: whereClause,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        title: true,
        phone: true,
        company: true,
        position: true,
        dietary_requirements: true,
        seating_preferences: true,
        registration_status: true,
        rejection_reason: true,
        applied_at: true,
        created_at: true,
      },
      orderBy: [
        { registration_status: 'asc' }, // pending_approval first
        { applied_at: 'desc' },
      ],
    });

    // Transform for API response
    const applicantData = applicants.map((a) => ({
      id: a.id,
      name: getFullName(a.first_name, a.last_name),
      first_name: a.first_name,
      last_name: a.last_name,
      email: a.email,
      title: a.title,
      phone: a.phone,
      company: a.company,
      position: a.position,
      dietaryRequirements: a.dietary_requirements,
      seatingPreferences: a.seating_preferences,
      status: a.registration_status,
      rejectionReason: a.rejection_reason,
      appliedAt: a.applied_at?.toISOString() || a.created_at.toISOString(),
    }));

    // Count by status
    const counts = {
      total: applicantData.length,
      pending: applicantData.filter((a) => a.status === 'pending_approval').length,
      rejected: applicantData.filter((a) => a.status === 'rejected').length,
    };

    return NextResponse.json({
      applicants: applicantData,
      counts,
    });
  } catch (error) {
    logError('[APPLICANTS] Error fetching applicants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applicants' },
      { status: 500 }
    );
  }
}
