import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

import { houseUrl } from '../config';
import { useItems } from './ItemContext';
import { useLists } from './ListContext';
import { setItemOpHandler, setListDeletedHandler } from '../realtime/bridge';
import { ActivityEntry, HouseResult, ItemOp, Member, PresencePerson, SharedList } from '../realtime/types';
import { enqueueStorage } from '../utils/storageQueue';
import { loadProfile, loadServerUrl, Profile, saveProfile, saveServerUrl } from '../utils/identity';
import { consumeQuota, Quota, QuotaKind, readQuota, remainingUses } from '../utils/quota';
import { Item } from '../types';

type HouseRoom = {
  listId: string;
  ownerId: string;
  inviteCode: string;
  members: Member[];
  activity: ActivityEntry[];
  presence: PresencePerson[];
};

type HouseContextValue = {
  status: 'off' | 'connecting' | 'online';
  me: Profile | null;
  premium: boolean;
  serverUrl: string;
  house: HouseRoom | null;
  quota: Quota | null;
  setName: (name: string) => Promise<void>;
  setServerUrl: (url: string) => Promise<void>;
  redeem: (code: string) => Promise<string | null>;
  shareCurrentList: () => Promise<string | null>;
  joinList: (code: string) => Promise<string | null>;
  setAdding: (adding: boolean) => void;
  remaining: (kind: QuotaKind) => number | null;
  consume: (kind: QuotaKind) => Promise<boolean>;
};

const HouseContext = createContext<HouseContextValue | null>(null);

async function writeItems(listId: string, items: Item[]) {
  await enqueueStorage(async () => {
    const raw = await AsyncStorage.getItem('items');
    const all = raw ? JSON.parse(raw) as { id: string; items: Item[] }[] : [];
    const index = all.findIndex((entry) => entry.id === listId);
    const next = { id: listId, items };
    if (index === -1) all.push(next);
    else all[index] = next;
    await AsyncStorage.setItem('items', JSON.stringify(all));
  });
}

