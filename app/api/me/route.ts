
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

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const { userId } = jwt.verify(token, secret) as { userId: string };
    logInfo('Fetching user data', { userId });
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { borrowerProfile: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!user.isActive) return NextResponse.json({ error: 'Account deactivated' }, { status: 403 });
    const { password, ...safe } = user;
    return NextResponse.json(safe);
  } catch (e) {
    logError(e, { endpoint: '/api/me', method: 'GET' });
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
