import * as Linking from 'expo-linking';
import { supabase } from './supabase';

/** Must match Redirect URLs entries in Supabase Dashboard (scheme from app.json). */
export function getOAuthRedirectUri(): string {
  return Linking.createURL('auth/callback');
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
