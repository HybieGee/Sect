import { useNavigate } from 'react-router-dom';

function Whitepaper() {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', maxWidth: '800px', margin: '0 auto' }}>
      <div className="nav">
        <button onClick={() => navigate('/')}>Hub</button>
        <button onClick={() => navigate('/gallery')}>Gallery</button>
      </div>
      
      <h1 style={{ color: '#ff0000', fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
        THE SECT
      </h1>
      
      <div style={{ color: '#ccc', lineHeight: 1.8, fontSize: '1.1rem' }}>
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#ff0000', marginBottom: '1rem' }}>MANIFESTO</h2>
          <p style={{ marginBottom: '1rem' }}>
            Every coin needs a cult. Every movement needs believers. The Sect is where communities form, 
            grow, and compete for dominance in the attention economy.
          </p>
          <p>
            Form your circle. Grow your following. Rise through the ranks.
          </p>
        </section>
        
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#ff0000', marginBottom: '1rem' }}>HOW IT WORKS</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#fff' }}>→ CREATE:</strong> Form your cult around any token, 
              idea, or movement. Set your mission and symbol.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#fff' }}>→ RECRUIT:</strong> Grow your membership. 
              Every member strengthens the collective.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#fff' }}>→ SIGNAL:</strong> Post alpha, insights, and calls to action. 
              Quality signals earn votes and boost your cult's ranking.
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#fff' }}>→ RISE:</strong> The top 10 cults are displayed in the Gallery. 
              Rankings update every 2 minutes based on activity and engagement.
            </li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#ff0000', marginBottom: '1rem' }}>RANKING ALGORITHM</h2>
          <p style={{ marginBottom: '1rem' }}>
            Cult rankings are calculated using a composite score:
          </p>
          <ul style={{ listStyle: 'none', padding: '0 1rem' }}>
            <li>• 35% Member Count</li>
            <li>• 20% Daily Active Members</li>
            <li>• 20% Signal Quality (voting)</li>
            <li>• 15% Engagement Velocity</li>
            <li>• 10% Weekly Consistency</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#ff0000', marginBottom: '1rem' }}>$SECT TOKEN</h2>
          <p style={{ marginBottom: '1rem' }}>
            The SECT token will govern the protocol and reward the most successful cults.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#fff' }}>Supply:</strong> 1,000,000,000 $SECT
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#fff' }}>Distribution:</strong>
          </p>
          <ul style={{ listStyle: 'none', padding: '0 1rem' }}>
            <li>• 40% Community rewards</li>
            <li>• 20% Cult treasuries</li>
            <li>• 20% Protocol development</li>
            <li>• 10% Initial liquidity</li>
            <li>• 10% Team (vested)</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#ff0000', marginBottom: '1rem' }}>RULES</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              1. No hate speech or violence
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              2. No impersonation or fraud
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              3. Respect the competitive spirit
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              4. Quality over quantity in signals
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              5. Build genuine communities
            </li>
          </ul>
        </section>
        
        <section style={{ textAlign: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #333' }}>
          <p style={{ color: '#ff0000', fontSize: '1.5rem', marginBottom: '1rem' }}>
            THE REVOLUTION WILL BE TOKENIZED
          </p>
          <p style={{ color: '#666' }}>
            $SECT • 2024
          </p>
        </section>
      </div>
    </div>
  );
}

export default Whitepaper;