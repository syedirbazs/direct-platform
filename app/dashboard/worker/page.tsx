'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BadgeCheck, Clock, Briefcase, Star, MapPin, Phone, Calendar,
  GraduationCap, ChevronRight, AlertCircle, Wrench, TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { ProtectedShell } from '@/components/protected-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard, EmptyState } from '@/components/stat-card';
import { RatingStars } from '@/components/rating-stars';
import { toast } from 'sonner';

interface WorkerRow {
  id: string;
  full_name: string;
  trade: string | null;
  trade_interested: string | null;
  skill_level: string | null;
  status: string;
  is_verified: boolean;
  years_experience: number;
  experience: string | null;
  skills: string | null;
  city: string | null;
  area: string | null;
  phone: string | null;
  rating: number;
  completed_jobs: number;
  price_from: number;
  available_today: boolean;
  profile_photo_url: string | null;
}

interface ApprenticeshipRow {
  id: string;
  progress: number;
  attendance_count: number;
  training_days: number;
  start_date: string;
  end_date: string | null;
  status: string;
  trade_interested: string | null;
  preferred_area: string | null;
  language: string | null;
  trainer_worker_id: string | null;
}

interface TrainerRow {
  id: string;
  full_name: string;
  trade: string | null;
  area: string | null;
  rating: number;
  years_experience: number;
  phone: string | null;
  is_verified: boolean;
}

