import React, { useState } from 'react';
import GenreChart from '../components/GenreChart';

const Genres = () => {
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Genre Analytics</h1>
            <p className="text-purple-200/70">Explore music genre trends and popularity</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-purple-200/70 font-medium">Time Range:</span>
            <div className="flex space-x-2 bg-slate-800/50 rounded-xl p-1.5 border border-purple-500/20">
              {['1h', '6h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-purple-200/70 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Genre Chart */}
      <GenreChart timeRange={timeRange} refreshKey={0} />

      {/* Genre Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="text-4xl mb-3">🎸</div>
          <h3 className="text-xl font-bold text-white mb-2">Rock & Alternative</h3>
          <p className="text-purple-200/70 text-sm mb-4">
            Classic and modern rock genres with strong guitar presence
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{width: '75%'}}></div>
            </div>
            <span className="text-purple-300 text-sm font-bold">75%</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="text-4xl mb-3">🎹</div>
          <h3 className="text-xl font-bold text-white mb-2">Electronic & Pop</h3>
          <p className="text-purple-200/70 text-sm mb-4">
            Electronic music, dance, and mainstream pop hits
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{width: '85%'}}></div>
            </div>
            <span className="text-purple-300 text-sm font-bold">85%</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="text-4xl mb-3">🎤</div>
          <h3 className="text-xl font-bold text-white mb-2">Hip-Hop & R&B</h3>
          <p className="text-purple-200/70 text-sm mb-4">
            Urban music, rap, and contemporary R&B
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{width: '90%'}}></div>
            </div>
            <span className="text-purple-300 text-sm font-bold">90%</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="text-4xl mb-3">🎺</div>
          <h3 className="text-xl font-bold text-white mb-2">Jazz & Blues</h3>
          <p className="text-purple-200/70 text-sm mb-4">
            Classic jazz, blues, and instrumental music
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{width: '60%'}}></div>
            </div>
            <span className="text-purple-300 text-sm font-bold">60%</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="text-4xl mb-3">🎻</div>
          <h3 className="text-xl font-bold text-white mb-2">Classical & Indie</h3>
          <p className="text-purple-200/70 text-sm mb-4">
            Classical music and independent artists
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{width: '55%'}}></div>
            </div>
            <span className="text-purple-300 text-sm font-bold">55%</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="text-4xl mb-3">🌍</div>
          <h3 className="text-xl font-bold text-white mb-2">World & Latin</h3>
          <p className="text-purple-200/70 text-sm mb-4">
            International music and Latin genres
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{width: '70%'}}></div>
            </div>
            <span className="text-purple-300 text-sm font-bold">70%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Genres;
