import { Hono } from 'hono';
import { Env } from '../types';
import { requireAuth, getSession } from '../utils/auth';
import { computeRanking, saveRankingSnapshot } from '../utils/ranking';

export const adminRoutes = new Hono<{ Bindings: Env }>();

adminRoutes.use('*', async (c, next) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const user = await c.env.DB.prepare(
    'SELECT role FROM users WHERE id = ?'
  ).bind(session.userId).first();
  
  if (user?.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  
  await next();
});

adminRoutes.post('/recompute', async (c) => {
  const top10 = await computeRanking(c.env);
  
  await c.env.TOP10_CACHE.put('top10:current', JSON.stringify(top10), {
    expirationTtl: 300
  });
  
  return c.json({ success: true, top10 });
});

adminRoutes.post('/moderate', async (c) => {
  const { cultId, action } = await c.req.json();
  
  if (action === 'flag') {
    await c.env.DB.prepare(
      'UPDATE cults SET is_flagged = TRUE WHERE id = ?'
    ).bind(cultId).run();
    
    const top10 = await computeRanking(c.env);
    await c.env.TOP10_CACHE.put('top10:current', JSON.stringify(top10), {
      expirationTtl: 300
    });
    
    return c.json({ success: true });
  }
  
  if (action === 'unflag') {
    await c.env.DB.prepare(
      'UPDATE cults SET is_flagged = FALSE WHERE id = ?'
    ).bind(cultId).run();
    
    const top10 = await computeRanking(c.env);
    await c.env.TOP10_CACHE.put('top10:current', JSON.stringify(top10), {
      expirationTtl: 300
    });
    
    return c.json({ success: true });
  }
  
  return c.json({ error: 'Invalid action' }, 400);
});