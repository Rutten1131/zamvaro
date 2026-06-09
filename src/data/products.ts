export interface ProductTestimonial {
  name: string;
  city: string;
  rating: number;
  text: string;
  avatar: string;
  date: string;
}

export interface ProductFeature {
  emoji: string;
  title: string;
  description: string;
}

export interface ProductComparisonRow {
  label: string;
  ours: boolean;
  theirs: boolean;
}

export interface ProductStat {
  value: string;
  label: string;
}

export interface ProductStep {
  number: string;
  emoji: string;
  title: string;
  description: string;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface ProductProblemFactor {
  label: string;
  detail: string;
}

export interface Product {
  id: number;
  name: string;
  subtitle: string;
  hookText: string;
  category: string;
  price: string;
  originalPrice?: string;
  tag?: string | null;
  emoji?: string;
  image?: string;
  images?: string[];
  imageProblem?: string;
  imageFeatures?: string;
  imageHowTo?: string;
  isAvailable: boolean;
  slug?: string;
  bullets?: string[];
  features?: ProductFeature[];
  testimonials?: ProductTestimonial[];
  comparisonTitle?: string;
  comparisonOursLabel?: string;
  comparisonTheirsLabel?: string;
  comparison?: ProductComparisonRow[];
  stats?: ProductStat[];
  steps?: ProductStep[];
  faqs?: ProductFAQ[];
  guaranteeText?: string;
  whatsappNumber?: string;
  problemFactors?: ProductProblemFactor[];
  problemTagline?: string;
  problemHeadline?: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Cepillo Secador 3 en 1',
    subtitle: 'Seca, Alisa y Da Volumen en un Solo Paso — Sin Salir de Casa',
    hookText: '¿Cansada de perder 40 minutos con secador, plancha y cepillo? ¡Consigue un peinado de salón en menos de 15 minutos!',
    category: 'Belleza',
    price: '$24.99',
    originalPrice: '$50.00',
    tag: 'Más vendido',
    image: 'https://zamvaro.com/cdn/shop/files/1.png?v=1777075512',
    images: [
      'https://zamvaro.com/cdn/shop/files/1.png?v=1777075512',
      'https://zamvaro.com/cdn/shop/files/2.png?v=1777075512',
      'https://zamvaro.com/cdn/shop/files/3.png?v=1777075512',
      'https://zamvaro.com/cdn/shop/files/4.png?v=1777075512'
    ],
    isAvailable: true,
    slug: 'cepillo-secador-3-en-1',
    bullets: [
      '💇‍♀️ Seca, Alisa y da Volumen al mismo tiempo',
      '⚡ Reduce el tiempo de peinado a la mitad',
      '✨ Tecnología iónica que elimina el frizz al instante',
      '🌡️ 3 temperaturas para todo tipo de cabello',
    ],
    features: [
      {
        emoji: '🔥',
        title: 'Multifunción 3 en 1',
        description: 'Combina secador, alisador y moldeador en un solo dispositivo. Sin cambiar de herramienta y sin complicaciones.',
      },
      {
        emoji: '✨',
        title: 'Tecnología Iónica',
        description: 'Emite iones negativos que neutralizan la estática, eliminando el frizz y dejando tu cabello brillante y suave.',
      },
      {
        emoji: '🌡️',
        title: 'Control de Temperatura',
        description: 'Tres niveles de temperatura para adaptarse a cualquier tipo de cabello sin quemarlo ni dañarlo.',
      },
      {
        emoji: '🤲',
        title: 'Diseño Ergonómico',
        description: 'Ligero y cómodo de sostener. Cable giratorio de 360° para evitar enredos. Fácil de usar para cualquier persona.',
      },
    ],
    testimonials: [
      {
        name: 'Valentina S.',
        city: 'Quito, Ecuador',
        rating: 5,
        text: 'Lo uso cada mañana y ahorro más de 30 minutos. Mi cabello queda impecable, liso y con volumen. ¡No lo cambiaría por nada!',
        avatar: '👩',
        date: 'Mayo 2025',
      },
      {
        name: 'Gabriela M.',
        city: 'Guayaquil, Ecuador',
        rating: 5,
        text: 'Tengo el cabello rizado y difícil. Con este cepillo lo domo en 15 minutos. El resultado dura todo el día. Vale cada centavo.',
        avatar: '👱‍♀️',
        date: 'Abril 2025',
      },
      {
        name: 'Patricia L.',
        city: 'Cuenca, Ecuador',
        rating: 5,
        text: 'Lo pedí por WhatsApp y llegó en 2 días. Excelente servicio y el producto es increíble. Mi cabello nunca había lucido tan bien.',
        avatar: '👩‍🦱',
        date: 'Junio 2025',
      },
      {
        name: 'Sofía R.',
        city: 'Ambato, Ecuador',
        rating: 5,
        text: 'Quedé sorprendida. Pensé que era uno más del montón pero no. La tecnología iónica de verdad funciona. Cero frizz, todo brillo.',
        avatar: '🧕',
        date: 'Mayo 2025',
      },
    ],
    comparisonTitle: '¿Por qué Zamvaro Ecuador es diferente?',
    comparisonOursLabel: 'Cepillo Zamvaro',
    comparisonTheirsLabel: 'Métodos Tradicionales',
    comparison: [
      { label: 'Seca y Alisa al mismo tiempo', ours: true, theirs: false },
      { label: 'Elimina el frizz con iones negativos', ours: true, theirs: false },
      { label: 'Listo en menos de 15 minutos', ours: true, theirs: false },
      { label: 'Sin daño por calor excesivo', ours: true, theirs: false },
      { label: 'Fácil de usar en casa', ours: true, theirs: false },
      { label: 'Pago al recibir en Ecuador', ours: true, theirs: false },
    ],
    stats: [
      { value: '97%', label: 'reportan ahorro de tiempo significativo en su rutina diaria' },
      { value: '94%', label: 'notan reducción del frizz desde la primera sesión' },
      { value: '91%', label: 'obtienen resultados de salón sin salir de casa' },
    ],
    steps: [
      {
        number: '01',
        emoji: '💆‍♀️',
        title: 'Prepara tu cabello',
        description: 'Retira el exceso de humedad con una toalla. No lo uses completamente mojado para mejores resultados.',
      },
      {
        number: '02',
        emoji: '🔄',
        title: 'Peina por secciones',
        description: 'Divide tu cabello en secciones manejables. Desliza el cepillo lentamente desde la raíz hacia las puntas.',
      },
      {
        number: '03',
        emoji: '💫',
        title: 'Disfruta el resultado',
        description: 'Gira el cepillo en las puntas para moldear según prefieras. ¡Listo! Cabello profesional en minutos.',
      },
    ],
    faqs: [
      {
        question: '¿Funciona para todo tipo de cabello?',
        answer: 'Sí. Gracias a sus 3 niveles de temperatura regulables, es ideal para cabello fino, grueso, rizado, liso u ondulado. Adapta la temperatura al grosor de tu cabello para el mejor resultado.',
      },
      {
        question: '¿Cuánto tarda en dar resultados?',
        answer: 'Desde la primera sesión notarás la diferencia. El cabello queda suave, con brillo y sin frizz. Para cabello muy rizado o grueso, puede tomar 2-3 usos habituarte a la técnica perfecta.',
      },
      {
        question: '¿Daña o quema el cabello?',
        answer: 'No. La tecnología de distribución uniforme del aire caliente reduce el impacto directo del calor en comparación con planchas y secadores tradicionales. Úsalo siempre en la temperatura adecuada para tu tipo de cabello.',
      },
      {
        question: '¿Se puede usar con el cabello completamente mojado?',
        answer: 'Se recomienda secar ligeramente con una toalla antes de usarlo. Trabajar con cabello húmedo (no empapado) logra un moldeado más rápido, suave y duradero.',
      },
      {
        question: '¿Cómo llega mi pedido y cuándo pago?',
        answer: 'Hacemos el pedido por WhatsApp y coordinamos la entrega a tu domicilio o en sucursal. Pagas directamente al repartidor cuando recibes el producto. ¡Sin tarjeta, sin transferencias, sin riesgo!',
      },
    ],
    guaranteeText: 'Si el cepillo no cumple tus expectativas, nos escribes y lo resolvemos. Tu satisfacción es nuestra prioridad. Zamvaro Ecuador garantiza tu tranquilidad en cada compra.',
    whatsappNumber: '593939243014',
    problemTagline: 'Factores que generan',
    problemHeadline: 'malos resultados en casa',
    problemFactors: [
      { label: 'Frizz', detail: 'difícil de controlar' },
      { label: 'Calor', detail: 'excesivo que daña' },
      { label: 'Tiempo', detail: 'perdido cada mañana' },
      { label: 'Herramientas', detail: 'múltiples y pesadas' },
      { label: 'Cabello', detail: 'sin volumen ni brillo' },
      { label: 'Costo', detail: 'de salón de belleza' },
    ],
  },
  {
    id: 2,
    name: 'Crema Hidratante Premium',
    subtitle: 'Próximamente',
    hookText: '',
    category: 'Cuidado Facial',
    price: '$19.99',
    tag: 'Nuevo',
    emoji: '🧴',
    isAvailable: false,
  },
  {
    id: 3,
    name: 'Auriculares Inalámbricos Pro',
    subtitle: 'Próximamente',
    hookText: '',
    category: 'Tecnología',
    price: '$34.99',
    tag: 'Tendencia',
    emoji: '🎧',
    isAvailable: false,
  },
  {
    id: 4,
    name: 'Organizador de Cocina Inteligente',
    subtitle: 'Próximamente',
    hookText: '',
    category: 'Hogar',
    price: '$22.99',
    emoji: '🍳',
    isAvailable: false,
  },
  {
    id: 5,
    name: 'Humidificador Ultrasónico',
    subtitle: 'Próximamente',
    hookText: '',
    category: 'Hogar',
    price: '$27.99',
    emoji: '🌸',
    isAvailable: false,
  },
];
