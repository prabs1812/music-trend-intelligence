import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import Card from './ui/Card';
import api from '../services/api';

const AIPredictions = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAnomalies = async () => {
    try {
      const response = await api.get('/analytics/anomalies?limit=6');
      setAnomalies(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      setLoading(false);
    }
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-pink" />;
      case 'high':
        return <TrendingUp className="w-5 h-5 text-purple" />;
      case 'medium':
        return <Zap className="w-5 h-5 text-cyan" />;
      default:
        return <Sparkles className="w-5 h-5 text-muted" />;
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'critical':
        return 'from-pink to-red-500';
      case 'high':
        return 'from-purple to-pink';
      case 'medium':
        return 'from-cyan to-purple';
      default:
        return 'from-muted to-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-muted">Loading AI predictions...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="gradient-border">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple to-pink">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">AI Predictions & Anomalies</h3>
        </div>
        <p className="text-sm text-muted">Real-time anomaly detection and trend forecasting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {anomalies.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Sparkles className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
            <p className="text-muted">No anomalies detected. All systems normal.</p>
          </div>
        ) : (
          anomalies.map((anomaly, index) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Gradient border effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getAlertColor(anomaly.alert_level)} opacity-20 rounded-xl blur-sm group-hover:opacity-30 transition-opacity`} />

              <div className="relative bg-background/80 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:border-purple/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  {getAlertIcon(anomaly.alert_level)}
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${getAlertColor(anomaly.alert_level)} text-white`}>
                    {anomaly.alert_level?.toUpperCase() || 'LOW'}
                  </span>
                </div>

                <h4 className="text-white font-semibold mb-2 truncate">
                  {anomaly.artist_name}
                </h4>

                <p className="text-sm text-muted mb-3 line-clamp-2">
                  {anomaly.description || `${anomaly.anomaly_type} detected in ${anomaly.metric}`}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Type</span>
                    <span className="text-white font-medium capitalize">
                      {anomaly.anomaly_type?.replace('_', ' ')}
                    </span>
                  </div>

                  {anomaly.deviation_percentage && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Deviation</span>
                      <span className="text-cyan font-semibold">
                        {anomaly.deviation_percentage.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {anomaly.current_value && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">Current</span>
                      <span className="text-white font-medium">
                        {typeof anomaly.current_value === 'number'
                          ? anomaly.current_value.toFixed(2)
                          : anomaly.current_value}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confidence indicator */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted">Confidence</span>
                    <span className="text-white font-medium">
                      {anomaly.z_score ? `${Math.min(95, Math.abs(anomaly.z_score) * 20).toFixed(0)}%` : 'High'}
                    </span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: anomaly.z_score ? `${Math.min(100, Math.abs(anomaly.z_score) * 20)}%` : '85%' }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${getAlertColor(anomaly.alert_level)} rounded-full`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
};

export default AIPredictions;
