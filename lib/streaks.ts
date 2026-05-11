import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserDailyLog } from './dailyLogs';
import {
  buildDailyChecklist,
  isDayChecklistGreen,
  type ChecklistEvalOptions,
} from './dailyChecklist';

const BEST_STREAK_KEY = 'sn_best_checklist_streak';

function isoDateDaysAgo(daysBack: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

/** Same rules as today except habits are not enforced for past days (not stored on each log). */
function optionsForHistoricalDay(
  template: Pick<ChecklistEvalOptions, 'waterGoalCups' | 'vitaminsRequiredCount'>
): ChecklistEvalOptions {
  return {
    waterGoalCups: template.waterGoalCups || 8,
    vitaminsRequiredCount: Math.max(0, template.vitaminsRequiredCount ?? 0),
    habitsOptional: true,
  };
}

export type ChecklistStreakOptions = Pick<ChecklistEvalOptions, 'waterGoalCups' | 'vitaminsRequiredCount'> & {
  /**
   * Default false: streak counts hydration + food + workout for past days.
   * Enable to require vitamins on every day too (matches strict daily checklist).
   */
  requireVitaminsInStreak?: boolean;
};

/**
 * Logs should cover recent history (~120–400 days). Missing calendar days stop the streak.
 */
export function computeChecklistCurrentStreak(logs: UserDailyLog[], opts: ChecklistStreakOptions): number {
  const vitaminsRequired =
    opts.requireVitaminsInStreak && opts.vitaminsRequiredCount > 0 ? opts.vitaminsRequiredCount : 0;

  const byDate = new Map(logs.map((l) => [l.log_date, l]));
  let streak = 0;

  for (let i = 0; i < 400; i++) {
    const iso = isoDateDaysAgo(i);
    const log = byDate.get(iso);
    if (!log) break;

    const dayOpts = optionsForHistoricalDay({
      waterGoalCups: opts.waterGoalCups,
      vitaminsRequiredCount: vitaminsRequired,
    });
    const items = buildDailyChecklist(log, dayOpts);
    if (!isDayChecklistGreen(items)) break;
    streak += 1;
  }

  return streak;
}

export async function loadPersistedBestChecklistStreak(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(BEST_STREAK_KEY);
    const n = Number(raw ?? 0);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export async function persistBestChecklistStreak(current: number): Promise<number> {
  const prev = await loadPersistedBestChecklistStreak();
  const next = Math.max(prev, Math.max(0, Math.floor(current)));
  if (next !== prev) {
    try {
      await AsyncStorage.setItem(BEST_STREAK_KEY, String(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}
