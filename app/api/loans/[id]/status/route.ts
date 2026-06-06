
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const { role } = jwt.verify(token, secret) as { role: string };
    if (!['ADMIN', 'LOAN_OFFICER'].includes(role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { id } = params;
    const { status, notes } = await request.json();
    const updated = await prisma.loan.update({
      where: { id },
      data: { status, notes: notes || null }
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
