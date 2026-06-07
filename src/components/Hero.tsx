'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ChevronDown, ShieldCheck } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Background gradient orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className={`container ${styles.content}`}>
        {/* Left Column */}
        <motion.div
          className={styles.left}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Trust Badge */}
          <motion.div
            className={styles.trustBadge}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <ShieldCheck size={16} className={styles.shieldIcon} />
            <span>🇪🇨 Pago Contraentrega · 100% Seguro en Ecuador</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className={styles.headline}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Compra lo que
            <span className={styles.highlight}> quieres.</span>
            <br />
            Paga cuando
            <span className={styles.highlightAlt}> llegue.</span>
          </motion.h1>

          <motion.p
            className={styles.subheadline}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            Productos seleccionados con entrega en todo Ecuador.
            Sin tarjeta de crédito — pagas al repartidor cuando recibes tu pedido.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className={styles.ctaGroup}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link href="/productos" className="btn-primary">
              <ShoppingBag size={18} />
              Explorar Productos
            </Link>
            <Link href="/como-funciona" className="btn-secondary">
              Cómo Funciona
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className={styles.stats}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              { number: '0%', label: 'Riesgo al comprar' },
              { number: '24h', label: 'Tiempo de respuesta' },
              { number: '🇪🇨', label: 'Cobertura nacional' },
            ].map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column — Hero Image */}
        <motion.div
          className={styles.right}
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
        >
          <div className={styles.imageWrapper}>
            <Image
              src="/hero-bg.png"
              alt="Productos Zamvaro Ecuador"
              fill
              style={{ objectFit: 'cover', borderRadius: '24px' }}
              priority
            />
            {/* Floating card */}
            <motion.div
              className={styles.floatingCard}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <span className={styles.floatingIcon}>💵</span>
              <div>
                <p className={styles.floatingTitle}>Pago Contraentrega</p>
                <p className={styles.floatingDesc}>Paga solo al recibir</p>
              </div>
            </motion.div>

            <motion.div
              className={styles.floatingCard2}
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
            >
              <span className={styles.floatingIcon}>📦</span>
              <div>
                <p className={styles.floatingTitle}>Entrega a Domicilio</p>
                <p className={styles.floatingDesc}>Todo Ecuador</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollIndicator}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
}
