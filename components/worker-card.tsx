'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, BadgeCheck, Wrench, Clock, IndianRupee, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface WorkerSummary {
  id: string;
  full_name: string;
  trade: string | null;
  trade_interested: string | null;
  city: string | null;
  area: string | null;
  rating: number;
  years_experience: number;
  is_verified: boolean;
  completed_jobs: number;
  price_from: number;
  available_today: boolean;
  profile_photo_url: string | null;
  skills?: string | null;
}

export function WorkerCard({
  worker,
  distanceKm,
  onBook,
  matchScore,
  href,
}: {
  worker: WorkerSummary;
  distanceKm?: number;
  onBook?: () => void;
  matchScore?: number;
  href?: string;
}) {
  const initials = (worker.full_name || 'W')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const trade = worker.trade || worker.trade_interested || 'Worker';

  const content = (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <Card className="glass group h-full overflow-hidden p-5 transition-shadow hover:shadow-glow">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 ring-2 ring-border/50">
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-accent/80 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-display font-bold">{worker.full_name}</h3>
              {worker.is_verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-sky-500" aria-label="Verified" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{trade}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {worker.area ? `${worker.area}, ` : ''}{worker.city ?? 'Location n/a'}
              </span>
              {typeof distanceKm === 'number' && (
                <Badge variant="secondary" className="ml-1">{distanceKm.toFixed(1)} km</Badge>
              )}
            </div>
          </div>
          {matchScore != null && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-bold',
                matchScore >= 85
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : matchScore >= 70
                    ? 'bg-sky-500/15 text-sky-500'
                    : 'bg-amber-500/15 text-amber-500'
              )}
            >
              {matchScore}%
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-foreground">
              {worker.rating > 0 ? worker.rating.toFixed(1) : 'New'}
            </span>
            <span>rating</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wrench className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">{worker.years_experience}</span>
            <span>yrs exp</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">{worker.completed_jobs}</span>
            <span>jobs</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span
              className={cn(
                'font-semibold',
                worker.available_today ? 'text-emerald-500' : 'text-muted-foreground'
              )}
            >
              {worker.available_today ? 'Available' : 'Busy'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm">
            <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-display font-bold">{worker.price_from || '—'}</span>
            <span className="text-xs text-muted-foreground">/day</span>
          </div>
          {onBook && (
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent text-white"
              onClick={(e) => {
                e.preventDefault();
                onBook();
              }}
            >
              Book now
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
