import { MetadataRoute } from 'next';
import pool from '@/lib/db';

const BASE_URL = 'https://www.zamvaro.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/politica-de-privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terminos-y-condiciones`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Páginas dinámicas de productos desde la base de datos
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT slug, created_at FROM products WHERE isAvailable = 1'
    );
    productPages = rows
      .filter((p: any) => p.slug)
      .map((p: any) => ({
        url: `${BASE_URL}/productos/${p.slug}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
  } catch (err) {
    console.error('Error fetching products for sitemap:', err);
  }

  return [...staticPages, ...productPages];
}
