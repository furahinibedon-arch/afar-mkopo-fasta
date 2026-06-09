
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server-auth';
import cloudinary from '@/lib/cloudinary';
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with optimization
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        folder: 'profile-pictures',
        transformation: [{ width: 400, height: 400, crop: 'fill' }],
      }, (error, uploadResult) => {
        if (error) reject(error);
        else resolve(uploadResult);
      }).end(buffer);
    }) as { secure_url: string };

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePictureUrl: result.secure_url }
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
