import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { loadProfile } from '../data/userStore';
import { pullRemoteProfileIntoCache } from '../lib/profileSupabase';

function Inner() {
  const { isDark } = useTheme();
  const router = useRouter();

  useEffect(() => {
    async function handleAuthCallback(url: string) {
      if (!url || !url.includes('auth/callback')) return;
      const parsed = Linking.parse(url);
      const query = (parsed.queryParams ?? {}) as Record<string, string | undefined>;

      if (query.code) {
        const { error } = await supabase.auth.exchangeCodeForSession(query.code);
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