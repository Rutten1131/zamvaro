# 🛒 Flujo Completo: Landing Pages de Dropshipping con AI
**Stack:** Next.js + TypeScript + Tailwind + Claude API  
**Objetivo:** Generar páginas de venta de alto impacto como `comprandoando.site` y `mundodrop.lat`

---

## ÍNDICE
1. [Fase 1 — Investigación del producto](#fase-1)
2. [Fase 2 — Generación de copy con AI](#fase-2)
3. [Fase 3 — Imágenes con AI](#fase-3)
4. [Fase 4 — Template Next.js](#fase-4)
5. [Fase 5 — Checkout y pedidos](#fase-5)
6. [Fase 6 — Deploy y tráfico](#fase-6)
7. [SISTEMA COMPLETO: Todo junto](#sistema-completo)

---

## FASE 1 — Investigación del producto {#fase-1}

### Qué necesitas
- Cuenta en **Minea** o **AdSpy** (opcional, la versión gratis alcanza para empezar)
- Acceso a **Claude API** o claude.ai
- Cuenta en **AliExpress** para verificar precios

### Prompt de investigación de avatar (copiar y usar en Claude)

```
Actúa como un experto en marketing de respuesta directa para dropshipping en Latinoamérica.

Tengo un producto: [NOMBRE DEL PRODUCTO]
País objetivo: [Ecuador / Colombia / México / Perú]
Precio de venta: $[PRECIO]

Necesito que me entregues un análisis completo del avatar de cliente ideal:

1. DEMOGRAFÍA
   - Edad, género, ciudad
   - Nivel socioeconómico
   - Dispositivo que usa (móvil/escritorio)

2. DOLOR PRINCIPAL (el que este producto resuelve)
   - Describe el dolor en sus propias palabras, como él lo diría
   - ¿Cuánto tiempo lleva sufriendo esto?
   - ¿Qué ha intentado antes sin éxito?

3. DESEO PROFUNDO
   - ¿Qué resultado final quiere realmente? (más allá del producto)
   - ¿Cómo imagina su vida después de resolver el problema?

4. OBJECIONES PRINCIPALES
   - Lista 5 razones por las que NO compraría
   - ¿Por qué desconfiaría de una tienda online?

5. DISPARADORES EMOCIONALES
   - ¿Qué palabras o frases lo activan emocionalmente?
   - ¿Qué testimonios lo convencerían más?

Responde en formato JSON con estas claves exactas:
{
  "demografia": {},
  "dolor": {},
  "deseo": {},
  "objeciones": [],
  "disparadores": []
}
```

### Prompt para validar el producto

```
Tengo este producto para dropshipping: [NOMBRE DEL PRODUCTO]
Precio de compra: $[PRECIO_COMPRA]
Precio de venta objetivo: $[PRECIO_VENTA]

Analiza:
1. ¿Tiene potencial de venta en Latam? ¿Por qué sí o no?
2. ¿Cuál es el margen neto estimado (descontando ads, envío, devoluciones ~15%)?
3. ¿Qué ángulo de marketing funcionaría mejor?
4. ¿Qué objeción es la más difícil de superar para este producto?
5. Ejemplo de headline que usarías para un anuncio en Facebook

Sé directo, no me vendas humo.
```

---

## FASE 2 — Generación de copy con AI {#fase-2}

### Variables de entorno necesarias
```env
ANTHROPIC_API_KEY=sk-ant-XXXXXXXX
```

### Prompt maestro de copy para la landing (el más importante)

```
Eres un copywriter de respuesta directa especializado en landing pages de dropshipping para Latinoamérica.

PRODUCTO: [NOMBRE]
PAÍS: [PAÍS]
PRECIO: $[PRECIO] (antes: $[PRECIO_TACHADO])
AVATAR: [pegar resultado del Prompt de Fase 1]

Genera el copy completo para una landing page de venta de una sola página.
Usa lenguaje coloquial del país objetivo. Máximo impacto emocional.

Estructura requerida (responde SOLO en JSON válido, sin markdown):
{
  "headline": "Titular principal — máximo 10 palabras, con el dolor o el deseo",
  "subheadline": "Subtítulo — expande el headline, máximo 20 palabras",
  "hook_parrafo": "Párrafo de apertura de 2-3 oraciones que conecta con el dolor",
  "beneficios": [
    {"emoji": "✅", "titulo": "Beneficio 1", "descripcion": "Descripción breve"},
    {"emoji": "✅", "titulo": "Beneficio 2", "descripcion": "Descripción breve"},
    {"emoji": "✅", "titulo": "Beneficio 3", "descripcion": "Descripción breve"},
    {"emoji": "✅", "titulo": "Beneficio 4", "descripcion": "Descripción breve"},
    {"emoji": "✅", "titulo": "Beneficio 5", "descripcion": "Descripción breve"}
  ],
  "como_funciona": [
    {"paso": 1, "titulo": "Paso 1", "descripcion": "..."},
    {"paso": 2, "titulo": "Paso 2", "descripcion": "..."},
    {"paso": 3, "titulo": "Paso 3", "descripcion": "..."}
  ],
  "testimonios": [
    {
      "nombre": "Nombre local del país",
      "ciudad": "Ciudad del país",
      "texto": "Testimonio de 2-3 oraciones, específico con resultado real",
      "estrellas": 5,
      "tiempo": "Hace 3 días"
    },
    {
      "nombre": "Nombre 2",
      "ciudad": "Ciudad 2", 
      "texto": "Testimonio diferente",
      "estrellas": 5,
      "tiempo": "Hace 1 semana"
    },
    {
      "nombre": "Nombre 3",
      "ciudad": "Ciudad 3",
      "texto": "Testimonio diferente",
      "estrellas": 5,
      "tiempo": "Hace 2 semanas"
    }
  ],
  "garantia": {
    "titulo": "Garantía de satisfacción",
    "descripcion": "Descripción de la garantía en 2 oraciones"
  },
  "urgencia_stock": "🔥 [X] Vendidos - Solo [Y] Unidades Disponibles 🔥",
  "precio_actual": "[PRECIO]",
  "precio_anterior": "[PRECIO_TACHADO]",
  "cta_principal": "Texto del botón principal (máx 6 palabras)",
  "cta_secundario": "Texto botón secundario",
  "faq": [
    {"pregunta": "¿Cuánto tarda el envío?", "respuesta": "..."},
    {"pregunta": "¿Cómo pago?", "respuesta": "..."},
    {"pregunta": "¿Tiene garantía?", "respuesta": "..."},
    {"pregunta": "¿Es original?", "respuesta": "..."}
  ],
  "badge_confianza": ["Envío rápido", "Pago seguro", "Garantía 30 días", "Soporte 24/7"]
}
```

### API route en Next.js para generar copy

```typescript
// app/api/generate-copy/route.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { producto, pais, precio, precioAnterior, avatar } = await request.json();

  const prompt = `Eres un copywriter de respuesta directa especializado en landing pages de dropshipping para Latinoamérica.

PRODUCTO: ${producto}
PAÍS: ${pais}
PRECIO: $${precio} (antes: $${precioAnterior})
AVATAR: ${JSON.stringify(avatar)}

Genera el copy completo para una landing page. Usa lenguaje coloquial del país.
Responde SOLO en JSON válido sin markdown con esta estructura:
{
  "headline": "...",
  "subheadline": "...",
  "hook_parrafo": "...",
  "beneficios": [{"emoji":"✅","titulo":"...","descripcion":"..."}],
  "como_funciona": [{"paso":1,"titulo":"...","descripcion":"..."}],
  "testimonios": [{"nombre":"...","ciudad":"...","texto":"...","estrellas":5,"tiempo":"..."}],
  "garantia": {"titulo":"...","descripcion":"..."},
  "urgencia_stock": "🔥 X Vendidos - Solo Y Unidades 🔥",
  "precio_actual": "${precio}",
  "precio_anterior": "${precioAnterior}",
  "cta_principal": "...",
  "cta_secundario": "...",
  "faq": [{"pregunta":"...","respuesta":"..."}],
  "badge_confianza": ["..."]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  
  // Limpiar posibles backticks de markdown
  const clean = text.replace(/```json|```/g, "").trim();
  const copy = JSON.parse(clean);

  return Response.json({ success: true, copy });
}
```

---

## FASE 3 — Imágenes con AI {#fase-3}

### Herramientas recomendadas

| Herramienta | Uso | Precio |
|---|---|---|
| **GPT-4o** (ChatGPT Plus) | Mockup del producto con texto, lifestyle shots | $20/mes |
| **Midjourney** | Imágenes de personas usando el producto | $10/mes |
| **Canva AI** | Banners, comparativos antes/después | Gratis/Pro |
| **Remove.bg** | Quitar fondo del producto | Gratis (20/mes) |
| **ThisPersonDoesNotExist** | Fotos para testimonios | Gratis |

### Prompts para GPT-4o image generation

**Mockup principal del producto:**
```
Product mockup photo of [NOMBRE DEL PRODUCTO], clean white background, 
professional e-commerce photography, high resolution, studio lighting, 
the product is the hero, no text, photorealistic
```

**Imagen lifestyle (persona usando el producto):**
```
Lifestyle photo of a [EDAD]-year-old [GÉNERO] from [PAÍS] using [PRODUCTO].
Natural lighting, home setting, happy expression, candid moment, 
photorealistic, not stock photo aesthetic, Latin American appearance
```

**Imagen antes/después:**
```
Split image comparison: left side shows [PROBLEMA], right side shows 
[RESULTADO DESPUÉS DE USAR EL PRODUCTO]. Clean design, text labels 
"Antes" and "Después", realistic photography style
```

**Banner de oferta:**
```
E-commerce promotional banner for [PRODUCTO], bold text "[OFERTA]", 
urgency feel, red and orange colors, price tag showing $[PRECIO], 
"¡Últimas unidades!" text, professional design
```

### Dónde subir las imágenes
- Shopify CDN (si usas Shopify como backend)
- **Cloudinary** (gratis hasta 25GB) — recomendado para Next.js
- AWS S3 + CloudFront
- Vercel Blob Storage

---

## FASE 4 — Template Next.js {#fase-4}

### Estructura de carpetas

```
/app
  /[producto]
    /landing
      page.tsx          ← La landing page
  /api
    /generate-copy
      route.ts          ← Genera copy con Claude
    /generate-avatar
      route.ts          ← Genera avatar de cliente
    /orders
      route.ts          ← Recibe pedidos
/components
  /landing
    Hero.tsx
    Benefits.tsx
    HowItWorks.tsx
    Testimonials.tsx
    Pricing.tsx
    FAQ.tsx
    StickyCart.tsx
    CountdownTimer.tsx
    StockBadge.tsx
/types
  landing.ts
```

### Tipos TypeScript

```typescript
// types/landing.ts
export interface LandingContent {
  headline: string;
  subheadline: string;
  hook_parrafo: string;
  beneficios: Beneficio[];
  como_funciona: Paso[];
  testimonios: Testimonio[];
  garantia: Garantia;
  urgencia_stock: string;
  precio_actual: string;
  precio_anterior: string;
  cta_principal: string;
  cta_secundario: string;
  faq: FAQ[];
  badge_confianza: string[];
}

export interface Beneficio {
  emoji: string;
  titulo: string;
  descripcion: string;
}

export interface Paso {
  paso: number;
  titulo: string;
  descripcion: string;
}

export interface Testimonio {
  nombre: string;
  ciudad: string;
  texto: string;
  estrellas: number;
  tiempo: string;
  foto?: string;
}

export interface Garantia {
  titulo: string;
  descripcion: string;
}

export interface FAQ {
  pregunta: string;
  respuesta: string;
}

export interface Pedido {
  nombre: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  referencia?: string;
  cantidad: number;
  producto: string;
  precio: string;
  timestamp: string;
}
```

### Componente principal de la landing

```typescript
// app/[producto]/landing/page.tsx
import { Suspense } from "react";
import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import StickyCart from "@/components/landing/StickyCart";
import { LandingContent } from "@/types/landing";

// Puedes cargar el contenido desde un JSON estático o desde tu API
async function getLandingContent(producto: string): Promise<LandingContent> {
  // Opción A: Desde archivo JSON estático (más rápido)
  // const data = await import(`@/data/landings/${producto}.json`);
  // return data.default;

  // Opción B: Generado dinámicamente con Claude (primera vez)
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/generate-copy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ producto }),
    next: { revalidate: 86400 }, // Cache 24h
  });
  const data = await res.json();
  return data.copy;
}

export default async function LandingPage({
  params,
}: {
  params: { producto: string };
}) {
  const content = await getLandingContent(params.producto);

  return (
    <main className="bg-white min-h-screen">
      <Hero content={content} />
      <Benefits beneficios={content.beneficios} />
      <HowItWorks pasos={content.como_funciona} />
      <Testimonials testimonios={content.testimonios} />
      <Pricing content={content} />
      <FAQ faqs={content.faq} />
      <StickyCart cta={content.cta_principal} precio={content.precio_actual} />
    </main>
  );
}
```

### Componente Hero (sección más importante)

```typescript
// components/landing/Hero.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import StockBadge from "./StockBadge";
import OrderForm from "./OrderForm";
import { LandingContent } from "@/types/landing";

export default function Hero({ content }: { content: LandingContent }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="bg-white px-4 py-6 max-w-lg mx-auto">
      {/* Badge de urgencia */}
      <StockBadge text={content.urgencia_stock} />

      {/* Imagen del producto */}
      <div className="my-4 relative">
        <Image
          src="/images/producto-hero.png"
          alt="Producto"
          width={400}
          height={400}
          className="w-full rounded-lg"
          priority
        />
      </div>

      {/* Headline */}
      <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
        {content.headline}
      </h1>
      <p className="text-base text-gray-600 mb-4">{content.subheadline}</p>

      {/* Precio */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-gray-400 line-through text-lg">
          ANTES: ${content.precio_anterior}
        </span>
        <span className="text-3xl font-black text-red-600">
          AHORA: ${content.precio_actual}
        </span>
      </div>

      {/* Countdown */}
      <CountdownTimer minutes={15} />

      {/* CTA principal */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-black text-xl py-5 rounded-xl mt-4 animate-pulse"
      >
        🛒 {content.cta_principal}
      </button>

      {/* Badges de confianza */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
        {content.badge_confianza.map((badge, i) => (
          <span key={i}>✅ {badge}</span>
        ))}
      </div>

      {/* Formulario de pedido */}
      {showForm && <OrderForm onClose={() => setShowForm(false)} />}
    </section>
  );
}
```

### Componente Countdown Timer

```typescript
// components/landing/CountdownTimer.tsx
"use client";
import { useState, useEffect } from "react";

export default function CountdownTimer({ minutes = 15 }: { minutes?: number }) {
  const [time, setTime] = useState(minutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((t) => (t > 0 ? t - 1 : minutes * 60)); // Reinicia cuando llega a 0
    }, 1000);
    return () => clearInterval(timer);
  }, [minutes]);

  const m = Math.floor(time / 60).toString().padStart(2, "0");
  const s = (time % 60).toString().padStart(2, "0");

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
      <p className="text-sm text-red-700 font-semibold">⏰ Oferta termina en:</p>
      <p className="text-3xl font-black text-red-600 font-mono">
        {m}:{s}
      </p>
    </div>
  );
}
```

### Componente Stock Badge

```typescript
// components/landing/StockBadge.tsx
export default function StockBadge({ text }: { text: string }) {
  return (
    <div className="bg-red-600 text-white text-center py-2 px-4 rounded-lg text-sm font-bold animate-pulse">
      {text}
    </div>
  );
}
```

---

## FASE 5 — Checkout y pedidos {#fase-5}

### Formulario de pedido (COD - Pago contra entrega)

```typescript
// components/landing/OrderForm.tsx
"use client";
import { useState } from "react";
import { Pedido } from "@/types/landing";

interface OrderFormProps {
  onClose: () => void;
  producto?: string;
  precio?: string;
}

export default function OrderForm({
  onClose,
  producto = "Producto",
  precio = "0",
}: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    referencia: "",
    cantidad: "1",
  });

  const handleSubmit = async () => {
    if (!form.nombre || !form.telefono || !form.direccion || !form.ciudad) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    setLoading(true);

    const pedido: Pedido = {
      ...form,
      cantidad: parseInt(form.cantidad),
      producto,
      precio,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });
      setSuccess(true);
    } catch (error) {
      alert("Error al procesar el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-green-600 mb-2">
            ¡Pedido confirmado!
          </h2>
          <p className="text-gray-600 mb-2">
            Recibirás una llamada de confirmación en las próximas horas.
          </p>
          <p className="text-sm text-gray-400">
            Pagas al recibir tu pedido en casa.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full bg-green-500 text-white font-bold py-3 rounded-xl"
          >
            Entendido ✅
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">Completa tu pedido</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">×</button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
          ✅ Pagas cuando recibes — Sin riesgo
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Nombre completo *
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Tu nombre"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-base"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Número de teléfono *
            </label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="0991234567"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-base"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Ciudad *
            </label>
            <input
              type="text"
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
              placeholder="Loja, Guayaquil, Quito..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-base"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Dirección completa *
            </label>
            <textarea
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Calle, número, barrio..."
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-base"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Referencia (opcional)
            </label>
            <input
              type="text"
              value={form.referencia}
              onChange={(e) => setForm({ ...form, referencia: e.target.value })}
              placeholder="Casa azul, frente al parque..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-base"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Cantidad
            </label>
            <select
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
            >
              <option value="1">1 unidad</option>
              <option value="2">2 unidades (ahorra más)</option>
              <option value="3">3 unidades (mejor precio)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-black text-lg py-4 rounded-xl mt-5"
        >
          {loading ? "Procesando..." : "🛒 CONFIRMAR PEDIDO"}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Al confirmar aceptas los términos de venta. Pagas al recibir.
        </p>
      </div>
    </div>
  );
}
```

### API route para guardar pedidos

```typescript
// app/api/orders/route.ts
import { Pedido } from "@/types/landing";

