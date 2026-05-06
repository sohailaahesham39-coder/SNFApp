/**
 * OAuth `auth/callback` deep links are handled in `app/_layout.tsx` (root) so one listener
 * runs for the whole app. After `exchangeCodeForSession`, routing uses `loadProfile()` there.
 */
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}