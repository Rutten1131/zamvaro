'use client';

import { motion } from 'framer-motion';
import type { Product } from '@/data/products';
import styles from './ProductStats.module.css';

interface Props { product: Product; }

export default function ProductStats({ product }: Props) {
  if (!product.stats) return null;

  const whatsappMsg = encodeURIComponent(
    `Hola Zamvaro Ecuador, quiero comprar el ${product.name} a ${product.price} con pago contraentrega.`
  );
  const whatsappUrl = `https://wa.me/${product.whatsappNumber || '593000000000'}?text=${whatsappMsg}`;

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
          <span className="section-badge">📈 Resultados reales</span>
          <h2 className={styles.title}>Los números hablan por sí solos</h2>
        </motion.div>

        <div className={styles.statsGrid}>
          {product.stats.map((stat, i) => (
            <motion.div
              key={i}
              className={styles.statCard}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <span className={styles.statValue}>{stat.value}</span>
              <p className={styles.statLabel}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.ctaWrap}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className={styles.ctaText}>
            Únete a las cientos de ecuatorianas que ya transformaron su rutina de peinado
          </p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
            🚚 Quiero Probar Ahora
          </a>
        </motion.div>
      </div>
    </section>
  );
}
