import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomTooltip = ({ active, payload, label, type = 'default' }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ duration: 0.2 }}
        className="glass-card rounded-xl p-4 shadow-2xl border border-white/40 backdrop-blur-xl"
      >
        {label && (
          <motion.p
            className="text-white font-bold mb-3 text-sm border-b border-white/30 pb-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {label}
          </motion.p>
        )}

        <div className="space-y-2">
          {payload.map((entry, index) => (
            <motion.div
              key={`item-${index}`}
              className="flex items-center justify-between space-x-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{
                    backgroundColor: entry.color,
                    boxShadow: `0 0 10px ${entry.color}40`
                  }}
                />
                <span className="text-gray-300 text-sm font-medium">
                  {entry.name}:
                </span>
              </div>
              <span className="text-white font-bold text-sm">
                {typeof entry.value === 'number'
                  ? entry.value.toLocaleString()
                  : entry.value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-gray-400/20 rounded-xl blur-xl -z-10" />
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomTooltip;
