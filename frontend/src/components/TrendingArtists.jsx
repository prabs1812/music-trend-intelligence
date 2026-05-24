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
      <div className="glass-card rounded-2xl p-6 h-full">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <span className="text-2xl">🎤</span>
          <span className="gradient-text">Trending Artists</span>
        </h3>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-700/30">
              <div className="w-10 h-10 bg-slate-600/50 rounded-lg shimmer"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-600/50 rounded-lg w-3/4 shimmer"></div>
                <div className="h-3 bg-slate-600/50 rounded-lg w-1/2 shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 h-full">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <span className="text-2xl">🎤</span>
          <span className="gradient-text">Trending Artists</span>
        </h3>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={fetchTrendingArtists}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <span className="text-2xl">🎤</span>
          <span className="gradient-text">Trending Artists</span>
        </h3>
        <button
          onClick={fetchTrendingArtists}
          className="text-purple-300 hover:text-white transition-all duration-300 transform hover:rotate-180 text-xl"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
        {artists.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">🎵</div>
            <p className="text-purple-200/60">No trending artists found</p>
          </div>
        ) : (
          artists.map((artist, index) => (
            <div
              key={artist.id || index}
              className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl hover:from-slate-700/50 hover:to-slate-800/50 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-10 text-center">
                <span className={`font-bold text-lg ${
                  index < 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500' : 'text-purple-300/70'
                }`}>
                  #{index + 1}
                </span>
              </div>

              {/* Artist Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-white font-semibold truncate group-hover:text-purple-300 transition">
                    {artist.name}
                  </h4>
                  <span className="text-xl">
                    {getTrendIcon(artist.growth_velocity || 0)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-purple-200/60 mb-2">
                  <span className="font-medium">Score: <span className="text-purple-300">{artist.trend_score?.toFixed(1) || 0}</span></span>
                  <span className={`font-medium ${getSentimentColor(artist.sentiment_score || 0)}`}>
                    Sentiment: {(artist.sentiment_score || 0).toFixed(2)}
                  </span>
                </div>
                {artist.genres && artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {artist.genres.slice(0, 3).map((genre, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 rounded-full border border-purple-500/20 font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="flex-shrink-0 text-right text-xs space-y-1">
                <div className="flex items-center justify-end space-x-1 text-purple-200/60">
                  <span>💬</span>
                  <span>{artist.reddit_mentions || 0}</span>
                </div>
                <div className="flex items-center justify-end space-x-1 text-purple-200/60">
                  <span>📺</span>
                  <span>{artist.youtube_mentions || 0}</span>
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
