import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

interface Signal {
  id: string;
  title?: string;
  body: string;
  url?: string;
  author_handle?: string;
  created_at: number;
  vote_count: number;
  upvotes: number;
}

function CultPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, joinCult, leaveCult } = useStore();
  const [cult, setCult] = useState<any>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSignalForm, setShowSignalForm] = useState(false);
  const [signalForm, setSignalForm] = useState({ title: '', body: '', url: '' });
  
  const API_URL = import.meta.env.PROD ? 'https://the-sect-api.workers.dev' : '';
  
  useEffect(() => {
    fetchCultData();
  }, [slug]);
  
  const fetchCultData = async () => {
    try {
      const cultRes = await fetch(`${API_URL}/api/cults/${slug}`);
      if (!cultRes.ok) throw new Error('Cult not found');
      const cultData = await cultRes.json();
      setCult(cultData);
      
      const signalsRes = await fetch(`${API_URL}/api/cults/${cultData.id}/signals`);
      if (signalsRes.ok) {
        const signalsData = await signalsRes.json();
        setSignals(signalsData);
      }
      
      if (user) {
        checkMembership(cultData.id);
      }
    } catch (error) {
      console.error('Failed to fetch cult:', error);
      navigate('/gallery');
    } finally {
      setLoading(false);
    }
  };
  
  const checkMembership = async (cultId: string) => {
    setIsMember(false);
  };
  
  const handleJoin = async () => {
    if (!cult) return;
    try {
      await joinCult(cult.id);
      setIsMember(true);
      fetchCultData();
    } catch (error) {
      console.error('Failed to join cult:', error);
    }
  };
  
  const handleLeave = async () => {
    if (!cult) return;
    try {
      await leaveCult(cult.id);
      setIsMember(false);
      fetchCultData();
    } catch (error) {
      console.error('Failed to leave cult:', error);
    }
  };
  
  const handleSignalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cult) return;
    
    try {
      const res = await fetch(`${API_URL}/api/cults/${cult.id}/signals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(signalForm)
      });
      
      if (res.ok) {
        setShowSignalForm(false);
        setSignalForm({ title: '', body: '', url: '' });
        fetchCultData();
      }
    } catch (error) {
      console.error('Failed to post signal:', error);
    }
  };
  
  const handleVote = async (signalId: string, value: 1 | -1) => {
    try {
      const res = await fetch(`${API_URL}/api/signals/${signalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ value })
      });
      
      if (res.ok) {
        fetchCultData();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading cult...</div>;
  }
  
  if (!cult) {
    return <div className="loading">Cult not found</div>;
  }
  
  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
      <div className="nav">
        <button onClick={() => navigate('/')}>Hub</button>
        <button onClick={() => navigate('/gallery')}>Gallery</button>
      </div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid #333', paddingBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem' }}>
            {cult.name}
          </h1>
          {cult.symbol && (
            <div style={{ color: '#ff0000', fontSize: '1.5rem', marginBottom: '1rem' }}>
              {cult.symbol}
            </div>
          )}
          {cult.description && (
            <p style={{ color: '#999', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              {cult.description}
            </p>
          )}
          
          <div style={{ display: 'flex', gap: '3rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ color: '#ff0000', fontSize: '2rem', fontWeight: 'bold' }}>
                {cult.member_count || 0}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>MEMBERS</div>
            </div>
            <div>
              <div style={{ color: '#ff0000', fontSize: '2rem', fontWeight: 'bold' }}>
                {cult.daily_active_members || 0}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>ACTIVE TODAY</div>
            </div>
          </div>
          
          {user && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {!isMember ? (
                <button className="button" onClick={handleJoin}>JOIN CULT</button>
              ) : (
                <>
                  <button className="button secondary" onClick={handleLeave}>LEAVE CULT</button>
                  <button className="button" onClick={() => setShowSignalForm(true)}>POST SIGNAL</button>
                </>
              )}
            </div>
          )}
        </div>
        
        <div>
          <h2 style={{ color: '#ff0000', marginBottom: '1.5rem' }}>SIGNALS</h2>
          
          {showSignalForm && (
            <div className="overlay">
              <div className="modal">
                <button className="close" onClick={() => setShowSignalForm(false)}>×</button>
                <h2>POST SIGNAL</h2>
                <form onSubmit={handleSignalSubmit}>
                  <div className="form-group">
                    <label>Title (optional)</label>
                    <input
                      type="text"
                      value={signalForm.title}
                      onChange={(e) => setSignalForm({ ...signalForm, title: e.target.value })}
                      maxLength={100}
                    />
                  </div>
                  <div className="form-group">
                    <label>Message *</label>
                    <textarea
                      value={signalForm.body}
                      onChange={(e) => setSignalForm({ ...signalForm, body: e.target.value })}
                      required
                      rows={4}
                      maxLength={1000}
                    />
                  </div>
                  <div className="form-group">
                    <label>Link (optional)</label>
                    <input
                      type="url"
                      value={signalForm.url}
                      onChange={(e) => setSignalForm({ ...signalForm, url: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="button">POST</button>
                </form>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {signals.map((signal) => (
              <div 
                key={signal.id} 
                style={{
                  background: '#111',
                  border: '1px solid #333',
                  padding: '1.5rem',
                  position: 'relative'
                }}
              >
                {signal.title && (
                  <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{signal.title}</h3>
                )}
                <p style={{ color: '#ccc', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {signal.body}
                </p>
                {signal.url && (
                  <a 
                    href={signal.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#ff0000', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}
                  >
                    View Link →
                  </a>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>
                    by {signal.author_handle || 'Anonymous'} • {new Date(signal.created_at).toLocaleDateString()}
                  </div>
                  {isMember && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleVote(signal.id, 1)}
                        style={{
                          background: 'none',
                          border: '1px solid #333',
                          color: '#ff0000',
                          padding: '0.25rem 0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        ↑ {signal.upvotes || 0}
                      </button>
                      <button 
                        onClick={() => handleVote(signal.id, -1)}
                        style={{
                          background: 'none',
                          border: '1px solid #333',
                          color: '#666',
                          padding: '0.25rem 0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        ↓
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {signals.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '3rem' }}>
                No signals posted yet. Be the first!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CultPage;