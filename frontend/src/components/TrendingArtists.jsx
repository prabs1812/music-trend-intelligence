import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import ArtistCard from './ArtistCard';
import Card from './ui/Card';

const TrendingArtists = ({ timeRange, refreshKey }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artistImages, setArtistImages] = useState({});

  useEffect(() => {
    fetchTrendingArtists();
  }, [timeRange, refreshKey]);

  const fetchTrendingArtists = async () => {
    try {
      setLoading(true);
      const response = await api.getTrendingArtists(12, timeRange);
      setArtists(response.data);
      setError(null);

      // Fetch artist images from Deezer
      fetchArtistImages(response.data);
    } catch (err) {
      console.error('Error fetching trending artists:', err);
      setError('Failed to load trending artists');
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistImages = async (artistsList) => {
    const images = {};

    // Fetch images in parallel for all artists
    const imagePromises = artistsList.map(async (artist) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/artists/image/${encodeURIComponent(artist.name)}?size=medium`
        );
        if (response.ok) {
          const data = await response.json();
          images[artist.name] = data.image_url;
        }
      } catch (err) {
        console.error(`Failed to fetch image for ${artist.name}:`, err);
      }
    });

    await Promise.all(imagePromises);
    setArtistImages(images);
  };

  if (loading) {
    return (
      <Card>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple" />
            <h3 className="text-xl font-bold text-white">Trending Artists</h3>
          </div>
          <p className="text-sm text-muted">Top artists making waves right now</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card h-80 animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-pink font-medium mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchTrendingArtists}
            className="px-6 py-3 bg-gradient-to-r from-purple to-cyan text-white rounded-xl font-medium shadow-lg"
          >
            Retry
          </motion.button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple" />
            <h3 className="text-xl font-bold text-white">Trending Artists</h3>
          </div>
          <p className="text-sm text-muted">Top artists making waves right now</p>
        </div>
        <motion.button
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={fetchTrendingArtists}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-muted" />
        </motion.button>
      </div>

      {artists.length === 0 ? (
        <div className="text-center py-16">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4 opacity-50"
          >
            🎵
          </motion.div>
          <p className="text-muted">No trending artists found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artists.map((artist, index) => (
            <ArtistCard
              key={artist.id || index}
              artist={{ ...artist, image_url: artistImages[artist.name] }}
              rank={index + 1}
              index={index}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default TrendingArtists;
