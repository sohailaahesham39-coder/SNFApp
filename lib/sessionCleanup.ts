import { signOut as firebaseSignOut } from 'firebase/auth';
import { supabase } from './supabase';
import { getFirebaseAuth, isFirebaseConfigured } from './firebaseApp';

/** Ends Supabase session and Firebase Auth (when configured). Does not touch AsyncStorage. */
export async function signOutRemoteSessions(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Supabase signOut:', error.message);
  }

  if (isFirebaseConfigured()) {
    try {
      await firebaseSignOut(getFirebaseAuth());
    } catch {
      // Ignore if Firebase was never signed in this session.
    }
  }
}
