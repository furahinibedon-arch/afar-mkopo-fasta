
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1] || '';
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const decoded = jwt.verify(token, secret) as { role: string };
    if (decoded.role === 'BORROWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const [disbAgg, repaidAgg, loans, overdueRepayments] = await Promise.all([
      prisma.transaction.aggregate({ where: { type: 'DISBURSEMENT' }, _sum: { amount: true } }) as any,
      prisma.transaction.aggregate({ where: { type: 'REPAYMENT' }, _sum: { amount: true }) as any,
      prisma.loan.findMany({ orderBy: { createdAt: 'desc' }, include: { borrower: { select: { firstName: true, lastName: true, email: true, phone: true } }, repayments: true }),
      prisma.repayment.findMany({ where: { status: 'OVERDUE' }, include: { loan: { include: { borrower: { select: { firstName: true, lastName: true } } } }),
    ]);
    return NextResponse.json({ totalDisbursed: disbAgg._sum?.amount || 0, totalRepaid: repaidAgg._sum?.amount || 0, loans, overdueRepayments });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
