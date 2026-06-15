
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const { userId, role } = jwt.verify(token, secret) as { userId: string; role: string };

    // Check loan exists
    const loan = await prisma.loan.findUnique({ where: { id: params.id } });
    if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

    // Permission check
    if (!['ADMIN', 'LOAN_OFFICER'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { description } = await request.json();

    const document = await prisma.borrowerDocument.update({
      where: { id: params.documentId, loanId: params.id },
      data: { description },
      include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
    });

    logInfo('Loan document updated', { documentId: document.id, loanId: params.id, updatedBy: userId });

    return NextResponse.json(document);
  } catch (e) {
    logError(e, { endpoint: '/api/loans/[id]/documents/[documentId]', method: 'PATCH' });
    return NextResponse.json({ error: 'Failed to update document', details: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const { userId, role } = jwt.verify(token, secret) as { userId: string; role: string };

    // Check loan exists
    const loan = await prisma.loan.findUnique({ where: { id: params.id } });
    if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

    // Permission check
    if (!['ADMIN', 'LOAN_OFFICER'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.borrowerDocument.update({
      where: { id: params.documentId, loanId: params.id },
      data: { isActive: false },
    });

    logInfo('Loan document deleted (soft delete)', { documentId: params.documentId, loanId: params.id, deletedBy: userId });

    return NextResponse.json({ success: true });
  } catch (e) {
    logError(e, { endpoint: '/api/loans/[id]/documents/[documentId]', method: 'DELETE' });
    return NextResponse.json({ error: 'Failed to delete document', details: (e as Error).message }, { status: 500 });
  }
}

