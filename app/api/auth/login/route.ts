
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
    const { email, password } = await request.json();
    logInfo('Login attempt', { email });
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: true,
        profilePictureUrl: true,
        borrowerProfile: true,
        receivedDocuments: {
          where: { isActive: true }
        }
      }
    });

    if (!user) {
      logInfo('Login failed: User not found', { email });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      logInfo('Login failed: User account inactive', { userId: user.id, email });
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logInfo('Login failed: Incorrect password', { userId: user.id, email });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'afar-mkopo-fasta-secret',
      { expiresIn: '24h' }
    );

    logInfo('Login successful', { userId: user.id, email });
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ token, user: safeUser });
  } catch (error) {
    logError(error, { endpoint: '/api/auth/login', method: 'POST' });
    return NextResponse.json({ error: 'Login failed', details: (error as Error).message }, { status: 500 });
  }
}