export function HouseProvider({ children }: { children: ReactNode }) {
  const { lists, currentList, addList, patchList, forgetList, refreshStats, setOpenList } = useLists();
  const { items, replaceItems } = useItems();
  const [status, setStatus] = useState<'off' | 'connecting' | 'online'>('off');
  const [me, setMe] = useState<Profile | null>(null);
  const [premium, setPremium] = useState(false);
  const [serverUrl, setServerUrlState] = useState('');
  const [rooms, setRooms] = useState<Record<string, HouseRoom>>({});
  const [quota, setQuota] = useState<Quota | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const pending = useRef(new Map<string, (result: HouseResult) => void>());
  const queue = useRef<{ listId: string; op: ItemOp }[]>([]);
  const addingRef = useRef(false);
  const listsRef = useRef(lists);
  const itemsRef = useRef(items);
  const currentRef = useRef(currentList);
  const meRef = useRef(me);
  const applyRef = useRef<(list: SharedList, people: PresencePerson[]) => Promise<void>>(async () => undefined);
  const forgetRef = useRef(forgetList);
  listsRef.current = lists;
  itemsRef.current = items;
  currentRef.current = currentList;
  meRef.current = me;
  forgetRef.current = forgetList;

  const applyList = useCallback(async (list: SharedList, people: PresencePerson[]) => {
    setRooms((current) => ({
      ...current,
      [list.id]: {
        listId: list.id,
        ownerId: list.ownerId,
        inviteCode: list.inviteCode,
        members: list.members,
        activity: list.activity,
        presence: people,
      },
    }));

    const local = listsRef.current.find((entry) => entry.id === list.id);
    const patch = {
      title: list.title,
      shared: true,
      inviteCode: list.inviteCode,
      ownerId: list.ownerId,
    };
    if (!local) {
      addList({ id: list.id, createdAt: list.createdAt, ...patch });
    } else {
      patchList(list.id, patch);
    }

    if (currentRef.current?.id === list.id) replaceItems(list.items);
    else {
      await writeItems(list.id, list.items);
      await refreshStats();
    }
  }, [addList, patchList, refreshStats, replaceItems]);
  applyRef.current = applyList;

  const send = useCallback((message: { type: string; [key: string]: unknown }) => {
    const socket = socketRef.current;
    if (!socket?.connected) return false;
    socket.emit(message.type, message);
    return true;
  }, []);

  const request = useCallback((message: { type: string; [key: string]: unknown }) => {
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return new Promise<HouseResult>((resolve) => {
      pending.current.set(requestId, resolve);
      const sent = send({ ...message, requestId });
      if (!sent) {
        pending.current.delete(requestId);
        resolve({ ok: false, error: 'A casa está desconectada. Confira se o servidor está ligado.' });
        return;
      }
      setTimeout(() => {
        if (!pending.current.has(requestId)) return;
        pending.current.delete(requestId);
        resolve({ ok: false, error: 'A casa não respondeu.' });
      }, 8000);
    });
  }, [send]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [profile, url, usage] = await Promise.all([loadProfile(), loadServerUrl(), readQuota()]);
      if (cancelled) return;
      setMe(profile);
      setServerUrlState(url);
      setQuota(usage);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!me || !serverUrl) return undefined;

    const handle = (message: {
      type?: string;
      requestId?: string;
      ok?: boolean;
      error?: string;
      premium?: boolean;
      user?: { premium?: boolean };
      list?: SharedList;
      people?: PresencePerson[];
      listId?: string;
    }) => {
      if (message.type === 'welcome') {
        setPremium(Boolean(message.user?.premium));
        setStatus('online');
        const waiting = queue.current.splice(0);
        for (const entry of waiting) send({ type: 'op', listId: entry.listId, op: entry.op });
        const open = currentRef.current;
        if (open?.shared) send({ type: 'watch', listId: open.id, mode: addingRef.current ? 'adding' : 'online' });
        return;
      }

      if (message.type === 'result' && message.requestId) {
        pending.current.get(message.requestId)?.({
          ok: Boolean(message.ok),
          error: message.error,
          premium: message.premium,
          list: message.list,
          people: message.people,
        });
        pending.current.delete(message.requestId);
        if (message.premium) setPremium(true);
        return;
      }

      if (message.type === 'list' && message.list) {
        void applyRef.current(message.list, message.people ?? []);
        return;
      }

      if (message.type === 'presence' && message.listId) {
        const listId = message.listId;
        setRooms((current) => {
          const room = current[listId];
          if (!room) return current;
          return { ...current, [listId]: { ...room, presence: message.people ?? [] } };
        });
        return;
      }

      if (message.type === 'deleted' && message.listId) {
        const listId = message.listId;
        setRooms((current) => {
          const next = { ...current };
          delete next[listId];
          return next;
        });
        void forgetRef.current(listId);
      }
    };

    const profile = meRef.current;
    if (!profile) return undefined;
    setStatus('connecting');
    const socket = io(houseUrl(serverUrl), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      timeout: 8000,
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      const current = meRef.current;
      if (!current) return;
      socket.emit('hello', { type: 'hello', userId: current.id, name: current.name });
    });
    socket.on('welcome', handle);
    socket.on('result', handle);
    socket.on('list', handle);
    socket.on('presence', handle);
    socket.on('deleted', handle);
    socket.on('disconnect', () => {
      if (socketRef.current === socket) setStatus('off');
    });
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [me?.id, serverUrl, send]);

  useEffect(() => {
    setItemOpHandler((listId, op) => {
      const list = listsRef.current.find((entry) => entry.id === listId);
      if (!list?.shared) return;
      const sent = send({ type: 'op', listId, op });
      if (!sent) queue.current.push({ listId, op });
    });
    setListDeletedHandler((listId) => {
      void request({ type: 'delete', listId });
    });
    return () => {
      setItemOpHandler(null);
      setListDeletedHandler(null);
    };
  }, [request, send]);

  useEffect(() => {
    if (status !== 'online' || !currentList?.shared) return undefined;
    send({ type: 'watch', listId: currentList.id, mode: addingRef.current ? 'adding' : 'online' });
    const listId = currentList.id;
    return () => {
      send({ type: 'unwatch', listId });
    };
  }, [currentList?.id, currentList?.shared, status, send]);

  useEffect(() => {
    const timer = setInterval(() => {
      const open = currentRef.current;
      if (!open?.shared || status !== 'online') return;
      send({ type: 'presence', listId: open.id, mode: addingRef.current ? 'adding' : 'online' });
    }, 8000);
    return () => clearInterval(timer);
  }, [send, status]);

  const setName = useCallback(async (name: string) => {
    if (!me) return;
    const next = { ...me, name: name.trim().slice(0, 32) || 'Eu' };
    setMe(next);
    await saveProfile(next);
    await request({ type: 'rename', name: next.name });
  }, [me, request]);

  const changeServer = useCallback(async (url: string) => {
    const next = url.trim();
    setServerUrlState(next);
    await saveServerUrl(next);
  }, []);

  const redeem = useCallback(async (code: string) => {
    const result = await request({ type: 'redeem', code });
    if (!result.ok) return result.error ?? 'Não consegui usar o código.';
    setPremium(true);
    return null;
  }, [request]);

  const shareCurrentList = useCallback(async () => {
    const list = currentRef.current;
    if (!list) return 'Abra uma lista primeiro.';
    const result = await request({
      type: 'share',
      list: {
        id: list.id,
        title: list.title,
        createdAt: list.createdAt,
        items: itemsRef.current,
      },
    });
    if (!result.ok || !result.list) return result.error ?? 'Não consegui abrir a lista.';
    await applyList(result.list, result.people ?? []);
    return null;
  }, [applyList, request]);

  const joinList = useCallback(async (code: string) => {
    const result = await request({ type: 'join', code });
    if (!result.ok || !result.list) return result.error ?? 'Não consegui entrar.';
    await applyList(result.list, result.people ?? []);
    setOpenList({
      id: result.list.id,
      title: result.list.title,
      createdAt: result.list.createdAt,
      shared: true,
      inviteCode: result.list.inviteCode,
      ownerId: result.list.ownerId,
    });
    return null;
  }, [applyList, request, setOpenList]);

  const setAdding = useCallback((adding: boolean) => {
    addingRef.current = adding;
    const open = currentRef.current;
    if (!open?.shared) return;
    send({ type: 'presence', listId: open.id, mode: adding ? 'adding' : 'online' });
  }, [send]);

  const consume = useCallback(async (kind: QuotaKind) => {
    const allowed = await consumeQuota(kind, premium);
    setQuota(await readQuota());
    return allowed;
  }, [premium]);

  const house = currentList ? rooms[currentList.id] ?? null : null;

  const value: HouseContextValue = {
    status,
    me,
    premium,
    serverUrl,
    house,
    quota,
    setName,
    setServerUrl: changeServer,
    redeem,
    shareCurrentList,
    joinList,
    setAdding,
    remaining: (kind) => quota ? remainingUses(quota, kind, premium) : premium ? null : 3,
    consume,
  };

  return (
    <HouseContext.Provider value={value}>
      {children}
    </HouseContext.Provider>
  );
}

export function useHouse() {
  const value = useContext(HouseContext);
  if (!value) throw new Error('useHouse precisa ficar dentro de HouseProvider');
  return value;
}
