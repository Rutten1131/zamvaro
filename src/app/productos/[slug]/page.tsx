'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Componentes del detalle de producto
import ProductHero from '@/components/product/ProductHero';
import ProductProblem from '@/components/product/ProductProblem';
import ProductFeatures from '@/components/product/ProductFeatures';
import ProductGuarantee from '@/components/product/ProductGuarantee';
import ProductTestimonials from '@/components/product/ProductTestimonials';
import ProductComparison from '@/components/product/ProductComparison';
import ProductStats from '@/components/product/ProductStats';
import ProductHowTo from '@/components/product/ProductHowTo';
import ProductFAQ from '@/components/product/ProductFAQ';
import StickyWhatsApp from '@/components/product/StickyWhatsApp';
import AnnouncementBar from '@/components/product/AnnouncementBar';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Convierte un color hex a RGB */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

/** Aclara u oscurece un hex: factor positivo = aclara, negativo = oscurece */
function adjustHex(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  const r = clamp(rgb.r + factor);
  const g = clamp(rgb.g + factor);
  const b = clamp(rgb.b + factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Genera el bloque <style> con las variables CSS del producto */
function buildColorStyle(primaryColor: string): string {
  const color = primaryColor || '#9B046F';
  const rgb = hexToRgb(color);
  const light = adjustHex(color, 40);
  const dark = adjustHex(color, -40);
  const r = rgb?.r ?? 155;
  const g = rgb?.g ?? 4;
  const b = rgb?.b ?? 111;

  return `
    :root {
      --color-primary: ${color};
      --color-primary-light: ${light};
      --color-primary-dark: ${dark};
      --color-secondary: ${dark};
      --color-border: rgba(${r},${g},${b},0.15);
      --color-gradient-hero: linear-gradient(135deg, #2E2A39 0%, ${dark} 50%, ${color} 100%);
      --color-gradient-cta: linear-gradient(135deg, ${color} 0%, ${dark} 100%);
      --color-gradient-card: linear-gradient(145deg, rgba(${r},${g},${b},0.08), rgba(${r},${g},${b},0.05));
      --shadow-md: 0 8px 32px rgba(${r},${g},${b},0.12);
      --shadow-lg: 0 20px 60px rgba(${r},${g},${b},0.18);
      --shadow-card: 0 4px 20px rgba(46,42,57,0.08), 0 1px 4px rgba(${r},${g},${b},0.06);
    }
    .btn-primary { box-shadow: 0 4px 20px rgba(${r},${g},${b},0.35) !important; }
    .btn-primary:hover { box-shadow: 0 8px 30px rgba(${r},${g},${b},0.45) !important; }
    .section-badge {
      background: rgba(${r},${g},${b},0.08) !important;
      border-color: rgba(${r},${g},${b},0.2) !important;
    }
    ::selection { background: rgba(${r},${g},${b},0.2); }
    ::-webkit-scrollbar-thumb { background: ${color}; }
  `;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/products?slug=${resolvedParams.slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
      })
      .catch((err) => {
        console.error('Error loading product:', err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              border: '4px solid rgba(139, 92, 246, 0.1)',
              borderRadius: '50%',
              borderTop: '4px solid var(--color-primary)',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ fontWeight: 600, color: 'var(--color-text-light)' }}>Cargando detalles del producto...</p>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product || !product.isAvailable) {
    notFound();
  }

  // Inyectar el color personalizado del producto como variables CSS
  const primaryColor: string = product.primaryColor || '#9B046F';
  const colorStyle = buildColorStyle(primaryColor);

  return (
    <>
      {/* Override de variables CSS para este producto */}
      <style dangerouslySetInnerHTML={{ __html: colorStyle }} />

      <Navbar />
      {/* Barra de anuncio fija — desaparece al bajar */}
      <AnnouncementBar whatsappNumber={product.whatsappNumber} />
      <main style={{ background: 'var(--color-bg)' }}>
        {/* 1. Hero Section (Images, Bullets, Buy CTA) */}
        <ProductHero product={product} />

        {/* 2. Problem & Solution */}
        <ProductProblem product={product} />

        {/* 3. Features & Grid */}
        <ProductFeatures product={product} />

        {/* 4. Trust Guarantee Banner */}
        <ProductGuarantee product={product} />

        {/* 5. Testimonials & Social Proof */}
        <ProductTestimonials product={product} />

        {/* 6. Comparison & Stats (Unified Section) */}
        <ProductComparison product={product} />

        {/* 7. Step by step instructions */}
        <ProductHowTo product={product} />

        {/* 9. Frequently Asked Questions */}
        <ProductFAQ product={product} />

        {/* 10. Floating sticky CTA button */}
        <StickyWhatsApp product={product} />
      </main>
      <Footer />
    </>
  );
}

