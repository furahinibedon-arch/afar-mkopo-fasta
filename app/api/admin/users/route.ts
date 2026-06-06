
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/server-auth';

async function guard(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '').trim() || '';
  if (!token) throw { status: 401, error: 'No token' };
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  const user = jwt.verify(token, secret) as { role: string; userId: string };
  if (user.role !== 'ADMIN') throw { status: 403, error: 'Admins only' };
  return user;
}

export async function GET(request: NextRequest) {
  try {
    await guard(request);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (e: any) {
    return NextResponse.json({ error: e.error || 'Invalid token' }, { status: e.status || 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await guard(request);
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
