'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Truck, RotateCcw, ShieldCheck, ShoppingBag, MapPin, Clock } from 'lucide-react';
import type { Product } from '@/data/products';
import CheckoutModal from './CheckoutModal';
import styles from './ProductHero.module.css';

interface ProductHeroProps {
  product: Product;
}

export default function ProductHero({ product }: ProductHeroProps) {
  const [currentImg, setCurrentImg] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const baseImages = product.images || [];
  const images = baseImages.length > 0 ? baseImages : [product.image || ''];

  const openCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCheckoutOpen(true);
    // Evento InitiateCheckout — igual que Shopify
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const price = parseFloat((product.price || '0').toString().replace(/[^0-9.]/g, '')) || 0;
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: product.name,
        content_ids: [String(product.id)],
        content_type: 'product',
        value: price,
        currency: 'USD',
        num_items: 1,
      });
    }
  };

  const timelineDates = (() => {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      return `${day} ${month}`;
    };

    const addBusinessDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      let count = 0;
      while (count < days) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Domingo, 6 = Sábado
          count++;
        }
      }
      return result;
    };

    const today = new Date();
    // Despacho en 2 días laborables
    const dispatchDate = addBusinessDays(today, 2);
    // Entrega estimada en 2 a 5 días laborables
    const deliveryStartDate = addBusinessDays(today, 2);
    const deliveryEndDate = addBusinessDays(today, 5);

    return {
      todayStr: formatDate(today),
      dispatchStr: formatDate(dispatchDate),
      deliveryStr: `${formatDate(deliveryStartDate)} - ${formatDate(deliveryEndDate)}`
    };
  })();

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.inner}`}>

          {/* CABECERA PARA MÓVIL (Visible solo en pantallas pequeñas) */}
          <div className={styles.mobileHeader}>
            <div className={styles.starsRow}>
              <div className={styles.starIcons}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className={styles.star} fill="currentColor" />
                ))}
              </div>
              <span className={styles.reviewCount}>387 reseñas verificadas</span>
            </div>
            <h1 className={styles.title}>{product.name}</h1>
            <div className={styles.priceRow}>
              <span className={styles.price}>{product.price}</span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>{product.originalPrice}</span>
              )}
              <span className={styles.freeShippingBadge}>Envío Gratis 🚚</span>
            </div>
          </div>

          {/* COLUMNA IZQUIERDA: Galería de imágenes estilo e-commerce premium */}
          <div className={styles.gallery}>
            <div className={styles.mainImageWrap}>
              {images.map((img, idx) => (
                idx === currentImg && (
                  img.toLowerCase().endsWith('.mp4') || img.toLowerCase().endsWith('.webm') ? (
                    <video
                      key={idx}
                      src={img}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={styles.mainImage}
                      style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    />
                  ) : (
                    <Image
                      key={idx}
                      src={img}
                      alt={`${product.name} - Vista ${idx + 1}`}
                      fill
                      className={styles.mainImage}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                      priority={idx === 0}
                      unoptimized={img?.toLowerCase().includes('.gif')}
                    />
                  )
                )
              ))}
              {images.length > 1 && (
                <>
                  <button
                    className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`}
                    onClick={() => setCurrentImg((c) => (c - 1 + images.length) % images.length)}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    className={`${styles.galleryArrow} ${styles.galleryArrowRight}`}
                    onClick={() => setCurrentImg((c) => (c + 1) % images.length)}
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className={styles.thumbsContainer}>
                <div className={styles.thumbs}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${i === currentImg ? styles.thumbActive : ''}`}
                      onClick={() => setCurrentImg(i)}
                    >
                      {img.toLowerCase().endsWith('.mp4') || img.toLowerCase().endsWith('.webm') ? (
                        <video
                          src={img}
                          muted
                          playsInline
                          className={styles.thumbImg}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      ) : (
                        <Image
                          src={img}
                          alt={`Vista ${i + 1}`}
                          width={80}
                          height={80}
                          className={styles.thumbImg}
                          unoptimized={img?.toLowerCase().includes('.gif')}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div className={styles.scrollIndicator}>
                  <ChevronRight size={16} />
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Estructura de información exacta al referente */}
          <div className={styles.info}>
            {/* 1. Estrellas de Reseña en la parte superior */}
            <div className={`${styles.starsRow} ${styles.desktopOnly}`}>
              <div className={styles.starIcons}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className={styles.star} fill="currentColor" />
                ))}
              </div>
              <span className={styles.reviewCount}>387 reseñas verificadas</span>
            </div>

            {/* 2. Título del producto en H1 */}
            <h1 className={`${styles.title} ${styles.desktopOnly}`}>{product.name}</h1>

            {/* 3. Subtítulo o Propuesta de valor */}
            <p className={styles.subtitle}>{product.subtitle}</p>

            {/* 4. Precio */}
            <div className={`${styles.priceRow} ${styles.desktopOnly}`}>
              <span className={styles.price}>{product.price}</span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>{product.originalPrice}</span>
              )}
              <span className={styles.freeShippingBadge}>Envío Gratis 🚚</span>
            </div>

            {/* 5. Bullets de beneficios con viñeta de destello naranja/amarillo */}
            {product.bullets && (
              <ul className={styles.bullets}>
                {product.bullets.map((b, i) => (
                  <li key={i} className={styles.bullet}>
                    <span className={styles.bulletSpark}>✦</span>
                    <span>{b.replace(/^[^\w\s]+/g, '')}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* 6. Botón de Compra destacado en Rojo (Abre el Formulario) */}
            <button onClick={openCheckout} className={styles.ctaBtn}>
              COMPRAR AHORA Y PAGAR EN CASA 🚚
            </button>

            {/* Dynamic Shipping Timeline */}
            <div className={styles.timelineContainer}>
              <div className={styles.timelineHeader}>
                <Clock size={16} className={styles.timelineClockIcon} />
                <p>
                  Los pedidos se procesan en días laborables y tardan de <strong>2 a 5 días laborables</strong>.
                </p>
              </div>
              <div className={styles.timelineSteps}>
                <div className={styles.timelineStep}>
                  <div className={styles.timelineIconWrap}>
                    <ShoppingBag size={18} />
                  </div>
                  <span className={styles.timelineStepLabel}>Pedido</span>
                  <span className={styles.timelineStepDate}>{timelineDates.todayStr}</span>
                </div>
                <div className={styles.timelineStep}>
                  <div className={styles.timelineIconWrap}>
                    <Truck size={18} />
                  </div>
                  <span className={styles.timelineStepLabel}>Empaque y Despacho</span>
                  <span className={styles.timelineStepDate}>{timelineDates.dispatchStr}</span>
                </div>
                <div className={styles.timelineStep}>
                  <div className={styles.timelineIconWrap}>
                    <MapPin size={18} />
                  </div>
                  <span className={styles.timelineStepLabel}>Entrega</span>
                  <span className={styles.timelineStepDate}>{timelineDates.deliveryStr}</span>
                </div>
              </div>
            </div>

            {/* 8. Testimonio Resaltado del Hero (con avatar e indicador verificado) */}
            {product.testimonials && product.testimonials[0] && (
              <div className={styles.heroTestimonial}>
                <div className={styles.heroTestimonialTop}>
                  <div className={styles.testimonialStars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={styles.star} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className={styles.heroTestimonialText}>
                  &ldquo;{product.testimonials[0].text}&rdquo;
                </p>
                <div className={styles.heroTestimonialAuthor}>
                  <div className={styles.avatarCircle}>
                    {product.testimonials[0].avatar}
                  </div>
                  <div>
                    <strong>{product.testimonials[0].name}</strong>
                    <span className={styles.verifiedText}>✓ Comprador verificado</span>
                  </div>
                </div>
              </div>
            )}

            {/* 9. Acordeones de Información técnica / envíos */}
            <div className={styles.accordions}>
              <AccordionItem title="🌐 Información de envío">
                Envío GRATIS y pago Contra Entrega en toda Ecuador. ¡Tu alivio llega a tu puerta!
              </AccordionItem>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario Modal de Compra Segura / Contraentrega */}
      <CheckoutModal
        product={product}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.accordion} ${open ? styles.accordionOpen : ''}`}>
      <button className={styles.accordionTrigger} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className={`${styles.accordionChevron} ${open ? styles.accordionChevronOpen : ''}`}>▼</span>
      </button>
      <div className={`${styles.accordionBody} ${open ? styles.accordionBodyOpen : ''}`}>
        <div className={styles.accordionContent}>
          <p>{children}</p>
        </div>
      </div>
    </div>
  );
}
