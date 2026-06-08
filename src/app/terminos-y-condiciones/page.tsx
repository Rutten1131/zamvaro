'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto', color: 'var(--color-dark)', lineHeight: '1.8' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Términos y Condiciones</h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '16px' }}>Última actualización: {new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <p>Bienvenido a Zamvaro Ecuador. Al acceder y utilizar nuestro sitio web, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de servicio.</p>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '12px' }}>1. Envíos y Pagos Contraentrega</h2>
        <p>Zamvaro Ecuador ofrece el servicio de Pago Contraentrega a nivel nacional en Ecuador. Al realizar un pedido, usted se compromete a recibir el producto y efectuar el pago correspondiente en efectivo al mensajero autorizado al momento de la entrega.</p>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '12px' }}>2. Veracidad de la Información</h2>
        <p>Es responsabilidad exclusiva del cliente proporcionar datos de dirección precisos, claros y completos, incluyendo número de teléfono y puntos de referencia. Los pedidos con direcciones incompletas o erróneas no serán procesados.</p>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '12px' }}>3. Limitación de Responsabilidad</h2>
        <p>Zamvaro Ecuador actúa como plataforma de distribución y no se responsabiliza por retrasos causados por circunstancias fuera de nuestro control razonable o problemas de cobertura por parte de las empresas de mensajería aliadas.</p>
      </main>
      <Footer />
    </>
  );
}
