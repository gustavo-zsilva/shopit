import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Item, ListStats, ShoppingList } from '../types';
import { enqueueStorage } from '../utils/storageQueue';
import { emitListDeleted } from '../realtime/bridge';
import { clearReminder } from '../utils/reminders';
import { deleteRecurring, readRecurring } from '../utils/recurring';
import * as Notifications from 'expo-notifications';

const LISTS_KEY = 'cards';
const ITEMS_KEY = 'items';

type ListsContextValue = {
  lists: ShoppingList[];
  stats: Record<string, ListStats>;
  ready: boolean;
  currentList: ShoppingList | null;
  addList: (list: ShoppingList) => void;
  renameList: (id: string, title: string) => void;
  deleteList: (id: string) => Promise<void>;
  forgetList: (id: string) => Promise<void>;
  patchList: (id: string, patch: Partial<ShoppingList>) => void;
  clearLists: () => Promise<void>;
  setOpenList: (list: ShoppingList) => void;
  refreshStats: () => Promise<void>;
};

const ListsContext = createContext<ListsContextValue | null>(null);

function emptyStats(): ListStats {
  return { count: 0, done: 0, total: 0 };
}

export function statsFor(stats: Record<string, ListStats>, id: string) {
  return stats[id] ?? emptyStats();
}

export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [stats, setStats] = useState<Record<string, ListStats>>({});
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [ready, setReady] = useState(false);

  const refreshStats = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(ITEMS_KEY);
      const all = raw ? JSON.parse(raw) as { id: string; items?: Item[] }[] : [];
      const next: Record<string, ListStats> = {};

      for (const entry of all) {
        if (!entry?.id) continue;
        const items = Array.isArray(entry.items) ? entry.items : [];
        next[entry.id] = {
          count: items.length,
          done: items.filter((item) => item.isCompleted).length,
          total: items
            .filter((item) => item.isCompleted)
            .reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.unities) || 1), 0),
        };
      }

      setStats(next);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LISTS_KEY);
        if (cancelled) return;
        const parsed = raw ? JSON.parse(raw) as ShoppingList[] : [];
        setLists(parsed.filter((list) => list?.id && list?.title));
        await refreshStats();
        if (!cancelled) setReady(true);
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshStats]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(LISTS_KEY, JSON.stringify(lists)).catch((error) => console.error(error));
  }, [lists, ready]);

  function addList(list: ShoppingList) {
    setLists((current) => [...current, list]);
  }

  function renameList(id: string, title: string) {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    setLists((current) => current.map((list) => (
      list.id === id ? { ...list, title: nextTitle } : list
    )));
    setCurrentList((current) => (
      current?.id === id ? { ...current, title: nextTitle } : current
    ));
  }

  function patchList(id: string, patch: Partial<ShoppingList>) {
    setLists((current) => current.map((list) => (
      list.id === id ? { ...list, ...patch, id: list.id } : list
    )));
    setCurrentList((current) => (
      current?.id === id ? { ...current, ...patch, id: current.id } : current
    ));
  }

  async function forgetList(id: string) {
    setLists((current) => current.filter((list) => list.id !== id));
    setCurrentList((current) => (current?.id === id ? null : current));
    await clearReminder(id);
    const rules = await readRecurring();
    for (const rule of rules) {
      if (rule.listId === id) await deleteRecurring(rule.id);
    }

    await enqueueStorage(async () => {
      const raw = await AsyncStorage.getItem(ITEMS_KEY);
      const all = raw ? JSON.parse(raw) as { id: string }[] : [];
      await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(all.filter((entry) => entry.id !== id)));
      await refreshStats();
    });
  }

  async function deleteList(id: string) {
    const shared = lists.find((list) => list.id === id)?.shared;
    await forgetList(id);
    if (shared) emitListDeleted(id);
  }

  async function clearLists() {
    setLists([]);
    setStats({});
    setCurrentList(null);
    await enqueueStorage(async () => {
      await AsyncStorage.multiRemove([LISTS_KEY, ITEMS_KEY, 'recurring', 'reminders']);
    });
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
  }

  const value: ListsContextValue = {
    lists,
    stats,
    ready,
    currentList,
    addList,
    renameList,
    deleteList,
    forgetList,
    patchList,
    clearLists,
    setOpenList: setCurrentList,
    refreshStats,
  };

  return (
    <ListsContext.Provider value={value}>
      {children}
    </ListsContext.Provider>
  );
}

export function useLists() {
  const value = useContext(ListsContext);
  if (!value) throw new Error('useLists precisa ficar dentro de ListsProvider');
  return value;
}
