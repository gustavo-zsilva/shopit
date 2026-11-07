import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'usage';
export const FREE_MONTHLY_USES = 3;

export type QuotaKind = 'voice' | 'pricePhoto';

export type Quota = {
  month: string;
  voice: number;
  pricePhoto: number;
};

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function empty(): Quota {
  return { month: monthKey(), voice: 0, pricePhoto: 0 };
}

export async function readQuota(): Promise<Quota> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) as Quota : null;
    if (!parsed || parsed.month !== monthKey()) return empty();
    return {
      month: parsed.month,
      voice: Number(parsed.voice) || 0,
      pricePhoto: Number(parsed.pricePhoto) || 0,
    };
  } catch {
    return empty();
  }
}

export function remainingUses(quota: Quota, kind: QuotaKind, premium: boolean) {
  if (premium) return null;
  return Math.max(0, FREE_MONTHLY_USES - quota[kind]);
}

export async function consumeQuota(kind: QuotaKind, premium: boolean) {
  if (premium) return true;
  const quota = await readQuota();
  if (quota[kind] >= FREE_MONTHLY_USES) return false;
  quota[kind] += 1;
  await AsyncStorage.setItem(KEY, JSON.stringify(quota));
  return true;
}
