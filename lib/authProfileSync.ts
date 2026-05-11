import { supabase } from './supabase';

export type AuthProviderType = 'email' | 'google' | 'apple';

export type PublicProfileRow = {
  id: string;
  email: string | null;
  data: Record<string, unknown> | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findProfileByEmail(email: string): Promise<PublicProfileRow | null> {
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,data')
    .ilike('email', normalized)
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return (data as PublicProfileRow | null) ?? null;
}

export function readProviderFromProfile(row: PublicProfileRow | null): AuthProviderType | null {
  if (!row?.data) return null;
  const provider = row.data.provider;
  if (provider === 'email' || provider === 'google' || provider === 'apple') return provider;
  return null;
}

export async function upsertProfileRow(params: {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  provider: AuthProviderType;
}) {
  const normalizedEmail = normalizeEmail(params.email);
  const payload = {
    id: params.id,
    email: normalizedEmail,
    data: {
      full_name: params.fullName ?? '',
      avatar_url: params.avatarUrl ?? '',
      provider: params.provider,
      created_at: new Date().toISOString(),
    },
    updated_at: new Date().toISOString(),
  };

  return supabase.from('profiles').upsert(payload, { onConflict: 'id' });
}

export async function ensureCurrentUserProfile(provider: AuthProviderType = 'email') {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user?.id || !user.email) return { error: null };

  return upsertProfileRow({
    id: user.id,
    email: user.email,
    fullName: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? '').trim(),
    avatarUrl: String(user.user_metadata?.avatar_url ?? ''),
    provider,
  });
}

