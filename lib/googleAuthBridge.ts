import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';
import { supabase } from './supabase';
import { getFirebaseAuth } from './firebaseApp';
import { findProfileByEmail, readProviderFromProfile, upsertProfileRow } from './authProfileSync';
import { migrateLocalDataToSupabaseAndCleanup } from './localToSupabaseMigration';

export type GoogleAuthIntent = 'signIn' | 'signUp';

export type GoogleAuthBridgeOk = { onboarding: boolean };

/** Firebase + Supabase session sync using the same Google ID token (OAuth Web client). */
export async function signInWithGoogleIdTokenBridge(
  idToken: string,
  intent: GoogleAuthIntent,
): Promise<GoogleAuthBridgeOk | { error: string }> {
  const auth = getFirebaseAuth();
  const cred = GoogleAuthProvider.credential(idToken);
  const firebaseCred = await signInWithCredential(auth, cred);
  const googleEmail = firebaseCred.user.email?.trim().toLowerCase();

  if (googleEmail) {
    const existing = await findProfileByEmail(googleEmail);
    const provider = readProviderFromProfile(existing);
    if (existing && provider === 'email') {
      await firebaseSignOut(auth).catch(() => undefined);
      return {
        error: 'This email is registered with Email/Password. Please login normally.',
      };
    }
  }

  const { error: sbError } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (sbError) {
    await firebaseSignOut(auth).catch(() => undefined);
    return { error: sbError.message ?? 'Could not sync session (Supabase)' };
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (user?.id && user.email) {
    const { error: profileError } = await upsertProfileRow({
      id: user.id,
      email: user.email,
      fullName: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? '').trim(),
      avatarUrl: String(user.user_metadata?.avatar_url ?? ''),
      provider: 'google',
    });
    if (profileError) {
      await firebaseSignOut(auth).catch(() => undefined);
      return { error: profileError.message ?? 'Could not sync profile data.' };
    }
  }

  if (intent === 'signUp') {
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    if (u?.email) {
      await AsyncStorage.setItem(
        'sn_temp_user',
        JSON.stringify({
          name: String(u.user_metadata?.full_name ?? u.user_metadata?.name ?? '').trim(),
          email: u.email.trim().toLowerCase(),
        }),
      );
    }
    await migrateLocalDataToSupabaseAndCleanup();
    return { onboarding: true };
  }

  await migrateLocalDataToSupabaseAndCleanup();
  return { onboarding: false };
}
