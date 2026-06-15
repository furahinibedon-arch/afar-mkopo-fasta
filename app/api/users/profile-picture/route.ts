
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

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const { userId } = jwt.verify(token, secret) as { userId: string; role: string };

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Convert file to base64 for simple storage (no Cloudinary needed)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Update user profile with base64 image
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePictureUrl: base64Image },
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
        profilePictureUrl: true,
        borrowerProfile: true,
        receivedDocuments: {
          where: { isActive: true }
        }
      }
    });

    logInfo('Profile picture uploaded successfully', { userId });

    return NextResponse.json({
      user: { ...updatedUser, password: undefined },
    });
  } catch (e) {
    logError(e, { endpoint: '/api/users/profile-picture', method: 'POST' });
    return NextResponse.json({ error: 'Failed to upload profile picture', details: (e as Error).message }, { status: 500 });
  }
}
