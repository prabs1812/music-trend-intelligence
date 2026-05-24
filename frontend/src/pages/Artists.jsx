import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
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

  const getTrendColor = (velocity) => {
    if (velocity > 2) return 'from-orange-500 to-red-500';
    if (velocity > 0) return 'from-green-500 to-emerald-500';
    if (velocity < -2) return 'from-red-500 to-pink-500';
    return 'from-purple-500 to-blue-500';
  };

  const getArtistInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 text-center"
      >
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-400 font-medium mb-4">{error}</p>
        <button
          onClick={fetchArtists}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6"
      >
        <h1 className="text-4xl font-bold gradient-text mb-6">All Artists</h1>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4">
          <motion.div
            className="flex-1"
            whileFocus={{ scale: 1.02 }}
          >
            <input
              type="text"
              placeholder="🔍 Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 bg-slate-800/50 border border-purple-500/20 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            />
          </motion.div>
          <div className="flex gap-2">
            {['trend_score', 'popularity', 'name'].map((sort, index) => (
              <motion.button
                key={sort}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => setSortBy(sort)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  sortBy === sort
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-slate-800/50 text-purple-200/70 hover:bg-slate-700/50'
                }`}
              >
                {sort === 'trend_score' ? '🔥 Trending' : sort === 'popularity' ? '⭐ Popular' : '🔤 A-Z'}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-purple-200/60 text-sm"
        >
          Showing <CountUp end={filteredAndSortedArtists.length} duration={0.5} /> of {artists.length} artists
        </motion.div>
      </motion.div>

      {/* Artists Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {filteredAndSortedArtists.map((artist, index) => (
            <motion.div
              key={artist.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card rounded-2xl p-6 cursor-pointer group relative overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Rank Badge */}
                <div className="flex items-start justify-between mb-4">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                    className={`text-2xl font-bold ${
                      index < 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500' : 'text-purple-300/70'
                    }`}
                  >
                    #{index + 1}
                  </motion.span>
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-3xl"
                  >
                    {getTrendIcon(artist.growth_velocity || 0)}
                  </motion.span>
                </div>

                {/* Artist Avatar */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${getTrendColor(artist.growth_velocity || 0)} p-1 shadow-lg`}
                  >
                    {artist.image_url ? (
                      <img
                        src={artist.image_url}
                        alt={artist.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold"
                      style={{ display: artist.image_url ? 'none' : 'flex' }}
                    >
                      {getArtistInitials(artist.name)}
                    </div>
                    {/* Glow Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/50 to-pink-500/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ zIndex: -1 }}
                    />
                  </motion.div>
                </div>

                {/* Artist Name */}
                <h3 className="text-xl font-bold text-white mb-3 text-center truncate group-hover:text-purple-300 transition-colors">
                  {artist.name}
                </h3>

                {/* Metrics */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200/70">Trend Score:</span>
                    <span className="text-purple-300 font-bold">
                      <CountUp end={artist.trend_score || 0} decimals={1} duration={1} />
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200/70">Popularity:</span>
                    <span className="text-purple-300 font-bold">
                      <CountUp end={artist.popularity || 0} decimals={1} duration={1} />
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200/70">Growth:</span>
                    <span className={`font-bold ${
                      (artist.growth_velocity || 0) > 0 ? 'text-green-400' :
                      (artist.growth_velocity || 0) < 0 ? 'text-red-400' : 'text-purple-200/70'
                    }`}>
                      {(artist.growth_velocity || 0) > 0 ? '+' : ''}{(artist.growth_velocity || 0).toFixed(2)}
                    </span>
                  </div>
                  {artist.youtube_mentions > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-200/70">📺 YouTube:</span>
                      <span className="text-purple-300 font-bold">{artist.youtube_mentions}</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {artist.genres && artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {artist.genres.slice(0, 2).map((genre, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.3 + i * 0.1 }}
                        className="text-xs px-2.5 py-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 rounded-full border border-purple-500/20 font-medium"
                      >
                        {genre}
                      </motion.span>
                    ))}
                    {artist.genres.length > 2 && (
                      <span className="text-xs px-2.5 py-1 text-purple-200/50">
                        +{artist.genres.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredAndSortedArtists.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-16 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4 opacity-50"
          >
            🔍
          </motion.div>
          <p className="text-purple-200/60 text-lg">No artists found matching "{searchTerm}"</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Artists;
