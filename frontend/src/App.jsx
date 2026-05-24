import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
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
  const [timeRange, setTimeRange] = useState('24h');
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading Music Trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-[#b3b3b3] mb-4">{error}</p>
          <button
            onClick={fetchSystemStats}
            className="px-6 py-3 bg-spotify-green hover:bg-[#1ed760] text-black font-bold rounded-full transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="ml-60">
          {/* Top Bar */}
          <TopBar
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            isConnected={isConnected}
          />

          {/* Page Content */}
          <main className="px-8 py-6">
            <Routes>
              <Route path="/" element={<Home timeRange={timeRange} />} />
              <Route path="/artists" element={<Artists timeRange={timeRange} />} />
              <Route path="/genres" element={<Genres timeRange={timeRange} />} />
              <Route path="/analytics" element={<Analytics timeRange={timeRange} />} />
              <Route path="/anomalies" element={<Anomalies timeRange={timeRange} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
