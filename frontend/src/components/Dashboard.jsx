import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TrendingArtists from './TrendingArtists';
import GenreChart from './GenreChart';
import SentimentGraph from './SentimentGraph';
import AnomalyAlerts from './AnomalyAlerts';
import EngagementHeatmap from './EngagementHeatmap';
import EnhancedCard from './EnhancedCard';
import { api } from '../services/api';
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
    <div className="space-y-8">
      {/* Controls */}
      <EnhancedCard hover={false} glow={false}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-6">
            <motion.h2
              className="text-2xl font-bold gradient-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Dashboard
            </motion.h2>
            <motion.div
              className="flex items-center space-x-3 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-600/50 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-sm text-gray-300 font-medium">WebSocket:</span>
              <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                <motion.div
                  className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 shadow-lg shadow-green-500/50' : 'bg-red-400 shadow-lg shadow-red-500/50'}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-sm font-semibold">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </motion.div>
          </div>

          {/* Time Range Selector */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-sm text-gray-300 font-medium">Time Range:</span>
            <div className="flex space-x-2 bg-gray-800/70 rounded-xl p-1.5 border border-white/20 backdrop-blur-sm">
              {['1h', '6h', '24h', '7d'].map((range, index) => (
                <motion.button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg shadow-black/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  {range}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </EnhancedCard>

      {/* Anomaly Alerts - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <AnomalyAlerts refreshKey={refreshKey} />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Artists - Takes 1 column */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <TrendingArtists timeRange={timeRange} refreshKey={refreshKey} />
        </motion.div>

        {/* Charts - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <GenreChart timeRange={timeRange} refreshKey={refreshKey} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <SentimentGraph timeRange={timeRange} refreshKey={refreshKey} />
          </motion.div>
        </div>
      </div>

      {/* Engagement Heatmap - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <EngagementHeatmap timeRange={timeRange} refreshKey={refreshKey} />
      </motion.div>
    </div>
  );
};

export default Dashboard;
