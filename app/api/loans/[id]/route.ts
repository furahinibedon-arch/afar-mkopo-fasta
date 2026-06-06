import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json();
    const loan = await prisma.loan.update({
      where: { id: params.id },
      data: { status: status as any },
    });
    return NextResponse.json(loan);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update loan' }, { status: 500 });
  }
}
