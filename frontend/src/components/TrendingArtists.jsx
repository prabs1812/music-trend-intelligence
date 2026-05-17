import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const TrendingArtists = ({ timeRange, refreshKey }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendingArtists();
  }, [timeRange, refreshKey]);

  const fetchTrendingArtists = async () => {
    try {
      setLoading(true);
      const response = await api.getTrendingArtists(20, timeRange);
      setArtists(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching trending artists:', err);
      setError('Failed to load trending artists');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (velocity) => {
    if (velocity > 5) return '🔥';
    if (velocity > 0) return '📈';
    if (velocity < -5) return '📉';
    return '➡️';
  };

  const getSentimentColor = (score) => {
    if (score > 0.3) return 'text-green-400';
    if (score < -0.3) return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🎤 Trending Artists</h3>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-700 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🎤 Trending Artists</h3>
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchTrendingArtists}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">🎤 Trending Artists</h3>
        <button
          onClick={fetchTrendingArtists}
          className="text-gray-400 hover:text-white transition"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {artists.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No trending artists found
          </div>
        ) : (
          artists.map((artist, index) => (
            <div
              key={artist.id || index}
              className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition cursor-pointer"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 text-center">
                <span className={`font-bold ${
                  index < 3 ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  #{index + 1}
                </span>
              </div>

              {/* Artist Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-medium truncate">
                    {artist.name}
                  </h4>
                  <span className="text-lg">
                    {getTrendIcon(artist.growth_velocity || 0)}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                  <span>Score: {artist.trend_score?.toFixed(1) || 0}</span>
                  <span className={getSentimentColor(artist.sentiment_score || 0)}>
                    Sentiment: {(artist.sentiment_score || 0).toFixed(2)}
                  </span>
                </div>
                {artist.genres && artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {artist.genres.slice(0, 2).map((genre, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="flex-shrink-0 text-right text-xs">
                <div className="text-gray-400">
                  Reddit: {artist.reddit_mentions || 0}
                </div>
                <div className="text-gray-400">
                  YouTube: {artist.youtube_mentions || 0}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrendingArtists;
