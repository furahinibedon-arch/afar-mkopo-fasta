import { NextResponse } from 'next/server';
import { getCurrentUser, prisma } from '@/lib/server-auth';

const CAN_VIEW_USERS = new Set(['ADMIN', 'DIRECTOR', 'CEO']);

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    },
  });
}

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!CAN_VIEW_USERS.has(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      phone: true, role: true, isActive: true, createdAt: true,
    },
  });
  return NextResponse.json(users);
}
