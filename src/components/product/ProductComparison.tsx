'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './ProductComparison.module.css';

interface Props { product: Product; }

export default function ProductComparison({ product }: Props) {
  const whatsappMsg = encodeURIComponent(
    `Hola Zamvaro Ecuador, quiero comprar el ${product.name} a ${product.price} con pago contraentrega.`
  );
  const whatsappUrl = `https://wa.me/${product.whatsappNumber || '593939243014'}?text=${whatsappMsg}`;

  return (
    <>
      <section className={styles.section}>
        <div className="container">
          
          {/* Grilla principal de 2 columnas lado a lado: Comparativa izquierda, Estadísticas derecha */}
          <div className={styles.mainLayoutGrid}>
            
            {/* COLUMNA IZQUIERDA: ¿Por qué somos diferentes? + Tabla */}
            <motion.div
              className={styles.leftColumn}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.columnHeader}>
                <h2 className={styles.title}>
                  ¿Por qué somos diferentes?
                </h2>
                <p className={styles.subtitle}>
                  No todas las sprays son iguales. El nuestro va más allá de un simple humectante.
                </p>
              </div>

              {product.comparison && (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.featureCol}></th>
                        <th className={styles.oursCol}>{product.comparisonOursLabel || 'Crema Alivio Intenso'}</th>
                        <th className={styles.theirsCol}>{product.comparisonTheirsLabel || 'Crema Genérica'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.comparison.map((row, i) => (
                        <tr key={i} className={styles.row}>
                          <td className={styles.featureCell}>{row.label}</td>
                          <td className={styles.oursCell}>
                            {row.ours ? (
                              <Check size={18} className={styles.checkIcon} strokeWidth={3} />
                            ) : (
                              <X size={18} className={styles.xIcon} strokeWidth={3} />
                            )}
                          </td>
                          <td className={styles.theirsCell}>
                            {row.theirs ? (
                              <Check size={18} className={styles.checkIcon} strokeWidth={3} />
                            ) : (
                              <X size={18} className={styles.xIcon} strokeWidth={3} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* COLUMNA DERECHA: Miles de Ecuatorianas + Estadísticas + Botón */}
            <motion.div
              className={styles.rightColumn}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.columnHeader}>
                <h2 className={styles.statsTitle}>
                  Miles de Ecuatorianas ya disfrutan del alivio
                </h2>
              </div>

              {product.stats && (
                <div className={styles.statsList}>
                  {product.stats.map((stat, i) => (
                    <div key={i} className={styles.statRow}>
                      <div className={styles.circularBadge}>
                        <span className={styles.badgeVal}>{stat.value}</span>
                      </div>
                      <span className={styles.statLabel}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaBtn}
              >
                Lo quiero
              </a>
            </motion.div>

          </div>

        </div>
      </section>
    </>
  );
}
