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
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Genre Trends</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Genre Trends</h3>
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchGenres}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">📊 Genre Trends</h3>
        <button
          onClick={fetchGenres}
          className="text-gray-400 hover:text-white transition"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {genres.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No genre data available
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bar Chart Visualization */}
          <div className="space-y-2">
            {genres.slice(0, 8).map((genre, index) => (
              <div key={genre.id || index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium capitalize">{genre.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">
                      {genre.artist_count} artists
                    </span>
                    <span className={`font-semibold ${
                      genre.growth_rate > 0 ? 'text-green-400' :
                      genre.growth_rate < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {genre.growth_rate > 0 ? '+' : ''}{genre.growth_rate?.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                    style={{ width: `${Math.min(genre.popularity || 0, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white drop-shadow">
                      {genre.popularity?.toFixed(1) || 0}
                    </span>
                  </div>
                </div>
                {genre.trending_artists && genre.trending_artists.length > 0 && (
                  <div className="text-xs text-gray-400 pl-2">
                    Top: {genre.trending_artists.slice(0, 3).join(', ')}
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
