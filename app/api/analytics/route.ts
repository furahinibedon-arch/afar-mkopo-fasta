import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

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
