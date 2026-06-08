import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import pool, { initDatabase } from '@/lib/db';

let dbReady = false;

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    if (!dbReady) {
      await initDatabase();
      dbReady = true;
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No se ha subido ningún archivo' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const mimetype = file.type || 'image/png';

    // Guardar en MySQL como BLOB
    const [result] = await pool.query(
      'INSERT INTO product_images (filename, mimetype, data) VALUES (?, ?, ?)',
      [filename, mimetype, buffer]
    );

    const insertId = (result as any).insertId;
    const url = `/api/images/${insertId}`;

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Error in /api/upload:', error);
    return NextResponse.json({ message: 'Error al subir imagen', error: error.message }, { status: 500 });
  }
}
