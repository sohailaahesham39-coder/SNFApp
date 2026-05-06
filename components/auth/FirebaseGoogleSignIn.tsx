import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { isFirebaseConfigured } from '../../lib/firebaseApp';
import { signInWithGoogleIdTokenBridge } from '../../lib/googleAuthBridge';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  disabled?: boolean;
  onError?: (message: string) => void;
  /** After Google + Firebase succeeds: sign-in goes home; sign-up stores temp profile and opens onboarding */
  intent?: 'signIn' | 'signUp';
};

/**
 * Uses OAuth client IDs from Firebase / Google Cloud (same project).
 * EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = Web client ID from Google Cloud Console
 * (Project settings → Your apps → Web, or Credentials → OAuth 2.0 Client IDs → Web).
 */
export default function FirebaseGoogleSignIn(props: Props) {
  const webClientId = (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '').trim();
  if (!webClientId) {
    return (
      <GoogleShellButton
        label="Google"
        disabled={props.disabled}
        onPress={() =>
          props.onError?.(
            'Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (Web OAuth client from Google Cloud / Firebase).',
          )
        }
      />
    );
  }
  return <FirebaseGoogleConfigured webClientId={webClientId} {...props} />;
}

function GoogleShellButton(props: {
  label: string;
  disabled?: boolean;
  busy?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.socialBtn} onPress={props.onPress} disabled={props.disabled || props.busy}>
      <Text style={s.socialIcon}>G</Text>
      <Text style={s.socialTxt}>{props.busy ? 'Opening…' : props.label}</Text>
    </TouchableOpacity>
  );
}

/** Only mounted when Web client ID is configured (avoid fake client IDs / invalid hooks). */
function FirebaseGoogleConfigured({
  webClientId,
  disabled,
  onError,
  intent = 'signIn',
}: Props & { webClientId: string }) {
  const [busy, setBusy] = useState(false);
  const useProxy = Constants.appOwnership === 'expo';
  const redirectUri = useProxy
    ? (AuthSession.makeRedirectUri as any)({ useProxy: true })
    : AuthSession.makeRedirectUri({ scheme: 'smartnutrition', path: 'auth/callback' } as any);

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId,
    redirectUri,
  } as any);

  useEffect(() => {
    if (!response) return;

    if (response.type === 'error') {
      setBusy(false);
      onError?.(response.error?.message ?? 'Google sign-in failed');
      return;
    }

    if (response.type !== 'success') {
      setBusy(false);
      return;
    }

    const params = response.params as Record<string, string> | undefined;
    const idToken = params?.id_token;

    if (!idToken) {
      setBusy(false);
      onError?.('No ID token from Google. Check Web client ID and OAuth consent.');
      return;
    }

    (async () => {
      try {
        if (!isFirebaseConfigured()) {
          onError?.('Firebase is not configured in the app (.env).');
          return;
        }
        const result = await signInWithGoogleIdTokenBridge(idToken, intent);
        if ('error' in result) {
          onError?.(result.error);
          return;
        }
        router.replace(result.onboarding ? '/onboarding/step1' : '/(tabs)/home');
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Google sign-in failed';
        onError?.(msg);
      } finally {
        setBusy(false);
      }
    })();
  }, [response, onError, intent]);

  async function onPress() {
    if (!isFirebaseConfigured()) {
      onError?.('Set EXPO_PUBLIC_FIREBASE_* in .env (see env.example).');
      return;
    }
    setBusy(true);
    try {
      await promptAsync({ useProxy, showInRecents: true } as any);
    } catch {
      setBusy(false);
      onError?.('Could not open Google sign-in.');
    }
  }

  return <GoogleShellButton label="Google" disabled={disabled} busy={busy} onPress={onPress} />;
}

const s = StyleSheet.create({
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  socialIcon: { fontSize: 18, fontWeight: '900', color: '#4285F4' },
  socialTxt: { fontSize: 14, fontWeight: '600', color: '#ccc' },
});
