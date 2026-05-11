import type { UserDailyLog } from './dailyLogs';

/** Nested under `user_daily_logs.meals` to avoid new DB columns */
export const SNF_CHECKLIST_KEY = '__snf_checklist';

export type StoredChecklist = {
  /** User marked movement / exercise for the day */
  workout?: boolean;
};

export type ChecklistEvalOptions = {
  waterGoalCups: number;
  /** If > 0, require that many vitamin check-ins in `vitamins_taken` */
  vitaminsRequiredCount: number;
  /** When true, ignore daily-habit requirements (used for historical streak) */
  habitsOptional?: boolean;
  /** Daily habits to check when `habitsOptional` is false */
  dailyHabitIds?: string[];
  habitCompletionMap?: Record<string, boolean>;
};

export type ChecklistItem = {
  id: 'water' | 'vitamins' | 'meal' | 'workout' | 'habits';
  label: string;
  done: boolean;
  /** Shown in UI when item does not apply (e.g. no vitamin plan) */
  skipped: boolean;
};

export function extractStoredChecklist(meals: Record<string, unknown> | undefined): StoredChecklist {
  if (!meals || typeof meals !== 'object') return {};
  const raw = meals[SNF_CHECKLIST_KEY];
  if (!raw || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  return {
    workout: typeof o.workout === 'boolean' ? o.workout : undefined,
  };
}

export function mergeChecklistPatch(
  meals: Record<string, unknown> | undefined,
  patch: Partial<StoredChecklist>
): Record<string, unknown> {
  const base = meals && typeof meals === 'object' ? { ...meals } : {};
  const prev = extractStoredChecklist(base);
  const next: StoredChecklist = { ...prev, ...patch };
  return {
    ...base,
    [SNF_CHECKLIST_KEY]: next as unknown as Record<string, unknown>,
  };
}

export function countMealLogEntries(meals: Record<string, unknown> | undefined): number {
  if (!meals || typeof meals !== 'object') return 0;
  return Object.keys(meals).filter((k) => k !== SNF_CHECKLIST_KEY).length;
}

function vitaminsSatisfied(log: UserDailyLog, required: number): boolean {
  if (required <= 0) return true;
  return (log.vitamins_taken?.length ?? 0) >= required;
}

function habitsSatisfied(opts: ChecklistEvalOptions): boolean {
  if (opts.habitsOptional) return true;
  const ids = opts.dailyHabitIds ?? [];
  if (ids.length === 0) return true;
  const map = opts.habitCompletionMap ?? {};
  return ids.every((id) => map[id] === true);
}

export function buildDailyChecklist(log: UserDailyLog, opts: ChecklistEvalOptions): ChecklistItem[] {
  const stored = extractStoredChecklist(log.meals);
  const waterGoal = Math.max(1, opts.waterGoalCups || 8);
  const waterDone = log.water_cups >= waterGoal;

  const vitRequired = Math.max(0, opts.vitaminsRequiredCount);
  const vitSkipped = vitRequired === 0;
  const vitDone = vitSkipped || vitaminsSatisfied(log, vitRequired);

  const mealDone = log.calories_consumed > 0 || countMealLogEntries(log.meals) > 0;
  const workoutDone = stored.workout === true;

  const dailyIds = opts.dailyHabitIds ?? [];
  const habitsSkipped = dailyIds.length === 0;
  const habitsDone = habitsSkipped || habitsSatisfied(opts);

  return [
    { id: 'water', label: `Hydration (${log.water_cups}/${waterGoal} cups)`, done: waterDone, skipped: false },
    {
      id: 'vitamins',
      label: vitSkipped ? 'Vitamins (no active plan)' : `Vitamins (${log.vitamins_taken?.length ?? 0}/${vitRequired})`,
      done: vitDone,
      skipped: vitSkipped,
    },
    { id: 'meal', label: 'Log food / calories', done: mealDone, skipped: false },
    { id: 'workout', label: 'Movement / workout', done: workoutDone, skipped: false },
    {
      id: 'habits',
      label: habitsSkipped ? 'Daily habits (none tracked)' : 'Daily habits',
      done: habitsDone,
      skipped: habitsSkipped,
    },
  ];
}

/** Items that must be done (or intentionally skipped vitamins/habits) for a green day */
export function isDayChecklistGreen(items: ChecklistItem[]): boolean {
  return items.every((row) => row.skipped || row.done);
}

export function checklistCompletionRatio(items: ChecklistItem[]): number {
  const relevant = items.filter((i) => !i.skipped);
  if (!relevant.length) return 1;
  const done = relevant.filter((i) => i.done).length;
  return done / relevant.length;
}
