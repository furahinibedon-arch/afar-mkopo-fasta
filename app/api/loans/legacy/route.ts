import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server-auth';

async function authGuard(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) throw Object.assign(new Error('No token'), { status: 401 });
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  return jwt.verify(token, secret) as { role: string; userId: string };
}

/**
 * POST /api/loans/legacy
 * Import a pre-existing (legacy) loan for a customer who was lending
 * before the system was set up.
 *
 * Key difference from normal loans:
 *  - Loan is created directly as DISBURSED (no approval flow needed)
 *  - NO FinancialLog DEBIT is written (money already went out before system)
 *  - Outstanding balance is recorded as-is so repayments work normally
 *  - Interest rate = 0 by default (already baked into outstanding amount)
 */
export async function POST(request: NextRequest) {
  try {
    const decoded = await authGuard(request);
    if (!['ADMIN', 'CEO', 'DIRECTOR'].includes(decoded.role))
      return NextResponse.json({ error: 'Only ADMIN, CEO or DIRECTOR can import legacy loans' }, { status: 403 });

    const {
      borrowerId,
      outstandingAmount,
      notes,
      disbursedAt,
    } = await request.json();

    if (!borrowerId) return NextResponse.json({ error: 'Borrower required' }, { status: 400 });
    if (!outstandingAmount || Number(outstandingAmount) <= 0)
      return NextResponse.json({ error: 'Outstanding amount must be greater than 0' }, { status: 400 });

    const borrower = await prisma.user.findUnique({ where: { id: borrowerId } });
    if (!borrower) return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });
    if (borrower.role !== 'BORROWER')
      return NextResponse.json({ error: 'Selected user is not a borrower' }, { status: 400 });

    const amount = Number(outstandingAmount);
    const disbDate = disbursedAt ? new Date(disbursedAt) : new Date();

    // Create loan directly as DISBURSED — no financial log debit
    const loan = await prisma.loan.create({
      data: {
        borrowerId,
        requestedAmount: amount,
        amount: amount,
        interestRate: 0,           // interest already baked into outstanding amount
        repaymentPeriod: 1,
        totalAmount: amount,       // what they owe right now
        monthlyPayment: amount,
        status: 'DISBURSED',
        disbursedAt: disbDate,
        purpose: JSON.stringify({
          purpose: notes || 'Legacy loan import',
          __appData: {
            repaymentType: 'MONTHLY',
            isLegacy: true,
            notes: notes || '',
          }
        }),
      },
    });

    // Record staff action
    await prisma.staffAction.create({
      data: {
        loanId: loan.id,
        staffId: decoded.userId,
        action: 'LEGACY_IMPORT',
        notes: `Legacy loan imported. Outstanding: TZS ${amount.toLocaleString()}. ${notes || ''}`,
      },
    });

    return NextResponse.json({ success: true, loan }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: e.status || 500 });
  }
}