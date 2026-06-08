import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const expectedUser = process.env.ADMIN_USER || 'Zamvaro';
    const expectedPass = process.env.ADMIN_PASS || 'Contraseña123.';

    if (username === expectedUser && password === expectedPass) {
      // Crear un token simple firmado con HMAC usando la firma crypto nativa de Node
      const secret = process.env.JWT_SECRET || 'zambaro_ecuador_secret_jwt_key_2026';
      const maxAge = 60 * 60 * 24; // 1 día
      const expires = Date.now() + maxAge * 1000;
      const signature = crypto
        .createHmac('sha256', secret)
        .update(`${username}:${expires}`)
        .digest('hex');

      const response = NextResponse.json({ success: true, message: 'Sesión iniciada con éxito' });

      // Establecer cookie HttpOnly segura
      response.cookies.set('admin_token', `${username}:${expires}:${signature}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAge,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Usuario o contraseña incorrectos' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
  }
}
