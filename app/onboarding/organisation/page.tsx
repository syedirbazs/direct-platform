'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, Building2, MapPin, Phone, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { ProtectedShell } from '@/components/protected-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/field';

const INDUSTRIES = [
  'Construction', 'Manufacturing', 'Logistics', 'Hospitality', 'Real Estate',
  'Facility Management', 'Agriculture', 'Retail', 'Event Management', 'Other',
];

const schema = z.object({
  company_name: z.string().min(2, 'Company name required'),
  industry: z.string().min(2, 'Select an industry'),
  address: z.string().min(5, 'Enter your address'),
  phone: z.string().min(8, 'Enter a valid phone'),
  email: z.string().email('Enter a valid email'),
  hr_contact: z.string().min(2, 'HR contact name required'),
  full_name: z.string().min(2, 'Enter your name'),
});
type Form = z.infer<typeof schema>;

export default function OrganisationOnboarding() {
  const router = useRouter();
  const { user, profile, setRole, refreshProfile } = useAuth();
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      email: profile?.email ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await setRole('organisation');
      await supabase.from('profiles').update({ full_name: values.full_name }).eq('id', user!.id);
      await supabase.from('organisations').insert({
        user_id: user!.id,
        company_name: values.company_name,
        industry: values.industry,
        address: values.address,
        phone: values.phone,
        email: values.email,
        hr_contact: values.hr_contact,
      });
      await refreshProfile();
      toast.success('Company registered');
      router.push('/dashboard/organisation');
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
        className="mx-auto max-w-2xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-glow">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Register your company</h1>
            <p className="text-sm text-muted-foreground">Post jobs and hire verified workers.</p>
          </div>
        </div>

        <Card className="glass-strong p-7">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name" error={errors.company_name?.message}>
                <Input placeholder="Acme Builders Pvt Ltd" {...register('company_name')} />
              </Field>
              <Field label="Industry" error={errors.industry?.message}>
                <select
                  {...register('industry')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select…</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Address" error={errors.address?.message} icon={MapPin}>
              <Input placeholder="123 Industrial Estate, Mumbai" {...register('address')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company phone" error={errors.phone?.message} icon={Phone}>
                <Input placeholder="+91 22 4000 5000" {...register('phone')} />
              </Field>
              <Field label="Company email" error={errors.email?.message} icon={Mail}>
                <Input placeholder="hr@acme.com" {...register('email')} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="HR contact name" error={errors.hr_contact?.message} icon={User}>
                <Input placeholder="Anil Mehta" {...register('hr_contact')} />
              </Field>
              <Field label="Your name" error={errors.full_name?.message} icon={User}>
                <Input placeholder="Your full name" {...register('full_name')} />
              </Field>
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register & continue
            </Button>
          </form>
        </Card>
      </motion.div>
    </ProtectedShell>
  );
}
