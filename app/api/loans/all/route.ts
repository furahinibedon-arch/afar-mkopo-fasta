
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const { role } = jwt.verify(token, secret) as { role: string };
    if (!['ADMIN', 'LOAN_OFFICER'].includes(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const loans = await prisma.loan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        borrower: { select: { firstName: true, lastName: true, email: true, phone: true } },
        borrowerProfile: true,
        repayments: true
      }
    });
    const parsedLoans = loans.map(l => {
      let appData = {};
      try {
        const parsed = JSON.parse(l.purpose || '{}');
        if (parsed.__appData) {
          appData = parsed.__appData;
          return { ...l, purpose: parsed.purpose || '', applicationData: appData };
        }
      } catch (e) { }
      return l;
    });
    return NextResponse.json(parsedLoans);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to get loans' }, { status: 500 });
  }
}
