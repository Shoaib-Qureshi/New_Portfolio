import 'server-only';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const adminCookieName = 'portfolio_admin_session';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  return process.env.AUTH_SECRET || 'dev-portfolio-auth-secret-change-me';
}

function username() {
  return process.env.ADMIN_USERNAME || 'admin';
}

function sign(value: string) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('base64url')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('base64url');
  return `pbkdf2:${salt}:${hash}`;
}

function verifyPassword(password: string) {
  const configured = process.env.ADMIN_PASSWORD_HASH;
  if (!configured) return password === 'admin123';
  const [scheme, salt, expected] = configured.split(':');
  if (scheme !== 'pbkdf2' || !salt || !expected) return false;
  const actual = hashPassword(password, salt).split(':')[2];
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function verifyAdminCredentials(inputUsername: string, password: string) {
  return inputUsername === username() && verifyPassword(password);
}

export function createSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${username()}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  if (parts[2].length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected))) return false;
  return Number(parts[1]) > Math.floor(Date.now() / 1000);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(adminCookieName)?.value);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(adminCookieName, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName);
}
