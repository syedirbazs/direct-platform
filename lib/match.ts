import type { MatchScore, MatchReason } from './types';

interface WorkerLike {
  trade?: string | null;
  trade_interested?: string | null;
  city?: string | null;
  area?: string | null;
  is_verified?: boolean | null;
  years_experience?: number | null;
  completed_jobs?: number | null;
  status?: string | null;
}

interface JobLike {
  trade_required?: string | null;
  city?: string | null;
  area?: string | null;
  start_date?: string | null;
  daily_wage?: number | null;
  workers_needed?: number | null;
}

export function computeMatchScore(worker: WorkerLike, job: JobLike): MatchScore {
  const reasons: MatchReason[] = [];
  let score = 40;

  const wTrade = worker.trade || worker.trade_interested;
  const tradeMatch =
    !!wTrade &&
    !!job.trade_required &&
    wTrade.toLowerCase() === job.trade_required.toLowerCase();
  if (tradeMatch) {
    score += 28;
    reasons.push({ label: 'Skill match', matched: true });
  } else {
    reasons.push({ label: 'Skill match', matched: false });
    score -= 6;
  }

  const sameCity =
    !!worker.city && !!job.city && worker.city.toLowerCase() === job.city.toLowerCase();
  const sameArea =
    !!worker.area && !!job.area && worker.area.toLowerCase() === job.area.toLowerCase();
  if (sameArea) {
    score += 18;
    reasons.push({ label: 'Nearby location', matched: true });
  } else if (sameCity) {
    score += 12;
    reasons.push({ label: 'Same city', matched: true });
  } else {
    reasons.push({ label: 'Nearby location', matched: false });
  }

  const isAvailable = worker.status !== 'training' && worker.status !== 'rejected';
  if (isAvailable) {
    score += 12;
    reasons.push({ label: 'Available today', matched: true });
  } else {
    reasons.push({ label: 'Available today', matched: false });
  }

  if (worker.is_verified) {
    score += 8;
    reasons.push({ label: 'Verified worker', matched: true });
  } else {
    reasons.push({ label: 'Verified worker', matched: false });
  }

  if (worker.years_experience && worker.years_experience >= 3) {
    score += 6;
    reasons.push({ label: 'Experienced (3+ yrs)', matched: true });
  }

  score = Math.max(35, Math.min(99, Math.round(score)));
  return { score, reasons };
}

export function scoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 70) return 'text-sky-500';
  if (score >= 55) return 'text-amber-500';
  return 'text-rose-500';
}
