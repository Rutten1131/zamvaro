import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zamvaro Ecuador | Compra con Pago Contraentrega',
  description:
    'Compra productos premium en Ecuador con pago contraentrega. Sin tarjeta de crédito. Entrega a domicilio o en sucursal en todo Ecuador. ¡Paga solo cuando recibas tu pedido!',
  keywords:
    'dropshipping ecuador, pago contraentrega ecuador, comprar online ecuador, entrega a domicilio ecuador, zamvaro',
  openGraph: {
    title: 'Zamvaro Ecuador | Pago Contraentrega',
    description: 'Compra segura en Ecuador. Paga cuando recibas tu pedido.',
    type: 'website',
    locale: 'es_EC',
    siteName: 'Zamvaro Ecuador',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zamvaro Ecuador',
    description: 'Dropshipping en Ecuador — Pago contraentrega. Sin riesgo.',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
