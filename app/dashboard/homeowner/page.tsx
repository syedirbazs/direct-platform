'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, Calendar, BadgeCheck, Clock, CheckCircle2,
  IndianRupee, MapPin, Briefcase,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { ProtectedShell } from '@/components/protected-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, EmptyState } from '@/components/stat-card';

interface BookingRow {
  id: string;
  worker_id: string;
  trade: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  budget: number | null;
  city: string | null;
  area: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface WorkerLite {
  id: string;
  full_name: string;
  trade: string | null;
  area: string | null;
  city: string | null;
  rating: number;
  is_verified: boolean;
}

export default function HomeownerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = React.useState<BookingRow[]>([]);
  const [workers, setWorkers] = React.useState<Record<string, WorkerLite>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('homeowner_id', user.id)
        .order('created_at', { ascending: false });
      const rows = (data ?? []) as BookingRow[];
      setBookings(rows);
      if (rows.length) {
        const ids = Array.from(new Set(rows.map((r) => r.worker_id)));
        const { data: w } = await supabase
          .from('workers')
          .select('id, full_name, trade, area, city, rating, is_verified')
          .in('id', ids);
        const map: Record<string, WorkerLite> = {};
        (w ?? []).forEach((x) => { map[x.id] = x as WorkerLite; });
        setWorkers(map);
      }
      setLoading(false);
    })();
  }, [user]);

  const pending = bookings.filter((b) => b.status === 'pending');
  const accepted = bookings.filter((b) => b.status === 'accepted');
  const completed = bookings.filter((b) => b.status === 'completed');

  const statusBadge = (s: string) => {
    switch (s) {
      case 'pending': return <Badge className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/15">Pending</Badge>;
      case 'accepted': return <Badge className="bg-sky-500/15 text-sky-500 hover:bg-sky-500/15">Confirmed</Badge>;
      case 'completed': return <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15">Completed</Badge>;
      case 'rejected': return <Badge variant="destructive">Declined</Badge>;
      case 'cancelled': return <Badge variant="secondary">Cancelled</Badge>;
      default: return null;
    }
  };

  return (
    <ProtectedShell
      title="Need Help At Your Doorstep"
      subtitle="Find verified workers near you and book in seconds."
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card className="glass-strong relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/15 via-primary/10 to-amber-400/10" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold">Find a worker near you</h2>
              <p className="mt-1 text-muted-foreground">Search by trade, location, date, time, and budget.</p>
            </div>
            <Link href="/dashboard/homeowner/search">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white">
                <Search className="mr-2 h-4 w-4" /> Search workers
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending requests" value={pending.length} icon={Clock} accent="amber" delay={0} />
        <StatCard label="Confirmed bookings" value={accepted.length} icon={CheckCircle2} accent="primary" delay={0.05} />
        <StatCard label="Completed jobs" value={completed.length} icon={BadgeCheck} accent="accent" delay={0.1} />
      </div>

      <Card className="glass p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Your bookings</h3>
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Loading…</p>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No bookings yet"
            description="Search for a worker and make your first booking."
            action={
              <Link href="/dashboard/homeowner/search">
                <Button className="bg-gradient-to-r from-primary to-accent text-white">Find workers</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {bookings.map((b, i) => {
              const w = workers[b.worker_id];
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white font-bold">
                      {w?.full_name?.split(' ').map((s) => s[0]).slice(0, 2).join('') ?? 'W'}
                    </div>
                    <div>
                      <p className="font-semibold">{w?.full_name ?? 'Worker'} · {b.trade ?? 'Trade'}</p>
                      <p className="text-xs text-muted-foreground">
                        <MapPin className="mr-1 inline h-3 w-3" />
                        {b.area ? `${b.area}, ` : ''}{b.city ?? ''}
                        {b.scheduled_date && (
                          <>
                            {' · '}
                            <Calendar className="mr-1 inline h-3 w-3" />
                            {b.scheduled_date}
                            {b.scheduled_time && ` ${b.scheduled_time}`}
                          </>
                        )}
                        {b.budget != null && (
                          <>
                            {' · '}
                            <IndianRupee className="mr-0.5 inline h-3 w-3" />
                            {b.budget}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {w?.is_verified && <BadgeCheck className="h-4 w-4 text-sky-500" />}
                    {statusBadge(b.status)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </ProtectedShell>
  );
}
