import { supabase } from './supabase';

export type UserNotificationSettings = {
  water_reminders: boolean;
  water_reminder_interval_hours: number;
  vitamin_reminders: boolean;
  vitamin_reminder_time: string;
  workout_reminders: boolean;
  workout_reminder_time: string;
  meal_reminders: boolean;
  meal_breakfast_time: string;
  meal_lunch_time: string;
  meal_dinner_time: string;
  habit_reminders: boolean;
  habit_reminder_time: string;
  lab_reminders: boolean;
  lab_reminder_day_of_week: number;
  lab_reminder_time: string;
  push_enabled: boolean;
  fcm_token: string | null;
};

export const DEFAULT_NOTIFICATION_SETTINGS: UserNotificationSettings = {
  water_reminders: true,
  water_reminder_interval_hours: 2,
  vitamin_reminders: true,
  vitamin_reminder_time: '08:00',
  workout_reminders: true,
  workout_reminder_time: '07:00',
  meal_reminders: true,
  meal_breakfast_time: '08:30',
  meal_lunch_time: '13:30',
  meal_dinner_time: '20:00',
  habit_reminders: true,
  habit_reminder_time: '16:00',
  lab_reminders: true,
  lab_reminder_day_of_week: 1,
  lab_reminder_time: '10:00',
  push_enabled: true,
  fcm_token: null,
};

type NotificationsApi = {
  getPermissionsAsync: () => Promise<{ status: string }>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
  setNotificationHandler: (handler: {
    handleNotification: () => Promise<{
      shouldShowAlert?: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
      shouldShowBanner: boolean;
      shouldShowList: boolean;
    }>;
  }) => void;
  scheduleNotificationAsync: (request: unknown) => Promise<string>;
  cancelAllScheduledNotificationsAsync: () => Promise<void>;
};

let notificationsApiPromise: Promise<NotificationsApi> | null = null;
let handlerInstalled = false;

async function getNotificationsApi(): Promise<NotificationsApi> {
  if (!notificationsApiPromise) {
    notificationsApiPromise = (async () => {
      const [permissionsModule, handlerModule, scheduleModule, cancelAllModule] = await Promise.all([
        import('expo-notifications/build/NotificationPermissions'),
        import('expo-notifications/build/NotificationsHandler'),
        import('expo-notifications/build/scheduleNotificationAsync'),
        import('expo-notifications/build/cancelAllScheduledNotificationsAsync'),
      ]);
      return {
        getPermissionsAsync: permissionsModule.getPermissionsAsync,
        requestPermissionsAsync: permissionsModule.requestPermissionsAsync,
        setNotificationHandler: handlerModule.setNotificationHandler,
        scheduleNotificationAsync: scheduleModule.default as unknown as (request: unknown) => Promise<string>,
        cancelAllScheduledNotificationsAsync: cancelAllModule.default,
      };
    })();
  }
  return notificationsApiPromise as Promise<NotificationsApi>;
}

async function ensureLocalHandlerInstalled(): Promise<void> {
  if (handlerInstalled) return;
  const api = await getNotificationsApi();
  api.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerInstalled = true;
}

function parseTime(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(':').map((v) => Number(v));
  return {
    hour: Number.isFinite(h) ? Math.max(0, Math.min(23, h)) : 8,
    minute: Number.isFinite(m) ? Math.max(0, Math.min(59, m)) : 0,
  };
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function requestLocalNotificationPermission(): Promise<boolean> {
  const api = await getNotificationsApi();
  await ensureLocalHandlerInstalled();
  const current = await api.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const req = await api.requestPermissionsAsync();
    status = req.status;
  }
  return status === 'granted';
}

