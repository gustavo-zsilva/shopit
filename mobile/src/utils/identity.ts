import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { DEFAULT_SERVER } from '../config';

const PROFILE_KEY = 'profile';
const SERVER_KEY = 'serverUrl';

export type Profile = {
  id: string;
  name: string;
};

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    const parsed = raw ? JSON.parse(raw) as Profile : null;
    if (parsed?.id) return { id: parsed.id, name: parsed.name?.trim() || 'Eu' };
  } catch {
    // Gera um perfil novo se o que estava salvo não abre.
  }

  const profile = { id: Crypto.randomUUID(), name: 'Eu' };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export async function saveProfile(profile: Profile) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadServerUrl() {
  const saved = await AsyncStorage.getItem(SERVER_KEY);
  return saved?.trim() || DEFAULT_SERVER;
}

export async function saveServerUrl(url: string) {
  await AsyncStorage.setItem(SERVER_KEY, url.trim() || DEFAULT_SERVER);
}
