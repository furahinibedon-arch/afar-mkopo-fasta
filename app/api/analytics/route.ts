
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server-auth';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    },
  });
}

export async function GET() {
  try {
    const loans = await prisma.loan.findMany({ include: { borrower: true } });
    const totalDisbursed = loans.reduce((sum, loan) => sum + Number(loan.amount), 0);
    const totalRepaid = loans.filter(l => l.status === 'REPAID').reduce((sum, loan) => sum + Number(loan.totalAmount), 0);
    const outstandingBalance = loans.filter(l => l.status !== 'REPAID').reduce((sum, loan) => sum + Number(loan.totalAmount), 0);
    const activeBorrowers = new Set(loans.map(l => l.borrowerId)).size;

    return NextResponse.json({
      totalDisbursed,
      totalRepaid,
      outstandingBalance,
      activeBorrowers,
      loans
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
