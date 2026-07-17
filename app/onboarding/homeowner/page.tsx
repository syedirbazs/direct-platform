'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Home, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { ProtectedShell } from '@/components/protected-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/field';

const schema = z.object({
  full_name: z.string().min(2, 'Enter your name'),
  phone: z.string().min(8, 'Enter a valid phone'),
  city: z.string().min(2, 'Enter your city'),
  area: z.string().min(2, 'Enter your area'),
  pincode: z.string().min(4, 'Enter pincode'),
});
type Form = z.infer<typeof schema>;

export default function HomeownerOnboarding() {
  const router = useRouter();
  const { user, profile, setRole, refreshProfile } = useAuth();
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: profile?.full_name ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await setRole('homeowner');
      await supabase.from('profiles').update({ full_name: values.full_name }).eq('id', user!.id);
      await refreshProfile();
      toast.success('Profile saved');
      router.push('/dashboard/homeowner');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  });

  return (
    <ProtectedShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-emerald-400 text-white shadow-glow">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Tell us about you</h1>
            <p className="text-sm text-muted-foreground">We'll use this to find workers near you.</p>
          </div>
        </div>

        <Card className="glass-strong p-7">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Full name" error={errors.full_name?.message}>
              <Input placeholder="Priya Sharma" {...register('full_name')} />
            </Field>
            <Field label="Phone" error={errors.phone?.message} icon={Phone}>
              <Input placeholder="+91 98765 43210" {...register('phone')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" error={errors.city?.message} icon={MapPin}>
                <Input placeholder="Mumbai" {...register('city')} />
              </Field>
              <Field label="Area" error={errors.area?.message}>
                <Input placeholder="Andheri West" {...register('area')} />
              </Field>
            </div>
            <Field label="Pincode" error={errors.pincode?.message}>
              <Input placeholder="400058" {...register('pincode')} />
            </Field>
            <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-primary to-accent text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue to dashboard
            </Button>
          </form>
        </Card>
      </motion.div>
    </ProtectedShell>
  );
}
