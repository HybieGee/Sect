import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store';
import Hub from './scenes/Hub';
import Gallery from './pages/Gallery';
import CultPage from './pages/CultPage';
import Whitepaper from './pages/Whitepaper';
import CreateCult from './pages/CreateCult';

function App() {
  const { fetchTop10, login, isAuthenticated } = useStore();
  
  useEffect(() => {
    fetchTop10();
    const interval = setInterval(fetchTop10, 120000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!isAuthenticated) {
      login();
    }
  }, [isAuthenticated]);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/cult/:slug" element={<CultPage />} />
        <Route path="/whitepaper" element={<Whitepaper />} />
        <Route path="/create" element={<CreateCult />} />
      </Routes>
    </Router>
  );
}

export default App;