import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useLists } from './ListContext';
import { rememberPrice } from '../utils/products';
import { recordPrice } from '../utils/priceHistory';
import { emitItemOp } from '../realtime/bridge';
import { enqueueStorage } from '../utils/storageQueue';
import { sanitizeCategory, MAX_CATEGORIES } from '../categories';
import { Category, Item } from '../types';

const ITEMS_KEY = 'items';

type StoredList = {
  id: string;
  items: Item[];
  categories?: Category[];
};

type ItemPatch = Partial<Omit<Item, 'id' | 'categoryId'>> & { categoryId?: string | null };

type ItemContextValue = {
  items: Item[];
  categories: Category[];
  totalPrice: number;
  estimatedPrice: number;
  addItem: (item: Item) => void;
  updateItem: (id: string, patch: ItemPatch) => void;
  moveItem: (id: string, categoryId: string | null) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  clearItems: () => void;
  addCategory: (category: Category) => boolean;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  reloadItems: () => Promise<void>;
  replaceItems: (items: Item[], categories?: Category[]) => void;
};

const ItemContext = createContext<ItemContextValue | null>(null);

function sanitizeItem(value: Partial<Item> | null | undefined): Item | null {
  if (!value?.id || typeof value.title !== 'string') return null;
  const unities = Math.max(1, Math.round(Number(value.unities) || 1));
  const price = Number(value.price);
  return {
    id: value.id,
    title: value.title,
    price: Number.isFinite(price) ? price : 0,
    unities,
    isCompleted: Boolean(value.isCompleted),
    barcode: typeof value.barcode === 'string' ? value.barcode : undefined,
    note: typeof value.note === 'string' && value.note.trim() ? value.note.trim() : undefined,
    store: typeof value.store === 'string' && value.store.trim() ? value.store.trim() : undefined,
    categoryId: typeof value.categoryId === 'string' && value.categoryId ? value.categoryId : undefined,
  };
}

function readStored(entry: StoredList | undefined) {
  const categories = (entry?.categories ?? [])
    .map((category) => sanitizeCategory(category))
    .filter((category): category is Category => category !== null);
  const ids = new Set(categories.map((category) => category.id));
  const items = (entry?.items ?? [])
    .map((item) => sanitizeItem(item))
    .filter((item): item is Item => item !== null)
    .map((item) => (item.categoryId && !ids.has(item.categoryId) ? { ...item, categoryId: undefined } : item));
  return { items, categories };
}

