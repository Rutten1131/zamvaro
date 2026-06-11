'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, Phone, MapPin, Star, AlertTriangle, ShieldCheck, Truck, RefreshCw, CheckCircle } from 'lucide-react';
import styles from './ProductDetailGanadora.module.css';
import * as fpixel from '@/lib/fpixel';
import LazySection from '../LazySection';

interface Props {
  product: any;
}

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

  const basePrice = parseFloat(product.price?.toString().replace(/[^\d.]/g, '')) || 24.99;

  const offers = [
    {
      quantity: 1,
      price: basePrice,
      originalPrice: basePrice,
      title: `Compra 1 ${product.name} en OFERTA!`,
      badge: 'OFERTA 😜',
      badgeClass: styles.badgeOffer,
    },
    {
      quantity: 2,
      price: product.slug?.includes('esterilizador') || product.slug?.includes('secador') ? 40.00 : parseFloat((basePrice * 2 * 0.8).toFixed(2)),
      originalPrice: basePrice * 2,
      title: `Compra 2 ${product.name}`,
      badge: 'OFERTA ESPECIAL 🤩',
      badgeClass: styles.badgeSpecial,
    },
    {
      quantity: 3,
      price: product.slug?.includes('esterilizador') || product.slug?.includes('secador') ? 54.00 : parseFloat((basePrice * 3 * 0.72).toFixed(2)),
      originalPrice: basePrice * 3,
      title: `¡Compra 3 ${product.name} en OFERTON!`,
      badge: 'EL MÁS VENDIDO 🤩🔥',
      badgeClass: styles.badgeBest,
    },
  ];

  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const activeOffer = offers[selectedOfferIndex];
  const totalPrice = activeOffer.price;
  const totalQuantity = activeOffer.quantity;

  const provinces = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro',
    'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos',
    'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha',
    'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua',
    'Zamora Chinchipe'
  ];

  // Track InitiateCheckout on page load
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.whatsapp || !formData.street1 || !formData.neighborhood || !formData.province || !formData.city) {
      alert('Por favor complete los campos obligatorios (*)');
      return;
    }

    if (!termsAccepted) {
      alert('Por favor, confirme que sus datos son correctos marcando la casilla correspondiente.');
      return;
    }

    setLoading(true);

    try {
      const eventId = 'pur_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

      const fbp = fpixel.getCookie('_fbp') || (typeof window !== 'undefined' ? sessionStorage.getItem('_fbp') : '') || '';
      let fbc = fpixel.getCookie('_fbc') || (typeof window !== 'undefined' ? sessionStorage.getItem('_fbc') : '') || '';
      const fbclid = (typeof window !== 'undefined' ? sessionStorage.getItem('fbclid') : '') || '';

      if (!fbc && fbclid) {
        fbc = `fb.1.${Date.now()}.${fbclid}`;
      }

      const response = await fetch('/api/send-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product,
          formData,
          totalPrice,
          quantity: totalQuantity,
          offer: activeOffer.title,
          fbTracking: {
            fbp,
            fbc,
            fbclid
          },
          eventId
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar los datos del pedido.');
      }

      fpixel.event('Purchase', {
        content_name: product.name,
        content_ids: [product.id?.toString() || '0'],
        content_type: 'product',
        value: totalPrice,
        currency: 'USD',
      }, {
        eventID: eventId
      });

      alert('¡Tu pedido fue registrado con éxito! 🎉 Nos comunicaremos contigo pronto para confirmar tu entrega. Gracias por confiar en Zamvaro Ecuador.');
      setFormData({
        fullName: '',
        whatsapp: '',
        street1: '',
        street2: '',
        neighborhood: '',
        reference: '',
        province: '',
        city: '',
      });
      setTermsAccepted(false);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al procesar tu compra. Por favor inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToCheckout = () => {
    const el = document.getElementById('checkout-direct-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const originalSubtotal = basePrice * totalQuantity;
  const discountAmount = originalSubtotal - totalPrice;

  // Render review stars helper
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={styles.starIcon}
        fill={i < rating ? '#facc15' : 'none'}
        stroke="#facc15"
      />
    ));
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className={styles.announcement}>
        <span>🔥 PAGO CONTRAENTREGA + ENVÍO GRATIS A TODO EL ECUADOR 🇪🇨</span>
        <span className={styles.urgencyBadge}>STOCK LIMITADO</span>
      </div>

      <div className={styles.container}>
        {/* Product Header */}
        <header className={styles.header}>
          <span className={styles.categoryTag}>{product.category || 'Zamvaro Exclusivo'}</span>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.subtitle}>{product.subtitle}</p>
          <div className={styles.starsRow} onClick={scrollToCheckout} style={{ cursor: 'pointer' }}>
            <div className={styles.stars}>
              {renderStars(5)}
            </div>
            <span className={styles.ratingText}>(4.9/5 de valoración en Ecuador)</span>
          </div>
        </header>

        {/* Media stacked images/GIFs for VSL-style conversion */}
        <section className={styles.mediaStack}>
          {product.images && product.images.map((img: string, idx: number) => (
            img.toLowerCase().endsWith('.mp4') || img.toLowerCase().endsWith('.webm') ? (
              <video
                key={idx}
                src={img}
                autoPlay
                loop
                muted
                playsInline
                className={styles.mediaItem}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ) : (
              <img
                key={idx}
                src={img}
                alt={`${product.name} creativo ${idx + 1}`}
                className={styles.mediaItem}
                loading={idx > 0 ? "lazy" : "eager"}
                fetchPriority={idx === 0 ? "high" : "auto"}
              />
            )
          ))}
          {(!product.images || product.images.length === 0) && product.image && (
            product.image.toLowerCase().endsWith('.mp4') || product.image.toLowerCase().endsWith('.webm') ? (
              <video
                src={product.image}
                autoPlay
                loop
                muted
                playsInline
                className={styles.mediaItem}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ) : (
              <img
                src={product.image}
                alt={product.name}
                className={styles.mediaItem}
                loading="eager"
                fetchPriority="high"
              />
            )
          )}
        </section>

        {/* Highlight Bullets */}
        <section className={styles.bulletsList}>
          {product.bullets && product.bullets.map((bullet: string, idx: number) => (
            <div key={idx} className={styles.bullet}>
              <span className={styles.bulletEmoji}>✅</span>
              <span>{bullet}</span>
            </div>
          ))}
        </section>

        {/* Pricing Info */}
        <section className={styles.pricingCard}>
          <span className={styles.discountBadge}>🔥 OFERTA DEL DÍA CON 50% DE DESCUENTO</span>
          <div className={styles.pricingHeader}>
            <span className={styles.price}>${product.price}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>${product.originalPrice}</span>
            )}
          </div>
          <p style={{ color: '#059669', fontWeight: 'bold', fontSize: '0.9rem' }}>
            🚚 Envío gratis + Pago Contraentrega
          </p>
          <button onClick={scrollToCheckout} className={styles.submitBtn} style={{ width: '100%', marginTop: '14px' }}>
            ¡QUIERO ORDENAR AHORA! 📦
          </button>
        </section>

        {/* Extra Sections from product model */}
        {product.imageProblem && (
          <section style={{ margin: '30px 0', borderRadius: '16px', overflow: 'hidden' }}>
            {product.imageProblem.toLowerCase().endsWith('.mp4') || product.imageProblem.toLowerCase().endsWith('.webm') ? (
              <video
                src={product.imageProblem}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ) : (
              <img src={product.imageProblem} alt="Uso o Problema" style={{ width: '100%', height: 'auto', display: 'block' }} />
            )}
          </section>
        )}

        {/* EMBEDDED CHECKOUT FORM */}
        <section id="checkout-direct-form" className={styles.checkoutContainer}>
          <div className={styles.checkoutHeader}>
            <h2 className={styles.checkoutTitle}>SOLICITAR PEDIDO CONTRAENTREGA</h2>
            <p className={styles.checkoutSubtitle}>👉 Completa tus datos abajo. ¡Pagas al recibir!</p>
          </div>

          <div className={styles.warningBox}>
            <AlertTriangle size={18} style={{ float: 'left', marginRight: '10px' }} />
            <span><strong>IMPORTANTE:</strong> Asegúrate de que tu dirección sea clara y exacta. Si los datos están incompletos, el pedido no podrá ser despachado.</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Offers Selection */}
            <div className={styles.formGroup}>
              <label>Selecciona tu promoción *</label>
              <div className={styles.offersList}>
                {offers.map((offer, index) => {
                  const isSelected = selectedOfferIndex === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`${styles.offerCard} ${isSelected ? styles.offerCardActive : ''}`}
                      onClick={() => setSelectedOfferIndex(index)}
                    >
                      <div className={styles.offerInfo}>
                        <span className={styles.offerTitle}>{offer.title}</span>
                        <span className={`${styles.offerBadge} ${offer.badgeClass}`}>
                          {offer.badge}
                        </span>
                      </div>
                      <div className={styles.offerPrices}>
                        {offer.originalPrice > offer.price && (
                          <span className={styles.offerOriginalPrice}>
                            ${offer.originalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className={styles.offerCurrentPrice}>
                          ${offer.price.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields */}
            <div className={styles.formGroup}>
              <label>Nombre y Apellido *</label>
              <div className={styles.inputIconWrap}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Ejemplo: Carlos Perez"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>WhatsApp / Celular (Ej: 0989897319) *</label>
              <div className={styles.inputIconWrap}>
                <Phone size={16} className={styles.inputIcon} />
                <input
                  type="tel"
                  name="whatsapp"
                  placeholder="Número de WhatsApp"
                  required
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Nombre Calle Principal *</label>
              <div className={styles.inputIconWrap}>
                <MapPin size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  name="street1"
                  placeholder="Ej: Avenida Eloy Alfaro"
                  required
                  value={formData.street1}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Calle Secundaria *</label>
              <div className={styles.inputIconWrap}>
                <MapPin size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  name="street2"
                  placeholder="Ej: Calle Guadalupe"
                  required
                  value={formData.street2}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Barrio, Sector o Ciudadela *</label>
              <div className={styles.inputIconWrap}>
                <MapPin size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  name="neighborhood"
                  placeholder="Calle Principal, Numeración"
                  required
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Punto de Referencia *</label>
              <div className={styles.inputIconWrap}>
                <MapPin size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  name="reference"
                  placeholder="Ej: Frente al parque central, junto a farmacia..."
                  required
                  value={formData.reference}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Provincia *</label>
              <select
                name="province"
                required
                value={formData.province}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Provincia</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Ciudad o Cantón *</label>
              <div className={styles.inputIconWrap}>
                <MapPin size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  name="city"
                  placeholder="Ciudad o Cantón"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className={styles.checkboxInput}
                  disabled={loading}
                />
                <span>Mis datos son correctos y pagaré al momento de la entrega 📦</span>
              </label>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'PROCESANDO PEDIDO...' : `CONFIRMAR PEDIDO CONTRAENTREGA 🚚 - $${totalPrice.toFixed(2)}`}
            </button>
          </form>

          {/* Badges of trust inside checkout card */}
          <div className={styles.badgesGrid}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>🔒</span>
              <span>Compra 100% segura</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>🇪🇨</span>
              <span>Envíos a todo el país</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>💵</span>
              <span>Pago al recibir</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>🚚</span>
              <span>Servientrega / Gintracom</span>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        {product.testimonials && product.testimonials.length > 0 && (
          <LazySection height="400px">
            <section className={styles.reviewsSection}>
              <h2 className={styles.sectionTitle}>Opiniones de nuestros clientes 🇪🇨</h2>
              <div className={styles.reviewsList}>
                {product.testimonials.map((t: any, idx: number) => (
                  <div key={idx} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewerInfo}>
                        <div className={styles.avatar}>{t.avatar || '👩'}</div>
                        <div>
                          <div className={styles.reviewerName}>{t.name}</div>
                          <div className={styles.reviewerCity}>{t.city || 'Ecuador'}</div>
                        </div>
                      </div>
                      <div className={styles.reviewStars}>
                        {renderStars(t.rating || 5)}
                      </div>
                    </div>
                    <p className={styles.reviewText}>"{t.text}"</p>
                  </div>
                ))}
              </div>
            </section>
          </LazySection>
        )}

        {/* Accordion FAQs Section */}
        {product.faqs && product.faqs.length > 0 && (
          <LazySection height="300px">
            <section className={styles.faqSection}>
              <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
              <div className={styles.faqList}>
                {product.faqs.map((faq: any, idx: number) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className={styles.faqItem}>
                      <button
                        className={styles.faqQuestion}
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      >
                        <span>{faq.question}</span>
                        <span>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className={styles.faqAnswer}>
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </LazySection>
        )}

        {/* Floating CTA for Mobile quick navigation to checkout */}
        <div className={styles.floatingCta}>
          <button onClick={scrollToCheckout} className={styles.floatingCtaBtn}>
            🛒 SOLICITAR CONTRAENTREGA
          </button>
        </div>
      </div>
    </>
  );
}
