import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { signInWithOAuthProvider } from '../../lib/oauth';
import { mapAuthErrorToArabic } from '../../lib/authErrors';

type Props = {
  disabled?: boolean;
  onError?: (message: string) => void;
  /** After Google + Firebase succeeds: sign-in goes home; sign-up stores temp profile and opens onboarding */
  intent?: 'signIn' | 'signUp';
};

export default function FirebaseGoogleSignIn(props: Props) {
  return <FirebaseGoogleConfigured {...props} />;
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

function FirebaseGoogleConfigured({
  disabled,
  onError,
}: Props) {
  const [busy, setBusy] = useState(false);

  async function onPress() {
    onError?.('');
    setBusy(true);
    try {
      const { error } = await signInWithOAuthProvider('google');
      if (error) {
        onError?.(mapAuthErrorToArabic(error.message ?? 'Google sign-in failed'));
      }
    } catch (e: unknown) {
      setBusy(false);
      const msg = e instanceof Error ? e.message : 'Google sign-in failed';
      onError?.(mapAuthErrorToArabic(msg));
      return;
    }
    setBusy(false);
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
