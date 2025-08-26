import { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { Env, AuthSession } from '../types';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateId(): string {
  return crypto.randomUUID();
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createSession(c: Context<{ Bindings: Env }>, userId: string): Promise<void> {
  const session: AuthSession = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION
  };
  
  const token = btoa(JSON.stringify(session));
  
  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  });
}

export async function getSession(c: Context<{ Bindings: Env }>): Promise<AuthSession | null> {
  const token = getCookie(c, 'session');
  if (!token) return null;
  
  try {
    const session: AuthSession = JSON.parse(atob(token));
    if (session.expiresAt < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function requireAuth(c: Context<{ Bindings: Env }>): Promise<AuthSession> {
  const session = await getSession(c);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function clearSession(c: Context<{ Bindings: Env }>): Promise<void> {
  setCookie(c, 'session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 0,
    path: '/'
  });
}