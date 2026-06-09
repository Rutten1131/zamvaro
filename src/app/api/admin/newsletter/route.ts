import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const [rows] = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error in GET /api/admin/newsletter:', error);
    return NextResponse.json({ error: 'Error al obtener suscriptores.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { subject, title, body, imageUrl, buttonText, buttonUrl } = await request.json();

    if (!subject || !body) {
      return NextResponse.json({ error: 'El asunto y el cuerpo del mensaje son obligatorios.' }, { status: 400 });
    }

    // Obtener todos los correos
    const [rows] = await pool.query('SELECT email FROM newsletter_subscribers');
    const subscribers = rows as { email: string }[];

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No hay suscriptores registrados en la base de datos.' }, { status: 400 });
    }

    // Configurar nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.zamvaro.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'reenviadores@zamvaro.com',
        pass: process.env.SMTP_PASS || 'Sl0e77f6b',
      },
    });

    const mailTo = subscribers.map((s) => s.email).join(', ');

    // Construir la plantilla HTML premium
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f7f9fc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #f7f9fc;
            padding: 40px 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          .header {
            background-color: #1a1a1a;
            padding: 30px;
            text-align: center;
          }
          .logo {
            max-height: 48px;
            filter: brightness(0) invert(1);
          }
          .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
          }
          .headline {
            font-size: 24px;
            font-weight: 700;
            color: #111111;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .body-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
          }
          .product-img {
            width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 30px;
            display: block;
          }
          .cta-wrap {
            text-align: center;
            margin: 30px 0;
          }
          .cta-btn {
            background-color: #9B046F;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            font-weight: 600;
            font-size: 16px;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 4px 6px rgba(155,4,111,0.2);
            transition: all 0.2s ease;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
          }
          .footer a {
            color: #9b046f;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <!-- Logotipo de la tienda -->
              <img src="https://zambaro.com/logo.webp" alt="Zamvaro Ecuador" class="logo">
            </div>
            
            <div class="content">
              ${title ? `<h1 class="headline">${title}</h1>` : ''}
              
              ${imageUrl ? `<img src="${imageUrl}" alt="Novedades de Zamvaro" class="product-img">` : ''}
              
              <div class="body-text">
                ${body.replace(/\n/g, '<br>')}
              </div>
              
              ${buttonText && buttonUrl ? `
                <div class="cta-wrap">
                  <a href="${buttonUrl}" target="_blank" class="cta-btn">${buttonText}</a>
                </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>Has recibido este correo electrónico porque estás suscrito al boletín de noticias de Zamvaro Ecuador.</p>
              <p>Ecuador • Pago contraentrega 🇪🇨</p>
              <p style="margin-top: 12px;">© ${new Date().getFullYear()} Zamvaro Ecuador. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Zamvaro Ecuador" <${process.env.SMTP_USER || 'reenviadores@zamvaro.com'}>`,
      to: mailTo,
      subject: subject,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, count: subscribers.length });
  } catch (error: any) {
    console.error('Error in POST /api/admin/newsletter:', error);
    return NextResponse.json({ error: error.message || 'Error al enviar boletines.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es obligatorio.' }, { status: 400 });
    }

    await pool.query('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/newsletter:', error);
    return NextResponse.json({ error: 'Error al eliminar suscriptor.' }, { status: 500 });
  }
}
