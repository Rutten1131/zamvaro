'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, ShoppingBag } from 'lucide-react';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
];

interface NavbarProps {
  isProductPage?: boolean;
  whatsappNumber?: string;
}

export default function Navbar({ isProductPage = false, whatsappNumber }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const phone = whatsappNumber?.replace(/\D/g, '') || '';
  const waLink = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent('Hola! Quiero hacer un pedido 🛒')}`
    : '#';

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${isProductPage ? styles.productHeader : ''}`}>
      {isProductPage && (
        <>
          <div className={styles.mobileTopbar}>
            {/* Left: Infinite moving buying CTA button (60% width) */}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.mobileBuyTicker}>
              <div className={styles.tickerTrack}>
                <span className={styles.tickerItem}>🛒 COMPRA POR WHATSAPP - PAGUE AL RECIBIR &nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
                <span className={styles.tickerItem}>🛒 COMPRA POR WHATSAPP - PAGUE AL RECIBIR &nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
                <span className={styles.tickerItem}>🛒 COMPRA POR WHATSAPP - PAGUE AL RECIBIR &nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
              </div>
            </a>

            {/* Middle: Ecuador */}
            <div className={styles.mobileEcuador}>
              <span className={styles.flag}>🇪🇨</span>
              <span className={styles.ecuadorText}>Ecuador</span>
            </div>

            {/* Right: Hamburger button */}
            <button
              className={styles.mobileHamburger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} className={styles.hamburgerIcon} /> : <Menu size={22} className={styles.hamburgerIcon} />}
            </button>
          </div>
          {/* Static spacer to push content below the fixed mobile topbar */}
          <div className={styles.mobileTopbarSpacer} />
        </>
      )}

      <nav className={`${styles.nav} ${isProductPage ? styles.navProductPage : ''}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.webp"
            alt="Zamvaro Ecuador"
            width={160}
            height={48}
            priority
            style={{ objectFit: 'contain' }}
          />
          <span className={styles.logoCountry}>Ecuador</span>
        </Link>

        {/* Desktop Links */}
        <ul className={styles.links}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <Link href="/productos" className={`btn-primary ${styles.ctaBtn}`}>
          <ShoppingBag size={16} />
          Ver Productos
        </Link>

        {/* Mobile Hamburger (Only visible if not product page layout on mobile, or managed by CSS) */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        {/* Brand Header inside menu drawer */}
        <div className={styles.mobileMenuHeader}>
          <div className={styles.mobileMenuBrand}>
            <Image
              src="/logo.webp"
              alt="Zamvaro Logo"
              width={100}
              height={32}
              style={{ objectFit: 'contain' }}
            />
            <span className={styles.mobileMenuBrandName}>Zambaro</span>
          </div>
        </div>
        <ul className={styles.mobileLinks}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/productos"
          className={`btn-primary ${styles.mobileCta}`}
          onClick={() => setMenuOpen(false)}
        >
          <ShoppingBag size={16} />
          Ver Productos
        </Link>
      </div>
    </header>
  );
}
