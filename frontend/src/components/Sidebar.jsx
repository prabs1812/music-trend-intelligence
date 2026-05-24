import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, Music, BarChart3, TrendingUp, Sparkles, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/artists', icon: Users, label: 'Artists' },
    { path: '/genres', icon: Music, label: 'Genres' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/anomalies', icon: TrendingUp, label: 'Trends' },
  ];

  const bottomItems = [
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-background/80 backdrop-blur-xl border-r border-white/10 flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-cyan flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-white font-bold text-lg whitespace-nowrap gradient-text"
              >
                Music Trends
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Toggle Button */}
      <div className="px-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5 text-muted" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  relative flex items-center gap-4 px-4 py-3 rounded-xl
                  transition-all duration-300 group
                  ${active
                    ? 'bg-gradient-to-r from-purple/20 to-transparent text-white'
                    : 'text-muted hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple via-cyan to-pink rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon with glow effect */}
                <div className={`
                  relative flex-shrink-0
                  ${active ? 'text-purple' : ''}
                `}>
                  <Icon className="w-5 h-5" />
                  {active && (
                    <div className="absolute inset-0 blur-lg bg-purple/50 -z-10" />
                  )}
                </div>

                {/* Label */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple/0 via-purple/5 to-cyan/0 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="px-3 pb-6 space-y-2 border-t border-white/10 pt-4">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  relative flex items-center gap-4 px-4 py-3 rounded-xl
                  transition-all duration-300 group
                  ${active
                    ? 'bg-gradient-to-r from-purple/20 to-transparent text-white'
                    : 'text-muted hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <div className={`flex-shrink-0 ${active ? 'text-purple' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Sidebar;