export async function POST(request: Request) {
  const pedido: Pedido = await request.json();

  // OPCIÓN A: Guardar en Google Sheets (recomendado para empezar)
  await saveToGoogleSheets(pedido);

  // OPCIÓN B: Guardar en base de datos (cuando escales)
  // await saveToDatabase(pedido);

  // Notificar por WhatsApp/Telegram (opcional)
  // await notifyWhatsApp(pedido);

  return Response.json({ success: true, message: "Pedido recibido" });
}

// Guardar en Google Sheets via Google Sheets API
async function saveToGoogleSheets(pedido: Pedido) {
  const SHEET_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  
  if (!SHEET_WEBHOOK) return;

  await fetch(SHEET_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      values: [[
        pedido.timestamp,
        pedido.nombre,
        pedido.telefono,
        pedido.ciudad,
        pedido.direccion,
        pedido.referencia || "",
        pedido.cantidad,
        pedido.producto,
        pedido.precio,
        "PENDIENTE", // Estado inicial
      ]],
    }),
  });
}
```

### Configurar Google Sheets como base de datos (pasos)

```
1. Ir a script.google.com
2. Crear nuevo script con este código:

function doPost(e) {
  var sheet = SpreadsheetApp.openById("TU_SHEET_ID").getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow(data.values[0]);
  return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}

