/**
 * Admin Users API
 *
 * GET /api/admin/users - List all admin/staff users
 * POST /api/admin/users - Create new user
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';
import { getFullName } from '@/lib/utils/name';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['admin', 'staff']),
});

/**
 * GET - List all users
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    // Only admins can list users
    if (auth.session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            checkins: true,
          },
        },
      },
      orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
    });

    // Add computed name field for backwards compatibility
    const usersWithName = users.map(u => ({
      ...u,
      name: getFullName(u.first_name, u.last_name),
    }));

    return NextResponse.json({ users: usersWithName });
  } catch (error) {
    logError('[USERS] Error listing users:', error);
    return NextResponse.json(
      { error: 'Failed to list users' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new user
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    // Only admins can create users
    if (auth.session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, first_name, last_name, password, role } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        first_name,
        last_name,
        password_hash,
        role,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
      },
    });

    // Add computed name field for backwards compatibility
    const userWithName = {
      ...user,
      name: getFullName(user.first_name, user.last_name),
    };

    return NextResponse.json({ user: userWithName }, { status: 201 });
  } catch (error) {
    logError('[USERS] Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
