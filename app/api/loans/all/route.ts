
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server-auth';
import { logError } from '@/lib/logger';

async function auth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '').trim() || '';
  if (!token) throw Object.assign(new Error('No token'), { status: 401 });
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  return jwt.verify(token, secret) as { userId: string; role: string };
}

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
    const { role } = await auth(request);
    if (!['ADMIN', 'LOAN_OFFICER'].includes(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const loans = await prisma.loan.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        requestedAmount: true,
        amount: true,
        interestRate: true,
        repaymentPeriod: true,
        totalAmount: true,
        monthlyPayment: true,
        status: true,
        purpose: true,
        disbursedAt: true,
        createdAt: true,
        updatedAt: true,
        borrowerId: true,
        borrower: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            email: true, 
            phone: true,
            borrowerProfile: true 
          } 
        },
        repayments: true
      }
    });
    const parsedLoans = loans.map(l => {
      let appData = {};
      try {
        const parsed = JSON.parse(l.purpose || '{}');
        if (parsed.__appData) {
          appData = parsed.__appData;
          return { 
            ...l, 
            purpose: parsed.purpose || '', 
            applicationData: appData,
            borrowerProfile: l.borrower?.borrowerProfile,
            borrower: { ...l.borrower, borrowerProfile: undefined }
          };
        }
      } catch (e) { }
      return {
        ...l,
        borrowerProfile: l.borrower?.borrowerProfile,
        borrower: { ...l.borrower, borrowerProfile: undefined }
      };
    });
    return NextResponse.json(parsedLoans);
  } catch (e: any) {
    console.error('ERROR IN /api/loans/all GET:', JSON.stringify(e, null, 2));
    logError(e, { endpoint: '/api/loans/all', method: 'GET' });
    return NextResponse.json({ error: e.message || 'Failed to get loans', details: (e as Error).message }, { status: e.status || 500 });
  }
}