3. Publicar como Web App → Acceso: Cualquier persona
4. Copiar la URL generada
5. Ponerla en .env.local como GOOGLE_SHEETS_WEBHOOK_URL
```

### Variables de entorno completas

```env
# .env.local

# Claude AI
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXX

# Google Sheets (para pedidos)
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXXXX/exec

# URL de tu app
NEXT_PUBLIC_URL=https://tu-dominio.com

# WhatsApp Business API (opcional — para notificaciones)
WHATSAPP_TOKEN=XXXXXXXX
WHATSAPP_PHONE_ID=XXXXXXXX
WHATSAPP_RECIPIENT=593XXXXXXXXX
```

---

## FASE 6 — Deploy y tráfico {#fase-6}

### Deploy en Vercel (el más fácil)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Desde la carpeta del proyecto
vercel

# 3. Configurar variables de entorno en vercel.com
# Dashboard → Settings → Environment Variables
# Agregar: ANTHROPIC_API_KEY, GOOGLE_SHEETS_WEBHOOK_URL, etc.

# 4. Dominio personalizado
# Vercel Dashboard → Domains → Add Domain
# Comprar dominio en: namecheap.com, porkbun.com (baratos)
```

### Estructura de URLs para tracking

```
https://tu-dominio.com/NOMBRE_PRODUCTO/landing
  ?utm_source=facebook
  &utm_medium=cpc
  &utm_campaign=NOMBRE_CAMPAÑA
  &utm_content=NOMBRE_ANUNCIO
  &fbclid={fbclid}
```

