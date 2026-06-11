'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  height?: string;
}

export default function LazySection({ children, height = '200px' }: LazySectionProps) {
  const [isIntersected, setIsIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isIntersected) return;
    
    // Configuración del Intersection Observer para cargar el contenido
    // 400px antes de que entre al viewport para que el usuario no vea "saltos"
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersected(true);
        }
      },
      {
        rootMargin: '400px', 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isIntersected]);

  return (
    <div 
      ref={ref} 
      style={!isIntersected ? { minHeight: height, contentVisibility: 'auto' } : undefined}
    >
      {isIntersected ? children : null}
    </div>
  );
}
