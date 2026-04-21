// ============================================================
// Habit Reduction Plan Engine
// Smart Nutrition & Fitness Chatbot
// ============================================================

export interface HabitDetail {
  habitName: string;
  dailyAmount: number;        // كام مرة/كوباية في اليوم
  unit: string;               // 'cups' | 'cans' | 'times' | 'cigarettes'
}

export interface WeeklyHabitPlan {
  week: number;
  target: number;             // الهدف للأسبوع ده
  reduction: number;          // قد إيه هيقل
  tips: string[];             // نصايح الأسبوع
  replacement: string;        // البديل الصحي
  warning?: string;           // تحذير طبي لو فيه
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

// ── أسئلة لكل عادة ─────────────────────────────────────────
export const HABIT_QUESTIONS: Record<string, {
  question: string;
  unit: string;
  options: { label: string; value: number }[];
  icon: string;
  color: string;
}> = {
  'Heavy Coffee': {
    question: 'كام كوباية قهوة بتشرب في اليوم؟',
    unit: 'cups/day',
    icon: '☕',
    color: '#8B4513',
    options: [
      { label: '1-2 كوباية', value: 2 },
      { label: '3-4 كوبايات', value: 4 },
      { label: '5-6 كوبايات', value: 6 },
      { label: '+7 كوبايات', value: 8 },
    ],
  },
  'Heavy Tea': {
    question: 'كام كوباية شاي بتشرب في اليوم؟',
    unit: 'cups/day',
    icon: '🍵',
    color: '#8B6914',
    options: [
      { label: '2-3 كوبايات', value: 3 },
      { label: '4-5 كوبايات', value: 5 },
      { label: '6-8 كوبايات', value: 7 },
      { label: '+8 كوبايات', value: 10 },
    ],
  },
  'Soft Drinks': {
    question: 'كام علبة/كوباية سوفت درينك في اليوم؟',
    unit: 'cans/day',
    icon: '🥤',
    color: '#CC4400',
    options: [
      { label: '1 علبة', value: 1 },
      { label: '2 علبة', value: 2 },
      { label: '3-4 علبة', value: 4 },
      { label: '+4 علبة', value: 6 },
    ],
  },
  'Energy Drinks': {
    question: 'كام علبة إينيرجي درينك في اليوم؟',
    unit: 'cans/day',
    icon: '⚡',
    color: '#FFD700',
    options: [
      { label: '1 علبة', value: 1 },
      { label: '2 علبة', value: 2 },
      { label: '3 علبة', value: 3 },
      { label: '+3 علبة', value: 4 },
    ],
  },
  'Alcohol': {
    question: 'كام مرة في الأسبوع؟',
    unit: 'times/week',
    icon: '🍺',
    color: '#DAA520',
    options: [
      { label: '1-2 مرة', value: 2 },
      { label: '3-4 مرات', value: 4 },
      { label: '5-6 مرات', value: 6 },
      { label: 'يومياً', value: 7 },
    ],
  },
  'Smoking': {
    question: 'كام سيجارة في اليوم؟',
    unit: 'cigarettes/day',
    icon: '🚬',
    color: '#708090',
    options: [
      { label: '1-5 سجاير', value: 5 },
      { label: '6-10 سجاير', value: 10 },
      { label: '11-20 سيجارة', value: 20 },
      { label: '+20 سيجارة', value: 25 },
    ],
  },
  'High Sugar Diet': {
    question: 'كام مرة بتاكل حلويات/سكر في اليوم؟',
    unit: 'times/day',
    icon: '🍩',
    color: '#FF69B4',
    options: [
      { label: '1-2 مرة', value: 2 },
      { label: '3-4 مرات', value: 4 },
      { label: '5-6 مرات', value: 6 },
      { label: 'كل شوية', value: 8 },
    ],
  },
};

// ── منطق بناء الخطة التدريجية ──────────────────────────────
export function generateHabitPlan(habitName: string, dailyAmount: number): HabitPlan {
  const plans: Record<string, (amount: number) => HabitPlan> = {

    'Heavy Coffee': (amount) => ({
      habitName: 'Heavy Coffee',
      icon: '☕',
      currentAmount: amount,
      unit: 'cups/day',
      healthRisks: [
        'قلق واضطراب في النوم لو أكتر من 4 كوبايات',
        'ارتفاع ضغط الدم مؤقت',
        'إدمان الكافيين وصداع عند الوقف',
        'نقص امتصاص الحديد والكالسيوم',
      ],
      weeklyPlans: buildReductionPlan(amount, 1, [
        { replacement: 'شاي أخضر (أقل كافيين)', tip: 'استبدل آخر كوباية قهوة بشاي أخضر' },
        { replacement: 'شاي أعشاب (كاموميل/نعناع)', tip: 'شرب القهوة بعد الأكل مش على معدة فاضية' },
        { replacement: 'ماء دافي بليمون صبح', tip: 'ابدأ يومك بكوباية ماء قبل القهوة' },
        { replacement: 'قهوة منزوعة الكافيين', tip: 'القهوة بعد 2pm بتضر النوم - امنعها تماماً' },
      ]),
      finalGoal: 1,
      alternatives: [
        { name: 'شاي أخضر', benefit: 'فيه L-theanine يهدي ويركز بدون قلق', emoji: '🍃' },
        { name: 'شاي كاموميل', benefit: 'يهدي الأعصاب ويحسن النوم', emoji: '🌼' },
        { name: 'ماء بليمون وزنجبيل', benefit: 'ينشط الجسم ويحرق دهون', emoji: '🍋' },
        { name: 'شيكولاتة داكنة 70%', benefit: 'كافيين طبيعي خفيف مع مضادات أكسدة', emoji: '🍫' },
      ],
    }),

    'Soft Drinks': (amount) => ({
      habitName: 'Soft Drinks',
      icon: '🥤',
      currentAmount: amount,
      unit: 'cans/day',
      healthRisks: [
        `${amount} علبة في اليوم = ${amount * 39}g سكر زيادة يومياً`,
        'مخاطر السكري النوع 2 بتزيد 26%',
        'تآكل مينا الأسنان من الحمض',
        'زيادة الوزن والدهون حول البطن',
        'الإدمان على السكر يسبب نهم مستمر',
      ],
      weeklyPlans: buildReductionPlan(amount, 0, [
        { replacement: 'مياه فوارة بنعناع وليمون', tip: 'استبدل علبة بمياه فوارة طبيعية - نفس الإحساس الفوار' },
        { replacement: 'عصير طبيعي مخفف بمياه', tip: 'لو حسيت بنهم للحلو - اعمل عصير طازج بنص ماء' },
        { replacement: 'شاي مثلج بدون سكر', tip: 'جرب شاي مثلج بنعناع بارد في البراد' },
        { replacement: 'ماء عادي مع شرائح فاكهة', tip: 'الأسبوع ده: صفر سوفت درينك - انت قادر!' },
      ]),
      finalGoal: 0,
      alternatives: [
        { name: 'مياه فوارة طبيعية', benefit: 'نفس الإحساس الفوار بدون سكر أو كالوريز', emoji: '💧' },
        { name: 'كركديه بارد بدون سكر', benefit: 'مضادات أكسدة عالية وخافض للضغط', emoji: '🌺' },
        { name: 'عصير رمان طازج', benefit: 'أقوى مضاد أكسدة طبيعي', emoji: '🍎' },
        { name: 'ماء جوز هند', benefit: 'كالسيوم وبوتاسيوم طبيعي وحلو', emoji: '🥥' },
      ],
    }),

    'Heavy Tea': (amount) => ({
      habitName: 'Heavy Tea',
      icon: '🍵',
      currentAmount: amount,
      unit: 'cups/day',
      healthRisks: [
        'الشاي التقيل بيقلل امتصاص الحديد بنسبة 60%',
        'خطر فقر الدم خصوصاً للستات',
        'التانين في الشاي بيضر المعدة على صيام',
        'الكافيين بيأثر على النوم لو بعد 4pm',
      ],
      weeklyPlans: buildReductionPlan(amount, 2, [
        { replacement: 'شاي أخضر خفيف', tip: 'خفف الشاي - متمرش أكتر من 3 دقايق' },
        { replacement: 'شاي أعشاب (زعتر/نعناع)', tip: 'استبدل كوباية بشاي أعشاب بعد الأكل' },
        { replacement: 'كركديه دافي بدون سكر', tip: 'الشاي مع الأكل بيمنع امتصاص الحديد - فصل ساعة' },
        { replacement: 'ماء دافي بزنجبيل وليمون', tip: 'احسب كوبايتك بس - مش أكتر' },
      ]),
      finalGoal: 2,
      alternatives: [
        { name: 'شاي أخضر خفيف', benefit: 'أقل تانين وكافيين - أأمن للمعدة', emoji: '🍃' },
        { name: 'شاي زعتر', benefit: 'مضاد بكتيري طبيعي ومفيد للجهاز التنفسي', emoji: '🌿' },
        { name: 'كركديه', benefit: 'خافض للضغط ومليان فيتامين C', emoji: '🌺' },
        { name: 'يانسون دافي', benefit: 'يهدي المعدة ويقلل الانتفاخ', emoji: '⭐' },
      ],
    }),

    'Energy Drinks': (amount) => ({
      habitName: 'Energy Drinks',
      icon: '⚡',
      currentAmount: amount,
      unit: 'cans/day',
      healthRisks: [
        `${amount} علبة = ${amount * 80}mg كافيين + ${amount * 27}g سكر يومياً`,
        'خطر اضطراب نبضات القلب',
        'ارتفاع حاد في ضغط الدم',
        'اعتماد نفسي وجسدي قوي جداً',
        'ضعف عام وإرهاق أشد لما يخلص المفعول',
      ],
      weeklyPlans: buildReductionPlan(amount, 0, [
        { replacement: 'قهوة سوداء طبيعية', tip: 'استبدل بقهوة سوداء - نفس الكافيين بدون إضافات ضارة' },
        { replacement: 'موز + قهوة خفيفة', tip: 'الموز بيديك طاقة تدريجية ثابتة لساعات' },
        { replacement: 'ماء جوز هند + شيكولاتة داكنة', tip: 'إينيرجي طبيعي من الطبيعة' },
        { replacement: 'نوم كافي 7-8 ساعات', tip: 'الإرهاق هو السبب - حل المشكلة من جذرها' },
      ]),
      finalGoal: 0,
      alternatives: [
        { name: 'قهوة سوداء طبيعية', benefit: 'كافيين نقي بدون سكر أو تورين', emoji: '☕' },
        { name: 'موز + لوز', benefit: 'طاقة طبيعية تدوم 3-4 ساعات', emoji: '🍌' },
        { name: 'ماء جوز هند', benefit: 'إلكتروليت طبيعي ومنشط', emoji: '🥥' },
        { name: 'شاي أخضر ماتشا', benefit: 'كافيين + L-theanine = تركيز بدون قلق', emoji: '🍵' },
      ],
    }),

    'High Sugar Diet': (amount) => ({
      habitName: 'High Sugar Diet',
      icon: '🍩',
      currentAmount: amount,
      unit: 'times/day',
      healthRisks: [
        'الإدمان على السكر حقيقي ويشبه إدمان المواد',
        `${amount} مرات يومياً بترفع سكر الدم وتخليه يهبط فجأة`,
        'دورة نهم لا تنتهي: أكل سكر ← هبوط ← نهم تاني',
        'مخاطر السكري والالتهابات المزمنة',
        'زيادة الوزن خصوصاً حول البطن',
      ],
      weeklyPlans: buildReductionPlan(amount, 1, [
        { replacement: 'تمر طبيعي (2-3 حبات)', tip: 'لما تحس بنهم للحلو - اعمل كوباية ماء الأول ثم تمر' },
        { replacement: 'فاكهة طازجة (تفاح/كمثرى)', tip: 'الفاكهة فيها فيبر يبطئ امتصاص السكر - مش زي الحلوى' },
        { replacement: 'شيكولاتة داكنة 70%+', tip: '2 مربعات شيكولاتة داكنة تكفي - بتقتل النهم' },
        { replacement: 'سكر طبيعي صفر تقريباً', tip: 'الأسبوع ده: اقرأ كل لابل - السكر بيتخبأ في كل حاجة' },
      ]),
      finalGoal: 1,
      alternatives: [
        { name: 'تمر طبيعي', benefit: 'سكر طبيعي مع فيبر وبوتاسيوم - يهدي النهم', emoji: '🌴' },
        { name: 'فاكهة طازجة موسمية', benefit: 'فيتامينات + فيبر + حلاوة طبيعية', emoji: '🍎' },
        { name: 'شيكولاتة داكنة 70%', benefit: 'مضادات أكسدة + يقلل النهم للحلو', emoji: '🍫' },
        { name: 'عسل طبيعي (كمية صغيرة)', benefit: 'أحسن من السكر الأبيض - في حدود', emoji: '🍯' },
      ],
    }),

    'Smoking': (amount) => ({
      habitName: 'Smoking',
      icon: '🚬',
      currentAmount: amount,
      unit: 'cigarettes/day',
      healthRisks: [
        'الإدمان الجسدي والنفسي أقوى من معظم المواد',
        'كل سيجارة بتسرق 11 دقيقة من عمرك',
        'نقص فيتامين C وE الشديد',
        'تدمير تدريجي للرئة والقلب والأوعية',
        'لازم استشارة طبيب لبرنامج إقلاع آمن',
      ],
      weeklyPlans: buildReductionPlan(amount, 0, [
        { replacement: 'نيكوتين بديل (استشر طبيب)', tip: 'قلل سيجارة كل يوم - مش فجأة' },
        { replacement: 'جزر وخيار وشوكولاتة داكنة', tip: 'لما تحس بالشهوة - اعمل نشاط جسدي فوري' },
        { replacement: 'تمارين تنفس عميق', tip: 'نوع النيكوتين البديل مع طبيب يساعد جداً' },
        { replacement: 'دعم نفسي واجتماعي', tip: 'احسب المبلغ اللي وفرته - استخدمه مكافأة' },
      ]),
      finalGoal: 0,
      alternatives: [
        { name: 'جزر وخيار', benefit: 'يشغل الفم وبيديك إحساس المضغ', emoji: '🥕' },
        { name: 'تمارين تنفس', benefit: 'تهدي الجهاز العصبي وتقلل الرغبة', emoji: '🧘' },
        { name: 'فيتامين C يومي', benefit: 'التدخين بيدمر فيتامين C - تعويض ضروري', emoji: '🍊' },
        { name: 'ماء بارد + نعناع', benefit: 'يقلل الرغبة الفورية في التدخين', emoji: '💧' },
      ],
    }),

    'Alcohol': (amount) => ({
      habitName: 'Alcohol',
      icon: '🍺',
      currentAmount: amount,
      unit: 'times/week',
      healthRisks: [
        'تلف الكبد والبنكرياس على المدى الطويل',
        'تدمير امتصاص فيتامينات B وD والزنك',
        'اضطراب النوم وزيادة القلق',
        'كالوريز عالية جداً بدون قيمة غذائية',
      ],
      weeklyPlans: buildReductionPlan(amount, 0, [
        { replacement: 'عصير رمان أو كركديه بارد', tip: 'استبدل في المناسبات بمشروب بديل جذاب' },
        { replacement: 'ماء فوار بليمون ونعناع', tip: 'حدد المواقف اللي بتحفز العادة وتجنبها' },
        { replacement: 'كومبوتشا (مخمر طبيعي)', tip: 'البدائل ذات الطعم القوي بتساعد' },
        { replacement: 'دعم متخصص لو محتاج', tip: 'استشر متخصص لو حسيت صعوبة في التوقف' },
      ]),
      finalGoal: 0,
      alternatives: [
        { name: 'عصير رمان', benefit: 'أقوى مضاد أكسدة - يعوض تلف الكبد', emoji: '🍷' },
        { name: 'كركديه بارد', benefit: 'مشروب اجتماعي جميل وصحي', emoji: '🌺' },
        { name: 'ماء فوار ليمون', benefit: 'نفس إحساس الفوران بدون كحول', emoji: '💧' },
        { name: 'شاي أعشاب بارد', benefit: 'يهدي الجهاز العصبي بدون إدمان', emoji: '🌿' },
      ],
    }),
  };

  const builder = plans[habitName];
  if (!builder) {
    return {
      habitName, icon: '⚠️', currentAmount: dailyAmount, unit: 'times/day',
      healthRisks: ['هذه العادة تؤثر على صحتك العامة'],
      weeklyPlans: [], finalGoal: 0, alternatives: [],
    };
  }
  return builder(dailyAmount);
}

// ── helper: بناء الخطة التدريجية أسبوع بأسبوع ─────────────
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
      tips: [weekData[i]?.tip ?? 'استمر في خطتك - أنت رائع!'],
      replacement: weekData[i]?.replacement ?? 'ماء طبيعي',
    };
  });
}
