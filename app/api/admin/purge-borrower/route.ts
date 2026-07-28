import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/server-auth';

async function guard(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) throw Object.assign(new Error('No token'), { status: 401 });
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  const user = jwt.verify(token, secret) as { role: string; userId: string };
  if (!['ADMIN','CEO','DIRECTOR'].includes(user.role))
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  return user;
}

export async function DELETE(request: NextRequest) {
  try {
    await guard(request);
    const { searchParams } = request.nextUrl;
    const borrowerId = searchParams.get('id') || '';
    if (!borrowerId) return NextResponse.json({ error: 'id query param required' }, { status: 400 });

    const borrower = await prisma.user.findUnique({ where: { id: borrowerId } });
    if (!borrower) return NextResponse.json({ error: 'Borrower not found' }, { status: 404 });

    const loans = await prisma.loan.findMany({ where: { borrowerId } });
    const loanIds = loans.map((l: any) => l.id);

    if (loanIds.length === 0) {
      return NextResponse.json({ success: true, message: 'No loans found for this borrower.', deleted: { loans: 0, financialLogs: 0 } });
    }

    const repayments = await prisma.repayment.findMany({ where: { loanId: { in: loanIds } } });
    const repaymentIds = repayments.map((r: any) => r.id);

    const allRefs = [
      ...loanIds.map((id: string) => 'LOAN_DISBURSE_' + id),
      ...loanIds.map((id: string) => 'LOAN_REPAY_' + id),
      ...repaymentIds.map((id: string) => 'REPAY_INSTALLMENT_' + id),
    ];

    const { count: logsDeleted } = await prisma.financialLog.deleteMany({
      where: { reference: { in: allRefs } },
    });

    const { count: loansDeleted } = await prisma.loan.deleteMany({
      where: { borrowerId },
    });

    return NextResponse.json({
      success: true,
      borrower: borrower.firstName + ' ' + borrower.lastName,
      deleted: { loans: loansDeleted, financialLogs: logsDeleted },
      message: 'All loans and balance entries for ' + borrower.firstName + ' ' + borrower.lastName + ' have been removed. Balance restored.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: e.status || 500 });
  }
}