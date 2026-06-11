import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import FacebookPixel from '@/components/FacebookPixel';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.zamvaro.com'),
  title: 'Zamvaro Ecuador | Compra con Pago Contraentrega',
  description:
    'Compra productos premium en Ecuador con pago contraentrega. Sin tarjeta de crédito. Entrega a domicilio o en sucursal en todo Ecuador. ¡Paga solo cuando recibas tu pedido!',
  keywords:
    'compra contraentrega ecuador, pago contraentrega ecuador, comprar online ecuador, entrega a domicilio ecuador, zamvaro',
  openGraph: {
    title: 'Zamvaro Ecuador | Pago Contraentrega',
    description: 'Compra segura en Ecuador. Paga cuando recibas tu pedido.',
    type: 'website',
    locale: 'es_EC',
    siteName: 'Zamvaro Ecuador',
    images: [
      {
        url: '/hero-zamvaro.jpg',
        width: 1200,
        height: 630,
        alt: 'Zamvaro Ecuador',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zamvaro Ecuador',
    description: 'Ventas online en Ecuador — Pago contraentrega. Sin riesgo.',
    images: ['/hero-zamvaro.jpg'],
  },
  robots: 'index, follow',
  other: {
    'facebook-domain-verification': '830tdlsadiol1r3zb0081aj4iifg88',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className={poppins.className}>
        <FacebookPixel />
        {children}
      </body>
    </html>
  );
}

