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

/**
 * DELETE /api/admin/purge-borrower?name=Said+Shomari
 * Removes a borrower loan history and reverses all financial log entries tied to their loans.
 * Does NOT delete the user account itself.
 */
export async function DELETE(request: NextRequest) {
  try {
    await guard(request);
    const { searchParams } = request.nextUrl;
    const name = searchParams.get('name') || '';
    if (!name) return NextResponse.json({ error: 'name query param required' }, { status: 400 });

    const parts = name.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName  = parts.slice(1).join(' ') || '';

    // Find the borrower
    const borrower = await prisma.user.findFirst({
      where: {
        firstName: { contains: firstName, mode: 'insensitive' },
        lastName:  { contains: lastName,  mode: 'insensitive' },
        role: 'BORROWER',
      },
    });
    if (!borrower) return NextResponse.json({ error: 'Borrower not found: ' + name }, { status: 404 });

    // Get all their loans
    const loans = await prisma.loan.findMany({ where: { borrowerId: borrower.id } });
    const loanIds = loans.map(l => l.id);

    if (loanIds.length === 0) {
      return NextResponse.json({ message: 'No loans found for ' + name, deleted: { loans: 0, financialLogs: 0 } });
    }

    // Delete all FinancialLog entries linked to these loans:
    // - LOAN_DISBURSE_<loanId>
    // - REPAY_INSTALLMENT_<repaymentId> (repayments belong to these loans)
    // - LOAN_REPAY_<loanId>
    const repayments = await prisma.repayment.findMany({ where: { loanId: { in: loanIds } } });
    const repaymentIds = repayments.map(r => r.id);

    // Build all the reference patterns to delete
    const disbursementRefs = loanIds.map(id => 'LOAN_DISBURSE_' + id);
    const repayRefs        = loanIds.map(id => 'LOAN_REPAY_' + id);
    const instalmentRefs   = repaymentIds.map(id => 'REPAY_INSTALLMENT_' + id);
    const allRefs          = [...disbursementRefs, ...repayRefs, ...instalmentRefs];

    const { count: logsDeleted } = await prisma.financialLog.deleteMany({
      where: { reference: { in: allRefs } },
    });

    // Delete the loans (cascades to repayments, transactions, staffActions, auditLogs)
    const { count: loansDeleted } = await prisma.loan.deleteMany({
      where: { borrowerId: borrower.id },
    });

    return NextResponse.json({
      success: true,
      borrower: borrower.firstName + ' ' + borrower.lastName,
      deleted: {
        loans: loansDeleted,
        financialLogs: logsDeleted,
        repaymentsCascaded: repaymentIds.length,
      },
      message: 'All loans and financial log entries for ' + name + ' have been removed. Balance restored.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: e.status || 500 });
  }
}