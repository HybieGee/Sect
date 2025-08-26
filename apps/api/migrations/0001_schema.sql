-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  handle TEXT UNIQUE,
  passkey_id TEXT UNIQUE,
  wallet_addr TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Cults table
CREATE TABLE IF NOT EXISTS cults (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  description TEXT,
  founder_user_id TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (founder_user_id) REFERENCES users(id)
);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
  user_id TEXT NOT NULL,
  cult_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'officer', 'founder')),
  PRIMARY KEY (user_id, cult_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (cult_id) REFERENCES cults(id)
);

-- Signals (posts) table
CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  cult_id TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  title TEXT,
  body TEXT,
  url TEXT,
  FOREIGN KEY (cult_id) REFERENCES cults(id),
  FOREIGN KEY (author_user_id) REFERENCES users(id)
);

-- Votes on signals
CREATE TABLE IF NOT EXISTS signal_votes (
  signal_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  PRIMARY KEY (signal_id, user_id),
  FOREIGN KEY (signal_id) REFERENCES signals(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Daily ranking snapshots
CREATE TABLE IF NOT EXISTS ranking_snapshots (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  top10_json TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cults_slug ON cults(slug);
CREATE INDEX IF NOT EXISTS idx_memberships_cult ON memberships(cult_id);
CREATE INDEX IF NOT EXISTS idx_signals_cult ON signals(cult_id);
CREATE INDEX IF NOT EXISTS idx_signal_votes_signal ON signal_votes(signal_id);
CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_created ON ranking_snapshots(created_at);