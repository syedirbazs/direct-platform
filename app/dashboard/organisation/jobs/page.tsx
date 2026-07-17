'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Plus, Loader2, CheckCircle2, Users, ArrowRight, BadgeCheck, MapPin, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { ProtectedShell } from '@/components/protected-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/field';
import { WorkerCard, type WorkerSummary } from '@/components/worker-card';
import { TRADES, type Trade } from '@/lib/types';
import { computeMatchScore } from '@/lib/match';
import { cn } from '@/lib/utils';

interface JobDraft {
  trade_required: Trade | '';
  workers_needed: string;
  start_date: string;
  end_date: string;
  daily_wage: string;
  working_hours: string;
  description: string;
  city: string;
  area: string;
}

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orgId, setOrgId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [posted, setPosted] = React.useState(false);
  const [matches, setMatches] = React.useState<(WorkerSummary & { score: number })[]>([]);
  const [form, setForm] = React.useState<JobDraft>({
    trade_required: '', workers_needed: '1', start_date: '', end_date: '',
    daily_wage: '500', working_hours: '9 AM - 6 PM', description: '',
    city: 'Mumbai', area: '',
  });

  // load org
  React.useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from('organisations').select('id').eq('user_id', user.id).maybeSingle();
      if (data) {
        setOrgId(data.id);
      }
    })();
  }, [user]);

  // live AI matches as the form changes
  React.useEffect(() => {
    if (!form.trade_required) { setMatches([]); return; }
    (async () => {
      const { data } = await supabase
        .from('workers')
        .select('*')
        .eq('is_verified', true)
        .ilike('trade', `%${form.trade_required}%`)
        .order('rating', { ascending: false })
        .limit(6);
      const rows = (data ?? []) as WorkerSummary[];
      const scored = rows
        .map((w) => {
          const m = computeMatchScore(w, {
            trade_required: form.trade_required || undefined,
            city: form.city || undefined,
            area: form.area || undefined,
            daily_wage: form.daily_wage ? Number(form.daily_wage) : undefined,
          });
          return { ...w, score: m.score };
        })
        .sort((a, b) => b.score - a.score);
      setMatches(scored);
    })();
  }, [form.trade_required, form.city, form.area, form.daily_wage]);

  const update = (k: keyof JobDraft, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!user || !orgId) { toast.error('Organisation profile not found'); return; }
    if (!form.trade_required || !form.start_date || !form.city) {
      toast.error('Trade, start date, and city are required');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('jobs').insert({
      organisation_id: orgId,
      user_id: user.id,
      trade_required: form.trade_required,
      workers_needed: Number(form.workers_needed) || 1,
      start_date: form.start_date,
      end_date: form.end_date || null,
      daily_wage: Number(form.daily_wage) || 0,
      working_hours: form.working_hours,
      description: form.description,
      city: form.city,
      area: form.area,
      status: 'active',
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Job posted! Matching workers are shown below.');
    setPosted(true);
  };

  if (posted) {
    return (
      <ProtectedShell title="Post a job">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass-strong mx-auto max-w-xl p-10 text-center">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-accent text-white shadow-glow"
            >
              <CheckCircle2 className="h-10 w-10" />
            </motion.div>
            <h1 className="mt-5 font-display text-2xl font-extrabold">Job posted!</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Your job for {form.trade_required} is live. Here are the best-matched verified workers you can invite.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => { setPosted(false); setForm({ ...form, trade_required: '' }); }}>Post another</Button>
              <Button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white" onClick={() => router.push('/dashboard/organisation')}>
                Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {matches.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 font-display text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> AI-matched workers
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((w) => (
                <WorkerCard key={w.id} worker={w} matchScore={w.score} href="/dashboard/organisation" />
              ))}
            </div>
          </div>
        )}
      </ProtectedShell>
    );
  }

  return (
    <ProtectedShell title="Post a job" subtitle="Tell us what you need and we'll match verified workers instantly.">
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Card className="glass-strong p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-glow">
                <Plus className="h-6 w-6" />
              </div>
              <h2 className="font-display text-xl font-bold">Job details</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Trade required">
                  <select
                    value={form.trade_required}
                    onChange={(e) => update('trade_required', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select trade…</option>
                    {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Workers needed">
                  <Input type="number" min={1} value={form.workers_needed} onChange={(e) => update('workers_needed', e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Start date">
                  <Input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} />
                </Field>
                <Field label="End date">
                  <Input type="date" value={form.end_date} onChange={(e) => update('end_date', e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Daily wage (₹)" >
                  <Input type="number" value={form.daily_wage} onChange={(e) => update('daily_wage', e.target.value)} />
                </Field>
                <Field label="Working hours">
                  <Input value={form.working_hours} onChange={(e) => update('working_hours', e.target.value)} placeholder="9 AM - 6 PM" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" icon={MapPin}>
                  <Input value={form.city} onChange={(e) => update('city', e.target.value)} />
                </Field>
                <Field label="Area">
                  <Input value={form.area} onChange={(e) => update('area', e.target.value)} placeholder="Andheri West" />
                </Field>
              </div>
              <Field label="Job description">
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe the scope, site conditions, materials provided, etc."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>
              <Button onClick={submit} disabled={saving} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post job
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* live AI matches */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <Card className="glass p-5">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold">AI matches</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Top verified workers update live as you fill the form.
            </p>
          </Card>
          {form.trade_required ? (
            matches.length === 0 ? (
              <Card className="glass p-6 text-center text-sm text-muted-foreground">
                No verified {form.trade_required}s found nearby yet.
              </Card>
            ) : (
              <div className="space-y-4">
                {matches.slice(0, 4).map((w) => (
                  <CompactMatch key={w.id} worker={w} />
                ))}
              </div>
            )
          ) : (
            <Card className="glass p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Pick a trade to see matches.</p>
            </Card>
          )}
        </motion.div>
      </div>
    </ProtectedShell>
  );
}

function CompactMatch({ worker }: { worker: WorkerSummary & { score: number } }) {
  const initials = worker.full_name.split(' ').map((s) => s[0]).slice(0, 2).join('');
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white text-sm font-bold">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-semibold text-sm">{worker.full_name}</p>
            {worker.is_verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sky-500" />}
          </div>
          <p className="truncate text-xs text-muted-foreground">{worker.trade} · {worker.area}</p>
        </div>
        <span className={cn(
          'rounded-full px-2 py-0.5 text-xs font-bold',
          worker.score >= 85 ? 'bg-emerald-500/15 text-emerald-500' :
          worker.score >= 70 ? 'bg-sky-500/15 text-sky-500' :
          'bg-amber-500/15 text-amber-500'
        )}>
          {worker.score}%
        </span>
      </div>
    </div>
  );
}
