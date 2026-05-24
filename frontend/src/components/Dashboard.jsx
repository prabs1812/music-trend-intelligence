import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSection from './HeroSection';
import TrendingArtists from './TrendingArtists';
import LiveAnalytics from './LiveAnalytics';
import GenreHeatmap from './GenreHeatmap';
import AIPredictions from './AIPredictions';
import ViralSongsTable from './ViralSongsTable';
import { dashboardWebSocket } from '../services/websocket';
import { useWebSocket } from '../hooks/useWebSocket';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshKey, setRefreshKey] = useState(0);
  const { isConnected, subscribe } = useWebSocket(dashboardWebSocket);

  useEffect(() => {
    // Subscribe to real-time updates
    const handleTrendUpdate = (data) => {
      console.log('Trend update received:', data);
      setRefreshKey((prev) => prev + 1);
    };

    const handleAnomalyAlert = (data) => {
      console.log('Anomaly alert received:', data);
      setRefreshKey((prev) => prev + 1);
    };

    subscribe('trend_update', handleTrendUpdate);
    subscribe('anomaly_alert', handleAnomalyAlert);
  }, [subscribe]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5">
              <span className="text-sm text-muted font-medium">Status:</span>
              <div className={`flex items-center gap-2 ${isConnected ? 'text-cyan' : 'text-pink'}`}>
                <motion.div
                  className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan' : 'bg-pink'}`}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-semibold">{isConnected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted font-medium">Time Range:</span>
            <div className="flex gap-2 bg-white/5 rounded-xl p-1">
              {['1h', '6h', '24h', '7d'].map((range) => (
                <motion.button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-purple to-cyan text-white shadow-lg'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="space-y-8">
        {/* Trending Artists - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TrendingArtists timeRange={timeRange} refreshKey={refreshKey} />
        </motion.div>

        {/* Live Analytics + Genre Heatmap - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <LiveAnalytics />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GenreHeatmap />
          </motion.div>
        </div>

        {/* AI Predictions - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <AIPredictions />
        </motion.div>

        {/* Viral Songs Table - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <ViralSongsTable />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
