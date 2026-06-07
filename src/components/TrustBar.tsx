'use client';

import { motion } from 'framer-motion';
import styles from './TrustBar.module.css';

const items = [
  { icon: '📦', text: 'Entrega a Domicilio' },
  { icon: '🏪', text: 'Retiro en Sucursal' },
  { icon: '💵', text: 'Pago Contraentrega' },
  { icon: '🔒', text: '100% Seguro' },
  { icon: '🇪🇨', text: 'Todo Ecuador' },
  { icon: '📞', text: 'Soporte por WhatsApp' },
];

export default function TrustBar() {
  return (
    <section className={styles.trustBar}>
      <div className={styles.track}>
        {/* Duplicate items for seamless loop */}
        {[...items, ...items].map((item, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
