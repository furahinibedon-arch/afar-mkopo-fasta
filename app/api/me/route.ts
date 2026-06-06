
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const { userId } = jwt.verify(token, secret) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { borrowerProfile: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { password, ...safe } = user;
    return NextResponse.json(safe);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
