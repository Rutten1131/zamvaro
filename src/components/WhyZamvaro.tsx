'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, MessageCircle, Star, CreditCard, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './WhyZamvaro.module.css';

const pillars = [
  {
    icon: <CreditCard size={28} />,
    title: 'Pago al recibir',
    description: 'No arriesgas tu dinero. Pagas únicamente cuando el producto está en tus manos. Cero fraudes.',
    color: '#9B046F',
    bg: 'rgba(155,4,111,0.08)',
  },
  {
    icon: <Truck size={28} />,
    title: 'Entrega en todo Ecuador',
    description: 'Llegamos a Quito, Guayaquil, Cuenca y a todo el país. A domicilio o en sucursal.',
    color: '#5E3653',
    bg: 'rgba(94,54,83,0.08)',
  },
  {
    icon: <MessageCircle size={28} />,
    title: 'Soporte por WhatsApp',
    description: 'Un asesor real responde tus preguntas. Sin bots, sin esperas largas, atención humana.',
    color: '#25D366',
    bg: 'rgba(37,211,102,0.08)',
  },
  {
    icon: <Star size={28} />,
    title: 'Productos seleccionados',
    description: 'Cada producto pasa por un proceso de selección. Solo ofrecemos lo que valdría la pena comprar.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
  },
  {
    icon: <ShieldCheck size={28} />,
    title: 'Compra 100% segura',
    description: 'Tu información personal está protegida. Nunca compartimos tus datos con terceros.',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.08)',
  },
  {
    icon: <RotateCcw size={28} />,
    title: 'Política de devolución',
    description: 'Si el producto no es lo que esperabas, te ayudamos a resolverlo. Tu satisfacción es primero.',
    color: '#2E2A39',
    bg: 'rgba(46,42,57,0.06)',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
} as const;

export default function WhyZamvaro() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goTo = (idx: number) => {
    setActiveIndex(Math.max(0, Math.min(pillars.length - 1, idx)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goTo(activeIndex + 1);
        else goTo(activeIndex - 1);
      }
    }
  };

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-badge">⭐ Nuestros valores</span>
          <h2 className="section-title">
            ¿Por qué elegir{' '}
            <span className={styles.brandName}>Zamvaro Ecuador?</span>
          </h2>
          <p className="section-subtitle">
            Somos más que una tienda online. Somos tu aliado de confianza
            para comprar sin riesgo en Ecuador.
          </p>
        </motion.div>

        {/* Desktop Grid */}
        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.title}
              className={styles.card}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <div
                className={styles.iconWrap}
                style={{ background: pillar.bg, color: pillar.color }}
              >
                {pillar.icon}
              </div>
              <h3 className={styles.cardTitle}>{pillar.title}</h3>
              <p className={styles.cardDesc}>{pillar.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Slider */}
        <div className={styles.mobileSlider}>
          {/* Swipe hint */}
          <div className={styles.swipeHint}>
            <span>👈</span>
            <span>Desliza para ver más</span>
            <span>👉</span>
          </div>

          {/* Slide area */}
          <div
            className={styles.mobileSlideWrap}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              key={activeIndex}
              className={styles.mobileCard}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={styles.iconWrap}
                style={{ background: pillars[activeIndex].bg, color: pillars[activeIndex].color }}
              >
                {pillars[activeIndex].icon}
              </div>
              <h3 className={styles.cardTitle}>{pillars[activeIndex].title}</h3>
              <p className={styles.cardDesc}>{pillars[activeIndex].description}</p>
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          <div className={styles.mobileNav}>
            <button
              className={styles.mobileArrow}
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots */}
            <div className={styles.dots}>
              {pillars.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Ir a razón ${i + 1}`}
                />
              ))}
            </div>

            <button
              className={styles.mobileArrow}
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === pillars.length - 1}
              aria-label="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Counter */}
          <p className={styles.mobileCounter}>
            {activeIndex + 1} / {pillars.length}
          </p>
        </div>

        {/* Trust Banner */}
        <motion.div
          className={styles.banner}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className={styles.bannerLeft}>
            <span className={styles.bannerEmoji}>🏆</span>
            <div>
              <h3 className={styles.bannerTitle}>Confianza garantizada</h3>
              <p className={styles.bannerDesc}>
                En Zamvaro Ecuador tu dinero está protegido. Paga solo cuando recibas.
              </p>
            </div>
          </div>
          <div className={styles.bannerBadges}>
            {['🔒 Seguro', '💵 Contraentrega', '🇪🇨 Ecuador'].map((b) => (
              <span key={b} className={styles.badge}>{b}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
