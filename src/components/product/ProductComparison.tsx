'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './ProductComparison.module.css';

interface Props { product: Product; }

export default function ProductComparison({ product }: Props) {
  if (!product.comparison) return null;

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
          <span className="section-badge">📊 La diferencia</span>
          <h2 className="section-title">
            {product.comparisonTitle || '¿Por qué elegirnos?'}
          </h2>
          <p className="section-subtitle">
            No todos los productos son iguales. Aquí está la diferencia real.
          </p>
        </motion.div>

        <motion.div
          className={styles.tableWrap}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.featureCol}>Característica</th>
                <th className={styles.oursCol}>
                  <div className={styles.colHeader}>
                    <span className={styles.colEmoji}>⭐</span>
                    <span>{product.comparisonOursLabel || 'Zamvaro'}</span>
                    <span className={styles.recommended}>Recomendado</span>
                  </div>
                </th>
                <th className={styles.theirsCol}>
                  <div className={styles.colHeader}>
                    <span>{product.comparisonTheirsLabel || 'Alternativa'}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {product.comparison.map((row, i) => (
                <motion.tr
                  key={i}
                  className={styles.row}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                >
                  <td className={styles.featureCell}>{row.label}</td>
                  <td className={styles.oursCell}>
                    {row.ours ? (
                      <span className={styles.yes}>
                        <Check size={18} strokeWidth={3} /> Sí
                      </span>
                    ) : (
                      <span className={styles.no}>
                        <X size={18} strokeWidth={3} /> No
                      </span>
                    )}
                  </td>
                  <td className={styles.theirsCell}>
                    {row.theirs ? (
                      <span className={styles.yes}>
                        <Check size={18} strokeWidth={3} /> Sí
                      </span>
                    ) : (
                      <span className={styles.no}>
                        <X size={18} strokeWidth={3} /> No
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
