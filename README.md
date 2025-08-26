# The Sect

> Form your circle. Grow your following. Every coin is a cult.

A living site where anyone can create a "Cult" (a following for coin hunting), recruit members, post signals/updates, and climb a live ranking.

## Tech Stack

- **Frontend**: React + Vite + react-three-fiber + Zustand
- **Backend**: Cloudflare Workers + Hono
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Workers KV
- **Realtime**: Durable Objects (WebSocket)
- **Assets**: Cloudflare R2
- **Hosting**: Cloudflare Pages

## Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/the-sect.git
cd the-sect
```

2. Install dependencies:
```bash
npm install
```

3. Set up Cloudflare resources:
```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create the-sect-db

# Create KV namespaces
wrangler kv:namespace create TOP10_CACHE
wrangler kv:namespace create CULT_COUNTERS
wrangler kv:namespace create RATE_LIMITS

# Create R2 bucket
wrangler r2 bucket create the-sect-assets
```

4. Update `apps/api/wrangler.toml` with your resource IDs from the commands above.

5. Run database migrations:
```bash
cd apps/api
npm run migrate
```

6. (Optional) Seed the database with sample data:
```bash
wrangler d1 execute the-sect-db --file=seed.sql
```

7. Start development servers:
```bash
# From root directory
npm run dev
```

This starts:
- API server at http://localhost:8787
- Web app at http://localhost:5173

## Deployment

### Deploy API

```bash
cd apps/api
npm run deploy
```

### Deploy Frontend

```bash
cd apps/web
npm run deploy
```

## Project Structure

```
the-sect/
├── apps/
│   ├── api/                 # Cloudflare Workers API
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── utils/       # Helper functions
│   │   │   ├── durable-objects/  # WebSocket rooms
│   │   │   └── index.ts     # Main entry
│   │   ├── migrations/      # D1 SQL migrations
│   │   └── wrangler.toml    # Worker config
│   │
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── scenes/      # 3D scenes
│       │   ├── pages/       # Route pages
│       │   ├── store.ts     # Zustand store
│       │   └── App.tsx      # Main app
│       └── index.html
│
├── package.json             # Monorepo root
└── README.md
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/top10` - Get top 10 cults
- `POST /api/auth/start` - Start authentication
- `POST /api/auth/logout` - Logout
- `GET /api/cults` - List all cults
- `POST /api/cults` - Create new cult
- `GET /api/cults/:slug` - Get cult details
- `POST /api/cults/:id/join` - Join cult
- `POST /api/cults/:id/leave` - Leave cult
- `GET /api/cults/:id/signals` - Get cult signals
- `POST /api/cults/:id/signals` - Post new signal
- `POST /api/signals/:id/vote` - Vote on signal
- `GET /api/rooms/:roomId/ws` - WebSocket connection

## Environment Variables

### API (.env)
```
ENVIRONMENT=development
JWT_SECRET=your-secret-key
```

### Web (.env)
```
VITE_API_URL=https://your-api.workers.dev
```

## Features

- **3D Hub**: Interactive 3D scene with portals for navigation
- **Cult Creation**: Form your own cult with custom name, symbol, and description
- **Live Rankings**: Top 10 cults updated every 2 minutes based on:
  - Member count (35%)
  - Daily active members (20%)
  - Signal quality (20%)
  - Engagement velocity (15%)
  - Weekly consistency (10%)
- **Signals**: Post updates, alpha, and calls to action
- **Voting**: Community-driven signal quality scoring
- **Real-time Updates**: WebSocket connections for live data
- **Moderation**: Admin tools to flag inappropriate content

## Adding 3D Assets

Place your 3D models in `apps/web/public/assets/`:
- `sect-hub.glb` - Main hub scene from Blender
- `crosses.mp4` - Video texture for wall panels

The app will use placeholders if these files are missing.

## Security

- Session-based authentication with httpOnly cookies
- Content validation and sanitization
- Rate limiting on API endpoints
- Profanity filter for cult names/descriptions
- Admin moderation capabilities

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact the development team.