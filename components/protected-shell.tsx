'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { AuroraBackground } from '@/components/aurora-background';
import { AppHeader } from '@/components/app-header';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/lib/types';

interface Props {
  children: React.ReactNode;
  requireRole?: Role[];
  title?: string;
  subtitle?: string;
}

export function ProtectedShell({ children, requireRole, title, subtitle }: Props) {
  const { profile, role, loading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace('/auth/signin');
      return;
    }
    if (!role) {
      router.replace('/onboarding/role');
      return;
    }
    if (requireRole && !requireRole.includes(role)) {
      router.replace(`/dashboard/${role}`);
      return;
    }
    setChecked(true);
  }, [profile, role, loading, requireRole, router]);

  if (loading || !checked) {
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
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        {(title || subtitle) && (
          <div className="mb-8">
            {title && (
              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </motion.main>
    </div>
  );
}
