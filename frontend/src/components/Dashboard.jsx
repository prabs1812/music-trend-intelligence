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
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">WebSocket:</span>
            <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Time Range:</span>
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {['1h', '6h', '24h', '7d'].map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-3 py-1 rounded text-sm transition ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
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
