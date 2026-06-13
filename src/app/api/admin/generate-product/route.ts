import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { rawText, referenceImages } = await request.json();
    if (!rawText) {
      return NextResponse.json({ message: 'El texto es requerido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        message: 'Configuración de IA incompleta. Por favor agrega GEMINI_API_KEY a tu archivo .env.local'
      }, { status: 400 });
    }

    // Intentar descargar y codificar todas las imágenes de referencia a Base64 si existen
    const imageParts: any[] = [];
    if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
      for (const imageUrl of referenceImages) {
        try {
          console.log(`[generate-product] Descargando imagen de referencia para análisis: ${imageUrl}`);
          const imgRes = await fetch(imageUrl);
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            const base64Data = Buffer.from(buffer).toString('base64');
            const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
            imageParts.push({
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            });
            console.log(`[generate-product] Imagen de referencia codificada exitosamente (${mimeType}).`);
          }
        } catch (e: any) {
          console.error(`[generate-product] Error descargando imagen de referencia (${imageUrl}): ${e.message}`);
        }
      }
    }

    const systemPrompt = `
Eres un redactor creativo de marketing y experto en comercio electrónico para la tienda "Zamvaro Ecuador".
Tu tarea es tomar la información del producto proporcionada por el usuario (y opcionalmente analizar la imagen de referencia real del producto si se adjunta) y estructurarlo en un formato JSON extremadamente completo y premium.

El JSON debe cumplir exactamente con esta estructura de interfaz de TypeScript:

interface ProductFeature {
  emoji: string;
  title: string;
  description: string;
}

interface ProductTestimonial {
  name: string;
  city: string;
  rating: number; // Siempre entre 4 y 5
  text: string;
  avatar: string; // Un emoji representativo del avatar, ej: 👩, 👱‍♂️, 👩‍🦱
  date: string; // Formato ej: "Junio 2026"
}

interface ProductComparisonRow {
  label: string;
  ours: boolean; // Verdadero para las ventajas de Zamvaro
  theirs: boolean; // Falso para la competencia
}

interface ProductStat {
  value: string; // ej: "97%" o "10k+"
  label: string;
}

interface ProductStep {
  number: string; // "01", "02", "03"
  emoji: string;
  title: string;
  description: string;
}

interface ProductFAQ {
  question: string;
  answer: string;
}

interface ProblemFactor {
  label: string;
  detail: string;
}

interface LandingButton {
  show: boolean; // true o false si se debe mostrar este botón de compra intermedio (activa el botón en 2 o 3 de las 6 secciones para no saturar)
  text: string; // Frase del botón llamativa con emojis, ej: "👉 COMPRAR CON ENVÍO GRATIS 🇪🇨"
}

interface Promotion {
  quantity: number; // Cantidad física del producto (ej: 1, 2, 3)
  price: number; // Precio promocional especial (ej: 24.99, 29.99)
  originalPrice: number; // Precio de venta original tachado (ej: 32.99, 65.99)
  title: string; // Nombre de la promoción, ej: "PACK 1: LLEVA 1 UNIDAD"
  badge: string; // Etiqueta promocional corta, ej: "DESCUENTO 🤩" o "MÁS VENDIDO 🔥"
  badgeClass: 'badgeOffer' | 'badgeSpecial' | 'badgeBest'; // Elige la clase correspondiente según la promoción
}

interface Product {
  name: string; // Nombre llamativo del producto
  subtitle: string; // Subtítulo persuasivo orientado al beneficio principal
  hookText: string; // Un gancho corto que capta la atención inmediatamente
  category: string; // Belleza, Cuidado Facial, Hogar, Tecnología, etc.
  price: string; // Precio en formato "$24.99" (o el precio real si el texto lo especifica)
  originalPrice: string; // Precio de referencia mayor (aprox el doble), ej "$50.00"
  tag: string; // "Más vendido", "Nuevo", "Oferta", etc.
  emoji: string; // Un emoji representativo
  bullets: string[]; // 4 frases persuasivas cortas que destaquen beneficios con emojis al inicio
  features: ProductFeature[]; // 4 características detalladas con emoji, título y descripción corta
  testimonials: ProductTestimonial[]; // 4 testimonios realistas con nombres locales de Ecuador (Quito, Guayaquil, Cuenca, etc.)
  comparisonTitle: string; // ej: "¿Por qué Zamvaro Ecuador es diferente?"
  comparisonOursLabel: string; // ej: "Marca Zamvaro"
  comparisonTheirsLabel: string; // ej: "Métodos Tradicionales" o "Genéricos"
  comparison: ProductComparisonRow[]; // 6 filas comparativas de por qué comprar a Zamvaro es mejor
  stats: ProductStat[]; // 3 estadísticas persuasivas (porcentajes de satisfacción, etc.)
  steps: ProductStep[]; // 3 pasos de uso simplificados y atractivos con emoji
  faqs: ProductFAQ[]; // 5 preguntas frecuentes con respuestas extremadamente cortas, directas y concisas (máximo 1 o 2 líneas cortas por respuesta), cubriendo envío gratis y pago contraentrega en Ecuador.
  guaranteeText: string; // Un texto convincente que garantice la satisfacción del cliente
  whatsappNumber: string; // Siempre "593939243014"
  primaryColor: string; // Color HEX dominante óptimo extraído de la imagen (o acotado al nicho si no hay imagen). Ej: "#DC2626". Evita colores planos y genéricos aburridos.
  problemHeadline: string; // Un título dramático de dolor/frustración, ej: "¿Cansada de perder más de 45 minutos batallando con el cepillado tradicional?"
  problemTagline: string; // Un subtítulo que aumente la incomodidad, ej: "Los cepillos genéricos maltratan tu cabello y queman tu cuero cabelludo."
  problemFactors: ProblemFactor[]; // 3 puntos de dolor específicos del cliente ideal, cada uno con label (ej: "Daño constante") y detail (ej: "La fricción excesiva rompe y abre las puntas del cabello").
  promptGallery: string; // Prompt altamente detallado y profesional en inglés para generar la imagen de portada y fondo del HERO (cabecera). Debe describir una escena de estilo comercial/publicitario que integre de forma natural el producto real con el perfil del cliente objetivo (ej: una persona preocupada por su cabello para un champú, o un auto limpio para una aspiradora) en un fondo temático que tenga el color dominante del producto (primaryColor) y elementos asociados (ej: plantas, ingredientes, luces ambientales), dejando espacio libre superior o lateral para superponer textos en la web, con estilo fotográfico comercial y de alta resolución.
  promptProblem: string; // Prompt psicológico en inglés enfocado a la sección de Problema/Frustración. Debe evocar incomodidad, dolor o lucha humana diaria asociada. Ej: "A frustrated [target profile gender/age] struggling with [the specific pain/mess], cinematic lighting, realistic photorealistic photography style, warm tones". Debe ser relevante al sexo de la audiencia objetivo.
  promptFeatures: string; // Prompt en inglés para primeros planos (macro) de la tecnología y detalles físicos del producto. Debe recalcar el color y la textura del producto real. Ej: "Close-up macro photo of the premium engineering parts of [product], focusing on [specific material/color details], studio lighting, extremely detailed".
  promptHowTo: string; // Prompt en inglés para la sección 'Cómo Usar' (3 Pasos). Debe mostrar a una persona feliz y satisfecha usando el producto en un ambiente moderno y luminoso. Ej: "Happy [target profile] in a bright, modern, minimalist home environment easily and comfortably using the [product], warm natural daylight, lifestyle commercial photography".
  landingButtons: LandingButton[]; // Array de exactamente 6 elementos para los botones de las secciones. Asigna show: true en solo 2 o 3 de ellos para distribuirlos balanceadamente.
  promotions: Promotion[]; // Array de exactamente 3 promociones sugeridas para el formulario de ofertas COD.
}

Genera solo el JSON válido sin ningún texto explicativo o formato Markdown alrededor. Sé persuasivo en español de Ecuador, amigable y muy enfocado en la conversión (Copywriting de alta conversión).
`;

    // Preparar el cuerpo del mensaje para Gemini API
    const parts: any[] = [
      { text: systemPrompt },
      { text: `TEXTO DEL PRODUCTO Y DETALLES PROPORCIONADOS POR EL USUARIO:\n\n${rawText}` }
    ];

    if (imageParts.length > 0) {
      parts.push({ text: "Analiza estas imágenes reales del producto para extraer los detalles físicos exactos del producto (material, color exacto, forma) y la audiencia objetivo (género y edad) para personalizar la estructura y los prompts." });
      parts.push(...imageParts);
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API de Gemini retornó estado ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const generatedJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedJsonText) {
      throw new Error('No se recibió contenido de la IA de Gemini');
    }

    const parsedJson = JSON.parse(generatedJsonText.trim());

    return NextResponse.json({
      success: true,
      product: parsedJson
    });
  } catch (error: any) {
    console.error('Error in generate-product API:', error);
    return NextResponse.json({ message: 'Error al generar producto con IA', error: error.message }, { status: 500 });
  }
}
