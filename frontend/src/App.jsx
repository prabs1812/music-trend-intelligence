import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Music Trend Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchSystemStats}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎵</div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Music Trend Intelligence
                </h1>
                <p className="text-sm text-gray-400">
                  Real-time analytics powered by AI
                </p>
              </div>
            </div>

            {systemStats && (
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-gray-400">Artists</div>
                  <div className="text-white font-semibold">
                    {systemStats.total_artists?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Trends</div>
                  <div className="text-white font-semibold">
                    {systemStats.total_trends?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Anomalies</div>
                  <div className="text-white font-semibold">
                    {systemStats.total_anomalies?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Live</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Dashboard />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>
            Music Trend Intelligence System v1.0.0 | Data from Spotify, Reddit, YouTube
          </p>
          <p className="mt-2">
            Built with FastAPI, React, Kafka, Redis, MongoDB
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
