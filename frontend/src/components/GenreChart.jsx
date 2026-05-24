import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

const GenreChart = ({ timeRange, refreshKey }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGenres();
  }, [timeRange, refreshKey]);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const response = await api.getTrendingGenres(10);
      setGenres(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError('Failed to load genre data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <span className="gradient-text">Genre Trends</span>
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
          <span className="text-2xl">📊</span>
          <span className="gradient-text">Genre Trends</span>
        </h3>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={fetchGenres}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 card-depth">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <motion.span
            className="text-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            📊
          </motion.span>
          <span className="gradient-text">Genre Trends</span>
        </h3>
        <motion.button
          onClick={fetchGenres}
          className="text-purple-300 hover:text-white transition-all duration-300 text-xl"
          title="Refresh"
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🔄
        </motion.button>
      </div>

      {genres.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-50">📊</div>
          <p className="text-purple-200/60">No genre data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bar Chart Visualization */}
          <div className="space-y-3">
            {genres.slice(0, 8).map((genre, index) => (
              <motion.div
                key={genre.id || index}
                className="space-y-2 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-semibold capitalize group-hover:text-purple-300 transition">{genre.name}</span>
                  <div className="flex items-center space-x-3">
                    <motion.span
                      className="text-purple-200/60 text-xs"
                      whileHover={{ scale: 1.1, color: '#c084fc' }}
                    >
                      {genre.artist_count} artists
                    </motion.span>
                    <motion.span
                      className={`font-bold text-sm ${
                        genre.growth_rate > 0 ? 'text-green-400' :
                        genre.growth_rate < 0 ? 'text-red-400' : 'text-purple-200/60'
                      }`}
                      whileHover={{ scale: 1.15 }}
                    >
                      {genre.growth_rate > 0 ? '↗ +' : genre.growth_rate < 0 ? '↘ ' : ''}{genre.growth_rate?.toFixed(1)}%
                    </motion.span>
                  </div>
                </div>
                <div className="relative h-8 bg-slate-800/50 rounded-xl overflow-hidden border border-purple-500/10 group-hover:border-purple-500/30 transition-all">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(genre.popularity || 0, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      className="text-sm font-bold text-white drop-shadow-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      {genre.popularity?.toFixed(1) || 0}
                    </motion.span>
                  </div>
                </div>
                {genre.trending_artists && genre.trending_artists.length > 0 && (
                  <motion.div
                    className="text-xs text-purple-200/50 pl-2 font-medium"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    🎤 {genre.trending_artists.slice(0, 3).join(', ')}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreChart;
