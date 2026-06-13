'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Phone, MapPin, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './ProductDetailGanadora.module.css';
import * as fpixel from '@/lib/fpixel';
import LazySection from '../LazySection';

interface Props {
  product: any;
}

const FAKE_BUYERS = [
  'María G.', 'Carlos M.', 'Lucía P.', 'Andrés T.', 'Valentina R.',
  'Fernando S.', 'Daniela Q.', 'Roberto E.', 'Patricia L.', 'Miguel A.',
  'Carolina N.', 'Diego V.', 'Sofía H.', 'Javier C.', 'Isabel O.',
];
const CITIES = [
  'Quito', 'Guayaquil', 'Cuenca', 'Manta', 'Ambato',
  'Loja', 'Riobamba', 'Ibarra', 'Portoviejo', 'Machala',
];

export default function ProductDetailGanadora({ product }: Props) {
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    street1: '',
    street2: '',
    neighborhood: '',
    reference: '',
    province: '',
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // ── Countdown Timer (24h que reinicia) ──
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    // Guardar en sessionStorage para que no cambie al recargar en la misma sesión
    const stored = sessionStorage.getItem('ganadora_timer_end');
    let endTime: number;
    if (stored) {
      endTime = parseInt(stored, 10);
      if (endTime < Date.now()) {
        endTime = Date.now() + 24 * 60 * 60 * 1000;
        sessionStorage.setItem('ganadora_timer_end', String(endTime));
      }
    } else {
      // Tiempo aleatorio entre 9 min y 3 horas para urgencia realista
      const randomMs = (Math.floor(Math.random() * 170) + 9) * 60 * 1000;
      endTime = Date.now() + randomMs;
      sessionStorage.setItem('ganadora_timer_end', String(endTime));
    }

    const tick = () => {
      const diff = Math.max(0, endTime - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({ h, m, s });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Stock counter dinámico ──
  const [stockLeft, setStockLeft] = useState(0);
  const [soldToday, setSoldToday] = useState(0);
  useEffect(() => {
    setStockLeft(Math.floor(Math.random() * 8) + 5); // 5-12 unidades
    setSoldToday(Math.floor(Math.random() * 80) + 40); // 40-120 vendidos hoy
  }, []);

  // ── Sales popup notification ──
  const [salesPopup, setSalesPopup] = useState<{ name: string; city: string } | null>(null);
  useEffect(() => {
    const showPopup = () => {
      const name = FAKE_BUYERS[Math.floor(Math.random() * FAKE_BUYERS.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      setSalesPopup({ name, city });
      setTimeout(() => setSalesPopup(null), 4000);
    };

    // Primera aparición: 8-15 segundos
    const firstDelay = (Math.random() * 7 + 8) * 1000;
    const firstTimer = setTimeout(() => {
      showPopup();
      // Repetir cada 25-45 segundos
      const recurring = setInterval(showPopup, (Math.random() * 20 + 25) * 1000);
      return () => clearInterval(recurring);
    }, firstDelay);

    return () => clearTimeout(firstTimer);
  }, []);

  // ── Phone validation hint ──
  const [showPhoneHint, setShowPhoneHint] = useState(false);

  const basePrice = parseFloat(product.price?.toString().replace(/[^\d.]/g, '')) || 24.99;

  const offers = [
    {
      quantity: 1,
      price: basePrice,
      originalPrice: basePrice,
      title: `1 unidad — ${product.name}`,
      badge: 'OFERTA 😜',
      badgeClass: styles.badgeOffer,
    },
    {
      quantity: 2,
      price: parseFloat((basePrice * 2 * 0.8).toFixed(2)),
      originalPrice: basePrice * 2,
      title: `2 unidades — ${product.name}`,
      badge: '20% OFF 🤩',
      badgeClass: styles.badgeSpecial,
    },
    {
      quantity: 3,
      price: parseFloat((basePrice * 3 * 0.72).toFixed(2)),
      originalPrice: basePrice * 3,
      title: `3 unidades — ${product.name}`,
      badge: '🔥 EL MÁS PEDIDO',
      badgeClass: styles.badgeBest,
    },
  ];

  const [selectedOfferIndex, setSelectedOfferIndex] = useState(2); // Seleccionar el más popular por defecto
  const activeOffer = offers[selectedOfferIndex];
  const totalPrice = activeOffer.price;
  const totalQuantity = activeOffer.quantity;
  const heroBgImage = product.images?.[0] || product.image || '';
  const galleryImages = product.images?.slice(1) || [];

  const provinces = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro',
    'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos',
    'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha',
    'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua',
    'Zamora Chinchipe'
  ];

  useEffect(() => {
    fpixel.event('InitiateCheckout', {
      content_name: product.name,
      content_ids: [product.id?.toString() || '0'],
      content_type: 'product',
      value: totalPrice,
      currency: 'USD',
    });
  }, [product, totalPrice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'whatsapp') setShowPhoneHint(value.length > 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.whatsapp || !formData.street1 || !formData.neighborhood || !formData.province || !formData.city) {
      alert('Por favor complete los campos obligatorios (*)');
      return;
    }
    if (!termsAccepted) {
      alert('Por favor confirma que tus datos son correctos marcando la casilla.');
      return;
    }
    setLoading(true);
    try {
      const eventId = 'pur_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      const fbp = fpixel.getCookie('_fbp') || sessionStorage.getItem('_fbp') || '';
      let fbc = fpixel.getCookie('_fbc') || sessionStorage.getItem('_fbc') || '';
      const fbclid = sessionStorage.getItem('fbclid') || '';
      if (!fbc && fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;

      const response = await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product, formData, totalPrice, quantity: totalQuantity,
          offer: activeOffer.title,
          fbTracking: { fbp, fbc, fbclid },
          eventId
        }),
      });

      if (!response.ok) throw new Error('Error al enviar los datos del pedido.');

      fpixel.event('Purchase', {
        content_name: product.name,
        content_ids: [product.id?.toString() || '0'],
        content_type: 'product',
        value: totalPrice,
        currency: 'USD',
      }, { eventID: eventId });

      alert('¡Tu pedido fue registrado con éxito! 🎉 Nos comunicaremos contigo pronto para confirmar tu entrega. Gracias por confiar en Zamvaro Ecuador.');
      setFormData({ fullName: '', whatsapp: '', street1: '', street2: '', neighborhood: '', reference: '', province: '', city: '' });
      setTermsAccepted(false);
    } catch (err) {
      alert('Ocurrió un error al procesar tu compra. Por favor inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToCheckout = () => {
    const el = document.getElementById('checkout-direct-form');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={14} className={styles.starIcon} fill={i < rating ? '#facc15' : 'none'} stroke="#facc15" />
    ));

  const whatsappNum = product.whatsappNumber || '593939243014';

  return (
    <>
      {/* ── Sales Popup ── */}
      {salesPopup && (
        <div className={styles.salesPopup}>
          <span className={styles.salesPopupEmoji}>🛒</span>
          <div>
            <strong>{salesPopup.name}</strong> de {salesPopup.city}
            <br />
            <span style={{ fontSize: '0.78rem', color: '#4b5563' }}>acaba de pedir este producto</span>
          </div>
          <CheckCircle size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
        </div>
      )}

      {/* ── Announcement Bar con Countdown ── */}
      <div className={styles.announcement}>
        <div className={styles.announcementScroller}>
          <span>🔥 PAGO CONTRAENTREGA + ENVÍO GRATIS 🇪🇨</span>
          <span className={styles.announcementSep}>•</span>
          <span>⏱ OFERTA TERMINA EN: <strong className={styles.timerInline}>{pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}</strong></span>
          <span className={styles.announcementSep}>•</span>
          <span>🔥 {soldToday} Vendidos HOY — Solo quedan <strong>{stockLeft}</strong> unidades</span>
          <span className={styles.announcementSep}>•</span>
          <span>🔥 PAGO CONTRAENTREGA + ENVÍO GRATIS 🇪🇨</span>
          <span className={styles.announcementSep}>•</span>
          <span>⏱ OFERTA TERMINA EN: <strong className={styles.timerInline}>{pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}</strong></span>
        </div>
      </div>

      {/* ── Sub-header de urgencia ── */}
      <div className={styles.subHeader}>
        <span>📦 PAGO CONTRAENTREGA</span>
        <span className={styles.subHeaderDot}>+</span>
        <span>🚚 ENVÍO GRATIS</span>
        <span className={styles.subHeaderDot}>+</span>
        <span>✅ GARANTÍA DE SATISFACCIÓN</span>
      </div>

      {/* ── NEW HERO SECTION with Background Image overlay ── */}
      <section 
        className={styles.heroSection}
        style={{
          backgroundImage: heroBgImage ? `url(${heroBgImage})` : 'none'
        }}
      >
        <div className={styles.heroOverlay}>
          <div className={styles.heroTopGroup}>
            <span className={styles.categoryTag}>{product.category || 'Zamvaro Exclusivo'}</span>
            
            {/* Texto llamativo del problema */}
            {product.problemHeadline && (
              <h2 className={styles.heroProblemHeadline}>{product.problemHeadline}</h2>
            )}
            
            {/* Solución con el nombre del producto */}
            <h1 className={styles.heroTitle}>
              Recupera el bienestar con <span className={styles.highlightText}>{product.name}</span>
            </h1>
            <p className={styles.heroSubtitle}>{product.subtitle}</p>

            {/* Calificación y opiniones */}
            <div className={styles.starsRow} onClick={scrollToCheckout} style={{ cursor: 'pointer' }}>
              <div className={styles.stars}>{renderStars(5)}</div>
              <span className={styles.ratingText} style={{ color: '#ffffff' }}>
                4.9/5 — ({Math.floor(Math.random() * 200) + 300} opiniones)
              </span>
            </div>
          </div>

          <div className={styles.heroBottomGroup}>
            {/* Selector de Promociones (Packs de compra) con estilo de botones limpios */}
            <div className={styles.heroOffersGrid}>
              {offers.map((offer, index) => {
                const isSelected = selectedOfferIndex === index;
                return (
                  <button
                    key={index}
                    type="button"
                    className={`${styles.heroOfferButton} ${isSelected ? styles.heroOfferButtonActive : ''}`}
                    onClick={() => setSelectedOfferIndex(index)}
                  >
                    <span className={styles.heroOfferQty}>{offer.quantity} {offer.quantity === 1 ? 'Unidad' : 'Unidades'}</span>
                    <span className={styles.heroOfferPrice}>${offer.price.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>

            {/* Envíos y Pagos */}
            <div className={styles.heroBadgesRow}>
              <div className={styles.heroBadgeItem}>
                <span className={styles.heroBadgeIcon}>🚚</span>
                <span>ENVÍO GRATIS</span>
              </div>
              <div className={styles.heroBadgeItem}>
                <span className={styles.heroBadgeIcon}>💵</span>
                <span>PAGO CONTRAENTREGA</span>
              </div>
            </div>

            {/* Botón de aprovechar hoy / scroll */}
            <div className={styles.heroCtaContainer}>
              <button onClick={scrollToCheckout} className={styles.heroCtaBtn}>
                APROVECHA SOLO POR HOY
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.container}>
        {/* ── Remaining gallery images (if any) shown below ── */}
        {galleryImages.length > 0 && (
          <section className={styles.mediaStack} style={{ marginTop: '24px' }}>
            {galleryImages.map((img: string, idx: number) => (
              img.toLowerCase().endsWith('.mp4') || img.toLowerCase().endsWith('.webm') ? (
                <video key={idx} src={img} autoPlay loop muted playsInline className={styles.mediaItem} style={{ width: '100%', height: 'auto', display: 'block' }} />
              ) : (
                <img key={idx} src={img} alt={`${product.name} ${idx + 2}`} className={styles.mediaItem} loading="lazy" />
              )
            ))}
          </section>
        )}

        {/* ── Bullets ── */}
        <section className={styles.bulletsList}>
          {product.bullets && product.bullets.map((bullet: string, idx: number) => (
            <div key={idx} className={styles.bullet}>
              <span className={styles.bulletEmoji}>✅</span>
              <span>{bullet}</span>
            </div>
          ))}
        </section>

        {/* ── Sección 1: PROBLEMA ── */}
        {(product.imageProblem || (product.problemFactors && product.problemFactors.length > 0)) && (
          <section style={{
            margin: '40px 0',
            padding: '28px 20px',
            borderRadius: '24px',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '2px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            {product.problemHeadline && (
              <h2 style={{
                fontSize: '1.45rem',
                fontWeight: 900,
                color: '#ef4444',
                textAlign: 'center',
                lineHeight: 1.25,
                marginBottom: '8px'
              }}>
                {product.problemHeadline}
              </h2>
            )}
            {product.problemTagline && (
              <p style={{
                fontSize: '0.9rem',
                color: '#cbd5e1',
                textAlign: 'center',
                fontWeight: 500,
                marginBottom: '20px',
                lineHeight: 1.4
              }}>
                {product.problemTagline}
              </p>
            )}

            {product.imageProblem && (
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                marginBottom: '20px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {product.imageProblem.toLowerCase().endsWith('.mp4') || product.imageProblem.toLowerCase().endsWith('.webm') ? (
                  <video src={product.imageProblem} autoPlay loop muted playsInline style={{ width: '100%', height: 'auto', display: 'block' }} />
                ) : (
                  <img src={product.imageProblem} alt="Problema que resuelve" style={{ width: '100%', height: 'auto', display: 'block' }} />
                )}
              </div>
            )}

            {product.problemFactors && product.problemFactors.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                {product.problemFactors.map((factor: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      ✕
                    </span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: '#ffffff', fontWeight: 700 }}>
                        {factor.label}
                      </strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        {factor.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Sección 2: CARACTERÍSTICAS / TECNOLOGÍA ── */}
        {(product.imageFeatures || (product.features && product.features.length > 0)) && (
          <section style={{
            margin: '40px 0',
            padding: '28px 20px',
            borderRadius: '24px',
            background: 'var(--color-card-bg-dark, rgba(255, 255, 255, 0.03))',
            border: '2px solid var(--color-border-dark, rgba(255, 255, 255, 0.08))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: 900,
              color: 'var(--color-accent-gold, #fbbf24)',
              textAlign: 'center',
              lineHeight: 1.25,
              marginBottom: '20px'
            }}>
              ✨ Descubre la Tecnología y Beneficios de {product.name}
            </h2>

            {product.imageFeatures && (
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                marginBottom: '24px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {product.imageFeatures.toLowerCase().endsWith('.mp4') || product.imageFeatures.toLowerCase().endsWith('.webm') ? (
                  <video src={product.imageFeatures} autoPlay loop muted playsInline style={{ width: '100%', height: 'auto', display: 'block' }} />
                ) : (
                  <img src={product.imageFeatures} alt="Tecnología única" style={{ width: '100%', height: 'auto', display: 'block' }} />
                )}
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {product.features.map((feat: any, idx: number) => (
                  <div key={idx} style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{ fontSize: '1.6rem', flexShrink: 0, marginTop: '-2px' }}>
                      {feat.emoji || '⚡'}
                    </span>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                        {feat.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45 }}>
                        {feat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Sección 3: CÓMO USAR (Pasos) ── */}
        {(product.imageHowTo || (product.steps && product.steps.length > 0)) && (
          <LazySection height="300px">
            <section style={{
              margin: '40px 0',
              padding: '28px 20px',
              borderRadius: '24px',
              background: 'var(--color-card-bg-dark, rgba(255, 255, 255, 0.03))',
              border: '2px solid var(--color-border-dark, rgba(255, 255, 255, 0.08))',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{
                fontSize: '1.45rem',
                fontWeight: 900,
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.25,
                marginBottom: '20px'
              }}>
                📋 ¿Cómo se usa? En solo 3 simples pasos
              </h2>

              {product.imageHowTo && (
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  marginBottom: '24px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  {product.imageHowTo.toLowerCase().endsWith('.mp4') ? (
                    <video src={product.imageHowTo} autoPlay loop muted playsInline style={{ width: '100%', height: 'auto', display: 'block' }} />
                  ) : (
                    <img src={product.imageHowTo} alt="Cómo usar paso a paso" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  )}
                </div>
              )}

              {product.steps && product.steps.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '8px' }}>
                  {product.steps.map((step: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--color-primary, #7c3aed)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        fontSize: '0.85rem',
                        fontWeight: '900',
                        flexShrink: 0,
                        boxShadow: '0 3px 8px rgba(0,0,0,0.3)'
                      }}>
                        {step.number || `0${idx + 1}`}
                      </span>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{step.emoji}</span> {step.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45 }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </LazySection>
        )}

        {/* ── Testimonios ── */}
        {product.testimonials && product.testimonials.length > 0 && (
          <LazySection height="400px">
            <section className={styles.reviewsSection}>
              <h2 className={styles.sectionTitle}>⭐ Lo que dicen nuestros clientes</h2>
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
                4.9/5 basado en {(Math.floor(Math.random() * 400) + 800)} reseñas verificadas
              </p>
              <div className={styles.reviewsList}>
                {product.testimonials.map((t: any, idx: number) => {
                  const daysAgo = [1, 2, 3, 5, 7, 10, 14][idx % 7];
                  return (
                    <div key={idx} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewerInfo}>
                          <div className={styles.avatar}>{t.avatar || '👩'}</div>
                          <div>
                            <div className={styles.reviewerName}>{t.name} <span style={{ color: '#3b82f6', fontSize: '0.7rem', marginLeft: '4px' }}>✔️ Compra verificada</span></div>
                            <div className={styles.reviewerCity}>📍 {t.city || 'Ecuador'} · hace {daysAgo} {daysAgo === 1 ? 'día' : 'días'}</div>
                          </div>
                        </div>
                        <div className={styles.reviewStars}>{renderStars(t.rating || 5)}</div>
                      </div>
                      <p className={styles.reviewText}>"{t.text}"</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </LazySection>
        )}

        {/* ── FORMULARIO DE PEDIDO (CHECKOUT COD) AL FINAL ── */}
        <section id="checkout-direct-form" className={styles.checkoutContainer}>
          <div className={styles.checkoutHeader}>
            <div className={styles.checkoutBadge}>📦 PEDIDO CONTRAENTREGA</div>
            <h2 className={styles.checkoutTitle}>COMPLETA TU PEDIDO</h2>
            <p className={styles.checkoutSubtitle}>👉 Llena tus datos y paga cuando recibas en casa</p>
          </div>

          {/* Alerta de celular */}
          <div className={styles.phoneAlert}>
            <AlertTriangle size={16} style={{ flexShrink: 0, color: '#d97706' }} />
            <span><strong>IMPORTANTE:</strong> Revisa que tu número de celular sea correcto ☝️ Te contactaremos para confirmar tu pedido.</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Selector de ofertas */}
            <div className={styles.formGroup}>
              <label style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                🛒 Confirma tu paquete:
              </label>
              <div className={styles.offersList}>
                {offers.map((offer, index) => {
                  const isSelected = selectedOfferIndex === index;
                  const savings = offer.originalPrice - offer.price;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`${styles.offerCard} ${isSelected ? styles.offerCardActive : ''} ${index === 2 ? styles.offerCardPopular : ''}`}
                      onClick={() => setSelectedOfferIndex(index)}
                    >
                      {index === 2 && <div className={styles.popularTag}>⭐ EL MÁS PEDIDO</div>}
                      <div className={styles.offerInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={styles.offerTitle}>{offer.title}</span>
                          <span className={`${styles.offerBadge} ${offer.badgeClass}`}>{offer.badge}</span>
                        </div>
                        {savings > 0 && (
                          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>
                            ✅ Ahorras ${savings.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className={styles.offerPrices}>
                        {offer.originalPrice > offer.price && (
                          <span className={styles.offerOriginalPrice}>${offer.originalPrice.toFixed(2)}</span>
                        )}
                        <span className={styles.offerCurrentPrice}>${offer.price.toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nombre */}
            <div className={styles.formGroup}>
              <label>Nombre y Apellido *</label>
              <div className={styles.inputIconWrap}>
                <User size={16} className={styles.inputIcon} />
                <input type="text" name="fullName" placeholder="Ej: Carlos Pérez" required value={formData.fullName} onChange={handleInputChange} disabled={loading} className={styles.darkInput} />
              </div>
            </div>

            {/* Celular */}
            <div className={styles.formGroup}>
              <label>WhatsApp / Celular *</label>
              <div className={styles.inputIconWrap}>
                <Phone size={16} className={styles.inputIcon} />
                <input type="tel" name="whatsapp" placeholder="Ej: 0989897319" required value={formData.whatsapp} onChange={handleInputChange} disabled={loading} className={styles.darkInput} />
              </div>
              {showPhoneHint && (
                <div className={styles.phoneHint}>
                  ☝️ <strong>Revisa si tu número de celular está correcto</strong>
                </div>
              )}
            </div>

            {/* Calle Principal */}
            <div className={styles.formGroup}>
              <label>Calle Principal *</label>
              <div className={styles.inputIconWrap}>
                <MapPin size={16} className={styles.inputIcon} />
                <input type="text" name="street1" placeholder="Ej: Av. Eloy Alfaro N52-30" required value={formData.street1} onChange={handleInputChange} disabled={loading} className={styles.darkInput} />
              </div>
            </div>

            {/* Calle Secundaria */}
            <div className={styles.formGroup}>
              <label>Calle Secundaria / Referencia *</label>
              <div className={styles.inputIconWrap}>
                <MapPin size={16} className={styles.inputIcon} />
                <input type="text" name="street2" placeholder="Ej: Calle Guadalupe — junto al parque" required value={formData.street2} onChange={handleInputChange} disabled={loading} className={styles.darkInput} />
              </div>
            </div>

            {/* Barrio */}
            <div className={styles.formGroup}>
              <label>Barrio / Sector *</label>
              <div className={styles.inputIconWrap}>
                <MapPin size={16} className={styles.inputIcon} />
                <input type="text" name="neighborhood" placeholder="Ej: La Carolina, El Inca..." required value={formData.neighborhood} onChange={handleInputChange} disabled={loading} className={styles.darkInput} />
              </div>
            </div>

            {/* Provincia y Ciudad */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className={styles.formGroup}>
                <label>Provincia *</label>
                <select name="province" required value={formData.province} onChange={handleInputChange} disabled={loading} className={styles.darkSelect}>
                  <option value="">Provincia</option>
                  {provinces.map((prov) => (<option key={prov} value={prov}>{prov}</option>))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Ciudad / Cantón *</label>
                <div className={styles.inputIconWrap}>
                  <MapPin size={16} className={styles.inputIcon} />
                  <input type="text" name="city" placeholder="Ciudad" required value={formData.city} onChange={handleInputChange} disabled={loading} className={styles.darkInput} />
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="termsAccepted" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required className={styles.checkboxInput} disabled={loading} />
                <span>✅ Mis datos son correctos y pagaré al momento de la entrega</span>
              </label>
            </div>

            {/* Resumen del pedido */}
            <div className={styles.orderSummary}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8' }}>
                <span>Producto ({totalQuantity}x)</span>
                <span>${activeOffer.originalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981' }}>
                <span>🚚 Envío</span>
                <span>GRATIS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', borderTop: '2px dashed rgba(255,255,255,0.1)', paddingTop: '10px', marginTop: '4px' }}>
                <span>Total a pagar:</span>
                <span style={{ color: '#10b981' }}>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading} style={{ fontSize: '1.05rem' }}>
              {loading ? '⏳ PROCESANDO...' : `👉 CONFIRMAR PEDIDO — $${totalPrice.toFixed(2)}`}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px' }}>
              🔒 Pago 100% seguro al recibir en tu domicilio
            </p>
          </form>

          {/* Logos de courier */}
          <div className={styles.courierSection}>
            <p className={styles.courierLabel}>📦 Enviamos a través de:</p>
            <div className={styles.courierLogos}>
              {['Servientrega', 'Gintracom', 'Urbano Express', 'Laar Courier'].map((courier) => (
                <div key={courier} className={styles.courierBadge}>{courier}</div>
              ))}
            </div>
          </div>

          {/* Badges de confianza */}
          <div className={styles.badgesGrid}>
            <div className={styles.badge}><span className={styles.badgeIcon}>🔒</span><span>Compra segura</span></div>
            <div className={styles.badge}><span className={styles.badgeIcon}>🇪🇨</span><span>Todo el país</span></div>
            <div className={styles.badge}><span className={styles.badgeIcon}>💵</span><span>Pago al recibir</span></div>
            <div className={styles.badge}><span className={styles.badgeIcon}>↩️</span><span>Garantía 15 días</span></div>
          </div>
        </section>

        {/* ── FAQs ── */}
        {product.faqs && product.faqs.length > 0 && (
          <LazySection height="300px">
            <section className={styles.faqSection}>
              <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
              <div className={styles.faqList}>
                {product.faqs.map((faq: any, idx: number) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className={styles.faqItem}>
                      <button className={styles.faqQuestion} onClick={() => setOpenFaqIndex(isOpen ? null : idx)}>
                        <span>{faq.question}</span>
                        <span style={{ fontSize: '1.2rem', color: 'var(--color-primary, #a855f7)' }}>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && <div className={styles.faqAnswer}>{faq.answer}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          </LazySection>
        )}

        {/* ── CTA Final ── */}
        <div className={styles.finalCta}>
          <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
            🔥 ¿Listo para pedir tu {product.name}?
          </p>
          <button onClick={scrollToCheckout} className={styles.submitBtn} style={{ width: '100%' }}>
            ¡ORDENAR AHORA CON ENVÍO GRATIS! 🚀
          </button>
          <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
            Pago al recibir · Envío gratis · Garantía 15 días
          </p>
        </div>
      </div>

      {/* ── Botón flotante de WhatsApp ── */}
      <a
        href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(`Hola! Quiero pedir: ${product.name}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappFloat}
        aria-label="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="28" height="28" fill="white"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.824.738 5.476 2.031 7.78L0 32l8.469-2.001A15.935 15.935 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.277 13.277 0 01-6.773-1.853l-.485-.288-4.999 1.181 1.239-4.873-.319-.506A13.263 13.263 0 012.667 16C2.667 8.648 8.648 2.667 16 2.667S29.333 8.648 29.333 16 23.352 29.333 16 29.333zm7.273-10.001c-.397-.199-2.352-1.161-2.717-1.293-.364-.133-.629-.199-.893.199-.264.399-1.022 1.293-1.254 1.559-.232.265-.463.299-.859.1-.397-.199-1.675-.617-3.192-1.969-1.18-1.053-1.977-2.353-2.209-2.751-.232-.398-.025-.614.174-.812.178-.178.397-.463.596-.695.199-.231.265-.397.397-.662.132-.265.066-.497-.033-.696-.1-.198-.893-2.152-1.224-2.946-.323-.776-.65-.672-.893-.684-.232-.012-.497-.015-.761-.015s-.695.099-.1059.497c-.364.397-1.389 1.358-1.389 3.311s1.422 3.84 1.621 4.107c.199.265 2.799 4.273 6.782 5.993.948.409 1.688.653 2.265.836.952.302 1.818.259 2.502.157.763-.113 2.352-.961 2.685-1.89.332-.929.332-1.725.232-1.89-.099-.165-.364-.265-.761-.464z"/></svg>
      </a>
    </>
  );
}
