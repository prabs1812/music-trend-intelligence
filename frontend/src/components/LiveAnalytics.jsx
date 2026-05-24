import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Users, Music } from 'lucide-react';
import StatCard from './StatCard';
import Card from './ui/Card';
import api from '../services/api';

const LiveAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [engagement, sentiment] = await Promise.all([
        api.get('/analytics/engagement?hours=24'),
        api.get('/analytics/sentiment?hours=24')
      ]);

      setAnalyticsData(engagement.data);

      // Transform sentiment data for chart
      if (sentiment.data && sentiment.data.length > 0) {
        const transformed = sentiment.data.slice(-12).map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          sentiment: (item.avg_sentiment * 100).toFixed(1),
          positive: item.positive_count,
          negative: item.negative_count,
        }));
        setChartData(transformed);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card h-32 animate-pulse" />
          ))}
        </div>
        <div className="glass-card h-80 animate-pulse" />
      </div>
    );
  }

  const totalEngagement = analyticsData?.total_views || 0;
  const totalLikes = analyticsData?.total_likes || 0;
  const totalComments = analyticsData?.total_comments || 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Activity}
          label="Total Engagement"
          value={totalEngagement}
          trend="up"
          trendValue="+12.5%"
          gradient="bg-gradient-to-br from-purple to-pink"
          delay={0}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Likes"
          value={totalLikes}
          trend="up"
          trendValue="+8.3%"
          gradient="bg-gradient-to-br from-cyan to-purple"
          delay={0.1}
        />
        <StatCard
          icon={Users}
          label="Total Comments"
          value={totalComments}
          trend="up"
          trendValue="+15.7%"
          gradient="bg-gradient-to-br from-pink to-cyan"
          delay={0.2}
        />
      </div>

      {/* Sentiment Chart */}
      <Card variant="glow">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-5 h-5 text-purple" />
            <h3 className="text-xl font-bold text-white">Live Sentiment Analysis</h3>
          </div>
          <p className="text-sm text-muted">Real-time sentiment tracking across all sources</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94A3B8"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(11, 15, 25, 0.95)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
              }}
              labelStyle={{ color: '#F8FAFC' }}
            />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="url(#sentimentGradient)"
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', r: 4 }}
              activeDot={{ r: 6, fill: '#06B6D4' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default LiveAnalytics;
