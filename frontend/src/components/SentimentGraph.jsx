import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../services/api';

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
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{data.timestamp}</p>
          <div className="space-y-1 text-sm">
            <p className="text-green-400">Positive: {data.positive_count}</p>
            <p className="text-gray-400">Neutral: {data.neutral_count}</p>
            <p className="text-red-400">Negative: {data.negative_count}</p>
            <p className="text-blue-400 font-semibold">
              Avg: {data.avg_sentiment?.toFixed(3)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">💭 Sentiment Analysis</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">💭 Sentiment Analysis</h3>
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchSentimentData}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const chartData = sentimentData?.data_points || [];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">💭 Sentiment Analysis</h3>
        <button
          onClick={fetchSentimentData}
          className="text-gray-400 hover:text-white transition"
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
        <div>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">
                {chartData.reduce((sum, d) => sum + d.positive_count, 0)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Positive</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-400">
                {chartData.reduce((sum, d) => sum + d.neutral_count, 0)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Neutral</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">
                {chartData.reduce((sum, d) => sum + d.negative_count, 0)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Negative</div>
            </div>
          </div>

          {/* Chart */}
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
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorPositive)"
                name="Positive"
              />
              <Area
                type="monotone"
                dataKey="neutral_count"
                stroke="#6b7280"
                fillOpacity={1}
                fill="url(#colorNeutral)"
                name="Neutral"
              />
              <Area
                type="monotone"
                dataKey="negative_count"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorNegative)"
                name="Negative"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SentimentGraph;
