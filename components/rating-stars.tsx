'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingStars({
  rating,
  size = 14,
  className = '',
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i - 0.25;
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(filled ? 'text-amber-400' : 'text-muted-foreground/30')}
            fill={filled ? 'currentColor' : 'none'}
          />
        );
      })}
      <span className="ml-1 text-xs font-semibold text-foreground">
        {rating > 0 ? rating.toFixed(1) : 'New'}
      </span>
    </div>
  );
}
