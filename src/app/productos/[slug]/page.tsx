import { notFound } from 'next/navigation';
import pool, { initDatabase } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProductBySlug(slug: string) {
  await initDatabase();
  const [rows] = await pool.query('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]);
  const productsArray = rows as any[];
  if (productsArray.length === 0) return null;
  const prod = productsArray[0];
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
    problemFactors: typeof prod.problemFactors === 'string' ? JSON.parse(prod.problemFactors) : prod.problemFactors || [],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product || !product.isAvailable) {
    return {
      title: 'Producto no encontrado | Zamvaro Ecuador',
    };
  }

  // Si la url de la imagen no es absoluta, Vercel/Next la resolverá relativamente
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
