import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ParticleBackground from './components/ParticleBackground';
import AnimatedCounter from './components/AnimatedCounter';
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

  useEffect(() => {
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStats = async () => {
    try {
      const response = await api.getSystemStats();
      setSystemStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system stats:', err);
      setError('Failed to connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading Music Trend Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-purple-300 mb-4">{error}</p>
          <button
            onClick={fetchSystemStats}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen relative">
        {/* Particle Background */}
        <ParticleBackground density={40} speed={0.3} color="#a855f7" />

        {/* Navigation */}
        <Navigation />

        {/* Stats Bar */}
        {systemStats && (
          <div className="glass-card border-b border-purple-500/20 relative z-10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <AnimatedCounter
                    value={systemStats.total_artists || 0}
                    label="Artists"
                    icon="🎤"
                    gradient="from-purple-400 to-pink-400"
                  />
                  <AnimatedCounter
                    value={systemStats.total_trends || 0}
                    label="Trends"
                    icon="📈"
                    gradient="from-blue-400 to-cyan-400"
                  />
                  <AnimatedCounter
                    value={systemStats.total_anomalies || 0}
                    label="Anomalies"
                    icon="🚨"
                    gradient="from-red-400 to-orange-400"
                  />
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 backdrop-blur-sm">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-green-300 font-medium text-sm">Live</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/anomalies" element={<Anomalies />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="glass-card border-t border-purple-500/20 mt-16">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-purple-200/80 font-medium">
              Music Trend Intelligence System v1.0.0
            </p>
            <p className="text-purple-300/60 text-sm mt-2">
              Data from Last.fm, MusicBrainz, Reddit, YouTube
            </p>
            <p className="text-purple-300/50 text-xs mt-3">
              Built with FastAPI, React, Kafka, Redis, MongoDB
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
