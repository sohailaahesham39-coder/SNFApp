export type PushEventType =
  | 'health_plan_update'
  | 'weekly_progress_summary'
  | 'new_recommendations'
  | 'streak_achievement';

export type PushTemplatePayload = {
  eventType: PushEventType;
  target?: string;
  userName?: string;
  streakDays?: number;
};

export type PushMessageTemplate = {
  title: string;
  body: string;
  data: Record<string, string>;
};

export function buildPushTemplate(input: PushTemplatePayload): PushMessageTemplate {
  const target = input.target ?? '/(tabs)/home';

  switch (input.eventType) {
    case 'health_plan_update':
      return {
        title: 'Health plan updated',
        body: 'Your latest health plan is ready. Open Health tab to review details.',
        data: { type: input.eventType, target: '/(tabs)/health' },
      };
    case 'weekly_progress_summary':
      return {
        title: 'Weekly progress summary',
        body: 'Your new weekly summary is ready. Check your profile progress now.',
        data: { type: input.eventType, target: '/(tabs)/profile' },
      };
    case 'new_recommendations':
      return {
        title: 'New recommendations available',
        body: 'Fresh meal and workout recommendations are ready for you.',
        data: { type: input.eventType, target: '/(tabs)/home' },
      };
    case 'streak_achievement': {
      const days = input.streakDays ?? 7;
      return {
        title: 'Streak achievement',
        body: `You completed ${days} days! Keep going 🎉`,
        data: { type: input.eventType, target },
      };
    }
    default:
      return {
        title: 'Smart Nutrition',
        body: 'You have a new update.',
        data: { type: 'generic', target },
      };
  }
}

