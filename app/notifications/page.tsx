'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Briefcase, GraduationCap, BadgeCheck, CheckCircle2, Calendar,
  Building2, User, X, Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { ProtectedShell } from '@/components/protected-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/stat-card';
import { cn } from '@/lib/utils';

interface NotifRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_META: Record<string, { icon: React.ElementType; color: string }> = {
  job_offer: { icon: Briefcase, color: 'from-primary to-sky-400' },
  training_reminder: { icon: GraduationCap, color: 'from-accent to-emerald-400' },
  badge_approved: { icon: BadgeCheck, color: 'from-emerald-400 to-accent' },
  booking_confirmed: { icon: CheckCircle2, color: 'from-primary to-accent' },
  worker_accepted: { icon: CheckCircle2, color: 'from-emerald-400 to-accent' },
  worker_declined: { icon: X, color: 'from-rose-500 to-orange-500' },
  default: { icon: Bell, color: 'from-primary to-accent' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = React.useState<NotifRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const load = React.useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifs((data ?? []) as NotifRow[]);
    setLoading(false);
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  };
  const markAll = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  };

  const shown = filter === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <ProtectedShell title="Notifications">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
          <FilterChip active={filter === 'unread'} onClick={() => setFilter('unread')}>
            Unread {unreadCount > 0 && <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>}
          </FilterChip>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAll}>
            <Check className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <p className="py-16 text-center text-muted-foreground">Loading…</p>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'You\'re all caught up' : 'No notifications yet'}
          description="Job offers, booking updates, and training reminders will show up here."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {shown.map((n, i) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.default;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                >
                  <Card
                    className={cn(
                      'glass flex items-start gap-4 p-4 transition-colors',
                      !n.read && 'ring-1 ring-primary/30'
                    )}
                  >
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white', meta.color)}>
                      <meta.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{n.title}</p>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </ProtectedShell>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
      )}
    >
      {children}
    </button>
  );
}
