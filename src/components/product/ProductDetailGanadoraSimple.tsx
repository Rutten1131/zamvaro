'use client';

import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './ProductDetailGanadoraSimple.module.css';
import * as fpixel from '@/lib/fpixel';
import { ECUADOR_LOCATIONS } from '@/data/ecuadorLocations';

interface Props {
  product: any;
}

interface Offer {
  quantity: number;
  price: number;
  originalPrice: number;
  title: string;
  badge: string;
  badgeClass: string;
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

export default function ProductDetailGanadoraSimple({ product }: Props) {
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
  const [priorityShipping, setPriorityShipping] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);

  // ── Countdown Timer (24h que reinicia) ──
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const stored = sessionStorage.getItem('ganadora_simple_timer_end');
    let endTime: number;
    if (stored) {
      endTime = parseInt(stored, 10);
      if (endTime < Date.now()) {
        endTime = Date.now() + 24 * 60 * 60 * 1000;
        sessionStorage.setItem('ganadora_simple_timer_end', String(endTime));
      }
    } else {
      const randomMs = (Math.floor(Math.random() * 170) + 9) * 60 * 1000;
      endTime = Date.now() + randomMs;
      sessionStorage.setItem('ganadora_simple_timer_end', String(endTime));
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
    setStockLeft(Math.floor(Math.random() * 8) + 5);
    setSoldToday(Math.floor(Math.random() * 80) + 40);
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

    const firstDelay = (Math.random() * 7 + 8) * 1000;
    const firstTimer = setTimeout(() => {
      showPopup();
      const recurring = setInterval(showPopup, (Math.random() * 20 + 25) * 1000);
      return () => clearInterval(recurring);
    }, firstDelay);

    return () => clearTimeout(firstTimer);
  }, []);

  const [showPhoneHint, setShowPhoneHint] = useState(false);

  const basePrice = parseFloat(product.price?.toString().replace(/[^\d.]/g, '')) || 24.99;

  const offers = (Array.isArray(product.promotions) && product.promotions.length > 0)
    ? product.promotions.map((p: any) => ({
        quantity: parseInt(p.quantity, 10) || 1,
        price: parseFloat(p.price) || 0,
        originalPrice: parseFloat(p.originalPrice) || parseFloat(p.price) || 0,
        title: p.title || '',
        badge: p.badge || '',
        badgeClass: styles[p.badgeClass] || styles.badgeOffer,
      }))
    : [
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

  const [selectedOfferIndex, setSelectedOfferIndex] = useState(2);
  const activeOfferIndex = selectedOfferIndex >= offers.length ? Math.max(0, offers.length - 1) : selectedOfferIndex;
  const activeOffer = offers[activeOfferIndex] || { price: 0, quantity: 1, title: '', originalPrice: 0, badge: '', badgeClass: '' };
  const totalPrice = activeOffer.price + ((priorityShipping && product.showPriorityShipping !== false) ? 1.99 : 0);
  const totalQuantity = activeOffer.quantity;

  const PROVINCES_CITIES = ECUADOR_LOCATIONS;

  const provinces = Object.keys(PROVINCES_CITIES);

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
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'province') {
        updated.city = '';
      }
      return updated;
    });
    if (name === 'whatsapp') setShowPhoneHint(value.length > 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [];
    if (!firstName.trim()) missing.push('Nombre');
    if (!lastName.trim()) missing.push('Apellido');
    if (!formData.whatsapp.trim()) missing.push('WhatsApp');
    if (!formData.street1.trim()) missing.push('Dirección de entrega');
    if (!formData.province) missing.push('Provincia');
    const resolvedCity = isCustomCity ? customCity.trim() : formData.city.trim();
    if (!resolvedCity) missing.push('Ciudad');

    if (missing.length > 0) {
      alert(`Por favor complete los campos obligatorios: ${missing.join(', ')}`);
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

      const fullName = `${firstName} ${lastName}`.trim();
      const finalFormData = {
        ...formData,
        fullName,
        email,
        city: resolvedCity
      };

      const response = await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          formData: finalFormData,
          totalPrice,
          quantity: totalQuantity,
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
      setFirstName('');
      setLastName('');
      setEmail('');
      setCustomCity('');
      setIsCustomCity(false);
      setTermsAccepted(false);
      setPriorityShipping(false);
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

  // Procesar botones configurados
  const buttonsConfig = Array.isArray(product.landingButtons) 
    ? product.landingButtons 
    : [];

  return (
    <div className={styles.container}>
      {/* ── Sales Popup ── */}
      {salesPopup && (
        <div className={styles.salesPopup}>
          <span className={styles.salesPopupEmoji}>🛒</span>
          <div>
            <strong>{salesPopup.name}</strong> de {salesPopup.city}
            <br />
            <span style={{ fontSize: '0.74rem', color: '#4b5563' }}>acaba de pedir este producto</span>
          </div>
          <CheckCircle size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
        </div>
      )}

      {/* ── Announcement Bar ── */}
      <div className={styles.announcement}>
        <div className={styles.announcementScroller}>
          <span>🔥 PAGO CONTRAENTREGA + ENVÍO GRATIS 🇪🇨</span>
          <span className={styles.announcementSep}>•</span>
          <span>⏱ OFERTA TERMINA EN: <strong className={styles.timerInline}>{pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}</strong></span>
          <span className={styles.announcementSep}>•</span>
          <span>🔥 {soldToday} Vendidos HOY — Solo quedan <strong>{stockLeft}</strong> unidades</span>
          <span className={styles.announcementSep}>•</span>
          <span>🔥 PAGO CONTRAENTREGA + ENVÍO GRATIS 🇪🇨</span>
        </div>
      </div>

      {/* ── Sub-header ── */}
      <div className={styles.trustBanner}>
        <span>📦 PAGO CONTRAENTREGA</span>
        <span>•</span>
        <span>🚚 ENVÍO GRATIS</span>
        <span>•</span>
        <span>✅ COMPRA 100% SEGURA</span>
      </div>

      {/* ── Media/Images stack with intermediate CTAs ── */}
      <div>
        {product.images && product.images.map((imgUrl: string, idx: number) => {
          if (!imgUrl) return null;

          const isVideo = imgUrl.toLowerCase().endsWith('.mp4') || imgUrl.toLowerCase().endsWith('.webm');
          const btnConfig = buttonsConfig[idx] || { show: false, text: '👉 HACER PEDIDO AHORA 🇪🇨' };

          return (
            <div key={idx} className={styles.imageSection}>
              {isVideo ? (
                <video
                  src={imgUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={styles.mediaItem}
                />
              ) : (
                <img
                  src={imgUrl}
                  alt={`${product.name} - Imagen ${idx + 1}`}
                  className={styles.mediaItem}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              )}

              {/* Botón CTA intermedio si está activo para este índice */}
              {btnConfig.show && (
                <div className={styles.ctaButtonWrapper}>
                  <button 
                    onClick={scrollToCheckout} 
                    className={`${styles.ctaButton} ${styles.movingButton}`}
                    style={{ backgroundColor: product.primaryColor || '#fda101' }}
                  >
                    <span className={styles.ctaHeadline}>{btnConfig.text || '👉 HACER PEDIDO AHORA 🇪🇨'}</span>
                    <span className={styles.ctaSubheadline}>
                      {btnConfig.subtext !== undefined && btnConfig.subtext !== null && btnConfig.subtext !== '' 
                        ? btnConfig.subtext 
                        : `LLEVATE ${totalQuantity} POR SOLO: $${totalPrice.toFixed(2)}`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Checkout COD Form ── */}
      <section id="checkout-direct-form" className={styles.checkoutContainer}>
        <div className={styles.checkoutHeader}>
          <div style={{ margin: '0 auto 12px', padding: '8px 16px', border: '1px solid #feb2b2', borderRadius: '10px', backgroundColor: '#fff5f5', color: '#c53030', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 'bold', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <span>⚠️</span>
            <span><strong>STOCK LIMITADO!</strong> La oferta termina en <strong style={{ color: '#e53e3e' }}>{pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}</strong></span>
          </div>
          <h2 className={styles.checkoutTitle} style={{ fontSize: '1.75rem', fontWeight: 800, textTransform: 'none', margin: '10px 0 20px', color: '#1a202c', textAlign: 'center' }}>Pago Contraentrega</h2>
        </div>

        {/* Celular warning */}
        <div className={styles.phoneAlert}>
          <AlertTriangle size={16} style={{ flexShrink: 0, color: '#d97706' }} />
          <span><strong>IMPORTANTE:</strong> Revisa que tu número de celular esté correcto. Te llamaremos para coordinar la entrega.</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Selector de packs */}
          <div className={styles.formGroup}>
            <label>🛒 Elige tu promoción:</label>
            <div className={styles.offersList}>
              {offers.map((offer: Offer, index: number) => {
                const isSelected = activeOfferIndex === index;
                const savings = offer.originalPrice - offer.price;
                const isPopular = offers.length > 0 && index === offers.length - 1;
                return (
                  <button
                    key={index}
                    type="button"
                    className={`${styles.offerCard} ${isSelected ? styles.offerCardActive : ''} ${isPopular ? styles.offerCardPopular : ''}`}
                    style={isSelected ? { borderColor: product.primaryColor || '#22c55e', backgroundColor: `${product.primaryColor || '#22c55e'}0D` } : {}}
                    onClick={() => setSelectedOfferIndex(index)}
                  >
                    {isPopular && <div className={styles.popularTag} style={{ backgroundColor: product.primaryColor || '#22c55e' }}>⭐ MEJOR OPCIÓN</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      {/* Radio button circle */}
                      <div className={styles.radioCircle} style={isSelected ? { borderColor: product.primaryColor || '#22c55e' } : {}}>
                        {isSelected && <div className={styles.radioDot} style={{ backgroundColor: product.primaryColor || '#22c55e' }} />}
                      </div>

                      {/* Product Thumbnail */}
                      {product.image && (
                        <img
                          src={product.image}
                          alt="Miniatura"
                          className={styles.offerThumb}
                        />
                      )}

                      <div className={styles.offerInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span className={styles.offerTitle}>{offer.title}</span>
                          <span className={`${styles.offerBadge} ${offer.badgeClass}`}>{offer.badge}</span>
                        </div>
                        {savings > 0 && (
                          <span style={{ fontSize: '0.74rem', color: '#38a169', fontWeight: 700 }}>
                            ✅ Ahorras ${savings.toFixed(2)}
                          </span>
                        )}
                      </div>
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

          {/* Paso 2: DATOS DE ENVIO */}
          <div className={styles.formGroup} style={{ marginTop: '20px' }}>
            <h3 className={styles.stepTitle}>Paso 2: DATOS DE ENVIO 👆</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              <div className={styles.formGroupSub}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: '4px' }}>Nombre *</label>
                <input 
                  type="text" 
                  name="firstName" 
                  placeholder="Ej: Juan" 
                  required 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  disabled={loading} 
                  className={styles.lightInputNoIcon} 
                />
              </div>
              <div className={styles.formGroupSub}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: '4px' }}>Apellido *</label>
                <input 
                  type="text" 
                  name="lastName" 
                  placeholder="Ej: Pérez" 
                  required 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  disabled={loading} 
                  className={styles.lightInputNoIcon} 
                />
              </div>
            </div>

            <div className={styles.formGroupSub} style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: '4px' }}>Número de WhatsApp (para notificaciones de envío) *</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #cbd5e0', padding: '10px 8px', borderRadius: '10px', backgroundColor: '#f7fafc', fontSize: '0.9rem', color: '#4a5568' }}>
                  <span>🇪🇨</span>
                  <span>+593</span>
                </div>
                <input 
                  type="tel" 
                  name="whatsapp" 
                  placeholder="Ej: 0987654321" 
                  required 
                  value={formData.whatsapp} 
                  onChange={handleInputChange} 
                  disabled={loading} 
                  className={styles.lightInputNoIcon} 
                  style={{ flex: 1 }}
                />
              </div>
              {showPhoneHint && (
                <div className={styles.phoneHint}>
                  ⚠️ Asegúrate de que sea tu número actual.
                </div>
              )}
            </div>



            <div className={styles.formGroupSub} style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: '4px' }}>Dirección Entrega: (2 calles y una referencia para el envío a domicilio) *</label>
              <input 
                type="text" 
                name="street1" 
                placeholder="Ej: Av. Principal y Calle Secundaria" 
                required 
                value={formData.street1} 
                onChange={handleInputChange} 
                disabled={loading} 
                className={styles.lightInputNoIcon} 
              />
              <span style={{ fontSize: '0.74rem', color: '#718096', marginTop: '4px', display: 'block' }}>Ejemplo: Av.Vicente y jose albaca alfrente del supermaxi casa de pisos</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div className={styles.formGroupSub}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: '4px' }}>Provincia *</label>
                <select 
                  name="province" 
                  required 
                  value={formData.province} 
                  onChange={handleInputChange} 
                  disabled={loading} 
                  className={styles.lightSelectNoIcon}
                >
                  <option value="">Provincia</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroupSub}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: '4px' }}>Ciudad *</label>
                {isCustomCity ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="text" 
                      placeholder="Escribe tu ciudad..." 
                      required 
                      value={customCity} 
                      onChange={(e) => setCustomCity(e.target.value)} 
                      disabled={loading} 
                      className={styles.lightInputNoIcon} 
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsCustomCity(false);
                        setCustomCity('');
                        setFormData(prev => ({ ...prev, city: '' }));
                      }}
                      style={{ padding: '0 12px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <select 
                    name="city" 
                    required 
                    value={formData.city} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Otros/Cantón') {
                        setIsCustomCity(true);
                      } else {
                        handleInputChange(e);
                      }
                    }} 
                    disabled={loading || !formData.province} 
                    className={styles.lightSelectNoIcon}
                  >
                    <option value="">Ciudad</option>
                    {formData.province && PROVINCES_CITIES[formData.province]?.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className={styles.formGroupSub} style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: '4px' }}>Pais *</label>
              <select disabled className={styles.lightSelectNoIcon} style={{ backgroundColor: '#edf2f7', color: '#718096', cursor: 'not-allowed' }}>
                <option value="Ecuador">Ecuador</option>
              </select>
            </div>
          </div>

          {/* Attention Message Box */}
          <div style={{ margin: '20px 0', padding: '16px', border: '2px dashed #ecc94b', borderRadius: '12px', backgroundColor: '#fffdf5', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ color: '#d69e2e', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>⚠️ ATENCIÓN ⚠️</span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#744210', lineHeight: 1.4, textAlign: 'center' }}>
              Tu pedido únicamente podrá salir de la bodega si tus datos están completos. Por favor, verifica que tu dirección esté correcta antes de continuar.
            </p>
          </div>

          {/* Paso 3: Metodo de Pago */}
          <div className={styles.formGroup} style={{ marginTop: '20px' }}>
            <h3 className={styles.stepTitle}>3 - Metodo de Pago 👆</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', border: '2px solid #e2e8f0', borderRadius: '12px', background: 'white', marginTop: '10px' }}>
              <input type="radio" checked readOnly style={{ accentColor: '#22c55e', width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2d3748' }}>Pago contraentrega</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '14px', padding: '16px', border: '1px solid #edf2f7', borderRadius: '12px', background: '#f7fafc' }}>
              <span style={{ fontSize: '2rem', marginBottom: '8px' }}>🚚</span>
              <p style={{ fontSize: '0.8rem', color: '#4a5568', lineHeight: 1.5, margin: 0 }}>
                Haga clic en "👉 <strong>CONFIRMAR MI COMPRA</strong>" para completar su compra. Solo pagará el pedido una vez que se entregue en su dirección.
              </p>
            </div>
          </div>

          {/* Paso 4: Resumen de tu Pedido */}
          <div className={styles.formGroup} style={{ marginTop: '20px' }}>
            <h3 className={styles.stepTitle}>4 - Resumen de tu Pedido 👆</h3>
            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginTop: '10px', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #edf2f7', backgroundColor: '#f7fafc', fontSize: '0.75rem', fontWeight: 800, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Producto</span>
                <span>Precio</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  {/* Thumbnail with Quantity Badge */}
                  {product.image && (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img 
                        src={product.image} 
                        alt="Miniatura" 
                        style={{ width: '50px', height: '50px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#718096', color: 'white', fontSize: '10px', fontWeight: 800, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {totalQuantity}
                      </span>
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#2d3748', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {activeOffer.title}
                    </div>
                    {activeOffer.badge && (
                      <span className={`${styles.offerBadge} ${activeOffer.badgeClass}`} style={{ marginTop: '4px' }}>
                        {activeOffer.badge}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#2f855a', marginLeft: '12px', flexShrink: 0 }}>
                  ${activeOffer.price.toFixed(2)}
                </span>
              </div>

              {/* Checkbox for priority shipping */}
              {product.showPriorityShipping !== false && (
                <div style={{ padding: '14px', borderTop: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: '10px', background: '#fff' }}>
                  <input 
                    type="checkbox" 
                    id="priorityShippingCheck" 
                    checked={priorityShipping} 
                    onChange={(e) => setPriorityShipping(e.target.checked)} 
                    style={{ width: '18px', height: '18px', accentColor: '#22c55e', cursor: 'pointer' }}
                  />
                  <label htmlFor="priorityShippingCheck" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4a5568', cursor: 'pointer' }}>
                    ⚡ Agregar Envío Prioritario por solo <span style={{ color: '#2b6cb0' }}>1.99$</span>
                  </label>
                </div>
              )}

              {/* Delivery Speed Promo Box */}
              {product.showDispatch24h !== false && (
                <div style={{ display: 'flex', gap: '12px', padding: '14px', borderTop: '1px solid #edf2f7', background: '#fff5f5', alignItems: 'center' }}>
                  <div style={{ display: 'flex', width: '50px', height: '50px', borderRadius: '8px', border: '1px solid #feb2b2', background: '#ffffff', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                    🚨
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '0.8rem', fontWeight: 800, color: '#e53e3e' }}>Despacho en 24 horas</h4>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#718096', lineHeight: 1.4 }}>
                      Tu paquete se enviará en menos de 24 horas y será prioridad en nuestros despachos.
                    </p>
                  </div>
                </div>
              )}

              {/* Total Display */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f7fafc', fontSize: '1.1rem', fontWeight: 800, color: '#2d3748' }}>
                <span>Total:</span>
                <span style={{ color: '#2f855a' }}>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Casilla de verificación de datos correctos */}
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <input 
              type="checkbox" 
              id="termsAcceptedCheck" 
              checked={termsAccepted} 
              onChange={(e) => setTermsAccepted(e.target.checked)} 
              style={{ width: '18px', height: '18px', accentColor: '#22c55e', cursor: 'pointer' }}
            />
            <label htmlFor="termsAcceptedCheck" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4a5568', cursor: 'pointer' }}>
              Confirmar que mis datos de envío están correctos y pagaré al recibir 📦
            </label>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={loading}
            >
              {loading ? '⏳ PROCESANDO...' : 'CONFIRMAR MI COMPRA'}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', fontWeight: 800, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            PAGO CONTRA ENTREGA • ENVÍO GRATIS
          </div>
        </form>
      </section>
    </div>
  );
}
