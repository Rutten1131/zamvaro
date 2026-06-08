import { NextResponse } from 'next/server';

// GET: Para la verificación del Webhook por parte de Meta
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Comprobamos que el modo sea 'subscribe' y que el token coincida con el que configuramos
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'mi_token_de_verificacion_seguro';

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WEBHOOK_VERIFIED');
        // Meta requiere que devolvamos el challenge como texto plano y código 200
        return new Response(challenge, { status: 200 });
      } else {
        return new Response('Forbidden', { status: 403 });
      }
    }

    return new Response('Bad Request', { status: 400 });
  } catch (error) {
    console.error('Error en la verificación del webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// POST: Para recibir las notificaciones y mensajes de WhatsApp
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Aquí recibes todos los eventos de WhatsApp (mensajes enviados, recibidos, estados de entrega, etc.)
    console.log('Evento de WhatsApp recibido:', JSON.stringify(body, null, 2));

    // Validar que es un evento válido de WhatsApp API
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // Número de teléfono del cliente
        const messageText = message.text?.body; // Contenido del mensaje

        console.log(`Mensaje de ${from}: ${messageText}`);

        // TODO: Procesa aquí el mensaje de WhatsApp (guardarlo en base de datos, responder con un bot, etc.)
      }
      return new Response('EVENT_RECEIVED', { status: 200 });
    } else {
      return new Response('Not Found', { status: 404 });
    }
  } catch (error: any) {
    console.error('Error procesando evento del webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
