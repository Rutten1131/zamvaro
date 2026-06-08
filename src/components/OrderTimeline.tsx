'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Package, Truck } from 'lucide-react';
import styles from './OrderTimeline.module.css';

const steps = [
  {
    icon: <ShoppingCart size={26} />,
    label: 'Pedido',
    date: '07 jun',
    color: '#9B046F',
    bg: 'rgba(155,4,111,0.1)',
    status: 'done',
  },
  {
    icon: <Package size={26} />,
    label: 'Empaque y Despacho',
    date: '09 jun',
    color: '#5E3653',
    bg: 'rgba(94,54,83,0.08)',
    status: 'done',
  },
  {
    icon: <Truck size={26} />,
    label: 'Entrega',
    date: '09 jun – 11 jun',
    color: '#25D366',
    bg: 'rgba(37,211,102,0.08)',
    status: 'pending',
  },
];

export default function OrderTimeline() {
  return (
    <section className={styles.section}>
      <div className="container">
        <motion.div
          className={styles.wrapper}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Left: Text */}
          <div className={styles.textSide}>
            <span className="section-badge">🚚 Tiempos de entrega</span>
            <h2 className={styles.title}>
              Tu pedido llega <span className={styles.accent}>rápido y seguro</span>
            </h2>
            <p className={styles.desc}>
              Los pedidos se procesan en días laborables y tardan de{' '}
              <strong>2 a 3 días laborables</strong> en llegar a tu puerta.
              Sin pagos adelantados, sin riesgos.
            </p>
            <div className={styles.badges}>
              <span className={styles.badge}>📦 Embalaje protegido</span>
              <span className={styles.badge}>💵 Pago al recibir</span>
              <span className={styles.badge}>🇪🇨 Todo Ecuador</span>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className={styles.timeline}>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className={styles.step}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    className={styles.connector}
                    style={{ borderColor: step.color }}
                  />
                )}

                {/* Icon circle */}
                <div
                  className={styles.iconCircle}
                  style={{
                    background: step.bg,
                    color: step.color,
                    border: `2px solid ${step.color}`,
                  }}
                >
                  {step.icon}
                </div>

                {/* Info */}
                <div className={styles.stepInfo}>
                  <p className={styles.stepLabel}>{step.label}</p>
                  <span
                    className={styles.stepDate}
                    style={{ color: step.color }}
                  >
                    {step.date}
                  </span>
                </div>

                {/* Status dot */}
                <div
                  className={`${styles.statusDot} ${step.status === 'done' ? styles.done : styles.pending}`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
