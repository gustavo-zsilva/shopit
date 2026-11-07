import { Category, Item } from '../types';

export type Member = {
  userId: string;
  name: string;
  role: 'owner' | 'member';
};

export type ActivityEntry = {
  id: string;
  at: string;
  userId: string;
  name: string;
  text: string;
};

export type PresencePerson = {
  userId: string;
  name: string;
  mode: 'online' | 'adding';
};

export type SharedList = {
  id: string;
  title: string;
  createdAt: string;
  ownerId: string;
  inviteCode: string;
  members: Member[];
  items: Item[];
  categories?: Category[];
  activity: ActivityEntry[];
};

export type ItemOp =
  | { kind: 'add'; item: Item }
  | { kind: 'edit'; item: Item }
  | { kind: 'remove'; itemId: string; title: string }
  | { kind: 'clear' }
  | { kind: 'category'; category: Category }
  | { kind: 'drop-category'; categoryId: string; name: string };

export type HouseResult = {
  ok: boolean;
  error?: string;
  premium?: boolean;
  list?: SharedList;
  people?: PresencePerson[];
};
