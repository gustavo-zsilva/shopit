import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { enqueueStorage } from './storageQueue';
import { Item, RecurringPurchase } from '../types';

const RULES_KEY = 'recurring';
const ITEMS_KEY = 'items';

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export async function readRecurring(): Promise<RecurringPurchase[]> {
  try {
    const raw = await AsyncStorage.getItem(RULES_KEY);
    const parsed = raw ? JSON.parse(raw) as RecurringPurchase[] : [];
    return Array.isArray(parsed) ? parsed.filter((rule) => rule?.id && rule.listId && rule.title) : [];
  } catch {
    return [];
  }
}

export async function saveRecurring(rules: RecurringPurchase[]) {
  await AsyncStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export async function upsertRecurring(rule: RecurringPurchase) {
  const all = await readRecurring();
  const next = all.some((item) => item.id === rule.id)
    ? all.map((item) => (item.id === rule.id ? rule : item))
    : [...all, rule];
  await saveRecurring(next);
}

export async function deleteRecurring(id: string) {
  const all = await readRecurring();
  await saveRecurring(all.filter((rule) => rule.id !== id));
}

export async function applyDueRecurring(now = new Date()) {
  await enqueueStorage(async () => {
    const rules = await readRecurring();
    const today = startOfDay(now);
    const due = rules.filter((rule) => startOfDay(new Date(rule.nextAt)).getTime() <= today.getTime());
    if (!due.length) return;

    const rawItems = await AsyncStorage.getItem(ITEMS_KEY);
    const lists = rawItems ? JSON.parse(rawItems) as { id: string; items: Item[] }[] : [];

    for (const rule of due) {
      let entry = lists.find((list) => list.id === rule.listId);
      if (!entry) {
        entry = { id: rule.listId, items: [] };
        lists.push(entry);
      }
      const alreadyThere = entry.items.some((item) => (
        !item.isCompleted && item.title.trim().toLocaleLowerCase() === rule.title.trim().toLocaleLowerCase()
      ));
      if (!alreadyThere) {
        entry.items.push({
          id: Crypto.randomUUID(),
          title: rule.title,
          price: 0,
          unities: rule.unities || 1,
          note: rule.note,
          isCompleted: false,
        });
      }

      const next = new Date(rule.nextAt);
      do {
        next.setDate(next.getDate() + Math.max(1, rule.intervalDays));
      } while (startOfDay(next).getTime() <= today.getTime());
      rule.nextAt = next.toISOString();
    }

    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(lists));
    await saveRecurring(rules);
  });
}
