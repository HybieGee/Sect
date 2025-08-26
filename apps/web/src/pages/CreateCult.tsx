import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

function CreateCult() {
  const navigate = useNavigate();
  const { createCult, isAuthenticated } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    symbol: '',
    description: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const cult = await createCult(formData);
      navigate(`/cult/${cult.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSlugChange = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, slug });
  };
  
  if (!isAuthenticated) {
    return (
      <div className="loading">
        Authenticating...
      </div>
    );
  }
  
  return (
    <div className="overlay">
      <div className="modal">
        <button className="close" onClick={() => navigate('/')}>×</button>
        
        <h2>CREATE YOUR CULT</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cult Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="The Order of..."
              required
              minLength={3}
              maxLength={50}
            />
            <div className="help">Choose a memorable name for your cult</div>
          </div>
          
          <div className="form-group">
            <label>URL Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="my-cult"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-z0-9-]+"
            />
            <div className="help">Lowercase letters, numbers, and hyphens only</div>
          </div>
          
          <div className="form-group">
            <label>Symbol</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="$CULT"
              maxLength={10}
            />
            <div className="help">Optional ticker symbol</div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Our mission is to..."
              rows={4}
              maxLength={500}
            />
            <div className="help">Brief description of your cult's purpose</div>
          </div>
          
          {error && (
            <div className="form-group">
              <div className="error">{error}</div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'CREATING...' : 'CREATE CULT'}
            </button>
            <button 
              type="button" 
              className="button secondary" 
              onClick={() => navigate('/')}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCult;