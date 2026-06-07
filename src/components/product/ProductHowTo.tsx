'use client';

import { motion } from 'framer-motion';
import type { Product } from '@/data/products';
import styles from './ProductHowTo.module.css';

interface Props {
  product: Product;
}

export default function ProductHowTo({ product }: Props) {
  if (!product.steps || product.steps.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className="section-badge">✨ Paso a Paso</span>
          <h2 className="section-title">
            ¿Cómo se <span className={styles.highlight}>utiliza?</span>
          </h2>
          <p className="section-subtitle">
            Obtén los mejores resultados desde el primer día con esta guía sencilla de uso.
          </p>
        </div>

        <div className={styles.grid}>
          {product.steps.map((step, idx) => (
            <motion.div
              key={step.number}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className={styles.num}>{step.number}</div>
              <div className={styles.emoji}>{step.emoji}</div>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardDesc}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
