'use client';

import { useEffect, useState } from 'react';
import styles from './AnnouncementBar.module.css';

interface Props {
  whatsappNumber?: string;
}

export default function AnnouncementBar({ whatsappNumber }: Props) {
  const [visible, setVisible] = useState(true);
  const [navHeight, setNavHeight] = useState(68);

  useEffect(() => {
    const header = document.querySelector('header') as HTMLElement | null;
    
    const updateHeight = () => {
      if (header) {
        setNavHeight(header.offsetHeight);
      }
    };

    // Medir altura inicial
    updateHeight();

    const onScroll = () => {
      // Desaparece exactamente cuando aparece el StickyWhatsApp (>600px)
      setVisible(window.scrollY < 600);
      updateHeight();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateHeight, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  const phone = whatsappNumber?.replace(/\D/g, '') || '';
  const waLink = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent('Hola! Quiero hacer un pedido 🛒')}`
    : '#';

  const BAR_HEIGHT = 40; // px — altura de la barra

  useEffect(() => {
    const header = document.querySelector('header') as HTMLElement | null;
    if (header) {
      header.style.transition = 'top 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      if (visible) {
        header.style.top = `${BAR_HEIGHT}px`;
      } else {
        header.style.top = '0';
      }
    }
  }, [visible]);

  return (
    <>
      {/* Espaciador estático que empuja el contenido hacia abajo */}
      <div
        style={{
          height: `${BAR_HEIGHT}px`,
          marginTop: `${navHeight}px`,
          transition: visible ? 'none' : 'height 0.4s ease',
          // Cuando se oculta la barra, el espaciador también colapsa
          ...(visible ? {} : { height: 0, marginTop: 0 }),
        }}
      />

      {/* Barra fija */}
      <div
        className={`${styles.bar} ${!visible ? styles.barHidden : ''}`}
        role="banner"
        aria-label="Compra por WhatsApp"
      >
        <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.inner}>
          <span className={styles.badge}>🔥 OFERTA</span>
          <span className={styles.text}>
            🛒 <strong>Compra por WhatsApp</strong>
            <span className={styles.extraText}> — Envío rápido · Pago contra entrega</span>
          </span>
          <span className={styles.cta}>Pedir ahora&nbsp;→</span>
        </a>
      </div>
    </>
  );
}
