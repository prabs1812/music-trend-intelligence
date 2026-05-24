import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/artists', label: 'Artists', icon: '🎤' },
    { path: '/genres', label: 'Genres', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '💭' },
    { path: '/anomalies', label: 'Anomalies', icon: '🚨' },
  ];

  return (
    <nav className="glass-card border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Brand */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="text-3xl animate-pulse-glow">🎵</div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                Music Trend Intelligence
              </h1>
              <p className="text-xs text-purple-300/60">Real-time Analytics</p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-purple-200/70 hover:text-white hover:bg-slate-700/50'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-purple-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation - Hidden by default */}
        <div className="md:hidden pb-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                    : 'text-purple-200/70 hover:text-white hover:bg-slate-700/50'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