### Capturar UTMs en Next.js

```typescript
// app/[producto]/landing/page.tsx
import { cookies } from "next/headers";

export default async function LandingPage({
  params,
  searchParams,
}: {
  params: { producto: string };
  searchParams: { [key: string]: string };
}) {
  // Guardar UTMs para incluirlos en el pedido
  const utms = {
    source: searchParams.utm_source || "",
    medium: searchParams.utm_medium || "",
    campaign: searchParams.utm_campaign || "",
    content: searchParams.utm_content || "",
    fbclid: searchParams.fbclid || "",
  };

  // Pasar utms al formulario de pedido para trackear qué anuncio convierte
  // ...
}
```

### Píxel de Facebook en Next.js

```typescript
// app/layout.tsx — Agregar en el <head>
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

```typescript
// Disparar evento de compra cuando se confirme el pedido
// En OrderForm.tsx, dentro del handleSubmit después del éxito:
if (typeof window !== "undefined" && (window as any).fbq) {
  (window as any).fbq("track", "Purchase", {
    value: parseFloat(precio),
    currency: "USD",
    content_name: producto,
  });
}
```

---

## SISTEMA COMPLETO: Todo junto {#sistema-completo}

### Instalación desde cero

```bash
# 1. Crear proyecto Next.js
npx create-next-app@latest mi-tienda --typescript --tailwind --app

