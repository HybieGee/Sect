import { Hono } from 'hono';
import { Env } from './types';
import { authRoutes } from './routes/auth';
import { cultsRoutes } from './routes/cults';
import { signalsRoutes } from './routes/signals';
import { adminRoutes } from './routes/admin';
import { RoomDurableObject } from './durable-objects/room';
import { computeRanking, saveRankingSnapshot } from './utils/ranking';

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');
  console.log('CORS - Origin:', origin);
  
  if (origin && (
    origin.includes('localhost:5173') || 
    origin.includes('.pages.dev') || 
    origin === 'https://the-sect.pages.dev' ||
    origin === 'https://910c2a84.the-sect.pages.dev' ||
    origin === 'https://e347b1b4.the-sect.pages.dev' ||
    origin === 'https://7b27231b.sect-6sc.pages.dev' ||
    origin === 'https://e2ce4cca.sect-6sc.pages.dev'
  )) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  
  await next();
});

app.get('/api/health', (c) => {
  return c.json({ status: 'healthy', timestamp: Date.now() });
});

app.get('/api/top10', async (c) => {
  const cached = await c.env.TOP10_CACHE.get('top10:current', 'json');
  if (cached) {
    return c.json(cached);
  }
  
  const top10 = await computeRanking(c.env);
  await c.env.TOP10_CACHE.put('top10:current', JSON.stringify(top10), {
    expirationTtl: 120
  });
  
  return c.json(top10);
});

app.get('/api/rooms/:roomId/ws', async (c) => {
  const roomId = c.req.param('roomId');
  const id = c.env.ROOMS.idFromName(roomId);
  const room = c.env.ROOMS.get(id);
  
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected Upgrade: websocket', 426);
  }
  
  const url = new URL(c.req.url);
  url.protocol = 'ws:';
  return room.fetch(new Request(url, c.req.raw));
});

app.route('/api/auth', authRoutes);
app.route('/api/cults', cultsRoutes);
app.route('/api/signals', signalsRoutes);
app.route('/api/admin', adminRoutes);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
  
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const top10 = await computeRanking(env);
    
    await env.TOP10_CACHE.put('top10:current', JSON.stringify(top10), {
      expirationTtl: 300
    });
    
    const hour = new Date().getHours();
    if (hour === 0) {
      await saveRankingSnapshot(env, top10);
    }
  }
};

export { RoomDurableObject };