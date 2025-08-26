import { Hono } from 'hono';
import { Env } from '../types';
import { requireAuth } from '../utils/auth';

export const signalsRoutes = new Hono<{ Bindings: Env }>();

signalsRoutes.post('/:id/vote', async (c) => {
  const session = await requireAuth(c);
  const signalId = c.req.param('id');
  const { value } = await c.req.json();
  
  if (value !== 1 && value !== -1) {
    return c.json({ error: 'Invalid vote value' }, 400);
  }
  
  const signal = await c.env.DB.prepare(
    'SELECT cult_id FROM signals WHERE id = ?'
  ).bind(signalId).first();
  
  if (!signal) {
    return c.json({ error: 'Signal not found' }, 404);
  }
  
  const membership = await c.env.DB.prepare(
    'SELECT user_id FROM memberships WHERE user_id = ? AND cult_id = ?'
  ).bind(session.userId, signal.cult_id).first();
  
  if (!membership) {
    return c.json({ error: 'Must be a member to vote' }, 403);
  }
  
  await c.env.DB.prepare(
    `INSERT OR REPLACE INTO signal_votes (signal_id, user_id, created_at, value)
     VALUES (?, ?, ?, ?)`
  ).bind(signalId, session.userId, Date.now(), value).run();
  
  const roomId = c.env.ROOMS.idFromName(`cult:${signal.cult_id}`);
  const room = c.env.ROOMS.get(roomId);
  await room.fetch(new Request('http://internal/broadcast', {
    method: 'POST',
    body: JSON.stringify({
      type: 'signal_vote',
      cultId: signal.cult_id,
      signalId,
      userId: session.userId,
      value,
      timestamp: Date.now()
    })
  }));
  
  return c.json({ success: true });
});