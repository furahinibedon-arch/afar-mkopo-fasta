import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server-auth';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });
    const role = adminCount === 0 ? UserRole.ADMIN : UserRole.BORROWER;

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, phone, role },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'afar-mkopo-fasta-secret',
      { expiresIn: '24h' }
    );

    return NextResponse.json({ token, user: { ...user, password: undefined } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
