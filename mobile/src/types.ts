import { CategoryIcon } from './categories';

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: CategoryIcon;
};

export type ShoppingList = {
  id: string;
  title: string;
  createdAt: string;
  shared?: boolean;
  inviteCode?: string;
  ownerId?: string;
};

export type Item = {
  id: string;
  title: string;
  price: number;
  unities: number;
  isCompleted: boolean;
  barcode?: string;
  note?: string;
  store?: string;
  categoryId?: string;
};

export type RecurringPurchase = {
  id: string;
  listId: string;
  title: string;
  unities: number;
  note?: string;
  intervalDays: number;
  nextAt: string;
};

export type ListStats = {
  count: number;
  done: number;
  total: number;
};
