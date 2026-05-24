import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music2, TrendingUp } from 'lucide-react';
import Card from './ui/Card';
import api from '../services/api';

const GenreHeatmap = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await api.get('/trends/genres?limit=12');
      setGenres(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching genres:', error);
      setLoading(false);
    }
  };

  const getGradientClass = (index) => {
    const gradients = [
      'from-purple to-cyan',
      'from-pink to-purple',
      'from-cyan to-emerald-500',
      'from-amber-500 to-pink',
      'from-purple to-pink',
      'from-cyan to-purple',
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <Card>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-muted">Loading genres...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glow">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Music2 className="w-5 h-5 text-cyan" />
          <h3 className="text-xl font-bold text-white">Genre Popularity</h3>
        </div>
        <p className="text-sm text-muted">Trending music genres and their growth</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.map((genre, index) => (
          <motion.div
            key={genre.id || genre.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => setSelectedGenre(genre.name)}
            className={`
              relative p-6 rounded-2xl cursor-pointer
              bg-gradient-to-br ${getGradientClass(index)}
              overflow-hidden group
            `}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-bold text-white truncate">
                  {genre.name}
                </h4>
                {genre.growth_rate > 0 && (
                  <TrendingUp className="w-4 h-4 text-white flex-shrink-0" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Popularity</span>
                  <span className="font-semibold text-white">
                    {genre.popularity?.toFixed(0) || 0}
                  </span>
                </div>

                {genre.growth_rate !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Growth</span>
                    <span className="font-semibold text-white">
                      +{genre.growth_rate?.toFixed(1) || 0}%
                    </span>
                  </div>
                )}

                {genre.artist_count && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Artists</span>
                    <span className="font-semibold text-white">
                      {genre.artist_count}
                    </span>
                  </div>
                )}
              </div>

              {/* Popularity bar */}
              <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${genre.popularity || 0}%` }}
                  transition={{ duration: 1, delay: index * 0.05 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedGenre && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-purple/10 border border-purple/30"
        >
          <p className="text-sm text-muted">
            Selected: <span className="text-white font-semibold">{selectedGenre}</span>
          </p>
        </motion.div>
      )}
    </Card>
  );
};

export default GenreHeatmap;
