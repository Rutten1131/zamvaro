'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import styles from './Footer.module.css';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
];

const legalLinks = [
  { href: '/terminos-y-condiciones', label: 'Términos y Condiciones' },
  { href: '/politica-de-privacidad', label: 'Política de Privacidad' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/">
              <Image
                src="/logo.webp"
                alt="Zamvaro Ecuador"
                width={140}
                height={42}
                style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <p className={styles.brandTagline}>
              Compra contraentrega en Ecuador.
              Compra segura, sin tarjeta, sin riesgo.
            </p>
            <div className={styles.socials}>
              <a
                href="https://instagram.com/zamvaro.ec"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="Instagram"
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a
                href="https://www.facebook.com/people/Zamvaro/61560653776134/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                aria-label="Facebook"
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1-0 0 1 1-1h3z"/></svg>
              </a>
              <a
                href="https://wa.me/593939243014"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.socialBtn} ${styles.whatsappBtn}`}
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Navegación</h4>
            <ul className={styles.colLinks}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.colLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Contacto</h4>
            <ul className={styles.contactList}>
              <li>
                <span className={styles.contactIcon}>📍</span>
                <span>Ecuador</span>
              </li>
              <li>
                <span className={styles.contactIcon}>💬</span>
                <a href="https://wa.me/593939243014" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                  WhatsApp: +593 93 924 3014
                </a>
              </li>
              <li>
                <span className={styles.contactIcon}>📧</span>
                <a href="mailto:ecuador@zamvaro.com" className={styles.contactLink}>
                  ecuador@zamvaro.com
                </a>
              </li>
            </ul>

            {/* Trust badges */}
            <div className={styles.trustBadges}>
              <span className={styles.trustBadge}>💵 Pago Contraentrega</span>
              <span className={styles.trustBadge}>🔒 Compra Segura</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            Diseñado por <a href="http://cesarreyesjaramillo.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit' }}>Cesar Reyes</a> | Zamvaro Ecuador {currentYear}
          </p>
          <div className={styles.legalLinks}>
            {legalLinks.map((link) => (
              <Link key={link.label} href={link.href} className={styles.legalLink}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