cd mi-tienda

# 2. Instalar dependencias
npm install @anthropic-ai/sdk

# 3. Crear estructura de carpetas
mkdir -p app/api/generate-copy
mkdir -p app/api/orders
mkdir -p app/\[producto\]/landing
mkdir -p components/landing
mkdir -p types

# 4. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves
```

### Script generador completo (1 comando → landing lista)

```typescript
// scripts/generate-landing.ts
// Uso: npx ts-node scripts/generate-landing.ts "Shampoo de Batana" "Ecuador" "24.99" "35.00"

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic();

async function generateLanding(
  producto: string,
  pais: string,
  precio: string,
  precioAnterior: string
) {
  console.log(`\n🚀 Generando landing para: ${producto}\n`);

  // PASO 1: Generar avatar
  console.log("📊 Paso 1/3: Analizando avatar de cliente...");
  const avatarMsg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Analiza el avatar de cliente para dropshipping de "${producto}" en ${pais}. 
Responde SOLO en JSON con: {"dolor":"...","deseo":"...","objeciones":[],"disparadores":[]}`,
      },
    ],
  });
  const avatarText = avatarMsg.content[0].type === "text" ? avatarMsg.content[0].text : "{}";
  const avatar = JSON.parse(avatarText.replace(/```json|```/g, "").trim());
  console.log("✅ Avatar listo");

  // PASO 2: Generar copy completo
  console.log("✍️  Paso 2/3: Generando copy de la landing...");
  const copyMsg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Copywriter de respuesta directa para dropshipping en ${pais}.
PRODUCTO: ${producto} | PRECIO: $${precio} (antes $${precioAnterior})
AVATAR: ${JSON.stringify(avatar)}
Genera copy completo. SOLO JSON válido sin markdown:
{
  "headline":"...","subheadline":"...","hook_parrafo":"...",
  "beneficios":[{"emoji":"✅","titulo":"...","descripcion":"..."}],
  "como_funciona":[{"paso":1,"titulo":"...","descripcion":"..."}],
  "testimonios":[{"nombre":"...","ciudad":"...","texto":"...","estrellas":5,"tiempo":"..."}],
  "garantia":{"titulo":"...","descripcion":"..."},
  "urgencia_stock":"🔥 X Vendidos - Solo Y Unidades 🔥",
  "precio_actual":"${precio}","precio_anterior":"${precioAnterior}",
  "cta_principal":"...","cta_secundario":"...",
  "faq":[{"pregunta":"...","respuesta":"..."}],
  "badge_confianza":["..."]
}`,
      },
    ],
  });
  const copyText = copyMsg.content[0].type === "text" ? copyMsg.content[0].text : "{}";
  const copy = JSON.parse(copyText.replace(/```json|```/g, "").trim());
  console.log("✅ Copy listo");

  // PASO 3: Guardar JSON
  console.log("💾 Paso 3/3: Guardando archivos...");
  const slug = producto.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  
  const dataDir = path.join(process.cwd(), "data", "landings");
  fs.mkdirSync(dataDir, { recursive: true });
  
  const outputPath = path.join(dataDir, `${slug}.json`);
  fs.writeFileSync(outputPath, JSON.stringify({ avatar, copy, meta: { producto, pais, precio, precioAnterior, slug } }, null, 2));

  console.log(`\n✅ ¡Landing generada exitosamente!`);
  console.log(`📁 Datos en: data/landings/${slug}.json`);
  console.log(`🌐 URL: http://localhost:3000/${slug}/landing\n`);
  
  return { avatar, copy, slug };
}

