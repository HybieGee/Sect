-- Seed data for testing
-- Run this after migrations: wrangler d1 execute the-sect-db --file=seed.sql

-- Create test users
INSERT INTO users (id, created_at, handle, role) VALUES
  ('user-1', 1704067200000, 'founder1', 'user'),
  ('user-2', 1704067200000, 'founder2', 'user'),
  ('user-3', 1704067200000, 'founder3', 'user'),
  ('user-4', 1704067200000, 'founder4', 'user'),
  ('user-5', 1704067200000, 'founder5', 'user'),
  ('admin-1', 1704067200000, 'admin', 'admin');

-- Create sample cults
INSERT INTO cults (id, created_at, slug, name, symbol, description, founder_user_id, is_flagged) VALUES
  ('cult-1', 1704067200000, 'bitcoin-maxis', 'Bitcoin Maximalists', '$BTC', 'Only Bitcoin matters. Everything else is a shitcoin.', 'user-1', FALSE),
  ('cult-2', 1704067200000, 'eth-killers', 'Ethereum Killers', '$ETH', 'Hunting for the next blockchain to dethrone Ethereum.', 'user-2', FALSE),
  ('cult-3', 1704067200000, 'meme-lords', 'Meme Coin Lords', '$MEME', 'In memes we trust. Diamond hands only.', 'user-3', FALSE),
  ('cult-4', 1704067200000, 'defi-degens', 'DeFi Degens', '$DEFI', 'Yield farming, liquidity mining, and degen plays.', 'user-4', FALSE),
  ('cult-5', 1704067200000, 'nft-collectors', 'NFT Collectors', '$NFT', 'Collecting the finest JPEGs on the blockchain.', 'user-5', FALSE);

-- Add founding memberships
INSERT INTO memberships (user_id, cult_id, created_at, role) VALUES
  ('user-1', 'cult-1', 1704067200000, 'founder'),
  ('user-2', 'cult-2', 1704067200000, 'founder'),
  ('user-3', 'cult-3', 1704067200000, 'founder'),
  ('user-4', 'cult-4', 1704067200000, 'founder'),
  ('user-5', 'cult-5', 1704067200000, 'founder');

-- Add some additional members
INSERT INTO memberships (user_id, cult_id, created_at, role) VALUES
  ('user-2', 'cult-1', 1704153600000, 'member'),
  ('user-3', 'cult-1', 1704240000000, 'member'),
  ('user-1', 'cult-2', 1704153600000, 'member'),
  ('user-4', 'cult-2', 1704240000000, 'member'),
  ('user-5', 'cult-3', 1704153600000, 'member'),
  ('user-1', 'cult-3', 1704240000000, 'member');

-- Add sample signals
INSERT INTO signals (id, cult_id, author_user_id, created_at, title, body, url) VALUES
  ('signal-1', 'cult-1', 'user-1', 1704326400000, 'Bitcoin to 100k', 'The halving is coming. Stack sats now.', 'https://bitcoin.org'),
  ('signal-2', 'cult-1', 'user-2', 1704412800000, NULL, 'Michael Saylor bought more. Follow the smart money.', NULL),
  ('signal-3', 'cult-2', 'user-2', 1704326400000, 'Solana is the future', 'Fastest chain, lowest fees. ETH is dead.', NULL),
  ('signal-4', 'cult-3', 'user-3', 1704326400000, 'New dog coin launching', 'Get in early on $WOOF. 1000x potential!', NULL),
  ('signal-5', 'cult-4', 'user-4', 1704326400000, 'New yield farm alert', '500% APY on the new protocol. DYOR but this is printing.', NULL);

-- Add some votes
INSERT INTO signal_votes (signal_id, user_id, created_at, value) VALUES
  ('signal-1', 'user-2', 1704412800000, 1),
  ('signal-1', 'user-3', 1704412800000, 1),
  ('signal-2', 'user-1', 1704499200000, 1),
  ('signal-3', 'user-1', 1704412800000, -1),
  ('signal-3', 'user-4', 1704412800000, 1),
  ('signal-4', 'user-5', 1704412800000, 1),
  ('signal-4', 'user-1', 1704412800000, 1);