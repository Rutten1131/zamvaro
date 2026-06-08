'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Product } from '@/data/products';
import styles from './ProductStats.module.css';

interface Props { product: Product; }

export default function ProductStats({ product }: Props) {
  if (!product.stats) return null;

  const whatsappMsg = encodeURIComponent(
    `Hola Zamvaro Ecuador, quiero comprar el ${product.name} a ${product.price} con pago contraentrega.`
  );
  const whatsappUrl = `https://wa.me/${product.whatsappNumber || '593939243014'}?text=${whatsappMsg}`;
  const imageSrc = product.image || '';

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.layout}>

          {/* Izquierda: imagen del producto */}
          <motion.div
            className={styles.imageCol}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.imageWrap}>
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className={styles.image}
                sizes="(max-width: 900px) 90vw, 420px"
              />
            </div>
          </motion.div>

          {/* Derecha: título + stats + CTA */}
          <motion.div
            className={styles.infoCol}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.title}>
              Miles de ecuatorianos ya<br />
              <span className={styles.highlight}>disfrutan del resultado</span>
            </h2>

            <div className={styles.statsList}>
              {product.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className={styles.statRow}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                >
                  <div className={styles.statBadge}>{stat.value}</div>
                  <p className={styles.statLabel}>{stat.label}</p>
                </motion.div>
              ))}
            </div>

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
  );
}
