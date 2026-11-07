import type { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';

export type CategoryIcon = Extract<
  ComponentProps<typeof Feather>['name'],
  | 'shopping-bag'
  | 'coffee'
  | 'droplet'
  | 'package'
  | 'home'
  | 'heart'
  | 'sun'
  | 'star'
  | 'tag'
  | 'gift'
  | 'truck'
  | 'smile'
>;

export const CATEGORY_COLORS = [
  '#1B6B4A',
  '#5E8A6A',
  '#3D6E78',
  '#3E4654',
  '#8A6110',
  '#A85A48',
  '#6E5568',
  '#8A7054',
] as const;

export const CATEGORY_ICONS: CategoryIcon[] = [
  'shopping-bag',
  'coffee',
  'droplet',
  'package',
  'home',
  'heart',
  'sun',
  'star',
  'tag',
  'gift',
  'truck',
  'smile',
];

export const MAX_CATEGORIES = 12;

export function sanitizeCategory(value: {
  id?: string;
  name?: string;
  color?: string;
  icon?: string;
} | null | undefined): { id: string; name: string; color: string; icon: CategoryIcon } | null {
  if (!value?.id || typeof value.name !== 'string') return null;
  const name = value.name.trim().slice(0, 24);
  if (!name) return null;
  const color: string = CATEGORY_COLORS.find((entry) => entry === value.color) ?? CATEGORY_COLORS[0];
  const icon: CategoryIcon = CATEGORY_ICONS.find((entry) => entry === value.icon) ?? 'shopping-bag';
  return { id: value.id, name, color, icon };
}
