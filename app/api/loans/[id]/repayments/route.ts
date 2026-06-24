import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server-auth';

async function authGuard(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) throw Object.assign(new Error('No token'), { status: 401 });
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  return jwt.verify(token, secret) as { role: string; userId: string };
}

/** GET /api/loans/[id]/repayments - list all installments for a loan */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authGuard(request);
    const repayments = await prisma.repayment.findMany({
      where: { loanId: params.id },
      orderBy: { dueDate: 'asc' },
    });
    return NextResponse.json(repayments);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}

/** POST /api/loans/[id]/repayments - record an installment payment */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = await authGuard(request);
    if (!['ADMIN', 'LOAN_OFFICER', 'DIRECTOR', 'CEO'].includes(decoded.role))
      throw Object.assign(new Error('Unauthorized'), { status: 403 });

    const { amount, paidDate, notes } = await request.json();
    if (!amount || Number(amount) <= 0)
      throw Object.assign(new Error('Valid amount required'), { status: 400 });

    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: { repayments: true },
    });
    if (!loan) throw Object.assign(new Error('Loan not found'), { status: 404 });
    if (!['DISBURSED', 'APPROVED'].includes(loan.status))
      throw Object.assign(new Error('Loan is not active'), { status: 400 });

    const paid = new Date(paidDate || new Date());

    // Create repayment record
    const repayment = await prisma.repayment.create({
      data: {
        loanId: params.id,
        amount: Number(amount),
        dueDate: paid,
        paidDate: paid,
        status: 'PAID',
      },
    });

    // Credit company balance
    await prisma.financialLog.create({
      data: {
        type: 'CREDIT',
        amount: Number(amount),
        description: Installment from  on loan ,
        reference: REPAY_INSTALLMENT_,
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        loanId: params.id,
        type: 'REPAYMENT',
        amount: Number(amount),
        description: notes || 'Installment payment',
      },
    });

    // Check if loan is now fully repaid
    const totalPaid = loan.repayments.reduce((s, r) => s + Number(r.amount), 0) + Number(amount);
    const isFullyPaid = totalPaid >= Number(loan.totalAmount);

    if (isFullyPaid) {
      await prisma.loan.update({
        where: { id: params.id },
        data: { status: 'REPAID' },
      });
    }

    return NextResponse.json({
      repayment,
      totalPaid,
      totalDue: Number(loan.totalAmount),
      remaining: Math.max(0, Number(loan.totalAmount) - totalPaid),
      fullyRepaid: isFullyPaid,
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: e.status || 500 });
  }
}
