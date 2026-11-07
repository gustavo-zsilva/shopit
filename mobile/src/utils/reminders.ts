import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const KEY = 'reminders';
const CHANNEL = 'shopping';

export type ShoppingReminder = {
  listId: string;
  at: string;
  notificationId: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function readAll(): Promise<ShoppingReminder[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) as ShoppingReminder[] : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(reminders: ShoppingReminder[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(reminders));
}

async function ensureChannel() {
  if (Notifications.AndroidImportance == null) return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Compras',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function reminderFor(listId: string) {
  const all = await readAll();
  return all.find((reminder) => reminder.listId === listId) ?? null;
}

export async function clearReminder(listId: string) {
  const all = await readAll();
  const current = all.find((reminder) => reminder.listId === listId);
  if (current) {
    await Notifications.cancelScheduledNotificationAsync(current.notificationId).catch(() => undefined);
  }
  await writeAll(all.filter((reminder) => reminder.listId !== listId));
}

export async function scheduleReminder(listId: string, listTitle: string, when: Date) {
  const permission = await Notifications.getPermissionsAsync();
  const granted = permission.granted
    ? true
    : (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return null;
  if (when.getTime() <= Date.now()) return null;

  await ensureChannel();
  await clearReminder(listId);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora de comprar',
      body: listTitle,
      data: { listId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      channelId: CHANNEL,
    },
  });

  const reminder = { listId, at: when.toISOString(), notificationId };
  const all = await readAll();
  await writeAll([...all.filter((item) => item.listId !== listId), reminder]);
  return reminder;
}

export function describeWhen(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const sameDay = (left: Date, right: Date) => left.toDateString() === right.toDateString();
  const hour = `${date.getHours()}h`;
  const days = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  if (sameDay(date, now)) return `hoje, ${hour}`;
  if (sameDay(date, tomorrow)) return `amanhã, ${hour}`;
  return `${days[date.getDay()]}, ${hour}`;
}
