export type Role = 'worker' | 'homeowner' | 'organisation';

export type Trade =
  | 'Electrician'
  | 'Plumber'
  | 'Painter'
  | 'Carpenter'
  | 'Welder'
  | 'Mason'
  | 'Mechanic'
  | 'Driver'
  | 'Cook'
  | 'Cleaner'
  | 'Gardener'
  | 'Security Guard'
  | 'Housekeeping'
  | 'Construction Worker';

export const TRADES: Trade[] = [
  'Electrician',
  'Plumber',
  'Painter',
  'Carpenter',
  'Welder',
  'Mason',
  'Mechanic',
  'Driver',
  'Cook',
  'Cleaner',
  'Gardener',
  'Security Guard',
  'Housekeeping',
  'Construction Worker',
];

export type SkillLevel = 'skilled' | 'unskilled';

export interface MatchReason {
  label: string;
  matched: boolean;
}

export interface MatchScore {
  score: number;
  reasons: MatchReason[];
}
