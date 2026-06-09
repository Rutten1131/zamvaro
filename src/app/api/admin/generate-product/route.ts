import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { rawText } = await request.json();
    if (!rawText) {
      return NextResponse.json({ message: 'El texto es requerido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        message: 'Configuración de IA incompleta. Por favor agrega GEMINI_API_KEY a tu archivo .env.local'
      }, { status: 400 });
    }

    const systemPrompt = `
Eres un redactor creativo de marketing y experto en comercio electrónico para la tienda "Zamvaro Ecuador".
Tu tarea es tomar el texto libre proporcionado sobre un producto y estructurarlo en un formato JSON extremadamente completo y premium.
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

interface Product {
  name: string; // Nombre llamativo del producto
  subtitle: string; // Subtítulo persuasivo orientada al beneficio principal
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
}

Genera solo el JSON válido. Sé persuasivo en español de Ecuador, amigable y muy enfocado en la conversión (Copywriting de alta conversión).
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                { text: `TEXTO DEL PRODUCTO A ANALIZAR:\n\n${rawText}` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API de Gemini retornó estado ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const generatedJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedJsonText) {
      throw new Error('No se recibió contenido de la IA');
    }

    const parsedJson = JSON.parse(generatedJsonText);

    return NextResponse.json({
      success: true,
      product: parsedJson
    });
  } catch (error: any) {
    console.error('Error in generate-product API:', error);
    return NextResponse.json({ message: 'Error al generar producto con IA', error: error.message }, { status: 500 });
  }
}