export async function loadNotificationSettings(): Promise<UserNotificationSettings> {
  const userId = await getUserId();
  if (!userId) return DEFAULT_NOTIFICATION_SETTINGS;
  const { data } = await supabase
    .from('user_notification_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data) return DEFAULT_NOTIFICATION_SETTINGS;
  return {
    water_reminders: Boolean(data.water_reminders),
    water_reminder_interval_hours: Number(data.water_reminder_interval_hours ?? 2),
    vitamin_reminders: Boolean(data.vitamin_reminders),
    vitamin_reminder_time: String(data.vitamin_reminder_time ?? '08:00').slice(0, 5),
    workout_reminders: Boolean(data.workout_reminders),
    workout_reminder_time: String(data.workout_reminder_time ?? '07:00').slice(0, 5),
    meal_reminders: Boolean(data.meal_reminders),
    meal_breakfast_time: String(data.meal_breakfast_time ?? '08:30').slice(0, 5),
    meal_lunch_time: String(data.meal_lunch_time ?? '13:30').slice(0, 5),
    meal_dinner_time: String(data.meal_dinner_time ?? '20:00').slice(0, 5),
    habit_reminders: Boolean(data.habit_reminders),
    habit_reminder_time: String(data.habit_reminder_time ?? '16:00').slice(0, 5),
    lab_reminders: Boolean(data.lab_reminders ?? true),
    lab_reminder_day_of_week: Math.min(7, Math.max(1, Number(data.lab_reminder_day_of_week ?? 1))),
    lab_reminder_time: String(data.lab_reminder_time ?? '10:00').slice(0, 5),
    push_enabled: Boolean(data.push_enabled),
    fcm_token: data.fcm_token ? String(data.fcm_token) : null,
  };
}

export async function saveNotificationSettings(settings: UserNotificationSettings): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await supabase.from('user_notification_settings').upsert(
    {
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

async function scheduleDaily(title: string, body: string, time: string, key: string) {
  const api = await getNotificationsApi();
  const { hour, minute } = parseTime(time);
  await api.scheduleNotificationAsync({
    content: { title, body, data: { key } },
    trigger: {
      type: 'daily',
      hour,
      minute,
    },
  });
}

async function scheduleWaterEveryHours(intervalHours: number) {
  const api = await getNotificationsApi();
  await api.scheduleNotificationAsync({
    content: { title: 'Water Reminder', body: 'Time to drink water! 💧', data: { key: 'water' } },
    trigger: {
      type: 'timeInterval',
      seconds: Math.max(1, intervalHours) * 3600,
      repeats: true,
    },
  });
}

async function scheduleWeeklyLabReminder(weekday = 1, hour = 10, minute = 0) {
  const api = await getNotificationsApi();
  await api.scheduleNotificationAsync({
    content: {
      title: 'Lab Reminder',
      body: "Don't forget your pending lab tests 🔬",
      data: { key: 'lab' },
    },
    trigger: {
      type: 'weekly',
      weekday,
      hour,
      minute,
    },
  });
}

export async function applyLocalNotificationSchedules(settings: UserNotificationSettings): Promise<void> {
  const api = await getNotificationsApi();
  await ensureLocalHandlerInstalled();
  await api.cancelAllScheduledNotificationsAsync();

  if (settings.water_reminders) {
    await scheduleWaterEveryHours(settings.water_reminder_interval_hours);
  }
  if (settings.vitamin_reminders) {
    await scheduleDaily('Vitamin Reminder', 'Take your vitamins! 💊', settings.vitamin_reminder_time, 'vitamin');
  }
  if (settings.workout_reminders) {
    await scheduleDaily('Workout Reminder', 'Time to workout! 💪', settings.workout_reminder_time, 'workout');
  }
  if (settings.meal_reminders) {
    await scheduleDaily('Breakfast Reminder', 'Breakfast time. Fuel your day! 🍳', settings.meal_breakfast_time, 'meal_breakfast');
    await scheduleDaily('Lunch Reminder', 'Lunch time. Keep balanced nutrition! 🥗', settings.meal_lunch_time, 'meal_lunch');
    await scheduleDaily('Dinner Reminder', 'Dinner time. Keep it light and healthy! 🍽️', settings.meal_dinner_time, 'meal_dinner');
  }
  if (settings.habit_reminders) {
    await scheduleDaily(
      'Habit Reminder',
      'Stay strong! Reduce your coffee today ☕',
      settings.habit_reminder_time,
      'habit'
    );
  }
  if (settings.lab_reminders) {
    const { hour, minute } = parseTime(settings.lab_reminder_time);
    await scheduleWeeklyLabReminder(settings.lab_reminder_day_of_week, hour, minute);
  }
}

export async function sendTestLocalNotification(): Promise<void> {
  const api = await getNotificationsApi();
  await ensureLocalHandlerInstalled();
  await api.scheduleNotificationAsync({
    content: { title: 'Test Notification', body: 'Notifications are working correctly.' },
    trigger: null,
  });
}

export async function cancelAllLocalNotifications(): Promise<void> {
  const api = await getNotificationsApi();
  await api.cancelAllScheduledNotificationsAsync();
}

