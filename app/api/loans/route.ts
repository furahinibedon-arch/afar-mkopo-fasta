import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const loans = await prisma.loan.findMany({
      include: { borrower: true },
    });
    return NextResponse.json(loans);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const loan = await prisma.loan.create({
      data: {
        amount: Number(data.loanAmount),
        interestRate: Number(data.interestRate) || 20,
        repaymentPeriod: 30,
        totalAmount: Number(data.loanAmount) * 1.2,
        monthlyPayment: Number(data.dailyPayment) || (Number(data.loanAmount) * 1.2 / 30),
        status: 'PENDING',
        purpose: data.loanPurpose || '',
        borrower: {
          connectOrCreate: {
            where: { email: data.phone + '@example.com' },
            create: {
              email: data.phone + '@example.com',
              password: '',
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              phone: data.phone || '',
            },
          },
        },
      },
      include: { borrower: true }
    });
    return NextResponse.json(loan);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create loan' }, { status: 500 });
  }
}
