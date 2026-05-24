import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const EngagementHeatmap = ({ timeRange, refreshKey }) => {
  const [engagementData, setEngagementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEngagementData();
  }, [timeRange, refreshKey]);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : timeRange === '7d' ? 168 : 24;
      const response = await api.getEngagementMetrics(hours);
      setEngagementData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching engagement data:', err);
      setError('Failed to load engagement data');
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'spotify':
        return '🎵';
      case 'reddit':
        return '🔴';
      case 'youtube':
        return '📺';
      default:
        return '📊';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toFixed(0) || 0;
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <span className="text-2xl">🔥</span>
          <span className="gradient-text">Engagement Metrics</span>
        </h3>
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <span className="text-2xl">🔥</span>
          <span className="gradient-text">Engagement Metrics</span>
        </h3>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={fetchEngagementData}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const bySource = engagementData?.by_source || {};
  const sources = Object.keys(bySource);

  return (
    <div className="glass-card rounded-2xl p-6 card-depth">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <motion.span
            className="text-2xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            🔥
          </motion.span>
          <span className="gradient-text">Engagement Metrics</span>
        </h3>
        <motion.button
          onClick={fetchEngagementData}
          className="text-purple-300 hover:text-white transition-all duration-300 text-xl"
          title="Refresh"
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🔄
        </motion.button>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No engagement data available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sources.map((source, index) => {
            const data = bySource[source];
            return (
              <motion.div
                key={source}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="gradient-border bg-gradient-to-br from-black/50 to-gray-900/50 rounded-xl p-5 cursor-pointer relative overflow-hidden group"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-gray-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="flex items-center space-x-3 mb-4 relative z-10">
                  <motion.span
                    className="text-3xl"
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {getSourceIcon(source)}
                  </motion.span>
                  <div>
                    <h4 className="text-white font-semibold capitalize">{source}</h4>
                    <p className="text-xs text-gray-400">
                      Last {engagementData.time_range_hours}h
                    </p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  {/* Views */}
                  <motion.div
                    className="flex items-center justify-between"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">👁️ Views</span>
                    </div>
                    <span className="text-white font-semibold">
                      {formatNumber(data.total_views)}
                    </span>
                  </motion.div>

                  {/* Likes */}
                  <motion.div
                    className="flex items-center justify-between"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">❤️ Likes</span>
                    </div>
                    <span className="text-white font-semibold">
                      {formatNumber(data.total_likes)}
                    </span>
                  </motion.div>

                  {/* Comments */}
                  <motion.div
                    className="flex items-center justify-between"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">💬 Comments</span>
                    </div>
                    <span className="text-white font-semibold">
                      {formatNumber(data.total_comments)}
                    </span>
                  </motion.div>

                  {/* Average Engagement */}
                  <div className="pt-3 border-t border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Avg Engagement</span>
                      <span className="text-gray-200 font-bold">
                        {formatNumber(data.avg_engagement)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Engagement Bar */}
                <div className="mt-4 relative z-10">
                  <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-gray-400 to-gray-600"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((data.avg_engagement / 10000) * 100, 100)}%`
                      }}
                      transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EngagementHeatmap;
