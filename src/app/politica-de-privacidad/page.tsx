'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto', color: 'var(--color-dark)', lineHeight: '1.8' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Política de Privacidad</h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '16px' }}>Última actualización: {new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <p>En Zamvaro Ecuador, valoramos y respetamos la privacidad de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos su información personal.</p>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '12px' }}>1. Información que Recopilamos</h2>
        <p>Recopilamos información personal básica que usted proporciona voluntariamente al completar el formulario de compra, que incluye: nombre, apellido, número de teléfono (WhatsApp), dirección detallada de envío, provincia, ciudad y referencias de entrega.</p>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '12px' }}>2. Uso de la Información</h2>
        <p>Los datos recopilados son exclusivamente utilizados para: procesar y coordinar el despacho de su pedido con las empresas logísticas aliadas, comunicarnos vía WhatsApp para confirmar los datos de entrega, y resolver cualquier inquietud de soporte posventa.</p>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '12px' }}>3. Compartir con Terceros</h2>
        <p>Únicamente compartimos su información de entrega con las empresas de transporte asociadas (Servientrega, Gintracom u otras agencias autorizadas) con el único fin de llevar a cabo la entrega física del producto.</p>
      </main>
      <Footer />
    </>
  );
}
