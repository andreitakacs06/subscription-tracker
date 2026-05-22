import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { parseISO, subDays } from 'date-fns';
import { Subscription } from '@/types';
import { formatCurrency } from '@/utils/format';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('renewals', {
    name: 'Renewal reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#7DD3FC',
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  await ensureAndroidChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;
  if (!existing.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.status === 'granted';
}

export async function cancelNotification(id?: string | null): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
  }
}

export async function scheduleRenewalReminder(
  sub: Subscription,
  leadDays: number,
): Promise<string | null> {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const renewal = parseISO(sub.renewalDate);
  const fireAt = subDays(renewal, leadDays);
  fireAt.setHours(9, 0, 0, 0);

  if (fireAt.getTime() <= Date.now()) {
    return null;
  }

  const dayLabel =
    leadDays === 0
      ? 'today'
      : leadDays === 1
      ? 'tomorrow'
      : `in ${leadDays} days`;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${sub.name} renews ${dayLabel}`,
      body: `${formatCurrency(sub.price, sub.currency)} will be charged on ${renewal.toLocaleDateString()}.`,
      data: { subscriptionId: sub.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
      channelId: 'renewals',
    },
  });
}

export async function rescheduleReminder(
  sub: Subscription,
  leadDays: number,
  enabled: boolean,
): Promise<string | null> {
  await cancelNotification(sub.notificationId);
  if (!enabled) return null;
  return scheduleRenewalReminder(sub, leadDays);
}
