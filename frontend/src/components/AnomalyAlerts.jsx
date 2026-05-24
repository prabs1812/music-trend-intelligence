import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { anomaliesWebSocket } from '../services/websocket';
import { useWebSocket } from '../hooks/useWebSocket';

const AnomalyAlerts = ({ refreshKey }) => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribe } = useWebSocket(anomaliesWebSocket);

  useEffect(() => {
    fetchAnomalies();

    // Subscribe to real-time anomaly alerts
    const handleAnomalyAlert = (data) => {
      if (data.data) {
        setAnomalies((prev) => [data.data, ...prev].slice(0, 10));
      }
    };

    subscribe('anomaly_alert', handleAnomalyAlert);
  }, [refreshKey, subscribe]);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const response = await api.getAnomalies(10, false);
      setAnomalies(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching anomalies:', err);
      setError('Failed to load anomalies');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (anomalyId) => {
    try {
      await api.acknowledgeAnomaly(anomalyId);
      setAnomalies((prev) =>
        prev.map((a) => (a.id === anomalyId ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      console.error('Error acknowledging anomaly:', err);
    }
  };

  const handleDismiss = async (anomalyId) => {
    try {
      await api.dismissAnomaly(anomalyId);
      setAnomalies((prev) => prev.filter((a) => a.id !== anomalyId));
    } catch (err) {
      console.error('Error dismissing anomaly:', err);
    }
  };

  const getAlertLevelColor = (level) => {
    switch (level) {
      case 'critical':
        return 'from-red-600 to-red-800 border-red-500/50 shadow-red-500/30';
      case 'high':
        return 'from-orange-600 to-orange-800 border-orange-500/50 shadow-orange-500/30';
      case 'medium':
        return 'from-yellow-600 to-yellow-800 border-yellow-500/50 shadow-yellow-500/30';
      default:
        return 'from-blue-600 to-blue-800 border-blue-500/50 shadow-blue-500/30';
    }
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      default:
        return 'ℹ️';
    }
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'spike':
        return '📈';
      case 'drop':
        return '📉';
      case 'sentiment_shift':
        return '💭';
      case 'unusual_pattern':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <span className="text-2xl">🚨</span>
          <span className="gradient-text">Anomaly Alerts</span>
        </h3>
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <span className="text-2xl">🚨</span>
          <span className="gradient-text">Anomaly Alerts</span>
        </h3>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={fetchAnomalies}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <span className="text-2xl">🚨</span>
          <span className="gradient-text">Anomaly Alerts</span>
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-purple-200/70 font-medium">
            {anomalies.length} active
          </span>
          <button
            onClick={fetchAnomalies}
            className="text-purple-300 hover:text-white transition-all duration-300 transform hover:rotate-180 text-xl"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {anomalies.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-purple-200/60 font-medium">No active anomalies detected</p>
          <p className="text-purple-200/40 text-sm mt-2">All systems running smoothly</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`group bg-gradient-to-br ${getAlertLevelColor(anomaly.alert_level)} rounded-xl p-4 border shadow-lg transition-all duration-300 hover:scale-105 ${
                anomaly.acknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getAlertIcon(anomaly.alert_level)}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase bg-white/20 text-white">
                    {anomaly.alert_level}
                  </span>
                </div>
                {!anomaly.acknowledged && (
                  <button
                    onClick={() => handleDismiss(anomaly.id)}
                    className="text-white/60 hover:text-white transition text-lg"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                )}
              </div>

              <h4 className="text-white font-bold mb-2 text-lg">{anomaly.artist_name}</h4>
              <p className="text-sm text-white/80 mb-3 leading-relaxed">{anomaly.description}</p>

              <div className="space-y-1.5 text-xs text-white/70 mb-4">
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span className="text-white font-semibold">
                    {anomaly.current_value?.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expected:</span>
                  <span className="font-medium">{anomaly.expected_value?.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deviation:</span>
                  <span className="text-yellow-300 font-bold">
                    {anomaly.deviation_percentage?.toFixed(1)}%
                  </span>
                </div>
              </div>

              {!anomaly.acknowledged && (
                <button
                  onClick={() => handleAcknowledge(anomaly.id)}
                  className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  ✓ Acknowledge
                </button>
              )}

              {anomaly.acknowledged && (
                <div className="text-center text-sm text-white/80 font-medium bg-white/10 py-2 rounded-lg">
                  ✓ Acknowledged
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnomalyAlerts;
