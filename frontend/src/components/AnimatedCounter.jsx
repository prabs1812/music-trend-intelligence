import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

const AnimatedCounter = ({
  value,
  label,
  icon,
  duration = 2,
  decimals = 0,
  suffix = '',
  prefix = '',
  gradient = 'from-purple-400 to-pink-400'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm">
        {icon && (
          <motion.span
            className="text-2xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            {icon}
          </motion.span>
        )}
        <div className="flex flex-col">
          <span className="text-xs text-purple-200/60 font-medium uppercase tracking-wider">
            {label}
          </span>
          <div className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            <CountUp
              end={value}
              duration={duration}
              decimals={decimals}
              suffix={suffix}
              prefix={prefix}
              separator=","
            />
          </div>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-xl -z-10`}></div>
    </motion.div>
  );
};

export default AnimatedCounter;
