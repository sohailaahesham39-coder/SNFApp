type ChatContext = {
  profile: any;
  caloriesEatenToday: number;
  caloriesGoalToday: number;
  waterCupsToday: number;
  waterGoalMl: number;
  activePlans: any;
  pendingLabTests: number;
  deficienciesCount: number;
  weeklyProgressText: string;
};

const context: ChatContext = {
  profile: {
    name: 'Test User',
    email: 'test@example.com',
    age: 30,
    gender: 'female',
    height: 165,
    weight: 70,
    goal: 'Weight Loss',
    activity: 'moderate',
    conditions: ['Diabetes Type 2'],
    allergens: [],
    bmi: 25.7,
    bmr: 1400,
    tdee: 2100,
    targetCalories: 1600,
  },
  caloriesEatenToday: 1200,
  caloriesGoalToday: 1600,
  waterCupsToday: 4,
  waterGoalMl: 2400,
  activePlans: {
    vitamin: [{ id: '1', user_id: 'u', plan_type: 'vitamin', status: 'active', created_at: '', started_at: '', completed_at: null, plan_data: { vitamins: [{ nutrient: 'Vitamin D3' }, { nutrient: 'Magnesium' }] } }],
    lab: [{ id: '2', user_id: 'u', plan_type: 'lab', status: 'active', created_at: '', started_at: '', completed_at: null, plan_data: { tests: [{ code: 'HBA1C' }, { code: 'FBS' }] } }],
    habit: [{ id: '3', user_id: 'u', plan_type: 'habit', status: 'active', created_at: '', started_at: '', completed_at: null, plan_data: { habit: 'drink_coffee', progress: 30 } }],
    water: [{ id: '4', user_id: 'u', plan_type: 'water', status: 'active', created_at: '', started_at: '', completed_at: null, plan_data: { goalMl: 2400 } }],
  },
  pendingLabTests: 2,
  deficienciesCount: 2,
  weeklyProgressText: 'Week 3 is improving with better adherence.',
};

async function run() {
  (globalThis as any).window = { localStorage: { getItem: () => null, setItem: () => null, removeItem: () => null } };
  const mod = await import('../lib/chatContext');
  const answerUserQuestionFromContext = mod.answerUserQuestionFromContext;

  const questions = [
    'What vitamins should I take today?',
    'How many calories did I eat?',
    "What's my water goal?",
    'Show me my health plan',
    'When should I do my lab tests?',
    'How am I doing this week?',
    'What habits should I reduce?',
  ];

  let pass = 0;
  questions.forEach((q) => {
    const answer = answerUserQuestionFromContext(q, context as any);
    const ok = Boolean(answer && answer.length > 0);
    if (ok) pass += 1;
    console.log(`[${ok ? 'PASS' : 'FAIL'}] ${q}`);
    console.log(`  -> ${answer ?? '(no answer)'}`);
  });

  console.log(`\nResult: ${pass}/${questions.length} deterministic capability prompts handled.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
