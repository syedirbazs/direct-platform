'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HardHat, Home, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { AuroraBackground } from '@/components/aurora-background';
import { AppHeader } from '@/components/app-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/lib/store';
import type { Role } from '@/lib/types';

const ROLE_CARDS: {
  role: Role;
  title: string;
  desc: string;
  icon: React.ElementType;
  gradient: string;
  features: string[];
}[] = [
  {
    role: 'worker',
    title: 'Worker',
    desc: 'Find work, get verified, and build your reputation. New to a trade? Learn through an apprenticeship.',
    icon: HardHat,
    gradient: 'from-primary to-sky-400',
    features: ['Skilled verification', '15-day apprenticeship', 'Job offers & ratings'],
  },
  {
    role: 'homeowner',
    title: 'Need Help At Home',
    desc: 'Search verified workers by trade, location, date and budget. Book in one tap.',
    icon: Home,
    gradient: 'from-accent to-emerald-400',
    features: ['Smart search & filters', 'Verified worker cards', 'Instant booking'],
  },
  {
    role: 'organisation',
    title: 'Organisation',
    desc: 'Post jobs, collect applicants, and let AI match the best workers to each opening.',
    icon: Building2,
    gradient: 'from-amber-400 to-orange-500',
    features: ['Job postings', 'Applicant tracking', 'Analytics dashboard'],
  },
];

export default function RoleSelectPage() {
  const router = useRouter();
  const { profile, role, loading, setRole } = useAuth();
  const { setRole: setOnboardingRole } = useOnboarding();
  const [picking, setPicking] = React.useState<Role | null>(null);

  React.useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace('/auth/signin');
      return;
    }
    if (role) {
      router.replace(`/dashboard/${role}`);
    }
  }, [profile, role, loading, router]);

  const choose = async (r: Role) => {
    setPicking(r);
    setOnboardingRole(r);
    await setRole(r);
    if (r === 'worker') {
      router.push('/onboarding/worker');
    } else if (r === 'homeowner') {
      router.push('/onboarding/homeowner');
    } else {
      router.push('/onboarding/organisation');
    }
  };

  if (loading || role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <AuroraBackground />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="secondary" className="mb-3">Step 1 of 2</Badge>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Choose how you'll use DIRECT
          </h1>
          <p className="mt-3 text-muted-foreground">
            Each role has its own onboarding and dashboard. You can change this later from your profile.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {ROLE_CARDS.map((c, i) => (
            <motion.div
              key={c.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
            >
              <Card className="glass group flex h-full flex-col p-7 transition-shadow hover:shadow-glow">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${c.gradient} text-white shadow-glow`}>
                  <c.icon className="h-8 w-8" />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold">{c.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {c.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full bg-gradient-to-r from-primary to-accent text-white"
                  onClick={() => choose(c.role)}
                  disabled={picking !== null}
                >
                  {picking === c.role && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue as {c.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
