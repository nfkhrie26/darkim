import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.ADMIN_JWT_SECRET || 'darkim_fallback_secret_key_2026';
const COOKIE_NAME = 'darkim_admin_token';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SECRET).digest('hex');
}

export function createToken(payload: { id: string; username: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const b64 = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url');
  return `${b64}.${signature}`;
}

export function verifyToken(token: string): { id: string; username: string } | null {
  try {
    const [b64, signature] = token.split('.');
    if (!b64 || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url');
    if (signature !== expectedSig) return null;

    const parsed = JSON.parse(Buffer.from(b64, 'base64url').toString('utf-8'));
    if (parsed.exp && parsed.exp < Date.now()) return null;
    return { id: parsed.id, username: parsed.username };
  } catch {
    return null;
  }
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME };

