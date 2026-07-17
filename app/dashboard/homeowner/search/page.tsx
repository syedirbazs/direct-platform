'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { ProtectedShell } from '@/components/protected-shell';
import { WorkerCard, type WorkerSummary } from '@/components/worker-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Field } from '@/components/field';
import { TRADES } from '@/lib/types';
import { computeMatchScore } from '@/lib/match';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SortKey = 'rating' | 'verified' | 'nearest';

export default function SearchPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = React.useState<WorkerSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({
    trade: '',
    city: '',
    area: '',
    date: '',
    time: '',
    maxBudget: '',
  });
  const [sort, setSort] = React.useState<SortKey>('rating');
  const [showFilters, setShowFilters] = React.useState(false);
  const [bookingWorker, setBookingWorker] = React.useState<WorkerSummary | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('workers')
      .select('*')
      .eq('is_verified', true)
      .eq('available_today', true);

    if (filters.trade) q = q.eq('trade', filters.trade);
    if (filters.city) q = q.ilike('city', `%${filters.city}%`);
    if (filters.area) q = q.ilike('area', `%${filters.area}%`);
    if (filters.maxBudget) q = q.lte('price_from', Number(filters.maxBudget));

    const { data, error } = await q.order('rating', { ascending: false }).limit(40);
    if (error) { toast.error(error.message); setLoading(false); return; }
    setWorkers((data ?? []) as WorkerSummary[]);
    setLoading(false);
  }, [filters]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = React.useMemo(() => {
    let list = workers;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((w) =>
        w.full_name.toLowerCase().includes(q) ||
        (w.trade ?? '').toLowerCase().includes(q) ||
        (w.trade_interested ?? '').toLowerCase().includes(q) ||
        (w.skills ?? '').toLowerCase().includes(q)
      );
    }
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'verified') list = [...list].sort((a, b) => Number(b.is_verified) - Number(a.is_verified));
    if (sort === 'nearest') list = [...list].sort((a, b) => (a.area ?? '').localeCompare(b.area ?? ''));
    return list;
  }, [workers, query, sort]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <ProtectedShell title="Find Workers" subtitle="Search verified workers by trade, location, and budget.">
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[14rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, trade, or skill…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters((s) => !s)} className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>}
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="glass p-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Trade">
                    <select
                      value={filters.trade}
                      onChange={(e) => setFilters((f) => ({ ...f, trade: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Any trade</option>
                      {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="City" icon={MapPin}>
                    <Input value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} placeholder="Mumbai" />
                  </Field>
                  <Field label="Area">
                    <Input value={filters.area} onChange={(e) => setFilters((f) => ({ ...f, area: e.target.value }))} placeholder="Andheri West" />
                  </Field>
                  <Field label="Date">
                    <Input type="date" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} />
                  </Field>
                  <Field label="Time">
                    <Input type="time" value={filters.time} onChange={(e) => setFilters((f) => ({ ...f, time: e.target.value }))} />
                  </Field>
                  <Field label="Max budget (₹/day)">
                    <Input type="number" value={filters.maxBudget} onChange={(e) => setFilters((f) => ({ ...f, maxBudget: e.target.value }))} placeholder="800" />
                  </Field>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setFilters({ trade: '', city: '', area: '', date: '', time: '', maxBudget: '' })}>
                    <X className="mr-1 h-4 w-4" /> Clear
                  </Button>
                  <Button size="sm" onClick={load} className="bg-gradient-to-r from-primary to-accent text-white">
                    Apply
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          {([
            { k: 'rating', label: 'Highest Rated' },
            { k: 'verified', label: 'Verified Only' },
            { k: 'nearest', label: 'Nearest' },
          ] as { k: SortKey; label: string }[]).map((s) => (
            <button
              key={s.k}
              onClick={() => setSort(s.k)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                sort === s.k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {s.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">{filtered.length} workers</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-bold">No workers found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try widening your filters or clearing the search.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w, i) => {
            const distance = ((w.area ?? '').length % 8) * 0.7 + 0.5;
            const match = computeMatchScore(w, {
              trade_required: filters.trade || w.trade || undefined,
              city: filters.city || undefined,
              area: filters.area || undefined,
            });
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <WorkerCard
                  worker={w}
                  distanceKm={distance}
                  matchScore={match.score}
                  onBook={() => setBookingWorker(w)}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      <BookingDialog
        worker={bookingWorker}
        defaults={{ date: filters.date, time: filters.time, budget: filters.maxBudget }}
        onClose={() => setBookingWorker(null)}
        onBooked={() => {
          setBookingWorker(null);
          toast.success('Booking request sent! The worker will accept or decline shortly.');
        }}
        userId={user?.id}
      />
    </ProtectedShell>
  );
}

function BookingDialog({
  worker, defaults, onClose, onBooked, userId,
}: {
  worker: WorkerSummary | null;
  defaults: { date: string; time: string; budget: string };
  onClose: () => void;
  onBooked: () => void;
  userId?: string;
}) {
  const [form, setForm] = React.useState({ date: '', time: '', budget: '', notes: '', city: '', area: '', pincode: '' });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (worker) {
      setForm((f) => ({ ...f, date: defaults.date, time: defaults.time, budget: defaults.budget }));
    }
  }, [worker, defaults]);

  const submit = async () => {
    if (!worker || !userId) return;
    if (!form.date || !form.city) { toast.error('Please set a date and city'); return; }
    setSaving(true);
    const { error } = await supabase.from('bookings').insert({
      homeowner_id: userId,
      worker_id: worker.id,
      trade: worker.trade ?? worker.trade_interested ?? null,
      scheduled_date: form.date || null,
      scheduled_time: form.time || null,
      budget: form.budget ? Number(form.budget) : null,
      city: form.city,
      area: form.area || null,
      pincode: form.pincode || null,
      notes: form.notes || null,
      status: 'pending',
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    const { data: w } = await supabase.from('workers').select('user_id').eq('id', worker.id).maybeSingle();
    if (w?.user_id) {
      await supabase.from('notifications').insert({
        user_id: w.user_id,
        type: 'job_offer',
        title: 'New job offer!',
        body: `Booking request from a homeowner for ${worker.trade ?? 'a job'} on ${form.date}.`,
        entity_type: 'booking',
      });
    }
    onBooked();
  };

  return (
    <Dialog open={!!worker} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book {worker?.full_name}</DialogTitle>
          <DialogDescription>
            {worker?.trade ?? worker?.trade_interested} · {worker?.area}, {worker?.city}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></Field>
            <Field label="Time"><Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} /></Field>
          </div>
          <Field label="Budget (₹)"><Input type="number" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} placeholder="600" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Mumbai" /></Field>
            <Field label="Area"><Input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} placeholder="Andheri West" /></Field>
          </div>
          <Field label="Notes (optional)"><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Describe the job…" /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="bg-gradient-to-r from-primary to-accent text-white">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send booking request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
