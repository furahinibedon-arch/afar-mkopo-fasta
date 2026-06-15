
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

export async function GET(
  request: NextRequest,
  { params }: { params: { borrowerId: string } }
) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const { userId, role } = jwt.verify(token, secret) as { userId: string; role: string };

    if (!['ADMIN', 'LOAN_OFFICER'].includes(role) && userId !== params.borrowerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const documents = await prisma.borrowerDocument.findMany({
      where: { borrowerId: params.borrowerId },
      include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (e) {
    logError(e, { endpoint: '/api/borrowers/[borrowerId]/documents', method: 'GET' });
    return NextResponse.json({ error: 'Failed to get documents', details: (e as Error).message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { borrowerId: string } }
) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const secret = process.env.JWT_SECRET || 'afar-mkopo-fasta-secret';
    const { userId, role } = jwt.verify(token, secret) as { userId: string; role: string };

    if (!['ADMIN', 'LOAN_OFFICER'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Validate allowed file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Create document in DB
    const document = await prisma.borrowerDocument.create({
      data: {
        borrowerId: params.borrowerId,
        uploadedById: userId,
        fileName: file.name,
        fileUrl: base64File,
        fileType: file.type,
        fileSize: file.size,
      },
      include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
    });

    logInfo('Borrower document uploaded', { documentId: document.id, borrowerId: params.borrowerId, uploadedBy: userId });

    return NextResponse.json(document);
  } catch (e) {
    logError(e, { endpoint: '/api/borrowers/[borrowerId]/documents', method: 'POST' });
    return NextResponse.json({ error: 'Failed to upload document', details: (e as Error).message }, { status: 500 });
  }
}
