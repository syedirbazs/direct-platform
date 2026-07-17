'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = 'primary',
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  accent?: 'primary' | 'accent' | 'amber' | 'rose';
  delay?: number;
}) {
  const accentMap = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    accent: 'from-accent/20 to-accent/5 text-accent',
    amber: 'from-amber-400/20 to-amber-400/5 text-amber-500',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-500',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="glass relative overflow-hidden rounded-2xl p-5">
        <div
          className={cn(
            'absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl',
            accentMap[accent]
          )}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
            {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br', accentMap[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
