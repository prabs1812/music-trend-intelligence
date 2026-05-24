import React from 'react';
import AnomalyAlerts from '../components/AnomalyAlerts';

const Anomalies = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Anomaly Detection</h1>
        <p className="text-purple-200/70">Monitor unusual patterns and trending spikes</p>
      </div>

      {/* Anomaly Alerts */}
      <AnomalyAlerts refreshKey={0} />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="text-4xl mb-3">🚨</div>
          <h3 className="text-xl font-bold text-white mb-2">Critical Alerts</h3>
          <p className="text-purple-200/70 text-sm mb-4">
            Immediate attention required for significant anomalies
          </p>
          <div className="text-3xl font-bold text-red-400">0</div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">High Priority</h3>
          <p className="text-purple-200/70 text-sm mb-4">
            Notable patterns that should be monitored
          </p>
          <div className="text-3xl font-bold text-orange-400">0</div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="text-4xl mb-3">ℹ️</div>
          <h3 className="text-xl font-bold text-white mb-2">Informational</h3>
          <p className="text-purple-200/70 text-sm mb-4">
            Minor anomalies for awareness
          </p>
          <div className="text-3xl font-bold text-blue-400">0</div>
        </div>
      </div>

      {/* Detection Methods */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Detection Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-purple-300">Statistical Analysis</h4>
            <ul className="space-y-2 text-purple-200/70">
              <li className="flex items-start space-x-2">
                <span className="text-purple-400">•</span>
                <span>Z-Score Detection (outliers &gt; 3σ)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400">•</span>
                <span>Spike Detection (&gt;200% increase)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400">•</span>
                <span>Trend Deviation Analysis</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-purple-300">Machine Learning</h4>
            <ul className="space-y-2 text-purple-200/70">
              <li className="flex items-start space-x-2">
                <span className="text-purple-400">•</span>
                <span>Isolation Forest Algorithm</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400">•</span>
                <span>Sentiment Shift Detection</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400">•</span>
                <span>Pattern Recognition</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anomalies;
