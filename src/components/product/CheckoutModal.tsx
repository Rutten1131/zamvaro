'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, User, Phone, MapPin } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './CheckoutModal.module.css';
import * as fpixel from '@/lib/fpixel';

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ product, isOpen, onClose }: Props) {
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

  const basePrice = parseFloat(product.price.replace(/[^\d.]/g, '')) || 24.99;

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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTermsAccepted(false); // Reset checkbox on open
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Registrar el inicio del proceso de pago (InitiateCheckout)
  useEffect(() => {
    if (isOpen) {
      fpixel.event('InitiateCheckout', {
        content_name: product.name,
        content_ids: [product.id.toString()],
        content_type: 'product',
        value: totalPrice,
        currency: 'USD',
      });
    }
  }, [isOpen, product, totalPrice]);

  const provinces = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro',
    'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos',
    'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha',
    'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua',
    'Zamora Chinchipe'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar requeridos básicos
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
      // Enviar los datos del pedido al servidor de Next.js para despachar el correo por SMTP
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
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar los datos del pedido.');
      }

      // Registrar la compra exitosa (Purchase) en Meta Pixel
      fpixel.event('Purchase', {
        content_name: product.name,
        content_ids: [product.id.toString()],
        content_type: 'product',
        value: totalPrice,
        currency: 'USD',
      });

      alert('¡Tu pedido fue registrado con éxito! 🎉 Nos comunicaremos contigo pronto para confirmar tu entrega. Gracias por confiar en Zamvaro Ecuador.');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al procesar tu compra. Por favor inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const originalSubtotal = basePrice * totalQuantity;
  const discountAmount = originalSubtotal - totalPrice;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          {/* Backdrop click to close */}
          <div className={styles.backdrop} onClick={onClose} />

          <motion.div
            className={styles.modal}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          >
            {/* Cabecera */}
            <div className={styles.header}>
              <h3 className={styles.headerTitle}>¡Pedir HOY! ¡Pagar al recibir! 🚚</h3>
              <button onClick={onClose} className={styles.closeBtn} aria-label="Cerrar modal">
                <X size={20} />
              </button>
            </div>

            <div className={styles.scrollableContent}>

              {/* Selección de Ofertas */}
              <div className={styles.offersSection}>
                <div className={styles.offersList}>
                  {offers.map((offer, index) => {
                    const isSelected = selectedOfferIndex === index;
                    const hasDiscount = offer.originalPrice > offer.price;
                    return (
                      <button
                        key={index}
                        type="button"
                        className={`${styles.offerCard} ${isSelected ? styles.offerCardActive : ''} ${index === 2 ? styles.offerCardBest : ''}`}
                        onClick={() => setSelectedOfferIndex(index)}
                      >
                        <div className={styles.offerThumb}>
                          <Image
                            src={product.image || ''}
                            alt={offer.title}
                            width={54}
                            height={54}
                            className={styles.offerImg}
                          />
                        </div>
                        <div className={styles.offerInfo}>
                          <span className={styles.offerTitle}>{offer.title}</span>
                          <span className={`${styles.offerBadge} ${offer.badgeClass}`}>
                            {offer.badge}
                          </span>
                        </div>
                        <div className={styles.offerPrices}>
                          {hasDiscount && (
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

              {/* Resumen del Producto */}
              <div className={styles.productSummary}>
                <div className={styles.pricingLines}>
                  <div className={styles.priceLine}>
                    <span>Subtotal</span>
                    <span>${originalSubtotal.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceLine}>
                    <span>Envío</span>
                    <span className={styles.shippingFree}>Gratis</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className={`${styles.priceLine} ${styles.discountLine}`}>
                      <span>Descuentos 🏷️</span>
                      <span className={styles.discountAmount}>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className={`${styles.priceLine} ${styles.totalLine}`}>
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Método de Envío */}
              <div className={styles.shippingMethod}>
                <h4>Método de envío</h4>
                <div className={styles.shippingOption}>
                  <div className={styles.optionLeft}>
                    <div className={styles.checkedDot} />
                    <span>Envío gratis</span>
                  </div>
                  <strong>Gratis</strong>
                </div>
              </div>

              {/* Advertencia Importante */}
              <div className={styles.warningMessage}>
                🚨 <strong>IMPORTANTE:</strong> Tu pedido será despachado a través de una empresa de mensajería nacional. Si la dirección no es clara ni está completa, el pedido no será despachado 👀
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className={styles.form}>
                
                {/* Nombre y Apellido */}
                <div className={styles.formGroup}>
                  <label>Nombre y apellido *</label>
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

                {/* WhatsApp */}
                <div className={styles.formGroup}>
                  <label>WhatsApp (Ej: 0989897319) *</label>
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

                {/* Calle Principal */}
                <div className={styles.formGroup}>
                  <label>Nombre calle principal *</label>
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

                {/* Calle Secundaria */}
                <div className={styles.formGroup}>
                  <label>Calle secundaria *</label>
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

                {/* Barrio / Sector */}
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

                {/* Punto de Referencia */}
                <div className={styles.formGroup}>
                  <label>Punto de Referencia *</label>
                  <div className={styles.inputIconWrap}>
                    <MapPin size={16} className={styles.inputIcon} />
                    <input
                      type="text"
                      name="reference"
                      placeholder="Ej: Entre Calles..., Cerca de..."
                      required
                      value={formData.reference}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Provincia */}
                <div className={styles.formGroup}>
                  <label>Provincia *</label>
                  <select
                    name="province"
                    required
                    value={formData.province}
                    onChange={handleInputChange}
                    className={styles.selectInput}
                    disabled={loading}
                  >
                    <option value="">Provincia</option>
                    {provinces.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                {/* Ciudad o Cantón */}
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

                {/* Casilla de verificación de datos correctos */}
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

                {/* Botón de Confirmación de Pedido */}
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'PROCESANDO PEDIDO...' : `COMPRAR CONTRAENTREGA 🚚 - $${totalPrice.toFixed(2)}`}
                </button>
              </form>

              {/* Logotipos Logísticos */}
              <div className={styles.logisticsFooter}>
                <div className={styles.logisticsLogos}>
                  <div className={styles.logoBadge}>⚙️ GINTRACOM</div>
                  <div className={styles.logoBadge}>🚚 Servientrega</div>
                </div>
                <p className={styles.logisticsText}>Nuestros aliados logísticos</p>
                <div className={styles.safetyBadges}>
                  <span>🔒 Compra 100% segura</span>
                  <span>🔄 Garantía 15 días</span>
                  <span>💵 Pago al recibir</span>
                  <span>🇪🇨 Cobertura Ecuador</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
