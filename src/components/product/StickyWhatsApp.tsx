'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/data/products';
import styles from './StickyWhatsApp.module.css';

interface Props {
  product: Product;
}

export default function StickyWhatsApp({ product }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky button after scrolling 600px
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappMsg = encodeURIComponent(
    `Hola Zamvaro Ecuador, quiero comprar el ${product.name} a ${product.price} con pago contraentrega. ¿Cómo coordino mi pedido?`
  );
  const whatsappUrl = `https://wa.me/${product.whatsappNumber || '593000000000'}?text=${whatsappMsg}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.bar}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.container}>
            <div className={styles.productInfo}>
              <span className={styles.emoji}>🛍️</span>
              <div>
                <div className={styles.name}>{product.name}</div>
                <div className={styles.price}>{product.price}</div>
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btn}
            >
              <span>💬</span> Pedir Contraentrega
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
