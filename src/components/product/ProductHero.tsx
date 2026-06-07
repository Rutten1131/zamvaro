'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './ProductHero.module.css';

interface ProductHeroProps {
  product: Product;
}

export default function ProductHero({ product }: ProductHeroProps) {
  const [currentImg, setCurrentImg] = useState(0);
  const images = product.images && product.images.length > 0 ? product.images : [product.image || ''];

  const whatsappMsg = encodeURIComponent(
    `Hola Zamvaro Ecuador, quiero comprar el ${product.name} a ${product.price} con pago contraentrega. ¿Cómo coordino mi pedido?`
  );
  const whatsappUrl = `https://wa.me/${product.whatsappNumber || '593000000000'}?text=${whatsappMsg}`;

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>

        {/* COLUMNA IZQUIERDA: Galería de imágenes estilo e-commerce premium */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrap}>
            <Image
              src={images[currentImg]}
              alt={product.name}
              fill
              className={styles.mainImage}
              priority
            />
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
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === currentImg ? styles.thumbActive : ''}`}
                  onClick={() => setCurrentImg(i)}
                >
                  <Image src={img} alt={`Vista ${i + 1}`} width={80} height={80} className={styles.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Estructura de información exacta al referente */}
        <motion.div
          className={styles.info}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 1. Estrellas de Reseña en la parte superior */}
          <div className={styles.starsRow}>
            <div className={styles.starIcons}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} className={styles.star} fill="currentColor" />
              ))}
            </div>
            <span className={styles.reviewCount}>387 reseñas verificadas</span>
          </div>

          {/* 2. Título del producto en H1 */}
          <h1 className={styles.title}>{product.name}</h1>

          {/* 3. Subtítulo o Propuesta de valor */}
          <p className={styles.subtitle}>{product.subtitle}</p>

          {/* 4. Precio */}
          <div className={styles.priceRow}>
            <span className={styles.price}>{product.price}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>{product.originalPrice}</span>
            )}
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

          {/* 6. Botón de Compra destacado en Rojo (Igual a la captura) */}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
            COMPRAR AHORA Y PAGAR EN CASA 🚚
          </a>

          {/* 7. Columnas de confianza (Envío, Devolución, Garantía) */}
          <div className={styles.trustColumns}>
            <div className={styles.trustItem}>
              <Truck size={22} className={styles.trustIcon} />
              <div className={styles.trustText}>
                <strong>Envío rápido a todo</strong>
                <span>Ecuador</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <RotateCcw size={22} className={styles.trustIcon} />
              <div className={styles.trustText}>
                <strong>Devoluciones</strong>
                <span>gratuitas 30 días</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <ShieldCheck size={22} className={styles.trustIcon} />
              <div className={styles.trustText}>
                <strong>Garantía de</strong>
                <span>satisfacción 100%</span>
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
            <AccordionItem title="↩ Política de devolución">
              Si por cualquier motivo no estás satisfecho con tu compra, dispones de 30 días de garantía para devoluciones sin complicaciones.
            </AccordionItem>
          </div>
        </motion.div>
      </div>
    </section>
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
