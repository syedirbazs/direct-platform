'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HardHat,
  Home as HomeIcon,
  Building2,
  ArrowRight,
  BadgeCheck,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Star,
  Users,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { AuroraBackground } from '@/components/aurora-background';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const trades = [
  'Electrician', 'Plumber', 'Painter', 'Carpenter', 'Welder', 'Mason',
  'Mechanic', 'Driver', 'Cook', 'Cleaner', 'Gardener', 'Security Guard',
];

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified Workers',
    desc: 'Every skilled worker is identity-checked and trade-certified before going live.',
  },
  {
    icon: Sparkles,
    title: 'AI Match Score',
    desc: 'Smart matching ranks workers against your job by skill, location, and availability.',
  },
  {
    icon: GraduationCap,
    title: 'Apprenticeships',
    desc: 'Unskilled workers learn under verified pros through a 15-day tracked program.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted Platform',
    desc: 'Ratings, completed-job counts, and transparent pricing on every profile.',
  },
];

const steps = [
  { n: '01', title: 'Sign up & pick a role', desc: 'Worker, homeowner, or organisation — each gets a tailored experience.' },
  { n: '02', title: 'Get verified', desc: 'Workers upload IDs and certificates; unskilled workers join a 15-day apprenticeship.' },
  { n: '03', title: 'Match & book', desc: 'AI scores every match. Homeowners book in one tap, organisations post jobs.' },
  { n: '04', title: 'Get to work', desc: 'Accept jobs, track training, and build your reputation with every completed job.' },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuroraBackground />

      <header className="relative z-20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-glow">
              <HardHat className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight">DIRECT</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how" className="text-sm font-medium text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground">Roles</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/signin"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered marketplace
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Skilled hands.<br />
              <span className="text-gradient animate-gradient bg-gradient-to-r from-primary via-accent to-amber-400">
                Direct to your door.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              DIRECT connects verified blue-collar workers with homeowners and
              organisations. Smart AI matching, fair wages, and a path from
              apprentice to master.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline">I already have an account</Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span><strong className="font-semibold">12k+</strong> workers</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-accent" />
                <span><strong className="font-semibold">3.4k+</strong> jobs filled</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" />
                <span><strong className="font-semibold">4.8</strong> avg rating</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative hidden h-[28rem] lg:block"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass absolute left-0 top-4 w-64 rounded-2xl p-4 shadow-glow"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white font-bold">RA</div>
                <div>
                  <p className="font-semibold">Ravi Kumar</p>
                  <p className="text-xs text-muted-foreground">Electrician · Mumbai</p>
                </div>
                <BadgeCheck className="ml-auto h-5 w-5 text-sky-500" />
              </div>
              <div className="mt-3 flex items-center gap-1 text-amber-400">
                {'★★★★★'.split('').map((s, i) => <Star key={i} className="h-3.5 w-3.5" fill="currentColor" />)}
                <span className="ml-1 text-xs text-muted-foreground">4.9 · 87 jobs</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="glass absolute right-2 top-24 w-60 rounded-2xl p-4"
            >
              <p className="text-xs font-medium text-muted-foreground">AI Match Score</p>
              <p className="font-display text-4xl font-extrabold text-emerald-500">92%</p>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center justify-between"><span>Skill match</span><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /></div>
                <div className="flex items-center justify-between"><span>Nearby location</span><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /></div>
                <div className="flex items-center justify-between"><span>Available today</span><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /></div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="glass absolute bottom-6 left-10 w-72 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-accent" />
                <p className="text-sm font-semibold">Apprenticeship progress</p>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  animate={{ width: ['0%', '100%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Day 12 of 15 · 80% complete</p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-2"
        >
          {trades.map((t) => (
            <Badge key={t} variant="secondary" className="rounded-full px-3 py-1.5 text-sm">
              {t}
            </Badge>
          ))}
        </motion.div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Built for everyone who works with their hands
          </h2>
          <p className="mt-3 text-muted-foreground">A single platform for workers, homeowners, and organisations.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass h-full p-6 transition-transform hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="roles" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Three ways to use DIRECT</h2>
          <p className="mt-3 text-muted-foreground">Each role gets its own onboarding and dashboard.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { icon: HardHat, title: 'Worker', desc: 'Get verified, find jobs, build your reputation. Unskilled? Join a 15-day apprenticeship.', color: 'from-primary to-sky-400' },
            { icon: HomeIcon, title: 'Need Help At Home', desc: 'Search verified workers by trade, location, and budget. Book in one tap.', color: 'from-accent to-emerald-400' },
            { icon: Building2, title: 'Organisation', desc: 'Post jobs, track applicants, and let AI match the best workers to your openings.', color: 'from-amber-400 to-orange-400' },
          ].map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass h-full p-7 text-center transition-transform hover:-translate-y-1">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${r.color} text-white shadow-glow`}>
                  <r.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass relative rounded-2xl p-6"
            >
              <span className="font-display text-5xl font-extrabold text-primary/20">{s.n}</span>
              <h3 className="mt-2 font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center sm:p-16">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-accent/10 to-amber-400/20 animate-gradient" />
          <TrendingUp className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to get DIRECT?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Join thousands of workers and customers on the fastest-growing blue-collar marketplace.
          </p>
          <Link href="/auth/signup" className="mt-6 inline-block">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white">
              Create your account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
              <HardHat className="h-4 w-4" />
            </div>
            <span className="font-display font-bold">DIRECT</span>
          </div>
          <p className="text-sm text-muted-foreground">Connecting hands that build with doors that need them.</p>
        </div>
      </footer>
    </div>
  );
}
