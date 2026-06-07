'use client';

import { motion } from 'framer-motion';
import type { Product } from '@/data/products';
import styles from './ProductGuarantee.module.css';

interface Props { product: Product; }

export default function ProductGuarantee({ product }: Props) {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.shieldWrap}>
          <span className={styles.shieldEmoji}>🛡️</span>
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>Tu satisfacción está garantizada</h3>
          <p className={styles.text}>
            {product.guaranteeText || 'Si por cualquier razón no estás satisfecho, contáctanos y lo resolvemos. Tu confianza es lo más importante para Zamvaro Ecuador.'}
          </p>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge}>💵 Pago al Recibir</span>
          <span className={styles.badge}>🔄 Soporte Garantizado</span>
          <span className={styles.badge}>🇪🇨 Entrega en Ecuador</span>
        </div>
      </div>
    </motion.section>
  );
}
