'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './ProductTestimonials.module.css';

interface Props { product: Product; }

export default function ProductTestimonials({ product }: Props) {
  if (!product.testimonials) return null;

  return (
    <section className={styles.section}>
      <div className="container">
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

        <div className={styles.grid}>
          {product.testimonials.map((t, i) => (
            <motion.div
              key={i}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={styles.cardTop}>
                <div className={styles.avatar}>{t.avatar}</div>
                <div className={styles.meta}>
                  <span className={styles.name}>{t.name}</span>
                  <span className={styles.city}>📍 {t.city}</span>
                  <div className={styles.stars}>
                    {[...Array(t.rating)].map((_, s) => (
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
            </motion.div>
          ))}
        </div>

        {/* Overall rating summary */}
        <motion.div
          className={styles.overallRating}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.ratingNumber}>4.9</div>
          <div className={styles.ratingInfo}>
            <div className={styles.bigStars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={22} className={styles.star} fill="currentColor" />
              ))}
            </div>
            <span className={styles.ratingLabel}>Basado en 48 reseñas verificadas</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
