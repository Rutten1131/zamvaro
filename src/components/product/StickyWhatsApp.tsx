'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/data/products';
import CheckoutModal from './CheckoutModal';
import styles from './StickyWhatsApp.module.css';

interface Props {
  product: Product;
}

export default function StickyWhatsApp({ product }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Mostrar después de 600px de scroll, pero ocultar si estamos a menos de 100px del final de la página (cerca del Footer)
      const isNearBottom = (scrollY + windowHeight) >= (documentHeight - 100);

      if (scrollY > 600 && !isNearBottom) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCheckoutOpen(true);
  };

  return (
    <>
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
              <button
                onClick={openCheckout}
                className={styles.btn}
              >
                <span>💬</span> Pedir Contraentrega
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutModal
        product={product}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
