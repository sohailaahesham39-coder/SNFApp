import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { loadProfile } from '../data/userStore';
import { pullRemoteProfileIntoCache } from '../lib/profileSupabase';
import {
  applyLocalNotificationSchedules,
  loadNotificationSettings,
  requestLocalNotificationPermission,
} from '../lib/localNotifications';
import { cleanupPushListeners, setupPushNotifications } from '../lib/pushNotifications';

function Inner() {
  const { isDark } = useTheme();
  const router = useRouter();

  useEffect(() => {
    function parseHashParams(url: string): Record<string, string> {
      const hashIndex = url.indexOf('#');
      if (hashIndex === -1) return {};
      const params = new URLSearchParams(url.slice(hashIndex + 1));
      const out: Record<string, string> = {};
      params.forEach((v, k) => {
        out[k] = v;
      });
      return out;
    }

    async function handleAuthCallback(url: string) {
      if (!url || !url.includes('auth/callback')) return;
      const parsed = Linking.parse(url);
      const query = (parsed.queryParams ?? {}) as Record<string, string | undefined>;
      const hash = parseHashParams(url);
      const code = query.code ?? hash.code;
      const type = query.type ?? hash.type;
      const accessToken = query.access_token ?? hash.access_token;
      const refreshToken = query.refresh_token ?? hash.refresh_token;

      if (type === 'recovery' && (code || (accessToken && refreshToken))) {
        router.replace({
          pathname: '/(auth)/reset-password',
          params: {
            ...(code ? { code } : {}),
            ...(accessToken ? { access_token: accessToken } : {}),
            ...(refreshToken ? { refresh_token: refreshToken } : {}),
            type: 'recovery',
          },
        });
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          await pullRemoteProfileIntoCache();
          const profile = await loadProfile();
          if (profile?.name?.trim()) {
            router.replace('/(tabs)/home');
          } else {
            router.replace('/onboarding/step1');
          }
        }
      }
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleAuthCallback(url).catch(() => {});
    });

    const sub = Linking.addEventListener('url', ({ url }) => {
      handleAuthCallback(url).catch(() => {});
    });

    return () => {
      sub.remove();
    };
  }, [router]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await pullRemoteProfileIntoCache().catch(() => undefined);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const init = async () => {
      const allowed = await requestLocalNotificationPermission();
      if (allowed) {
        const settings = await loadNotificationSettings();
        await applyLocalNotificationSchedules(settings);
      }
      // Expo Go does not support remote push notifications.
      // Keep local reminders enabled, and skip push setup here.
      if (Constants.appOwnership !== 'expo') {
        await setupPushNotifications((payload) => {
          const target = payload.target;
          if (typeof target === 'string' && target.startsWith('/')) {
            router.push(target as never);
          } else {
            router.push('/(tabs)/home');
          }
        });
      }
    };
    init().catch(() => {});
    return () => {
      cleanupPushListeners();
    };
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Inner />
    </ThemeProvider>
  );
}