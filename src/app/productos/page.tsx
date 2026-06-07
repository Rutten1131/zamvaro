'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductsPreview from '@/components/ProductsPreview';
import TrustBar from '@/components/TrustBar';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductosPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '80px', background: 'var(--color-bg)' }}>
        
        {/* Banner de Bienvenida al Catálogo */}
        <section style={{
          padding: '60px 24px 20px',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-badge">
              <ShoppingBag size={12} style={{ marginRight: '4px' }} />
              Tienda Oficial
            </span>
            <h1 className="section-title" style={{ marginTop: '10px' }}>
              Catálogo de Productos
            </h1>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
              Explora nuestra selección exclusiva de productos listos para enviar. Compra hoy, recibe en la puerta de tu casa y paga al repartidor. 100% Seguro.
            </p>
          </motion.div>
        </section>

        {/* Sección de Productos dinámicos (reutilizando la estructura premium del home) */}
        <ProductsPreview />

        {/* Barra de Confianza (Envío gratis, Pago contraentrega, Garantía) */}
        <div style={{ paddingBottom: '60px' }}>
          <TrustBar />
        </div>

      </main>
      <Footer />
    </>
  );
}
