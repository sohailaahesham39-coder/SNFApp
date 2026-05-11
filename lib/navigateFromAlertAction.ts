import { router } from 'expo-router';

/** Maps plain-text `user_alerts.action` strings to expo-router paths. */
export function navigateFromAlertAction(action: string): void {
  const t = action.toLowerCase();
  const hay = (needle: string) => t.includes(needle);

  if (hay('habit')) {
    router.push('/habits');
    return;
  }
  if (hay('meal') || hay('nutrition') || hay('food')) {
    router.push('/(tabs)/meals');
    return;
  }
  if (hay('workout') || hay('exercise')) {
    router.push('/(tabs)/workout');
    return;
  }
  if (hay('analytic') || hay('progress') || hay('stat')) {
    router.push('/analytics');
    return;
  }
  if (hay('chat') || hay('assistant') || hay('coach')) {
    router.push('/(tabs)/chat');
    return;
  }
  if (hay('profile') || hay('setting')) {
    router.push('/(tabs)/profile');
    return;
  }
  if (hay('home') || hay('dashboard')) {
    router.push('/(tabs)/home');
    return;
  }
  if (hay('lab') || hay('test')) {
    router.push('/(tabs)/health');
    return;
  }
  router.push('/(tabs)/health');
}
