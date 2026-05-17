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
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
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
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🚨 Anomaly Alerts</h3>
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">🚨 Anomaly Alerts</h3>
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchAnomalies}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">🚨 Anomaly Alerts</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {anomalies.length} active
          </span>
          <button
            onClick={fetchAnomalies}
            className="text-gray-400 hover:text-white transition"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {anomalies.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">✅</div>
          <p>No active anomalies detected</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`bg-gray-700/50 rounded-lg p-4 border-l-4 ${
                anomaly.alert_level === 'critical'
                  ? 'border-red-500'
                  : anomaly.alert_level === 'high'
                  ? 'border-orange-500'
                  : anomaly.alert_level === 'medium'
                  ? 'border-yellow-500'
                  : 'border-blue-500'
              } ${anomaly.acknowledged ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getAnomalyIcon(anomaly.anomaly_type)}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold uppercase ${getAlertLevelColor(
                      anomaly.alert_level
                    )}`}
                  >
                    {anomaly.alert_level}
                  </span>
                </div>
                {!anomaly.acknowledged && (
                  <button
                    onClick={() => handleDismiss(anomaly.id)}
                    className="text-gray-400 hover:text-white transition"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                )}
              </div>

              <h4 className="text-white font-semibold mb-1">{anomaly.artist_name}</h4>
              <p className="text-sm text-gray-300 mb-3">{anomaly.description}</p>

              <div className="space-y-1 text-xs text-gray-400 mb-3">
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span className="text-white font-semibold">
                    {anomaly.current_value?.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expected:</span>
                  <span>{anomaly.expected_value?.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deviation:</span>
                  <span className="text-orange-400 font-semibold">
                    {anomaly.deviation_percentage?.toFixed(1)}%
                  </span>
                </div>
              </div>

              {!anomaly.acknowledged && (
                <button
                  onClick={() => handleAcknowledge(anomaly.id)}
                  className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                >
                  Acknowledge
                </button>
              )}

              {anomaly.acknowledged && (
                <div className="text-center text-xs text-green-400">
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
