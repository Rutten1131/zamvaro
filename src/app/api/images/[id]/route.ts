import { NextResponse } from 'next/server';
import pool from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      return new NextResponse('ID inválido', { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT filename, mimetype, data FROM product_images WHERE id = ?',
      [numId]
    );

    const images = rows as any[];
    if (!images || images.length === 0) {
      return new NextResponse('Imagen no encontrada', { status: 404 });
    }

    const image = images[0];
    const buffer = image.data;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': image.mimetype || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${image.filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error serving image:', error);
    return new NextResponse('Error interno', { status: 500 });
  }
}
