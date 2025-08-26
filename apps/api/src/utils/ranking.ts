import { Env, CultWithMetrics } from '../types';

const WEIGHTS = {
  memberCount: 0.35,
  dailyActiveMembers: 0.20,
  signalQuality: 0.20,
  engagementVelocity: 0.15,
  consistency7d: 0.10
};

export async function computeRanking(env: Env): Promise<CultWithMetrics[]> {
  const cults = await env.DB.prepare(`
    SELECT 
      c.*,
      COUNT(DISTINCT m.user_id) as member_count
    FROM cults c
    LEFT JOIN memberships m ON c.id = m.cult_id
    WHERE c.is_flagged = FALSE
    GROUP BY c.id
  `).all();
  
  const cultMetrics: CultWithMetrics[] = [];
  
  for (const cult of cults.results || []) {
    const cultId = cult.id as string;
    
    const memberCount = cult.member_count as number || 0;
    
    const dailyActive = await env.CULT_COUNTERS.get(`cult:${cultId}:daily_active`);
    const dailyActiveMembers = parseInt(dailyActive || '0');
    
    const signalVotes = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_votes,
        SUM(CASE WHEN sv.value = 1 THEN 1 ELSE 0 END) as positive_votes
      FROM signals s
      LEFT JOIN signal_votes sv ON s.id = sv.signal_id
      WHERE s.cult_id = ?
      AND sv.created_at > ?
    `).bind(cultId, Date.now() - 72 * 60 * 60 * 1000).first();
    
    const totalVotes = (signalVotes?.total_votes as number) || 0;
    const positiveVotes = (signalVotes?.positive_votes as number) || 0;
    const signalQualityScore = totalVotes > 0 ? positiveVotes / totalVotes : 0.5;
    
    const recentActivity = await env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT s.id) as signal_count,
        COUNT(DISTINCT m.user_id) as new_members
      FROM signals s
      FULL OUTER JOIN memberships m ON s.cult_id = m.cult_id
      WHERE (s.cult_id = ? OR m.cult_id = ?)
      AND (s.created_at > ? OR m.created_at > ?)
    `).bind(
      cultId, cultId,
      Date.now() - 24 * 60 * 60 * 1000,
      Date.now() - 24 * 60 * 60 * 1000
    ).first();
    
    const engagementVelocity = ((recentActivity?.signal_count as number) || 0) * 0.5 + 
                               ((recentActivity?.new_members as number) || 0) * 0.5;
    
    const weekActivity = await env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT DATE(s.created_at / 1000, 'unixepoch')) as active_days
      FROM signals s
      WHERE s.cult_id = ?
      AND s.created_at > ?
    `).bind(cultId, Date.now() - 7 * 24 * 60 * 60 * 1000).first();
    
    const consistency7d = ((weekActivity?.active_days as number) || 0) / 7;
    
    cultMetrics.push({
      ...cult as any,
      member_count: memberCount,
      daily_active_members: dailyActiveMembers,
      signal_quality_score: signalQualityScore,
      engagement_velocity: engagementVelocity,
      consistency_7d: consistency7d,
      composite_score: 0
    });
  }
  
  const maxValues = {
    memberCount: Math.max(...cultMetrics.map(c => c.member_count), 1),
    dailyActiveMembers: Math.max(...cultMetrics.map(c => c.daily_active_members), 1),
    signalQuality: 1,
    engagementVelocity: Math.max(...cultMetrics.map(c => c.engagement_velocity), 1),
    consistency7d: 1
  };
  
  for (const cult of cultMetrics) {
    const normalizedMemberCount = cult.member_count / maxValues.memberCount;
    const normalizedDailyActive = cult.daily_active_members / maxValues.dailyActiveMembers;
    const normalizedSignalQuality = cult.signal_quality_score;
    const normalizedEngagement = cult.engagement_velocity / maxValues.engagementVelocity;
    const normalizedConsistency = cult.consistency_7d;
    
    cult.composite_score = 
      WEIGHTS.memberCount * normalizedMemberCount +
      WEIGHTS.dailyActiveMembers * normalizedDailyActive +
      WEIGHTS.signalQuality * normalizedSignalQuality +
      WEIGHTS.engagementVelocity * normalizedEngagement +
      WEIGHTS.consistency7d * normalizedConsistency;
  }
  
  cultMetrics.sort((a, b) => b.composite_score - a.composite_score);
  
  cultMetrics.forEach((cult, index) => {
    cult.rank = index + 1;
  });
  
  return cultMetrics.slice(0, 10);
}

export async function saveRankingSnapshot(env: Env, top10: CultWithMetrics[]): Promise<void> {
  const id = crypto.randomUUID();
  const created_at = Date.now();
  const top10_json = JSON.stringify(top10);
  
  await env.DB.prepare(
    'INSERT INTO ranking_snapshots (id, created_at, top10_json) VALUES (?, ?, ?)'
  ).bind(id, created_at, top10_json).run();
}