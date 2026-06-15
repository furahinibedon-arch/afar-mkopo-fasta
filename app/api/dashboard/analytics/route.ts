
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server-auth';
import { logError } from '@/lib/logger';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const decoded = jwt.verify(token, secret) as { role: string };

    if (decoded.role === 'BORROWER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const disbAgg = await prisma.transaction.aggregate({
      where: { type: 'DISBURSEMENT' },
      _sum: { amount: true }
    });

    const repaidAgg = await prisma.transaction.aggregate({
      where: { type: 'REPAYMENT' },
      _sum: { amount: true }
    });

    const financialLogs = await prisma.financialLog.findMany({ orderBy: { createdAt: 'asc' } });
    const totalCredits = financialLogs.filter(l => l.type === 'CREDIT').reduce((sum, l) => sum + Number(l.amount), 0);
    const totalDebits = financialLogs.filter(l => l.type === 'DEBIT').reduce((sum, l) => sum + Number(l.amount), 0);
    const companyBalance = totalCredits - totalDebits;

    const loans = await prisma.loan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        borrower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        transactions: true,
        repayments: true
      }
    });

    const overdueRepayments = await prisma.repayment.findMany({
      where: { status: 'OVERDUE' },
      include: {
        loan: {
          include: {
            borrower: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      totalDisbursed: disbAgg._sum?.amount || 0,
      totalRepaid: repaidAgg._sum?.amount || 0,
      companyBalance,
      totalCredits,
      totalDebits,
      loans,
      overdueRepayments
    });
  } catch (e: any) {
    logError(e, { endpoint: '/api/dashboard/analytics' });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
