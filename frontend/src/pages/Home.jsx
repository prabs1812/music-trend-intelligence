import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArtistCard from '../components/ArtistCard';
import { api } from '../services/api';

const Home = ({ timeRange }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingArtists();
  }, [timeRange]);

  const fetchTrendingArtists = async () => {
    try {
      setLoading(true);
      const response = await api.getTrendingArtists(20, timeRange);
      setArtists(response.data);
    } catch (err) {
      console.error('Error fetching artists:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-white mb-2">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
        </h1>
        <p className="text-[#b3b3b3] text-lg">
          Discover what's trending in music right now
        </p>
      </div>

      {/* Trending Artists Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Trending Artists</h2>
          <Link to="/artists" className="text-[#b3b3b3] hover:text-white text-sm font-semibold transition-colors">
            Show all →
          </Link>
        </div>

        {loading ? (
          <div className="horizontal-scroll space-x-6 pb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48">
                <div className="w-48 h-48 bg-[#282828] rounded-full shimmer mb-4"></div>
                <div className="h-4 bg-[#282828] rounded shimmer mb-2"></div>
                <div className="h-3 bg-[#282828] rounded shimmer w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="horizontal-scroll space-x-6 pb-4">
            {artists.slice(0, 10).map((artist, index) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                rank={index + 1}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/analytics">
          <div className="stats-card">
            <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Analytics</h3>
              <p className="text-[#b3b3b3] text-sm">View sentiment trends</p>
            </div>
          </div>
        </Link>

        <Link to="/anomalies">
          <div className="stats-card">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚨</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Anomalies</h3>
              <p className="text-[#b3b3b3] text-sm">Monitor unusual patterns</p>
            </div>
          </div>
        </Link>

        <div className="stats-card cursor-default">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Live Updates</h3>
            <p className="text-[#b3b3b3] text-sm">Real-time data</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
