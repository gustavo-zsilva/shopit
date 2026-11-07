import * as Haptics from 'expo-haptics';

export function tap(kind: 'light' | 'success' | 'warning' = 'light') {
  const action = kind === 'success'
    ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    : kind === 'warning'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  action.catch(() => undefined);
}
