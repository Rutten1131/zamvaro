'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import styles from './FinalCTA.module.css';

export default function FinalCTA() {
  return (
    <section className={styles.section}>
      {/* Decorative orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={`container ${styles.content}`}>
        <motion.div
          className={styles.inner}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <motion.span
            className={styles.badge}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            🇪🇨 Zamvaro Ecuador
          </motion.span>

          <h2 className={styles.title}>
            ¿Listo para comprar?
            <br />
            <span className={styles.titleAccent}>Es fácil y 100% seguro.</span>
          </h2>

          <p className={styles.subtitle}>
            No necesitas tarjeta de crédito. No pagas por adelantado.
            Escríbenos por WhatsApp y te asesoramos sin ningún compromiso.
          </p>

          {/* CTA Buttons */}
          <motion.div
            className={styles.buttons}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <a
              href="https://wa.me/593939243014?text=Hola%20Zamvaro%20Ecuador%2C%20quiero%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle size={20} />
              Escribir por WhatsApp
            </a>
            <Link href="/productos" className={styles.catalogBtn}>
              <ShoppingBag size={18} />
              Ver Catálogo
            </Link>
          </motion.div>

          {/* Trust micro-items */}
          <motion.div
            className={styles.trustItems}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {[
              '✅ Sin tarjeta requerida',
              '📦 Entrega a domicilio',
              '💵 Paga al recibir',
              '🔒 Datos protegidos',
            ].map((item) => (
              <span key={item} className={styles.trustItem}>{item}</span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
