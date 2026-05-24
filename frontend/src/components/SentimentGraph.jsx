import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../services/api';
import AnimatedCounter from './AnimatedCounter';

const SentimentGraph = ({ timeRange, refreshKey }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSentimentData();
  }, [timeRange, refreshKey]);

  const fetchSentimentData = async () => {
    try {
      setLoading(true);
      const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : timeRange === '7d' ? 168 : 24;
      const response = await api.getSentimentTrends(hours);
      setSentimentData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sentiment data:', err);
      setError('Failed to load sentiment data');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip">
          <p className="text-white font-bold mb-2 text-sm">{data.timestamp}</p>
          <div className="space-y-1 text-xs">
            <p className="text-spotify-green font-semibold flex items-center justify-between">
              <span>😊 Positive:</span>
              <span className="font-bold ml-4">{data.positive_count}</span>
            </p>
            <p className="text-[#b3b3b3] font-semibold flex items-center justify-between">
              <span>😐 Neutral:</span>
              <span className="font-bold ml-4">{data.neutral_count}</span>
            </p>
            <p className="text-red-400 font-semibold flex items-center justify-between">
              <span>😞 Negative:</span>
              <span className="font-bold ml-4">{data.negative_count}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <span className="text-2xl">💭</span>
          <span className="gradient-text">Sentiment Analysis</span>
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <span className="text-2xl">💭</span>
          <span className="gradient-text">Sentiment Analysis</span>
        </h3>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={fetchSentimentData}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const chartData = sentimentData?.data_points || [];

  return (
    <div className="spotify-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <span className="text-2xl">💭</span>
          <span>Sentiment Analysis</span>
        </h3>
        <button
          onClick={fetchSentimentData}
          className="text-[#b3b3b3] hover:text-white transition-colors text-xl"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No sentiment data available
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <AnimatedCounter
              value={chartData.reduce((sum, d) => sum + d.positive_count, 0)}
              label="Positive"
              icon="😊"
              gradient="from-white to-gray-400"
              duration={1.5}
            />
            <AnimatedCounter
              value={chartData.reduce((sum, d) => sum + d.neutral_count, 0)}
              label="Neutral"
              icon="😐"
              gradient="from-gray-300 to-gray-500"
              duration={1.5}
            />
            <AnimatedCounter
              value={chartData.reduce((sum, d) => sum + d.negative_count, 0)}
              label="Negative"
              icon="😞"
              gradient="from-gray-400 to-gray-600"
              duration={1.5}
            />
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getHours()}:00`;
                }}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Area
                type="monotone"
                dataKey="positive_count"
                stroke="#1DB954"
                strokeWidth={2}
                fillOpacity={0.3}
                fill="#1DB954"
                name="Positive"
                animationDuration={1000}
                animationBegin={0}
              />
              <Area
                type="monotone"
                dataKey="neutral_count"
                stroke="#b3b3b3"
                strokeWidth={2}
                fillOpacity={0.3}
                fill="#b3b3b3"
                name="Neutral"
                animationDuration={1000}
                animationBegin={200}
              />
              <Area
                type="monotone"
                dataKey="negative_count"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={0.3}
                fill="#ef4444"
                name="Negative"
                animationDuration={1000}
                animationBegin={400}
              />
            </AreaChart>
          </ResponsiveContainer>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SentimentGraph;
