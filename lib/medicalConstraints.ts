/**
 * Workout safety filters from self-reported conditions (not a medical device).
 * Conservative rules: exclude obvious high-strain patterns when flags match.
 */

function blob(conditions: string[]): string {
  return conditions.map((c) => c.toLowerCase()).join(' ');
}

const HEART = /heart|cardio|coronary|angina|chf|cardiac|arrhythm|stroke/i;
const KIDNEY = /kidney|renal|dialysis/i;
const BP = /hypertension|blood\s*pressure|bp\b/i;
const DIABETES = /diabetes|diabetic| hba1c|glycemic/i;
const JOINT = /arthritis|joint|osteoporosis|rheumat/i;

/** Returns false if workout should not be promoted for this user. */
export function workoutAllowedForConditions(workout: any, conditionLabels: string[]): boolean {
  const b = blob(conditionLabels);
  const name = String(workout?.name ?? '').toLowerCase();
  const equip = String(workout?.equipment ?? '');
  const diff = String(workout?.difficulty ?? '');

  const isBarbell = equip === 'Barbell';
  const heavyOlympic =
    /\b(deadlift|clean|snatch|power\s*lift|squat\s*heavy)\b/i.test(name) ||
    (name.includes('squat') && isBarbell);

  if ((HEART.test(b) || BP.test(b) || KIDNEY.test(b)) && isBarbell) return false;
  if (HEART.test(b) && heavyOlympic) return false;

  if (JOINT.test(b)) {
    if (/jump|burpee|hiit|plyometric|rope/i.test(name)) return false;
  }

  /* Unsteady glycemic control: avoid highest-intensity glycolytic blocks as primary picks */
  if (DIABETES.test(b) && diff === 'Intermediate' && /hiit|tabata|sprint/i.test(name)) {
    return false;
  }

  return true;
}
