'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './ProductHowTo.module.css';

interface Props {
  product: Product;
}

export default function ProductHowTo({ product }: Props) {
  if (!product.steps || product.steps.length === 0) return null;

  const imageSrc = product.imageHowTo || product.image || '';
  const testimonial = product.testimonials?.[1] ?? product.testimonials?.[0];

  return (
    <section className={styles.section}>
      <div className="container">

        {/* Encabezado centrado */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className={styles.title}>Cómo usar en 3 pasos</h2>
          <p className={styles.subtitle}>
            Fácil, <em>rápido</em> y efectivo para un resultado duradero.
          </p>
        </motion.div>

        {/* Layout 3 columnas */}
        <div className={styles.layout}>

          {/* Pasos 1 y 2 (izquierda) */}
          <motion.div
            className={styles.stepsColLeft}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {product.steps.slice(0, 2).map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Centro: imagen + testimonio superpuesto */}
          <motion.div
            className={styles.centerCol}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <div className={styles.centerCard}>
              <div className={styles.centerImageWrap}>
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  className={styles.centerImage}
                  sizes="(max-width: 900px) 90vw, 340px"
                />
              </div>
              {testimonial && (
                <div className={styles.testimonialOverlay}>
                  <div className={styles.testimonialTop}>
                    <div className={styles.testimonialAvatar}>{testimonial.avatar}</div>
                    <div>
                      <strong className={styles.testimonialName}>{testimonial.name}</strong>
                      <div className={styles.testimonialStars}>
                        {[...Array(testimonial.rating)].map((_, s) => (
                          <Star key={s} size={12} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className={styles.testimonialText}>&ldquo;{testimonial.text}&rdquo;</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Paso 3 (derecha) */}
          <motion.div
            className={styles.stepsColRight}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {product.steps.slice(2).map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
