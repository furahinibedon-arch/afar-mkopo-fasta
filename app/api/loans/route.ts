
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

async function auth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '').trim() || '';
  if (!token) throw Object.assign(new Error('No token'), { status: 401 });
  const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
  return jwt.verify(token, secret) as { userId: string; role: string };
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth(request);
    logInfo('Fetching loans for user', { userId });
    const loans = await prisma.loan.findMany({ where: { borrowerId: userId }, orderBy: { createdAt: 'desc' }, include: { repayments: true } });
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
  } catch (e: any) {
    logError(e, { endpoint: '/api/loans', method: 'GET' });
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth(request);
    logInfo('Creating loan for user', { userId });
    const {
      loanAmount, amount, interestRate = 20, repaymentPeriod = 30, loanPurpose, purpose,
      firstName, lastName, phone, nin, dateOfBirth, gender, maritalStatus,
      address, country, region, district, houseNumber, spouseName,
      businessName, businessLocation, businessSince,
      ...rest
    } = await request.json();
    const amt = Number(loanAmount || amount || 0);
    const rate = Number(interestRate);
    const period = Number(repaymentPeriod);
    const total = amt * (1 + rate / 100);
    const monthly = total / period;
    const purposeText = loanPurpose || purpose || '';
    const purposeField = JSON.stringify({ purpose: purposeText, __appData: rest });

    try {
      if (nin && dateOfBirth && address && region && district) {
        const profileData = {
          userId,
          nin,
          dateOfBirth: new Date(dateOfBirth),
          address,
          country: country || 'Tanzania',
          region,
          district,
          gender,
          maritalStatus,
          houseNumber,
          spouseName,
          businessName,
          businessLocation,
          businessSince
        };
        await prisma.borrowerProfile.upsert({
          where: { userId },
          update: profileData,
          create: profileData
        });
        logInfo('Updated borrower profile', { userId });
      }
    } catch (profileError) {
      logError(profileError, { userId, context: 'borrower profile update' });
      // Don't fail the loan submission because of profile error
    }

    const loan = await prisma.loan.create({
      data: {
        borrowerId: userId,
        amount: amt,
        interestRate: rate,
        repaymentPeriod: period,
        totalAmount: total,
        monthlyPayment: monthly,
        purpose: purposeField
      }
    });
    logInfo('Loan created successfully', { loanId: loan.id, userId });
    return NextResponse.json(loan, { status: 201 });
  } catch (e: any) {
    logError(e, { endpoint: '/api/loans', method: 'POST' });
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}
