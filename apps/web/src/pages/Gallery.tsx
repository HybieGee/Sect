import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

function Gallery() {
  const { top10 } = useStore();
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
      <div className="nav">
        <button onClick={() => navigate('/')}>Hub</button>
        <button onClick={() => navigate('/create')}>Create</button>
      </div>
      
      <h1 style={{ color: '#ff0000', fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
        TOP 10 CULTS
      </h1>
      
      <div className="cult-grid">
        {top10.map((cult, index) => (
          <div 
            key={cult.id} 
            className="cult-card"
            onClick={() => navigate(`/cult/${cult.slug}`)}
          >
            <div className="rank">#{index + 1}</div>
            <h3>{cult.name}</h3>
            {cult.symbol && <div className="symbol">{cult.symbol}</div>}
            {cult.description && (
              <div className="description">{cult.description}</div>
            )}
            <div className="stats">
              <div className="stat">
                <div className="value">{cult.member_count || 0}</div>
                <div className="label">Members</div>
              </div>
              <div className="stat">
                <div className="value">{cult.daily_active_members || 0}</div>
                <div className="label">Active</div>
              </div>
              <div className="stat">
                <div className="value">{(cult.composite_score || 0).toFixed(2)}</div>
                <div className="label">Score</div>
              </div>
            </div>
          </div>
        ))}
        
        {top10.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: '4rem' }}>
            <p>No cults have been created yet.</p>
            <p>Be the first to form your circle!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Gallery;