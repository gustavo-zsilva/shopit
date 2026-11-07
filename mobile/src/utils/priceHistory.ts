import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const KEY = 'priceHistory';
const LIMIT = 400;

export type PriceRecord = {
  id: string;
  title: string;
  price: number;
  store: string;
  barcode?: string;
  at: string;
};

function normalize(title: string) {
  return title.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

async function readAll(): Promise<PriceRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) as PriceRecord[] : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordPrice(input: { title: string; price: number; store?: string; barcode?: string }) {
  const title = input.title.trim();
  if (!title || !(input.price > 0)) return;

  const store = input.store?.trim() || '';
  const all = await readAll();
  const latest = all.find((record) => (
    (input.barcode && record.barcode === input.barcode) || normalize(record.title) === normalize(title)
  ));
  const sameDay = latest
    && latest.price === input.price
    && latest.store === store
    && new Date(latest.at).toDateString() === new Date().toDateString();
  if (sameDay) return;

  all.unshift({
    id: Crypto.randomUUID(),
    title,
    price: input.price,
    store,
    barcode: input.barcode,
    at: new Date().toISOString(),
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(all.slice(0, LIMIT)));
}

export async function pricesFor(title: string, barcode?: string) {
  const folded = normalize(title);
  if (!folded && !barcode) return [];
  const all = await readAll();
  return all.filter((record) => (
    (barcode && record.barcode === barcode) || normalize(record.title) === folded
  )).slice(0, 8);
}
