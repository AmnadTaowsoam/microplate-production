// /src/app/images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime'; // ติดตั้งด้วย `yarn add mime`

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('path');
  if (!filePath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  // ปลด encoding และแปลง backslashes
  const rel = decodeURIComponent(filePath).replace(/\\/g, '/');
  // ตัวอย่าง: ไฟล์จริงอยู่ที่ D:\temp\[rel]
  const fullFilePath = path.join('D:', rel);

  try {
    const data = await fs.promises.readFile(fullFilePath);
    const contentType = mime.getType(fullFilePath) || 'application/octet-stream';
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
