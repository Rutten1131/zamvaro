import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) return false;

    const [username, expiresStr, signature] = token.split(':');
    if (!username || !expiresStr || !signature) return false;

    const expectedUser = process.env.ADMIN_USER || 'Zamvaro';
    if (username !== expectedUser) return false;

    const expires = parseInt(expiresStr, 10);
    if (isNaN(expires) || expires < Date.now()) return false;

    const secret = process.env.JWT_SECRET || 'zambaro_ecuador_secret_jwt_key_2026';
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${username}:${expiresStr}`)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}
