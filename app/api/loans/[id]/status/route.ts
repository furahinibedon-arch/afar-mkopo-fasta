import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server-auth';
import { logError, logInfo } from '@/lib/logger';

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } });
}

async function authGuard(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  return jwt.verify(token, secret) as { role: string; userId: string };
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = await authGuard(request);
    if (decoded instanceof NextResponse) return decoded;
    if (!['ADMIN', 'LOAN_OFFICER', 'DIRECTOR', 'CEO'].includes(decoded.role))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = params;
    const { status, notes } = await request.json();
    logInfo('Updating loan status', { loanId: id, newStatus: status, userId: decoded.userId });

    const loan = await prisma.loan.findUnique({
      where: { id },
      select: { id: true, amount: true, totalAmount: true, status: true }
    });
    if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

    // Balance check before disbursement
    if (status === 'DISBURSED') {
      const logs = await prisma.financialLog.findMany();
      const balance = logs.reduce((s, l) => l.type === 'CREDIT' ? s + Number(l.amount) : s - Number(l.amount), 0);
      if (Number(loan.amount) > balance)
        return NextResponse.json({ error: Insufficient balance. Available: TZS , Required: TZS  }, { status: 400 });
    }

    // Update loan status
    const updated = await prisma.loan.update({
      where: { id },
      data: { status, disbursedAt: status === 'DISBURSED' ? new Date() : undefined },
    });

    // Audit log
    await prisma.auditLog.create({
      data: { action: 'LOAN_STATUS_CHANGED', userId: decoded.userId, loanId: id, oldStatus: loan.status, newStatus: status, details: notes || null }
    });
    await prisma.staffAction.create({
      data: { loanId: id, staffId: decoded.userId, action: STATUS_CHANGE:, notes: notes || null }
    });

    // AUTO-DEDUCT balance when loan is DISBURSED
    if (status === 'DISBURSED') {
      await prisma.financialLog.create({
        data: {
          type: 'DEBIT',
          amount: loan.amount,
          description: Loan disbursed to borrower [ID: ],
          reference: LOAN_DISBURSE_,
        }
      });
      await prisma.transaction.create({
        data: { loanId: id, type: 'DISBURSEMENT', amount: loan.amount, description: 'Loan disbursed' }
      });
      logInfo('Balance deducted on disbursement', { loanId: id, amount: Number(loan.amount) });
    }

    // Full repayment: add balance credit
    if (status === 'REPAID') {
      const alreadyLogged = await prisma.financialLog.findFirst({ where: { reference: LOAN_REPAY_ } });
      if (!alreadyLogged) {
        await prisma.financialLog.create({
          data: {
            type: 'CREDIT',
            amount: loan.totalAmount,
            description: Full loan repayment received [ID: ],
            reference: LOAN_REPAY_,
          }
        });
      }
      await prisma.transaction.upsert({
        where: { id: epay_ },
        create: { loanId: id, type: 'REPAYMENT', amount: loan.totalAmount, description: 'Full repayment' },
        update: {}
      });
    }

    logInfo('Loan status updated', { loanId: id, status });
    return NextResponse.json(updated);
  } catch (e) {
    logError(e, { endpoint: '/api/loans/[id]/status', loanId: params.id });
    return NextResponse.json({ error: 'Failed to update status', details: (e as Error).message }, { status: 500 });
  }
}
