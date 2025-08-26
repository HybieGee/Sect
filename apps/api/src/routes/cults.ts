import { Hono } from 'hono';
import { Env, Cult } from '../types';
import { requireAuth, generateId } from '../utils/auth';
import { validateCultName, validateSlug, validateDescription, sanitizeInput } from '../utils/validation';

export const cultsRoutes = new Hono<{ Bindings: Env }>();

cultsRoutes.get('/', async (c) => {
  const cults = await c.env.DB.prepare(`
    SELECT c.*, COUNT(m.user_id) as member_count
    FROM cults c
    LEFT JOIN memberships m ON c.id = m.cult_id
    WHERE c.is_flagged = FALSE
    GROUP BY c.id
    ORDER BY member_count DESC
    LIMIT 50
  `).all();
  
  return c.json(cults.results || []);
});

cultsRoutes.post('/', async (c) => {
  const session = await requireAuth(c);
  const { name, slug, description, symbol } = await c.req.json();
  
  if (!validateCultName(name)) {
    return c.json({ error: 'Invalid cult name' }, 400);
  }
  
  if (!validateSlug(slug)) {
    return c.json({ error: 'Invalid slug. Use lowercase letters, numbers, and hyphens only' }, 400);
  }
  
  if (description && !validateDescription(description)) {
    return c.json({ error: 'Invalid description' }, 400);
  }
  
  const existing = await c.env.DB.prepare(
    'SELECT id FROM cults WHERE slug = ?'
  ).bind(slug).first();
  
  if (existing) {
    return c.json({ error: 'Slug already taken' }, 409);
  }
  
  const cult: Cult = {
    id: generateId(),
    created_at: Date.now(),
    slug: sanitizeInput(slug),
    name: sanitizeInput(name),
    symbol: symbol ? sanitizeInput(symbol) : undefined,
    description: description ? sanitizeInput(description) : undefined,
    founder_user_id: session.userId,
    is_flagged: false
  };
  
  await c.env.DB.prepare(
    `INSERT INTO cults (id, created_at, slug, name, symbol, description, founder_user_id, is_flagged)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    cult.id, cult.created_at, cult.slug, cult.name, 
    cult.symbol, cult.description, cult.founder_user_id, cult.is_flagged
  ).run();
  
  await c.env.DB.prepare(
    'INSERT INTO memberships (user_id, cult_id, created_at, role) VALUES (?, ?, ?, ?)'
  ).bind(session.userId, cult.id, Date.now(), 'founder').run();
  
  await c.env.CULT_COUNTERS.put(`cult:${cult.id}:members`, '1');
  await c.env.CULT_COUNTERS.put(`cult:${cult.id}:daily_active`, '1');
  
  return c.json(cult, 201);
});

cultsRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  
  const cult = await c.env.DB.prepare(`
    SELECT c.*, COUNT(m.user_id) as member_count
    FROM cults c
    LEFT JOIN memberships m ON c.id = m.cult_id
    WHERE c.slug = ?
    GROUP BY c.id
  `).bind(slug).first();
  
  if (!cult) {
    return c.json({ error: 'Cult not found' }, 404);
  }
  
  const memberCount = await c.env.CULT_COUNTERS.get(`cult:${cult.id}:members`);
  const dailyActive = await c.env.CULT_COUNTERS.get(`cult:${cult.id}:daily_active`);
  
  return c.json({
    ...cult,
    member_count: parseInt(memberCount || '0'),
    daily_active_members: parseInt(dailyActive || '0')
  });
});

cultsRoutes.post('/:id/join', async (c) => {
  const session = await requireAuth(c);
  const cultId = c.req.param('id');
  
  const cult = await c.env.DB.prepare(
    'SELECT id FROM cults WHERE id = ?'
  ).bind(cultId).first();
  
  if (!cult) {
    return c.json({ error: 'Cult not found' }, 404);
  }
  
  const existing = await c.env.DB.prepare(
    'SELECT user_id FROM memberships WHERE user_id = ? AND cult_id = ?'
  ).bind(session.userId, cultId).first();
  
  if (existing) {
    return c.json({ error: 'Already a member' }, 409);
  }
  
  await c.env.DB.prepare(
    'INSERT INTO memberships (user_id, cult_id, created_at, role) VALUES (?, ?, ?, ?)'
  ).bind(session.userId, cultId, Date.now(), 'member').run();
  
  const memberCount = await c.env.CULT_COUNTERS.get(`cult:${cultId}:members`);
  await c.env.CULT_COUNTERS.put(
    `cult:${cultId}:members`, 
    String(parseInt(memberCount || '0') + 1)
  );
  
  const roomId = c.env.ROOMS.idFromName(`cult:${cultId}`);
  const room = c.env.ROOMS.get(roomId);
  await room.fetch(new Request('http://internal/broadcast', {
    method: 'POST',
    body: JSON.stringify({
      type: 'member_joined',
      cultId,
      userId: session.userId,
      timestamp: Date.now()
    })
  }));
  
  return c.json({ success: true });
});

cultsRoutes.post('/:id/leave', async (c) => {
  const session = await requireAuth(c);
  const cultId = c.req.param('id');
  
  const membership = await c.env.DB.prepare(
    'SELECT role FROM memberships WHERE user_id = ? AND cult_id = ?'
  ).bind(session.userId, cultId).first();
  
  if (!membership) {
    return c.json({ error: 'Not a member' }, 404);
  }
  
  if (membership.role === 'founder') {
    return c.json({ error: 'Founders cannot leave their cult' }, 403);
  }
  
  await c.env.DB.prepare(
    'DELETE FROM memberships WHERE user_id = ? AND cult_id = ?'
  ).bind(session.userId, cultId).run();
  
  const memberCount = await c.env.CULT_COUNTERS.get(`cult:${cultId}:members`);
  await c.env.CULT_COUNTERS.put(
    `cult:${cultId}:members`, 
    String(Math.max(0, parseInt(memberCount || '0') - 1))
  );
  
  const roomId = c.env.ROOMS.idFromName(`cult:${cultId}`);
  const room = c.env.ROOMS.get(roomId);
  await room.fetch(new Request('http://internal/broadcast', {
    method: 'POST',
    body: JSON.stringify({
      type: 'member_left',
      cultId,
      userId: session.userId,
      timestamp: Date.now()
    })
  }));
  
  return c.json({ success: true });
});

cultsRoutes.get('/:id/signals', async (c) => {
  const cultId = c.req.param('id');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  
  const signals = await c.env.DB.prepare(`
    SELECT s.*, u.handle as author_handle,
           COUNT(sv.signal_id) as vote_count,
           SUM(CASE WHEN sv.value = 1 THEN 1 ELSE 0 END) as upvotes
    FROM signals s
    LEFT JOIN users u ON s.author_user_id = u.id
    LEFT JOIN signal_votes sv ON s.id = sv.signal_id
    WHERE s.cult_id = ?
    GROUP BY s.id
    ORDER BY s.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(cultId, limit, offset).all();
  
  return c.json(signals.results || []);
});

cultsRoutes.post('/:id/signals', async (c) => {
  const session = await requireAuth(c);
  const cultId = c.req.param('id');
  const { title, body, url } = await c.req.json();
  
  if (!body || body.length < 1 || body.length > 1000) {
    return c.json({ error: 'Invalid signal body' }, 400);
  }
  
  const membership = await c.env.DB.prepare(
    'SELECT user_id FROM memberships WHERE user_id = ? AND cult_id = ?'
  ).bind(session.userId, cultId).first();
  
  if (!membership) {
    return c.json({ error: 'Must be a member to post signals' }, 403);
  }
  
  const signalId = generateId();
  await c.env.DB.prepare(
    `INSERT INTO signals (id, cult_id, author_user_id, created_at, title, body, url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    signalId, cultId, session.userId, Date.now(),
    title ? sanitizeInput(title) : null,
    sanitizeInput(body),
    url ? sanitizeInput(url) : null
  ).run();
  
  const roomId = c.env.ROOMS.idFromName(`cult:${cultId}`);
  const room = c.env.ROOMS.get(roomId);
  await room.fetch(new Request('http://internal/broadcast', {
    method: 'POST',
    body: JSON.stringify({
      type: 'new_signal',
      cultId,
      signalId,
      userId: session.userId,
      timestamp: Date.now()
    })
  }));
  
  return c.json({ id: signalId }, 201);
});