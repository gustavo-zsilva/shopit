export const DEFAULT_SERVER = process.env.EXPO_PUBLIC_SHOPIT_SERVER || 'http://192.168.0.239:8787';

export function houseUrl(value: string) {
  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed) return DEFAULT_SERVER;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}