export function ItemProvider({ children }: { children: ReactNode }) {
  const { currentList, refreshStats } = useLists();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const skipNextWrite = useRef(true);
  const loadToken = useRef(0);

  useEffect(() => {
    if (!currentList) {
      setItems([]);
      setCategories([]);
      setLoadedId(null);
      return;
    }

    const token = ++loadToken.current;
    const listId = currentList.id;
    setLoadedId(null);

    AsyncStorage.getItem(ITEMS_KEY)
      .then((raw) => {
        if (token !== loadToken.current) return;
        const all = raw ? JSON.parse(raw) as StoredList[] : [];
        const found = all.find((entry) => entry.id === listId);
        const next = readStored(found);
        setItems(next.items);
        setCategories(next.categories);
        setLoadedId(listId);
      })
      .catch((error) => console.error(error));
  }, [currentList]);

  useEffect(() => {
    if (!loadedId) {
      skipNextWrite.current = true;
      return;
    }
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }

    const listId = loadedId;
    const snapshot = items;
    const categorySnapshot = categories;

    enqueueStorage(async () => {
      const raw = await AsyncStorage.getItem(ITEMS_KEY);
      const all = raw ? JSON.parse(raw) as StoredList[] : [];
      const index = all.findIndex((entry) => entry.id === listId);
      const previous = index === -1 ? undefined : all[index];
      const nextEntry = { ...previous, id: listId, items: snapshot, categories: categorySnapshot };

      if (index === -1) all.push(nextEntry);
      else all[index] = nextEntry;

      await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(all));
      await refreshStats();
    }).catch((error) => console.error(error));
  }, [items, categories, loadedId, refreshStats]);

  function addItem(item: Item) {
    setItems((current) => [...current, item]);
    void rememberPrice(item.barcode, item.title, item.price, item.store);
    void recordPrice(item);
    emitItemOp(currentList?.id, { kind: 'add', item });
  }

  function updateItem(id: string, patch: ItemPatch) {
    const found = items.find((item) => item.id === id);
    if (!found) return;
    const { categoryId, ...rest } = patch;
    const next: Item = { ...found, ...rest };
    if ('categoryId' in patch) {
      if (categoryId) next.categoryId = categoryId;
      else delete next.categoryId;
    }
    setItems((current) => current.map((item) => (item.id === id ? next : item)));
    void rememberPrice(next.barcode, next.title, next.price, next.store);
    void recordPrice(next);
    emitItemOp(currentList?.id, { kind: 'edit', item: next });
  }

  function moveItem(id: string, categoryId: string | null) {
    const found = items.find((item) => item.id === id);
    if (!found) return;
    const next = { ...found };
    if (categoryId) next.categoryId = categoryId;
    else delete next.categoryId;
    setItems((current) => current.map((item) => (item.id === id ? next : item)));
    emitItemOp(currentList?.id, { kind: 'edit', item: next });
  }

  function toggleItem(id: string) {
    const found = items.find((item) => item.id === id);
    if (!found) return;
    const next = { ...found, isCompleted: !found.isCompleted };
    setItems((current) => current.map((item) => (item.id === id ? next : item)));
    emitItemOp(currentList?.id, { kind: 'edit', item: next });
  }

  function deleteItem(id: string) {
    const found = items.find((item) => item.id === id);
    setItems((current) => current.filter((item) => item.id !== id));
    if (found) emitItemOp(currentList?.id, { kind: 'remove', itemId: id, title: found.title });
  }

  function clearItems() {
    setItems([]);
    emitItemOp(currentList?.id, { kind: 'clear' });
  }

  function addCategory(category: Category) {
    const clean = sanitizeCategory(category);
    if (!clean || categories.length >= MAX_CATEGORIES) return false;
    setCategories((current) => [...current, clean]);
    emitItemOp(currentList?.id, { kind: 'category', category: clean });
    return true;
  }

  function updateCategory(category: Category) {
    const clean = sanitizeCategory(category);
    if (!clean) return;
    setCategories((current) => current.map((entry) => (entry.id === clean.id ? clean : entry)));
    emitItemOp(currentList?.id, { kind: 'category', category: clean });
  }

  function deleteCategory(id: string) {
    const found = categories.find((category) => category.id === id);
    setCategories((current) => current.filter((category) => category.id !== id));
    setItems((current) => current.map((item) => (
      item.categoryId === id ? { ...item, categoryId: undefined } : item
    )));
    if (found) emitItemOp(currentList?.id, { kind: 'drop-category', categoryId: id, name: found.name });
  }

  const reloadItems = useCallback(async () => {
    if (!currentList) return;
    const raw = await AsyncStorage.getItem(ITEMS_KEY);
    const all = raw ? JSON.parse(raw) as StoredList[] : [];
    const found = all.find((entry) => entry.id === currentList.id);
    const next = readStored(found);
    skipNextWrite.current = true;
    setItems(next.items);
    setCategories(next.categories);
  }, [currentList]);

  const replaceItems = useCallback((next: Item[], nextCategories?: Category[]) => {
    if (!currentList) return;
    loadToken.current += 1;
    skipNextWrite.current = false;
    setLoadedId(currentList.id);
    const categoriesToKeep = nextCategories
      ? nextCategories.map((category) => sanitizeCategory(category)).filter((category): category is Category => category !== null)
      : null;
    const ids = new Set((categoriesToKeep ?? categories).map((category) => category.id));
    setItems(next
      .map((item) => sanitizeItem(item))
      .filter((item): item is Item => item !== null)
      .map((item) => (item.categoryId && !ids.has(item.categoryId) ? { ...item, categoryId: undefined } : item)));
    if (categoriesToKeep) setCategories(categoriesToKeep);
  }, [categories, currentList]);

  const totalPrice = items
    .filter((item) => item.isCompleted)
    .reduce((sum, item) => sum + item.price * item.unities, 0);

  const estimatedPrice = items.reduce((sum, item) => sum + item.price * item.unities, 0);

  return (
    <ItemContext.Provider
      value={{
        items,
        categories,
        totalPrice,
        estimatedPrice,
        addItem,
        updateItem,
        moveItem,
        toggleItem,
        deleteItem,
        clearItems,
        addCategory,
        updateCategory,
        deleteCategory,
        reloadItems,
        replaceItems,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
}

export function useItems() {
  const value = useContext(ItemContext);
  if (!value) throw new Error('useItems precisa ficar dentro de ItemProvider');
  return value;
}
