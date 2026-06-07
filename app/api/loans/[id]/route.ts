import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server-auth';
import { logError, logInfo } from '@/lib/logger';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    },
  });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const decoded = jwt.verify(token, secret) as { role: string; userId: string };
    if (!['ADMIN', 'LOAN_OFFICER'].includes(decoded.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { id } = params;
    const { amount, interestRate, repaymentPeriod } = await request.json();
    
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    
    // Only allow updating pending loans
    if (loan.status !== 'PENDING') return NextResponse.json({ error: 'Loan cannot be modified' }, { status: 400 });

    // Use provided values or existing ones
    const newAmount = amount !== undefined ? Number(amount) : Number(loan.amount);
    const newInterestRate = interestRate !== undefined ? Number(interestRate) : Number(loan.interestRate);
    const newRepaymentPeriod = repaymentPeriod !== undefined ? Number(repaymentPeriod) : Number(loan.repaymentPeriod);
    
    // Recalculate total and monthly payment
    const totalAmount = newAmount * (1 + newInterestRate / 100);
    const monthlyPayment = totalAmount / newRepaymentPeriod;

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        amount: newAmount,
        interestRate: newInterestRate,
        repaymentPeriod: newRepaymentPeriod,
        totalAmount: totalAmount,
        monthlyPayment: monthlyPayment
      }
    });

    logInfo('Loan amount updated', { loanId: id, userId: decoded.userId });
    return NextResponse.json(updatedLoan);
  } catch (e) {
    logError(e, { endpoint: '/api/loans/[id]', loanId: params.id, method: 'PATCH' });
    return NextResponse.json({ error: 'Failed to update loan', details: (e as Error).message }, { status: 500 });
  }
}
