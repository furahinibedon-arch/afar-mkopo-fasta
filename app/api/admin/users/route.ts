import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/server-auth';

const CAN_VIEW_USERS = new Set(['ADMIN', 'DIRECTOR', 'CEO']);
const CAN_MANAGE_USERS = new Set(['ADMIN', 'DIRECTOR', 'CEO']);

async function verifyAndFetchUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '').trim() || '';
  if (!token) throw { status: 401, error: 'No token' };
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  const payload = jwt.verify(token, secret) as { role: string; userId: string };

  // Always re-fetch from DB so stale tokens do not bypass role changes
  const dbUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!dbUser || !dbUser.isActive) throw { status: 401, error: 'No token' };
  return dbUser;
}

async function guardRead(request: NextRequest) {
  const user = await verifyAndFetchUser(request);
  if (!CAN_VIEW_USERS.has(user.role)) throw { status: 403, error: 'Forbidden' };
  return user;
}

async function guardWrite(request: NextRequest) {
  const user = await verifyAndFetchUser(request);
  if (!CAN_MANAGE_USERS.has(user.role)) throw { status: 403, error: 'Admins only' };
  return user;
}

export async function GET(request: NextRequest) {
  try {
    await guardRead(request);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, isActive: true, createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (e: any) {
    console.error('GET /api/admin/users error:', e);
    return NextResponse.json({ error: e.error || 'Invalid token' }, { status: e.status || 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await guardWrite(request);
    const { email, password, firstName, lastName, phone, role = 'BORROWER' } = await request.json();
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, firstName, lastName, phone, role },
    });
    const { password: _, ...safe } = user;
    return NextResponse.json(safe, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/admin/users error:', e);
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Email or phone already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: e.error || 'Invalid token' }, { status: e.status || 401 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}
