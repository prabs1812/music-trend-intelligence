import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-cyan-900/20" />

      {/* Floating Orbs */}
      <div className="absolute top-10 left-20 w-64 h-64 bg-purple rounded-full opacity-20 blur-3xl float-orb" />
      <div className="absolute bottom-10 right-20 w-80 h-80 bg-cyan rounded-full opacity-20 blur-3xl float-orb" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink rounded-full opacity-15 blur-3xl float-orb" style={{ animationDelay: '4s' }} />

      {/* Content */}
      <div className="relative z-10 px-8 py-20 md:py-28 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 gradient-text"
        >
          Discover Real-Time Music Trends
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted max-w-3xl mx-auto"
        >
          Track viral artists, genre growth, and streaming analytics instantly.
        </motion.p>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 flex justify-center gap-4"
        >
          <div className="w-2 h-2 rounded-full bg-purple glow-effect" />
          <div className="w-2 h-2 rounded-full bg-cyan glow-effect" style={{ animationDelay: '0.5s' }} />
          <div className="w-2 h-2 rounded-full bg-pink glow-effect" style={{ animationDelay: '1s' }} />
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
