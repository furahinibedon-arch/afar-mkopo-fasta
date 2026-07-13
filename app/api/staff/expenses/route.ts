import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/server-auth';

async function authGuard(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) throw Object.assign(new Error('No token'), { status: 401 });
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  return jwt.verify(token, secret) as { role: string; userId: string };
}

export async function GET(request: NextRequest) {
  try {
    const user = await authGuard(request);
    if (!['ADMIN', 'CEO', 'DIRECTOR'].includes(user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const expenses = await prisma.financialLog.findMany({
      where: { reference: { startsWith: 'STAFF_EXPENSE_' } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(expenses);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authGuard(request);
    if (!['ADMIN', 'LOAN_OFFICER', 'CEO', 'DIRECTOR'].includes(user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { amount, description, category } = await request.json();
    if (!amount || Number(amount) <= 0)
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });
    if (!description || String(description).trim().length < 3)
      return NextResponse.json({ error: 'Description required' }, { status: 400 });
    const staffUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { firstName: true, lastName: true },
    });
    const staffName = staffUser ? staffUser.firstName + ' ' + staffUser.lastName : 'Staff';
    const log = await prisma.financialLog.create({
      data: {
        type: 'DEBIT',
        amount: Number(amount),
        description: '[' + (category || 'General') + '] ' + description + ' — by ' + staffName,
        reference: 'STAFF_EXPENSE_' + user.userId + '_' + Date.now(),
      },
    });
    return NextResponse.json(log, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: e.status || 500 });
  }
}