import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { cn } from '../lib/utils';

const StatCard = ({ icon: Icon, label, value, trend, trendValue, gradient, delay = 0 }) => {
  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "p-3 rounded-xl",
              gradient || "bg-gradient-to-br from-purple to-cyan"
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-muted font-medium">{label}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-white">
              {typeof value === 'number' ? (
                <CountUp end={value} duration={2} separator="," />
              ) : (
                value
              )}
            </h3>

            {trendValue && (
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-semibold",
                  isPositive ? "text-cyan" : "text-pink"
                )}>
                  {isPositive ? '↑' : '↓'} {trendValue}
                </span>
                <span className="text-xs text-muted">vs last period</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
