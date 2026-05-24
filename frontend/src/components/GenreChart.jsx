import React, { useState, useEffect } from 'react';
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
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <span className="text-2xl">📊</span>
          <span className="gradient-text">Genre Trends</span>
        </h3>
        <button
          onClick={fetchGenres}
          className="text-purple-300 hover:text-white transition-all duration-300 transform hover:rotate-180 text-xl"
          title="Refresh"
        >
          🔄
        </button>
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
              <div key={genre.id || index} className="space-y-2 group">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-semibold capitalize group-hover:text-purple-300 transition">{genre.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-200/60 text-xs">
                      {genre.artist_count} artists
                    </span>
                    <span className={`font-bold text-sm ${
                      genre.growth_rate > 0 ? 'text-green-400' :
                      genre.growth_rate < 0 ? 'text-red-400' : 'text-purple-200/60'
                    }`}>
                      {genre.growth_rate > 0 ? '↗ +' : genre.growth_rate < 0 ? '↘ ' : ''}{genre.growth_rate?.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="relative h-8 bg-slate-800/50 rounded-xl overflow-hidden border border-purple-500/10">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${Math.min(genre.popularity || 0, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white drop-shadow-lg">
                      {genre.popularity?.toFixed(1) || 0}
                    </span>
                  </div>
                </div>
                {genre.trending_artists && genre.trending_artists.length > 0 && (
                  <div className="text-xs text-purple-200/50 pl-2 font-medium">
                    🎤 {genre.trending_artists.slice(0, 3).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreChart;
