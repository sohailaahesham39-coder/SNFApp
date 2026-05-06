/** Normalizes `healthDrinks` from AsyncStorage whether it was saved as `{}`, array, or missing. */
export function normalizeHealthDrinks(raw: unknown): Record<string, number> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isNaN(n)) out[k] = n;
    }
    return out;
  }
  /** Health setup stores selected drink ids (e.g. `drink_coffee`) — use conservative counts for advice. */
  if (Array.isArray(raw)) {
    const out: Record<string, number> = {};
    for (const item of raw) {
      if (typeof item !== 'string') continue;
      if (item === 'drink_coffee') out.coffee = Math.max(out.coffee ?? 0, 4);
      else if (item === 'drink_tea') out.tea = Math.max(out.tea ?? 0, 5);
      else if (item === 'drink_soda') out.soda = Math.max(out.soda ?? 0, 2);
      else if (item === 'drink_energy') out.energy = Math.max(out.energy ?? 0, 2);
      else if (item === 'drink_alcohol') out.alcohol = Math.max(out.alcohol ?? 0, 3);
    }
    return out;
  }
  return {};
}

export function normalizedHabitsList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((h): h is string => typeof h === 'string');
}
