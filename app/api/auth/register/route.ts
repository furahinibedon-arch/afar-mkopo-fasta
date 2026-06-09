import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Register request body:', body);
    const { email, password, firstName, lastName, phone } = body;
    
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    logInfo('Registration attempt', { email, firstName, lastName, phone });
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });
    const role = adminCount === 0 ? UserRole.ADMIN : UserRole.BORROWER;

    // Check if email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? 'Email' : 'Phone number';
      return NextResponse.json({ error: `${conflictField} already registered` }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, phone, role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'afar-mkopo-fasta-secret',
      { expiresIn: '24h' }
    );

    logInfo('Registration successful', { userId: user.id, email, role });
    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    logError(error, { endpoint: '/api/auth/register', method: 'POST' });
    return NextResponse.json({ 
      error: 'Registration failed', 
      details: (error as Error).message,
      stack: (error as Error).stack 
    }, { status: 500 });
  }
}
