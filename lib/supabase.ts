import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SupabaseErrorLike = { message: string };

function createFallbackSupabase(): SupabaseClient {
  const missingEnvError: SupabaseErrorLike = {
    message:
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment.',
  };

    return {
      auth: {
        signInWithPassword: async () => ({ data: null, error: missingEnvError }),
        signUp: async () => ({ data: null, error: missingEnvError }),
        signInWithOAuth: async () => ({ data: null, error: missingEnvError }),
        signInWithIdToken: async () => ({ data: null, error: missingEnvError }),
        signOut: async () => ({ error: missingEnvError }),
        getUser: async () => ({ data: { user: null }, error: missingEnvError }),
        getSession: async () => ({ data: { session: null }, error: missingEnvError }),
      },
    from: () => ({
      select: () => ({
        limit: async () => ({ data: null, error: missingEnvError }),
        eq: async () => ({ data: null, error: missingEnvError }),
        ilike: async () => ({ data: null, error: missingEnvError }),
        single: async () => ({ data: null, error: missingEnvError }),
      }),
      insert: async () => ({ data: null, error: missingEnvError }),
      upsert: async () => ({ data: null, error: missingEnvError }),
    }),
  } as unknown as SupabaseClient;
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : createFallbackSupabase();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment.',
  );
}
