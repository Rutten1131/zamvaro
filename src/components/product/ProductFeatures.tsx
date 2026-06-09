'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useRef } from 'react';
import type { Product } from '@/data/products';
import styles from './ProductFeatures.module.css';

interface Props {
  product: Product;
}

// Factores de problema por defecto (si el producto no los define)
const DEFAULT_PROBLEM_FACTORS = [
  { label: 'Calidad', detail: 'inferior del producto' },
  { label: 'Tiempo', detail: 'perdido cada día' },
  { label: 'Costo', detail: 'elevado sin resultados' },
  { label: 'Diseño', detail: 'anticuado e incómodo' },
  { label: 'Duración', detail: 'muy corta del producto' },
  { label: 'Soporte', detail: 'sin garantía real' },
];

export default function ProductFeatures({ product }: Props) {
  if (!product.features || product.features.length < 2) return null;

  const problemFactors = product.problemFactors || DEFAULT_PROBLEM_FACTORS;
  const problemTagline = product.problemTagline || 'Factores que generan';
  const problemHeadline = product.problemHeadline || 'malos resultados';

  const allFeatures = product.features.slice(0, 4);
  const leftFeatures = product.features.slice(0, 2);
  const rightFeatures = product.features.slice(2, 4);
  const imageSrc = product.imageFeatures || product.image || '';

  // --- Slider state (mobile only) ---
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = (idx: number) => {
    const count = allFeatures.length;
    setCurrent((idx + count) % count);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    touchStartX.current = null;
  };

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
            Tecnología <span className={styles.highlight}>única para ti</span>
          </h2>
          <p className={styles.subtitle}>
            Componentes avanzados que trabajan en sinergia.
          </p>
        </motion.div>

        {/* ── DESKTOP: Layout 3 columnas ── */}
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
                <p className={styles.centerTagline}>{problemTagline}</p>
                <p className={styles.centerHeadline}>{problemHeadline}</p>
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
                {problemFactors.map((f, i) => (
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

        {/* ── MOBILE: Slider de cards ── */}
        <div
          className={styles.mobileSlider}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Flechas */}
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
            onClick={() => goTo(current - 1)}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowRight}`}
            onClick={() => goTo(current + 1)}
            aria-label="Siguiente"
          >
            ›
          </button>

          {/* Track */}
          <div className={styles.sliderTrack}>
            {allFeatures.map((f, i) => (
              <div
                key={i}
                className={`${styles.sliderCard} ${i === current ? styles.sliderCardActive : ''}`}
                style={{ transform: `translateX(${(i - current) * 100}%)` }}
              >
                <span className={styles.sliderIcon}>{f.emoji}</span>
                <h3 className={styles.sliderTitle}>{f.title}</h3>
                <p className={styles.sliderDesc}>{f.description}</p>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className={styles.sliderDots}>
            {allFeatures.map((_, i) => (
              <button
                key={i}
                className={`${styles.sliderDot} ${i === current ? styles.sliderDotActive : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Ir a ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
