import { NextResponse } from 'next/server';
import { getCurrentUser, prisma } from '@/lib/server-auth';
import bcrypt from 'bcrypt';

const VALID_ROLES = new Set(['BORROWER', 'LOAN_OFFICER', 'ADMIN', 'DIRECTOR', 'CEO']);

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
  // Always verify live role from DB, not from token
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (currentUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { email, firstName, lastName, phone, role, isActive, password } = await request.json();
  const data: any = {};
  if (email) data.email = email;
  if (firstName) data.firstName = firstName;
  if (lastName) data.lastName = lastName;
  if (phone) data.phone = phone;
  if (role) {
    if (!VALID_ROLES.has(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    // Prevent the last admin from demoting themselves
    if (params.id === currentUser.id && role !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'You must keep at least one admin account.' }, { status: 400 });
      }
    }
    data.role = role;
  }
  if (typeof isActive === 'boolean') data.isActive = isActive;
  if (password) data.password = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, role: true, isActive: true, createdAt: true,
      },
    });
    return NextResponse.json(user);
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Email or phone already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: e.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (currentUser.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'User deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Delete failed' }, { status: 500 });
  }
}
