'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HardHat, Loader2, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { AuroraBackground } from '@/components/aurora-background';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const signinSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
});
const signupSchema = z.object({
  full_name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type Signin = z.infer<typeof signinSchema>;
type Signup = z.infer<typeof signupSchema>;

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);
  const isSignup = mode === 'signup';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Signin & Signup>({
    resolver: zodResolver(isSignup ? signupSchema : signinSchema) as never,
  });

  React.useEffect(() => {
    if (user) router.replace('/onboarding/role');
  }, [user, router]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { data: { full_name: values.full_name } },
        });
        if (error) throw error;
        toast.success('Account created — welcome to DIRECT');
        router.replace('/onboarding/role');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        toast.success('Welcome back');
        router.replace('/onboarding/role');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AuroraBackground />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-glow">
            <HardHat className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-extrabold tracking-tight">DIRECT</span>
        </Link>

        <Card className="glass-strong p-8">
          <h1 className="font-display text-2xl font-extrabold">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignup ? 'Pick your role after signing up.' : 'Sign in to continue to your dashboard.'}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {isSignup && (
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="full_name" placeholder="Ravi Kumar" className="pl-9" {...register('full_name')} />
                </div>
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-9" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register('password')} />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary to-accent text-white"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignup ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? (
              <>Already have an account?{' '}
                <Link href="/auth/signin" className="font-semibold text-primary hover:underline">Sign in</Link>
              </>
            ) : (
              <>New to DIRECT?{' '}
                <Link href="/auth/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
              </>
            )}
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
