import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        return 'from-gray-800 to-black border-white/50 shadow-white/30';
      case 'high':
        return 'from-gray-700 to-gray-900 border-white/50 shadow-white/30';
      case 'medium':
        return 'from-gray-600 to-gray-800 border-white/50 shadow-white/30';
      default:
        return 'from-gray-500 to-gray-700 border-white/50 shadow-white/30';
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
    <div className="glass-card rounded-2xl p-6 card-depth">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, -15, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            🚨
          </motion.span>
          <span className="gradient-text">Anomaly Alerts</span>
        </h3>
        <div className="flex items-center space-x-3">
          <motion.span
            className="text-sm text-gray-400 font-medium"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {anomalies.length} active
          </motion.span>
          <motion.button
            onClick={fetchAnomalies}
            className="text-purple-300 hover:text-white transition-all duration-300 text-xl"
            title="Refresh"
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            🔄
          </motion.button>
        </div>
      </div>

      {anomalies.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✅
          </motion.div>
          <p className="text-gray-300 font-medium">No active anomalies detected</p>
          <p className="text-gray-500 text-sm mt-2">All systems running smoothly</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {anomalies.map((anomaly, index) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`group bg-gradient-to-br ${getAlertLevelColor(anomaly.alert_level)} rounded-xl p-4 border shadow-lg cursor-pointer relative overflow-hidden ${
                  anomaly.acknowledged ? 'opacity-60' : ''
                }`}
              >
                {/* Pulse effect for critical */}
                {anomaly.alert_level === 'critical' && !anomaly.acknowledged && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className="flex items-center space-x-2">
                    <motion.span
                      className="text-2xl"
                      animate={anomaly.alert_level === 'critical' ? { rotate: [0, -15, 15, -15, 0] } : {}}
                      transition={{ duration: 0.5, repeat: anomaly.alert_level === 'critical' ? Infinity : 0, repeatDelay: 1 }}
                    >
                      {getAlertIcon(anomaly.alert_level)}
                    </motion.span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase bg-white/20 text-white">
                      {anomaly.alert_level}
                    </span>
                  </div>
                  {!anomaly.acknowledged && (
                    <motion.button
                      onClick={() => handleDismiss(anomaly.id)}
                      className="text-white/60 hover:text-white transition text-lg"
                      title="Dismiss"
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  )}
                </div>

                <h4 className="text-white font-bold mb-2 text-lg relative z-10">{anomaly.artist_name}</h4>
                <p className="text-sm text-white/80 mb-3 leading-relaxed relative z-10">{anomaly.description}</p>

                <div className="space-y-1.5 text-xs text-white/70 mb-4 relative z-10">
                  <motion.div
                    className="flex justify-between"
                    whileHover={{ x: 5 }}
                  >
                    <span>Current:</span>
                    <span className="text-white font-semibold">
                      {anomaly.current_value?.toFixed(0)}
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    whileHover={{ x: 5 }}
                  >
                    <span>Expected:</span>
                    <span className="font-medium">{anomaly.expected_value?.toFixed(0)}</span>
                  </motion.div>
                  <motion.div
                    className="flex justify-between"
                    whileHover={{ x: 5 }}
                  >
                    <span>Deviation:</span>
                    <span className="text-gray-200 font-bold">
                      {anomaly.deviation_percentage?.toFixed(1)}%
                    </span>
                  </motion.div>
                </div>

                {!anomaly.acknowledged && (
                  <motion.button
                    onClick={() => handleAcknowledge(anomaly.id)}
                    className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg relative z-10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✓ Acknowledge
                  </motion.button>
                )}

                {anomaly.acknowledged && (
                  <div className="text-center text-sm text-white/80 font-medium bg-white/10 py-2 rounded-lg relative z-10">
                    ✓ Acknowledged
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AnomalyAlerts;
