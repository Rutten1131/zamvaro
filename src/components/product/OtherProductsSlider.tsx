'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, Play, Pause } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './OtherProductsSlider.module.css';

interface Props {
  currentProductSlug?: string;
}

export default function OtherProductsSlider({ currentProductSlug }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-play loop
  useEffect(() => {
    if (isPlaying && filteredProducts.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredProducts.length);
      }, 4000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, filteredProducts.length]);

  const handlePrev = () => {
    if (filteredProducts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
  };

  const handleNext = () => {
    if (filteredProducts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredProducts.length);
  };

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section 
      className={styles.section}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Otros Productos que te Encantarán</h2>
          <p className={styles.subtitle}>Explora nuestro catálogo exclusivo en Ecuador</p>
        </div>

        {/* Barra de Búsqueda y Control de Reproducción */}
        <div className={styles.controlsRow}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0); // Reset a primera posición al buscar
              }}
              className={styles.searchInput}
            />
          </div>

          {filteredProducts.length > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={styles.playPauseBtn}
              title={isPlaying ? 'Pausar reproducción' : 'Iniciar reproducción'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Auto-reproducción activa' : 'Auto-reproducción pausada'}</span>
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <p className={styles.noResults}>No se encontraron productos que coincidan con tu búsqueda.</p>
        ) : (
          <div className={styles.sliderContainer}>
            {/* Botones de Navegación */}
            {filteredProducts.length > 1 && (
              <>
                <button onClick={handlePrev} className={`${styles.navBtn} ${styles.navBtnLeft}`} aria-label="Anterior">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={handleNext} className={`${styles.navBtn} ${styles.navBtnRight}`} aria-label="Siguiente">
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Slider track / wrapper */}
            <div className={styles.sliderWrapper}>
              <div 
                className={styles.sliderTrack}
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: 'transform 0.5s ease'
                }}
              >
                {filteredProducts.map((prod) => (
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
                        <p className={styles.cardDesc}>{prod.subtitle}</p>
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
