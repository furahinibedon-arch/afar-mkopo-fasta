import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/server-auth';

async function guard(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '').trim() || '';
  if (!token) throw { status: 401, error: 'No token' };
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  const user = jwt.verify(token, secret) as { role: string; userId: string };
  if (user.role === 'BORROWER') throw { status: 403, error: 'Forbidden' };
  return user;
}

export async function GET(request: NextRequest) {
  try {
    await guard(request);
    const logs = await prisma.financialLog.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json(logs);
  } catch (e: any) {
    return NextResponse.json({ error: e.error || 'Invalid token' }, { status: e.status || 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await guard(request);
    const { type, amount, description, reference } = await request.json();
    if (!['CREDIT', 'DEBIT'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    const log = await prisma.financialLog.create({
      data: {
        type,
        amount: parseFloat(amount),
        description: description || '',
        reference: reference || 'MANUAL',
      },
    });
    return NextResponse.json(log);
  } catch (e: any) {
    return NextResponse.json({ error: e.error || 'Invalid token' }, { status: e.status || 401 });
  }
}

/** DELETE /api/admin/balance  clear all financial logs (admin/CEO/director only) */
export async function DELETE(request: NextRequest) {
  try {
    const user = await guard(request);
    if (!['ADMIN','CEO','DIRECTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Only ADMIN, CEO or DIRECTOR can clear balance' }, { status: 403 });
    }
    const { count } = await prisma.financialLog.deleteMany({});
    return NextResponse.json({ success: true, deleted: count });
  } catch (e: any) {
    return NextResponse.json({ error: e.error || e.message || 'Failed' }, { status: e.status || 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}