import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

type Props = { params: Promise<{ filename: string }> };

const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export async function GET(_request: Request, { params }: Props) {
  const { filename } = await params;
  const safeName = path.basename(filename);
  const filePath = path.join(process.cwd(), 'data', 'uploads', safeName);

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(file, {
      headers: {
        'content-type': contentTypes[path.extname(safeName).toLowerCase()] ?? 'application/octet-stream',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
