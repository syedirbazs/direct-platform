'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  Building2, Briefcase, Users, CheckCircle2, XCircle, TrendingUp,
  Plus, ArrowRight, BadgeCheck, MapPin, IndianRupee, Calendar,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { ProtectedShell } from '@/components/protected-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard, EmptyState } from '@/components/stat-card';
import { MatchScoreBadge } from '@/components/match-score';
import { toast } from 'sonner';

interface JobRow {
  id: string;
  trade_required: string | null;
  workers_needed: number;
  start_date: string | null;
  end_date: string | null;
  daily_wage: number | null;
  working_hours: string | null;
  description: string | null;
  city: string | null;
  area: string | null;
  status: string;
  created_at: string;
}

interface AppWorker {
  id: string;
  full_name: string;
  trade: string | null;
  area: string | null;
  city: string | null;
  rating: number;
  is_verified: boolean;
  years_experience: number;
}

interface ApplicationRow {
  id: string;
  job_id: string;
  worker_id: string;
  match_score: number;
  match_reasons: { label: string; matched: boolean }[] | null;
  status: string;
  created_at: string;
  worker: AppWorker;
}

export default function OrganisationDashboard() {
  const { user } = useAuth();
  const [org, setOrg] = React.useState<{ id: string; company_name: string; industry: string | null } | null>(null);
  const [jobs, setJobs] = React.useState<JobRow[]>([]);
  const [apps, setApps] = React.useState<ApplicationRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!user) return;
    const { data: o } = await supabase
      .from('organisations')
      .select('id, company_name, industry')
      .eq('user_id', user.id)
      .maybeSingle();
    setOrg(o as typeof org);
    if (o) {
      const { data: j } = await supabase
        .from('jobs')
        .select('*')
        .eq('organisation_id', o.id)
        .order('created_at', { ascending: false });
      setJobs((j ?? []) as JobRow[]);
      const { data: a } = await supabase
        .from('applications')
        .select('id, job_id, worker_id, match_score, match_reasons, status, created_at, worker:workers!applications_worker_id_fkey(id, full_name, trade, area, city, rating, is_verified, years_experience)')
        .in('job_id', (j ?? []).map((x) => x.id))
        .order('created_at', { ascending: false });
      const normalized: ApplicationRow[] = ((a ?? []) as unknown as Array<Omit<ApplicationRow, 'worker'> & { worker: AppWorker | AppWorker[] }>).map((row) => ({
        ...row,
        worker: Array.isArray(row.worker) ? row.worker[0] : row.worker,
      }));
      setApps(normalized);
    }
    setLoading(false);
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  const respondApp = async (appId: string, workerId: string, workerUserId: string | null, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
    if (error) { toast.error(error.message); return; }
    if (workerUserId) {
      await supabase.from('notifications').insert({
        user_id: workerUserId,
        type: status === 'accepted' ? 'worker_accepted' : 'worker_declined',
        title: status === 'accepted' ? 'Application accepted!' : 'Application declined',
        body: `An organisation has ${status} your application.`,
      });
    }
    toast.success(status === 'accepted' ? 'Worker accepted' : 'Worker declined');
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
  };

  if (loading) {
    return (
      <ProtectedShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">Loading…</div>
      </ProtectedShell>
    );
  }

  if (!org) {
    return (
      <ProtectedShell>
        <EmptyState
          icon={Building2}
          title="Register your company"
          description="Complete your organisation profile to start posting jobs."
          action={<Link href="/onboarding/organisation"><Button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">Register now</Button></Link>}
        />
      </ProtectedShell>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === 'active');
  const pending = apps.filter((a) => a.status === 'pending');
  const accepted = apps.filter((a) => a.status === 'accepted');
  const rejected = apps.filter((a) => a.status === 'rejected');

  // analytics data
  const tradeData = React.useMemo(() => {
    const map: Record<string, number> = {};
    jobs.forEach((j) => { const t = j.trade_required ?? 'Other'; map[t] = (map[t] ?? 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  const appsTrend = React.useMemo(() => {
    const days = 7;
    const out: { day: string; applications: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = apps.filter((a) => a.created_at.slice(0, 10) === key).length;
      out.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), applications: count });
    }
    return out;
  }, [apps]);

  const statusData = [
    { name: 'Pending', value: pending.length, color: 'hsl(38 92% 50%)' },
    { name: 'Accepted', value: accepted.length, color: 'hsl(160 84% 39%)' },
    { name: 'Rejected', value: rejected.length, color: 'hsl(0 84% 60%)' },
  ].filter((d) => d.value > 0);

  const hasAnalytics = jobs.length > 0 || apps.length > 0;

  return (
    <ProtectedShell title={org.company_name} subtitle="Organisation Dashboard">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active jobs" value={activeJobs.length} icon={Briefcase} accent="amber" delay={0} />
        <StatCard label="Applicants" value={pending.length} icon={Users} accent="primary" delay={0.05} />
        <StatCard label="Accepted" value={accepted.length} icon={CheckCircle2} accent="accent" delay={0.1} />
        <StatCard label="Rejected" value={rejected.length} icon={XCircle} accent="rose" delay={0.15} />
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="glass">
            <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <Link href="/dashboard/organisation/jobs">
            <Button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
              <Plus className="mr-2 h-4 w-4" /> Post a job
            </Button>
          </Link>
        </div>

        {/* ACTIVE JOBS */}
        <TabsContent value="jobs" className="space-y-4">
          {jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs posted yet"
              description="Post your first job to start receiving applications from verified workers."
              action={<Link href="/dashboard/organisation/jobs"><Button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">Post a job</Button></Link>}
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {jobs.map((j, i) => {
                const jobApps = apps.filter((a) => a.job_id === j.id);
                return (
                  <motion.div key={j.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="glass h-full p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-lg font-bold">{j.trade_required ?? 'Job'}</h3>
                            <JobStatusBadge status={j.status} />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <MapPin className="mr-1 inline h-3.5 w-3.5" />
                            {j.area ? `${j.area}, ` : ''}{j.city ?? 'Location'}
                          </p>
                        </div>
                        <Badge variant="secondary">{j.workers_needed} needed</Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                        <div><p className="text-muted-foreground">Wage/day</p><p className="font-semibold">₹{j.daily_wage ?? '—'}</p></div>
                        <div><p className="text-muted-foreground">Start</p><p className="font-semibold">{j.start_date ?? '—'}</p></div>
                        <div><p className="text-muted-foreground">End</p><p className="font-semibold">{j.end_date ?? '—'}</p></div>
                      </div>
                      {j.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{j.description}</p>}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{jobApps.length} applicants</span>
                        <span className="text-xs text-muted-foreground">{jobApps.filter((a) => a.status === 'accepted').length} accepted</span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* APPLICANTS */}
        <TabsContent value="applicants" className="space-y-4">
          {apps.length === 0 ? (
            <EmptyState icon={Users} title="No applicants yet" description="Applications to your job posts will appear here with AI match scores." />
          ) : (
            <div className="space-y-3">
              {apps.map((a, i) => {
                const job = jobs.find((j) => j.id === a.job_id);
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="glass p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white font-bold">
                            {a.worker?.full_name?.split(' ').map((s) => s[0]).slice(0, 2).join('') ?? 'W'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold">{a.worker?.full_name}</p>
                              {a.worker?.is_verified && <BadgeCheck className="h-4 w-4 text-sky-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {a.worker?.trade} · {a.worker?.area}, {a.worker?.city}
                              {' · '}{a.worker?.years_experience}y exp · {a.worker?.rating.toFixed(1)}★
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Applied for: {job?.trade_required ?? 'Job'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MatchScoreBadge score={a.match_score} />
                          {a.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-gradient-to-r from-accent to-emerald-400 text-white" onClick={() => respondApp(a.id, a.worker_id, null, 'accepted')}>
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => respondApp(a.id, a.worker_id, null, 'rejected')}>
                                Reject
                              </Button>
                            </div>
                          )}
                          {a.status === 'accepted' && <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15">Accepted</Badge>}
                          {a.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                        </div>
                      </div>
                      {a.match_reasons && a.match_reasons.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {a.match_reasons.map((r) => (
                            <span key={r.label} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${r.matched ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                              {r.matched ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {r.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="space-y-4">
          {!hasAnalytics ? (
            <EmptyState icon={TrendingUp} title="No analytics yet" description="Post jobs and receive applications to see charts and insights here." />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="glass p-6">
                <h3 className="mb-4 font-display text-lg font-bold">Applications this week</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={appsTrend}>
                    <defs>
                      <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                    <Area type="monotone" dataKey="applications" stroke="hsl(199 89% 48%)" strokeWidth={2} fill="url(#appGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="glass p-6">
                <h3 className="mb-4 font-display text-lg font-bold">Jobs by trade</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={tradeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                    <Bar dataKey="value" fill="hsl(38 92% 50%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="glass p-6">
                <h3 className="mb-4 font-display text-lg font-bold">Application status</h3>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                        {statusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="py-16 text-center text-sm text-muted-foreground">No applications yet.</p>}
                <div className="mt-2 flex justify-center gap-4">
                  {statusData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass p-6">
                <h3 className="mb-4 font-display text-lg font-bold">Summary</h3>
                <div className="space-y-3">
                  <SummaryRow label="Total jobs posted" value={jobs.length} />
                  <SummaryRow label="Active jobs" value={activeJobs.length} />
                  <SummaryRow label="Total applicants" value={apps.length} />
                  <SummaryRow label="Acceptance rate" value={apps.length ? `${Math.round((accepted.length / apps.length) * 100)}%` : '—'} />
                  <SummaryRow label="Avg match score" value={apps.length ? `${Math.round(apps.reduce((s, a) => s + a.match_score, 0) / apps.length)}%` : '—'} />
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ProtectedShell>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  if (status === 'active') return <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15">Active</Badge>;
  if (status === 'filled') return <Badge className="bg-sky-500/15 text-sky-500 hover:bg-sky-500/15">Filled</Badge>;
  return <Badge variant="secondary">Closed</Badge>;
}

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
