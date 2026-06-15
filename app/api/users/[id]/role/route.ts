import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getCurrentUser, prisma } from '@/lib/server-auth';

const allowedRoles = new Set<UserRole>(['ADMIN', 'LOAN_OFFICER', 'BORROWER', 'DIRECTOR', 'CEO']);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { role } = await request.json();

  if (!allowedRoles.has(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  if (params.id === currentUser.id && role !== 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'You must keep at least one admin account.' },
        { status: 400 }
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}
