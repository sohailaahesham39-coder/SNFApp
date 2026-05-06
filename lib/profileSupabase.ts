import { supabase } from './supabase';
import type { UserProfile } from '../data/userStore';
import { loadProfile, saveProfile } from '../data/userStore';

function isFilledProfile(row: unknown): row is UserProfile {
  if (!row || typeof row !== 'object') return false;
  const p = row as Record<string, unknown>;
  return typeof p.name === 'string' && !!String(p.name).trim();
}

/** Saves profile JSON to Supabase for the signed-in user. Fails softly (returns false). */
export async function upsertRemoteProfile(profile: UserProfile): Promise<boolean> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) return false;

    const row = {
      id: uid,
      email: (profile.email || sessionData.session?.user.email || '').trim(),
      data: profile,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(row, {
      onConflict: 'id',
    });
    if (error) {
      console.warn('upsertRemoteProfile:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('upsertRemoteProfile failed', e);
    return false;
  }
}

/**
 * Loads remote profile and writes it to local cache if Supabase returned a usable document.
 * Returns the merged profile used by the app (remote wins when valid).
 */
export async function pullRemoteProfileIntoCache(): Promise<UserProfile | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) return await loadProfile();

    const { data, error } = await supabase
      .from('profiles')
      .select('data,updated_at')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      console.warn('pullRemoteProfile:', error.message);
      return await loadProfile();
    }

    const remote = data?.data;
    if (!isFilledProfile(remote)) {
      const local = await loadProfile();
      if (local) await upsertRemoteProfile(local).catch(() => undefined);
      return local;
    }

    await saveProfile(remote);
    return remote;
  } catch (e) {
    console.warn('pullRemoteProfileIntoCache failed', e);
    return await loadProfile();
  }
}

/** Local save then background push to Supabase (non-blocking on failure). */
export async function saveProfileLocallyAndPush(profile: UserProfile): Promise<void> {
  await saveProfile(profile);
  void upsertRemoteProfile(profile);
}
