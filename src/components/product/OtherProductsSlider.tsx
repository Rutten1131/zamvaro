'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './OtherProductsSlider.module.css';

interface Props {
  currentProductSlug?: string;
}

export default function OtherProductsSlider({ currentProductSlug }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filtrar el producto actual y los no disponibles
          const filtered = data.filter(
            (p: any) => p.isAvailable && p.slug !== currentProductSlug
          );
          setProducts(filtered);
        }
      })
      .catch((err) => console.error('Error fetching other products:', err))
      .finally(() => setLoading(false));
  }, [currentProductSlug]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mostrar un máximo de 6 productos en total
  const displayedProducts = filteredProducts.slice(0, 6);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector(`.${styles.slide}`)?.clientWidth || 240;
      scrollContainerRef.current.scrollBy({
        left: -(cardWidth + 16), // Ancho de card + gap
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.querySelector(`.${styles.slide}`)?.clientWidth || 240;
      scrollContainerRef.current.scrollBy({
        left: cardWidth + 16, // Ancho de card + gap
        behavior: 'smooth',
      });
    }
  };

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Otros Productos que te Encantarán</h2>
          <p className={styles.subtitle}>Explora nuestro catálogo exclusivo en Ecuador</p>
        </div>

        {/* Barra de Búsqueda */}
        <div className={styles.controlsRow}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {displayedProducts.length === 0 ? (
          <p className={styles.noResults}>No se encontraron productos que coincidan con tu búsqueda.</p>
        ) : (
          <div className={styles.sliderContainer}>
            {/* Botones de Navegación (Visibles siempre que haya productos) */}
            {displayedProducts.length > 1 && (
              <>
                <button onClick={scrollLeft} className={`${styles.navBtn} ${styles.navBtnLeft}`} aria-label="Anterior">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={scrollRight} className={`${styles.navBtn} ${styles.navBtnRight}`} aria-label="Siguiente">
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Contenedor con scroll horizontal táctil y por botones */}
            <div className={styles.sliderWrapper} ref={scrollContainerRef}>
              <div className={styles.sliderTrack}>
                {displayedProducts.map((prod) => (
                  <div key={prod.id} className={styles.slide}>
                    <div className={styles.card}>
                      <div className={styles.imageWrap}>
                        <Image
                          src={prod.image || ''}
                          alt={prod.name}
                          fill
                          className={styles.image}
                        />
                      </div>
                      <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{prod.name}</h3>
                        <div className={styles.cardFooter}>
                          <span className={styles.price}>{prod.price}</span>
                          <Link href={`/productos/${prod.slug}`} className={styles.viewBtn}>
                            Ver Detalle
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
