import { NextResponse } from 'next/server';
import pool, { initDatabase } from '@/lib/db';

let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Correo electrónico no válido.' }, { status: 400 });
    }

    // Insertar el correo usando INSERT IGNORE para evitar errores por duplicado
    await pool.query(
      'INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)',
      [email.trim().toLowerCase()]
    );

    return NextResponse.json({ success: true, message: '¡Te has suscrito con éxito!' });
  } catch (error: any) {
    console.error('Error in POST /api/newsletter/subscribe:', error);
    return NextResponse.json({ error: 'Error al procesar la suscripción.' }, { status: 500 });
  }
}
