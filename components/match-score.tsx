'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { scoreColor } from '@/lib/match';
import type { MatchScore } from '@/lib/types';
import { cn } from '@/lib/utils';

export function MatchScoreBadge({ score, compact = false }: { score: number; compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
        score >= 85
          ? 'bg-emerald-500/15 text-emerald-500'
          : score >= 70
            ? 'bg-sky-500/15 text-sky-500'
            : score >= 55
              ? 'bg-amber-500/15 text-amber-500'
              : 'bg-rose-500/15 text-rose-500'
      )}
    >
      {score}% Match
    </span>
  );
}

export function MatchScoreCard({ match }: { match: MatchScore }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">AI Match Score</span>
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn('font-display text-3xl font-extrabold', scoreColor(match.score))}
        >
          {match.score}%
        </motion.span>
      </div>
      <div className="mt-4 space-y-2">
        {match.reasons.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{r.label}</span>
            {r.matched ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground/40" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
