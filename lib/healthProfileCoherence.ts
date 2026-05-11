import type { UserProfile } from '../data/userStore';

/**
 * Single list of condition labels for meal/workout/lab logic.
 * Merges onboarding `healthConditions` with legacy `conditions` (deduped).
 */
export function unifiedMedicalConditions(profile: UserProfile | null | undefined): string[] {
  if (!profile) return [];
  const seen = new Set<string>();
  const add = (arr: unknown) => {
    if (!Array.isArray(arr)) return;
    for (const x of arr) {
      if (typeof x === 'string') {
        const t = x.trim();
        if (t) seen.add(t);
      }
    }
  };
  add(profile.healthConditions);
  add(profile.conditions);
  return [...seen];
}

/** Apply merged conditions onto profile (mutates copy only). */
export function withUnifiedConditions(profile: UserProfile): UserProfile {
  const merged = unifiedMedicalConditions(profile);
  return { ...profile, conditions: merged };
}
