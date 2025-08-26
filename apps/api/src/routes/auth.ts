import { Hono } from 'hono';
import { Env, User } from '../types';
import { createSession, clearSession, generateId, hashPassword } from '../utils/auth';

export const authRoutes = new Hono<{ Bindings: Env }>();

authRoutes.post('/start', async (c) => {
  const { type, identifier } = await c.req.json();
  
  if (type === 'dev') {
    const userId = generateId();
    const user: User = {
      id: userId,
      created_at: Date.now(),
      handle: identifier || 'dev_user',
      role: 'user'
    };
    
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO users (id, created_at, handle, role) VALUES (?, ?, ?, ?)'
    ).bind(user.id, user.created_at, user.handle, user.role).run();
    
    await createSession(c, userId);
    
    return c.json({ success: true, user });
  }
  
  return c.json({ error: 'Auth type not implemented' }, 501);
});

authRoutes.post('/finish', async (c) => {
  return c.json({ error: 'WebAuthn not yet implemented' }, 501);
});

authRoutes.post('/logout', async (c) => {
  await clearSession(c);
  return c.json({ success: true });
});