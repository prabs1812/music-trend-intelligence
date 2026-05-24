import React, { useState } from 'react';
import SentimentGraph from '../components/SentimentGraph';
import EngagementHeatmap from '../components/EngagementHeatmap';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Analytics Dashboard</h1>
            <p className="text-purple-200/70">Sentiment analysis and engagement metrics</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-purple-200/70 font-medium">Time Range:</span>
            <div className="flex space-x-2 bg-slate-800/50 rounded-xl p-1.5 border border-purple-500/20">
              {['1h', '6h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
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
      </div>

      {/* Sentiment Analysis */}
      <SentimentGraph timeRange={timeRange} refreshKey={0} />

      {/* Engagement Metrics */}
      <EngagementHeatmap timeRange={timeRange} refreshKey={0} />

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <span className="text-2xl">📈</span>
            <span>Growth Trends</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-purple-200/70">Overall Growth</span>
              <span className="text-green-400 font-bold text-lg">+12.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-200/70">New Artists</span>
              <span className="text-purple-300 font-bold text-lg">+8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-200/70">Trending Genres</span>
              <span className="text-purple-300 font-bold text-lg">15</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <span className="text-2xl">💭</span>
            <span>Sentiment Overview</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-purple-200/70">Positive</span>
              <span className="text-green-400 font-bold text-lg">65%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-200/70">Neutral</span>
              <span className="text-purple-300 font-bold text-lg">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-200/70">Negative</span>
              <span className="text-red-400 font-bold text-lg">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
