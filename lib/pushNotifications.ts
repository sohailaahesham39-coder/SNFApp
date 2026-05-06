import { Platform } from 'react-native';
import { supabase } from './supabase';

let unsubscribeForeground: (() => void) | null = null;
let unsubscribeOpened: (() => void) | null = null;

type PushNavigatePayload = {
  target?: string;
  [key: string]: unknown;
};

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

async function upsertFcmToken(token: string): Promise<void> {
  const userId = await getUserId();
  if (!userId || !token) return;

  await supabase.from('user_notification_settings').upsert(
    {
      user_id: userId,
      fcm_token: token,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  await supabase
    .from('profiles')
    .update({ fcm_token: token, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export async function setupPushNotifications(
  onNavigate: (payload: PushNavigatePayload) => void
): Promise<void> {
  if (Platform.OS === 'web') return;

  const messaging = (await import('@react-native-firebase/messaging')).default;

  await messaging().requestPermission();
  const token = await messaging().getToken();
  if (token) {
    await upsertFcmToken(token);
  }

  unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    const payload = (remoteMessage?.data ?? {}) as PushNavigatePayload;
    if (payload.target) {
      // Keep navigation deterministic in foreground if payload includes target.
      onNavigate(payload);
    }
  });

  unsubscribeOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
    const payload = (remoteMessage?.data ?? {}) as PushNavigatePayload;
    if (payload.target) onNavigate(payload);
  });

  const initialMessage = await messaging().getInitialNotification();
  if (initialMessage?.data) {
    const payload = initialMessage.data as PushNavigatePayload;
    if (payload.target) onNavigate(payload);
  }
}

export async function clearPushTokenOnLogout(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await supabase
    .from('user_notification_settings')
    .update({ fcm_token: null, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  await supabase
    .from('profiles')
    .update({ fcm_token: null, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export function cleanupPushListeners(): void {
  if (unsubscribeForeground) {
    unsubscribeForeground();
    unsubscribeForeground = null;
  }
  if (unsubscribeOpened) {
    unsubscribeOpened();
    unsubscribeOpened = null;
  }
}

