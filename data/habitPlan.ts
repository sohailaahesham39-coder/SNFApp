// ============================================================
// Habit Reduction Plan Engine
// Smart Nutrition & Fitness Chatbot
// ============================================================

export interface HabitDetail {
  habitName: string;
  dailyAmount: number;        // Times/cups per day
  unit: string;               // 'cups' | 'cans' | 'times' | 'cigarettes'
}

export interface WeeklyHabitPlan {
  week: number;
  target: number;             // Target for the week
  reduction: number;          // How much it decreases
  tips: string[];             // Weekly tips
  replacement: string;        // Healthy replacement
  warning?: string;           // Medical warning if any
}

export interface HabitPlan {
  habitName: string;
  icon: string;
  currentAmount: number;
  unit: string;
  healthRisks: string[];
  weeklyPlans: WeeklyHabitPlan[];
  finalGoal: number;
  alternatives: { name: string; benefit: string; emoji: string }[];
}

// ── Questions for each habit ─────────────────────────────────
export const HABIT_QUESTIONS: Record<string, {
  question: string;
  unit: string;
  options: { label: string; value: number }[];
  icon: string;
  color: string;
}> = {
  'Heavy Coffee': {
    question: 'How many cups of coffee do you drink per day?',
    unit: 'cups/day',
    icon: '☕',
    color: '#8B4513',
    options: [
      { label: '1-2 cups', value: 2 },
      { label: '3-4 cups', value: 4 },
      { label: '5-6 cups', value: 6 },
      { label: '7+ cups', value: 8 },
    ],
  },
  'Heavy Tea': {
    question: 'How many cups of tea do you drink per day?',
    unit: 'cups/day',
    icon: '🍵',
    color: '#8B6914',
    options: [
      { label: '2-3 cups', value: 3 },
      { label: '4-5 cups', value: 5 },
      { label: '6-8 cups', value: 7 },
      { label: '8+ cups', value: 10 },
    ],
  },
  'Soft Drinks': {
    question: 'How many cans or cups of soft drinks do you drink per day?',
    unit: 'cans/day',
    icon: '🥤',
    color: '#CC4400',
    options: [
      { label: '1 can', value: 1 },
      { label: '2 cans', value: 2 },
      { label: '3-4 cans', value: 4 },
      { label: 'More than 4 cans', value: 6 },
    ],
  },
  'Energy Drinks': {
    question: 'How many energy drink cans do you drink per day?',
    unit: 'cans/day',
    icon: '⚡',
    color: '#FFD700',
    options: [
      { label: '1 can', value: 1 },
      { label: '2 cans', value: 2 },
      { label: '3 cans', value: 3 },
      { label: 'More than 3 cans', value: 4 },
    ],
  },
  'Alcohol': {
    question: 'How many times per week do you drink alcohol?',
    unit: 'times/week',
    icon: '🍺',
    color: '#DAA520',
    options: [
      { label: '1-2 times', value: 2 },
      { label: '3-4 times', value: 4 },
      { label: '5-6 times', value: 6 },
      { label: 'Daily', value: 7 },
    ],
  },
  'Smoking': {
    question: 'How many cigarettes do you smoke per day?',
    unit: 'cigarettes/day',
    icon: '🚬',
    color: '#708090',
    options: [
      { label: '1-5 cigarettes', value: 5 },
      { label: '6-10 cigarettes', value: 10 },
      { label: '11-20 cigarettes', value: 20 },
      { label: 'More than 20 cigarettes', value: 25 },
    ],
  },
  'High Sugar Diet': {
    question: 'How many times per day do you eat sweets or sugar?',
    unit: 'times/day',
    icon: '🍩',
    color: '#FF69B4',
    options: [
      { label: '1-2 times', value: 2 },
      { label: '3-4 times', value: 4 },
      { label: '5-6 times', value: 6 },
      { label: 'All the time', value: 8 },
    ],
  },
};

