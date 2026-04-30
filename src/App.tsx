import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateEvent } from './pages/CreateEvent';
import { EventDetail } from './pages/EventDetail';
import { Rainbow } from 'lucide-react';
import './index.css';

function App() {
  return (
    <Router>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Rainbow size={40} className="rainbow-text" stroke="url(#rainbow-gradient)" />
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>
            <span className="rainbow-text">Rainbows</span> Booking <span style={{ fontSize: '1rem', display: 'block', fontWeight: 400, color: 'var(--text-secondary)' }}>by オギ監さん</span>
          </h1>
        </Link>
        <svg width="0" height="0">
          <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#ff5252' }} />
            <stop offset="25%" style={{ stopColor: '#ffeb3b' }} />
            <stop offset="50%" style={{ stopColor: '#69f0ae' }} />
            <stop offset="75%" style={{ stopColor: '#448aff' }} />
            <stop offset="100%" style={{ stopColor: '#7c4dff' }} />
          </linearGradient>
        </svg>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/e/:id" element={<EventDetail />} />
        </Routes>
      </main>

      <footer style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>&copy; 2026 Rainbows Booking - Open Source Scheduling Tool</p>
      </footer>
    </Router>
  );
}

export default App;
