'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardHat, Zap, Loader2, ArrowRight, ArrowLeft, BadgeCheck, GraduationCap,
  MapPin, Phone, FileText, IdCard, Camera, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { ProtectedShell } from '@/components/protected-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Field } from '@/components/field';
import { useOnboarding } from '@/lib/store';
import { TRADES } from '@/lib/types';
import { cn } from '@/lib/utils';

type Step = 'trade' | 'skill' | 'skilled-form' | 'unskilled-terms' | 'unskilled-form' | 'done';

export default function WorkerOnboarding() {
  const router = useRouter();
  const { user, profile, setRole } = useAuth();
  const { trade, skillLevel, setTrade, setSkillLevel, reset } = useOnboarding();
  const [step, setStep] = React.useState<Step>(trade ? 'skill' : 'trade');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (profile && profile.role && profile.role !== 'worker') {
      router.replace(`/dashboard/${profile.role}`);
    }
  }, [profile, router]);

  const pickTrade = (t: typeof TRADES[number]) => {
    setTrade(t);
    setStep('skill');
  };

  const pickSkill = async (s: 'skilled' | 'unskilled') => {
    setSkillLevel(s);
    setSaving(true);
    try {
      await setRole('worker');
      setStep(s === 'skilled' ? 'skilled-form' : 'unskilled-terms');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-2 text-sm">
          <StepDot active={step === 'trade'} done={step !== 'trade'} label="Trade" />
          <StepLine />
          <StepDot active={step === 'skill'} done={step.startsWith('skilled') || step.startsWith('unskilled')} label="Skill" />
          <StepLine />
          <StepDot
            active={step.startsWith('skilled-form') || step.startsWith('unskilled')}
            done={step === 'done'}
            label={skillLevel === 'unskilled' ? 'Apprenticeship' : 'Verify'}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 'trade' && (
            <motion.div key="trade" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="glass-strong p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-400 text-white shadow-glow">
                    <HardHat className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-extrabold">Choose your trade</h1>
                    <p className="text-sm text-muted-foreground">Pick the work you do best.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {TRADES.map((t) => (
                    <motion.button
                      key={t}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => pickTrade(t)}
                      className={cn(
                        'glass rounded-xl p-4 text-left text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary',
                        trade === t && 'border-primary ring-2 ring-primary/30 text-primary'
                      )}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'skill' && (
            <motion.div key="skill" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="glass-strong p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-glow">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-extrabold">Are you skilled or learning?</h1>
                    <p className="text-sm text-muted-foreground">Trade: <strong>{trade}</strong></p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SkillOption
                    icon={BadgeCheck}
                    title="Skilled"
                    desc="You have experience and can show certificates. Get verified and start receiving jobs immediately."
                    gradient="from-primary to-sky-400"
                    onClick={() => pickSkill('skilled')}
                    disabled={saving}
                  />
                  <SkillOption
                    icon={GraduationCap}
                    title="Unskilled"
                    desc="New to the trade? Join a 15-day apprenticeship under a verified worker and earn your badge."
                    gradient="from-accent to-emerald-400"
                    onClick={() => pickSkill('unskilled')}
                    disabled={saving}
                  />
                </div>
                <Button variant="ghost" className="mt-4" onClick={() => setStep('trade')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 'skilled-form' && trade && (
            <SkilledForm
              trade={trade}
              onDone={() => setStep('done')}
              onBack={() => setStep('skill')}
              saving={saving}
              setSaving={setSaving}
            />
          )}

          {step === 'unskilled-terms' && trade && (
            <UnskilledTerms
              trade={trade}
              onAccept={() => setStep('unskilled-form')}
              onBack={() => setStep('skill')}
            />
          )}

          {step === 'unskilled-form' && trade && (
            <UnskilledForm
              trade={trade}
              onDone={() => setStep('done')}
              onBack={() => setStep('unskilled-terms')}
              saving={saving}
              setSaving={setSaving}
            />
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="glass-strong p-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-accent text-white shadow-glow"
                >
                  {skillLevel === 'skilled' ? <BadgeCheck className="h-10 w-10" /> : <GraduationCap className="h-10 w-10" />}
                </motion.div>
                <h1 className="mt-5 font-display text-2xl font-extrabold">
                  {skillLevel === 'skilled' ? 'Verification submitted!' : 'Apprenticeship started!'}
                </h1>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  {skillLevel === 'skilled'
                    ? 'Our team will review your documents. You\'ll get a notification when your verified badge is approved.'
                    : 'A verified trainer has been assigned to you. Head to your dashboard to meet them and start training.'}
                </p>
                <Button
                  className="mt-6 bg-gradient-to-r from-primary to-accent text-white"
                  onClick={() => {
                    reset();
                    router.push('/dashboard/worker');
                  }}
                >
                  Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedShell>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
        done ? 'bg-emerald-500 text-white' : active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
      )}>
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : label[0]}
      </div>
      <span className={cn('hidden text-xs sm:inline', active || done ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
    </div>
  );
}
function StepLine() {
  return <div className="h-px flex-1 max-w-12 bg-border" />;
}

function SkillOption({
  icon: Icon, title, desc, gradient, onClick, disabled,
}: {
  icon: React.ElementType; title: string; desc: string; gradient: string;
  onClick: () => void; disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="glass group rounded-2xl p-6 text-left transition-shadow hover:shadow-glow disabled:opacity-50"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </motion.button>
  );
}

function SkilledForm({
  trade, onDone, onBack, saving, setSaving,
}: {
  trade: string; onDone: () => void; onBack: () => void;
  saving: boolean; setSaving: (b: boolean) => void;
}) {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = React.useState({
    full_name: profile?.full_name ?? '',
    phone: '',
    experience: '',
    years_experience: '1',
    trade,
    location: '',
    area: '',
    city: '',
    pincode: '',
    skills: '',
    price_from: '500',
  });
  const [files, setFiles] = React.useState<{ gov?: File; cert?: File; photo?: File }>({});

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const upload = async (file: File, pathPrefix: string) => {
    const ext = file.name.split('.').pop();
    const path = `${pathPrefix}/${user!.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('worker-docs').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('worker-docs').getPublicUrl(path);
    return data.publicUrl;
  };

  const submit = async () => {
    if (!form.full_name || !form.phone || !form.city || !form.area || !form.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      await supabase.from('profiles').update({ full_name: form.full_name }).eq('id', user!.id);

      let profilePhotoUrl: string | null = null;
      let govIdUrl: string | null = null;
      let certUrl: string | null = null;
      if (files.photo) profilePhotoUrl = await upload(files.photo, 'photos');
      if (files.gov) govIdUrl = await upload(files.gov, 'govt-id');
      if (files.cert) certUrl = await upload(files.cert, 'certificates');

      const { error } = await supabase.from('workers').insert({
        user_id: user!.id,
        full_name: form.full_name,
        phone: form.phone,
        trade: form.trade,
        skill_level: 'skilled',
        status: 'pending',
        is_verified: false,
        experience: form.experience,
        years_experience: Number(form.years_experience) || 0,
        skills: form.skills,
        location: form.location,
        area: form.area,
        city: form.city,
        pincode: form.pincode,
        price_from: Number(form.price_from) || 0,
        profile_photo_url: profilePhotoUrl,
        government_id_url: govIdUrl,
        certificate_url: certUrl,
        available_today: true,
      });
      if (error) throw error;

      await refreshProfile();
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not submit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div key="skilled" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <Card className="glass-strong p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-400 text-white shadow-glow">
            <BadgeCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Verification</h1>
            <p className="text-sm text-muted-foreground">Tell us about your experience and upload your documents.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Ravi Kumar" />
            </Field>
            <Field label="Phone" icon={Phone}>
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Experience summary">
              <Input value={form.experience} onChange={(e) => update('experience', e.target.value)} placeholder="Residential wiring, panel boards…" />
            </Field>
            <Field label="Years of experience">
              <Input type="number" min={0} value={form.years_experience} onChange={(e) => update('years_experience', e.target.value)} />
            </Field>
          </div>
          <Field label="Trade">
            <Input value={form.trade} disabled />
          </Field>
          <Field label="Skills (comma separated)">
            <Input value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="Wiring, Panel installation, Troubleshooting" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location / Landmark">
              <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Near station" />
            </Field>
            <Field label="Area">
              <Input value={form.area} onChange={(e) => update('area', e.target.value)} placeholder="Andheri West" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <Input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Mumbai" />
            </Field>
            <Field label="Pincode">
              <Input value={form.pincode} onChange={(e) => update('pincode', e.target.value)} placeholder="400058" />
            </Field>
          </div>
          <Field label="Starting price (₹/day)">
            <Input type="number" value={form.price_from} onChange={(e) => update('price_from', e.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <FileInput label="Profile photo" icon={Camera} onChange={(f) => setFiles((s) => ({ ...s, photo: f }))} />
            <FileInput label="Government ID" icon={IdCard} onChange={(f) => setFiles((s) => ({ ...s, gov: f }))} />
            <FileInput label="Certificate" icon={FileText} onChange={(f) => setFiles((s) => ({ ...s, cert: f }))} />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Documents are reviewed before your verified badge is issued.
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={submit} disabled={saving} className="bg-gradient-to-r from-primary to-accent text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for verification
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function FileInput({
  label, icon: Icon, onChange,
}: { label: string; icon: React.ElementType; onChange: (f: File) => void }) {
  const [name, setName] = React.useState<string | null>(null);
  return (
    <label className="glass flex cursor-pointer flex-col items-center gap-2 rounded-xl p-4 text-center transition-colors hover:border-primary/50">
      <Icon className="h-6 w-6 text-muted-foreground" />
      <span className="text-xs font-medium">{label}</span>
      {name ? <Badge variant="secondary" className="text-[10px]">{name}</Badge> : <span className="text-[10px] text-muted-foreground">Click to upload</span>}
      <input
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setName(f.name); onChange(f); }
        }}
      />
    </label>
  );
}

function UnskilledTerms({ trade, onAccept, onBack }: { trade: string; onAccept: () => void; onBack: () => void }) {
  const [accepted, setAccepted] = React.useState(false);
  const terms = [
    'You will complete a 15-day training program under a verified worker.',
    'Attendance is tracked daily. Missing days extends your completion date.',
    'You must reach 100% progress to earn your verified badge.',
    'Your trainer will be assigned automatically based on your trade and area.',
    'You can contact your trainer directly once assigned.',
    'You may leave the program at any time, but your badge will not be issued.',
  ];
  return (
    <motion.div key="terms" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <Card className="glass-strong p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-emerald-400 text-white shadow-glow">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Apprenticeship terms</h1>
            <p className="text-sm text-muted-foreground">Trade: <strong>{trade}</strong> · 15-day program</p>
          </div>
        </div>
        <div className="space-y-3">
          {terms.map((t, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{t}</span>
            </div>
          ))}
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="h-4 w-4 rounded border-input" />
          I have read and accept the apprenticeship terms and conditions.
        </label>
        <div className="mt-5 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          <Button disabled={!accepted} onClick={onAccept} className="bg-gradient-to-r from-accent to-emerald-400 text-white">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function UnskilledForm({
  trade, onDone, onBack, saving, setSaving,
}: {
  trade: string; onDone: () => void; onBack: () => void;
  saving: boolean; setSaving: (b: boolean) => void;
}) {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = React.useState({
    full_name: profile?.full_name ?? '',
    phone: '',
    preferred_area: '',
    language: '',
    trade_interested: trade,
    city: '',
  });
  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.full_name || !form.phone || !form.preferred_area || !form.language) {
      toast.error('Please fill all fields');
      return;
    }
    setSaving(true);
    try {
      await supabase.from('profiles').update({ full_name: form.full_name }).eq('id', user!.id);

      const { data: worker, error: wErr } = await supabase
        .from('workers')
        .insert({
          user_id: user!.id,
          full_name: form.full_name,
          phone: form.phone,
          trade: null,
          trade_interested: form.trade_interested,
          skill_level: 'unskilled',
          status: 'training',
          is_verified: false,
          area: form.preferred_area,
          city: form.city,
          available_today: false,
        })
        .select('id')
        .single();
      if (wErr) throw wErr;

      const { data: trainers } = await supabase
        .from('workers')
        .select('id, trade, area, city, rating, years_experience, full_name, phone')
        .eq('is_verified', true)
        .eq('trade', form.trade_interested)
        .order('rating', { ascending: false })
        .limit(5);
      const trainer = (trainers && trainers[0]) || null;

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 15);

      const { error: aErr } = await supabase.from('apprenticeships').insert({
        trainee_id: user!.id,
        worker_id: worker.id,
        trainer_worker_id: trainer?.id ?? null,
        trade_interested: form.trade_interested,
        preferred_area: form.preferred_area,
        language: form.language,
        training_days: 15,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: endDate.toISOString().slice(0, 10),
        status: 'training',
        terms_accepted: true,
      });
      if (aErr) throw aErr;

      if (trainer) {
        await supabase.from('notifications').insert({
          user_id: user!.id,
          type: 'training_reminder',
          title: 'Trainer assigned!',
          body: `${trainer.full_name} (${trainer.trade}) will be your trainer. Check your dashboard.`,
          entity_type: 'apprenticeship',
        });
      }

      await refreshProfile();
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start apprenticeship');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div key="unskilled-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <Card className="glass-strong p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-emerald-400 text-white shadow-glow">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Your details</h1>
            <p className="text-sm text-muted-foreground">We'll assign a trainer based on your trade and area.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
            </Field>
            <Field label="Phone" icon={Phone}>
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" />
            </Field>
          </div>
          <Field label="Trade interested">
            <Input value={form.trade_interested} disabled />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Preferred area" icon={MapPin}>
              <Input value={form.preferred_area} onChange={(e) => update('preferred_area', e.target.value)} placeholder="Andheri West" />
            </Field>
            <Field label="Language">
              <Input value={form.language} onChange={(e) => update('language', e.target.value)} placeholder="Hindi, Marathi…" />
            </Field>
          </div>
          <Field label="City">
            <Input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Mumbai" />
          </Field>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={submit} disabled={saving} className="bg-gradient-to-r from-accent to-emerald-400 text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start apprenticeship
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
