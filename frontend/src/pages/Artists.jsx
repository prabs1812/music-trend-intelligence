import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('trend_score');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await api.getTrendingArtists(50, '24h');
      setArtists(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError('Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedArtists = artists
    .filter(artist =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      return (b.trend_score || 0) - (a.trend_score || 0);
    });

  const getTrendIcon = (velocity) => {
    if (velocity > 2) return '🔥';
    if (velocity > 0) return '📈';
    if (velocity < -2) return '📉';
    return '➡️';
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-400 font-medium mb-4">{error}</p>
        <button
          onClick={fetchArtists}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <h1 className="text-3xl font-bold gradient-text mb-6">All Artists</h1>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:border-purple-500/50 transition"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('trend_score')}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                sortBy === 'trend_score'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-800/50 text-purple-200/70 hover:bg-slate-700/50'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setSortBy('popularity')}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                sortBy === 'popularity'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-800/50 text-purple-200/70 hover:bg-slate-700/50'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                sortBy === 'name'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-800/50 text-purple-200/70 hover:bg-slate-700/50'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>

        <div className="mt-4 text-purple-200/60 text-sm">
          Showing {filteredAndSortedArtists.length} of {artists.length} artists
        </div>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedArtists.map((artist, index) => (
          <div
            key={artist.id || index}
            className="glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            {/* Rank Badge */}
            <div className="flex items-start justify-between mb-4">
              <span className={`text-2xl font-bold ${
                index < 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500' : 'text-purple-300/70'
              }`}>
                #{index + 1}
              </span>
              <span className="text-3xl">{getTrendIcon(artist.growth_velocity || 0)}</span>
            </div>

            {/* Artist Name */}
            <h3 className="text-xl font-bold text-white mb-3 truncate">
              {artist.name}
            </h3>

            {/* Metrics */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200/70">Trend Score:</span>
                <span className="text-purple-300 font-bold">{artist.trend_score?.toFixed(1) || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-200/70">Popularity:</span>
                <span className="text-purple-300 font-bold">{artist.popularity?.toFixed(1) || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-200/70">Growth:</span>
                <span className={`font-bold ${
                  (artist.growth_velocity || 0) > 0 ? 'text-green-400' :
                  (artist.growth_velocity || 0) < 0 ? 'text-red-400' : 'text-purple-200/70'
                }`}>
                  {(artist.growth_velocity || 0) > 0 ? '+' : ''}{artist.growth_velocity?.toFixed(2) || 0}
                </span>
              </div>
            </div>

            {/* Genres */}
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
                {artist.genres.length > 3 && (
                  <span className="text-xs px-2.5 py-1 text-purple-200/50">
                    +{artist.genres.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAndSortedArtists.length === 0 && (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="text-6xl mb-4 opacity-50">🔍</div>
          <p className="text-purple-200/60 text-lg">No artists found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default Artists;
