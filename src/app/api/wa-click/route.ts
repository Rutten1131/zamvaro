import { NextResponse } from 'next/server';
import pool, { initDatabase } from '@/lib/db';

// GET /api/wa-click?product=slug&name=NombreProducto&section=howto&wa=593939243014&msg=Hola...
// Registra el clic en BD y redirige al WhatsApp con el mensaje natural
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get('product') || 'desconocido';
    const productName = searchParams.get('name') || 'Producto';
    const section = searchParams.get('section') || 'pagina';
    const waNumber = searchParams.get('wa') || '593939243014';
    const message = searchParams.get('msg') || `Hola! Me interesa ${productName}. ¿Cómo puedo pedirlo?`;

    // Registrar el clic en la base de datos (de forma no bloqueante)
    try {
      await initDatabase();
      await pool.query(
        'INSERT INTO wa_clicks (product_slug, product_name, section) VALUES (?, ?, ?)',
        [productSlug, productName, section]
      );
    } catch (dbError) {
      // No bloquear la redirección si falla el registro
      console.error('Error registrando clic WA:', dbError);
    }

    // Redirigir directamente a WhatsApp con el mensaje natural
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    return NextResponse.redirect(waUrl, { status: 302 });
  } catch (error) {
    // Si algo falla, redirigir igual al WhatsApp genérico
    return NextResponse.redirect('https://wa.me/593939243014', { status: 302 });
  }
}
