import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TrendingArtists from '../components/TrendingArtists';
import GenreChart from '../components/GenreChart';
import EnhancedCard from '../components/EnhancedCard';

const Home = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <EnhancedCard hover={true} glow={true} gradient="from-white/20 to-gray-500/20">
        <div className="text-center">
          <motion.h1
            className="text-5xl font-bold gradient-text mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome to Music Trend Intelligence
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Real-time analytics and insights from the music industry
          </motion.p>
          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/artists">
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl font-medium shadow-lg shadow-black/50 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Explore Artists</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </Link>
            <Link to="/genres">
              <motion.button
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium border border-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Genres
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </EnhancedCard>

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
        <Link to="/analytics">
          <EnhancedCard hover={true} glow={true} gradient="from-gray-500/10 to-gray-700/10" delay={0}>
            <motion.div
              className="text-4xl mb-3"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📊
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
            <p className="text-gray-400">View sentiment trends and engagement metrics</p>
          </EnhancedCard>
        </Link>

        <Link to="/anomalies">
          <EnhancedCard hover={true} glow={true} gradient="from-gray-600/10 to-gray-800/10" delay={0.1}>
            <motion.div
              className="text-4xl mb-3"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              🚨
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Anomalies</h3>
            <p className="text-gray-400">Monitor unusual patterns and alerts</p>
          </EnhancedCard>
        </Link>

        <EnhancedCard hover={false} glow={false} gradient="from-gray-400/10 to-gray-600/10" delay={0.2}>
          <motion.div
            className="text-4xl mb-3"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🔥
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Live Updates</h3>
          <p className="text-gray-400">Real-time data refreshed every 5 minutes</p>
        </EnhancedCard>
      </div>
    </div>
  );
};

export default Home;