// ── Progressive plan generation logic ────────────────────────
export function generateHabitPlan(habitName: string, dailyAmount: number): HabitPlan {
  const plans: Record<string, (amount: number) => HabitPlan> = {
    'Heavy Coffee': (amount) => ({
      habitName: 'Heavy Coffee',
      icon: '☕',
      currentAmount: amount,
      unit: 'cups/day',
      healthRisks: [
        'Anxiety and sleep disturbances if you drink more than 4 cups',
        'Temporary blood pressure increase',
        'Caffeine dependence and headaches when stopping',
        'Reduced iron and calcium absorption',
      ],
      weeklyPlans: buildReductionPlan(amount, 1, [
        { replacement: 'Green tea (less caffeine)', tip: 'Replace your last cup of coffee with green tea' },
        { replacement: 'Herbal tea (chamomile/mint)', tip: 'Drink coffee after meals, not on an empty stomach' },
        { replacement: 'Warm lemon water in the morning', tip: 'Start your day with a glass of water before coffee' },
        { replacement: 'Decaf coffee', tip: 'Coffee after 2 PM hurts sleep - avoid it completely' },
      ]),
      finalGoal: 1,
      alternatives: [
        { name: 'Green tea', benefit: 'Contains L-theanine for calm focus without anxiety', emoji: '🍃' },
        { name: 'Chamomile tea', benefit: 'Calms the nerves and improves sleep', emoji: '🌼' },
        { name: 'Lemon ginger water', benefit: 'Refreshes the body and supports digestion', emoji: '🍋' },
        { name: 'Dark chocolate 70%', benefit: 'Light natural caffeine with antioxidants', emoji: '🍫' },
      ],
    }),

    'Soft Drinks': (amount) => ({
      habitName: 'Soft Drinks',
      icon: '🥤',
      currentAmount: amount,
      unit: 'cans/day',
      healthRisks: [
        `${amount} cans per day = ${amount * 39}g of extra sugar daily`,
        'Type 2 diabetes risk increases by 26%',
        'Tooth enamel erosion from acidity',
        'Weight gain and belly fat',
        'Sugar dependence causes constant cravings',
      ],
      weeklyPlans: buildReductionPlan(amount, 0, [
        { replacement: 'Sparkling water with mint and lemon', tip: 'Replace one can with a natural sparkling drink - same fizzy feeling' },
        { replacement: 'Diluted fresh juice', tip: 'If you crave something sweet, make fresh juice with half water' },
        { replacement: 'Unsweetened iced tea', tip: 'Try cold mint tea stored in the fridge' },
        { replacement: 'Plain water with fruit slices', tip: 'This week: zero soft drinks - you can do it!' },
      ]),
      finalGoal: 0,
      alternatives: [
        { name: 'Natural sparkling water', benefit: 'Same fizzy sensation without sugar or calories', emoji: '💧' },
        { name: 'Cold hibiscus tea without sugar', benefit: 'High in antioxidants and supports blood pressure', emoji: '🌺' },
        { name: 'Fresh pomegranate juice', benefit: 'A powerful natural antioxidant drink', emoji: '🍎' },
        { name: 'Coconut water', benefit: 'Natural potassium and calcium with a sweet taste', emoji: '🥥' },
      ],
    }),

    'Heavy Tea': (amount) => ({
      habitName: 'Heavy Tea',
      icon: '🍵',
      currentAmount: amount,
      unit: 'cups/day',
      healthRisks: [
        'Strong tea reduces iron absorption by 60%',
        'Higher risk of anemia, especially for women',
        'Tea tannins can irritate the stomach on an empty stomach',
        'Caffeine may affect sleep if taken after 4 PM',
      ],
      weeklyPlans: buildReductionPlan(amount, 2, [
        { replacement: 'Light green tea', tip: 'Brew the tea lighter - do not steep for more than 3 minutes' },
        { replacement: 'Herbal tea (thyme/mint)', tip: 'Replace one cup with herbal tea after meals' },
        { replacement: 'Warm hibiscus tea without sugar', tip: 'Tea with meals blocks iron absorption - leave a one-hour gap' },
        { replacement: 'Warm ginger lemon water', tip: 'Count your cups - no more than that' },
      ]),
      finalGoal: 2,
      alternatives: [
        { name: 'Light green tea', benefit: 'Lower tannins and caffeine - gentler on the stomach', emoji: '🍃' },
        { name: 'Thyme tea', benefit: 'A natural antibacterial drink that supports breathing', emoji: '🌿' },
        { name: 'Hibiscus tea', benefit: 'Helps lower blood pressure and is rich in vitamin C', emoji: '🌺' },
        { name: 'Warm anise tea', benefit: 'Soothes the stomach and reduces bloating', emoji: '⭐' },
      ],
    }),

    'Energy Drinks': (amount) => ({
      habitName: 'Energy Drinks',
      icon: '⚡',
      currentAmount: amount,
      unit: 'cans/day',
      healthRisks: [
        `${amount} cans = ${amount * 80}mg caffeine + ${amount * 27}g sugar daily`,
        'Risk of irregular heartbeat',
        'Sudden blood pressure spikes',
        'Strong mental and physical dependence',
        'Severe fatigue when the effect wears off',
      ],
      weeklyPlans: buildReductionPlan(amount, 0, [
        { replacement: 'Black coffee', tip: 'Replace it with black coffee - same caffeine without harmful additives' },
        { replacement: 'Banana + light coffee', tip: 'Banana gives you steady energy for hours' },
        { replacement: 'Coconut water + dark chocolate', tip: 'Natural energy from whole foods' },
        { replacement: '7-8 hours of sleep', tip: 'Fatigue is the root cause - solve it from the source' },
      ]),
      finalGoal: 0,
      alternatives: [
        { name: 'Black coffee', benefit: 'Pure caffeine without sugar or taurine', emoji: '☕' },
        { name: 'Banana + almonds', benefit: 'Natural energy that lasts 3-4 hours', emoji: '🍌' },
        { name: 'Coconut water', benefit: 'Natural electrolytes and a refreshing boost', emoji: '🥥' },
        { name: 'Matcha tea', benefit: 'Caffeine + L-theanine = focus without anxiety', emoji: '🍵' },
      ],
    }),

    'High Sugar Diet': (amount) => ({
      habitName: 'High Sugar Diet',
      icon: '🍩',
      currentAmount: amount,
      unit: 'times/day',
      healthRisks: [
        'Sugar dependence is real and can feel like other addictions',
        `${amount} times per day raises blood sugar and causes sudden crashes`,
        'A never-ending craving cycle: sugar intake → crash → more cravings',
        'Higher risk of diabetes and chronic inflammation',
        'Weight gain, especially around the belly',
      ],
      weeklyPlans: buildReductionPlan(amount, 1, [
        { replacement: 'Natural dates (2-3 pieces)', tip: 'When cravings hit, drink a glass of water first and then eat dates' },
        { replacement: 'Fresh fruit (apple/pear)', tip: 'Fruit contains fiber that slows sugar absorption - unlike candy' },
        { replacement: 'Dark chocolate 70%+', tip: '2 squares of dark chocolate are enough - they help stop cravings' },
        { replacement: 'Almost zero added sugar', tip: 'This week: read every label - sugar hides in everything' },
      ]),
      finalGoal: 1,
      alternatives: [
        { name: 'Natural dates', benefit: 'Natural sugar with fiber and potassium - helps calm cravings', emoji: '🌴' },
        { name: 'Seasonal fresh fruit', benefit: 'Vitamins, fiber, and natural sweetness', emoji: '🍎' },
        { name: 'Dark chocolate 70%', benefit: 'Antioxidants and less craving for sweets', emoji: '🍫' },
        { name: 'Natural honey (small amount)', benefit: 'Better than white sugar when used in moderation', emoji: '🍯' },
      ],
    }),

    'Smoking': (amount) => ({
      habitName: 'Smoking',
      icon: '🚬',
      currentAmount: amount,
      unit: 'cigarettes/day',
      healthRisks: [
        'Physical and psychological dependence stronger than most substances',
        'Every cigarette steals 11 minutes of your life',
        'Severe deficiency in vitamin C and E',
        'Progressive damage to the lungs, heart, and blood vessels',
        'You should see a doctor for a safe quitting plan',
      ],
      weeklyPlans: buildReductionPlan(amount, 0, [
        { replacement: 'Nicotine replacement (doctor advised)', tip: 'Reduce by one cigarette each day - not all at once' },
        { replacement: 'Carrot, cucumber, and dark chocolate', tip: 'When cravings hit, do a physical activity right away' },
        { replacement: 'Deep breathing exercises', tip: 'A doctor-guided nicotine replacement plan can help a lot' },
        { replacement: 'Psychological and social support', tip: 'Track the money you saved and use it as a reward' },
      ]),
      finalGoal: 0,
      alternatives: [
        { name: 'Carrot and cucumber', benefit: 'Keeps the mouth busy and gives a chewing feeling', emoji: '🥕' },
        { name: 'Breathing exercises', benefit: 'Calms the nervous system and reduces cravings', emoji: '🧘' },
        { name: 'Daily vitamin C', benefit: 'Smoking destroys vitamin C, so replacement is important', emoji: '🍊' },
        { name: 'Cold water + mint', benefit: 'Helps reduce the immediate urge to smoke', emoji: '💧' },
      ],
    }),

    'Alcohol': (amount) => ({
      habitName: 'Alcohol',
      icon: '🍺',
      currentAmount: amount,
      unit: 'times/week',
      healthRisks: [
        'Long-term damage to the liver and pancreas',
        'Reduced absorption of vitamins B and D and zinc',
        'Sleep disruption and increased anxiety',
        'Very high calories with no nutritional value',
      ],
      weeklyPlans: buildReductionPlan(amount, 0, [
        { replacement: 'Pomegranate juice or cold hibiscus tea', tip: 'Replace it in social situations with an appealing alternative drink' },
        { replacement: 'Sparkling water with lemon and mint', tip: 'Identify the situations that trigger the habit and avoid them' },
        { replacement: 'Kombucha (fermented drink)', tip: 'Bold-tasting alternatives can help a lot' },
        { replacement: 'Professional support if needed', tip: 'Talk to a specialist if stopping feels difficult' },
      ]),
      finalGoal: 0,
      alternatives: [
        { name: 'Pomegranate juice', benefit: 'A strong antioxidant drink that helps protect the liver', emoji: '🍷' },
        { name: 'Cold hibiscus tea', benefit: 'A healthy and social-friendly drink', emoji: '🌺' },
        { name: 'Sparkling lemon water', benefit: 'The same fizzy sensation without alcohol', emoji: '💧' },
        { name: 'Cold herbal tea', benefit: 'Calms the nervous system without addiction', emoji: '🌿' },
      ],
    }),
  };

  const builder = plans[habitName];
  if (!builder) {
    return {
      habitName,
      icon: '⚠️',
      currentAmount: dailyAmount,
      unit: 'times/day',
      healthRisks: ['This habit affects your overall health'],
      weeklyPlans: [],
      finalGoal: 0,
      alternatives: [],
    };
  }

  return builder(dailyAmount);
}

// ── Helper: build the progressive week-by-week plan ─────────
function buildReductionPlan(
  start: number,
  goal: number,
  weekData: { replacement: string; tip: string }[]
): WeeklyHabitPlan[] {
  const weeks = 4;
  const totalReduction = start - goal;

  return Array.from({ length: weeks }, (_, i) => {
    const week = i + 1;
    const reduction = Math.round((totalReduction / weeks) * week * 10) / 10;
    const target = Math.max(goal, Math.round((start - reduction) * 10) / 10);

    return {
      week,
      target,
      reduction: Math.round((start - target) * 10) / 10,
      tips: [weekData[i]?.tip ?? 'Stay consistent - you are doing great!'],
      replacement: weekData[i]?.replacement ?? 'Plain water',
    };
  });
}
