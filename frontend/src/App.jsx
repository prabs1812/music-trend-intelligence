import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Artists from './pages/Artists';
import Genres from './pages/Genres';
import Analytics from './pages/Analytics';
import Anomalies from './pages/Anomalies';
import { api } from './services/api';

function App() {
  const [systemStats, setSystemStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStats = async () => {
    try {
      const response = await api.getSystemStats();
      setSystemStats(response.data);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('Error fetching system stats:', err);
      setError('Failed to connect to backend');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading Music Trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass-card max-w-md mx-4">
          <div className="text-pink text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-muted mb-6">{error}</p>
          <button
            onClick={fetchSystemStats}
            className="px-6 py-3 bg-gradient-to-r from-purple to-cyan hover:from-purple/80 hover:to-cyan/80 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area - Responsive padding for sidebar */}
        <div className="pl-20 lg:pl-60 transition-all duration-300">
          {/* Page Content */}
          <main className="px-6 py-8 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/genres" element={<Genres />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/anomalies" element={<Anomalies />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
