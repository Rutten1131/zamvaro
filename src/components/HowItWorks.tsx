'use client';

import { motion } from 'framer-motion';
import { Search, PhoneCall, Package } from 'lucide-react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '01',
    icon: <Search size={32} />,
    title: 'Elige tu producto',
    description:
      'Explora nuestro catálogo de productos seleccionados. Encuentra lo que necesitas y haz clic en "Quiero este".',
    color: '#9B046F',
  },
  {
    number: '02',
    icon: <PhoneCall size={32} />,
    title: 'Confirma tu pedido',
    description:
      'Te contactamos por WhatsApp para confirmar tu dirección y datos. Sin formularios complicados ni registros.',
    color: '#5E3653',
  },
  {
    number: '03',
    icon: <Package size={32} />,
    title: 'Recibe y paga',
    description:
      'Tu pedido llega a domicilio o a una sucursal. Pagas al repartidor cuando recibes tu producto. ¡Así de fácil!',
    color: '#2E2A39',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
} as const;

export default function HowItWorks() {
  return (
    <section className={styles.section} id="como-funciona">
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-badge">🛒 Proceso de Compra</span>
          <h2 className="section-title">¿Cómo funciona?</h2>
          <p className="section-subtitle">
            Comprar en Zamvaro Ecuador es tan sencillo como 1, 2, 3.
            Sin complicaciones, sin riesgos.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className={styles.steps}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className={styles.step}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={styles.connector} />
              )}

              <div className={styles.stepNumber}>{step.number}</div>
              <div
                className={styles.iconBox}
                style={{ background: `${step.color}15`, color: step.color, border: `1px solid ${step.color}25` }}
              >
                {step.icon}
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom highlight */}
        <motion.div
          className={styles.highlight}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span className={styles.highlightIcon}>💡</span>
          <p>
            <strong>¿Tienes dudas?</strong> Escríbenos por WhatsApp y te asesoramos sin compromiso.
          </p>
          <a
            href="https://wa.me/593939243014"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            💬 Chatear ahora
          </a>
        </motion.div>
      </div>
    </section>
  );
}
