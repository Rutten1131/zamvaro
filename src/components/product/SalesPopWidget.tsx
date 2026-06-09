'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './SalesPopWidget.module.css';

interface Props {
  product: Product;
}

const CITIES = [
  'Ecuador', 'Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 
  'Manta', 'Portoviejo', 'Loja', 'Ambato', 'Riobamba', 'Ecuador',
  'Ibarra', 'Quevedo', 'Babahoyo', 'Sangolquí', 'Latacunga', 'Ecuador'
];

const NAMES = [
  'Mariuxi', 'Katy', 'Jefferson', 'Paola', 'Gisella', 'Eduardo', 
  'Christian', 'Gaby', 'Stalin', 'Santiago', 'Jonathan', 'Alejandra', 
  'Johanna', 'Carlos', 'Mayra', 'Juan', 'Diana', 'Tatiana', 'Bryan',
  'Evelyn', 'Esteban', 'Gabriela', 'Alex', 'Verónica'
];

const ACTIONS = [
  'compró',
  'agregó al carrito',
  'compró',
  'realizó un pedido'
];

const TIMES = [
  '10 segundos', '45 segundos', '1 minuto', 
  '2 minutos', '5 minutos', '17 horas', '3 horas', '12 horas'
];

export default function SalesPopWidget({ product }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [closedForever, setClosedForever] = useState(false);
  const [hasAppeared, setHasAppeared] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const [popData, setPopData] = useState({
    name: '',
    city: '',
    action: '',
    time: '',
    productName: product.name,
    productImage: product.image || ''
  });

  // Obtener todos los productos al cargar el componente
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const available = data.filter((p: any) => p.isAvailable);
          setAllProducts(available);
        }
      })
      .catch((err) => console.error('Error fetching products for sales pop:', err));
  }, []);

  // Función para generar datos aleatorios de compra y productos
  const generateRandomPop = () => {
    const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
    const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
    const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];

    // Elegir un producto aleatorio de la tienda, si está cargada la lista
    let selectedProd = product;
    if (allProducts.length > 0) {
      selectedProd = allProducts[Math.floor(Math.random() * allProducts.length)];
    }

    setPopData({
      name: randomName,
      city: randomCity,
      action: randomAction,
      time: randomTime,
      productName: selectedProd.name,
      productImage: selectedProd.image || ''
    });
  };

  // Loop reactivo de aparición y ocultación
  useEffect(() => {
    if (closedForever) return;

    let timeoutId: NodeJS.Timeout;

    if (isVisible) {
      // Si es visible, se oculta automáticamente a los 6 segundos
      timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    } else {
      // Si está oculto, se muestra tras un delay
      // Primer delay: 6s. Siguientes delays: entre 18s y 24s.
      const delay = !hasAppeared ? 6000 : (18000 + Math.random() * 6000);
      timeoutId = setTimeout(() => {
        generateRandomPop();
        setIsVisible(true);
        setHasAppeared(true);
      }, delay);
    }

    return () => clearTimeout(timeoutId);
  }, [isVisible, closedForever, hasAppeared, allProducts]);

  const handleClose = () => {
    setIsVisible(false);
    setClosedForever(true);
  };

  return (
    <AnimatePresence>
      {isVisible && !closedForever && (
        <motion.div
          className={styles.container}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        >
          <div className={styles.imageWrap}>
            <Image
              src={popData.productImage || ''}
              alt={popData.productName}
              fill
              className={styles.img}
              sizes="56px"
            />
          </div>

          <div className={styles.content}>
            <div className={styles.title}>
              <span className={styles.highlight}>{popData.name}</span> en {popData.city} {popData.action}
            </div>
            <div className={styles.prodName}>
              {popData.productName}
            </div>
            <div className={styles.time}>
              Hace {popData.time}
            </div>
          </div>

          <button onClick={handleClose} className={styles.closeBtn} aria-label="Cerrar notificación">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
