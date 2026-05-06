import { supabase } from './supabase';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatHistoryRow {
  id: string;
  user_id: string;
  session_id: string;
  role: ChatRole;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function loadChatHistory(sessionId = 'default', limit = 120): Promise<ChatHistoryRow[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) return [];
  return (data as ChatHistoryRow[]) ?? [];
}

export async function appendChatMessage(
  role: ChatRole,
  message: string,
  sessionId = 'default',
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  await supabase.from('chat_history').insert({
    user_id: userId,
    session_id: sessionId,
    role,
    message,
    metadata,
  });
}

export async function clearChatHistory(sessionId = 'default'): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  await supabase
    .from('chat_history')
    .delete()
    .eq('user_id', userId)
    .eq('session_id', sessionId);
}
