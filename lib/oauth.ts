import { supabase } from './supabase';
import * as Linking from 'expo-linking';

/** Must match Redirect URLs entries in Supabase Dashboard (scheme from app.json). */
export function getOAuthRedirectUri(): string {
  // Use a stable deep link to avoid localhost/browser fallback redirects.
  // This must exist in Supabase Auth Redirect URLs and Google OAuth redirect setup.
  return 'smartnutrition://auth/callback';
}

export async function signInWithOAuthProvider(provider: 'google' | 'apple'): Promise<{ error: Error | null }> {
  const redirectTo = getOAuthRedirectUri();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return { error: error as Error };
  }
  if (data?.url) {
    await Linking.openURL(data.url);
    return { error: null };
  }
  return { error: new Error('No OAuth URL returned') };
}
