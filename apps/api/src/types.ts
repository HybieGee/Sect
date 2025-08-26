export interface Env {
  DB: D1Database;
  TOP10_CACHE: KVNamespace;
  CULT_COUNTERS: KVNamespace;
  RATE_LIMITS: KVNamespace;
  ASSETS_BUCKET: R2Bucket;
  ROOMS: DurableObjectNamespace;
  JWT_SECRET?: string;
  ENVIRONMENT?: string;
}

export interface User {
  id: string;
  created_at: number;
  handle?: string;
  passkey_id?: string;
  wallet_addr?: string;
  role: 'user' | 'admin';
}

export interface Cult {
  id: string;
  created_at: number;
  slug: string;
  name: string;
  symbol?: string;
  avatar_url?: string;
  banner_url?: string;
  description?: string;
  founder_user_id: string;
  is_flagged?: boolean;
}

export interface CultWithMetrics extends Cult {
  member_count: number;
  daily_active_members: number;
  signal_quality_score: number;
  engagement_velocity: number;
  consistency_7d: number;
  composite_score: number;
  rank?: number;
}

export interface Signal {
  id: string;
  cult_id: string;
  author_user_id: string;
  created_at: number;
  title?: string;
  body: string;
  url?: string;
}

export interface SignalVote {
  signal_id: string;
  user_id: string;
  created_at: number;
  value: 1 | -1;
}

export interface Membership {
  user_id: string;
  cult_id: string;
  created_at: number;
  role: 'member' | 'officer' | 'founder';
}

export interface RankingSnapshot {
  id: string;
  created_at: number;
  top10_json: string;
}

export interface AuthSession {
  userId: string;
  createdAt: number;
  expiresAt: number;
}