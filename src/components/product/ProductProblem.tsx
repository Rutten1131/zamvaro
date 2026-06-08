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
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className={styles.image}
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <div className={styles.imageOverlay}>
              <p className={styles.overlayTagline}>{product.name}</p>
              <h2 className={styles.overlayHeadline}>
                {product.subtitle}
              </h2>
            </div>
          </div>

          {/* Texto del problema */}
          <div className={styles.textCol}>
            <h2 className={styles.problemQuestion}>
              {product.hookText}
            </h2>
            <p className={styles.problemDesc}>
              Con herramientas separadas, el calor excesivo daña tu cabello, el frizz no desaparece, y el tiempo se va sin que logres el resultado que buscas. Nuestro cepillo está diseñado para resolver todo esto en un solo paso, devolviendo el brillo y la suavidad que mereces.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
