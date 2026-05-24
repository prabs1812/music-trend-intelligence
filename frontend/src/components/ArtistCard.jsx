import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Play } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const ArtistCard = ({ artist, rank, index }) => {
  const getTrendColor = (velocity) => {
    if (velocity > 0) return 'text-cyan';
    if (velocity < 0) return 'text-pink';
    return 'text-muted';
  };

  const getTrendIcon = (velocity) => {
    if (velocity > 0) return <TrendingUp className="w-4 h-4" />;
    if (velocity < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  // Mock mini chart data
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    value: Math.random() * 100 + (artist.trend_score || 50),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group cursor-pointer"
    >
      <div className="glass-card relative overflow-hidden">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple/20 via-transparent to-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rank Badge */}
        <div className="absolute top-4 left-4 z-10 w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-cyan flex items-center justify-center">
          <span className="text-white font-bold text-sm">#{rank}</span>
        </div>

        {/* Artist Image */}
        <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-purple/20 to-cyan/20">
          {artist.image_url ? (
            <>
              <img
                src={artist.image_url}
                alt={artist.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple/30 to-cyan/30">
              <span className="text-6xl">🎤</span>
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-purple to-cyan flex items-center justify-center shadow-2xl"
            >
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </motion.div>
          </div>
        </div>

        {/* Artist Info */}
        <div className="relative z-10">
          <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:gradient-text transition-all">
            {artist.name}
          </h3>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-muted mb-1">Trend Score</p>
              <p className="text-white font-bold text-lg">
                {artist.trend_score?.toFixed(1) || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Growth</p>
              <div className={`flex items-center gap-1 ${getTrendColor(artist.growth_velocity || 0)}`}>
                {getTrendIcon(artist.growth_velocity || 0)}
                <span className="font-bold text-lg">
                  {artist.growth_velocity > 0 ? '+' : ''}{Math.abs(artist.growth_velocity || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="h-12 mb-3 opacity-70 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="url(#miniGradient)"
                  strokeWidth={2}
                  dot={false}
                />
                <defs>
                  <linearGradient id="miniGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Genres */}
          {artist.genres && artist.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {artist.genres.slice(0, 2).map((genre, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full bg-white/5 text-muted border border-white/10 hover:border-purple/50 transition-colors"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ArtistCard;
