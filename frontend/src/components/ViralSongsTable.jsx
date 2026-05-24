import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import Card from './ui/Card';
import { api } from '../services/api';

const ViralSongsTable = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const response = await api.get('/trends/history?hours=24');
      // Group by artist and aggregate
      const trendMap = {};
      (response.data || []).forEach(trend => {
        if (!trendMap[trend.artist_name]) {
          trendMap[trend.artist_name] = {
            artist: trend.artist_name,
            streams: 0,
            engagement: 0,
            sentiment: 0,
            count: 0,
          };
        }
        trendMap[trend.artist_name].streams += trend.engagement?.views || 0;
        trendMap[trend.artist_name].engagement += (trend.engagement?.likes || 0) + (trend.engagement?.comments || 0);
        trendMap[trend.artist_name].sentiment += trend.sentiment_score || 0;
        trendMap[trend.artist_name].count += 1;
      });

      const trendsArray = Object.values(trendMap).map(item => ({
        ...item,
        sentiment: item.sentiment / item.count,
        growth: Math.random() * 50 + 5, // Mock growth percentage
      })).slice(0, 10);

      setTrends(trendsArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trends:', error);
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });

    const sorted = [...trends].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setTrends(sorted);
  };

  if (loading) {
    return (
      <Card>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-muted">Loading viral songs...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glow">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Music className="w-5 h-5 text-pink" />
          <h3 className="text-xl font-bold text-white">Viral Trends</h3>
        </div>
        <p className="text-sm text-muted">Top trending artists and their performance metrics</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-4 text-sm font-semibold text-muted">Rank</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-muted">Artist</th>
              <th
                className="text-right py-4 px-4 text-sm font-semibold text-muted cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('streams')}
              >
                <div className="flex items-center justify-end gap-2">
                  Streams
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th
                className="text-right py-4 px-4 text-sm font-semibold text-muted cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('engagement')}
              >
                <div className="flex items-center justify-end gap-2">
                  Engagement
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th
                className="text-right py-4 px-4 text-sm font-semibold text-muted cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('growth')}
              >
                <div className="flex items-center justify-end gap-2">
                  Growth
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-muted">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {trends.map((trend, index) => (
              <motion.tr
                key={trend.artist}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="py-4 px-4">
                  <span className="text-white font-bold text-lg">#{index + 1}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple to-cyan flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium group-hover:text-purple transition-colors">
                      {trend.artist}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-white font-semibold">
                    {trend.streams.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-white font-semibold">
                    {trend.engagement.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {trend.growth > 0 ? (
                      <TrendingUp className="w-4 h-4 text-cyan" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-pink" />
                    )}
                    <span className={`font-semibold ${trend.growth > 0 ? 'text-cyan' : 'text-pink'}`}>
                      {trend.growth > 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5">
                    <div className={`w-2 h-2 rounded-full ${
                      trend.sentiment > 0.3 ? 'bg-cyan' :
                      trend.sentiment < -0.3 ? 'bg-pink' :
                      'bg-muted'
                    }`} />
                    <span className="text-white text-sm font-medium">
                      {trend.sentiment > 0 ? 'Positive' : trend.sentiment < 0 ? 'Negative' : 'Neutral'}
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ViralSongsTable;