interface JobOfferRow {
  id: string;
  trade: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  budget: number | null;
  city: string | null;
  area: string | null;
  notes: string | null;
  status: string;
}

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [worker, setWorker] = React.useState<WorkerRow | null>(null);
  const [apprenticeship, setApprenticeship] = React.useState<ApprenticeshipRow | null>(null);
  const [trainer, setTrainer] = React.useState<TrainerRow | null>(null);
  const [offers, setOffers] = React.useState<JobOfferRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!user) return;
    const { data: w } = await supabase
      .from('workers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setWorker(w as WorkerRow | null);

    if (w && w.skill_level === 'unskilled') {
      const { data: app } = await supabase
        .from('apprenticeships')
        .select('*')
        .eq('worker_id', w.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setApprenticeship(app as ApprenticeshipRow | null);
      if (app?.trainer_worker_id) {
        const { data: tr } = await supabase
          .from('workers')
          .select('id, full_name, trade, area, rating, years_experience, phone, is_verified')
          .eq('id', app.trainer_worker_id)
          .maybeSingle();
        setTrainer(tr as TrainerRow | null);
      }
    }

    if (w) {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('worker_id', w.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      setOffers((bookings ?? []) as JobOfferRow[]);
    }
    setLoading(false);
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  const respondOffer = async (id: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === 'accepted' ? 'Job accepted' : 'Job declined');
    setOffers((o) => o.filter((x) => x.id !== id));
  };

  if (loading) {
    return (
      <ProtectedShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">Loading your dashboard…</div>
      </ProtectedShell>
    );
  }

  if (!worker) {
    return (
      <ProtectedShell>
        <EmptyState
          icon={Wrench}
          title="Complete your worker profile"
          description="You haven't finished onboarding yet. Choose your trade and verification path."
          action={
            <Link href="/onboarding/worker">
              <Button className="bg-gradient-to-r from-primary to-accent text-white">Start onboarding</Button>
            </Link>
          }
        />
      </ProtectedShell>
    );
  }

  const isUnskilled = worker.skill_level === 'unskilled';
  const isTraining = worker.status === 'training';
  const isVerified = worker.is_verified;
  const trade = worker.trade || worker.trade_interested || 'Worker';

  return (
    <ProtectedShell title="Worker Dashboard" subtitle={worker.full_name}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card className="glass flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white text-lg font-bold">
              {worker.full_name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold">{worker.full_name}</h2>
                {isVerified && <BadgeCheck className="h-5 w-5 text-sky-500" />}
              </div>
              <p className="text-sm text-muted-foreground">{trade} · {worker.area ?? ''}{worker.area && worker.city ? ', ' : ''}{worker.city ?? ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isVerified ? (
              <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15">
                <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Verified
              </Badge>
            ) : isTraining ? (
              <Badge className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/15">
                <GraduationCap className="mr-1 h-3.5 w-3.5" /> Training
              </Badge>
            ) : worker.status === 'pending' ? (
              <Badge className="bg-sky-500/15 text-sky-500 hover:bg-sky-500/15">
                <Clock className="mr-1 h-3.5 w-3.5" /> Pending review
              </Badge>
            ) : worker.status === 'rejected' ? (
              <Badge variant="destructive">Rejected</Badge>
            ) : null}
          </div>
        </Card>
      </motion.div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Rating" value={worker.rating > 0 ? worker.rating.toFixed(1) : 'New'} icon={Star} accent="amber" delay={0} />
        <StatCard label="Completed jobs" value={worker.completed_jobs} icon={Briefcase} accent="accent" delay={0.05} />
        <StatCard label="Years experience" value={worker.years_experience} icon={TrendingUp} accent="primary" delay={0.1} />
        <StatCard label="Status" value={isVerified ? 'Verified' : isTraining ? 'Training' : 'Pending'} icon={BadgeCheck} accent={isVerified ? 'accent' : 'amber'} delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {isVerified && (
            <Card className="glass p-6">
              <h3 className="mb-4 font-display text-lg font-bold">Your verified profile</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={Wrench} label="Trade" value={trade} />
                <InfoRow icon={Star} label="Rating" value={<RatingStars rating={worker.rating} />} />
                <InfoRow icon={Briefcase} label="Experience" value={`${worker.years_experience} yrs`} />
                <InfoRow icon={Briefcase} label="Completed jobs" value={String(worker.completed_jobs)} />
                <InfoRow icon={MapPin} label="Location" value={`${worker.area ?? '—'}, ${worker.city ?? '—'}`} />
                <InfoRow icon={Phone} label="Phone" value={worker.phone ?? '—'} />
              </div>
              {worker.skills && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {worker.skills.split(',').map((s) => (
                      <Badge key={s} variant="secondary">{s.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {!isVerified && !isTraining && worker.status === 'pending' && (
            <Card className="glass p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-sky-500" />
                <div>
                  <h3 className="font-display text-lg font-bold">Verification in review</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Our team is reviewing your documents and details. You'll get a
                    notification when your verified badge is approved — usually within 24 hours.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {worker.status === 'rejected' && (
            <Card className="glass border-destructive/40 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-display text-lg font-bold">Verification rejected</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your submission was rejected. Please re-submit with clearer documents.
                  </p>
                  <Link href="/onboarding/worker" className="mt-3 inline-block">
                    <Button variant="outline" size="sm">Re-submit</Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          <Card className="glass p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Job offers</h3>
              <Badge variant="secondary">{offers.length} pending</Badge>
            </div>
            {offers.length === 0 ? (
              <EmptyState icon={Briefcase} title="No job offers yet" description="Once homeowners book you, their requests will appear here." />
            ) : (
              <div className="space-y-3">
                {offers.map((o) => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{o.trade ?? 'Job'} · {o.area ?? o.city ?? 'Location'}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          <Calendar className="mr-1 inline h-3.5 w-3.5" />
                          {o.scheduled_date ?? 'Date TBD'} {o.scheduled_time && `at ${o.scheduled_time}`}
                          {o.budget != null && ` · ₹${o.budget}`}
                        </p>
                        {o.notes && <p className="mt-1 text-sm text-muted-foreground">{o.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white" onClick={() => respondOffer(o.id, 'accepted')}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => respondOffer(o.id, 'rejected')}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {isUnskilled && apprenticeship && (
            <ApprenticeshipPanel
              apprenticeship={apprenticeship}
              trainer={trainer}
              workerId={worker.id}
              onUpdate={load}
            />
          )}

          <Card className="glass p-6">
            <h3 className="mb-3 font-display text-lg font-bold">Quick links</h3>
            <div className="space-y-2">
              <QuickLink href="/notifications" icon={Clock} label="Notifications" />
              <QuickLink href="/onboarding/worker" icon={Wrench} label="Update profile" />
            </div>
          </Card>
        </div>
      </div>
    </ProtectedShell>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-lg p-2 text-sm transition-colors hover:bg-muted">
      <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /> {label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function ApprenticeshipPanel({
  apprenticeship, trainer, workerId, onUpdate,
}: {
  apprenticeship: ApprenticeshipRow;
  trainer: TrainerRow | null;
  workerId: string;
  onUpdate: () => void;
}) {
  const [attendance, setAttendance] = React.useState<{ date: string; status: string }[]>([]);
  const [marking, setMarking] = React.useState(false);

  const loadAttendance = React.useCallback(async () => {
    const { data } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('apprenticeship_id', apprenticeship.id)
      .order('date', { ascending: true });
    setAttendance((data ?? []) as { date: string; status: string }[]);
  }, [apprenticeship.id]);

  React.useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const markToday = async () => {
    setMarking(true);
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from('attendance')
      .upsert({ apprenticeship_id: apprenticeship.id, date: today, status: 'present' }, { onConflict: 'apprenticeship_id,date' });
    if (error) { toast.error(error.message); setMarking(false); return; }

    const newCount = attendance.find((a) => a.date === today) ? attendance.length : attendance.length + 1;
    const progress = Math.min(100, Math.round((newCount / apprenticeship.training_days) * 100));
    const completed = progress >= 100;
    await supabase.from('apprenticeships').update({
      attendance_count: newCount,
      progress,
      status: completed ? 'completed' : 'training',
    }).eq('id', apprenticeship.id);

    if (completed) {
      await supabase.from('workers').update({ is_verified: true, status: 'completed' }).eq('id', workerId);
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from('notifications').insert({
          user_id: u.user.id,
          type: 'badge_approved',
          title: 'Verified badge approved!',
          body: 'You completed your 15-day apprenticeship. You are now a verified worker.',
        });
      }
      toast.success('Verified badge earned!');
    } else {
      toast.success('Attendance marked for today');
    }
    setMarking(false);
    loadAttendance();
    onUpdate();
  };

  const progress = Number(apprenticeship.progress);
  const daysLeft = Math.max(0, apprenticeship.training_days - apprenticeship.attendance_count);
  const completed = apprenticeship.status === 'completed';

  return (
    <Card className="glass p-6">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-accent" />
        <h3 className="font-display text-lg font-bold">Apprenticeship</h3>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="mt-1.5 h-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            Day {apprenticeship.attendance_count} of {apprenticeship.training_days} · {daysLeft} days left
          </p>
        </div>

        {trainer && (
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs text-muted-foreground">Your trainer</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white font-bold">
                {trainer.full_name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{trainer.full_name}</p>
                <p className="text-xs text-muted-foreground">{trainer.trade} · {trainer.area}</p>
              </div>
              {trainer.is_verified && <BadgeCheck className="h-4 w-4 text-sky-500" />}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div><p className="text-muted-foreground">Rating</p><p className="font-semibold">{trainer.rating.toFixed(1)}</p></div>
              <div><p className="text-muted-foreground">Experience</p><p className="font-semibold">{trainer.years_experience}y</p></div>
              <div><p className="text-muted-foreground">Phone</p><p className="font-semibold truncate">{trainer.phone}</p></div>
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">Attendance tracker</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: apprenticeship.training_days }).map((_, i) => {
              const day = i + 1;
              const rec = attendance[i];
              const state = rec?.status ?? 'none';
              return (
                <div
                  key={day}
                  title={`Day ${day}${rec ? ` · ${rec.status}` : ''}`}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold ${
                    state === 'present' ? 'bg-emerald-500 text-white' :
                    state === 'late' ? 'bg-amber-500 text-white' :
                    state === 'absent' ? 'bg-rose-500 text-white' :
                    day <= apprenticeship.attendance_count ? 'bg-muted text-muted-foreground' :
                    'bg-muted/40 text-muted-foreground/40'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-muted/50 p-3 text-xs">
          <p className="text-muted-foreground">Training calendar</p>
          <p className="mt-0.5 font-medium">
            {apprenticeship.start_date} → {apprenticeship.end_date ?? 'TBD'}
          </p>
        </div>

        {!completed ? (
          <Button onClick={markToday} disabled={marking} className="w-full bg-gradient-to-r from-accent to-emerald-400 text-white">
            {marking ? 'Marking…' : 'Mark today present'}
          </Button>
        ) : (
          <div className="rounded-xl bg-emerald-500/15 p-3 text-center text-sm font-semibold text-emerald-500">
            <BadgeCheck className="mr-1 inline h-4 w-4" /> Apprenticeship complete — badge earned!
          </div>
        )}
      </div>
    </Card>
  );
}
