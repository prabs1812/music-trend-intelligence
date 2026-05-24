import React from 'react';
import { Link } from 'react-router-dom';
import TrendingArtists from '../components/TrendingArtists';
import GenreChart from '../components/GenreChart';

const Home = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="glass-card rounded-2xl p-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Welcome to Music Trend Intelligence
        </h1>
        <p className="text-purple-200/80 text-lg mb-6">
          Real-time analytics and insights from the music industry
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/artists"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Explore Artists
          </Link>
          <Link
            to="/genres"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium border border-purple-500/30 transition-all duration-300 transform hover:scale-105"
          >
            View Genres
          </Link>
        </div>
      </div>

      {/* Quick Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Artists Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Top Trending Artists</h2>
            <Link
              to="/artists"
              className="text-purple-300 hover:text-white text-sm font-medium transition"
            >
              View All →
            </Link>
          </div>
          <TrendingArtists timeRange="24h" refreshKey={0} />
        </div>

        {/* Top Genres Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Popular Genres</h2>
            <Link
              to="/genres"
              className="text-purple-300 hover:text-white text-sm font-medium transition"
            >
              View All →
            </Link>
          </div>
          <GenreChart timeRange="24h" refreshKey={0} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/analytics" className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
          <p className="text-purple-200/70">View sentiment trends and engagement metrics</p>
        </Link>

        <Link to="/anomalies" className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
          <div className="text-4xl mb-3">🚨</div>
          <h3 className="text-xl font-bold text-white mb-2">Anomalies</h3>
          <p className="text-purple-200/70">Monitor unusual patterns and alerts</p>
        </Link>

        <div className="glass-card rounded-2xl p-6">
          <div className="text-4xl mb-3">🔥</div>
          <h3 className="text-xl font-bold text-white mb-2">Live Updates</h3>
          <p className="text-purple-200/70">Real-time data refreshed every 5 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
