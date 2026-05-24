import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/artists', icon: '🎤', label: 'Artists' },
    { path: '/genres', icon: '🎵', label: 'Genres' },
    { path: '/analytics', icon: '📊', label: 'Analytics' },
    { path: '/anomalies', icon: '🚨', label: 'Anomalies' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 h-screen w-60 bg-black flex flex-col z-50">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-spotify-green rounded-lg flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
          <span className="text-white font-bold text-xl">Music Trends</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center space-x-4 px-4 py-3 rounded-md mb-2
              transition-all duration-200
              ${isActive(item.path)
                ? 'bg-[#282828] text-spotify-green border-l-4 border-spotify-green'
                : 'text-[#b3b3b3] hover:text-white hover:bg-[#282828]'
              }
            `}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-semibold text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-[#282828]">
        <div className="flex items-center space-x-3 p-3 rounded-md hover:bg-[#282828] cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">U</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">User</p>
            <p className="text-[#b3b3b3] text-xs">View Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
