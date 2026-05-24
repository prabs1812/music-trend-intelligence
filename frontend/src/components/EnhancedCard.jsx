import React from 'react';
import { motion } from 'framer-motion';

const EnhancedCard = ({
  children,
  className = '',
  hover = true,
  glow = false,
  gradient = 'from-white/10 to-gray-500/10',
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative group ${className}`}
    >
      {/* Main card */}
      <div className={`
        relative z-10
        glass-card rounded-2xl p-6
        border border-white/20
        ${hover ? 'hover:border-white/40 hover:shadow-2xl hover:shadow-white/20' : ''}
        transition-all duration-300
        backdrop-blur-xl
        ${hover ? 'hover:scale-[1.02]' : ''}
      `}>
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none`}></div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>

      {/* Glow effect */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-400 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 -z-10 rounded-2xl"></div>
      )}

      {/* Depth shadow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-2xl -z-20 translate-y-1 opacity-50"></div>
    </motion.div>
  );
};

export default EnhancedCard;
