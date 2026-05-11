import type { UserProfile } from '../data/userStore';
import { unifiedMedicalConditions } from './healthProfileCoherence';
import { workoutAllowedForConditions } from './medicalConstraints';

/** Same rules as Home: goal match + condition-based workout safety. */
function workoutGoalTags(w: any): string[] {
  const g = w?.goal;
  if (Array.isArray(g)) return g;
  if (typeof g === 'string') return [g];
  return [];
}

export function getRecommendedWorkoutsForProfile(profile: UserProfile, workoutsInput: any[]): any[] {
  const goal = profile.goal;
  const conditions = unifiedMedicalConditions(profile);
  const want = goal === 'Maintain' ? 'Maintain' : goal;

  return workoutsInput.filter((w) => {
    const tags = workoutGoalTags(w);
    if (!tags.includes(want)) return false;
    return workoutAllowedForConditions(w, conditions);
  });
}

/** Recommended items first, then the rest (no duplicates). */
export function sortWorkoutsForProfile(profile: UserProfile | null, workoutsInput: any[]): any[] {
  if (!profile || !workoutsInput.length) return workoutsInput;
  const rec = getRecommendedWorkoutsForProfile(profile, workoutsInput);
  const recIds = new Set(rec.map((w) => w.id));
  const rest = workoutsInput.filter((w) => !recIds.has(w.id));
  return [...rec, ...rest];
}

export function workoutConditionSummary(conditions: string[] | undefined): string {
  if (!conditions?.length) return '';
  const parts: string[] = [];
  if (conditions.some((c) => /heart|coronary|angina|cardiac/i.test(c))) parts.push('lower-strain & no heavy barbell');
  if (conditions.some((c) => /kidney|renal/i.test(c))) parts.push('avoid heavy straining');
  if (conditions.some((c) => /diabetes|glycemic/i.test(c))) parts.push('favor steady effort over max sprints');
  if (conditions.some((c) => /hypertension|pressure|bp\b/i.test(c))) parts.push('avoid heavy breath-hold lifting');
  if (conditions.some((c) => /arthritis|joint/i.test(c))) parts.push('limit high-impact jumping');
  if (parts.length === 0) return 'aligned with your profile';
  return parts.join(' · ');
}
