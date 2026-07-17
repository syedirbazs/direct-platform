'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, SkillLevel, Trade } from '@/lib/types';

interface OnboardingState {
  role: Role | null;
  trade: Trade | null;
  skillLevel: SkillLevel | null;
  setRole: (r: Role | null) => void;
  setTrade: (t: Trade | null) => void;
  setSkillLevel: (s: SkillLevel | null) => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      role: null,
      trade: null,
      skillLevel: null,
      setRole: (r) => set({ role: r }),
      setTrade: (t) => set({ trade: t }),
      setSkillLevel: (s) => set({ skillLevel: s }),
      reset: () => set({ role: null, trade: null, skillLevel: null }),
    }),
    { name: 'direct-onboarding' }
  )
);
