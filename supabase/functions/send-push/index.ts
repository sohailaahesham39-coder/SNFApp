// @ts-nocheck
// Supabase Edge Function: send-push
// Sends FCM HTTP v1 notifications for SNF event templates.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type PushEventType =
  | 'health_plan_update'
  | 'weekly_progress_summary'
  | 'new_recommendations'
  | 'streak_achievement';

function buildTemplate(eventType: PushEventType, target = '/(tabs)/home', streakDays = 7) {
  switch (eventType) {
    case 'health_plan_update':
      return {
        title: 'Health plan updated',
        body: 'Your latest health plan is ready. Open Health tab to review details.',
        data: { type: eventType, target: '/(tabs)/health' },
      };
    case 'weekly_progress_summary':
      return {
        title: 'Weekly progress summary',
        body: 'Your new weekly summary is ready. Check your profile progress now.',
        data: { type: eventType, target: '/(tabs)/profile' },
      };
    case 'new_recommendations':
      return {
        title: 'New recommendations available',
        body: 'Fresh meal and workout recommendations are ready for you.',
        data: { type: eventType, target: '/(tabs)/home' },
      };
    case 'streak_achievement':
      return {
        title: 'Streak achievement',
        body: `You completed ${streakDays} days! Keep going 🎉`,
        data: { type: eventType, target },
      };
  }
}

async function getGoogleAccessToken(clientEmail: string, privateKey: string, tokenUri: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwtClaim = btoa(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: tokenUri,
      exp: now + 3600,
      iat: now,
    })
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const key = await crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(
      atob(privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '')),
      (c) => c.charCodeAt(0)
    ),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${jwtHeader}.${jwtClaim}`)
  );
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const assertion = `${jwtHeader}.${jwtClaim}.${signature}`;

  const resp = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const json = await resp.json();
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const {
    userId,
    eventType,
    target,
    streakDays,
  }: { userId?: string; eventType?: PushEventType; target?: string; streakDays?: number } = await req.json();

  if (!userId || !eventType) {
    return new Response(JSON.stringify({ error: 'userId and eventType are required' }), { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const fcmProjectId = Deno.env.get('FCM_PROJECT_ID')!;
  const fcmClientEmail = Deno.env.get('FCM_CLIENT_EMAIL')!;
  const fcmPrivateKey = Deno.env.get('FCM_PRIVATE_KEY')!;
  const fcmTokenUri = Deno.env.get('FCM_TOKEN_URI') ?? 'https://oauth2.googleapis.com/token';

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: row } = await admin
    .from('user_notification_settings')
    .select('fcm_token,push_enabled')
    .eq('user_id', userId)
    .maybeSingle();

  if (!row?.push_enabled || !row?.fcm_token) {
    return new Response(JSON.stringify({ ok: true, skipped: 'push disabled or token missing' }));
  }

  const accessToken = await getGoogleAccessToken(fcmClientEmail, fcmPrivateKey, fcmTokenUri);
  const msg = buildTemplate(eventType, target, streakDays);

  const endpoint = `https://fcm.googleapis.com/v1/projects/${fcmProjectId}/messages:send`;
  const pushResp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token: row.fcm_token,
        notification: {
          title: msg.title,
          body: msg.body,
        },
        data: msg.data,
      },
    }),
  });

  const pushJson = await pushResp.json();
  if (!pushResp.ok) {
    return new Response(JSON.stringify({ error: pushJson }), { status: 500 });
  }
  return new Response(JSON.stringify({ ok: true, result: pushJson }), { status: 200 });
});

