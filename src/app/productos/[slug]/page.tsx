'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { products } from '@/data/products';
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
  const product = products.find((p) => p.slug === resolvedParams.slug);

  if (!product || !product.isAvailable) {
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

        {/* 6. Comparison Table */}
        <ProductComparison product={product} />

        {/* 7. Numbers/Stats Panel */}
        <ProductStats product={product} />

        {/* 8. Step by step instructions */}
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
