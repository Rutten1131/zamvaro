'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Product } from '@/data/products';
import styles from './ProductFeatures.module.css';

interface Props {
  product: Product;
}

// Factores de problema adaptados al Cepillo Secador
const PROBLEM_FACTORS = [
  { label: 'Frizz', detail: 'difícil de controlar' },
  { label: 'Calor', detail: 'excesivo que daña' },
  { label: 'Tiempo', detail: 'perdido cada mañana' },
  { label: 'Herramientas', detail: 'múltiples y pesadas' },
  { label: 'Cabello', detail: 'sin volumen ni brillo' },
  { label: 'Costo', detail: 'de salón de belleza' },
];

export default function ProductFeatures({ product }: Props) {
  if (!product.features || product.features.length < 2) return null;

  const leftFeatures = product.features.slice(0, 2);
  const rightFeatures = product.features.slice(2, 4);
  const imageSrc = product.image || '';

  return (
    <section className={styles.section}>
      <div className="container">

        {/* Encabezado centrado */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.title}>
            Descubre el poder de una <span className={styles.highlight}>tecnología única</span>
          </h2>
          <p className={styles.subtitle}>
            Componentes activos que trabajan en sinergia para darte el cabello que siempre quisiste.
          </p>
        </motion.div>

        {/* Layout 3 columnas */}
        <div className={styles.layout}>

          {/* Columna izquierda */}
          <motion.div
            className={styles.featuresCol}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {leftFeatures.map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <span className={styles.featureIcon}>{f.emoji}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Centro: imagen con infografía */}
          <motion.div
            className={styles.centerCol}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <div className={styles.centerCard}>
              <div className={styles.centerCardHeader}>
                <p className={styles.centerTagline}>Factores que generan</p>
                <p className={styles.centerHeadline}>malos resultados en casa</p>
              </div>
              <div className={styles.centerImageWrap}>
                <Image
                  src={imageSrc}
                  alt="Cepillo Secador 3 en 1"
                  fill
                  className={styles.centerImage}
                  sizes="(max-width: 900px) 90vw, 340px"
                />
              </div>
              <div className={styles.factorsGrid}>
                {PROBLEM_FACTORS.map((f, i) => (
                  <div key={i} className={styles.factorItem}>
                    <span className={styles.factorLabel}>{f.label}</span>
                    <span className={styles.factorDetail}>{f.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Columna derecha */}
          <motion.div
            className={styles.featuresCol}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {rightFeatures.map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <span className={styles.featureIcon}>{f.emoji}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
