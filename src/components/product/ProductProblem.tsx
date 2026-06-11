'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Product } from '@/data/products';
import styles from './ProductProblem.module.css';

interface Props {
  product: Product;
}

export default function ProductProblem({ product }: Props) {
  const imageSrc = product.imageProblem || product.image || 'https://zamvaro.com/cdn/shop/files/1.png?v=1777075512';

  return (
    <section className={styles.section}>
      <div className="container">

        {/* ── Bloque Imagen + Pregunta ── */}
        <motion.div
          className={styles.row}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          {/* Imagen con overlay de texto */}
          <div className={styles.imageWrap}>
            {imageSrc.toLowerCase().endsWith('.mp4') || imageSrc.toLowerCase().endsWith('.webm') ? (
              <video
                src={imageSrc}
                autoPlay
                loop
                muted
                playsInline
                className={styles.image}
                style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
              />
            ) : (
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className={styles.image}
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            )}
          </div>

          {/* Texto del problema */}
          <div className={styles.textCol}>
            <h2 className={styles.problemQuestion}>
              {product.hookText}
            </h2>
            <p className={styles.problemDesc}>
              {product.slug?.includes('esterilizador') || product.slug?.includes('cepillos-de-dientes')
                ? 'La humedad y bacterias en los cepillos comprometen la higiene de tu familia. Este soporte inteligente desinfecta y organiza tu baño automáticamente.'
                : product.slug?.includes('cepillo-secador')
                ? 'El calor excesivo daña tu cabello y el frizz es difícil de controlar. Nuestro cepillo resuelve todo en un solo paso, devolviendo brillo y suavidad.'
                : 'Diseñado con tecnología inteligente para resolver tus necesidades diarias de forma eficiente y segura, ahorrándote tiempo y desorden.'}
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
