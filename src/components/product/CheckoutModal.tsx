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

  const basePrice = parseFloat(product.price.replace(/[^\d.]/g, '')) || 24.99;
  const totalPrice = basePrice;

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
              <h3 className={styles.headerTitle}>PAGO CONTRA REEMBOLSO</h3>
              <button onClick={onClose} className={styles.closeBtn} aria-label="Cerrar modal">
                <X size={20} />
              </button>
            </div>

            <div className={styles.scrollableContent}>
              {/* Banner de Compra Segura */}
              <div className={styles.banner}>
                <div className={styles.bannerBadge}>
                  <span>🔒 COMPRA SEGURA</span>
                  <strong>Satisfacción garantizada</strong>
                </div>
                <div className={styles.bannerGarantia}>
                  <span>GARANTÍA DE</span>
                  <strong>+100.000</strong>
                  <span>SATISFACCIÓN</span>
                </div>
                <div className={styles.bannerDelivery}>
                  <span>Tiempo de entrega</span>
                  <strong>3-5 días</strong>
                  <span>hábiles</span>
                </div>
              </div>

              {/* Resumen del Producto */}
              <div className={styles.productSummary}>
                <div className={styles.prodRow}>
                  <div className={styles.prodThumb}>
                    <Image
                      src={product.image || ''}
                      alt={product.name}
                      width={44}
                      height={44}
                      className={styles.prodImg}
                    />
                    <span className={styles.prodQty}>1</span>
                  </div>
                  <div className={styles.prodName}>{product.name}</div>
                  <div className={styles.prodPrice}>${basePrice.toFixed(2)}</div>
                </div>

                <div className={styles.pricingLines}>
                  <div className={styles.priceLine}>
                    <span>Subtotal</span>
                    <span>${basePrice.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceLine}>
                    <span>Envío</span>
                    <span className={styles.shippingFree}>Gratis</span>
                  </div>
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