// Ejecutar
const [, , producto, pais, precio, precioAnterior] = process.argv;
if (!producto) {
  console.error("Uso: npx ts-node scripts/generate-landing.ts \"Nombre Producto\" \"País\" \"24.99\" \"35.00\"");
  process.exit(1);
}

generateLanding(
  producto || "Producto",
  pais || "Ecuador",
  precio || "24.99",
  precioAnterior || "39.99"
);
```

### Checklist de lanzamiento

```
ANTES DE PUBLICAR:
□ Imágenes del producto subidas y optimizadas (WebP, <200KB)
□ Copy generado y revisado manualmente
□ Formulario de pedido probado
□ Google Sheets recibiendo pedidos (probar con pedido fake)
□ Variables de entorno configuradas en Vercel
□ Dominio configurado con SSL
□ Píxel de Facebook instalado y verificado (con Meta Pixel Helper)
□ UTMs en la URL del anuncio

PRIMER DÍA DE ADS:
□ Presupuesto inicial: $5-10/día
□ 2-3 creativos diferentes
□ Audiencia amplia (intereses relacionados al producto)
□ Monitorear costo por pedido cada 12 horas
□ Si CPP > 3x el precio del producto → pausar y optimizar copy/imagen
```

### Costos estimados para empezar

| Ítem | Costo mensual |
|---|---|
| Dominio (Namecheap) | ~$12/año = $1/mes |
| Vercel (Hobby) | Gratis |
| Claude API (copys) | ~$2-5 (según uso) |
| ChatGPT Plus (imágenes) | $20 |
| Facebook Ads (prueba) | $150-300 |
| **TOTAL** | **~$175-330/mes** |

---

*Generado para proyecto Next.js + TypeScript + Tailwind*  
*Claude API Model: claude-sonnet-4-6*  
*Última actualización: Junio 2026*
