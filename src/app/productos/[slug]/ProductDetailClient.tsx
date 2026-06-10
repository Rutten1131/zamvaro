'use client';

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
import OtherProductsSlider from '@/components/product/OtherProductsSlider';
import SalesPopWidget from '@/components/product/SalesPopWidget';

import { useEffect } from 'react';
import * as fpixel from '@/lib/fpixel';

interface ProductDetailClientProps {
  product: any;
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

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const primaryColor: string = product.primaryColor || '#9B046F';
  const colorStyle = buildColorStyle(primaryColor);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Capturar fbclid de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');

    if (fbclid) {
      const creationTime = Date.now();
      const fbcValue = `fb.1.${creationTime}.${fbclid}`;

      // Configurar cookie _fbc
      fpixel.setCookie('_fbc', fbcValue, 90);

      // Guardar en sessionStorage para respaldo
      sessionStorage.setItem('fbclid', fbclid);
      sessionStorage.setItem('_fbc', fbcValue);
    }

    // 2. Guardar respaldo de _fbp en sessionStorage si ya existe
    const existingFbp = fpixel.getCookie('_fbp');
    if (existingFbp) {
      sessionStorage.setItem('_fbp', existingFbp);
    }
  }, []);


  return (
    <>
      {/* Override de variables CSS para este producto */}
      <style dangerouslySetInnerHTML={{ __html: colorStyle }} />

      {/* Píxel de Facebook específico de este producto (si tiene uno configurado) */}
      {product.facebookPixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${product.facebookPixelId}');
              fbq('track', 'PageView');
              fbq('track', 'ViewContent', {
                content_name: '${(product.name || '').replace(/'/g, "\\'")}',
                content_ids: ['${product.id}'],
                content_type: 'product',
                value: ${parseFloat((product.price || '0').toString().replace(/[^0-9.]/g, '')) || 0},
                currency: 'USD'
              });
            `,
          }}
        />
      )}

      <Navbar isProductPage={true} whatsappNumber={product.whatsappNumber} />
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

        {/* 10. Other products slider */}
        <OtherProductsSlider currentProductSlug={product.slug} />

        {/* 11. Floating sticky CTA button */}
        <StickyWhatsApp product={product} />

        {/* 12. Sales pop-up social proof widget */}
        <SalesPopWidget product={product} />
      </main>
      <Footer />
    </>
  );
}
