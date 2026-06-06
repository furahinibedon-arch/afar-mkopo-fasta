
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
    const { role } = jwt.verify(token, secret) as { role: string; userId: string };
    if (!['ADMIN', 'LOAN_OFFICER'].includes(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { id } = params;
    const { status, notes } = await request.json();
    logInfo('Updating loan status', { loanId: id, newStatus: status, userId: jwt.decode(token)?.userId });
    const updated = await prisma.loan.update({
      where: { id },
      data: { status, notes: notes || null, disbursedAt: status === 'DISBURSED' ? new Date() : null }
    });
    logInfo('Loan status updated successfully', { loanId: id });
    return NextResponse.json(updated);
  } catch (e) {
    logError(e, { endpoint: '/api/loans/[id]/status', loanId: params.id, method: 'PATCH' });
    return NextResponse.json({ error: 'Failed to update status', details: (e as Error).message }, { status: 500 });
  }
}
