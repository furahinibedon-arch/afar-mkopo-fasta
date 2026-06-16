import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/server-auth';

const VALID_ROLES = new Set(['BORROWER', 'LOAN_OFFICER', 'ADMIN', 'DIRECTOR', 'CEO']);

async function guardWrite(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '').trim() || '';
  if (!token) throw { status: 401, error: 'No token' };
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  const payload = jwt.verify(token, secret) as { role: string; userId: string };

  // Always re-fetch from DB so stale tokens don't bypass role changes
  const dbUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!dbUser || !dbUser.isActive) throw { status: 401, error: 'No token' };
  if (dbUser.role !== 'ADMIN') throw { status: 403, error: 'Admins only' };
  return dbUser;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await guardWrite(request);
    const { id } = params;
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
      if (id === admin.id && role !== 'ADMIN') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
        if (adminCount <= 1) {
          return NextResponse.json({ error: 'You must keep at least one admin account.' }, { status: 400 });
        }
      }
      data.role = role;
    }
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({ where: { id }, data });
    const { password: _, ...safe } = user;
    return NextResponse.json(safe);
  } catch (e: any) {
    console.error("PATCH /api/admin/users/[id] error:", e);
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Email or phone already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: e.error || e.message || 'Invalid token' }, { status: e.status || 401 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await guardWrite(request);
    const { id } = params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User deleted' });
  } catch (e: any) {
    console.error("DELETE /api/admin/users/[id] error:", e);
    return NextResponse.json({ error: e.error || e.message || 'Invalid token' }, { status: e.status || 401 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}
