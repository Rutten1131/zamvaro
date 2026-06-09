import { NextResponse } from 'next/server';
import { processMessage } from '@/lib/bot-engine';

// GET: Verificación del Webhook por parte de Meta
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'zambaro_token_secreto_123456';

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('[Webhook] WEBHOOK_VERIFIED');
        return new Response(challenge, { status: 200 });
      } else {
        return new Response('Forbidden', { status: 403 });
      }
    }

    return new Response('Bad Request', { status: 400 });
  } catch (error) {
    console.error('[Webhook] Error en verificación:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// POST: Recibir mensajes de Evolution API
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Responder 200 inmediatamente para que Evolution API no reintente
    // El procesamiento se hace de forma asíncrona
    const event = body?.event || '';

    // Solo procesar eventos de mensajes entrantes
    if (event === 'messages.upsert' || (body?.data?.key && !body?.data?.key?.fromMe)) {
      // Procesar en background (sin await para responder rápido)
      processMessage(body).catch(err => {
        console.error('[Webhook] Error en processMessage:', err);
      });
    }

    return new Response('EVENT_RECEIVED', { status: 200 });
  } catch (error: any) {
    console.error('[Webhook] Error procesando evento:', error);
    // Devolver 200 de todas formas para evitar reintentos de Evolution
    return new Response('EVENT_RECEIVED', { status: 200 });
  }
}
