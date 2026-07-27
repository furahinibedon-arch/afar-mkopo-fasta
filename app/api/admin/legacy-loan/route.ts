import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/server-auth';

async function authGuard(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) throw Object.assign(new Error('No token'), { status: 401 });
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  return jwt.verify(token, secret) as { role: string; userId: string };
}

export async function POST(request: NextRequest) {
  try {
    const user = await authGuard(request);
    if (!['ADMIN', 'CEO', 'DIRECTOR'].includes(user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { borrowerId, outstandingAmount, description, repaymentType, originalDate } = await request.json();
    if (!borrowerId) return NextResponse.json({ error: 'Borrower required' }, { status: 400 });
    if (!outstandingAmount || Number(outstandingAmount) <= 0)
      return NextResponse.json({ error: 'Outstanding amount required' }, { status: 400 });
    const borrower = await prisma.user.findUnique({ where: { id: borrowerId } });
    if (!borrower) return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    const amount = Number(outstandingAmount);
    const repPeriod = repaymentType === 'DAILY' ? 30 : repaymentType === 'WEEKLY' ? 14 : 1;
    const loan = await prisma.loan.create({
      data: {
        borrowerId,
        requestedAmount: amount,
        amount: amount,
        interestRate: 0,
        repaymentPeriod: repPeriod,
        totalAmount: amount,
        monthlyPayment: repPeriod > 1 ? Math.ceil(amount / repPeriod) : amount,
        status: 'DISBURSED',
        purpose: JSON.stringify({
          purpose: description || 'Legacy loan import',
          __appData: {
            repaymentType: repaymentType || 'MONTHLY',
            isLegacy: true,
            legacyNote: 'Imported. Interest included in outstanding amount.',
          }
        }),
        disbursedAt: originalDate ? new Date(originalDate) : new Date(),
      },
    });
    await prisma.staffAction.create({
      data: {
        loanId: loan.id,
        staffId: user.userId,
        action: 'LEGACY_IMPORT',
        notes: 'Legacy loan imported. Outstanding: TZS ' + amount.toLocaleString() + '. ' + (description || ''),
      },
    });
    return NextResponse.json({ loan, borrower }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: e.status || 500 });
  }
}