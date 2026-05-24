import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Card = ({
  children,
  className,
  variant = 'default',
  hover = true,
  ...props
}) => {
  const variants = {
    default: 'glass-card',
    'gradient-border': 'gradient-border backdrop-blur-xl p-6',
    glow: 'glass-card hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        variants[variant],
        hover && 'transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
