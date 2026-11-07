import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useLists } from './ListContext';
import { rememberPrice } from '../utils/products';
import { recordPrice } from '../utils/priceHistory';
import { emitItemOp } from '../realtime/bridge';
import { enqueueStorage } from '../utils/storageQueue';
import { Item } from '../types';

const ITEMS_KEY = 'items';

type StoredList = {
  id: string;
  items: Item[];
};

type ItemContextValue = {
  items: Item[];
  totalPrice: number;
  estimatedPrice: number;
  addItem: (item: Item) => void;
  updateItem: (id: string, patch: Partial<Omit<Item, 'id'>>) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  clearItems: () => void;
  reloadItems: () => Promise<void>;
  replaceItems: (items: Item[]) => void;
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
  };
}

export function ItemProvider({ children }: { children: ReactNode }) {
  const { currentList, refreshStats } = useLists();
  const [items, setItems] = useState<Item[]>([]);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const skipNextWrite = useRef(true);
  const loadToken = useRef(0);

  useEffect(() => {
    if (!currentList) {
      setItems([]);
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
        const next = (found?.items ?? [])
          .map((item) => sanitizeItem(item))
          .filter((item): item is Item => item !== null);
        setItems(next);
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

    enqueueStorage(async () => {
      const raw = await AsyncStorage.getItem(ITEMS_KEY);
      const all = raw ? JSON.parse(raw) as StoredList[] : [];
      const index = all.findIndex((entry) => entry.id === listId);
      const nextEntry = { id: listId, items: snapshot };

      if (index === -1) all.push(nextEntry);
      else all[index] = nextEntry;

      await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(all));
      await refreshStats();
    }).catch((error) => console.error(error));
  }, [items, loadedId, refreshStats]);

  function addItem(item: Item) {
    setItems((current) => [...current, item]);
    void rememberPrice(item.barcode, item.title, item.price, item.store);
    void recordPrice(item);
    emitItemOp(currentList?.id, { kind: 'add', item });
  }

  function updateItem(id: string, patch: Partial<Omit<Item, 'id'>>) {
    const found = items.find((item) => item.id === id);
    if (!found) return;
    const next = { ...found, ...patch };
    setItems((current) => current.map((item) => (item.id === id ? next : item)));
    void rememberPrice(next.barcode, next.title, next.price, next.store);
    void recordPrice(next);
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

  const reloadItems = useCallback(async () => {
    if (!currentList) return;
    const raw = await AsyncStorage.getItem(ITEMS_KEY);
    const all = raw ? JSON.parse(raw) as StoredList[] : [];
    const found = all.find((entry) => entry.id === currentList.id);
    const next = (found?.items ?? [])
      .map((item) => sanitizeItem(item))
      .filter((item): item is Item => item !== null);
    skipNextWrite.current = true;
    setItems(next);
  }, [currentList]);

  const replaceItems = useCallback((next: Item[]) => {
    if (!currentList) return;
    loadToken.current += 1;
    skipNextWrite.current = false;
    setLoadedId(currentList.id);
    setItems(next.map((item) => sanitizeItem(item)).filter((item): item is Item => item !== null));
  }, [currentList]);

  const totalPrice = items
    .filter((item) => item.isCompleted)
    .reduce((sum, item) => sum + item.price * item.unities, 0);

  const estimatedPrice = items.reduce((sum, item) => sum + item.price * item.unities, 0);

  return (
    <ItemContext.Provider
      value={{
        items,
        totalPrice,
        estimatedPrice,
        addItem,
        updateItem,
        toggleItem,
        deleteItem,
        clearItems,
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
