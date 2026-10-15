import crypto from 'node:crypto';
import { cookies } from 'next/headers';

// Autenticación mínima del panel de administración.
// Requiere ADMIN_PASSWORD (y opcionalmente ADMIN_SESSION_SECRET) en el .env.
export const ADMIN_COOKIE = 'sp_admin';
const SESSION_MS = 8 * 60 * 60 * 1000; // 8 horas

export function adminEnabled() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

export function checkPassword(input) {
  if (!adminEnabled()) return false;
  return crypto.timingSafeEqual(sha(input), sha(process.env.ADMIN_PASSWORD));
}

const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('hex');

export function createSessionToken() {
  const payload = String(Date.now() + SESSION_MS);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || !adminEnabled()) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return Number(payload) > Date.now();
}

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export const SESSION_MAX_AGE_S = SESSION_MS / 1000;
