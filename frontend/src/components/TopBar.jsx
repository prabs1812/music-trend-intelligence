import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TopBar = ({ timeRange, onTimeRangeChange, isConnected }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const timeRanges = ['24h', '7d', '30d', 'All'];

  return (
    <div className="sticky top-0 z-40 gradient-overlay backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left: Navigation arrows */}
        <div className="flex items-center space-x-4">
          <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors">
            <span className="text-white">←</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors">
            <span className="text-white">→</span>
          </button>
        </div>

        {/* Center: Search bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search artists, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-12 py-2 bg-[#282828] text-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-spotify-green placeholder-[#b3b3b3]"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#b3b3b3]">
              🔍
            </span>
          </div>
        </div>

        {/* Right: Time range pills and live indicator */}
        <div className="flex items-center space-x-4">
          {/* Time range pills */}
          <div className="flex items-center space-x-2 bg-[#181818] rounded-full p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange && onTimeRangeChange(range)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                  ${timeRange === range
                    ? 'bg-spotify-green text-black'
                    : 'text-[#b3b3b3] hover:text-white'
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Live indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#181818] rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-spotify-green pulse-green' : 'bg-red-500'}`} />
            <span className="text-xs font-semibold text-white">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* User avatar */}
          <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
            <span className="text-black font-bold text-sm">U</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
