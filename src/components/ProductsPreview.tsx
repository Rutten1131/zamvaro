'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ShoppingBag } from 'lucide-react';
import styles from './ProductsPreview.module.css';

import { products } from '@/data/products';
import { ShoppingCart } from 'lucide-react';

export default function ProductsPreview() {
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setModalOpen(false);
      setSubmitted(false);
      setEmail('');
    }, 2000);
  };

  return (
    <section className={styles.section} id="productos">
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-badge">🛍️ Catálogo</span>
          <h2 className="section-title">
            Productos que
            <span className={styles.highlight}> llegan a ti</span>
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '16px auto 0' }}>
            Estamos seleccionando los mejores productos para ti.
            Pronto podrás comprar con un solo clic y pagar al recibir.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className={styles.grid}>
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
            >
              {product.tag && (
                <span className={styles.cardTag}>{product.tag}</span>
              )}

              {/* Shimmer overlay only for coming soon items */}
              {!product.isAvailable && (
                <div className={styles.shimmerOverlay}>
                  <div className={styles.comingSoonBadge}>
                    <span>🔜</span>
                    Próximamente
                  </div>
                </div>
              )}

              {/* Product Visual */}
              {product.image ? (
                <div className={styles.imageContainer}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.productImage}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className={styles.emojiContainer}>{product.emoji}</div>
              )}

              <div className={styles.cardBody}>
                <span className={styles.category}>{product.category}</span>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{product.price}</span>
                  {product.originalPrice && (
                    <span style={{ textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                      {product.originalPrice}
                    </span>
                  )}
                  <span className={styles.deliveryBadge}>📦 Contraentrega</span>
                </div>
                
                {product.isAvailable ? (
                  <a
                    href={`/productos/${product.slug}`}
                    className={styles.buyBtn}
                  >
                    <ShoppingCart size={14} />
                    Ver Detalles
                  </a>
                ) : (
                  <button
                    className={styles.notifyBtn}
                    onClick={() => setModalOpen(true)}
                  >
                    <Bell size={14} />
                    Avísame cuando esté
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className={styles.bottomCta}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p>¿Buscas un producto específico? Escríbenos y lo conseguimos para ti.</p>
          <a
            href="https://wa.me/593000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <ShoppingBag size={16} />
            Pedir por WhatsApp
          </a>
        </motion.div>
      </div>

      {/* Notification Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.modalClose} onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
              {!submitted ? (
                <>
                  <div className={styles.modalIcon}>🔔</div>
                  <h3 className={styles.modalTitle}>¡Te avisamos cuando llegue!</h3>
                  <p className={styles.modalDesc}>
                    Deja tu email y serás el primero en saber cuando nuestros productos estén disponibles.
                  </p>
                  <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={styles.modalInput}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      <Bell size={16} />
                      Notificarme
                    </button>
                  </form>
                </>
              ) : (
                <div className={styles.successState}>
                  <div className={styles.successIcon}>✅</div>
                  <h3>¡Listo! Te avisaremos pronto.</h3>
                  <p>Gracias por tu interés en Zamvaro Ecuador.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
