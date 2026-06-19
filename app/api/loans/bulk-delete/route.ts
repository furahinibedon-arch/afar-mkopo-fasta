import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server-auth';
import { logError, logInfo } from '@/lib/logger';

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const decoded = jwt.verify(token, secret) as { role: string; userId: string };
    const allowed = ['ADMIN','DIRECTOR','CEO'];
    if (!allowed.includes(decoded.role))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const { ids } = body as { ids?: string[] };

    let loanIds: string[];
    if (ids && ids.length > 0) {
      loanIds = ids;
    } else {
      const all = await prisma.loan.findMany({ select: { id: true } });
      loanIds = all.map((l: any) => l.id);
    }

    if (loanIds.length === 0) return NextResponse.json({ deleted: 0 });

    await prisma.staffAction.deleteMany({ where: { loanId: { in: loanIds } } });
    await prisma.repayment.deleteMany({ where: { loanId: { in: loanIds } } });
    await prisma.borrowerDocument.deleteMany({ where: { loanId: { in: loanIds } } });
    const result = await prisma.loan.deleteMany({ where: { id: { in: loanIds } } });

    logInfo('Loans deleted', { count: result.count, userId: decoded.userId });
    return NextResponse.json({ deleted: result.count });
  } catch (e: any) {
    logError(e, { endpoint: '/api/loans/bulk-delete', method: 'DELETE' });
    return NextResponse.json({ error: 'Failed', details: e.message }, { status: e.status || 500 });
  }
}