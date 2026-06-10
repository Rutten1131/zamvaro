import { notFound } from 'next/navigation';
import pool, { initDatabase } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Cache en memoria: evita golpear la BD en cada visita al mismo producto ──
// Expira cada 60 segundos para reflejar cambios del admin sin reiniciar el server.
const productCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 60_000; // 60 segundos

async function getProductBySlug(slug: string) {
  // 1. Servir desde cache si aún es válido
  const cached = productCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // 2. Inicializar DB (solo la primera vez, gracias al flag en db.ts)
  await initDatabase();

  const [rows] = await pool.query('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]);
  const productsArray = rows as any[];
  if (productsArray.length === 0) return null;

  const prod = productsArray[0];
  const result = {
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
    problemFactors: typeof prod.problemFactors === 'string' ? JSON.parse(prod.problemFactors) : prod.problemFactors || [],
  };

  // 3. Guardar en cache
  productCache.set(slug, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

  return result;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product || !product.isAvailable) {
    return {
      title: 'Producto no encontrado | Zamvaro Ecuador',
    };
  }

  const ogImageUrl = product.image || '/hero-zamvaro.jpg';

  return {
    title: `${product.name} | Zamvaro Ecuador`,
    description: product.subtitle || `Compra ${product.name} en Zamvaro Ecuador con pago contraentrega.`,
    openGraph: {
      title: `${product.name} | Zamvaro Ecuador`,
      description: product.subtitle || `Compra ${product.name} en Zamvaro Ecuador con pago contraentrega.`,
      images: [
        {
          url: ogImageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: 'website',
      locale: 'es_EC',
      siteName: 'Zamvaro Ecuador',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Zamvaro Ecuador`,
      description: product.subtitle || `Compra ${product.name} en Zamvaro Ecuador con pago contraentrega.`,
      images: [ogImageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product || !product.isAvailable) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
