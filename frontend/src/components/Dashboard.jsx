import React, { useState, useEffect } from 'react';
import TrendingArtists from './TrendingArtists';
import GenreChart from './GenreChart';
import SentimentGraph from './SentimentGraph';
import AnomalyAlerts from './AnomalyAlerts';
import EngagementHeatmap from './EngagementHeatmap';
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
      <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-bold gradient-text">Dashboard</h2>
          <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-slate-700/30 border border-slate-600/30">
            <span className="text-sm text-purple-200/70 font-medium">WebSocket:</span>
            <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 shadow-lg shadow-green-500/50' : 'bg-red-400 shadow-lg shadow-red-500/50'} animate-pulse`}></div>
              <span className="text-sm font-semibold">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-purple-200/70 font-medium">Time Range:</span>
          <div className="flex space-x-2 bg-slate-800/50 rounded-xl p-1.5 border border-purple-500/20">
            {['1h', '6h', '24h', '7d'].map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                    : 'text-purple-200/70 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly Alerts - Full Width */}
      <div className="animate-slide-in">
        <AnomalyAlerts refreshKey={refreshKey} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Artists - Takes 1 column */}
        <div className="lg:col-span-1 animate-slide-in">
          <TrendingArtists timeRange={timeRange} refreshKey={refreshKey} />
        </div>

        {/* Charts - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="animate-slide-in">
            <GenreChart timeRange={timeRange} refreshKey={refreshKey} />
          </div>
          <div className="animate-slide-in">
            <SentimentGraph timeRange={timeRange} refreshKey={refreshKey} />
          </div>
        </div>
      </div>

      {/* Engagement Heatmap - Full Width */}
      <div className="animate-slide-in">
        <EngagementHeatmap timeRange={timeRange} refreshKey={refreshKey} />
      </div>
    </div>
  );
};

export default Dashboard;
