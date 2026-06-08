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

interface PageProps {
  params: Promise<{ slug: string }>;
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

  return (
    <>
      <Navbar />
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

