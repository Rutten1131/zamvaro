import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Helper to hash data using SHA-256 for Meta CAPI
function sha256(data: string): string {
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

async function sendMetaCAPIEvent(product: any, formData: any, totalPrice: number, reqHeaders: Headers) {
  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.log('Meta CAPI not configured (missing Pixel ID or Access Token)');
    return;
  }

  try {
    // Clean phone number (Ecuador code is 593)
    let rawPhone = formData.whatsapp.replace(/\D/g, '');
    if (rawPhone.startsWith('0')) {
      rawPhone = '593' + rawPhone.substring(1);
    } else if (!rawPhone.startsWith('593') && rawPhone.length === 9) {
      rawPhone = '593' + rawPhone;
    }

    // Split name
    const nameParts = formData.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Get user agent and IP from headers
    const userAgent = reqHeaders.get('user-agent') || '';
    const ipAddress = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || '';

    const eventData = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: 'https://zambaro.com', // fallback domain
          user_data: {
            fn: [sha256(firstName)],
            ln: lastName ? [sha256(lastName)] : [],
            ph: [sha256(rawPhone)],
            ct: [sha256(formData.city)],
            st: [sha256(formData.province)],
            country: [sha256('ec')],
            client_ip_address: ipAddress || undefined,
            client_user_agent: userAgent || undefined,
          },
          custom_data: {
            currency: 'USD',
            value: totalPrice,
            content_name: product.name,
            content_ids: [product.id.toString()],
            content_type: 'product',
          },
        },
      ],
    };

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const resJson = await response.json();
    if (!response.ok) {
      console.error('Error sending event to Meta CAPI:', resJson);
    } else {
      console.log('Successfully sent event to Meta CAPI:', resJson);
    }
  } catch (error) {
    console.error('Exception during Meta CAPI call:', error);
  }
}

export async function POST(req: Request) {
  try {
    const { product, formData, totalPrice } = await req.json();

    if (!formData || !product) {
      return NextResponse.json({ error: 'Datos incompletos.' }, { status: 400 });
    }

    // Configurar el transportador de correo usando variables de entorno
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.zamvaro.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, 
      auth: {
        user: process.env.SMTP_USER || 'reenviadores@zamvaro.com',
        pass: process.env.SMTP_PASS || 'Sl0e77f6b',
      },
    });

    const emailSubject = `🛒 Nuevo Pedido Contraentrega - ${product.name}`;
    
    const emailBody = `
      <h2>¡Nuevo pedido recibido para ${product.name}! 🚚</h2>
      <p>A continuación se detallan los datos ingresados por el cliente para el Pago Contraentrega:</p>
      
      <table border="1" cellpadding="8" style="border-collapse: collapse; font-family: sans-serif; width: 100%; max-width: 600px;">
        <tr style="background-color: #f2f2f2;">
          <th colspan="2" style="text-align: left;">Detalles del Pedido</th>
        </tr>
        <tr>
          <td><strong>Producto:</strong></td>
          <td>${product.name}</td>
        </tr>
        <tr>
          <td><strong>Precio:</strong></td>
          <td>$${totalPrice.toFixed(2)}</td>
        </tr>
        <tr style="background-color: #f2f2f2;">
          <th colspan="2" style="text-align: left;">Datos de Envío del Cliente</th>
        </tr>
        <tr>
          <td><strong>Nombre completo:</strong></td>
          <td>${formData.fullName}</td>
        </tr>
        <tr>
          <td><strong>WhatsApp:</strong></td>
          <td>${formData.whatsapp}</td>
        </tr>
        <tr>
          <td><strong>Calle Principal:</strong></td>
          <td>${formData.street1}</td>
        </tr>
        <tr>
          <td><strong>Calle Secundaria:</strong></td>
          <td>${formData.street2 || 'N/A'}</td>
        </tr>
        <tr>
          <td><strong>Barrio / Sector / Ciudadela:</strong></td>
          <td>${formData.neighborhood}</td>
        </tr>
        <tr>
          <td><strong>Punto de Referencia:</strong></td>
          <td>${formData.reference || 'N/A'}</td>
        </tr>
        <tr>
          <td><strong>Provincia:</strong></td>
          <td>${formData.province}</td>
        </tr>
        <tr>
          <td><strong>Ciudad o Cantón:</strong></td>
          <td>${formData.city}</td>
        </tr>
      </table>
      
      <p style="margin-top: 24px; font-size: 0.9rem; color: #555;">
        Este pedido está listo para ser despachado. Comunícate con el cliente vía WhatsApp al número provisto para confirmar la entrega.
      </p>
    `;

    // Obtener los destinatarios desde variables de entorno
    const mailTo = process.env.EMAIL_TO || 'cristhopheryeah113@gmail.com,paulooreyess77@gmail.com';

    const mailOptions = {
      from: `"Zamvaro Ecuador Pedidos" <${process.env.SMTP_USER || 'reenviadores@zamvaro.com'}>`,
      to: mailTo,
      subject: emailSubject,
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);

    // Enviar evento de compra a la API de Conversiones de Meta (CAPI) en segundo plano
    await sendMetaCAPIEvent(product, formData, totalPrice, req.headers);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error enviando correo SMTP:', error);
    return NextResponse.json({ error: error.message || 'Error al enviar el correo.' }, { status: 500 });
  }
}
