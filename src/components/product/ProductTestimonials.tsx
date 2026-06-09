'use client';

import { motion } from 'framer-motion';
import { Star, MessageCircle } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './ProductTestimonials.module.css';

interface Props { product: Product; }

export default function ProductTestimonials({ product }: Props) {
  if (!product.testimonials) return null;

  // Duplicar testimonios para crear un scroll infinito suave y sin saltos
  const duplicatedTestimonials = [
    ...product.testimonials,
    ...product.testimonials,
    ...product.testimonials,
  ];

  return (
    <section className={styles.section}>
      <div className={styles.containerFluid}>
        
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-badge">⭐ Clientes reales</span>
          <h2 className="section-title">
            Lo que dicen quienes ya <span className={styles.highlight}>lo compraron</span>
          </h2>
          <p className="section-subtitle">
            +48 familias ecuatorianas ya recibieron su pedido con pago contraentrega.
          </p>
        </motion.div>

        {/* Contenedor del track del slider infinito */}
        <div className={styles.sliderContainer}>
          <div className={styles.sliderTrack}>
            {duplicatedTestimonials.map((t, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{t.avatar}</div>
                  <div className={styles.meta}>
                    <span className={styles.name}>{t.name}</span>
                    <span className={styles.city}>📍 {t.city}</span>
                    <div className={styles.stars}>
                      {[...Array(Math.max(0, Math.min(5, Math.round(Number(t.rating) || 5))))].map((_, s) => (
                        <Star key={s} size={13} className={styles.star} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <span className={styles.verifiedBadge}>✔ Verificado</span>
                </div>
                <p className={styles.text}>&ldquo;{t.text}&rdquo;</p>
                <div className={styles.cardFooter}>
                  <span className={styles.date}>📅 {t.date}</span>
                  <span className={styles.purchasedBadge}>🛒 Compra verificada</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA WhatsApp bajo los testimonios */}
        <motion.div
          className={styles.ctaWrap}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <a
            href={`/api/wa-click?product=${product.slug}&name=${encodeURIComponent(product.name)}&section=testimonios&wa=${product.whatsappNumber || '593939243014'}&msg=${encodeURIComponent(`Hola! 👋 Vi los testimonios de ${product.name} y quiero pedirlo. ¿Cómo funciona el pago contraentrega?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            <MessageCircle size={20} />
            ¡Quiero el mío con pago contraentrega!
          </a>
          <p className={styles.ctaHint}>✅ Paga solo cuando lo recibas en casa</p>
        </motion.div>

      </div>
    </section>
  );
}
