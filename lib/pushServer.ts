import { supabase } from './supabase';
import type { PushEventType } from './pushEventTemplates';

type SendPushEventArgs = {
  userId: string;
  eventType: PushEventType;
  target?: string;
  streakDays?: number;
};

export async function sendPushEventViaServer(args: SendPushEventArgs): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke('send-push', {
    body: args,
  });
  if (error) return { ok: false, error: error.message };
  if ((data as any)?.error) return { ok: false, error: (data as any).error };
  return { ok: true };
}

