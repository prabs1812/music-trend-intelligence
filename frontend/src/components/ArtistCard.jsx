import React from 'react';
import { motion } from 'framer-motion';

const ArtistCard = ({ artist, rank, index }) => {
  const getTrendIcon = (velocity) => {
    if (velocity > 0) return '↗';
    if (velocity < 0) return '↘';
    return '→';
  };

  const getTrendColor = (velocity) => {
    if (velocity > 0) return 'text-spotify-green';
    if (velocity < 0) return 'text-red-500';
    return 'text-[#b3b3b3]';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="artist-card flex-shrink-0 w-48 group cursor-pointer"
    >
      <div className="relative">
        {/* Artist Image */}
        <div className="relative w-48 h-48 mb-4 overflow-hidden rounded-full bg-[#282828]">
          {artist.image_url ? (
            <img
              src={artist.image_url}
              alt={artist.name}
              className="w-full h-full object-cover circular-image hover-scale"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#282828] to-[#181818]">
              <span className="text-6xl">🎤</span>
            </div>
          )}

          {/* Rank Badge */}
          <div className="rank-badge">
            #{rank}
          </div>

          {/* Play Button Overlay */}
          <div className="play-button-overlay">
            <div className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <span className="text-black text-2xl ml-1">▶</span>
            </div>
          </div>
        </div>

        {/* Artist Info */}
        <div className="px-2">
          <h3 className="text-white font-bold text-base mb-1 truncate group-hover:text-spotify-green transition-colors">
            {artist.name}
          </h3>

          {/* Trend Score */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#b3b3b3] text-sm">
              Score: <span className="text-white font-semibold">{artist.trend_score?.toFixed(1) || 0}</span>
            </span>
            <span className={`text-sm font-bold flex items-center ${getTrendColor(artist.growth_velocity || 0)}`}>
              {getTrendIcon(artist.growth_velocity || 0)}
              {Math.abs(artist.growth_velocity || 0).toFixed(1)}%
            </span>
          </div>

          {/* Genres */}
          {artist.genres && artist.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {artist.genres.slice(0, 2).map((genre, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-[#282828] text-[#b3b3b3] rounded-full"
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
