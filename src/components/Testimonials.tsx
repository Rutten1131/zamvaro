'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    name: 'María Fernanda C.',
    city: 'Quito, Pichincha',
    avatar: '👩',
    rating: 5,
    text: 'No creía que fuera tan fácil. Pedí un producto por WhatsApp, llegó en 3 días y pagué cuando lo recibí. Sin tarjeta, sin complicaciones. ¡Volveré a comprar!',
    product: 'Crema Premium',
  },
  {
    name: 'Carlos A.',
    city: 'Guayaquil, Guayas',
    avatar: '👨',
    rating: 5,
    text: 'Excelente servicio. Tenía miedo de comprar online por malas experiencias antes, pero con el pago contraentrega me quedé tranquilo. El producto llegó tal como lo describieron.',
    product: 'Auriculares Inalámbricos',
  },
  {
    name: 'Valentina R.',
    city: 'Cuenca, Azuay',
    avatar: '👩‍💼',
    rating: 5,
    text: 'Lo mejor es que no tienes que pagar por adelantado. Me asesoraron por WhatsApp y me ayudaron a elegir. Muy recomendado para quienes desconfían de compras online.',
    product: 'Set de Cocina',
  },
];

const stats = [
  { number: '100%', label: 'Pago seguro', icon: '🔒' },
  { number: '24/7', label: 'Soporte activo', icon: '📞' },
  { number: '🇪🇨', label: 'Cobertura nacional', icon: '' },
  { number: '0%', label: 'Riesgo de compra', icon: '✅' },
];

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className="container">
        {/* Stats Row */}
        <motion.div
          className={styles.statsRow}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statNumber}>{s.number}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="section-badge">💬 Testimonios</span>
          <h2 className="section-title">
            Lo que dicen nuestros
            <span className={styles.accent}> clientes</span>
          </h2>
          <p className="section-subtitle">
            Personas reales de todo Ecuador que ya compraron con confianza.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className={styles.cards}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className={styles.card}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              {/* Stars */}
              <div className={styles.stars}>
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>

              <p className={styles.quote}>&ldquo;{t.text}&rdquo;</p>

              <div className={styles.productTag}>
                🛍️ Compró: <strong>{t.product}</strong>
              </div>

              <div className={styles.author}>
                <span className={styles.avatar}>{t.avatar}</span>
                <div>
                  <p className={styles.authorName}>{t.name}</p>
                  <p className={styles.authorCity}>📍 {t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <motion.div
          className={styles.guarantee}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={styles.guaranteeItem}>
            <span className={styles.guaranteeIcon}>🚫</span>
            <p><strong>No pagas si no llega</strong><br />Si tu pedido no llega, no se te cobra nada.</p>
          </div>
          <div className={styles.divider} />
          <div className={styles.guaranteeItem}>
            <span className={styles.guaranteeIcon}>↩️</span>
            <p><strong>Devolución sin complicaciones</strong><br />Si el producto no es lo esperado, lo resolvemos.</p>
          </div>
          <div className={styles.divider} />
          <div className={styles.guaranteeItem}>
            <span className={styles.guaranteeIcon}>💯</span>
            <p><strong>Producto real garantizado</strong><br />Lo que ves es lo que recibes. Sin engaños.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
