import { NextResponse } from 'next/server';
import pool, { initDatabase } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

// Asegurar que la base de datos se inicialice al menos una vez al cargar la API
let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export async function GET(request: Request) {
  try {
    await ensureDb();
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    let query = 'SELECT * FROM products ORDER BY id DESC';
    let params: any[] = [];

    if (slug) {
      query = 'SELECT * FROM products WHERE slug = ? LIMIT 1';
      params = [slug];
    }

    const [rows] = await pool.query(query, params);
    const productsArray = rows as any[];

    // Parsear los campos JSON antes de enviarlos
    const parsedProducts = productsArray.map((prod) => {
      return {
        ...prod,
        isAvailable: Boolean(prod.isAvailable),
        images: typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images || [],
        bullets: typeof prod.bullets === 'string' ? JSON.parse(prod.bullets) : prod.bullets || [],
        features: typeof prod.features === 'string' ? JSON.parse(prod.features) : prod.features || [],
        testimonials: typeof prod.testimonials === 'string' ? JSON.parse(prod.testimonials) : prod.testimonials || [],
        comparison: typeof prod.comparison === 'string' ? JSON.parse(prod.comparison) : prod.comparison || [],
        stats: typeof prod.stats === 'string' ? JSON.parse(prod.stats) : prod.stats || [],
        steps: typeof prod.steps === 'string' ? JSON.parse(prod.steps) : prod.steps || [],
        faqs: typeof prod.faqs === 'string' ? JSON.parse(prod.faqs) : prod.faqs || [],
      };
    });

    if (slug) {
      if (parsedProducts.length === 0) {
        return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
      }
      return NextResponse.json(parsedProducts[0]);
    }

    return NextResponse.json(parsedProducts);
  } catch (error: any) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json({ message: 'Error al obtener productos', error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();

    // Verificar si es administrador
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      subtitle,
      hookText,
      category,
      price,
      originalPrice,
      tag,
      emoji,
      image,
      images,
      imageProblem,
      imageFeatures,
      imageHowTo,
      isAvailable,
      slug,
      bullets,
      features,
      testimonials,
      comparisonTitle,
      comparisonOursLabel,
      comparisonTheirsLabel,
      comparison,
      stats,
      steps,
      faqs,
      guaranteeText,
      whatsappNumber,
    } = body;

    if (!name || !slug) {
      return NextResponse.json({ message: 'Nombre y Slug son requeridos' }, { status: 400 });
    }

    // Insertar en la BD
    const query = `
      INSERT INTO products (
        name, subtitle, hookText, category, price, originalPrice, tag, emoji, image, images,
        imageProblem, imageFeatures, imageHowTo,
        isAvailable, slug, bullets, features, testimonials, comparisonTitle, comparisonOursLabel,
        comparisonTheirsLabel, comparison, stats, steps, faqs, guaranteeText, whatsappNumber
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      name,
      subtitle || null,
      hookText || null,
      category || null,
      price || '$0.00',
      originalPrice || null,
      tag || null,
      emoji || null,
      image || null,
      JSON.stringify(images || []),
      imageProblem || null,
      imageFeatures || null,
      imageHowTo || null,
      isAvailable ? 1 : 0,
      slug,
      JSON.stringify(bullets || []),
      JSON.stringify(features || []),
      JSON.stringify(testimonials || []),
      comparisonTitle || null,
      comparisonOursLabel || null,
      comparisonTheirsLabel || null,
      JSON.stringify(comparison || []),
      JSON.stringify(stats || []),
      JSON.stringify(steps || []),
      JSON.stringify(faqs || []),
      guaranteeText || null,
      whatsappNumber || null,
    ]);

    const insertId = (result as any).insertId;

    return NextResponse.json({ success: true, message: 'Producto creado exitosamente', id: insertId });
  } catch (error: any) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json({ message: 'Error al crear producto', error: error.message }, { status: 500 });
  }
}
